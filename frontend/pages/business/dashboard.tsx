import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Image from 'next/image'
import styles from '../../styles/businessDashboardMain.module.css'

export default function DashboardPage() {
  const router = useRouter()

  // Sample data
  const appointments = [
    {
      id: 1,
      service: 'Haircut & Style',
      staff: 'Chloe',
      client: 'Isabella Rossi',
      time: '9:00 AM',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      service: 'Manicure',
      staff: 'Alex',
      client: 'Sophia Chen',
      time: '10:30 AM',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: 3,
      service: 'Balayage',
      staff: 'Jordan',
      client: 'Olivia Kim',
      time: '11:00 AM',
      avatar: 'https://i.pravatar.cc/150?img=9'
    },
    {
      id: 4,
      service: 'Facial',
      staff: 'Sam',
      client: 'Ava Garcia',
      time: '1:00 PM',
      avatar: 'https://i.pravatar.cc/150?img=10'
    }
  ]

  const staff = [
    {
      id: 1,
      name: 'Chloe',
      status: 'busy',
      avatar: 'https://i.pravatar.cc/150?img=47'
    },
    {
      id: 2,
      name: 'Alex',
      status: 'available',
      avatar: 'https://i.pravatar.cc/150?img=33'
    },
    {
      id: 3,
      name: 'Jordan',
      status: 'break',
      avatar: 'https://i.pravatar.cc/150?img=20'
    }
  ]

  const services = [
    { name: 'Haircut & Style', percent: 45, color: 'primary' },
    { name: 'Balayage', percent: 25, color: 'secondary' },
    { name: 'Manicure', percent: 20, color: 'tertiary' },
    { name: 'Facial', percent: 10, color: 'quaternary' }
  ]

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
              <h1 className={styles.pageTitle}>Hello, Radiant Salon!</h1>
              <p className={styles.pageSubtitle}>Here's what's happening with your business today.</p>
            </div>
          </header>

          {/* Stats */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Total Appointments Today</p>
              <p className={styles.statValue}>12</p>
              <p className={styles.statChange}>+2% from yesterday</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>New Clients This Week</p>
              <p className={styles.statValue}>8</p>
              <p className={styles.statChange}>+5% from last week</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Projected Revenue</p>
              <p className={styles.statValue}>$2,450</p>
              <p className={styles.statChange}>+1.5% from yesterday</p>
            </div>
          </section>

          {/* Main Content */}
          <section className={styles.mainGrid}>
            {/* Upcoming Appointments */}
            <div className={styles.appointmentsCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Upcoming Appointments</h2>
                <button className={styles.viewScheduleBtn}>View Full Schedule</button>
              </div>
              <div className={styles.appointmentsList}>
                {appointments.map((appointment) => (
                  <div key={appointment.id} className={styles.appointmentItem}>
                    <div className={styles.appointmentLeft}>
                      <img 
                        src={appointment.avatar} 
                        alt={appointment.client} 
                        className={styles.clientAvatar}
                      />
                      <div className={styles.appointmentInfo}>
                        <p className={styles.serviceName}>{appointment.service} - {appointment.staff}</p>
                        <p className={styles.clientName}>{appointment.client}</p>
                      </div>
                    </div>
                    <div className={styles.appointmentTime}>{appointment.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightColumn}>
              {/* Staff Availability */}
              <div className={styles.staffCard}>
                <h2 className={styles.cardTitle}>Staff Availability</h2>
                <div className={styles.staffList}>
                  {staff.map((member) => (
                    <div key={member.id} className={styles.staffItem}>
                      <div className={styles.staffLeft}>
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className={styles.staffAvatar}
                        />
                        <p className={styles.staffName}>{member.name}</p>
                      </div>
                      <span className={`${styles.statusBadge} ${getStatusClass(member.status)}`}>
                        {getStatusText(member.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Services */}
              <div className={styles.servicesCard}>
                <h2 className={styles.cardTitle}>Popular Services</h2>
                <div className={styles.servicesList}>
                  {services.map((service, index) => (
                    <div key={index} className={styles.serviceItem}>
                      <div className={styles.serviceHeader}>
                        <span className={styles.serviceLabel}>{service.name}</span>
                        <span className={styles.servicePercent}>{service.percent}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={`${styles.progressFill} ${getProgressClass(service.color)}`}
                          style={{ width: `${service.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
