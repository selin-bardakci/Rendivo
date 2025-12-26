import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../../styles/pendingApproval.module.css'
import { getCurrentUser } from '../../lib/auth'

export default function PendingApproval() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    if (currentUser.role !== 'business_owner') {
      router.push('/')
      return
    }

    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    document.cookie = 'rendivo_jwt=; Max-Age=0; path=/'
    router.push('/login')
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h1 className={styles.title}>Application Pending Review</h1>
          
          <p className={styles.message}>
            Thank you for registering your business with Rendivo!
          </p>

          <p className={styles.description}>
            Your business application is currently under review by our team. 
            This process typically takes 1-2 business days.
          </p>

          <div className={styles.infoBox}>
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your business information</li>
              <li>You'll receive an email notification once your application is approved</li>
              <li>After approval, you'll have full access to your business dashboard</li>
              <li>You can then add services, manage staff, and start accepting appointments</li>
            </ul>
          </div>

          <div className={styles.contactBox}>
            <p>
              <strong>Need assistance?</strong>
            </p>
            <p>
              If you have any questions or need to update your application, 
              please contact us at <a href="mailto:support@rendivo.com">support@rendivo.com</a>
            </p>
          </div>

          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
  )
}
