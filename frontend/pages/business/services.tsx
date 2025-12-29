import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Layout from '../../components/Layout'
import styles from '../../styles/businessDashboard.module.css'
import { serviceApi } from '../../lib/api'
import { getCurrentUser } from '../../lib/auth'

interface Service {
  id: number
  name: string
  description?: string
  duration: number
  price: number
  isActive: boolean
}

export default function BusinessServices() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState('')
  const [customServiceName, setCustomServiceName] = useState('')
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: '',
    price: ''
  })
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [availableServices, setAvailableServices] = useState<string[]>(['Other'])

  // Fetch user and services on mount
  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      router.push('/login')
      return
    }
    
    if (u.role !== 'business_owner') {
      router.push('/')
      return
    }
    
    setUser(u)
    checkApprovalStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkApprovalStatus = async () => {
    try {
      // Import api at the top if not already
      const apiModule = await import('../../lib/api')
      const businessCheck = await apiModule.default.get('/business/dashboard')
      
      if (businessCheck.data?.business?.approvalStatus === 'pending') {
        router.push('/business/pending-approval')
        return
      }
      
      if (businessCheck.data?.business?.approvalStatus === 'rejected') {
        setError('Your business application has been rejected. Please contact support.')
        setLoading(false)
        return
      }
      
      // Store business info for category-based services
      setBusiness(businessCheck.data?.business)
      
      // Fetch available service types
      fetchAvailableServiceTypes()
      
      fetchServices()
    } catch (err: any) {
      console.error('Error checking approval:', err)
      fetchServices() // Try anyway if check fails
    }
  }

  const fetchAvailableServiceTypes = async () => {
    try {
      const apiModule = await import('../../lib/api')
      const response = await apiModule.default.get('/services/available-types')
      setAvailableServices(response.data)
    } catch (err: any) {
      console.error('Error fetching available service types:', err)
      // Fallback to predefined services only
      setAvailableServices(['Other'])
    }
  }

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await serviceApi.getOwnerServices()
      setServices(response.data)
    } catch (err: any) {
      console.error('Error fetching services:', err)
      setError(err.response?.data?.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async () => {
    const serviceName = selectedServiceType === 'Other' ? customServiceName : selectedServiceType
    
    if (!serviceName || !newService.duration || !newService.price) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      
      if (editingService) {
        // Update existing service
        await serviceApi.update(editingService.id, {
          name: serviceName,
          description: newService.description,
          price: parseFloat(newService.price),
          duration: parseInt(newService.duration),
        })
      } else {
        // Add new service
        await serviceApi.create({
          name: serviceName,
          description: newService.description,
          price: parseFloat(newService.price),
          duration: parseInt(newService.duration),
        })
      }
      
      // Refresh services
      await fetchServices()
      
      setNewService({ name: '', description: '', duration: '', price: '' })
      setSelectedServiceType('')
      setCustomServiceName('')
      setShowModal(false)
      setEditingService(null)
    } catch (err: any) {
      console.error('Error saving service:', err)
      alert(err.response?.data?.message || 'Failed to save service')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    
    // Check if service name is in available services list
    if (availableServices.includes(service.name)) {
      setSelectedServiceType(service.name)
      setCustomServiceName('')
    } else {
      setSelectedServiceType('Other')
      setCustomServiceName(service.name)
    }
    
    setNewService({
      name: service.name,
      description: service.description || '',
      duration: service.duration.toString(),
      price: service.price.toString()
    })
    setShowModal(true)
  }

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      await serviceApi.delete(id)
      await fetchServices()
    } catch (err: any) {
      console.error('Error deleting service:', err)
      alert(err.response?.data?.message || 'Failed to delete service')
    }
  }

  return (
    <Layout>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          {/* Page Header */}
          <header className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h1 className={styles.pageTitle}>Manage Services</h1>
                <p className={styles.pageSubtitle}>Add, edit, and organize the services you offer to clients.</p>
              </div>
              <button 
                className={styles.addButton}
                onClick={() => {
                  setEditingService(null)
                  setNewService({ name: '', description: '', duration: '', price: '' })
                  setShowModal(true)
                }}
              >
                <span className={styles.addIcon}>+</span>
                <span>Add New Service</span>
              </button>
            </div>
          </header>

          {/* Loading State */}
          {loading && (
            <div className={styles.loading}>
              <p>Loading services...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          {/* Services List */}
          {!loading && !error && (
            <div className={styles.servicesList}>
              {services.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No services yet. Add your first service to get started!</p>
                </div>
              ) : (
                services.map((service) => (
                  <div key={service.id} className={styles.serviceItem}>
                    <div className={styles.serviceLeft}>
                      <div className={styles.dragHandle}>
                        <span>::</span>
                      </div>
                      <div className={styles.serviceInfo}>
                        <p className={styles.serviceName}>{service.name}</p>
                        {service.description && (
                          <p className={styles.serviceDescription}>{service.description}</p>
                        )}
                        <p className={styles.serviceDetails}>
                          {service.duration} min • ${Number(service.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className={styles.serviceActions}>
                      <button 
                        className={styles.editBtn}
                        onClick={() => handleEditService(service)}
                      >
                        <Image src="/ikonlar/edit.svg" alt="Edit" width={20} height={20} />
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Image src="/ikonlar/delete.svg" alt="Delete" width={20} height={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => {
          setShowModal(false)
          setEditingService(null)
          setNewService({ name: '', description: '', duration: '', price: '' })
        }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button 
                className={styles.closeBtn}
                onClick={() => {
                  setShowModal(false)
                  setEditingService(null)
                  setNewService({ name: '', description: '', duration: '', price: '' })
                  setSelectedServiceType('')
                  setCustomServiceName('')
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="serviceName">Service Type</label>
                <div className={styles.customSelect}>
                  <button
                    type="button"
                    className={styles.selectButton}
                    onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                  >
                    <span>{selectedServiceType || 'Select a service type...'}</span>
                    <svg width="12" height="8" fill="none" viewBox="0 0 12 8">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="#886385" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {showServiceDropdown && (
                    <div className={styles.dropdownMenu}>
                      {availableServices.map((service) => (
                        <div
                          key={service}
                          className={`${styles.dropdownItem} ${selectedServiceType === service ? styles.dropdownItemActive : ''}`}
                          onClick={() => {
                            setSelectedServiceType(service)
                            setShowServiceDropdown(false)
                            if (service !== 'Other') {
                              setCustomServiceName('')
                            }
                          }}
                        >
                          {service}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedServiceType === 'Other' && (
                <div className={styles.formGroup}>
                  <label htmlFor="customServiceName">Custom Service Name</label>
                  <input
                    id="customServiceName"
                    type="text"
                    placeholder="Enter your custom service name..."
                    value={customServiceName}
                    onChange={(e) => setCustomServiceName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  placeholder="Brief description of the service..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    id="duration"
                    type="number"
                    placeholder="45"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="price">Price ($)</label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => {
                  setShowModal(false)
                  setEditingService(null)
                  setNewService({ name: '', description: '', duration: '', price: '' })
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.saveBtn}
                onClick={handleAddService}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingService ? 'Update Service' : 'Add Service')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
