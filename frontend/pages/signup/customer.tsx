import React, { useState } from 'react'
import Layout from '../../components/Layout'
import styles from '../../styles/auth.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function CustomerSignup() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  })

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
            <h1>Create your account</h1>
            <p>Start managing your appointments with ease.</p>
          </div>

          {/* Form */}
          <form className={styles.authForm}>
            {/* First Name & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label htmlFor="first-name">First Name</label>
                <input
                  type="text"
                  id="first-name"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label htmlFor="last-name">Last Name</label>
                <input
                  type="text"
                  id="last-name"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
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
              />
            </div>

            {/* Phone */}
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                placeholder="(123) 456-7890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setFormData({ ...formData, password: e.target.value })
                  }}
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
            <button type="submit" className={styles.submitButton}>
              Create Account
            </button>
          </form>

          {/* Footer Links */}
          <div className={styles.authFooter}>
            <p>
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
