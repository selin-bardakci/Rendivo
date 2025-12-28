import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import styles from '../styles/login.module.css'
import Link from 'next/link'

export default function ForgotPassword() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Verification code has been sent to your email!')
        setStep('code')
      } else {
        setError(data.message || 'Failed to send code. Please try again.')
      }
    } catch (err: any) {
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to reset password page with temp token
        router.push(`/reset-password?token=${data.tempToken}`)
      } else {
        setError(data.message || 'Invalid or expired code. Please try again.')
      }
    } catch (err: any) {
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1>Reset Password</h1>
            <p>
              {step === 'email' 
                ? 'Enter your email address to receive a verification code' 
                : 'Enter the 6-digit code sent to your email'}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className={styles.loginForm}>
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

              {error && <div className={styles.errorMessage}>{error}</div>}
              {successMessage && (
                <div style={{
                  padding: '12px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  color: '#166534',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {successMessage}
                </div>
              )}

              <button type="submit" disabled={loading} className={styles.loginButton}>
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="code">Verification Code</label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{ 
                    fontSize: '24px', 
                    letterSpacing: '0.5em', 
                    textAlign: 'center',
                    fontWeight: 600
                  }}
                  required
                />
                <p style={{ fontSize: '13px', color: '#886385', marginTop: '8px' }}>
                  Code sent to: <strong>{email}</strong>
                </p>
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <button type="submit" disabled={loading || code.length !== 6} className={styles.loginButton}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError(null)
                }}
                style={{
                  marginTop: '12px',
                  background: 'white',
                  color: '#df84dc',
                  border: '2px solid #df84dc',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s'
                }}
              >
                Use Different Email
              </button>
            </form>
          )}

          <div className={styles.loginFooter}>
            <p>Remember your password? <Link href="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
