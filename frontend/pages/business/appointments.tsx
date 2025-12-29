import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all')
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
        <div className={styles.pageContainer}>
          <div className={styles.contentWrapper}>
            <LoadingSpinner text="Loading appointments" />
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.pageContainer}>
          <div className={styles.contentWrapper}>
            <div className={styles.error}>{error}</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          {/* Page Header */}
          <header className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h1 className={styles.pageTitle}>Appointments</h1>
                <p className={styles.pageSubtitle}>Manage and track all your business appointments</p>
              </div>
              <div className={styles.statsCards}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{appointments.length}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{appointments.filter(a => a.status === 'confirmed').length}</span>
                  <span className={styles.statLabel}>Confirmed</span>
                </div>
              </div>
            </div>
          </header>

          {/* Filters */}
          <div className={styles.filtersCard}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Status
              </label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={styles.filterSelect}
              >
                <option value="all">All Appointments</option>
                <option value="confirmed">Confirmed Only</option>
                <option value="completed">Completed Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Sort
              </label>
              <button 
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className={styles.sortButton}
              >
                {sortOrder === 'desc' ? '↓ Newest First' : '↑ Oldest First'}
              </button>
            </div>
          </div>

          {/* Appointments List */}
          <div className={styles.appointmentsList}>
            {filteredAppointments.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="80" height="80" fill="none" stroke="#c5a8c3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3>No appointments found</h3>
                <p>Appointments will appear here once customers book your services</p>
              </div>
            ) : (
              filteredAppointments.map(appointment => (
                <div key={appointment.id} className={styles.appointmentCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                      <div className={styles.dateBox}>
                        <span className={styles.dateDay}>{new Date(appointment.appointmentDate).getDate()}</span>
                        <span className={styles.dateMonth}>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                      </div>
                      <div className={styles.timeInfo}>
                        <div className={styles.dateText}>{formatDate(appointment.appointmentDate)}</div>
                        <div className={styles.timeText}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </div>
                      </div>
                    </div>
                    <div className={`${styles.statusBadge} ${styles[appointment.status]}`}>
                      {appointment.status === 'confirmed' && (
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {appointment.status === 'completed' && (
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {appointment.status === 'cancelled' && (
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailIcon}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Customer</span>
                        <span className={styles.detailValue}>{getCustomerName(appointment.customer)}</span>
                        {appointment.customer.phone && (
                          <span className={styles.detailSubtext}>{appointment.customer.phone}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <div className={styles.detailIcon}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Staff Member</span>
                        <span className={styles.detailValue}>{getStaffName(appointment.staff)}</span>
                        {appointment.staff.position && (
                          <span className={styles.detailSubtext}>{appointment.staff.position}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <div className={styles.detailIcon}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Services</span>
                        <div className={styles.servicesList}>
                          {appointment.services.map((s, idx) => (
                            <span key={idx} className={styles.serviceTag}>{s.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={styles.priceDuration}>
                      <div className={styles.priceBox}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={styles.priceAmount}>${appointment.totalPrice}</span>
                      </div>
                      <div className={styles.durationBox}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{appointment.totalDuration} min</span>
                      </div>
                    </div>
                  </div>

                  {appointment.status !== 'cancelled' && (
                    <div className={styles.cardFooter}>
                      <button
                        onClick={() => handleCancelClick(appointment.id)}
                        className={styles.cancelButton}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Cancel Confirmation Modal */}
          {showCancelModal && (
            <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
              <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.deleteModalIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className={styles.deleteModalTitle}>Cancel Appointment</h3>
                <p className={styles.deleteModalText}>
                  Are you sure you want to cancel this appointment? This action cannot be undone and the customer will be notified.
                </p>
                <div className={styles.deleteModalActions}>
                  <button 
                    className={styles.deleteCancelBtn}
                    onClick={() => setShowCancelModal(false)}
                  >
                    Keep Appointment
                  </button>
                  <button 
                    className={styles.deleteConfirmBtn}
                    onClick={handleCancelConfirm}
                  >
                    Yes, Cancel It
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
