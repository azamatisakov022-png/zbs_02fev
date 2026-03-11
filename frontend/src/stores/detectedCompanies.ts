import { reactive } from 'vue'
import api from '../api/client'
import i18n from '../i18n'

// ── Types ──────────────────────────────────────────────────

export type DetectedCompanySource = 'gts' | 'gns' | 'self'
export type DetectedCompanyStatus = 'new' | 'notified' | 'registered' | 'registration_submitted' | 'under_review' | 'revision_requested' | 'approved' | 'rejected'

export interface DetectedCompany {
  id: number
  inn: string
  companyName: string
  legalForm: string
  legalAddress: string
  director: string
  phone: string
  email: string
  okpoCode: string
  okedCodes: string
  source: DetectedCompanySource
  status: DetectedCompanyStatus
  tnvedCodes: string
  estimatedMass: number
  gnsStatus: string
  assignedEmployeeName: string
  notifiedAt: string
  notes: string
  createdAt: string
}

export interface DetectedCompanyStats {
  total: number
  newCount: number
  gtsCount: number
  gnsCount: number
}

// ── Labels ─────────────────────────────────────────────────

export function getSourceLabel(source: DetectedCompanySource): string {
  return i18n.global.t(`detectedCompanies.source.${source}`)
}
export const sourceColors: Record<DetectedCompanySource, string> = {
  gts: 'bg-blue-100 text-blue-800',
  gns: 'bg-purple-100 text-purple-800',
  self: 'bg-green-100 text-green-800',
}

export function getStatusLabel(status: DetectedCompanyStatus): string {
  return i18n.global.t(`detectedCompanies.status.${status}`)
}
export const statusColors: Record<DetectedCompanyStatus, string> = {
  new: 'bg-red-100 text-red-800',
  notified: 'bg-yellow-100 text-yellow-800',
  registered: 'bg-indigo-100 text-indigo-800',
  registration_submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  revision_requested: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-gray-100 text-gray-700',
}

// ── State ──────────────────────────────────────────────────

const state = reactive<{
  companies: DetectedCompany[]
  loading: boolean
  stats: DetectedCompanyStats
}>({
  companies: [],
  loading: false,
  stats: { total: 0, newCount: 0, gtsCount: 0, gnsCount: 0 },
})

// ── Store API ──────────────────────────────────────────────

async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/detected-companies')
    if (Array.isArray(data)) {
      state.companies = data
    } else if (data?.content && Array.isArray(data.content)) {
      state.companies = data.content
    }
    updateLocalStats()
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

async function fetchStats() {
  try {
    const { data } = await api.get('/detected-companies/stats')
    if (data) {
      state.stats = data
    }
  } catch {
    updateLocalStats()
  }
}

function updateLocalStats() {
  state.stats = {
    total: state.companies.length,
    newCount: state.companies.filter(c => c.status === 'new').length,
    gtsCount: state.companies.filter(c => c.source === 'gts').length,
    gnsCount: state.companies.filter(c => c.source === 'gns').length,
  }
}

function getAll(): DetectedCompany[] {
  return state.companies
}

function getById(id: number): DetectedCompany | undefined {
  return state.companies.find(c => c.id === id)
}

async function notify(id: number): Promise<DetectedCompany | null> {
  try {
    const { data } = await api.post(`/detected-companies/${id}/notify`)
    const idx = state.companies.findIndex(c => c.id === id)
    if (idx >= 0) state.companies[idx] = data
    return data
  } catch {
    return null
  }
}

async function reject(id: number, reason: string): Promise<DetectedCompany | null> {
  try {
    const { data } = await api.post(`/detected-companies/${id}/reject`, { reason })
    const idx = state.companies.findIndex(c => c.id === id)
    if (idx >= 0) state.companies[idx] = data
    return data
  } catch {
    return null
  }
}

async function assignEmployee(id: number, employeeId: number): Promise<DetectedCompany | null> {
  try {
    const { data } = await api.post(`/detected-companies/${id}/assign`, { employeeId })
    const idx = state.companies.findIndex(c => c.id === id)
    if (idx >= 0) state.companies[idx] = data
    return data
  } catch {
    return null
  }
}

async function runGtsMonitoring(): Promise<{ newCompaniesFound: number }> {
  const { data } = await api.post('/detected-companies/run-gts-monitoring')
  return data
}

async function runGnsMonitoring(): Promise<{ newCompaniesFound: number }> {
  const { data } = await api.post('/detected-companies/run-gns-monitoring')
  return data
}

export const detectedCompanyStore = {
  state,
  fetchAll,
  fetchStats,
  getAll,
  getById,
  notify,
  reject,
  assignEmployee,
  runGtsMonitoring,
  runGnsMonitoring,
}
