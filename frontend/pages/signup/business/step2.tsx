import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import styles from '../../../styles/businessSignup.module.css'

export default function BusinessSignupStep2() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    businessName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
    publicEmail: '',
    logoUrl: '' // Placeholder for future file upload
  })

  useEffect(() => {
    // Load Step 1 data to verify user came from step 1
    const step1Data = sessionStorage.getItem('businessSignupStep1')
    if (!step1Data) {
      router.push('/signup/business/step1')
    }
  }, [router])

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    // Save to session storage
    sessionStorage.setItem('businessSignupStep2', JSON.stringify(formData))
    router.push('/signup/business/step3')
  }

  return (
    <Layout noFooterMargin>
      <div className={styles.pageContainer}>
        <main className={`${styles.mainContent} ${styles.wideLayout}`}>
          {/* Page Heading */}
          <div className={styles.pageHeader}>
            <h1>Set Up Your Business Profile</h1>
            <p>This information will be visible to your clients on your booking page.</p>
          </div>

          {/* Form Card */}
          <div className={styles.formCard}>
            {/* Progress Bar */}
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <p className={styles.progressText}>Step 2 of 3: Business Details</p>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: '66%' }}></div>
              </div>
            </div>

            {/* Form Content */}
            <div className={styles.formContent}>
              <h2 className={styles.sectionTitle}>Business Information</h2>

              <form onSubmit={handleNext} className={styles.form}>
                {/* Business Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="business-name">Business Name</label>
                  <input
                    type="text"
                    id="business-name"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>

                {/* Address Section */}
                <div className={styles.addressSection}>
                  <h3 className={styles.subsectionTitle}>Business Address</h3>
                  
                  {/* Street Address */}
                  <div className={styles.formGroup}>
                    <label htmlFor="street-address">Street Address</label>
                    <input
                      type="text"
                      id="street-address"
                      placeholder="e.g. 123 Main St"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      required
                    />
                  </div>

                  {/* City, State, Postal Code - Grid */}
                  <div className={styles.gridThree}>
                    <div className={styles.formGroup}>
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        placeholder="Your city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="state">State / Province</label>
                      <input
                        type="text"
                        id="state"
                        placeholder="Your state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="postal-code">Postal Code</label>
                      <input
                        type="text"
                        id="postal-code"
                        placeholder="Your postal code"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className={styles.contactSection}>
                  <h3 className={styles.subsectionTitle}>Contact Information</h3>
                  
                  {/* Phone & Email - Grid */}
                  <div className={styles.gridTwo}>
                    <div className={styles.formGroup}>
                      <label htmlFor="phone-number">Phone Number</label>
                      <input
                        type="tel"
                        id="phone-number"
                        placeholder="(123) 456-7890"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="public-email">Public Email</label>
                      <input
                        type="email"
                        id="public-email"
                        placeholder="contact@business.com"
                        value={formData.publicEmail}
                        onChange={(e) => setFormData({ ...formData, publicEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Upload Placeholder */}
                <div className={styles.logoSection}>
                  <h3 className={styles.subsectionTitle}>
                    Business Logo <span className={styles.optionalText}>(Optional)</span>
                  </h3>
                  <div className={styles.uploadPlaceholder}>
                    <div className={styles.uploadIcon}>📁</div>
                    <p className={styles.uploadText}>Logo upload coming soon</p>
                    <p className={styles.uploadSubtext}>You can add your business logo later from settings</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                  <Link href="/signup/business/step1" className={styles.backButton}>
                    Back
                  </Link>
                  <button type="submit" className={styles.nextButton}>
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <footer className={styles.pageFooter}>
            <p>
              Need Help? <Link href="/contact">Contact Support</Link>
            </p>
          </footer>
        </main>
      </div>
    </Layout>
  )
}
