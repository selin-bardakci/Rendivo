import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import styles from '../../styles/businessAppointments.module.css'
import api from '../../lib/api'
import { getCurrentUser } from '../../lib/auth'

interface Appointment {
  id: number
  customerId: number
  businessId: number
  staffId: number
  appointmentDate: string
  startTime: string
  endTime: string
  totalPrice: string
  totalDuration: number
  status: string
  notes?: string
  customer: {
    id: number
    firstName?: string
    lastName?: string
    fullName?: string
    email: string
    phone?: string
  }
  staff: {
    id: number
    position?: string
    user: {
      id: number
      firstName?: string
      lastName?: string
      fullName?: string
    }
  }
  services: Array<{
    id: number
    name: string
    price: string
    duration: number
  }>
}

export default function BusinessAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'business_owner') {
      router.push('/')
      return
    }

    checkApprovalAndFetchData()
  }, [])

  useEffect(() => {
    filterAndSortAppointments()
  }, [appointments, statusFilter, sortOrder])

  const checkApprovalAndFetchData = async () => {
    try {
      const response = await api.get('/business/dashboard')
      
      if (response.data.business?.approvalStatus === 'pending') {
        router.push('/business/pending-approval')
        return
      }
      
      if (response.data.business?.approvalStatus === 'rejected') {
        setError('Your business application has been rejected. Please contact support.')
        return
      }
      
      fetchAppointments()
    } catch (err: any) {
      console.error('Error checking approval status:', err)
      fetchAppointments()
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/business/appointments')
      setAppointments(response.data)
    } catch (err: any) {
      console.error('Error fetching appointments:', err)
      setError(err?.response?.data?.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortAppointments = () => {
    let filtered = [...appointments]

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate} ${a.startTime}`)
      const dateB = new Date(`${b.appointmentDate} ${b.startTime}`)
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    })

    setFilteredAppointments(filtered)
  }

  const handleCancelClick = (appointmentId: number) => {
    setCancellingId(appointmentId)
    setShowCancelModal(true)
  }

  const handleCancelConfirm = async () => {
    if (!cancellingId) return

    try {
      await api.delete(`/appointments/${cancellingId}`)
      setAppointments(appointments.map(apt => 
        apt.id === cancellingId ? { ...apt, status: 'cancelled' } : apt
      ))
      setShowCancelModal(false)
      setCancellingId(null)
    } catch (err: any) {
      console.error('Error cancelling appointment:', err)
      alert(err?.response?.data?.message || 'Failed to cancel appointment')
    }
  }

  const getCustomerName = (customer: Appointment['customer']) => {
    if (customer.fullName) return customer.fullName
    if (customer.firstName && customer.lastName) return `${customer.firstName} ${customer.lastName}`
    if (customer.firstName) return customer.firstName
    return customer.email
  }

  const getStaffName = (staff: Appointment['staff']) => {
    const user = staff.user
    if (user.fullName) return user.fullName
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    if (user.firstName) return user.firstName
    return 'Staff'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>Loading appointments...</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Appointments</h1>
          <p className={styles.subtitle}>Manage all your business appointments</p>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={styles.select}
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Sort by date:</label>
            <button 
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className={styles.sortButton}
            >
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        <div className={styles.appointmentsList}>
          {filteredAppointments.length === 0 ? (
            <div className={styles.empty}>
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map(appointment => (
              <div key={appointment.id} className={styles.appointmentCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.dateInfo}>
                    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className={`${styles.statusBadge} ${styles[appointment.status]}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={styles.label}>Time:</span>
                    <span className={styles.value}>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                  </div>

                  <div className={styles.infoRow}>
                    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className={styles.label}>Customer:</span>
                    <span className={styles.value}>{getCustomerName(appointment.customer)}</span>
                  </div>

                  <div className={styles.infoRow}>
                    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className={styles.label}>Staff:</span>
                    <span className={styles.value}>{getStaffName(appointment.staff)}</span>
                  </div>

                  <div className={styles.infoRow}>
                    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className={styles.label}>Services:</span>
                    <span className={styles.value}>
                      {appointment.services.map(s => s.name).join(', ')}
                    </span>
                  </div>

                  <div className={styles.infoRow}>
                    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={styles.label}>Price:</span>
                    <span className={styles.value}>${appointment.totalPrice}</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button
                    onClick={() => handleCancelClick(appointment.id)}
                    disabled={appointment.status === 'cancelled'}
                    className={styles.cancelButton}
                  >
                    {appointment.status === 'cancelled' ? 'Cancelled' : 'Cancel Appointment'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Cancel Appointment</h2>
                <button onClick={() => setShowCancelModal(false)} className={styles.closeButton}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className={styles.modalBody}>
                <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
              </div>
              <div className={styles.modalFooter}>
                <button onClick={() => setShowCancelModal(false)} className={styles.secondaryButton}>
                  No, Keep It
                </button>
                <button onClick={handleCancelConfirm} className={styles.dangerButton}>
                  Yes, Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
