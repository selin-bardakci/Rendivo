import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Image from 'next/image'
import styles from '../../styles/businessDashboardMain.module.css'
import api from '../../lib/api'
import { getCurrentUser } from '../../lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/business/dashboard')
      
      // Check if business is approved
      if (response.data.business?.approvalStatus === 'pending') {
        router.push('/business/pending-approval')
        return
      }
      
      if (response.data.business?.approvalStatus === 'rejected') {
        setError('Your business application has been rejected. Please contact support.')
        setLoading(false)
        return
      }
      
      setDashboardData(response.data)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err?.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className={styles.pageContainer}>
          <div className={styles.contentWrapper}>
            <p>Loading dashboard...</p>
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
            <p style={{ color: 'red' }}>{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className={styles.pageContainer}>
          <div className={styles.contentWrapper}>
            <p>No data available</p>
          </div>
        </div>
      </Layout>
    )
  }

  const { business, stats, upcomingAppointments, staff, popularServices } = dashboardData

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'busy':
        return styles.statusBusy
      case 'available':
        return styles.statusAvailable
      case 'break':
        return styles.statusBreak
      default:
        return ''
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'busy':
        return 'Busy'
      case 'available':
        return 'Available'
      case 'break':
        return 'On Break'
      default:
        return status
    }
  }

  const getProgressClass = (color: string) => {
    switch (color) {
      case 'primary':
        return styles.progressPrimary
      case 'secondary':
        return styles.progressSecondary
      case 'tertiary':
        return styles.progressTertiary
      case 'quaternary':
        return styles.progressQuaternary
      default:
        return styles.progressPrimary
    }
  }

  return (
    <Layout>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Hello, {business.name}!</h1>
              <p className={styles.pageSubtitle}>Here's what's happening with your business today.</p>
            </div>
          </header>

          {/* Stats */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Total Appointments Today</p>
              <p className={styles.statValue}>{stats.todayAppointments}</p>
              <p className={styles.statChange}>{stats.appointmentChange}% from yesterday</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>New Clients This Week</p>
              <p className={styles.statValue}>{stats.newClientsThisWeek}</p>
              <p className={styles.statChange}>{stats.clientChange}% from last week</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Projected Revenue</p>
              <p className={styles.statValue}>${stats.projectedRevenue}</p>
              <p className={styles.statChange}>{stats.revenueChange}% from yesterday</p>
            </div>
          </section>

          {/* Main Content */}
          <section className={styles.mainGrid}>
            {/* Upcoming Appointments */}
            <div className={styles.appointmentsCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Upcoming Appointments ({upcomingAppointments.length})</h2>
                <button className={styles.viewScheduleBtn} onClick={() => router.push('/business/appointments')}>View Appointments</button>
              </div>
              <div className={styles.appointmentsList}>
                {upcomingAppointments.length === 0 ? (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No upcoming appointments</p>
                ) : (
                  upcomingAppointments.map((appointment: any) => (
                    <div key={appointment.id} className={styles.appointmentItem}>
                      <div className={styles.appointmentLeft}>
                        <div className={styles.clientAvatar}>
                          {appointment.client?.split(' ')[0]?.[0]?.toUpperCase() || ''}
                          {appointment.client?.split(' ')[1]?.[0]?.toUpperCase() || appointment.client?.[1]?.toUpperCase() || ''}
                        </div>
                        <div className={styles.appointmentInfo}>
                          <p className={styles.serviceName}>{appointment.service} - {appointment.staff}</p>
                          <p className={styles.clientName}>{appointment.client}</p>
                        </div>
                      </div>
                      <div className={styles.appointmentTime}>{appointment.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightColumn}>
              {/* Staff Availability */}
              <div className={styles.staffCard}>
                <h2 className={styles.cardTitle}>Staff Availability</h2>
                <div className={styles.staffList}>
                  {staff.length === 0 ? (
                    <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No staff members</p>
                  ) : (
                    staff.map((member: any) => (
                      <div key={member.id} className={styles.staffItem}>
                        <div className={styles.staffLeft}>
                          <div className={styles.staffAvatar}>
                            {member.name?.split(' ')[0]?.[0]?.toUpperCase() || ''}
                            {member.name?.split(' ')[1]?.[0]?.toUpperCase() || member.name?.[1]?.toUpperCase() || ''}
                          </div>
                          <p className={styles.staffName}>{member.name}</p>
                        </div>
                        <span className={`${styles.statusBadge} ${getStatusClass(member.status)}`}>
                          {getStatusText(member.status)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Popular Services */}
              <div className={styles.servicesCard}>
                <h2 className={styles.cardTitle}>Popular Services</h2>
                <div className={styles.servicesList}>
                  {popularServices.length === 0 ? (
                    <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No service data available</p>
                  ) : (
                    popularServices.map((service: any, index: number) => (
                      <div key={index} className={styles.serviceItem}>
                        <div className={styles.serviceHeader}>
                          <span className={styles.serviceLabel}>{service.name}</span>
                          <span className={styles.servicePercent}>{parseFloat(service.percentage || 0).toFixed(0)}%</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={`${styles.progressFill} ${getProgressClass(index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'tertiary' : 'quaternary')}`}
                            style={{ width: `${service.percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
