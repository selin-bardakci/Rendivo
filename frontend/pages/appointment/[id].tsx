import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import styles from '../../styles/appointmentDetails.module.css'
import Link from 'next/link'

export default function AppointmentDetails() {
  const router = useRouter()
  const { id } = router.query

  // Mock appointment data - replace with real API call using the id
  const [appointment, setAppointment] = useState<any>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    if (id) {
      // Mock data - replace with actual API call
      const mockAppointments: any = {
        '1': {
          id: 1,
          service: 'Haircut & Styling',
          provider: 'Beauty Studio Downtown',
          staff: 'Sarah Johnson',
          location: '123 Main St, New York, NY 10001',
          date: 'November 25, 2025',
          time: '2:00 PM - 3:00 PM',
          duration: '60 minutes',
          status: 'upcoming',
          services: [
            { name: 'Haircut', price: 45, duration: '30 min' },
            { name: 'Hair Styling', price: 35, duration: '30 min' }
          ],
          totalPrice: 80,
          notes: 'Please arrive 10 minutes early for consultation.'
        },
        '2': {
          id: 2,
          service: 'Massage Therapy',
          provider: 'Wellness Center',
          staff: 'Michael Chen',
          location: '456 Park Ave, New York, NY 10022',
          date: 'November 28, 2025',
          time: '10:00 AM - 11:00 AM',
          duration: '60 minutes',
          status: 'upcoming',
          services: [
            { name: 'Deep Tissue Massage', price: 120, duration: '60 min' }
          ],
          totalPrice: 120,
          notes: 'Bring comfortable clothing.'
        },
        '3': {
          id: 3,
          service: 'Nail Treatment',
          provider: 'Glamour Salon',
          staff: 'Emma Davis',
          location: '789 Broadway, New York, NY 10003',
          date: 'December 5, 2025',
          time: '4:30 PM - 5:30 PM',
          duration: '60 minutes',
          status: 'upcoming',
          services: [
            { name: 'Manicure', price: 35, duration: '30 min' },
            { name: 'Pedicure', price: 45, duration: '30 min' }
          ],
          totalPrice: 80,
          notes: ''
        }
      }
      setAppointment(mockAppointments[id as string])
    }
  }, [id])

  const handleReschedule = () => {
    // Implement reschedule logic - could navigate to booking page with pre-filled data
    console.log('Reschedule appointment:', id)
    // router.push(`/reschedule/${id}`)
  }

  const handleCancelConfirm = () => {
    console.log('Cancel appointment:', id)
    setShowCancelModal(false)
    // Add your cancel API call here
    // Then redirect to appointments page
    router.push('/appointments')
  }

  if (!appointment) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>Loading appointment details...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Header with back button */}
          <div className={styles.header}>
            <Link href="/appointments" className={styles.backButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </Link>
            <h1 className={styles.title}>Appointment Details</h1>
            <span className={`${styles.statusBadge} ${styles[appointment.status]}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>

          <div className={styles.detailsGrid}>
            {/* Main Details Card */}
            <div className={styles.mainCard}>
              <div className={styles.cardSection}>
                <h2 className={styles.sectionTitle}>Appointment Information</h2>
                
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Date
                    </div>
                    <div className={styles.infoValue}>{appointment.date}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Time
                    </div>
                    <div className={styles.infoValue}>{appointment.time}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </div>
                    <div className={styles.infoValue}>{appointment.location}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Staff
                    </div>
                    <div className={styles.infoValue}>{appointment.staff}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Provider
                    </div>
                    <div className={styles.infoValue}>{appointment.provider}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Duration
                    </div>
                    <div className={styles.infoValue}>{appointment.duration}</div>
                  </div>
                </div>
              </div>

              {/* Service Breakdown */}
              <div className={styles.cardSection}>
                <h2 className={styles.sectionTitle}>Service Breakdown</h2>
                <div className={styles.servicesList}>
                  {appointment.services.map((service: any, index: number) => (
                    <div key={index} className={styles.serviceItem}>
                      <div className={styles.serviceInfo}>
                        <span className={styles.serviceName}>{service.name}</span>
                        <span className={styles.serviceDuration}>{service.duration}</span>
                      </div>
                      <span className={styles.servicePrice}>${service.price}</span>
                    </div>
                  ))}
                  <div className={styles.serviceTotal}>
                    <span className={styles.totalLabel}>Total</span>
                    <span className={styles.totalPrice}>${appointment.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className={styles.cardSection}>
                  <h2 className={styles.sectionTitle}>Additional Notes</h2>
                  <p className={styles.notes}>{appointment.notes}</p>
                </div>
              )}
            </div>

            {/* Actions Sidebar */}
            <div className={styles.actionsSidebar}>
              <div className={styles.actionsCard}>
                <h2 className={styles.actionsTitle}>Actions</h2>
                <div className={styles.actionsButtons}>
                  <button 
                    className={`${styles.actionButton} ${styles.rescheduleButton}`}
                    onClick={handleReschedule}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Reschedule Appointment
                  </button>
                  <button 
                    className={`${styles.actionButton} ${styles.cancelButton}`}
                    onClick={() => setShowCancelModal(true)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Appointment
                  </button>
                </div>
                
                <div className={styles.helpSection}>
                  <p className={styles.helpText}>Need help?</p>
                  <a href="#" className={styles.contactLink}>Contact Support</a>
                </div>
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
      </div>
    </Layout>
  )
}
