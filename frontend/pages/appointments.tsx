import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { getCurrentUser, logout } from '../lib/auth'
import styles from '../styles/appointments.module.css'
import Link from 'next/link'

export default function AppointmentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Mock data - replace with real data from your backend
  const upcomingBookings = 3
  const totalBookings = 12
  const appointmentDates = [
    new Date(2025, 10, 25), // Nov 25
    new Date(2025, 10, 28), // Nov 28
    new Date(2025, 11, 5),  // Dec 5
  ]

  // Mock appointments list
  const appointments = [
    {
      id: 1,
      service: 'Haircut & Styling',
      provider: 'Beauty Studio Downtown',
      location: '123 Main St, New York, NY',
      date: 'Nov 25, 2025',
      time: '2:00 PM - 3:00 PM',
      status: 'upcoming'
    },
    {
      id: 2,
      service: 'Massage Therapy',
      provider: 'Wellness Center',
      location: '456 Park Ave, New York, NY',
      date: 'Nov 28, 2025',
      time: '10:00 AM - 11:00 AM',
      status: 'upcoming'
    },
    {
      id: 3,
      service: 'Nail Treatment',
      provider: 'Glamour Salon',
      location: '789 Broadway, New York, NY',
      date: 'Dec 5, 2025',
      time: '4:30 PM - 5:30 PM',
      status: 'upcoming'
    }
  ]

  const handleReschedule = (appointmentId: number) => {
    router.push(`/appointment/${appointmentId}`)
  }

  const handleCancel = (appointmentId: number) => {
    router.push(`/appointment/${appointmentId}`)
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
      const appDate = new Date(app.date)
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
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <h3 className={styles.userName}>{user?.email || 'User'}</h3>
              
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

            {/* Appointments List */}
            <div className={styles.appointmentsList}>
              <h2 className={styles.appointmentsTitle}>Your Appointments</h2>
              {appointments.length > 0 ? (
                <div className={styles.appointmentsGrid}>
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className={styles.appointmentCard}>
                      <div className={styles.appointmentInfo}>
                        <h3 className={styles.serviceName}>{appointment.service}</h3>
                        <p className={styles.providerName}>{appointment.provider}</p>
                        <div className={styles.appointmentDetails}>
                          <div className={styles.detailItem}>
                            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{appointment.location}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{appointment.date}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.appointmentActions}>
                        <button 
                          className={`${styles.actionButton} ${styles.rescheduleButton}`}
                          onClick={() => handleReschedule(appointment.id)}
                        >
                          Reschedule
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.cancelButton}`}
                          onClick={() => handleCancel(appointment.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
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
    </Layout>
  )
}
