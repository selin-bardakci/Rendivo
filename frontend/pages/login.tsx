import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { login } from '../lib/auth'
import styles from '../styles/login.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const router = useRouter()

  async function handleResendVerification() {
    setResendingEmail(true)
    setResendMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('Verification email has been sent! Please check your inbox.')
      } else {
        setResendMessage(data.message || 'Failed to resend email. Please try again.')
      }
    } catch (error) {
      setResendMessage('An error occurred. Please try again later.')
    } finally {
      setResendingEmail(false)
    }
  }

  async function onSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEmailNotVerified(false)
    setResendMessage('')

    try {
      const response = await login(email, password)
      const { user, approvalStatus } = response
      
      // Redirect based on user role and approval status
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (user.role === 'business_owner') {
        // Check if business is approved
        if (approvalStatus === 'pending') {
          router.push('/business/pending-approval')
        } else if (approvalStatus === 'rejected') {
          setError('Your business application has been rejected. Please contact support.')
          setLoading(false)
          return
        } else {
          router.push('/business/dashboard')
        }
      } else if (user.role === 'staff') {
        router.push('/staff-dashboard')
      } else if (user.role === 'customer') {
        router.push('/appointments')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Login failed'
      
      // Check if error is due to unverified email
      if (err?.response?.status === 403 && errorMessage.toLowerCase().includes('email not verified')) {
        setEmailNotVerified(true)
        setError('Your email address has not been verified yet.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1>Welcome Back</h1>
            <p>Sign in to continue to your account</p>
          </div>
          
          <form onSubmit={onSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input 
                id="email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    color: '#886385',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {showPassword ? <Image src="/ikonlar/openeye.svg" alt="Hide password" width={20} height={20} /> : <Image src="/ikonlar/closedeye.svg" alt="Show password" width={20} height={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
                {emailNotVerified && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #fecaca' }}>
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                      Didn't receive the verification email?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      style={{
                        background: 'white',
                        color: '#991b1b',
                        border: '2px solid #991b1b',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: resendingEmail ? 'not-allowed' : 'pointer',
                        opacity: resendingEmail ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {resendMessage && (
              <div style={{
                padding: '12px',
                background: resendMessage.includes('sent') ? '#f0fdf4' : '#fee2e2',
                border: `1px solid ${resendMessage.includes('sent') ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: '8px',
                color: resendMessage.includes('sent') ? '#166534' : '#dc2626',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                {resendMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={styles.loginButton}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.loginFooter}>
            <p>Don't have an account? <Link href="/signup">Sign up</Link></p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
