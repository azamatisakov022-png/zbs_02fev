import axios from 'axios'
import { toastStore } from '../stores/toast'
import i18n from '../i18n'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Silent API instance — same config but never shows error toasts
const silentApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT token (both instances)
function attachToken(config: any) {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

api.interceptors.request.use(attachToken)
silentApi.interceptors.request.use(attachToken)

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken },
          )
          localStorage.setItem('access_token', data.token)
          localStorage.setItem('refresh_token', data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        } catch {
          // Refresh failed — clear auth
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('auth_user')
          window.location.href = '/login'
        }
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('auth_user')
        window.location.href = '/login'
      }
    }

    // Show toast for non-auth errors
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      const t = i18n.global.t as (key: string) => string
      const msg = error.response?.data?.message || error.message || t('error.serverError')
      toastStore.show({ type: 'error', title: t('error.apiError'), message: msg })
    }

    return Promise.reject(error)
  },
)

// Silent instance — no toasts, just reject
silentApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default api
export { silentApi }
