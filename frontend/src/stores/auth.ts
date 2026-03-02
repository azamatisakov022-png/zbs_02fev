import { reactive, computed } from 'vue'
import api from '../api/client'
import i18n from '../i18n'

export interface AuthUser {
  id: number
  inn: string
  companyName: string
  role: string
  email: string
  phone: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

// Restore from localStorage
function loadFromStorage(): Partial<AuthState> {
  try {
    const token = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const userJson = localStorage.getItem('auth_user')
    const user = userJson ? JSON.parse(userJson) : null
    return { token, refreshToken, user }
  } catch {
    return {}
  }
}

const saved = loadFromStorage()

const state = reactive<AuthState>({
  user: saved.user || null,
  token: saved.token || null,
  refreshToken: saved.refreshToken || null,
  loading: false,
  error: null,
})

const isAuthenticated = computed(() => !!state.token && !!state.user)
const userRole = computed(() => state.user?.role || null)
const userName = computed(() => state.user?.companyName || '')

function saveToStorage() {
  if (state.token) {
    localStorage.setItem('access_token', state.token)
  } else {
    localStorage.removeItem('access_token')
  }
  if (state.refreshToken) {
    localStorage.setItem('refresh_token', state.refreshToken)
  } else {
    localStorage.removeItem('refresh_token')
  }
  if (state.user) {
    localStorage.setItem('auth_user', JSON.stringify(state.user))
  } else {
    localStorage.removeItem('auth_user')
  }
}

// Demo accounts for offline/dev mode (used when backend is unavailable)
const demoAccounts: Record<string, AuthUser> = import.meta.env.VITE_DEMO_MODE === 'true' ? {
  '00000000000001': { id: 1, inn: '00000000000001', companyName: 'ОсОО «ТехПром»', role: 'business', email: 'techprom@demo.kg', phone: '+996555000001' },
  '00000000000002': { id: 2, inn: '00000000000002', companyName: 'ГП Эко Оператор', role: 'eco-operator', email: 'eco@demo.kg', phone: '+996555000002' },
  '00000000000003': { id: 3, inn: '00000000000003', companyName: 'МПРЭТН КР', role: 'employee', email: 'employee@demo.kg', phone: '+996555000003' },
  '00000000000004': { id: 4, inn: '00000000000004', companyName: 'Администратор', role: 'admin', email: 'admin@demo.kg', phone: '+996555000004' },
} : {}

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

async function login(inn: string, password: string): Promise<AuthUser> {
  state.loading = true
  state.error = null

  // Demo mode: if INN matches a demo account, login locally without API
  const demo = demoAccounts[inn]
  if (demo) {
    state.token = 'demo-token-' + demo.role
    state.refreshToken = 'demo-refresh-' + demo.role
    state.user = { ...demo }
    saveToStorage()
    state.loading = false
    return demo
  }

  try {
    const { data } = await api.post('/auth/login', { inn, password })
    state.token = data.token
    state.refreshToken = data.refreshToken
    state.user = data.user
    saveToStorage()
    return data.user
  } catch (err: any) {
    const msg = err.response?.data?.message || (i18n.global.t('error.authError') as string)
    state.error = msg
    throw new Error(msg)
  } finally {
    state.loading = false
  }
}

async function register(payload: {
  inn: string
  password: string
  companyName: string
  legalForm: string
  email: string
  phone: string
}): Promise<AuthUser> {
  state.loading = true
  state.error = null
  try {
    const { data } = await api.post('/auth/register', payload)
    state.token = data.token
    state.refreshToken = data.refreshToken
    state.user = data.user
    saveToStorage()
    return data.user
  } catch (err: any) {
    const msg = err.response?.data?.message || (i18n.global.t('error.registrationError') as string)
    state.error = msg
    throw new Error(msg)
  } finally {
    state.loading = false
  }
}

function logout() {
  state.user = null
  state.token = null
  state.refreshToken = null
  state.error = null
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('auth_user')
}

/** Map backend role string to frontend route prefix */
function getRoleDashboard(role: string): string {
  const routes: Record<string, string> = {
    business: '/business',
    'eco-operator': '/eco-operator',
    ministry: '/employee',
    employee: '/employee',
    admin: '/admin',
  }
  return routes[role] || '/login'
}

export const authStore = {
  state,
  isAuthenticated,
  userRole,
  userName,
  login,
  register,
  logout,
  getRoleDashboard,
}
