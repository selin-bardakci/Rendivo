import Layout from '../components/Layout'
import styles from '../styles/legal.module.css'
import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className={styles.legalContainer}>
        <div className={styles.legalContent}>
          {/* Header */}
          <div className={styles.legalHeader}>
            <h1>Privacy Policy</h1>
            <p className={styles.lastUpdated}>Last updated: November 19, 2025</p>
          </div>

          {/* Introduction */}
          <section className={styles.section}>
            <p className={styles.intro}>
              At Rendivo, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our appointment management platform.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className={styles.section}>
            <h2>1. Information We Collect</h2>
            
            <div className={styles.subsection}>
              <h3>1.1 Information You Provide</h3>
              <p>When you register and use Rendivo, we collect information that you provide directly:</p>
              <ul>
                <li><strong>Business Owners:</strong> Business name, contact information, business address, business category, and credentials</li>
                <li><strong>Staff Members:</strong> Name, email, phone number, working hours, availability, qualifications, and assigned Business ID</li>
                <li><strong>Clients:</strong> Name, email, phone number, and appointment preferences</li>
                <li><strong>All Users:</strong> Login credentials (email and securely hashed passwords)</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>1.2 Automatically Collected Information</h3>
              <ul>
                <li>Log data (IP address, browser type, device information)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Session and authentication information</li>
                <li>Real-time synchronization data for calendar updates</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>1.3 Appointment and Service Data</h3>
              <ul>
                <li>Service details (name, duration, price)</li>
                <li>Appointment bookings (date, time, service, staff, client)</li>
                <li>Staff shifts and availability schedules</li>
                <li>Cancellation history and patterns</li>
              </ul>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section className={styles.section}>
            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li><strong>Service Delivery:</strong> To provide, operate, and maintain the Rendivo platform</li>
              <li><strong>Authentication:</strong> To verify your identity and secure your account</li>
              <li><strong>Booking Management:</strong> To facilitate appointment scheduling, modifications, and cancellations</li>
              <li><strong>Notifications:</strong> To send email confirmations, reminders, and cancellation notices</li>
              <li><strong>Business Operations:</strong> To manage multi-tenant data isolation and enforce role-based permissions</li>
              <li><strong>Real-Time Updates:</strong> To synchronize calendar changes across all your devices</li>
              <li><strong>Analytics:</strong> To understand usage patterns and improve our service</li>
              <li><strong>Security:</strong> To detect, prevent, and address security issues and fraudulent activity</li>
              <li><strong>Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </section>

          {/* 3. Data Isolation and Multi-Tenancy */}
          <section className={styles.section}>
            <h2>3. Data Isolation and Multi-Tenancy</h2>
            <p>
              Rendivo operates as a multi-tenant platform with strict data isolation:
            </p>
            <ul>
              <li>Each business tenant's data is completely isolated from other tenants</li>
              <li>Business Owners can only access data related to their registered business</li>
              <li>Staff members can only view information for the business they are associated with</li>
              <li>Clients can only access their own appointment history and personal information</li>
              <li>Unique Business IDs ensure proper tenant association and data segregation</li>
            </ul>
          </section>

          {/* 4. How We Share Your Information */}
          <section className={styles.section}>
            <h2>4. How We Share Your Information</h2>
            
            <div className={styles.subsection}>
              <h3>4.1 Within Your Business Tenant</h3>
              <ul>
                <li>Business Owners can view staff and client appointment data within their business</li>
                <li>Staff members can view appointments assigned to them</li>
                <li>Clients can view their own appointments and selected service providers</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>4.2 Service Providers</h3>
              <p>We may share information with third-party service providers who assist us in:</p>
              <ul>
                <li>Cloud hosting and database management (MySQL, Firebase Realtime Database)</li>
                <li>Email delivery services for notifications</li>
                <li>Authentication and security services</li>
                <li>Analytics and performance monitoring</li>
              </ul>
              <p>These providers are contractually obligated to protect your data and use it only for specified purposes.</p>
            </div>

            <div className={styles.subsection}>
              <h3>4.3 Legal Requirements</h3>
              <p>We may disclose your information if required by law or in response to valid legal requests.</p>
            </div>

            <div className={styles.subsection}>
              <h3>4.4 What We Don't Share</h3>
              <ul>
                <li>We do not sell your personal information to third parties</li>
                <li>We do not share data across different business tenants</li>
                <li>We do not use your data for advertising purposes</li>
              </ul>
            </div>
          </section>

          {/* 5. Data Security */}
          <section className={styles.section}>
            <h2>5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your information:</p>
            <ul>
              <li><strong>Encryption:</strong> All data transmission uses secure HTTPS/TLS encryption</li>
              <li><strong>Password Security:</strong> Passwords are hashed using secure algorithms and never stored in plain text</li>
              <li><strong>Authentication:</strong> Secure token-based authentication with role verification</li>
              <li><strong>Access Control:</strong> Role-based permissions enforce least-privilege access</li>
              <li><strong>Database Security:</strong> Secure database transactions ensure data integrity</li>
              <li><strong>Backups:</strong> Regular automated backups protect against data loss</li>
              <li><strong>Rate Limiting:</strong> Protection against excessive or malicious requests</li>
            </ul>
          </section>

          {/* 6. Data Retention */}
          <section className={styles.section}>
            <h2>6. Data Retention</h2>
            <ul>
              <li>Active account data is retained for as long as your account remains active</li>
              <li>Appointment history is retained for business record-keeping and analytics purposes</li>
              <li>Deleted accounts and associated data are purged within 90 days, except where retention is required by law</li>
              <li>Backup data is retained according to our regular backup schedule</li>
            </ul>
          </section>

          {/* 7. Your Rights and Choices */}
          <section className={styles.section}>
            <h2>7. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights:</p>
            
            <div className={styles.subsection}>
              <h3>7.1 Access and Portability</h3>
              <ul>
                <li>Request a copy of your personal information</li>
                <li>Export your appointment history and account data</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>7.2 Correction</h3>
              <ul>
                <li>Update your profile information through your dashboard</li>
                <li>Correct inaccurate or incomplete data</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>7.3 Deletion</h3>
              <ul>
                <li>Request deletion of your account and associated data</li>
                <li>Note: Some data may be retained for legal or business purposes</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>7.4 Communication Preferences</h3>
              <ul>
                <li>Manage email notification preferences</li>
                <li>Note: Essential service notifications (confirmations, reminders) cannot be disabled</li>
              </ul>
            </div>
          </section>

          {/* 8. Cookies and Tracking */}
          <section className={styles.section}>
            <h2>8. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies for:</p>
            <ul>
              <li>Session management and authentication</li>
              <li>Remembering your preferences and settings</li>
              <li>Analytics and performance monitoring</li>
              <li>Security and fraud prevention</li>
            </ul>
            <p>You can configure your browser to reject cookies, but this may limit functionality.</p>
          </section>

          {/* 9. Third-Party Services */}
          <section className={styles.section}>
            <h2>9. Third-Party Services</h2>
            <p>Rendivo integrates with third-party services for:</p>
            <ul>
              <li>Real-time calendar synchronization</li>
              <li>Email notifications and communications</li>
              <li>Cloud hosting and infrastructure services</li>
            </ul>
            <p>
              These services have their own privacy policies. We recommend reviewing them to understand 
              how they handle your data.
            </p>
          </section>

          {/* 10. Children's Privacy */}
          <section className={styles.section}>
            <h2>10. Children's Privacy</h2>
            <p>
              Rendivo is not intended for children under the age of 13. We do not knowingly collect 
              personal information from children under 13. If you become aware that a child has provided 
              us with personal information, please contact us, and we will delete such information.
            </p>
          </section>

          {/* 11. International Data Transfers */}
          <section className={styles.section}>
            <h2>11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance with this 
              Privacy Policy and applicable laws.
            </p>
          </section>

          {/* 12. Changes to This Privacy Policy */}
          <section className={styles.section}>
            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes 
              via email or through a prominent notice on the Service. The "Last updated" date at the top 
              indicates when this policy was last revised.
            </p>
          </section>

          {/* 13. Contact Us */}
          <section className={styles.section}>
            <h2>13. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us at:
            </p>
            <p className={styles.contactInfo}>
              <strong>Email:</strong> privacy@rendivo.com<br />
              <strong>Address:</strong> Rendivo Privacy Team<br />
              <strong>Data Protection Officer:</strong> dpo@rendivo.com
            </p>
          </section>

          {/* Footer Links */}
          <div className={styles.legalFooter}>
            <Link href="/terms" className={styles.footerLink}>
              Terms of Service
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
