import Layout from '../components/Layout'
import styles from '../styles/legal.module.css'
import Link from 'next/link'

export default function TermsOfService() {
  return (
    <Layout>
      <div className={styles.legalContainer}>
        <div className={styles.legalContent}>
          {/* Header */}
          <div className={styles.legalHeader}>
            <h1>Terms of Service</h1>
            <p className={styles.lastUpdated}>Last updated: November 19, 2025</p>
          </div>

          {/* Introduction */}
          <section className={styles.section}>
            <p className={styles.intro}>
              Welcome to Rendivo. By accessing or using our multi-tenant appointment management platform, 
              you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
          </section>

          {/* 1. Acceptance of Terms */}
          <section className={styles.section}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By registering for, accessing, or using Rendivo (the "Service"), you agree to comply with 
              and be legally bound by these Terms of Service, whether you are a Business Owner, Staff Member, 
              Client, or Administrator. If you do not agree to these terms, you must not use the Service.
            </p>
          </section>

          {/* 2. User Roles and Responsibilities */}
          <section className={styles.section}>
            <h2>2. User Roles and Responsibilities</h2>
            <p>Rendivo supports multiple user roles, each with specific rights and responsibilities:</p>
            
            <div className={styles.subsection}>
              <h3>2.1 Business Owners</h3>
              <ul>
                <li>Must provide accurate business information during registration</li>
                <li>Responsible for managing their business profile, services, and staff</li>
                <li>Must assign a unique Business ID for staff member registration</li>
                <li>Subject to manual approval by system administrators</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>2.2 Staff Members</h3>
              <ul>
                <li>Must register using a valid Business ID provided by their employer</li>
                <li>Responsible for maintaining accurate availability and shift information</li>
                <li>Must comply with assigned shifts and service capabilities</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>2.3 Clients</h3>
              <ul>
                <li>Must provide accurate personal information during registration</li>
                <li>Responsible for managing their appointments and honoring bookings</li>
                <li>Must comply with the 30-day booking window limitation</li>
                <li>Subject to cancellation policies as defined by individual businesses</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>2.4 Administrators</h3>
              <ul>
                <li>Have the authority to review, approve, or reject business registrations</li>
                <li>Responsible for maintaining system integrity and enforcing policies</li>
              </ul>
            </div>
          </section>

          {/* 3. Registration and Account Security */}
          <section className={styles.section}>
            <h2>3. Registration and Account Security</h2>
            <ul>
              <li>You must provide accurate, complete, and current information during registration</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized access to your account</li>
              <li>Each user account is personal and may not be shared with others</li>
              <li>We use JWT-based authentication and secure password storage to protect your account</li>
            </ul>
          </section>

          {/* 4. Service Features and Limitations */}
          <section className={styles.section}>
            <h2>4. Service Features and Limitations</h2>
            
            <div className={styles.subsection}>
              <h3>4.1 Booking System</h3>
              <ul>
                <li>Appointments can only be booked within the next 30 calendar days</li>
                <li>The system prevents double-booking through conflict-free slot reservation</li>
                <li>Staff availability and shift constraints are strictly enforced</li>
                <li>Appointment modifications are subject to availability verification</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>4.2 Multi-Tenant Data Isolation</h3>
              <ul>
                <li>Each business's data is strictly isolated from other tenants</li>
                <li>Business Owners can only access data related to their own business</li>
                <li>Staff members can only view information relevant to their assigned business</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>4.3 Real-Time Synchronization</h3>
              <ul>
                <li>Calendar updates propagate in real-time via Firebase Realtime Database</li>
                <li>Updates should reflect within 1 second across all connected clients</li>
                <li>Interactive calendar views are available in day, week, and month formats</li>
              </ul>
            </div>
          </section>

          {/* 5. Notifications */}
          <section className={styles.section}>
            <h2>5. Notifications</h2>
            <p>By using Rendivo, you consent to receive:</p>
            <ul>
              <li>Email confirmations for scheduled appointments</li>
              <li>Email reminders for upcoming appointments</li>
              <li>Email notifications for appointment cancellations</li>
              <li>System notifications regarding your account or service updates</li>
            </ul>
          </section>

          {/* 6. Prohibited Uses */}
          <section className={styles.section}>
            <h2>6. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose or in violation of these Terms</li>
              <li>Attempt to circumvent security measures or gain unauthorized access</li>
              <li>Use automated tools to create excessive booking requests (subject to rate limiting)</li>
              <li>Impersonate another user or provide false information</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to access data belonging to other tenants</li>
            </ul>
          </section>

          {/* 7. Service Availability and Performance */}
          <section className={styles.section}>
            <h2>7. Service Availability</h2>
            <p>
              We strive to maintain high service quality and availability. However, we do not guarantee 
              uninterrupted or error-free service. We reserve the right to modify, suspend, or discontinue 
              any part of the Service with or without notice.
            </p>
          </section>

          {/* 8. Data Backup and Recovery */}
          <section className={styles.section}>
            <h2>8. Data Protection</h2>
            <p>
              We implement regular data backup procedures to protect your information. However, 
              you are responsible for maintaining your own copies of any critical data.
            </p>
          </section>

          {/* 9. Limitation of Liability */}
          <section className={styles.section}>
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Rendivo and its affiliates shall not be liable 
              for any indirect, incidental, special, consequential, or punitive damages, including 
              loss of profits, data, or business opportunities, arising from your use of the Service.
            </p>
          </section>

          {/* 10. Modifications to Terms */}
          <section className={styles.section}>
            <h2>10. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify users 
              of material changes via email or through the Service. Continued use of the Service after 
              such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* 11. Termination */}
          <section className={styles.section}>
            <h2>11. Termination</h2>
            <p>
              We may suspend or terminate your account at our sole discretion, without notice, for 
              conduct that we believe violates these Terms or is harmful to other users, us, or third 
              parties. You may terminate your account at any time by contacting us.
            </p>
          </section>

          {/* 12. Governing Law */}
          <section className={styles.section}>
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the 
              jurisdiction in which Rendivo operates, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* 13. Contact Information */}
          <section className={styles.section}>
            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className={styles.contactInfo}>
              <strong>Email:</strong> legal@rendivo.com<br />
              <strong>Address:</strong> Rendivo Legal Department
            </p>
          </section>

          {/* Footer Links */}
          <div className={styles.legalFooter}>
            <Link href="/privacy" className={styles.footerLink}>
              Privacy Policy
            </Link>
            <span className={styles.separator}>•</span>
            <Link href="/" className={styles.footerLink}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
