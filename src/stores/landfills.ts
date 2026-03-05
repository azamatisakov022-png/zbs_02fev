import { reactive } from 'vue'
import api, { silentApi } from '../api/client'

export type LandfillType = 'sanitary' | 'unauthorized' | 'sorting'
export type LandfillStatus = 'active' | 'closed' | 'recultivation'

export interface WasteAcceptance {
  category: string
  hazardClass: string
  acceptedPerYear: number
  limitPerYear: number
}

export interface LandfillInfrastructure {
  fencing: boolean
  weighControl: boolean
  monitoring: boolean
  drainage: boolean
  leachateCollection: boolean
  fireSafety: boolean
  ecoMonitoring: boolean
}

export interface LandfillEquipment {
  trucks: number
  excavators: number
  tractors: number
  bulldozers: number
}

export interface MorphologicalComposition {
  plastic: number
  paper: number
  glass: number
  food: number
  other: number
}

export interface Landfill {
  id: number
  name: string
  type: LandfillType
  status: LandfillStatus
  operator: string
  region: string
  district: string
  settlement: string
  address: string
  lat: number
  lng: number
  openYear: number
  expiryYear: number
  hazardClasses: string[]
  designCapacity: number   // тыс. тонн
  currentVolume: number    // тыс. тонн
  monthlyIntake: number[]  // 12 months of data (tons per month)
  wasteAcceptance: WasteAcceptance[]
  infrastructure: LandfillInfrastructure
  permits: {
    operationPermit: { number: string; date: string; expiry: string }
    ecoConclusion: { number: string; date: string }
  }
  documents: { name: string; date: string; size: string }[]
  // Extended fields (from EmployeeLandfills)
  population: number           // тыс. чел.
  servicedPopulation: number   // тыс. чел.
  tariffPhysical: number       // сом (тариф для физ. лиц)
  tariffLegal: number          // сом (тариф для юр. лиц)
  dailyVolume: number          // тонн/день
  wasteSchedule: string        // график завоза ТБО
  equipment: LandfillEquipment
  morphology: MorphologicalComposition
  landCategory: string
}

let nextId = 1

const state = reactive<{ landfills: Landfill[]; loading: boolean }>({
  loading: false,
  landfills: [],
})

async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/landfills')
    if (Array.isArray(data)) {
      state.landfills = data
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

function addLandfill(data: Omit<Landfill, 'id'>): Landfill {
  const landfill: Landfill = { id: nextId++, ...data }
  state.landfills.push(landfill)
  silentApi.post('/landfills', data).catch(() => {})
  return landfill
}

function updateLandfill(id: number, updates: Partial<Landfill>) {
  const idx = state.landfills.findIndex(l => l.id === id)
  if (idx !== -1) {
    state.landfills[idx] = { ...state.landfills[idx], ...updates }
  }
  silentApi.put(`/landfills/${id}`, updates).catch(() => {})
}

function getLandfillById(id: number): Landfill | undefined {
  return state.landfills.find(l => l.id === id)
}

function getActiveLandfills(): Landfill[] {
  return state.landfills.filter(l => l.status === 'active')
}

function getLandfillsByRegion(region: string): Landfill[] {
  return state.landfills.filter(l => l.region === region)
}

function getLandfillsByType(type: LandfillType): Landfill[] {
  return state.landfills.filter(l => l.type === type)
}

function getLandfillsByStatus(status: LandfillStatus): Landfill[] {
  return state.landfills.filter(l => l.status === status)
}

function getTotalDesignCapacity(): number {
  return state.landfills.reduce((sum, l) => sum + l.designCapacity, 0)
}

function getTotalCurrentVolume(): number {
  return state.landfills.reduce((sum, l) => sum + l.currentVolume, 0)
}

function getAverageFillLevel(): number {
  if (state.landfills.length === 0) return 0
  const total = state.landfills.reduce((sum, l) => sum + getFillPercent(l), 0)
  return Math.round(total / state.landfills.length)
}

function getOverfilledCount(): number {
  return state.landfills.filter(l => getFillPercent(l) > 100).length
}

export function getFillPercent(l: Landfill): number {
  if (l.designCapacity === 0) return 0
  return Math.round((l.currentVolume / l.designCapacity) * 100)
}

export function getFillColor(percent: number): string {
  if (percent > 85) return 'red'
  if (percent >= 60) return 'yellow'
  return 'green'
}

function getForGisMap() {
  return state.landfills.map(l => ({
    id: l.id,
    name: l.name,
    lat: l.lat,
    lng: l.lng,
    address: l.address,
    phone: '',
    region: l.region,
    landfillType: l.type === 'sanitary' ? 'Санитарный полигон' : 'Несанитарный полигон',
    area: l.designCapacity + ' тыс. т',
    capacity: (l.designCapacity * 1000).toLocaleString('ru-RU') + ' т',
    fillLevel: getFillPercent(l) + '%',
    status: l.status,
  }))
}

export const landfillStore = {
  state,
  fetchAll,
  addLandfill,
  updateLandfill,
  getLandfillById,
  getActiveLandfills,
  getLandfillsByRegion,
  getLandfillsByType,
  getLandfillsByStatus,
  getTotalDesignCapacity,
  getTotalCurrentVolume,
  getAverageFillLevel,
  getOverfilledCount,
  getForGisMap,
}
