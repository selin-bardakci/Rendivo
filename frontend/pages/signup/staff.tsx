import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import styles from '../../styles/auth.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { registerStaff } from '../../lib/auth'

export default function StaffSignup() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    businessId: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await registerStaff(formData)
      // Redirect to email verification page with email
      router.push(`/email-verification-sent?email=${encodeURIComponent(formData.email)}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
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
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && (
              <div style={{ 
                padding: '12px', 
                background: '#fee2e2', 
                border: '1px solid #fecaca', 
                borderRadius: '8px', 
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}
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
                placeholder="Enter your email address"
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
                  placeholder="Create a password"
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
                  {showPassword ? <Image src="/ikonlar/openeye.svg" alt="Hide password" width={20} height={20} /> : <Image src="/ikonlar/closedeye.svg" alt="Show password" width={20} height={20} />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '-8px' }}>
                <div style={{ display: 'flex', height: '6px', width: '100%', gap: '6px', borderRadius: '9999px', overflow: 'hidden', background: '#f4f0f4' }}>
                  <div style={{ 
                    height: '100%', 
                    width: '33.333%', 
                    borderRadius: '9999px', 
                    background: passwordStrength.strength >= 1 ? passwordStrength.color : '#f4f0f4',
                    transition: 'background 0.3s ease'
                  }}></div>
                  <div style={{ 
                    height: '100%', 
                    width: '33.333%', 
                    borderRadius: '9999px', 
                    background: passwordStrength.strength >= 2 ? passwordStrength.color : '#f4f0f4',
                    transition: 'background 0.3s ease'
                  }}></div>
                  <div style={{ 
                    height: '100%', 
                    width: '33.333%', 
                    borderRadius: '9999px', 
                    background: passwordStrength.strength >= 3 ? passwordStrength.color : '#f4f0f4',
                    transition: 'background 0.3s ease'
                  }}></div>
                </div>
                <p style={{ 
                  fontSize: '12px', 
                  color: passwordStrength.color,
                  margin: 0,
                  fontWeight: 500
                }}>
                  {passwordStrength.text}
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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
                value={formData.businessId}
                onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                required
              />
            </div>

            {/* Terms Checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingTop: '8px' }}>
              <input
                type="checkbox"
                id="terms"
                style={{
                  width: '16px',
                  height: '16px',
                  marginTop: '2px',
                  borderRadius: '4px',
                  border: '1px solid #e5dce4',
                  cursor: 'pointer',
                  accentColor: '#df84dc'
                }}
                required
              />
              <label htmlFor="terms" style={{ fontSize: '14px', color: '#886385', lineHeight: '1.5', cursor: 'pointer' }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: '#df84dc', fontWeight: 600, textDecoration: 'none' }}>
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" style={{ color: '#df84dc', fontWeight: 600, textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account & Join Business'}
            </button>
          </form>

          {/* Footer Links */}
          <div className={styles.authFooter}>
            <p>
              Already have an account? <Link href="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
