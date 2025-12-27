import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import styles from '../../styles/businessSchedule.module.css'
import api from '../../lib/api'
import { getCurrentUser } from '../../lib/auth'

interface Shift {
  id: number
  staffId: number
  shiftDate: string
  startTime: string
  endTime: string
  staff: {
    id: number
    user: {
      id: number
      firstName?: string
      lastName?: string
      fullName?: string
    }
  }
}

interface StaffMember {
  id: number
  position?: string
  user: {
    id: number
    firstName?: string
    lastName?: string
    fullName?: string
    email: string
  }
}

export default function StaffSchedulePage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showStaffDropdown, setShowStaffDropdown] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newShift, setNewShift] = useState({
    staffId: 0,
    startTime: '',
    endTime: '',
    applyToWeek: false,
    applyToMonth: false
  })

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

    checkApprovalAndFetchData()
  }, [])

  const checkApprovalAndFetchData = async () => {
    try {
      const response = await api.get('/business/dashboard')
      
      if (response.data.business?.approvalStatus === 'pending') {
        router.push('/business/pending-approval')
        return
      }
      
      if (response.data.business?.approvalStatus === 'rejected') {
        setError('Your business application has been rejected. Please contact support.')
        return
      }
      
      fetchData()
    } catch (err: any) {
      console.error('Error checking approval status:', err)
      fetchData() // Try to fetch anyway if check fails
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Calculate date range (5 weeks from current date)
      const startDate = formatDate(currentDate)
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + 34)
      const endDateStr = formatDate(endDate)

      console.log('📅 Fetching schedule data...')
      const [shiftsResponse, staffResponse] = await Promise.all([
        api.get(`/shifts?startDate=${startDate}&endDate=${endDateStr}`),
        api.get('/shifts/staff-members')
      ])

      console.log('✅ Shifts received:', shiftsResponse.data.length)
      console.log('👥 Staff received:', staffResponse.data.length, staffResponse.data)
      
      setShifts(shiftsResponse.data)
      setStaff(staffResponse.data)
    } catch (err: any) {
      console.error('❌ Error fetching data:', err)
      console.error('Error details:', err?.response?.data)
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getStaffName = (staffMember: StaffMember) => {
    const user = staffMember.user
    if (user.fullName) return user.fullName
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    if (user.firstName) return user.firstName
    return user.email
  }

  const getShiftStaffName = (shift: Shift) => {
    const user = shift.staff?.user
    if (!user) return 'Unknown'
    if (user.fullName) return user.fullName
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    if (user.firstName) return user.firstName
    return 'Staff'
  }

  const getStaffColor = (staffId: number) => {
    const colors = ['pink', 'purple', 'blue', 'green', 'orange', 'teal']
    return colors[staffId % colors.length]
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]

  const getDaysInMonth = (startDate: Date) => {
    const days = []
    
    // Calculate the Monday of the week containing startDate
    const dayOfWeek = startDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(startDate)
    monday.setDate(startDate.getDate() - daysToMonday)
    
    // Get 35 days starting from Monday (5 weeks)
    for (let i = 0; i < 35; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      days.push({
        date: date,
        isCurrentMonth: true
      })
    }

    return days
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getShiftsForDate = (date: Date) => {
    const dateStr = formatDate(date)
    return shifts.filter(shift => shift.shiftDate === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate < today
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleDayClick = (date: Date) => {
    if (isPastDate(date)) return // Geçmiş tarihlere shift eklenemez
    setSelectedDate(formatDate(date))
    setEditingShift(null)
    setNewShift({ staffId: 0, startTime: '', endTime: '', applyToWeek: false, applyToMonth: false })
    setShowAddModal(true)
  }

  const handleShiftClick = (shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation()
    const shiftDate = new Date(shift.shiftDate)
    if (isPastDate(shiftDate)) return // Geçmiş tarihli shift'ler editlenemez
    setEditingShift(shift)
    setSelectedDate(shift.shiftDate)
    setNewShift({
      staffId: shift.staffId,
      startTime: shift.startTime,
      endTime: shift.endTime,
      applyToWeek: false,
      applyToMonth: false
    })
    setShowAddModal(true)
  }

  const handleAddShift = async () => {
    if (newShift.staffId && newShift.startTime && newShift.endTime && selectedDate) {
      try {
        setSubmitting(true)
        if (editingShift) {
          // Update existing shift
          const response = await api.put(`/shifts/${editingShift.id}`, {
            staffId: newShift.staffId,
            shiftDate: selectedDate,
            startTime: newShift.startTime,
            endTime: newShift.endTime
          })
          setShifts(shifts.map(s => s.id === editingShift.id ? response.data : s))
        } else {
          // Add new shift(s)
          const datesToAdd: string[] = []
          
          if (newShift.applyToMonth) {
            // Tüm aya ekle
            const selectedDateObj = new Date(selectedDate)
            const month = selectedDateObj.getMonth()
            const year = selectedDateObj.getFullYear()
            const daysInMonth = new Date(year, month + 1, 0).getDate()
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day)
              if (date >= today) {
                datesToAdd.push(formatDate(date))
              }
            }
          } else if (newShift.applyToWeek) {
            // Tüm haftaya ekle (Monday to Sunday)
            const selectedDateObj = new Date(selectedDate)
            const dayOfWeek = selectedDateObj.getDay() // 0 = Sunday, 1 = Monday, etc.
            // Calculate days to subtract to get to Monday
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            const monday = new Date(selectedDateObj)
            monday.setDate(selectedDateObj.getDate() - daysToMonday)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            for (let i = 0; i < 7; i++) {
              const date = new Date(monday)
              date.setDate(monday.getDate() + i)
              if (date >= today) {
                datesToAdd.push(formatDate(date))
              }
            }
          } else {
            // Sadece seçili güne ekle
            datesToAdd.push(selectedDate)
          }
          
          // Tüm tarihler için shift oluştur veya güncelle
          const newShifts = []
          for (const date of datesToAdd) {
            // Bu tarihte bu staff member'ın shift'i var mı kontrol et
            const existingShift = shifts.find(
              s => s.shiftDate === date && s.staffId === newShift.staffId
            )
            
            try {
              if (existingShift) {
                // Mevcut shift'i güncelle
                const response = await api.put(`/shifts/${existingShift.id}`, {
                  staffId: newShift.staffId,
                  shiftDate: date,
                  startTime: newShift.startTime,
                  endTime: newShift.endTime
                })
                // Shifts array'inde güncelle
                setShifts(prevShifts => prevShifts.map(s => 
                  s.id === existingShift.id ? response.data : s
                ))
              } else {
                // Yeni shift ekle
                const response = await api.post('/shifts', {
                  staffId: newShift.staffId,
                  shiftDate: date,
                  startTime: newShift.startTime,
                  endTime: newShift.endTime
                })
                newShifts.push(response.data)
              }
            } catch (err: any) {
              console.error(`Failed to save shift for ${date}:`, err?.response?.data?.message)
              // Hata olsa bile devam et
            }
          }
          
          // Yeni eklenen shift'leri state'e ekle
          if (newShifts.length > 0) {
            setShifts(prevShifts => [...prevShifts, ...newShifts])
          }
        }
        
        setNewShift({ staffId: 0, startTime: '', endTime: '', applyToWeek: false, applyToMonth: false })
        setShowAddModal(false)
        setSelectedDate(null)
        setEditingShift(null)
      } catch (err: any) {
        alert(err?.response?.data?.message || 'Failed to save shift')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleDeleteShift = async () => {
    if (editingShift) {
      try {
        await api.delete(`/shifts/${editingShift.id}`)
        setShifts(shifts.filter(s => s.id !== editingShift.id))
        setShowAddModal(false)
        setEditingShift(null)
        setNewShift({ staffId: 0, startTime: '', endTime: '', applyToWeek: false, applyToMonth: false })
        setSelectedDate(null)
      } catch (err: any) {
        alert(err?.response?.data?.message || 'Failed to delete shift')
      }
    }
  }

  const days = getDaysInMonth(currentDate)

  if (loading) {
    return (
      <Layout>
        <div className={styles.pageContainer}>
          <div className={styles.contentWrapper}>
            <p>Loading schedule...</p>
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

  return (
    <Layout>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Staff Schedule</h1>
              <p className={styles.pageSubtitle}>Assign and manage staff shifts throughout the month.</p>
            </div>
            <button 
              className={styles.addButton}
              onClick={() => {
                setSelectedDate(formatDate(new Date()))
                setShowAddModal(true)
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Shift</span>
            </button>
          </header>

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.navigation}>
              <div className={styles.navButtons}>
                <button onClick={goToPreviousWeek} className={styles.navButton}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={goToNextWeek} className={styles.navButton}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <h2 className={styles.currentMonth}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={goToToday} className={styles.todayButton}>
                <span className={styles.todayDot}></span>
                Today
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className={styles.calendar}>
            {/* Day Headers */}
            <div className={styles.dayHeaders}>
              <div className={styles.dayHeader}>MON</div>
              <div className={styles.dayHeader}>TUE</div>
              <div className={styles.dayHeader}>WED</div>
              <div className={styles.dayHeader}>THU</div>
              <div className={styles.dayHeader}>FRI</div>
              <div className={styles.dayHeader}>SAT</div>
              <div className={styles.dayHeader}>SUN</div>
            </div>

            {/* Calendar Grid */}
            <div className={styles.calendarGrid}>
              {days.map((day, index) => {
                const dayShifts = getShiftsForDate(day.date)
                const isTodayDate = isToday(day.date)
                const isPast = isPastDate(day.date)
                
                return (
                  <div
                    key={index}
                    className={`${styles.calendarCell} ${isTodayDate ? styles.today : ''} ${isPast ? styles.pastDate : ''}`}
                    onClick={() => handleDayClick(day.date)}
                    style={isPast ? { cursor: 'not-allowed' } : {}}
                  >
                    <span className={styles.dayNumber}>{day.date.getDate()}</span>
                    <div className={styles.shiftsContainer}>
                      {dayShifts.map((shift) => (
                        <div 
                          key={shift.id} 
                          className={`${styles.shiftCard} ${styles[`shift${getStaffColor(shift.staffId).charAt(0).toUpperCase() + getStaffColor(shift.staffId).slice(1)}`]} ${isPast ? styles.pastShift : ''}`}
                          onClick={(e) => handleShiftClick(shift, e)}
                          style={isPast ? { cursor: 'not-allowed' } : {}}
                        >
                          <p className={styles.shiftName}>{getShiftStaffName(shift)}</p>
                          <p className={styles.shiftTime}>
                            {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingShift ? 'Edit Shift' : 'Add New Shift'}</h2>
              <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input
                  type="date"
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Staff Member</label>
                <div className={styles.customSelect}>
                  <button
                    type="button"
                    className={styles.selectButton}
                    onClick={() => {
                      console.log('🔽 Staff dropdown clicked. Available staff:', staff.length, staff)
                      setShowStaffDropdown(!showStaffDropdown)
                    }}
                  >
                    <span className={newShift.staffId ? styles.selectedText : styles.placeholderText}>
                      {newShift.staffId ? getStaffName(staff.find(s => s.id === newShift.staffId)!) : 'Select staff...'}
                    </span>
                    <svg className={`${styles.selectArrow} ${showStaffDropdown ? styles.selectArrowOpen : ''}`} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStaffDropdown && (
                    <div className={styles.dropdownMenu}>
                      <button
                        type="button"
                        className={`${styles.dropdownItem} ${!newShift.staffId ? styles.dropdownItemActive : ''}`}
                        onClick={() => {
                          setNewShift({ ...newShift, staffId: 0 })
                          setShowStaffDropdown(false)
                        }}
                      >
                        Select staff...
                      </button>
                      {staff.length === 0 && (
                        <div className={styles.dropdownItem} style={{ color: '#999', cursor: 'default' }}>
                          No staff members available
                        </div>
                      )}
                      {staff.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          className={`${styles.dropdownItem} ${newShift.staffId === member.id ? styles.dropdownItemActive : ''}`}
                          onClick={() => {
                            console.log('👤 Selected staff:', member)
                            setNewShift({ ...newShift, staffId: member.id })
                            setShowStaffDropdown(false)
                          }}
                        >
                          {getStaffName(member)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.timeInputs}>
                <div className={styles.timeGroup}>
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    className={styles.timeInput}
                  />
                </div>
                <div className={styles.timeGroupRight}>
                  <label>End Time</label>
                  <input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    className={styles.timeInput}
                  />
                </div>
              </div>

              {!editingShift && (
                <div className={styles.bulkOptions}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newShift.applyToWeek}
                      onChange={(e) => setNewShift({ 
                        ...newShift, 
                        applyToWeek: e.target.checked,
                        applyToMonth: e.target.checked ? false : newShift.applyToMonth
                      })}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule for this week
                    </span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newShift.applyToMonth}
                      onChange={(e) => setNewShift({ 
                        ...newShift, 
                        applyToMonth: e.target.checked,
                        applyToWeek: e.target.checked ? false : newShift.applyToWeek
                      })}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule for this month
                    </span>
                  </label>
                  {(newShift.applyToWeek || newShift.applyToMonth) && (
                    <div className={styles.bulkWarning}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      This shift will be added for the {newShift.applyToMonth ? 'entire month' : 'entire week'} (from today onwards)
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              {editingShift && (
                <button className={styles.deleteBtn} onClick={handleDeleteShift}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button 
                  className={styles.saveBtn} 
                  onClick={handleAddShift}
                  disabled={submitting || !newShift.staffId || !newShift.startTime || !newShift.endTime}
                >
                  {submitting ? 'Saving...' : (editingShift ? 'Save Changes' : 'Add Shift')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
