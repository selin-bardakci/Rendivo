import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { getCurrentUser, logout } from '../lib/auth'
import styles from '../styles/staffDashboard.module.css'
import { appointmentApi } from '../lib/api'

export default function StaffDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user and appointments
  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      router.push('/login')
      return
    }
    
    if (u.role !== 'staff') {
      router.push('/')
      return
    }
    
    setUser(u)
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      // For staff, we need to get appointments where they are assigned
      // For now, using the general getAll which should filter by the logged-in user
      const response = await appointmentApi.getStaffAppointments()
      setAppointments(response.data)
    } catch (err: any) {
      console.error('Error fetching appointments:', err)
      setError(err.response?.data?.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  // Get appointments for selected date (including cancelled to show in sidebar)
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate)
      return aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
    }).sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })
  }

  // Get dates with appointments (excluding cancelled)
  const appointmentDates = appointments
    .filter(apt => apt.status !== 'cancelled')
    .map(apt => new Date(apt.appointmentDate))

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startingDayOfWeek = new Date(year, month, 1).getDay()
    return { daysInMonth, startingDayOfWeek }
  }

  const hasAppointment = (date: Date) => {
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

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDay} />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const hasApt = hasAppointment(date)
      const isTodayDate = isToday(date)
      const isSelected = selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentMonth.getMonth() &&
                        selectedDate.getFullYear() === currentMonth.getFullYear()

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`${styles.calendarDay} ${styles.calendarDayButton} ${
            hasApt ? styles.hasAppointment : ''
          } ${isTodayDate ? styles.today : ''} ${isSelected ? styles.selectedDay : ''}`}
        >
          <span className={styles.dayNumber}>{day}</span>
          {hasApt && (
            <span className={styles.appointmentCount}>
              {getAppointmentsForDate(date).filter(apt => apt.status !== 'cancelled').length}
            </span>
          )}
        </button>
      )
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

  const todaysAppointments = getAppointmentsForDate(selectedDate)

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Sidebar - Staff Profile */}
          <div className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.profilePicture}>
                <span className={styles.profileInitials}>
                  {user?.firstName?.[0] || user?.fullName?.[0] || 'S'}
                  {user?.lastName?.[0] || user?.fullName?.[1] || 'M'}
                </span>
              </div>
              <h2 className={styles.staffName}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.fullName || 'Staff Member'}
              </h2>
              <p className={styles.staffRole}>{user?.role === 'staff' ? 'Staff Member' : user?.role}</p>

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
                <h1 className={styles.pageTitle}>My Schedule</h1>
                <p className={styles.pageSubtitle}>View and manage your appointments</p>
              </div>
            </div>

            {loading && (
              <div className={styles.loading}>Loading appointments...</div>
            )}

            {error && !loading && (
              <div className={styles.error}>{error}</div>
            )}

            {!loading && !error && (
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
                  <span>Has Appointments</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.legendToday}`} />
                  <span>Today</span>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Right Sidebar - Today's Schedule */}
          <div className={styles.rightSidebar}>
            <div className={styles.scheduleCard}>
              <h2 className={styles.scheduleTitle}>
                {isToday(selectedDate) ? "Today's Schedule" : "Schedule"}
              </h2>
              <p className={styles.scheduleDate}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>

              {todaysAppointments.length > 0 ? (
                <div className={styles.appointmentsList}>
                  {todaysAppointments.map((appointment) => {
                    const serviceNames = appointment.services?.map((s: any) => s.name).join(', ') || 'Service'
                    const timeRange = `${appointment.startTime?.slice(0, 5) || '00:00'} - ${appointment.endTime?.slice(0, 5) || '00:00'}`
                    const customer = appointment.customer
                    const customerName = customer?.fullName || 
                                        (customer?.firstName && customer?.lastName ? `${customer.firstName} ${customer.lastName}` : null) ||
                                        customer?.firstName ||
                                        customer?.email ||
                                        'Customer'
                    
                    return (
                    <div key={appointment.id} className={styles.appointmentItem}>
                      <div className={styles.appointmentTime}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {timeRange}
                      </div>
                      <div className={styles.appointmentDetails}>
                        <h3 className={styles.clientName}>{customerName}</h3>
                        <p className={styles.serviceName}>{serviceNames}</p>
                        <span className={styles.duration}>{appointment.totalDuration} min</span>
                      </div>
                      <div className={`${styles.statusBadge} ${styles[appointment.status]}`}>
                        {appointment.status}
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <div className={styles.noAppointments}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>No appointments scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
