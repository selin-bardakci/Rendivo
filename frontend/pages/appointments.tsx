import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { getCurrentUser, logout } from '../lib/auth'
import styles from '../styles/appointments.module.css'
import Link from 'next/link'
import { appointmentApi } from '../lib/api'

export default function AppointmentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null)

  // Fetch appointments from API
  useEffect(() => {
    if (!user) return

    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const response = await appointmentApi.getAll()
        setAppointments(response.data)
        
        // Show success message if redirected from booking
        if (router.query.success === 'true') {
          setSuccessMessage('Appointment booked successfully!')
          setTimeout(() => setSuccessMessage(null), 5000)
        }
      } catch (err) {
        console.error('Error fetching appointments:', err)
        setError('Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user, router.query])

  const upcomingBookings = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length
  const totalBookings = appointments.length

  const appointmentDates = appointments
    .filter(a => a.status === 'pending' || a.status === 'confirmed')
    .map(a => new Date(a.appointmentDate))

  const handleReschedule = (appointmentId: number) => {
    router.push(`/appointment/${appointmentId}`)
  }

  const handleCancel = (appointmentId: number) => {
    setAppointmentToCancel(appointmentId)
    setShowCancelModal(true)
  }

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return
    
    try {
      await appointmentApi.cancel(appointmentToCancel)
      // Refresh appointments
      const response = await appointmentApi.getAll()
      setAppointments(response.data)
      setShowCancelModal(false)
      setAppointmentToCancel(null)
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      alert('Failed to cancel appointment')
    }
  }

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      // For testing: use a mock user instead of redirecting
      setUser({ email: 'demo@rendivo.com' })
      // Uncomment the line below to require authentication:
      // router.push('/login')
      return
    }
    setUser(u)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getAppointmentIdForDate = (date: Date) => {
    // Find appointment that matches this date
    const appointment = appointments.find(app => {
      const appDate = new Date(app.appointmentDate)
      return appDate.getDate() === date.getDate() &&
             appDate.getMonth() === date.getMonth() &&
             appDate.getFullYear() === date.getFullYear()
    })
    return appointment?.id
  }

  const isAppointmentDate = (date: Date) => {
    return appointmentDates.some(
      (appDate) =>
        appDate.getDate() === date.getDate() &&
        appDate.getMonth() === date.getMonth() &&
        appDate.getFullYear() === date.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDay} />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const hasAppointment = isAppointmentDate(date)
      const isTodayDate = isToday(date)
      const appointmentId = getAppointmentIdForDate(date)

      const dayElement = (
        <div
          key={day}
          className={`${styles.calendarDay} ${styles.calendarDayNumber} ${
            hasAppointment ? styles.appointmentDay : ''
          } ${isTodayDate ? styles.today : ''}`}
          onClick={() => {
            if (hasAppointment && appointmentId) {
              router.push(`/appointment/${appointmentId}`)
            }
          }}
          style={{ cursor: hasAppointment ? 'pointer' : 'default' }}
        >
          {day}
        </div>
      )

      days.push(dayElement)
    }

    return days
  }

  const changeMonth = (direction: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1)
    )
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Left Sidebar - User Profile */}
          <div className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.profilePicture}>
                <div className={styles.profileInitials}>
                  {user?.firstName?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <h3 className={styles.userName}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.fullName || user?.email || 'User'}
              </h3>
              
              <div className={styles.statsContainer}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{upcomingBookings}</div>
                  <div className={styles.statLabel}>Upcoming Bookings</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{totalBookings}</div>
                  <div className={styles.statLabel}>Total Bookings</div>
                </div>
              </div>

              <button onClick={handleLogout} className={styles.logoutButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Main Content - Calendar */}
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <div>
                <h1 className={styles.pageTitle}>My Appointments</h1>
                <p className={styles.pageSubtitle}>Manage and view your upcoming bookings</p>
              </div>
              <Link href="/discover" style={{ textDecoration: 'none' }}>
                <button className={styles.bookButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Book New Appointment
                </button>
              </Link>
            </div>

            <div className={styles.calendarCard}>
              <div className={styles.calendarHeader}>
                <button onClick={() => changeMonth(-1)} className={styles.monthButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <h2 className={styles.monthTitle}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button onClick={() => changeMonth(1)} className={styles.monthButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <div className={styles.calendarGrid}>
                <div className={styles.calendarDayHeader}>Sun</div>
                <div className={styles.calendarDayHeader}>Mon</div>
                <div className={styles.calendarDayHeader}>Tue</div>
                <div className={styles.calendarDayHeader}>Wed</div>
                <div className={styles.calendarDayHeader}>Thu</div>
                <div className={styles.calendarDayHeader}>Fri</div>
                <div className={styles.calendarDayHeader}>Sat</div>
                {renderCalendar()}
              </div>

              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.legendAppointment}`} />
                  <span>Appointment Date</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.legendToday}`} />
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className={styles.successMessage}>
                {successMessage}
              </div>
            )}

            {/* Appointments List */}
            <div className={styles.appointmentsList}>
              <h2 className={styles.appointmentsTitle}>Your Appointments</h2>
              
              {loading ? (
                <div className={styles.loading}>Loading appointments...</div>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : appointments.length > 0 ? (
                <div className={styles.appointmentsGrid}>
                  {appointments.map((appointment) => {
                    const serviceNames = appointment.services?.map((s: any) => s.name).join(', ') || 'Services'
                    const appointmentDate = new Date(appointment.appointmentDate)
                    const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })
                    const timeRange = `${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}`
                    
                    return (
                    <div key={appointment.id} className={styles.appointmentCard}>
                      <div className={styles.appointmentInfo}>
                        <h3 className={styles.serviceName}>{serviceNames}</h3>
                        <p className={styles.providerName}>{appointment.business?.businessName}</p>
                        <div className={styles.appointmentDetails}>
                          <div className={styles.detailItem}>
                            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{appointment.business?.address}, {appointment.business?.city}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formattedDate}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{timeRange}</span>
                          </div>
                        </div>
                        <div className={styles.statusBadge} data-status={appointment.status}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </div>
                      </div>
                      <div className={styles.appointmentActions}>
                        <button 
                          className={`${styles.actionButton} ${styles.rescheduleButton}`}
                          onClick={() => handleReschedule(appointment.id)}
                          disabled={appointment.status === 'cancelled'}
                        >
                          Reschedule
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.cancelButton}`}
                          onClick={() => handleCancel(appointment.id)}
                          disabled={appointment.status === 'cancelled'}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <div className={styles.noAppointments}>
                  <p>You have no upcoming appointments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Cancel Appointment?</h3>
            <p className={styles.modalText}>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalButtonSecondary}
                onClick={() => setShowCancelModal(false)}
              >
                Keep Appointment
              </button>
              <button 
                className={styles.modalButtonDanger}
                onClick={handleCancelConfirm}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
