import { reactive } from 'vue'

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

let nextId = 13

const state = reactive<{ points: CollectionPoint[] }>({
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
  ],
})

function addPoint(data: Omit<CollectionPoint, 'id'>): CollectionPoint {
  const point: CollectionPoint = { id: nextId++, ...data }
  state.points.push(point)
  return point
}

function updatePoint(id: number, updates: Partial<CollectionPoint>) {
  const idx = state.points.findIndex(p => p.id === id)
  if (idx !== -1) {
    state.points[idx] = { ...state.points[idx], ...updates }
  }
}

function deletePoint(id: number) {
  const idx = state.points.findIndex(p => p.id === id)
  if (idx !== -1) {
    state.points.splice(idx, 1)
  }
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

export const collectionPointStore = {
  state,
  addPoint,
  updatePoint,
  deletePoint,
  getPointById,
  getActivePoints,
  getPointsByRegion,
}
