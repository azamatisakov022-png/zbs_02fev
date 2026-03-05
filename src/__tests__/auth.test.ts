import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock api/client before importing auth store
vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  silentApi: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock i18n
vi.mock('../i18n', () => ({
  default: {
    global: {
      t: (key: string) => key,
    },
  },
}))

// Mock import.meta.env
vi.stubEnv('VITE_DEMO_MODE', 'true')

describe('authStore', () => {
  let authStore: any

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear()
    // Reset module cache to get fresh state
    vi.resetModules()
    const mod = await import('../stores/auth')
    authStore = mod.authStore
  })

  describe('initial state', () => {
    it('starts unauthenticated when localStorage is empty', () => {
      expect(authStore.isAuthenticated.value).toBe(false)
      expect(authStore.state.user).toBeNull()
      expect(authStore.state.token).toBeNull()
    })
  })

  describe('login', () => {
    it('demo login sets token and user for known INN', async () => {
      const user = await authStore.login('00000000000001', 'demo')

      expect(user.inn).toBe('00000000000001')
      expect(user.role).toBe('business')
      expect(authStore.isAuthenticated.value).toBe(true)
      expect(authStore.state.token).toContain('demo-token')
      expect(localStorage.getItem('access_token')).toContain('demo-token')
    })

    it('demo login works for eco-operator role', async () => {
      const user = await authStore.login('00000000000002', 'demo')

      expect(user.role).toBe('eco-operator')
      expect(authStore.userRole.value).toBe('eco-operator')
    })

    it('API login calls backend and sets state', async () => {
      const api = (await import('../api/client')).default
      const mockResponse = {
        data: {
          token: 'jwt-token-123',
          refreshToken: 'jwt-refresh-456',
          user: {
            id: 10,
            inn: '02312200210134',
            companyName: 'ООО Тест',
            role: 'business',
            email: 'test@test.com',
            phone: '+996555111111',
          },
        },
      }
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      const user = await authStore.login('02312200210134', 'password123')

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        inn: '02312200210134',
        password: 'password123',
      })
      expect(user.inn).toBe('02312200210134')
      expect(authStore.state.token).toBe('jwt-token-123')
    })

    it('API login error sets state.error', async () => {
      const api = (await import('../api/client')).default
      vi.mocked(api.post).mockRejectedValueOnce({
        response: { data: { message: 'Неверный пароль' } },
      })

      await expect(authStore.login('02312200210134', 'wrong'))
        .rejects.toThrow('Неверный пароль')

      expect(authStore.state.error).toBe('Неверный пароль')
      expect(authStore.state.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears all auth state and localStorage', async () => {
      // Login first
      await authStore.login('00000000000001', 'demo')
      expect(authStore.isAuthenticated.value).toBe(true)

      authStore.logout()

      expect(authStore.state.user).toBeNull()
      expect(authStore.state.token).toBeNull()
      expect(authStore.state.refreshToken).toBeNull()
      expect(authStore.isAuthenticated.value).toBe(false)
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })
  })

  describe('getRoleDashboard', () => {
    it('returns correct paths for each role', () => {
      expect(authStore.getRoleDashboard('business')).toBe('/business')
      expect(authStore.getRoleDashboard('eco-operator')).toBe('/eco-operator')
      expect(authStore.getRoleDashboard('admin')).toBe('/admin')
      expect(authStore.getRoleDashboard('ministry')).toBe('/employee')
      expect(authStore.getRoleDashboard('employee')).toBe('/employee')
    })

    it('returns /login for unknown role', () => {
      expect(authStore.getRoleDashboard('unknown')).toBe('/login')
    })
  })

  describe('register', () => {
    it('calls API and sets auth state on success', async () => {
      const api = (await import('../api/client')).default
      const mockResponse = {
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh',
          user: {
            id: 5,
            inn: '99999999999999',
            companyName: 'Новая Компания',
            role: 'business',
            email: 'new@test.com',
            phone: '+996700000000',
          },
        },
      }
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      const user = await authStore.register({
        inn: '99999999999999',
        password: 'pass123',
        companyName: 'Новая Компания',
        legalForm: 'ОсОО',
        email: 'new@test.com',
        phone: '+996700000000',
      })

      expect(user.companyName).toBe('Новая Компания')
      expect(authStore.state.token).toBe('new-token')
    })
  })
})
