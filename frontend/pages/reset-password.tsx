import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import styles from '../styles/login.module.css'
import Image from 'next/image'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password strength calculator
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, text: '', color: '' }
    if (pwd.length < 6) return { strength: 1, text: 'Weak password', color: '#ef4444' }
    if (pwd.length < 10) return { strength: 2, text: 'Medium password', color: '#f59e0b' }
    return { strength: 3, text: 'Strong password', color: '#10b981' }
  }

  const passwordStrength = getPasswordStrength(password)

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          newPassword: password 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Show success message and redirect to login
        router.push('/login?reset=success')
      } else {
        setError(data.message || 'Failed to reset password. Please try again.')
      }
    } catch (err: any) {
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <Layout>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <h1>Invalid Link</h1>
              <p>This password reset link is invalid or has expired.</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1>Create New Password</h1>
            <p>Enter your new password below</p>
          </div>

          <form onSubmit={handleResetPassword} className={styles.loginForm}>
            {/* New Password */}
            <div className={styles.formGroup}>
              <label htmlFor="password">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
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

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '-8px', marginBottom: '16px' }}>
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
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{ paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
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
                  {showConfirmPassword ? <Image src="/ikonlar/openeye.svg" alt="Hide password" width={20} height={20} /> : <Image src="/ikonlar/closedeye.svg" alt="Show password" width={20} height={20} />}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword.length > 0 && (
              <div style={{ 
                fontSize: '13px', 
                marginTop: '-8px',
                marginBottom: '16px',
                color: password === confirmPassword ? '#10b981' : '#ef4444',
                fontWeight: 500
              }}>
                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button 
              type="submit" 
              disabled={loading || password !== confirmPassword || password.length < 6}
              className={styles.loginButton}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
