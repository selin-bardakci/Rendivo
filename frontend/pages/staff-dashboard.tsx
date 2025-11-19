import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { getCurrentUser, logout } from '../lib/auth'
import styles from '../styles/staffDashboard.module.css'

export default function StaffDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Mock staff data - replace with real data from backend
  const staffMember = {
    name: 'Sarah Johnson',
    role: 'Hair Stylist',
    email: 'sarah.johnson@beautystudio.com',
    initials: 'SJ'
  }

  // Mock appointments data - replace with real API call
  const appointments = [
    {
      id: 1,
      clientName: 'Emily Roberts',
      service: 'Haircut & Styling',
      date: new Date(2025, 10, 25),
      time: '9:00 AM',
      duration: 60,
      status: 'confirmed'
    },
    {
      id: 2,
      clientName: 'Michael Brown',
      service: 'Hair Coloring',
      date: new Date(2025, 10, 25),
      time: '11:00 AM',
      duration: 90,
      status: 'confirmed'
    },
    {
      id: 3,
      clientName: 'Jessica Lee',
      service: 'Blowout',
      date: new Date(2025, 10, 25),
      time: '2:30 PM',
      duration: 30,
      status: 'confirmed'
    },
    {
      id: 4,
      clientName: 'David Wilson',
      service: 'Haircut',
      date: new Date(2025, 10, 28),
      time: '10:00 AM',
      duration: 45,
      status: 'confirmed'
    },
    {
      id: 5,
      clientName: 'Amanda Garcia',
      service: 'Hair Styling',
      date: new Date(2025, 10, 28),
      time: '3:00 PM',
      duration: 45,
      status: 'confirmed'
    }
  ]

  // Get appointments for selected date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      apt.date.getDate() === date.getDate() &&
      apt.date.getMonth() === date.getMonth() &&
      apt.date.getFullYear() === date.getFullYear()
    ).sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`)
      const timeB = new Date(`1970/01/01 ${b.time}`)
      return timeA.getTime() - timeB.getTime()
    })
  }

  // Get dates with appointments
  const appointmentDates = appointments.map(apt => apt.date)

  useEffect(() => {
    // Temporarily bypass auth for testing
    const mockUser = { email: 'staff@example.com', role: 'staff' }
    setUser(mockUser)
    
    // Uncomment for production
    // const u = getCurrentUser()
    // if (!u || u.role !== 'staff') {
    //   router.push('/login')
    //   return
    // }
    // setUser(u)
  }, [])

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
              {getAppointmentsForDate(date).length}
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
                <span className={styles.profileInitials}>{staffMember.initials}</span>
              </div>
              <h2 className={styles.staffName}>{staffMember.name}</h2>
              <p className={styles.staffRole}>{staffMember.role}</p>

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
                  {todaysAppointments.map((appointment) => (
                    <div key={appointment.id} className={styles.appointmentItem}>
                      <div className={styles.appointmentTime}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {appointment.time}
                      </div>
                      <div className={styles.appointmentDetails}>
                        <h3 className={styles.clientName}>{appointment.clientName}</h3>
                        <p className={styles.serviceName}>{appointment.service}</p>
                        <span className={styles.duration}>{appointment.duration} min</span>
                      </div>
                      <div className={`${styles.statusBadge} ${styles[appointment.status]}`}>
                        {appointment.status}
                      </div>
                    </div>
                  ))}
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
