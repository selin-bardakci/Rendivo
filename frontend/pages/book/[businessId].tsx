import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import styles from '../../styles/booking.module.css'
import { businessApi, appointmentApi } from '../../lib/api'

export default function BookingPage() {
  const router = useRouter()
  const { businessId } = router.query
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real data from API
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  
  // Shift-based availability
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  // Fetch business data
  useEffect(() => {
    if (!businessId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [businessRes, staffRes] = await Promise.all([
          businessApi.getById(businessId as string),
          businessApi.getStaff(businessId as string),
        ])
        
        setBusiness(businessRes.data)
        setServices(businessRes.data.services || [])
        // Use staff from business data which has user populated
        setStaff(businessRes.data.staff || staffRes.data)
      } catch (err) {
        console.error('Error fetching business data:', err)
        setError('Failed to load business data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [businessId])

  // Fetch staff shifts when staff is selected
  useEffect(() => {
    if (!businessId || !selectedStaff) {
      setAvailableDates([])
      setSelectedDate(null)
      setSelectedTime(null)
      return
    }

    const fetchStaffShifts = async () => {
      try {
        setLoadingAvailability(true)
        
        // Get shifts for next 30 days
        const startDate = new Date().toISOString().split('T')[0]
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        const response = await fetch(
          `http://localhost:5001/api/shifts/staff-shifts?businessId=${businessId}&staffId=${selectedStaff}&startDate=${startDate}&endDate=${endDate}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setAvailableDates(data.availableDates || [])
        } else {
          setAvailableDates([])
        }
      } catch (err) {
        console.error('Error fetching staff shifts:', err)
        setAvailableDates([])
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchStaffShifts()
  }, [businessId, selectedStaff])

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (!businessId || !selectedStaff || !selectedDate || selectedServices.length === 0) {
      setAvailableTimes([])
      setSelectedTime(null)
      return
    }

    const fetchAvailableTimeSlots = async () => {
      try {
        setLoadingAvailability(true)
        
        // Format date as YYYY-MM-DD in local timezone
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        // Calculate total duration of selected services
        const totalDuration = selectedServices.reduce((sum, serviceId) => {
          const service = services.find(s => s.id === serviceId)
          return sum + (service?.duration || 0)
        }, 0)
        
        const response = await fetch(
          `http://localhost:5001/api/shifts/available-slots?businessId=${businessId}&staffId=${selectedStaff}&date=${dateStr}&duration=${totalDuration}`
        )
        
        if (response.ok) {
          const data = await response.json()
          
          // Format available slots for display
          const slots: string[] = []
          
          if (data.availableSlots && data.availableSlots.length > 0) {
            data.availableSlots.forEach((slot: any) => {
              const [startHour, startMin] = slot.startTime.split(':').map(Number)
              const period = startHour >= 12 ? 'PM' : 'AM'
              const displayHour = startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour)
              const timeStr = `${displayHour}:${startMin.toString().padStart(2, '0')} ${period}`
              slots.push(timeStr)
            })
          }
          
          setAvailableTimes(slots)
        } else {
          setAvailableTimes([])
        }
      } catch (err) {
        console.error('Error fetching time slots:', err)
        setAvailableTimes([])
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchAvailableTimeSlots()
  }, [businessId, selectedStaff, selectedDate, selectedServices, services])

  const toggleService = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const getTotalPrice = () => {
    const total = services
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + parseFloat(s.price || 0), 0)
    return Number(total).toFixed(2)
  }

  const getTotalDuration = () => {
    const durations = services
      .filter(s => selectedServices.includes(s.id))
      .map(s => s.duration)
    return durations.reduce((sum, d) => sum + d, 0)
  }

  const canContinueStep1 = selectedServices.length > 0
  const canContinueStep2 = selectedStaff !== null && selectedDate !== null && selectedTime !== null

  const handleContinue = () => {
    if (step === 1 && canContinueStep1) {
      setStep(2)
    } else if (step === 2 && canContinueStep2) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push('/discover')
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      setError('Please complete all required fields')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Format the date in local timezone (YYYY-MM-DD)
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const appointmentDate = `${year}-${month}-${day}`
      
      // Convert time from "9:00 AM" format to "09:00:00"
      const [time, period] = selectedTime.split(' ')
      let [hours, minutes] = time.split(':')
      let hour = parseInt(hours)
      if (period === 'PM' && hour !== 12) hour += 12
      if (period === 'AM' && hour === 12) hour = 0
      const startTime = `${hour.toString().padStart(2, '0')}:${minutes}:00`

      // Calculate total duration and end time
      const totalDuration = getTotalDuration()
      
      const startDate = new Date(`${appointmentDate}T${startTime}`)
      const endDate = new Date(startDate.getTime() + totalDuration * 60000)
      const endTime = endDate.toTimeString().split(' ')[0]

      const appointmentData = {
        businessId: Number(businessId),
        staffId: selectedStaff,
        appointmentDate,
        startTime,
        endTime,
        serviceIds: selectedServices,
        notes: ''
      }

      await appointmentApi.create(appointmentData)
      
      // Redirect to appointments page with success message
      router.push('/appointments?success=true')
    } catch (err: any) {
      console.error('Error creating appointment:', err)
      setError(err.response?.data?.message || 'Failed to create appointment')
    } finally {
      setSubmitting(false)
    }
  }

  // Calendar logic
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startingDayOfWeek = new Date(year, month, 1).getDay()
    return { daysInMonth, startingDayOfWeek }
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
    const days = []
    const today = new Date()

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDay} />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      // Use local date string for comparison (YYYY-MM-DD format)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const dayStr = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${dayStr}`
      
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      todayStart.setHours(0, 0, 0, 0)
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      const isPast = checkDate < todayStart
      const isAvailable = availableDates.includes(dateStr)
      const isDisabled = isPast || (!isAvailable && availableDates.length > 0)
      const isSelected = selectedDate?.getDate() === day &&
                        selectedDate?.getMonth() === currentMonth.getMonth() &&
                        selectedDate?.getFullYear() === currentMonth.getFullYear()

      days.push(
        <button
          key={day}
          disabled={isDisabled}
          onClick={() => setSelectedDate(date)}
          className={`${styles.calendarDay} ${styles.calendarDayButton} ${
            isSelected ? styles.selectedDay : ''
          } ${isDisabled ? styles.pastDay : ''}`}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Loading State */}
          {loading && (
            <div className={styles.loading}>
              <p>Loading...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={() => router.push('/discover')}>Back to Discover</button>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && business && (
            <>
              {/* Header */}
              <div className={styles.header}>
                <div>
                  <h1 className={styles.title}>Book Appointment</h1>
                  <p className={styles.businessName}>{business.businessName}</p>
                </div>
              </div>

          {/* Progress Steps */}
          <div className={styles.progressSteps}>
            <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
              <div className={styles.stepNumber}>1</div>
              <span className={styles.stepLabel}>Services</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
              <div className={styles.stepNumber}>2</div>
              <span className={styles.stepLabel}>Staff & Time</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
              <div className={styles.stepNumber}>3</div>
              <span className={styles.stepLabel}>Confirm</span>
            </div>
          </div>

          {/* Step 1: Select Services */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Select Services</h2>
              <p className={styles.stepDescription}>Choose one or more services for your appointment</p>

              <div className={styles.servicesGrid}>
                {services.map(service => (
                  <div
                    key={service.id}
                    className={`${styles.serviceCard} ${
                      selectedServices.includes(service.id) ? styles.serviceCardSelected : ''
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <div className={styles.serviceHeader}>
                      <h3 className={styles.serviceName}>{service.name}</h3>
                      <div className={styles.serviceCheckbox}>
                        {selectedServices.includes(service.id) && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className={styles.serviceDetails}>
                      <span className={styles.serviceDuration}>{service.duration} min</span>
                      <span className={styles.servicePrice}>${service.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedServices.length > 0 && (
                <div className={styles.summary}>
                  <div className={styles.summaryRow}>
                    <span>Total Duration:</span>
                    <strong>{getTotalDuration()} minutes</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Total Price:</span>
                    <strong>${getTotalPrice()}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Staff, Date & Time */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Select Staff & Time</h2>
              <p className={styles.stepDescription}>Choose your preferred specialist and appointment time</p>

              {/* Staff Selection */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Select a Specialist</h3>
                <div className={styles.staffGrid}>
                  {staff.map(member => (
                    <div
                      key={member.id}
                      className={`${styles.staffCard} ${
                        selectedStaff === member.id ? styles.staffCardSelected : ''
                      }`}
                      onClick={() => setSelectedStaff(member.id)}
                    >
                      <div className={styles.staffAvatar}>
                        {member.user?.firstName?.[0] || member.user?.fullName?.[0] || 'S'}
                        {member.user?.lastName?.[0] || member.user?.fullName?.[1] || 'M'}
                      </div>
                      <div className={styles.staffInfo}>
                        <h4 className={styles.staffName}>
                          {member.user?.firstName && member.user?.lastName 
                            ? `${member.user.firstName} ${member.user.lastName}`
                            : member.user?.fullName || 'Staff Member'}
                        </h4>
                        <p className={styles.staffSpecialty}>{member.position || 'Staff Member'}</p>
                      </div>
                      <div className={styles.staffCheckbox}>
                        {selectedStaff === member.id && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              {selectedStaff && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Select Date</h3>
                  {loadingAvailability ? (
                    <p className={styles.infoMessage}>Loading available dates...</p>
                  ) : availableDates.length === 0 ? (
                    <p className={styles.infoMessage}>This staff member has no available shifts. Please select another staff member.</p>
                  ) : (
                    <div className={styles.calendarContainer}>
                      <div className={styles.calendarHeader}>
                        <button onClick={() => changeMonth(-1)} className={styles.monthButton}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <h3 className={styles.monthTitle}>
                          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
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
                    </div>
                  )}
                </div>
              )}

              {/* Time Selection */}
              {selectedDate && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Select Time</h3>
                  {loadingAvailability ? (
                    <p className={styles.infoMessage}>Loading available times...</p>
                  ) : availableTimes.length === 0 ? (
                    <p className={styles.infoMessage}>No available time slots for this date. Please select another date.</p>
                  ) : (
                    <div className={styles.timesGrid}>
                      {availableTimes.map(time => (
                        <button
                          key={time}
                          className={`${styles.timeButton} ${
                            selectedTime === time ? styles.timeButtonSelected : ''
                          }`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm Booking */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Confirm Your Appointment</h2>
              <p className={styles.stepDescription}>Please review your booking details</p>

              <div className={styles.confirmationCard}>
                <div className={styles.confirmSection}>
                  <h3 className={styles.confirmSectionTitle}>Business</h3>
                  <p className={styles.confirmText}>{business.businessName}</p>
                  <p className={styles.confirmSubtext}>{business.address}, {business.city}, {business.state}</p>
                </div>

                <div className={styles.confirmSection}>
                  <h3 className={styles.confirmSectionTitle}>Services</h3>
                  {services
                    .filter(s => selectedServices.includes(s.id))
                    .map(service => (
                      <div key={service.id} className={styles.confirmServiceRow}>
                        <span>{service.name}</span>
                        <span>${service.price}</span>
                      </div>
                    ))}
                  <div className={styles.confirmTotal}>
                    <strong>Total:</strong>
                    <strong>${getTotalPrice()}</strong>
                  </div>
                </div>

                <div className={styles.confirmSection}>
                  <h3 className={styles.confirmSectionTitle}>Staff Member</h3>
                  <p className={styles.confirmText}>
                    {staff.find(s => s.id === selectedStaff)?.user?.firstName} {staff.find(s => s.id === selectedStaff)?.user?.lastName}
                  </p>
                  <p className={styles.confirmSubtext}>
                    {staff.find(s => s.id === selectedStaff)?.position || 'Staff Member'}
                  </p>
                </div>

                <div className={styles.confirmSection}>
                  <h3 className={styles.confirmSectionTitle}>Date & Time</h3>
                  <p className={styles.confirmText}>
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className={styles.confirmSubtext}>{selectedTime}</p>
                  <p className={styles.confirmSubtext}>Duration: {getTotalDuration()} minutes</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={styles.navigation}>
            <button onClick={handleBack} className={styles.backButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={handleContinue}
                disabled={(step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2)}
                className={styles.continueButton}
              >
                Continue
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={handleConfirmBooking} 
                disabled={submitting}
                className={styles.confirmButton}
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>
          </>
          )}
        </div>
      </div>
    </Layout>
  )
}
