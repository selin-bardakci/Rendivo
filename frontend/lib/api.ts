import axios from 'axios'
import Cookies from 'js-cookie'

const TOKEN_KEY = 'rendivo_jwt'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_KEY)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Business API
export const businessApi = {
  getAll: (params?: { search?: string; services?: string }) => 
    api.get('/businesses', { params }),
  
  getById: (id: number | string) => 
    api.get(`/businesses/${id}`),
  
  getStaff: (businessId: number | string) => 
    api.get(`/businesses/${businessId}/staff`),
  
  getServices: (businessId: number | string) => 
    api.get(`/businesses/${businessId}/services`),
}

// Service API
export const serviceApi = {
  create: (data: any) => api.post('/services', data),
  getOwnerServices: () => api.get('/services'),
  update: (id: number, data: any) => api.put(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
}

// Appointment API
export const appointmentApi = {
  create: (data: any) => api.post('/appointments', data),
  getAll: () => api.get('/appointments'),
  getById: (id: number) => api.get(`/appointments/${id}`),
  cancel: (id: number) => api.delete(`/appointments/${id}`),
  
  // Business owner endpoints
  getBusinessAppointments: () => api.get('/business/appointments'),
  updateStatus: (id: number, status: string) => 
    api.patch(`/business/appointments/${id}/status`, { status }),
  
  // Staff member endpoints
  getStaffAppointments: () => api.get('/staff/appointments'),
}

export default api
