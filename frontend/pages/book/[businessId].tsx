import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import styles from '../../styles/booking.module.css'

export default function BookingPage() {
  const router = useRouter()
  const { businessId } = router.query
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Mock business data - replace with real API call
  const business = {
    id: Number(businessId),
    name: 'Beauty Studio Downtown',
    location: '123 Main St, New York, NY 10001'
  }

  // Mock services data
  const services = [
    { id: 1, name: 'Haircut', price: 45, duration: '30 min' },
    { id: 2, name: 'Hair Styling', price: 35, duration: '30 min' },
    { id: 3, name: 'Hair Coloring', price: 120, duration: '90 min' },
    { id: 4, name: 'Highlights', price: 150, duration: '120 min' },
    { id: 5, name: 'Blowout', price: 40, duration: '30 min' },
    { id: 6, name: 'Deep Conditioning', price: 25, duration: '20 min' }
  ]

  // Mock staff data
  const staff = [
    { id: 1, name: 'Sarah Johnson', specialty: 'Hair Stylist', rating: 4.9 },
    { id: 2, name: 'Michael Chen', specialty: 'Color Specialist', rating: 4.8 },
    { id: 3, name: 'Emma Davis', specialty: 'Senior Stylist', rating: 4.9 }
  ]

  // Mock available times
  const availableTimes = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM'
  ]

  const toggleService = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const getTotalPrice = () => {
    return services
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0)
  }

  const getTotalDuration = () => {
    const durations = services
      .filter(s => selectedServices.includes(s.id))
      .map(s => parseInt(s.duration))
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

  const handleConfirmBooking = () => {
    // Add your booking confirmation logic here
    console.log('Booking confirmed:', {
      businessId,
      services: selectedServices,
      staff: selectedStaff,
      date: selectedDate,
      time: selectedTime
    })
    // Redirect to success page or appointments page
    router.push('/appointments')
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
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const isSelected = selectedDate?.getDate() === day &&
                        selectedDate?.getMonth() === currentMonth.getMonth() &&
                        selectedDate?.getFullYear() === currentMonth.getFullYear()

      days.push(
        <button
          key={day}
          disabled={isPast}
          onClick={() => setSelectedDate(date)}
          className={`${styles.calendarDay} ${styles.calendarDayButton} ${
            isSelected ? styles.selectedDay : ''
          } ${isPast ? styles.pastDay : ''}`}
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
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Book Appointment</h1>
              <p className={styles.businessName}>{business.name}</p>
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
                      <span className={styles.serviceDuration}>{service.duration}</span>
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
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={styles.staffInfo}>
                        <h4 className={styles.staffName}>{member.name}</h4>
                        <p className={styles.staffSpecialty}>{member.specialty}</p>
                        <div className={styles.staffRating}>
                          ★ {member.rating}
                        </div>
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
                </div>
              )}

              {/* Time Selection */}
              {selectedDate && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Select Time</h3>
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
                  <p className={styles.confirmText}>{business.name}</p>
                  <p className={styles.confirmSubtext}>{business.location}</p>
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
                    {staff.find(s => s.id === selectedStaff)?.name}
                  </p>
                  <p className={styles.confirmSubtext}>
                    {staff.find(s => s.id === selectedStaff)?.specialty}
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
              <button onClick={handleConfirmBooking} className={styles.confirmButton}>
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
