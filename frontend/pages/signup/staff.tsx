import React, { useState } from 'react'
import Layout from '../../components/Layout'
import styles from '../../styles/auth.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function StaffSignup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <Layout>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {/* Header */}
          <div className={styles.authHeader}>
            <h1>Join Your Team on Rendivo</h1>
            <p>
              Enter your details and the Business ID provided by your manager to get started.
            </p>
          </div>

          {/* Form */}
          <form className={styles.authForm}>
            {/* Full Name */}
            <div className={styles.formGroup}>
              <label htmlFor="full-name">Full Name</label>
              <input
                type="text"
                id="full-name"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <Image src="/ikonlar/openeye.svg" alt="Hide password" width={20} height={20} /> : <Image src="/ikonlar/closedeye.svg" alt="Show password" width={20} height={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <Image src="/ikonlar/openeye.svg" alt="Hide password" width={20} height={20} /> : <Image src="/ikonlar/closedeye.svg" alt="Show password" width={20} height={20} />}
                </button>
              </div>
            </div>

            {/* Business ID */}
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="business-id">Business ID</label>
                <div 
                  className={styles.infoIcon}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor">
                    <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                  </svg>
                  {showTooltip && (
                    <div className={styles.tooltip}>
                      Your manager will provide you with a unique Business ID to join the team.
                    </div>
                  )}
                </div>
              </div>
              <input
                type="text"
                id="business-id"
                placeholder="Enter your Business ID"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className={styles.submitButton}>
              Create Account &amp; Join Business
            </button>
          </form>

          {/* Footer Links */}
          <div className={styles.authFooter}>
            <p>
              Already have an account? <Link href="/login">Sign In</Link>
            </p>
          </div>

          {/* Terms */}
          <div className={styles.authTerms}>
            <p>
              By creating an account, you agree to our{' '}
              <Link href="/terms" className={styles.termsLink}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className={styles.termsLink}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
