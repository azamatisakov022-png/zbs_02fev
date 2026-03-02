import { reactive } from 'vue'
import api from '../api/client'

export interface AnalyticsSummary {
  totalPayers: number
  activePayers: number
  totalCharged: number
  totalCollected: number
  collectionRate: number
  totalRecycled: number
  recyclingRate: number
  pendingCalculations: number
  pendingDeclarations: number
}

export interface IncomeData {
  period: string
  charged: number
  collected: number
  refunded: number
}

export interface RecyclingData {
  wasteGroup: string
  volumeReceived: number
  volumeProcessed: number
  recyclingPercent: number
  norm: number
}

export interface RegionData {
  region: string
  payersCount: number
  recyclersCount: number
  landfillsCount: number
  dumpsCount: number
  totalWaste: number
  totalRecycled: number
}

interface AnalyticsState {
  summary: AnalyticsSummary | null
  income: IncomeData[]
  recycling: RecyclingData[]
  regions: RegionData[]
  loading: boolean
}

const state = reactive<AnalyticsState>({
  summary: null,
  income: [],
  recycling: [],
  regions: [],
  loading: false,
})

async function fetchSummary() {
  try {
    const { data } = await api.get('/analytics/summary')
    state.summary = data
  } catch { /* silent */ }
}

async function fetchIncome(groupBy: string = 'month') {
  try {
    const { data } = await api.get('/analytics/income', { params: { groupBy } })
    if (Array.isArray(data)) {
      state.income = data
    }
  } catch { /* silent */ }
}

async function fetchRecycling() {
  try {
    const { data } = await api.get('/analytics/recycling')
    if (Array.isArray(data)) {
      state.recycling = data
    }
  } catch { /* silent */ }
}

async function fetchRegions() {
  try {
    const { data } = await api.get('/analytics/regions')
    if (Array.isArray(data)) {
      state.regions = data
    }
  } catch { /* silent */ }
}

async function fetchAll(groupBy: string = 'month') {
  state.loading = true
  try {
    await Promise.all([
      fetchSummary(),
      fetchIncome(groupBy),
      fetchRecycling(),
      fetchRegions(),
    ])
  } finally {
    state.loading = false
  }
}

export const analyticsStore = {
  state,
  fetchSummary,
  fetchIncome,
  fetchRecycling,
  fetchRegions,
  fetchAll,
}
