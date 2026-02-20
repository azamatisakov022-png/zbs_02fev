import { reactive } from 'vue'
import api from '../api/client'

export type CollectionPointStatus = 'active' | 'paused' | 'closed'

export interface CollectionPoint {
  id: number
  name: string
  region: string
  district: string
  address: string
  lat: number
  lng: number
  wasteTypes: string[]
  workingHours: string
  phone: string
  email: string
  organization: string
  status: CollectionPointStatus
  notes: string
}

let nextId = 1

const state = reactive<{ points: CollectionPoint[]; loading: boolean }>({
  loading: false,
  points: [],
})


async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/collection-points')
    if (Array.isArray(data)) {
      state.points = data
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

function addPoint(data: Omit<CollectionPoint, 'id'>): CollectionPoint {
  const point: CollectionPoint = { id: nextId++, ...data }
  state.points.push(point)
  api.post('/collection-points', data).catch(() => {})
  return point
}

function updatePoint(id: number, updates: Partial<CollectionPoint>) {
  const idx = state.points.findIndex(p => p.id === id)
  if (idx !== -1) {
    state.points[idx] = { ...state.points[idx], ...updates }
  }
  api.put(`/collection-points/${id}`, updates).catch(() => {})
}

function deletePoint(id: number) {
  const idx = state.points.findIndex(p => p.id === id)
  if (idx !== -1) {
    state.points.splice(idx, 1)
  }
  api.delete(`/collection-points/${id}`).catch(() => {})
}

function getPointById(id: number): CollectionPoint | undefined {
  return state.points.find(p => p.id === id)
}

function getActivePoints(): CollectionPoint[] {
  return state.points.filter(p => p.status === 'active')
}

function getPointsByRegion(region: string): CollectionPoint[] {
  return state.points.filter(p => p.region === region)
}

function getForGisMap() {
  return state.points.map(p => ({
    id: p.id,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    address: p.address,
    phone: p.phone,
    region: p.region,
    wasteTypes: p.wasteTypes,
    workingHours: p.workingHours,
    operator: p.organization,
    status: p.status,
  }))
}

export const collectionPointStore = {
  state,
  fetchAll,
  addPoint,
  updatePoint,
  deletePoint,
  getPointById,
  getActivePoints,
  getPointsByRegion,
  getForGisMap,
}
