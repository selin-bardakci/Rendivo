import Cookies from 'js-cookie'
import jwt_decode from 'jwt-decode'
import api from './api'

const TOKEN_KEY = 'rendivo_jwt'

export interface CustomerSignupData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface StaffSignupData {
  email: string
  password: string
  fullName: string
  businessId: string
}

export interface BusinessSignupData {
  email: string
  password: string
  fullName: string
  businessName: string
  businessType?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  website?: string
}

export async function registerCustomer(data: CustomerSignupData) {
  const resp = await api.post('/auth/register/customer', data)
  const { token, user } = resp.data
  Cookies.set(TOKEN_KEY, token)
  return { token, user }
}

export async function registerStaff(data: StaffSignupData) {
  const resp = await api.post('/auth/register/staff', data)
  const { token, user, businessName } = resp.data
  Cookies.set(TOKEN_KEY, token)
  return { token, user, businessName }
}

export async function registerBusiness(data: BusinessSignupData) {
  const resp = await api.post('/auth/register/business', data)
  const { token, user, business } = resp.data
  Cookies.set(TOKEN_KEY, token)
  return { token, user, business }
}

export async function login(email: string, password: string) {
  const resp = await api.post('/auth/login', { email, password })
  const { token, user } = resp.data
  Cookies.set(TOKEN_KEY, token)
  return { token, user }
}

export async function authenticateWithFirebase(
  firebaseToken: string, 
  role: 'customer' | 'staff' | 'business_owner',
  additionalData?: any
) {
  const resp = await api.post('/auth/firebase', {
    firebaseToken,
    role,
    additionalData
  })
  const { token, user } = resp.data
  Cookies.set(TOKEN_KEY, token)
  return { token, user }
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
