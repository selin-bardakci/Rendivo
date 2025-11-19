import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { login } from '../lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label>Email</label>
            <br />
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Password</label>
            <br />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </Layout>
  )
}
