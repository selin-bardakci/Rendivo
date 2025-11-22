import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Layout from '../../components/Layout'
import styles from '../../styles/businessDashboard.module.css'

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

export default function BusinessServices() {
  const router = useRouter()
  
  // Available services from discover page
  const availableServices = [
    'Haircut & Styling',
    'Massage Therapy',
    'Nail Treatment',
    'Facial Treatment',
    'Waxing',
    'Makeup',
    'Spa Treatment',
    'Body Treatment',
    'Skin Care',
    'Hair Coloring',
    'Manicure',
    'Pedicure'
  ]
  
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Women\'s Haircut', duration: 45, price: 50 },
    { id: '2', name: 'Men\'s Haircut', duration: 30, price: 35 },
    { id: '3', name: 'Hair Coloring', duration: 120, price: 150 },
    { id: '4', name: 'Highlights', duration: 90, price: 120 },
    { id: '5', name: 'Blowout', duration: 45, price: 40 },
  ])
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [newService, setNewService] = useState({
    name: '',
    duration: '',
    price: ''
  })

  const handleAddService = () => {
    if (newService.name && newService.duration && newService.price) {
      if (editingService) {
        // Update existing service
        setServices(services.map(s => 
          s.id === editingService.id 
            ? { ...editingService, name: newService.name, duration: parseInt(newService.duration), price: parseFloat(newService.price) }
            : s
        ))
        setEditingService(null)
      } else {
        // Add new service
        const service: Service = {
          id: Date.now().toString(),
          name: newService.name,
          duration: parseInt(newService.duration),
          price: parseFloat(newService.price)
        }
        setServices([...services, service])
      }
      setNewService({ name: '', duration: '', price: '' })
      setShowModal(false)
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setNewService({
      name: service.name,
      duration: service.duration.toString(),
      price: service.price.toString()
    })
    setShowModal(true)
  }

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id))
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
                  setNewService({ name: '', duration: '', price: '' })
                  setShowModal(true)
                }}
              >
                <span className={styles.addIcon}>+</span>
                <span>Add New Service</span>
              </button>
            </div>
          </header>

          {/* Services List */}
          <div className={styles.servicesList}>
            {services.map((service) => (
              <div key={service.id} className={styles.serviceItem}>
                <div className={styles.serviceLeft}>
                  <div className={styles.dragHandle}>
                    <span>::</span>
                  </div>
                  <div className={styles.serviceInfo}>
                    <p className={styles.serviceName}>{service.name}</p>
                    <p className={styles.serviceDetails}>
                      {service.duration} min • ${service.price.toFixed(2)}
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
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => {
          setShowModal(false)
          setEditingService(null)
          setNewService({ name: '', duration: '', price: '' })
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
                  setNewService({ name: '', duration: '', price: '' })
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="serviceName">Service Name</label>
                <select
                  id="serviceName"
                  className={styles.selectInput}
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                >
                  <option value="">Select a service...</option>
                  {availableServices.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
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
                  setNewService({ name: '', duration: '', price: '' })
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.saveBtn}
                onClick={handleAddService}
              >
                {editingService ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
