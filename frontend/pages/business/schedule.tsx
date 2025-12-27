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
    endTime: ''
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
    
    // Get 35 days starting from startDate (5 weeks)
    for (let i = 0; i < 35; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
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

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(formatDate(date))
    setEditingShift(null)
    setNewShift({ staffId: 0, startTime: '', endTime: '' })
    setShowAddModal(true)
  }

  const handleShiftClick = (shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingShift(shift)
    setSelectedDate(shift.shiftDate)
    setNewShift({
      staffId: shift.staffId,
      startTime: shift.startTime,
      endTime: shift.endTime
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
          // Add new shift
          const response = await api.post('/shifts', {
            staffId: newShift.staffId,
            shiftDate: selectedDate,
            startTime: newShift.startTime,
            endTime: newShift.endTime
          })
          setShifts([...shifts, response.data])
        }
        
        setNewShift({ staffId: 0, startTime: '', endTime: '' })
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
        setNewShift({ staffId: 0, startTime: '', endTime: '' })
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
                
                return (
                  <div
                    key={index}
                    className={`${styles.calendarCell} ${isTodayDate ? styles.today : ''}`}
                    onClick={() => handleDayClick(day.date)}
                  >
                    <span className={styles.dayNumber}>{day.date.getDate()}</span>
                    <div className={styles.shiftsContainer}>
                      {dayShifts.map((shift) => (
                        <div 
                          key={shift.id} 
                          className={`${styles.shiftCard} ${styles[`shift${getStaffColor(shift.staffId).charAt(0).toUpperCase() + getStaffColor(shift.staffId).slice(1)}`]}`}
                          onClick={(e) => handleShiftClick(shift, e)}
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
