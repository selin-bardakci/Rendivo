import axios from 'axios'
import Cookies from 'js-cookie'

const TOKEN_KEY = 'rendivo_jwt'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
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

export default api
