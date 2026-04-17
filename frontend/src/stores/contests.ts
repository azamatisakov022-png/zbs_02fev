import { reactive } from 'vue'
import api from '../api/client'
import type {
  ContestStatusType,
  ContestApplicationStatusType,
} from '../constants/statuses'

// ─── Types ────────────────────────────────────────────

export interface Contest {
  id: number
  title: string
  description: string
  conditions?: string
  grantAmount?: number
  grantCurrency?: string
  deadline: string
  status: ContestStatusType
  regulationsFileName?: string
  hasRegulations?: boolean
  applicationsCount?: number
  createdAt: string
  updatedAt: string
}

export interface ContestApplication {
  id: number
  number: string
  contestId: number
  contestTitle: string
  lastName: string
  firstName: string
  middleName?: string
  fullName: string
  phone: string
  email: string
  documentFileName: string
  documentSize?: number
  status: ContestApplicationStatusType
  comment?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ContestApplicationStatusInfo {
  number: string
  contestTitle: string
  status: ContestApplicationStatusType
  comment?: string
  createdAt: string
  reviewedAt?: string
}

// ─── State ────────────────────────────────────────────

const state = reactive<{
  publicContests: Contest[]
  contests: Contest[]
  currentContest: Contest | null
  applications: ContestApplication[]
  currentApplication: ContestApplication | null
  pendingCount: number
  loading: boolean
  error: string | null
}>({
  publicContests: [],
  contests: [],
  currentContest: null,
  applications: [],
  currentApplication: null,
  pendingCount: 0,
  loading: false,
  error: null,
})

// ─── Public API (без auth) ────────────────────────────

async function fetchPublic(): Promise<void> {
  state.loading = true
  state.error = null
  try {
    const { data } = await api.get<Contest[]>('/public/contests')
    state.publicContests = data
  } catch (e: any) {
    state.error = e?.message || 'Не удалось загрузить конкурсы'
  } finally {
    state.loading = false
  }
}

async function fetchPublicById(id: number): Promise<Contest | null> {
  state.loading = true
  state.error = null
  try {
    const { data } = await api.get<Contest>(`/public/contests/${id}`)
    state.currentContest = data
    return data
  } catch (e: any) {
    state.error = e?.response?.data?.message || 'Конкурс не найден'
    return null
  } finally {
    state.loading = false
  }
}

async function submitApplication(
  contestId: number,
  payload: {
    lastName: string
    firstName: string
    middleName?: string
    phone: string
    email: string
    file: File
  }
): Promise<{ number: string; id: number }> {
  const fd = new FormData()
  fd.append('lastName', payload.lastName)
  fd.append('firstName', payload.firstName)
  if (payload.middleName) fd.append('middleName', payload.middleName)
  fd.append('phone', payload.phone)
  fd.append('email', payload.email)
  fd.append('file', payload.file)
  const { data } = await api.post<ContestApplication>(
    `/public/contests/${contestId}/applications`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return { number: data.number, id: data.id }
}

async function checkApplicationStatus(
  number: string,
  email: string
): Promise<ContestApplicationStatusInfo> {
  const { data } = await api.post<ContestApplicationStatusInfo>(
    '/public/contests/applications/check-status',
    { number: number.trim(), email: email.trim() }
  )
  return data
}

// ─── Eco Operator API (auth required) ─────────────────

async function fetchAll(status?: string): Promise<void> {
  state.loading = true
  state.error = null
  try {
    const { data } = await api.get<Contest[]>('/contests', {
      params: status ? { status } : {},
    })
    state.contests = data
  } catch (e: any) {
    state.error = e?.message || 'Ошибка загрузки конкурсов'
  } finally {
    state.loading = false
  }
}

async function fetchById(id: number): Promise<Contest | null> {
  try {
    const { data } = await api.get<Contest>(`/contests/${id}`)
    state.currentContest = data
    return data
  } catch {
    return null
  }
}

async function create(payload: {
  title: string
  description: string
  conditions?: string
  grantAmount?: number
  grantCurrency?: string
  deadline: string
}): Promise<Contest> {
  const { data } = await api.post<Contest>('/contests', payload)
  state.contests.unshift(data)
  return data
}

async function update(id: number, payload: Partial<Contest>): Promise<Contest> {
  const { data } = await api.put<Contest>(`/contests/${id}`, payload)
  const idx = state.contests.findIndex(c => c.id === id)
  if (idx !== -1) state.contests[idx] = data
  state.currentContest = data
  return data
}

async function publish(id: number): Promise<Contest> {
  const { data } = await api.post<Contest>(`/contests/${id}/publish`)
  const idx = state.contests.findIndex(c => c.id === id)
  if (idx !== -1) state.contests[idx] = data
  return data
}

async function close(id: number): Promise<Contest> {
  const { data } = await api.post<Contest>(`/contests/${id}/close`)
  const idx = state.contests.findIndex(c => c.id === id)
  if (idx !== -1) state.contests[idx] = data
  return data
}

async function remove(id: number): Promise<void> {
  await api.delete(`/contests/${id}`)
  state.contests = state.contests.filter(c => c.id !== id)
}

async function uploadRegulations(id: number, file: File): Promise<Contest> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post<Contest>(`/contests/${id}/regulations`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  state.currentContest = data
  return data
}

// ─── Applications (Eco Operator) ──────────────────────

async function fetchApplications(params?: {
  contestId?: number
  status?: string
  search?: string
}): Promise<void> {
  state.loading = true
  state.error = null
  try {
    const { data } = await api.get<ContestApplication[]>('/contests/applications', { params })
    state.applications = data
  } catch (e: any) {
    state.error = e?.message || 'Ошибка загрузки заявок'
  } finally {
    state.loading = false
  }
}

async function fetchApplicationById(id: number): Promise<ContestApplication | null> {
  try {
    const { data } = await api.get<ContestApplication>(`/contests/applications/${id}`)
    state.currentApplication = data
    return data
  } catch {
    return null
  }
}

async function reviewApplication(
  id: number,
  payload: { status: ContestApplicationStatusType; comment?: string }
): Promise<ContestApplication> {
  const { data } = await api.post<ContestApplication>(
    `/contests/applications/${id}/review`,
    payload
  )
  const idx = state.applications.findIndex(a => a.id === id)
  if (idx !== -1) state.applications[idx] = data
  state.currentApplication = data
  return data
}

async function fetchPendingCount(): Promise<void> {
  try {
    const { data } = await api.get<{ count: number }>('/contests/applications/pending-count')
    state.pendingCount = data.count
  } catch {
    state.pendingCount = 0
  }
}

function getDocumentDownloadUrl(applicationId: number): string {
  // axios baseURL прибавится автоматически при использовании api.get,
  // но для прямой ссылки <a href> формируем абсолютный путь
  const base = (api.defaults.baseURL || '').replace(/\/$/, '')
  return `${base}/contests/applications/${applicationId}/document`
}

function getRegulationsDownloadUrl(contestId: number, isPublic = false): string {
  const base = (api.defaults.baseURL || '').replace(/\/$/, '')
  return `${base}${isPublic ? '/public' : ''}/contests/${contestId}/regulations`
}

function getPendingCount(): number {
  return state.pendingCount
}

export const contestStore = {
  state,
  // Public
  fetchPublic,
  fetchPublicById,
  submitApplication,
  checkApplicationStatus,
  // Eco operator
  fetchAll,
  fetchById,
  create,
  update,
  publish,
  close,
  remove,
  uploadRegulations,
  // Applications
  fetchApplications,
  fetchApplicationById,
  reviewApplication,
  fetchPendingCount,
  getPendingCount,
  // URLs
  getDocumentDownloadUrl,
  getRegulationsDownloadUrl,
}
