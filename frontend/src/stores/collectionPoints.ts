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

let nextId = 23

const state = reactive<{ points: CollectionPoint[]; loading: boolean }>({
  loading: false,
  points: [
    { id: 1, name: 'Пункт приёма №1', region: 'г. Бишкек', district: 'Первомайский', address: 'ул. Киевская, 45', lat: 42.8821, lng: 74.5823, wasteTypes: ['Пластик', 'Бумага', 'Стекло'], workingHours: '09:00-18:00', phone: '+996 555 12-34-56', email: 'punkt1@eco.kg', organization: 'ОсОО «ЭкоПереработка»', status: 'active', notes: '' },
    { id: 2, name: 'Пункт приёма №2', region: 'г. Бишкек', district: 'Свердловский', address: 'ул. Боконбаева, 78', lat: 42.8567, lng: 74.6012, wasteTypes: ['Пластик', 'Металл', 'Электроника'], workingHours: '10:00-19:00', phone: '+996 555 23-45-67', email: 'punkt2@eco.kg', organization: 'ОсОО «ЭкоПереработка»', status: 'active', notes: '' },
    { id: 3, name: 'Пункт приёма «Ош-1»', region: 'г. Ош', district: 'Центр', address: 'ул. Масалиева, 23', lat: 40.5367, lng: 72.8056, wasteTypes: ['Пластик', 'Бумага'], workingHours: '09:00-17:00', phone: '+996 550 12-34-56', email: 'osh1@eco.kg', organization: 'ОсОО «Ош-Ресайкл»', status: 'active', notes: '' },
    { id: 4, name: 'Пункт приёма «Каракол»', region: 'Иссык-Кульская область', district: 'г. Каракол', address: 'ул. Токтогула, 34', lat: 42.4823, lng: 78.4012, wasteTypes: ['Пластик', 'Стекло'], workingHours: '09:00-16:00', phone: '+996 557 12-34-56', email: 'karakol@eco.kg', organization: 'ОсОО «Иссык-Куль Ресурс»', status: 'active', notes: '' },
    { id: 5, name: 'Пункт приёма №7', region: 'г. Бишкек', district: 'Октябрьский', address: 'мкр. Аламедин, 78', lat: 42.8789, lng: 74.6456, wasteTypes: ['Пластик', 'Бумага', 'Батарейки'], workingHours: '10:00-18:00', phone: '+996 555 78-90-12', email: 'punkt7@eco.kg', organization: 'ОсОО «ГринРесайкл»', status: 'paused', notes: 'Ремонт до 15.02.2025' },
    { id: 6, name: 'Пункт приёма «Джалал-Абад»', region: 'Джалал-Абадская область', district: 'г. Джалал-Абад', address: 'ул. Ленина, 78', lat: 41.0312, lng: 72.9945, wasteTypes: ['Пластик', 'Бумага'], workingHours: '09:00-17:00', phone: '+996 559 12-34-56', email: 'ja@eco.kg', organization: 'ОсОО «Джалал-Эко»', status: 'active', notes: '' },
    { id: 7, name: 'Пункт приёма «Нарын»', region: 'Нарынская область', district: 'г. Нарын', address: 'ул. Ленина, 89', lat: 41.4356, lng: 75.9823, wasteTypes: ['Пластик'], workingHours: '10:00-16:00', phone: '+996 556 12-34-56', email: 'naryn@eco.kg', organization: 'ОсОО «НарынЭко»', status: 'active', notes: '' },
    { id: 8, name: 'Пункт приёма «Талас»', region: 'Таласская область', district: 'г. Талас', address: 'ул. Сарыгулова, 12', lat: 42.5234, lng: 72.2412, wasteTypes: ['Пластик', 'Металл'], workingHours: '09:00-17:00', phone: '+996 551 12-34-56', email: 'talas@eco.kg', organization: 'ОсОО «Талас-Ресайкл»', status: 'active', notes: '' },
    { id: 9, name: 'Пункт приёма «Баткен»', region: 'Баткенская область', district: 'г. Баткен', address: 'ул. Абдыкадырова, 15', lat: 40.0563, lng: 70.8194, wasteTypes: ['Пластик', 'Бумага', 'Стекло'], workingHours: '09:00-17:00', phone: '+996 558 11-22-33', email: 'batken@eco.kg', organization: 'ОсОО «Баткен-Эко»', status: 'active', notes: '' },
    { id: 10, name: 'Пункт приёма «Токмок»', region: 'Чуйская область', district: 'г. Токмок', address: 'ул. Ленина, 120', lat: 42.7644, lng: 75.2886, wasteTypes: ['Пластик', 'Металл', 'Стекло'], workingHours: '09:00-18:00', phone: '+996 552 33-44-55', email: 'tokmok@eco.kg', organization: 'ОсОО «Чуй-Ресайкл»', status: 'active', notes: '' },
    { id: 11, name: 'Пункт приёма «Ош-2»', region: 'Ошская область', district: 'г. Кара-Суу', address: 'ул. Масалиева, 56', lat: 40.7123, lng: 72.8567, wasteTypes: ['Пластик', 'Бумага', 'Текстиль'], workingHours: '09:00-17:00', phone: '+996 550 44-55-66', email: 'osh2@eco.kg', organization: 'ОсОО «Ош-Ресайкл»', status: 'paused', notes: 'Временно приостановлен' },
    { id: 12, name: 'Пункт приёма «Бишкек-Юг»', region: 'г. Бишкек', district: 'Ленинский', address: 'ул. Ахунбаева, 156', lat: 42.8412, lng: 74.5934, wasteTypes: ['Пластик', 'Бумага', 'Стекло', 'Металл', 'Батарейки'], workingHours: '08:00-20:00', phone: '+996 555 99-88-77', email: 'south@eco.kg', organization: 'ОсОО «ГринРесайкл»', status: 'closed', notes: 'Закрыт с 01.01.2025' },
    { id: 13, name: 'ЭкоПункт Бишкек-2', region: 'г. Бишкек', district: 'Ленинский', address: 'ул. Манаса, 57', lat: 42.8712, lng: 74.5567, wasteTypes: ['Пластик', 'Бумага', 'Металл', 'Стекло'], workingHours: '09:00-18:00', phone: '+996 555 45-67-89', email: 'punkt4@eco.kg', organization: 'ОсОО «ЭкоПереработка»', status: 'active', notes: '' },
    { id: 14, name: 'Пункт приёма шин АвтоЭко', region: 'г. Бишкек', district: 'Свердловский', address: 'ул. Южная Магистраль, 88', lat: 42.8345, lng: 74.5789, wasteTypes: ['Шины', 'Металл'], workingHours: '09:00-17:00', phone: '+996 555 56-78-90', email: 'auto@eco.kg', organization: 'ОсОО «АвтоЭко»', status: 'active', notes: '' },
    { id: 15, name: 'Пункт опасных отходов Бишкек', region: 'г. Бишкек', district: 'Первомайский', address: 'ул. Фучика, 12', lat: 42.8923, lng: 74.6234, wasteTypes: ['Батарейки', 'Электроника', 'Опасные отходы'], workingHours: '10:00-16:00', phone: '+996 555 67-89-01', email: 'special@eco.kg', organization: 'ОсОО «СпецУтиль»', status: 'active', notes: '' },
    { id: 16, name: 'ЭкоПункт Бишкек-3 (Аламедин)', region: 'г. Бишкек', district: 'Октябрьский', address: 'мкр. Аламедин-1, 78', lat: 42.8789, lng: 74.6456, wasteTypes: ['Пластик', 'Бумага', 'Батарейки'], workingHours: '10:00-18:00', phone: '+996 555 78-90-12', email: 'punkt3ala@eco.kg', organization: 'ОсОО «ГринРесайкл»', status: 'active', notes: '' },
    { id: 17, name: 'ЭкоПункт Ош-2 (Центр)', region: 'Ошская область', district: 'г. Ош', address: 'ул. Масалиева, 23', lat: 40.5234, lng: 72.8134, wasteTypes: ['Пластик', 'Бумага', 'Батарейки'], workingHours: '09:00-17:00', phone: '+996 550 45-67-89', email: 'osh2c@eco.kg', organization: 'ОсОО «Ош-Ресайкл»', status: 'active', notes: '' },
    { id: 18, name: 'ЭкоПункт Ош-3 (Ак-Бууринский)', region: 'Ошская область', district: 'г. Ош', address: 'ул. Алишера Навои, 56', lat: 40.5512, lng: 72.7823, wasteTypes: ['Пластик', 'Стекло', 'Шины'], workingHours: '10:00-17:00', phone: '+996 550 56-78-90', email: 'osh3@eco.kg', organization: 'ОсОО «ОшЭкоПункт»', status: 'active', notes: '' },
    { id: 19, name: 'Пункт приёма стеклотары «Чистое стекло»', region: 'г. Бишкек', district: 'Первомайский', address: 'ул. Жибек Жолу, 312', lat: 42.8654, lng: 74.5345, wasteTypes: ['Стекло'], workingHours: '08:00-20:00', phone: '+996 555 90-12-34', email: 'glass@eco.kg', organization: 'ОсОО «СтеклоРесурс»', status: 'active', notes: '' },
    { id: 20, name: 'ЭкоПункт Баткен', region: 'Баткенская область', district: 'г. Баткен', address: 'ул. Центральная, 15', lat: 40.0534, lng: 70.8345, wasteTypes: ['Пластик', 'Бумага'], workingHours: '09:00-16:00', phone: '+996 3622 4-56-78', email: 'batken@eco.kg', organization: 'ОсОО «БаткенЭко»', status: 'active', notes: '' },
    { id: 21, name: 'Пункт приёма электроники «ТехноУтиль»', region: 'г. Бишкек', district: 'Свердловский', address: 'ул. Исанова, 89', lat: 42.8478, lng: 74.6178, wasteTypes: ['Электроника', 'Батарейки', 'Опасные отходы'], workingHours: '10:00-18:00', phone: '+996 555 01-23-45', email: 'techno@eco.kg', organization: 'ОсОО «ТехноУтиль»', status: 'active', notes: '' },
    { id: 22, name: 'ЭкоПункт Бишкек-5 (Восток)', region: 'г. Бишкек', district: 'Первомайский', address: 'мкр. Восток-5, 12', lat: 42.8901, lng: 74.6567, wasteTypes: ['Пластик', 'Бумага', 'Металл'], workingHours: '09:00-20:00', phone: '+996 555 12-45-78', email: 'vostok@eco.kg', organization: 'ОсОО «ЭкоПереработка»', status: 'active', notes: '' },
  ],
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
