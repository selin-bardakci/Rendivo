import Cookies from 'js-cookie'
import jwt_decode from 'jwt-decode'
import api from './api'

const TOKEN_KEY = 'rendivo_jwt'

export async function login(email: string, password: string) {
  // Expects backend /auth/login returning { token }
  const resp = await api.post('/auth/login', { email, password })
  const { token } = resp.data
  // NOTE: Prefer httpOnly cookies set from server. For demo we store in cookie.
  Cookies.set(TOKEN_KEY, token)
  return token
}

export function logout() {
  Cookies.remove(TOKEN_KEY)
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function getCurrentUser<T = any>(): T | null {
  const token = getToken()
  if (!token) return null
  try {
    return jwt_decode<T>(token)
  } catch (err) {
    return null
  }
}

export function hasRole(role: string): boolean {
  const user: any = getCurrentUser()
  if (!user) return false
  const roles = user.roles || user.role || []
  if (Array.isArray(roles)) return roles.includes(role)
  return roles === role
}
