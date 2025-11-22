import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import styles from '../../../styles/businessSignup.module.css'

export default function BusinessSignupStep1() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreedToTerms: false
  })

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    // Save to session storage or state management
    sessionStorage.setItem('businessSignupStep1', JSON.stringify(formData))
    router.push('/signup/business/step2')
  }

  // Password strength calculator
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, text: '', color: '' }
    if (pwd.length < 6) return { strength: 1, text: 'Weak password', color: '#ef4444' }
    if (pwd.length < 10) return { strength: 2, text: 'Medium password', color: '#f59e0b' }
    return { strength: 3, text: 'Strong password', color: '#10b981' }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <Layout noFooterMargin>
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          {/* Page Heading */}
          <div className={styles.pageHeader}>
            <h1>Create your Rendivo account</h1>
            <p>Set up your business profile in just a few simple steps.</p>
          </div>

        {/* Form Card */}
        <div className={styles.formCard}>
          {/* Progress Bar */}
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <p className={styles.progressText}>Step 1 of 3: Account Basics</p>
            </div>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: '33%' }}></div>
            </div>
          </div>

          {/* Form Content */}
          <div className={styles.formContent}>
            <h2 className={styles.sectionTitle}>Let's Get Started!</h2>

            <form onSubmit={handleNext} className={styles.form}>
              {/* Full Name */}
              <div className={styles.formGroup}>
                <label htmlFor="full-name">Full Name</label>
                <input
                  type="text"
                  id="full-name"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setFormData({ ...formData, password: e.target.value })
                    }}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <Image src="/ikonlar/openeye.svg" alt="Hide password" width={20} height={20} />
                    ) : (
                      <Image src="/ikonlar/closedeye.svg" alt="Show password" width={20} height={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className={styles.strengthIndicator}>
                  <div className={styles.strengthBars}>
                    <div 
                      className={styles.strengthBar}
                      style={{ 
                        background: passwordStrength.strength >= 1 ? passwordStrength.color : '#f4f0f4'
                      }}
                    ></div>
                    <div 
                      className={styles.strengthBar}
                      style={{ 
                        background: passwordStrength.strength >= 2 ? passwordStrength.color : '#f4f0f4'
                      }}
                    ></div>
                    <div 
                      className={styles.strengthBar}
                      style={{ 
                        background: passwordStrength.strength >= 3 ? passwordStrength.color : '#f4f0f4'
                      }}
                    ></div>
                  </div>
                  <p style={{ color: passwordStrength.color }}>
                    {passwordStrength.text}
                  </p>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  required
                />
                <label htmlFor="terms">
                  I agree to the{' '}
                  <Link href="/terms">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy">Privacy Policy</Link>.
                </label>
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <Link href="/signup" className={styles.backButton}>
                  Back
                </Link>
                <button type="submit" className={styles.nextButton}>
                  Next Step
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
