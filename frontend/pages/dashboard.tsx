import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { getCurrentUser, hasRole } from '../lib/auth'
import { initFirebase, subscribeToPath } from '../lib/firebase'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any>(null)

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      router.push('/login')
      return
    }
    setUser(u)
    // init firebase client
    initFirebase()

    // subscribe to a demo path for realtime updates
    const unsubscribe = subscribeToPath('/demo/messages', (data) => {
      setMessages(data)
    })
    return () => {
      unsubscribe && unsubscribe()
    }
  }, [])

  return (
    <Layout>
      <div className="card">
        <h2>Dashboard</h2>
        <p>Welcome, {user?.email || 'user'}.</p>

        <section>
          <h3>Realtime updates</h3>
          <pre>{JSON.stringify(messages, null, 2)}</pre>
        </section>

        <section>
          <h3>Role-based content</h3>
          {hasRole('admin') ? (
            <div className="card">Admin controls go here.</div>
          ) : (
            <div className="card">Standard user view.</div>
          )}
        </section>
      </div>
    </Layout>
  )
}
