import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import styles from '../../styles/adminDashboard.module.css'
import api from '../../lib/api'
import { getCurrentUser } from '../../lib/auth'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('pending')
  const [error, setError] = useState<string | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'admin') {
      router.push('/')
      return
    }

    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, businessesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/businesses${filter !== 'all' ? `?status=${filter}` : ''}`)
      ])
      setStats(statsRes.data)
      setBusinesses(businessesRes.data)
    } catch (err: any) {
      console.error('Error fetching admin data:', err)
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (businessId: number) => {
    if (!confirm('Are you sure you want to approve this business?')) return

    try {
      await api.patch(`/admin/businesses/${businessId}/approve`)
      alert('Business approved successfully!')
      fetchData()
    } catch (err: any) {
      console.error('Error approving business:', err)
      alert(err?.response?.data?.message || 'Failed to approve business')
    }
  }

  const handleReject = (business: any) => {
    setSelectedBusiness(business)
    setShowRejectModal(true)
    setRejectionReason('')
  }

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      await api.patch(`/admin/businesses/${selectedBusiness.id}/reject`, {
        reason: rejectionReason
      })
      alert('Business rejected successfully!')
      setShowRejectModal(false)
      setSelectedBusiness(null)
      setRejectionReason('')
      fetchData()
    } catch (err: any) {
      console.error('Error rejecting business:', err)
      alert(err?.response?.data?.message || 'Failed to reject business')
    }
  }

  if (loading && !stats) {
    return (
      <Layout>
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.container}>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Manage business approvals and system users</p>
        </header>

        {/* Stats Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Businesses</h3>
              <p className={styles.statNumber}>{stats.businesses.total}</p>
              <div className={styles.statBreakdown}>
                <span>✓ Approved: {stats.businesses.approved}</span>
                <span>⏳ Pending: {stats.businesses.pending}</span>
                <span>✕ Rejected: {stats.businesses.rejected}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <h3>Total Users</h3>
              <p className={styles.statNumber}>{stats.users.total}</p>
              <div className={styles.statBreakdown}>
                <span>Customers: {stats.users.customers}</span>
                <span>Staff: {stats.users.staff}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button
            className={filter === 'pending' ? styles.activeTab : styles.tab}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats?.businesses.pending || 0})
          </button>
          <button
            className={filter === 'approved' ? styles.activeTab : styles.tab}
            onClick={() => setFilter('approved')}
          >
            Approved ({stats?.businesses.approved || 0})
          </button>
          <button
            className={filter === 'rejected' ? styles.activeTab : styles.tab}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({stats?.businesses.rejected || 0})
          </button>
          <button
            className={filter === 'all' ? styles.activeTab : styles.tab}
            onClick={() => setFilter('all')}
          >
            All Businesses
          </button>
        </div>

        {/* Business List */}
        <div className={styles.businessList}>
          {businesses.length === 0 ? (
            <p className={styles.emptyState}>No businesses found</p>
          ) : (
            businesses.map((business) => (
              <div key={business.id} className={styles.businessCard}>
                <div className={styles.businessHeader}>
                  <div>
                    <h3 className={styles.businessName}>{business.businessName}</h3>
                    <p className={styles.businessType}>{business.businessType || 'General'}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[business.approvalStatus]}`}>
                    {business.approvalStatus}
                  </span>
                </div>

                <div className={styles.businessDetails}>
                  <div className={styles.detailRow}>
                    <strong>Owner:</strong> {business.owner?.fullName || business.owner?.email}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Email:</strong> {business.email || business.owner?.email}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Phone:</strong> {business.phone || 'N/A'}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Location:</strong> {business.city && business.state ? `${business.city}, ${business.state}` : 'N/A'}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Business ID:</strong> {business.businessId}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Registered:</strong> {new Date(business.createdAt).toLocaleDateString()}
                  </div>
                  {business.approvedAt && (
                    <div className={styles.detailRow}>
                      <strong>Approved:</strong> {new Date(business.approvedAt).toLocaleDateString()}
                    </div>
                  )}
                  {business.rejectionReason && (
                    <div className={styles.detailRow}>
                      <strong>Rejection Reason:</strong> {business.rejectionReason}
                    </div>
                  )}
                </div>

                {business.approvalStatus === 'pending' && (
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.approveButton}
                      onClick={() => handleApprove(business.id)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleReject(business)}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Reject Business</h2>
              <p className={styles.modalText}>
                You are about to reject <strong>{selectedBusiness?.businessName}</strong>.
                Please provide a reason:
              </p>
              <textarea
                className={styles.textarea}
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className={styles.modalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmRejectButton}
                  onClick={confirmReject}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
