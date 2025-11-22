import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import styles from '../../styles/businessStaff.module.css'

interface StaffMember {
  id: string
  name: string
  role: string
  status: 'active' | 'inactive'
  email: string
  phone: string
  avatar: string
}

export default function StaffManagementPage() {
  const router = useRouter()

  // Sample staff data
  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'Olivia Chen',
      role: 'Senior Stylist',
      status: 'active',
      email: 'olivia.chen@example.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: '2',
      name: 'Benjamin Carter',
      role: 'Massage Therapist',
      status: 'active',
      email: 'ben.carter@example.com',
      phone: '+1 (555) 234-5678',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: '3',
      name: 'Sophia Rodriguez',
      role: 'Nail Technician',
      status: 'active',
      email: 'sophia.rodriguez@example.com',
      phone: '+1 (555) 345-6789',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: '4',
      name: 'Liam Goldberg',
      role: 'Junior Stylist',
      status: 'inactive',
      email: 'liam.goldberg@example.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://i.pravatar.cc/150?img=13'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [showBusinessIdModal, setShowBusinessIdModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)

  // Business ID - This would come from the business profile
  const businessId = 'BIZ-7K9M-2XP4-QR8N'

  const roles = ['All', 'Senior Stylist', 'Junior Stylist', 'Massage Therapist', 'Nail Technician']
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const handleViewStaff = (member: StaffMember) => {
    setSelectedStaff(member)
  }

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(member => member.id !== id))
    setDeleteConfirm(null)
  }

  const handleCopyBusinessId = async () => {
    try {
      await navigator.clipboard.writeText(businessId)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    const matchesRole = roleFilter === 'all' || roleFilter === 'All' || member.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusLabel = () => {
    const status = statuses.find(s => s.value === statusFilter)
    return status ? `Status: ${status.label}` : 'Status: All'
  }

  const getRoleLabel = () => {
    return roleFilter === 'all' || roleFilter === 'All' ? 'Role: All' : `Role: ${roleFilter}`
  }

  return (
    <Layout>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Manage Your Team</h1>
              <p className={styles.pageSubtitle}>View and manage your staff members.</p>
            </div>
            <button className={styles.addButton} onClick={() => setShowBusinessIdModal(true)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Staff Member</span>
            </button>
          </header>

          {/* Search and Filters */}
          <div className={styles.filterSection}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search by name or role..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.filters}>
              <div className={styles.customSelect}>
                <button 
                  className={styles.selectButton}
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown)
                    setShowRoleDropdown(false)
                  }}
                >
                  <span>{getStatusLabel()}</span>
                  <svg width="12" height="8" fill="none" viewBox="0 0 12 8">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#886385" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showStatusDropdown && (
                  <div className={styles.dropdownMenu}>
                    {statuses.map((status) => (
                      <div
                        key={status.value}
                        className={`${styles.dropdownItem} ${statusFilter === status.value ? styles.dropdownItemActive : ''}`}
                        onClick={() => {
                          setStatusFilter(status.value as any)
                          setShowStatusDropdown(false)
                        }}
                      >
                        {status.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className={styles.customSelect}>
                <button 
                  className={styles.selectButton}
                  onClick={() => {
                    setShowRoleDropdown(!showRoleDropdown)
                    setShowStatusDropdown(false)
                  }}
                >
                  <span>{getRoleLabel()}</span>
                  <svg width="12" height="8" fill="none" viewBox="0 0 12 8">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#886385" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showRoleDropdown && (
                  <div className={styles.dropdownMenu}>
                    {roles.map((role) => (
                      <div
                        key={role}
                        className={`${styles.dropdownItem} ${roleFilter === role || (roleFilter === 'all' && role === 'All') ? styles.dropdownItemActive : ''}`}
                        onClick={() => {
                          setRoleFilter(role === 'All' ? 'all' : role)
                          setShowRoleDropdown(false)
                        }}
                      >
                        {role}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Staff Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className={styles.nameCell}>
                        <img src={member.avatar} alt={member.name} className={styles.avatar} />
                        <span className={styles.name}>{member.name}</span>
                      </div>
                    </td>
                    <td className={styles.roleCell}>{member.role}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${member.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                        <span className={styles.statusDot}></span>
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.viewButton}
                          onClick={() => handleViewStaff(member)}
                          title="View details"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          className={styles.deleteButton}
                          onClick={() => setDeleteConfirm(member.id)}
                          title="Delete staff member"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Business ID Section */}
          <div className={styles.businessIdSection}>
            <div className={styles.businessIdCard}>
              <div className={styles.businessIdHeader}>
                <h3 className={styles.businessIdTitle}>Business ID</h3>
                <p className={styles.businessIdDescription}>
                  Share this ID with staff members when they sign up. They'll need to enter this ID to join your team.
                </p>
              </div>
              <div className={styles.businessIdDisplay}>
                <code className={styles.businessIdCode}>{businessId}</code>
                <button 
                  className={styles.copyButton} 
                  onClick={handleCopyBusinessId}
                  title="Copy to clipboard"
                >
                  {copySuccess ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Member Modal - Shows Business ID */}
      {showBusinessIdModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBusinessIdModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Staff Member</h2>
              <button className={styles.closeButton} onClick={() => setShowBusinessIdModal(false)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.businessIdModalContent}>
                <p className={styles.businessIdModalText}>
                  To add a new staff member, share your <strong>Business ID</strong> with them. 
                  They'll need to enter this ID when they sign up to join your team.
                </p>
                <div className={styles.businessIdDisplay}>
                  <code className={styles.businessIdCode}>{businessId}</code>
                  <button 
                    className={styles.copyButton} 
                    onClick={handleCopyBusinessId}
                    title="Copy to clipboard"
                  >
                    {copySuccess ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                {copySuccess && <p className={styles.copySuccessMessage}>✓ Copied to clipboard!</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <svg width="48" height="48" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className={styles.confirmTitle}>Are you sure?</h3>
            <p className={styles.confirmText}>
              Do you want to remove this staff member? This action cannot be undone.
            </p>
            <div className={styles.confirmButtons}>
              <button 
                className={styles.cancelButton}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteButton}
                onClick={() => handleDeleteStaff(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Details Modal */}
      {selectedStaff && (
        <div className={styles.modalOverlay} onClick={() => setSelectedStaff(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Staff Details</h2>
              <button className={styles.closeButton} onClick={() => setSelectedStaff(null)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.staffDetailHeader}>
                <img src={selectedStaff.avatar} alt={selectedStaff.name} className={styles.modalAvatar} />
                <div>
                  <h3 className={styles.modalName}>{selectedStaff.name}</h3>
                  <p className={styles.modalRole}>{selectedStaff.role}</p>
                </div>
              </div>
              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span className={styles.detailValue}>{selectedStaff.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone:</span>
                  <span className={styles.detailValue}>{selectedStaff.phone}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span className={`${styles.statusBadge} ${selectedStaff.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    <span className={styles.statusDot}></span>
                    {selectedStaff.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
