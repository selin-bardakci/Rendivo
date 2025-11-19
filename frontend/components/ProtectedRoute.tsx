import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { getCurrentUser } from '../lib/auth'

export default function ProtectedRoute({ children }: { children: any }) {
  const router = useRouter()
  useEffect(() => {
    const u = getCurrentUser()
    if (!u) router.push('/login')
  }, [])

  return children
}
