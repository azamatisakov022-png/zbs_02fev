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

let nextId = 14

const state = reactive<{ dumps: Dump[] }>({
  dumps: [
    // 1. EmployeeMap #41 = GIS #401
    {
      id: 1,
      name: 'Свалка у р. Аламедин',
      region: 'Чуйская',
      district: 'Аламединский р-н',
      address: 'Чуйская обл., берег р. Аламедин',
      lat: 42.9456,
      lng: 74.5123,
      area: 2.5,
      discoveryDate: '15.03.2024',
      dumpStatus: 'liquidating',
      responsibleAuthority: 'ГосЭкоТехИнспекция Чуйской обл.',
      notes: 'Бытовые и строительные отходы',
      photos: [],
    },
    // 2. EmployeeMap #42 = GIS #402
    {
      id: 2,
      name: 'Свалка «Токмок»',
      region: 'Чуйская',
      district: 'г. Токмок',
      address: 'Чуйская обл., окрестности г. Токмок',
      lat: 42.8567,
      lng: 75.3123,
      area: 8.0,
      discoveryDate: '20.06.2018',
      dumpStatus: 'liquidating',
      responsibleAuthority: 'ГосЭкоТехИнспекция Чуйской обл.',
      notes: 'Крупная стихийная свалка',
      photos: [],
    },
    // 3. EmployeeMap #43 = GIS #403
    {
      id: 3,
      name: 'Свалка у трассы Бишкек\u2013Ош',
      region: 'Чуйская',
      district: 'Жайылский р-н',
      address: 'Чуйская обл., вдоль трассы, км 45',
      lat: 42.6234,
      lng: 74.3567,
      area: 1.2,
      discoveryDate: '10.08.2024',
      dumpStatus: 'discovered',
      responsibleAuthority: 'ГосЭкоТехИнспекция Чуйской обл.',
      notes: 'Пластик и строительный мусор',
      photos: [],
    },
    // 4. EmployeeMap #44 = GIS #404
    {
      id: 4,
      name: 'Свалка у с. Кара-Балта',
      region: 'Чуйская',
      district: 'Жайылский р-н',
      address: 'Жайылский р-н, с. Кара-Балта',
      lat: 42.8123,
      lng: 73.8456,
      area: 3.0,
      discoveryDate: '05.11.2023',
      dumpStatus: 'liquidated',
      responsibleAuthority: 'ГосЭкоТехИнспекция Чуйской обл.',
      notes: 'Ликвидирована, рекультивация',
      photos: [],
    },
    // 5. EmployeeMap #45 (unique in EmployeeMap)
    {
      id: 5,
      name: 'Свалка у оз. Иссык-Куль',
      region: 'Иссык-Кульская',
      district: 'Тонский р-н',
      address: 'Иссык-Кульская обл., побережье оз. Иссык-Куль',
      lat: 42.5012,
      lng: 77.3456,
      area: 0.8,
      discoveryDate: '22.05.2024',
      dumpStatus: 'liquidating',
      responsibleAuthority: 'ГосЭкоТехИнспекция Иссык-Кульской обл.',
      notes: 'Бытовые отходы на побережье',
      photos: [],
    },
    // 6. EmployeeMap #46 = GIS #407
    {
      id: 6,
      name: 'Свалка в пригороде Ош',
      region: 'Ошская',
      district: 'Кара-Сууйский р-н',
      address: 'Ошская обл., Кара-Сууйский р-н',
      lat: 40.4812,
      lng: 72.6789,
      area: 5.2,
      discoveryDate: '03.02.2023',
      dumpStatus: 'liquidating',
      responsibleAuthority: 'ГосЭкоТехИнспекция Ошской обл.',
      notes: 'Смешанные отходы, рядом жилмассив',
      photos: [],
    },
    // 7. EmployeeMap #47 = GIS #408
    {
      id: 7,
      name: 'Свалка у Кызыл-Кия',
      region: 'Баткенская',
      district: 'г. Кызыл-Кия',
      address: 'Баткенская обл., г. Кызыл-Кия',
      lat: 40.2567,
      lng: 72.1234,
      area: 2.0,
      discoveryDate: '18.07.2024',
      dumpStatus: 'discovered',
      responsibleAuthority: 'ГосЭкоТехИнспекция Баткенской обл.',
      notes: 'Строительные и промышленные отходы',
      photos: [],
    },
    // 8. EmployeeMap #48 = GIS #409
    {
      id: 8,
      name: 'Свалка у Майлуу-Суу',
      region: 'Джалал-Абадская',
      district: 'г. Майлуу-Суу',
      address: 'Джалал-Абадская обл., г. Майлуу-Суу',
      lat: 41.2623,
      lng: 72.4512,
      area: 3.5,
      discoveryDate: '12.01.2022',
      dumpStatus: 'liquidated',
      responsibleAuthority: 'ГосЭкоТехИнспекция Джалал-Абадской обл.',
      notes: 'Ликвидирована (радиоактивные хвосты)',
      photos: [],
    },
    // 9. EmployeeMap #49 = GIS #411
    {
      id: 9,
      name: 'Свалка у с. Кочкорка',
      region: 'Нарынская',
      district: 'Кочкорский р-н',
      address: 'Нарынская обл., Кочкорский р-н, окраина с. Кочкорка',
      lat: 42.2012,
      lng: 75.7567,
      area: 1.8,
      discoveryDate: '07.10.2024',
      dumpStatus: 'discovered',
      responsibleAuthority: 'ГосЭкоТехИнспекция Нарынской обл.',
      notes: 'Бытовые отходы села',
      photos: [],
    },
    // 10. EmployeeMap #50 = GIS #412
    {
      id: 10,
      name: 'Свалка у р. Талас',
      region: 'Таласская',
      district: 'Таласский р-н',
      address: 'Таласская обл., пойма р. Талас',
      lat: 42.5512,
      lng: 72.1823,
      area: 1.0,
      discoveryDate: '19.06.2024',
      dumpStatus: 'liquidating',
      responsibleAuthority: 'ГосЭкоТехИнспекция Таласской обл.',
      notes: 'Сельскохозяйственные отходы',
      photos: [],
    },
    // 11. GIS #405 (unique in GIS)
    {
      id: 11,
      name: 'Свалка у окраины Каракола',
      region: 'Иссык-Кульская',
      district: 'г. Каракол',
      address: 'Иссык-Кульская обл., окраина г. Каракол, у трассы',
      lat: 42.4780,
      lng: 78.4200,
      area: 0.8,
      discoveryDate: '22.05.2024',
      dumpStatus: 'liquidating',
      responsibleAuthority: 'ГосЭкоТехИнспекция Иссык-Кульской обл.',
      notes: 'Бытовые и строительные отходы',
      photos: [],
    },
    // 12. GIS #406 (unique in GIS)
    {
      id: 12,
      name: 'Свалка у р. Нарын',
      region: 'Нарынская',
      district: 'г. Нарын',
      address: 'Нарынская обл., пойма р. Нарын',
      lat: 41.3567,
      lng: 75.8901,
      area: 1.5,
      discoveryDate: '14.09.2024',
      dumpStatus: 'discovered',
      responsibleAuthority: 'ГосЭкоТехИнспекция Нарынской обл.',
      notes: 'Бытовые отходы',
      photos: [],
    },
    // 13. GIS #410 (unique in GIS)
    {
      id: 13,
      name: 'Свалка у трассы Бишкек\u2013Каракол',
      region: 'Иссык-Кульская',
      district: 'Иссык-Кульский р-н',
      address: 'Иссык-Кульская обл., вдоль трассы, км 120',
      lat: 42.6789,
      lng: 75.8234,
      area: 0.6,
      discoveryDate: '28.04.2025',
      dumpStatus: 'discovered',
      responsibleAuthority: 'ГосЭкоТехИнспекция Иссык-Кульской обл.',
      notes: 'Пластиковая тара, пакеты',
      photos: [],
    },
  ],
})

// ─── Store methods ───────────────────────────────────────────────────────────

async function fetchAll() {
  try {
    const { data } = await api.get('/dumps')
    if (Array.isArray(data)) {
      state.dumps = data
    }
  } catch { /* keep local data */ }
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
