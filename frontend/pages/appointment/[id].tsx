import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import styles from '../../styles/appointmentDetails.module.css'
import Link from 'next/link'
import { appointmentApi } from '../../lib/api'
import axios from 'axios'

export default function AppointmentDetails() {
  const router = useRouter()
  const { id } = router.query

  const [appointment, setAppointment] = useState<any>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState({ type: '', message: '' })
  
  // Reschedule state
  const [businessStaff, setBusinessStaff] = useState<any[]>([])
  const [businessServices, setBusinessServices] = useState<any[]>([])
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [calendarStartIndex, setCalendarStartIndex] = useState(0)
  const datesPerPage = 7

  const showNotificationMessage = (type: string, message: string) => {
    setNotification({ type, message })
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 4000)
  }

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError('')
        const response = await appointmentApi.getById(Number(id))
        console.log('Fetched appointment data:', response.data)
        setAppointment(response.data)
      } catch (err: any) {
        console.error('Error fetching appointment:', err)
        setError(err.response?.data?.message || 'Failed to load appointment')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [id])

  const handleReschedule = async () => {
    if (!appointment) return
    
    setShowRescheduleModal(true)
    
    // Fetch business staff and services
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      // Get business staff
      const staffRes = await axios.get(`${apiUrl}/businesses/${appointment.businessId}/staff`)
      console.log('Staff response:', staffRes.data)
      const staffList = staffRes.data.staff || staffRes.data || []
      setBusinessStaff(staffList)
      
      // Get business services
      const servicesRes = await axios.get(`${apiUrl}/businesses/${appointment.businessId}/services`)
      console.log('Services response:', servicesRes.data)
      setBusinessServices(servicesRes.data || [])
      
      // Set current staff and services as default
      setSelectedStaff(appointment.staff)
      setSelectedServices(appointment.services || [])
      
      // Get available dates for current staff
      const datesRes = await axios.get(
        `${apiUrl}/shifts/staff-shifts?businessId=${appointment.businessId}&staffId=${appointment.staffId}`
      )
      console.log('Dates response:', datesRes.data)
      setAvailableDates(datesRes.data.availableDates || [])
    } catch (err) {
      console.error('Error fetching reschedule data:', err)
    }
  }

  const handleStaffChange = async (staff: any) => {
    setSelectedStaff(staff)
    setSelectedDate(null)
    setSelectedTimeSlot(null)
    setAvailableTimeSlots([])
    
    // Fetch available dates for selected staff
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const datesRes = await axios.get(
        `${apiUrl}/shifts/staff-shifts?businessId=${appointment.businessId}&staffId=${staff.id}`
      )
      setAvailableDates(datesRes.data.availableDates || [])
    } catch (err) {
      console.error('Error fetching staff shifts:', err)
      setAvailableDates([])
    }
  }

  const handleServiceToggle = (service: any) => {
    const isSelected = selectedServices.some(s => s.id === service.id)
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id))
    } else {
      setSelectedServices([...selectedServices, service])
    }
    
    // If a date is already selected, refetch time slots with new duration
    if (selectedDate) {
      setSelectedTimeSlot(null)
      // Refetch will happen automatically when services state updates
      setTimeout(() => {
        if (selectedDate) {
          fetchAvailableTimeSlots(selectedDate)
        }
      }, 100)
    }
  }

  const fetchAvailableTimeSlots = async (date: Date) => {
    if (!appointment || !selectedStaff || selectedServices.length === 0) return
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      // Calculate total duration of selected services
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0)
      
      const response = await axios.get(
        `${apiUrl}/shifts/available-slots?businessId=${appointment.businessId}&staffId=${selectedStaff.id}&date=${dateStr}&duration=${totalDuration}`
      )
      console.log('Time slots response:', response.data)
      setAvailableTimeSlots(response.data.availableSlots || [])
    } catch (err) {
      console.error('Error fetching time slots:', err)
      setAvailableTimeSlots([])
    }
  }

  const handleDateSelect = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    setSelectedDate(date)
    setSelectedTimeSlot(null)
    fetchAvailableTimeSlots(date)
  }

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTimeSlot || !appointment || !selectedStaff || selectedServices.length === 0) return
    
    try {
      setRescheduleLoading(true)
      
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const appointmentDate = `${year}-${month}-${day}`
      
      // Calculate total duration and price
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0)
      const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price || 0), 0)
      const endTime = calculateEndTime(selectedTimeSlot.startTime, totalDuration)
      
      const response = await appointmentApi.reschedule(Number(id), {
        staffId: selectedStaff.id,
        serviceIds: selectedServices.map(s => s.id),
        appointmentDate,
        startTime: selectedTimeSlot.startTime,
        endTime: endTime,
        totalDuration,
        totalPrice
      })
      
      setAppointment(response.data.appointment)
      setShowRescheduleModal(false)
      setSelectedStaff(null)
      setSelectedServices([])
      setSelectedDate(null)
      setSelectedTimeSlot(null)
      showNotificationMessage('success', 'Appointment rescheduled successfully!')
      
      // Refresh appointment data
      const refreshedData = await appointmentApi.getById(Number(id))
      setAppointment(refreshedData.data)
    } catch (err: any) {
      console.error('Error rescheduling:', err)
      showNotificationMessage('error', err.response?.data?.message || 'Failed to reschedule appointment')
    } finally {
      setRescheduleLoading(false)
    }
  }

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`
  }

  const handleCancelConfirm = async () => {
    try {
      await appointmentApi.cancel(Number(id))
      setShowCancelModal(false)
      showNotificationMessage('success', 'Appointment cancelled successfully')
      setTimeout(() => router.push('/appointments'), 1000)
    } catch (err: any) {
      console.error('Error canceling appointment:', err)
      showNotificationMessage('error', err.response?.data?.message || 'Failed to cancel appointment')
    }
  }

  // Format appointment data
  const formatAppointmentData = () => {
    if (!appointment) return null
    
    console.log('Formatting appointment:', {
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      staff: appointment.staff,
      business: appointment.business,
      services: appointment.services
    })
    
    const appointmentDate = new Date(appointment.appointmentDate)
    const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
    const timeRange = `${appointment.startTime?.slice(0, 5)} - ${appointment.endTime?.slice(0, 5)}`
    const staffName = appointment.staff?.user?.fullName || 'Staff Member'
    const businessName = appointment.business?.businessName || 'Business'
    const location = `${appointment.business?.address || ''}, ${appointment.business?.city || ''} ${appointment.business?.state || ''}`
    const totalPrice = appointment.services?.reduce((sum: number, s: any) => sum + parseFloat(s.price || 0), 0) || 0
    const status = String(appointment.status || 'pending').toLowerCase()

    return {
      date: formattedDate,
      time: timeRange,
      staff: staffName,
      provider: businessName,
      location: location,
      services: appointment.services || [],
      totalPrice: totalPrice,
      notes: appointment.notes || '',
      status: status
    }
  }

  const formattedData = formatAppointmentData()

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>Loading appointment details...</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
          <Link href="/appointments" className={styles.backButton}>
            Back to Appointments
          </Link>
        </div>
      </Layout>
    )
  }

  if (!appointment) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>Appointment not found</div>
          <Link href="/appointments" className={styles.backButton}>
            Back to Appointments
          </Link>
        </div>
      </Layout>
    )
  }

  if (!formattedData) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>Error formatting appointment data</div>
          <Link href="/appointments" className={styles.backButton}>
            Back to Appointments
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.container}>
        {/* Notification Toast */}
        {showNotification && (
          <div className={`${styles.notification} ${styles[notification.type]}`}>
            <span className={styles.notificationIcon}>
              {notification.type === 'success' ? '✓' : '✕'}
            </span>
            <span>{notification.message}</span>
          </div>
        )}

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
            <span className={`${styles.statusBadge} ${styles[formattedData.status]}`}>
              {formattedData.status.charAt(0).toUpperCase() + formattedData.status.slice(1)}
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
                    <div className={styles.infoValue}>{formattedData.date}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Time
                    </div>
                    <div className={styles.infoValue}>{formattedData.time}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </div>
                    <div className={styles.infoValue}>{formattedData.location}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Staff
                    </div>
                    <div className={styles.infoValue}>{formattedData.staff}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Provider
                    </div>
                    <div className={styles.infoValue}>{formattedData.provider}</div>
                  </div>
                </div>
              </div>

              {/* Service Breakdown */}
              <div className={styles.cardSection}>
                <h2 className={styles.sectionTitle}>Service Breakdown</h2>
                <div className={styles.servicesList}>
                  {formattedData.services.map((service: any, index: number) => (
                    <div key={index} className={styles.serviceItem}>
                      <div className={styles.serviceInfo}>
                        <span className={styles.serviceName}>{service.name}</span>
                        <span className={styles.serviceDuration}>{service.duration} min</span>
                      </div>
                      <span className={styles.servicePrice}>${service.price}</span>
                    </div>
                  ))}
                  <div className={styles.serviceTotal}>
                    <span className={styles.totalLabel}>Total</span>
                    <span className={styles.totalPrice}>${formattedData.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {formattedData.notes && (
                <div className={styles.cardSection}>
                  <h2 className={styles.sectionTitle}>Additional Notes</h2>
                  <p className={styles.notes}>{formattedData.notes}</p>
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

        {/* Reschedule Modal */}
        {showRescheduleModal && (
          <div className={styles.modalOverlay} onClick={() => setShowRescheduleModal(false)}>
            <div className={styles.rescheduleModal} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.modalClose}
                onClick={() => setShowRescheduleModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className={styles.modalTitle}>Reschedule Appointment</h3>
              
              <div className={styles.rescheduleContent}>
                {/* Staff Selection */}
                <div className={styles.staffSection}>
                  <h4>Select Staff Member</h4>
                  <div className={styles.staffGrid}>
                    {businessStaff.map((staff) => {
                      const isSelected = selectedStaff?.id === staff.id
                      const staffName = staff.user?.fullName || 
                                       (staff.user?.firstName && staff.user?.lastName 
                                         ? `${staff.user.firstName} ${staff.user.lastName}` 
                                         : 'Staff Member')
                      return (
                        <button
                          key={staff.id}
                          className={`${styles.staffButton} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleStaffChange(staff)}
                        >
                          <div className={styles.staffName}>{staffName}</div>
                          {staff.position && <div className={styles.staffPosition}>{staff.position}</div>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Service Selection */}
                <div className={styles.serviceSection}>
                  <h4>Select Services</h4>
                  <div className={styles.serviceGrid}>
                    {businessServices.map((service) => {
                      const isSelected = selectedServices.some(s => s.id === service.id)
                      return (
                        <button
                          key={service.id}
                          className={`${styles.serviceButton} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleServiceToggle(service)}
                        >
                          <div className={styles.serviceName}>{service.name}</div>
                          <div className={styles.serviceDetails}>
                            <span className={styles.servicePrice}>${service.price}</span>
                            <span className={styles.serviceDuration}>{service.duration} min</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {selectedServices.length > 0 && (
                    <div className={styles.selectedSummary}>
                      <span>Total Duration: {selectedServices.reduce((sum, s) => sum + s.duration, 0)} min</span>
                      <span>Total Price: ${selectedServices.reduce((sum, s) => sum + parseFloat(s.price || 0), 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                {selectedStaff && (
                  <div className={styles.dateSection}>
                    <div className={styles.dateSectionHeader}>
                      <h4>Select a Date</h4>
                      {availableDates.length > datesPerPage && (
                        <div className={styles.calendarNav}>
                          <button
                            className={styles.navButton}
                            onClick={() => setCalendarStartIndex(Math.max(0, calendarStartIndex - datesPerPage))}
                            disabled={calendarStartIndex === 0}
                          >
                            ‹
                          </button>
                          <button
                            className={styles.navButton}
                            onClick={() => setCalendarStartIndex(Math.min(availableDates.length - datesPerPage, calendarStartIndex + datesPerPage))}
                            disabled={calendarStartIndex + datesPerPage >= availableDates.length}
                          >
                            ›
                          </button>
                        </div>
                      )}
                    </div>
                    {availableDates.length > 0 ? (
                      <div className={styles.dateGrid}>
                        {availableDates.slice(calendarStartIndex, calendarStartIndex + datesPerPage).map((dateStr) => {
                          const date = new Date(dateStr + 'T00:00:00')
                          const isSelected = selectedDate?.toDateString() === date.toDateString()
                          return (
                            <button
                              key={dateStr}
                              className={`${styles.dateButton} ${isSelected ? styles.selected : ''}`}
                              onClick={() => handleDateSelect(dateStr)}
                            >
                              <div className={styles.dateDay}>
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                              <div className={styles.dateNumber}>
                                {date.getDate()}
                              </div>
                              <div className={styles.dateMonth}>
                                {date.toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className={styles.noSlots}>No available dates for this staff member</p>
                    )}
                  </div>
                )}

                {/* Time Slot Selection */}
                {selectedDate && selectedServices.length > 0 && (
                  <div className={styles.timeSection}>
                    <h4>Select a Time</h4>
                    {availableTimeSlots.length > 0 ? (
                      <div className={styles.timeGrid}>
                        {availableTimeSlots.map((slot, index) => {
                          const isSelected = selectedTimeSlot?.startTime === slot.startTime
                          return (
                            <button
                              key={index}
                              className={`${styles.timeButton} ${isSelected ? styles.selected : ''}`}
                              onClick={() => setSelectedTimeSlot(slot)}
                            >
                              {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className={styles.noSlots}>No available time slots for this date</p>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button 
                  className={styles.modalButtonSecondary}
                  onClick={() => {
                    setShowRescheduleModal(false)
                    setSelectedStaff(null)
                    setSelectedServices([])
                    setSelectedDate(null)
                    setSelectedTimeSlot(null)
                  }}
                  disabled={rescheduleLoading}
                >
                  Cancel
                </button>
                <button 
                  className={styles.modalButtonPrimary}
                  onClick={handleConfirmReschedule}
                  disabled={!selectedDate || !selectedTimeSlot || !selectedStaff || selectedServices.length === 0 || rescheduleLoading}
                >
                  {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
