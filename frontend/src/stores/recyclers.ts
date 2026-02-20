import { reactive } from 'vue'
import api, { silentApi } from '../api/client'

// ═══ Types ═══

export type RecyclerStatus = 'active' | 'suspended' | 'revoked'
export type InspectionStatus = 'compliant' | 'violations' | 'reinspection_required'

export interface RecyclerCapacity {
  wasteType: string       // group value, e.g. 'group_6'
  capacityTons: number    // max capacity in tons/year
  currentLoadTons: number // current load in tons/year
}

export interface RecyclerDocument {
  name: string
  type: 'pdf' | 'jpg' | 'doc'
  size: string
  date: string
}

export interface Recycler {
  id: number
  // 66. Порядковый номер (= id)
  // 67. Полное наименование
  name: string
  fullName: string
  // 68. ОПФ
  opf: string
  // 69. ИНН
  inn: string
  // 70. Регион, адрес производственной площадки
  region: string
  address: string
  legalAddress: string
  actualAddress: string
  // 71. Руководитель организации
  directorName: string
  directorPosition: string
  // 72. Контактное лицо
  contactPerson: string | null
  contactPosition: string | null
  contactPhone: string
  contactEmail: string
  website: string
  // 73-75. Лицензия
  licenseNumber: string
  licenseDate: string
  licenseExpiry: string
  licenseAuthority: string
  licenseActivities: string[]
  // 76. Экологический паспорт
  ecoPassportNumber: string | null
  ecoPassportDate: string | null
  // 77. Виды отходов
  wasteTypes: string[]
  // 78. Мощности переработки (т/год)
  capacities: RecyclerCapacity[]
  // 79. Технологии переработки
  technologies: Record<string, string>
  // 80. Наличие оборудования
  equipment: string | null
  // 81. Площадь территории (м²)
  productionArea: number | null
  // 82. Количество сотрудников
  employeesCount: string
  // 83. Сертификаты качества
  certifications: string[]
  // 84. Статус проверки
  inspectionStatus: InspectionStatus | null
  // 85. Дата последней проверки
  lastInspectionDate: string | null
  // 86. Замечания проверки
  inspectionRemarks: string | null
  // 87. Дата следующей проверки
  nextInspectionDate: string | null
  // 88. Объём переработки за текущий год (т)
  processedCurrentYear: number
  // 89. Объём переработки за предыдущий год (т)
  processedPreviousYear: number
  // 90. Статус в реестре
  status: RecyclerStatus
  // 91. Причина приостановки/исключения
  suspensionReason: string | null
  // 92. Дата последнего обновления
  updatedAt: string
  // 93. Примечания
  notes: string | null
  // Мета
  addedDate: string
  addedBy: string
  // Допол. отображение
  coordinates: { lat: number; lng: number } | null
  documents: RecyclerDocument[]
  processingMethods: string[]
  rating: number
}

const MPRETK = 'Министерство природных ресурсов, экологии и технического надзора КР'

let nextId = 1

const state = reactive<{ recyclers: Recycler[]; loading: boolean }>({
  loading: false,
  recyclers: [],
})

// ═══ Functions ═══

async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/recyclers')
    if (Array.isArray(data)) {
      state.recyclers = data
    } else if (data?.content && Array.isArray(data.content)) {
      state.recyclers = data.content
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

function addRecycler(data: Omit<Recycler, 'id'>): Recycler {
  const recycler: Recycler = { id: nextId++, ...data }
  state.recyclers.push(recycler)
  silentApi.post('/recyclers', data).catch(() => {})
  return recycler
}

function updateRecycler(id: number, updates: Partial<Recycler>) {
  const idx = state.recyclers.findIndex(r => r.id === id)
  if (idx !== -1) {
    const now = new Date()
    const dateStr = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    state.recyclers[idx] = { ...state.recyclers[idx], ...updates, updatedAt: dateStr }
  }
  silentApi.put(`/recyclers/${id}`, updates).catch(() => {})
}

function toggleStatus(id: number) {
  const recycler = state.recyclers.find(r => r.id === id)
  if (recycler) {
    recycler.status = recycler.status === 'active' ? 'suspended' : 'active'
    const now = new Date()
    recycler.updatedAt = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  silentApi.post(`/recyclers/${id}/toggle-status`).catch(() => {})
}

function getActiveRecyclers(): Recycler[] {
  return state.recyclers.filter(r => r.status === 'active')
}

function getActiveRecyclersByGroup(groupValue: string): Recycler[] {
  return state.recyclers.filter(r => r.status === 'active' && r.wasteTypes.includes(groupValue))
}

function getRecyclerById(id: number): Recycler | undefined {
  return state.recyclers.find(r => r.id === id)
}

function getRecyclerByName(name: string): Recycler | undefined {
  return state.recyclers.find(r => r.name === name)
}

function getCounts() {
  const all = state.recyclers.length
  const active = state.recyclers.filter(r => r.status === 'active').length
  const suspended = state.recyclers.filter(r => r.status === 'suspended').length
  const revoked = state.recyclers.filter(r => r.status === 'revoked').length
  return { all, active, suspended, revoked }
}

function getTotalCapacity(recycler: Recycler): number {
  return recycler.capacities.reduce((sum, c) => sum + c.capacityTons, 0)
}

function getTotalLoad(recycler: Recycler): number {
  return recycler.capacities.reduce((sum, c) => sum + c.currentLoadTons, 0)
}

function getLoadPercent(recycler: Recycler): number {
  const total = getTotalCapacity(recycler)
  if (total === 0) return 0
  return Math.round((getTotalLoad(recycler) / total) * 100)
}

function getCapacityForGroup(recycler: Recycler, groupValue: string): RecyclerCapacity | undefined {
  return recycler.capacities.find(c => c.wasteType === groupValue)
}

function getFreeCapacityForGroup(recycler: Recycler, groupValue: string): number {
  const cap = getCapacityForGroup(recycler, groupValue)
  if (!cap) return 0
  return Math.max(0, cap.capacityTons - cap.currentLoadTons)
}

/** Convert yearly tons to monthly */
function toMonthly(tonsYear: number): number {
  return Math.round(tonsYear / 12)
}

/** Get volume change percent (current vs previous year) */
function getVolumeChangePercent(recycler: Recycler): number {
  if (recycler.processedPreviousYear === 0) return recycler.processedCurrentYear > 0 ? 100 : 0
  return Math.round(((recycler.processedCurrentYear - recycler.processedPreviousYear) / recycler.processedPreviousYear) * 100)
}

/** Status labels per TZ */
function getStatusLabel(status: RecyclerStatus): string {
  switch (status) {
    case 'active': return 'Активен'
    case 'suspended': return 'Приостановлен'
    case 'revoked': return 'Исключён'
  }
}

/** Inspection status labels */
function getInspectionStatusLabel(status: InspectionStatus): string {
  switch (status) {
    case 'compliant': return 'Соответствует требованиям'
    case 'violations': return 'Выявлены нарушения'
    case 'reinspection_required': return 'Требуется повторная проверка'
  }
}

export const recyclerStore = {
  state,
  fetchAll,
  addRecycler,
  updateRecycler,
  toggleStatus,
  getActiveRecyclers,
  getActiveRecyclersByGroup,
  getRecyclerById,
  getRecyclerByName,
  getCounts,
  getTotalCapacity,
  getTotalLoad,
  getLoadPercent,
  getCapacityForGroup,
  getFreeCapacityForGroup,
  toMonthly,
  getVolumeChangePercent,
  getStatusLabel,
  getInspectionStatusLabel,
}
