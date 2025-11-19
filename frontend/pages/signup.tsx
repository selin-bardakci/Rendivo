import Layout from '../components/Layout'
import styles from '../styles/signup.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function SignUp() {
  return (
    <Layout noFooterMargin={true}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Page Heading */}
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome to Rendivo!</h1>
            <p className={styles.subtitle}>First, tell us who you are.</p>
          </div>

          {/* Role Selection Grid */}
          <div className={styles.roleGrid}>
            {/* Customer Card */}
            <Link href="/signup/customer" className={styles.roleCard}>
              <div className={styles.icon}>
                <Image src="/ikonlar/person.svg" alt="Customer" width={48} height={48} />
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>I'm a Customer</h2>
                <p className={styles.cardDescription}>To book and manage your appointments.</p>
              </div>
            </Link>

            {/* Staff Card */}
            <Link href="/signup/staff" className={styles.roleCard}>
              <div className={styles.icon}>
                <Image src="/ikonlar/staff.svg" alt="Staff" width={48} height={48} />
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>I'm a Staff Member</h2>
                <p className={styles.cardDescription}>To manage your schedule and connect with a business.</p>
              </div>
            </Link>

            {/* Business Owner Card */}
            <Link href="/signup/business" className={styles.roleCard}>
              <div className={styles.icon}>
                <Image src="/ikonlar/store.svg" alt="Business" width={48} height={48} />
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>I'm a Business Owner</h2>
                <p className={styles.cardDescription}>To manage your services, staff, and appointments.</p>
              </div>
            </Link>
          </div>

          {/* Footer Text */}
          <p className={styles.footer}>
            Already a member? <Link href="/login" className={styles.loginLink}>Log in</Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}
