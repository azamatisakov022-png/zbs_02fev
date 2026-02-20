import { reactive } from 'vue'
import api from '../api/client'

// ─── Types ───────────────────────────────────────────────────────────────────

export type DumpStatus = 'discovered' | 'liquidating' | 'liquidated'

export interface Dump {
  id: number
  name: string
  region: string
  district: string
  address: string
  lat: number
  lng: number
  area: number // ga
  discoveryDate: string
  dumpStatus: DumpStatus
  responsibleAuthority: string
  notes: string
  photos: string[]
}

// ─── Status label helper ─────────────────────────────────────────────────────

const statusLabels: Record<DumpStatus, string> = {
  discovered: 'Обнаружена',
  liquidating: 'Ликвидируется',
  liquidated: 'Ликвидирована',
}

export function getDumpStatusLabel(status: DumpStatus): string {
  return statusLabels[status]
}

// ─── Merged data (EmployeeMap + gis-map-data, re-numbered 1..13) ────────────

let nextId = 1

const state = reactive<{ dumps: Dump[]; loading: boolean }>({
  loading: false,
  dumps: [],
})

// ─── Store methods ───────────────────────────────────────────────────────────

async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/dumps')
    if (Array.isArray(data)) {
      state.dumps = data
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

function addDump(data: Omit<Dump, 'id'>): Dump {
  const dump: Dump = { id: nextId++, ...data }
  state.dumps.push(dump)
  api.post('/dumps', data).catch(() => {})
  return dump
}

function updateDump(id: number, updates: Partial<Dump>) {
  const idx = state.dumps.findIndex(d => d.id === id)
  if (idx !== -1) {
    state.dumps[idx] = { ...state.dumps[idx], ...updates }
  }
  api.put(`/dumps/${id}`, updates).catch(() => {})
}

function deleteDump(id: number) {
  const idx = state.dumps.findIndex(d => d.id === id)
  if (idx !== -1) {
    state.dumps.splice(idx, 1)
  }
  api.delete(`/dumps/${id}`).catch(() => {})
}

function getDumpById(id: number): Dump | undefined {
  return state.dumps.find(d => d.id === id)
}

function getAll(): Dump[] {
  return state.dumps
}

function getByRegion(region: string): Dump[] {
  return state.dumps.filter(d => d.region === region)
}

function getByStatus(status: DumpStatus): Dump[] {
  return state.dumps.filter(d => d.dumpStatus === status)
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const dumpStore = {
  state,
  fetchAll,
  addDump,
  updateDump,
  deleteDump,
  getDumpById,
  getAll,
  getByRegion,
  getByStatus,
}
