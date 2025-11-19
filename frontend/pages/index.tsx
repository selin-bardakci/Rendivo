import Layout from '../components/Layout'
import styles from '../styles/welcome.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if there's a hash in the URL (e.g., /#features)
    if (router.asPath.includes('#features')) {
      // Small delay to ensure the page has loaded
      setTimeout(() => {
        const featuresSection = document.getElementById('features')
        if (featuresSection) {
          const headerHeight = 100
          const elementPosition = featuresSection.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [router.asPath])

  return (
    <Layout>
      <div className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <Image src="/Homepage.jpg" alt="Hero" fill priority className={styles.heroImage} />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Effortless Appointments, Beautifully Managed.</h1>
          <p className={styles.lead}>
            Rendivo is the simple, chic way for businesses to manage bookings
            <br />
            and for clients to discover and schedule their next favorite service.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/signup" legacyBehavior><a className={styles.ctaPrimary}>Get Started</a></Link>
          </div>
        </div>
      </div>

      <section id="features" className={styles.featuresSection}>
        <div className="container">
          <div className={styles.featuresHeader}>
            <h2>Everything you need, nothing you don't</h2>
            <p className={styles.sub}>Explore the features that make managing appointments a breeze for businesses and a delight for clients.</p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.icon}>
                <Image src="/ikonlar/calendar.svg" alt="Calendar icon" width={28} height={28} />
              </div>
              <div>
                <h3>Effortless Booking</h3>
                <p>Allow clients to book appointments 24/7 through your personalized booking page.</p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.icon}>
                <Image src="/ikonlar/ring.svg" alt="Notification icon" width={28} height={28} />
              </div>
              <div>
                <h3>Automated Reminders</h3>
                <p>Reduce no-shows with automatic email and SMS reminders for upcoming appointments.</p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.icon}>
                <Image src="/ikonlar/people.svg" alt="People icon" width={28} height={28} />
              </div>
              <div>
                <h3>Client Management</h3>
                <p>Keep track of client history, preferences, and notes all in one secure place.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaBannerInner}>
            <div className={styles.ctaBannerText}>
              <h2>Ready to Simplify Your Schedule?</h2>
              <p>Join Rendivo today and transform how you manage appointments.</p>
            </div>
            <Link href="/signup" legacyBehavior>
              <a className={styles.ctaBannerButton}>
                <span>Sign Up Now</span>
              </a>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
