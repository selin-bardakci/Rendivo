import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import styles from '../../styles/businessSchedule.module.css'

interface Shift {
  id: string
  staffName: string
  date: string
  startTime: string
  endTime: string
  color: string
}

export default function StaffSchedulePage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showStaffDropdown, setShowStaffDropdown] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [newShift, setNewShift] = useState({
    staffName: '',
    startTime: '',
    endTime: ''
  })

  // Sample shifts
  const [shifts, setShifts] = useState<Shift[]>([
    { id: '1', staffName: 'Olivia Chen', date: '2024-11-05', startTime: '09:00', endTime: '17:00', color: 'pink' },
    { id: '2', staffName: 'Ben Carter', date: '2024-11-07', startTime: '10:00', endTime: '18:00', color: 'purple' },
    { id: '3', staffName: 'Isabella Rossi', date: '2024-11-08', startTime: '09:00', endTime: '15:00', color: 'blue' },
    { id: '4', staffName: 'Liam Gomez', date: '2024-11-20', startTime: '12:00', endTime: '20:00', color: 'green' },
  ])

  const staff = [
    { name: 'Olivia Chen', color: 'pink' },
    { name: 'Ben Carter', color: 'purple' },
    { name: 'Isabella Rossi', color: 'blue' },
    { name: 'Liam Gomez', color: 'green' }
  ]

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
    return shifts.filter(shift => shift.date === dateStr)
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
    setNewShift({ staffName: '', startTime: '', endTime: '' })
    setShowAddModal(true)
  }

  const handleShiftClick = (shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingShift(shift)
    setSelectedDate(shift.date)
    setNewShift({
      staffName: shift.staffName,
      startTime: shift.startTime,
      endTime: shift.endTime
    })
    setShowAddModal(true)
  }

  const handleAddShift = () => {
    if (newShift.staffName && newShift.startTime && newShift.endTime && selectedDate) {
      const selectedStaff = staff.find(s => s.name === newShift.staffName)
      
      if (editingShift) {
        // Update existing shift
        setShifts(shifts.map(s => 
          s.id === editingShift.id 
            ? { ...s, staffName: newShift.staffName, startTime: newShift.startTime, endTime: newShift.endTime, date: selectedDate }
            : s
        ))
      } else {
        // Add new shift
        const shift: Shift = {
          id: Date.now().toString(),
          staffName: newShift.staffName,
          date: selectedDate,
          startTime: newShift.startTime,
          endTime: newShift.endTime,
          color: selectedStaff?.color || 'pink'
        }
        setShifts([...shifts, shift])
      }
      
      setNewShift({ staffName: '', startTime: '', endTime: '' })
      setShowAddModal(false)
      setSelectedDate(null)
      setEditingShift(null)
    }
  }

  const handleDeleteShift = () => {
    if (editingShift) {
      setShifts(shifts.filter(s => s.id !== editingShift.id))
      setShowAddModal(false)
      setEditingShift(null)
      setNewShift({ staffName: '', startTime: '', endTime: '' })
      setSelectedDate(null)
    }
  }

  const days = getDaysInMonth(currentDate)

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
                          className={`${styles.shiftCard} ${styles[`shift${shift.color.charAt(0).toUpperCase() + shift.color.slice(1)}`]}`}
                          onClick={(e) => handleShiftClick(shift, e)}
                        >
                          <p className={styles.shiftName}>{shift.staffName}</p>
                          <p className={styles.shiftTime}>
                            {shift.startTime} - {shift.endTime}
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
                    onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                  >
                    <span className={newShift.staffName ? styles.selectedText : styles.placeholderText}>
                      {newShift.staffName || 'Select staff...'}
                    </span>
                    <svg className={`${styles.selectArrow} ${showStaffDropdown ? styles.selectArrowOpen : ''}`} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStaffDropdown && (
                    <div className={styles.dropdownMenu}>
                      <button
                        type="button"
                        className={`${styles.dropdownItem} ${!newShift.staffName ? styles.dropdownItemActive : ''}`}
                        onClick={() => {
                          setNewShift({ ...newShift, staffName: '' })
                          setShowStaffDropdown(false)
                        }}
                      >
                        Select staff...
                      </button>
                      {staff.map((member) => (
                        <button
                          key={member.name}
                          type="button"
                          className={`${styles.dropdownItem} ${newShift.staffName === member.name ? styles.dropdownItemActive : ''}`}
                          onClick={() => {
                            setNewShift({ ...newShift, staffName: member.name })
                            setShowStaffDropdown(false)
                          }}
                        >
                          {member.name}
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
                <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleAddShift}>
                  {editingShift ? 'Save Changes' : 'Add Shift'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
