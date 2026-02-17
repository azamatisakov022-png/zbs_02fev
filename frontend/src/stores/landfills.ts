import { reactive } from 'vue'

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

let nextId = 8

const state = reactive<{ landfills: Landfill[] }>({
  landfills: [
    {
      id: 1,
      name: 'Бишкекский санитарный полигон ТБО',
      type: 'sanitary',
      status: 'active',
      operator: 'МП Бишкектазалык',
      region: 'г. Бишкек',
      district: 'Свердловский район',
      settlement: 'г. Бишкек',
      address: 'Восточная промзона, участок 14',
      lat: 42.8234,
      lng: 74.5467,
      openYear: 2005,
      expiryYear: 2035,
      hazardClasses: ['IV', 'V'],
      designCapacity: 5000,
      currentVolume: 3850,
      monthlyIntake: [320, 310, 340, 360, 380, 400, 390, 410, 370, 350, 330, 345],
      wasteAcceptance: [
        { category: 'ТБО', hazardClass: 'IV-V', acceptedPerYear: 4200, limitPerYear: 5000 },
        { category: 'Строительные отходы', hazardClass: 'IV-V', acceptedPerYear: 800, limitPerYear: 1200 },
        { category: 'Промышленные неопасные', hazardClass: 'IV', acceptedPerYear: 350, limitPerYear: 600 },
        { category: 'Зелёные отходы', hazardClass: 'V', acceptedPerYear: 150, limitPerYear: 300 },
      ],
      infrastructure: {
        fencing: true,
        weighControl: true,
        monitoring: true,
        drainage: true,
        leachateCollection: true,
        fireSafety: true,
        ecoMonitoring: true,
      },
      permits: {
        operationPermit: { number: 'ОП-2005/0142', date: '12.01.2005', expiry: '12.01.2035' },
        ecoConclusion: { number: 'ЭЗ-2023/0891', date: '15.06.2023' },
      },
      documents: [
        { name: 'Лицензия на эксплуатацию', date: '12.01.2005', size: '1.2 МБ' },
        { name: 'Экологическое заключение 2023', date: '15.06.2023', size: '3.5 МБ' },
        { name: 'Акт проверки 2024', date: '20.03.2024', size: '0.8 МБ' },
      ],
      population: 1200,
      servicedPopulation: 1100,
      tariffPhysical: 80,
      tariffLegal: 450,
      dailyVolume: 850,
      wasteSchedule: 'Ежедневный',
      equipment: { trucks: 18, excavators: 4, tractors: 3, bulldozers: 2 },
      morphology: { plastic: 25, paper: 18, glass: 10, food: 35, other: 12 },
      landCategory: 'Земли промышленности, энергетики, транспорта',
    },
    {
      id: 2,
      name: 'Ошский полигон ТБО',
      type: 'sanitary',
      status: 'active',
      operator: 'МП Ош-Тазалык',
      region: 'Ошская область',
      district: 'г. Ош',
      settlement: 'г. Ош',
      address: 'Южная промзона, участок 7',
      lat: 40.4923,
      lng: 72.7456,
      openYear: 2010,
      expiryYear: 2040,
      hazardClasses: ['IV', 'V'],
      designCapacity: 2500,
      currentVolume: 1625,
      monthlyIntake: [180, 175, 190, 200, 210, 220, 215, 225, 205, 195, 185, 190],
      wasteAcceptance: [
        { category: 'ТБО', hazardClass: 'IV-V', acceptedPerYear: 2300, limitPerYear: 2800 },
        { category: 'Строительные отходы', hazardClass: 'IV-V', acceptedPerYear: 400, limitPerYear: 600 },
        { category: 'Зелёные отходы', hazardClass: 'V', acceptedPerYear: 100, limitPerYear: 200 },
      ],
      infrastructure: {
        fencing: true,
        weighControl: true,
        monitoring: true,
        drainage: true,
        leachateCollection: false,
        fireSafety: true,
        ecoMonitoring: false,
      },
      permits: {
        operationPermit: { number: 'ОП-2010/0287', date: '05.04.2010', expiry: '05.04.2040' },
        ecoConclusion: { number: 'ЭЗ-2022/0456', date: '10.09.2022' },
      },
      documents: [
        { name: 'Лицензия на эксплуатацию', date: '05.04.2010', size: '1.0 МБ' },
        { name: 'Экологическое заключение 2022', date: '10.09.2022', size: '2.8 МБ' },
      ],
      population: 350,
      servicedPopulation: 320,
      tariffPhysical: 60,
      tariffLegal: 300,
      dailyVolume: 280,
      wasteSchedule: 'Ежедневный',
      equipment: { trucks: 8, excavators: 2, tractors: 2, bulldozers: 1 },
      morphology: { plastic: 20, paper: 12, glass: 9, food: 42, other: 17 },
      landCategory: 'Земли промышленности',
    },
    {
      id: 3,
      name: 'Джалал-Абадская свалка',
      type: 'unauthorized',
      status: 'active',
      operator: 'МП Джалал-Абад тазалык',
      region: 'Джалал-Абадская область',
      district: 'г. Джалал-Абад',
      settlement: 'г. Джалал-Абад',
      address: 'Окраина города, северо-восточный выезд',
      lat: 40.9333,
      lng: 73.0017,
      openYear: 1998,
      expiryYear: 2025,
      hazardClasses: ['III', 'IV', 'V'],
      designCapacity: 800,
      currentVolume: 720,
      monthlyIntake: [55, 50, 58, 62, 65, 70, 68, 72, 60, 56, 52, 55],
      wasteAcceptance: [
        { category: 'ТБО', hazardClass: 'IV-V', acceptedPerYear: 650, limitPerYear: 700 },
        { category: 'Смешанные отходы', hazardClass: 'III-V', acceptedPerYear: 120, limitPerYear: 150 },
      ],
      infrastructure: {
        fencing: true,
        weighControl: false,
        monitoring: false,
        drainage: false,
        leachateCollection: false,
        fireSafety: true,
        ecoMonitoring: false,
      },
      permits: {
        operationPermit: { number: 'ВР-1998/0034', date: '20.07.1998', expiry: '31.12.2025' },
        ecoConclusion: { number: 'ЭЗ-2020/0112', date: '14.02.2020' },
      },
      documents: [
        { name: 'Временное разрешение', date: '20.07.1998', size: '0.5 МБ' },
        { name: 'Акт обследования 2020', date: '14.02.2020', size: '1.5 МБ' },
      ],
      population: 120,
      servicedPopulation: 105,
      tariffPhysical: 55,
      tariffLegal: 280,
      dailyVolume: 95,
      wasteSchedule: '5 раз в неделю',
      equipment: { trucks: 4, excavators: 1, tractors: 1, bulldozers: 1 },
      morphology: { plastic: 21, paper: 14, glass: 8, food: 39, other: 18 },
      landCategory: 'Земли промышленности',
    },
    {
      id: 4,
      name: 'Каракольский полигон',
      type: 'sanitary',
      status: 'active',
      operator: 'МП Каракол-Тазалык',
      region: 'Иссык-Кульская область',
      district: 'г. Каракол',
      settlement: 'г. Каракол',
      address: 'Промзона, участок 3',
      lat: 42.4882,
      lng: 78.3903,
      openYear: 2015,
      expiryYear: 2045,
      hazardClasses: ['IV', 'V'],
      designCapacity: 1200,
      currentVolume: 360,
      monthlyIntake: [38, 35, 40, 42, 44, 46, 45, 47, 43, 40, 37, 39],
      wasteAcceptance: [
        { category: 'ТБО', hazardClass: 'IV-V', acceptedPerYear: 480, limitPerYear: 800 },
        { category: 'Строительные отходы', hazardClass: 'V', acceptedPerYear: 80, limitPerYear: 200 },
        { category: 'Зелёные отходы', hazardClass: 'V', acceptedPerYear: 30, limitPerYear: 100 },
      ],
      infrastructure: {
        fencing: true,
        weighControl: true,
        monitoring: true,
        drainage: true,
        leachateCollection: true,
        fireSafety: true,
        ecoMonitoring: true,
      },
      permits: {
        operationPermit: { number: 'ОП-2015/0512', date: '01.03.2015', expiry: '01.03.2045' },
        ecoConclusion: { number: 'ЭЗ-2024/0078', date: '22.01.2024' },
      },
      documents: [
        { name: 'Лицензия на эксплуатацию', date: '01.03.2015', size: '1.1 МБ' },
        { name: 'Экологическое заключение 2024', date: '22.01.2024', size: '2.4 МБ' },
        { name: 'План мониторинга', date: '10.04.2024', size: '1.8 МБ' },
      ],
      population: 45,
      servicedPopulation: 42,
      tariffPhysical: 40,
      tariffLegal: 200,
      dailyVolume: 25,
      wasteSchedule: '2 раза в неделю',
      equipment: { trucks: 2, excavators: 0, tractors: 1, bulldozers: 0 },
      morphology: { plastic: 18, paper: 10, glass: 7, food: 48, other: 17 },
      landCategory: 'Земли запаса',
    },
    {
      id: 5,
      name: 'Нарынская свалка',
      type: 'unauthorized',
      status: 'recultivation',
      operator: 'Айыл өкмөтү Нарын',
      region: 'Нарынская область',
      district: 'г. Нарын',
      settlement: 'г. Нарын',
      address: 'Окраина города, западный выезд',
      lat: 41.4287,
      lng: 76.0000,
      openYear: 1992,
      expiryYear: 2024,
      hazardClasses: ['IV', 'V'],
      designCapacity: 400,
      currentVolume: 380,
      monthlyIntake: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      wasteAcceptance: [
        { category: 'ТБО', hazardClass: 'IV-V', acceptedPerYear: 0, limitPerYear: 300 },
      ],
      infrastructure: {
        fencing: false,
        weighControl: false,
        monitoring: false,
        drainage: false,
        leachateCollection: false,
        fireSafety: false,
        ecoMonitoring: false,
      },
      permits: {
        operationPermit: { number: 'ВР-1992/0011', date: '15.05.1992', expiry: '31.12.2024' },
        ecoConclusion: { number: 'ЭЗ-2018/0034', date: '20.08.2018' },
      },
      documents: [
        { name: 'Временное разрешение (истекло)', date: '15.05.1992', size: '0.3 МБ' },
        { name: 'План рекультивации', date: '01.06.2024', size: '4.2 МБ' },
      ],
      population: 40,
      servicedPopulation: 35,
      tariffPhysical: 35,
      tariffLegal: 180,
      dailyVolume: 0,
      wasteSchedule: 'Закрыт для приёма',
      equipment: { trucks: 0, excavators: 0, tractors: 0, bulldozers: 0 },
      morphology: { plastic: 15, paper: 10, glass: 5, food: 50, other: 20 },
      landCategory: 'Земли промышленности',
    },
    {
      id: 6,
      name: 'Токмокский полигон ТБО',
      type: 'sanitary',
      status: 'active',
      operator: 'МП Токмок-Тазалык',
      region: 'Чуйская область',
      district: 'г. Токмок',
      settlement: 'г. Токмок',
      address: 'Промышленная зона, участок 9',
      lat: 42.7644,
      lng: 75.2886,
      openYear: 2012,
      expiryYear: 2042,
      hazardClasses: ['IV', 'V'],
      designCapacity: 1500,
      currentVolume: 900,
      monthlyIntake: [78, 75, 82, 85, 88, 92, 90, 94, 86, 82, 77, 80],
      wasteAcceptance: [
        { category: 'ТБО', hazardClass: 'IV-V', acceptedPerYear: 950, limitPerYear: 1200 },
        { category: 'Строительные отходы', hazardClass: 'IV-V', acceptedPerYear: 150, limitPerYear: 300 },
        { category: 'Зелёные отходы', hazardClass: 'V', acceptedPerYear: 50, limitPerYear: 100 },
      ],
      infrastructure: {
        fencing: true,
        weighControl: true,
        monitoring: true,
        drainage: true,
        leachateCollection: true,
        fireSafety: true,
        ecoMonitoring: false,
      },
      permits: {
        operationPermit: { number: 'ОП-2012/0378', date: '18.07.2012', expiry: '18.07.2042' },
        ecoConclusion: { number: 'ЭЗ-2023/0567', date: '05.11.2023' },
      },
      documents: [
        { name: 'Лицензия на эксплуатацию', date: '18.07.2012', size: '1.0 МБ' },
        { name: 'Экологическое заключение 2023', date: '05.11.2023', size: '2.1 МБ' },
      ],
      population: 70,
      servicedPopulation: 65,
      tariffPhysical: 50,
      tariffLegal: 250,
      dailyVolume: 78,
      wasteSchedule: '5 раз в неделю',
      equipment: { trucks: 4, excavators: 1, tractors: 1, bulldozers: 1 },
      morphology: { plastic: 22, paper: 15, glass: 8, food: 40, other: 15 },
      landCategory: 'Земли промышленности',
    },
    {
      id: 7,
      name: 'Балыкчинская свалка',
      type: 'unauthorized',
      status: 'closed',
      operator: '\u2014',
      region: 'Иссык-Кульская область',
      district: 'г. Балыкчы',
      settlement: 'г. Балыкчы',
      address: 'Северная окраина города',
      lat: 42.4600,
      lng: 76.1867,
      openYear: 1985,
      expiryYear: 2020,
      hazardClasses: ['III', 'IV', 'V'],
      designCapacity: 300,
      currentVolume: 310,
      monthlyIntake: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      wasteAcceptance: [
        { category: 'ТБО (закрыт)', hazardClass: 'III-V', acceptedPerYear: 0, limitPerYear: 0 },
      ],
      infrastructure: {
        fencing: false,
        weighControl: false,
        monitoring: false,
        drainage: false,
        leachateCollection: false,
        fireSafety: false,
        ecoMonitoring: false,
      },
      permits: {
        operationPermit: { number: '', date: '', expiry: '' },
        ecoConclusion: { number: '', date: '' },
      },
      documents: [
        { name: 'Акт закрытия свалки', date: '30.06.2020', size: '0.6 МБ' },
      ],
      population: 45,
      servicedPopulation: 42,
      tariffPhysical: 40,
      tariffLegal: 200,
      dailyVolume: 0,
      wasteSchedule: 'Закрыт',
      equipment: { trucks: 0, excavators: 0, tractors: 0, bulldozers: 0 },
      morphology: { plastic: 18, paper: 10, glass: 7, food: 48, other: 17 },
      landCategory: 'Земли запаса',
    },
  ],
})

function addLandfill(data: Omit<Landfill, 'id'>): Landfill {
  const landfill: Landfill = { id: nextId++, ...data }
  state.landfills.push(landfill)
  return landfill
}

function updateLandfill(id: number, updates: Partial<Landfill>) {
  const idx = state.landfills.findIndex(l => l.id === id)
  if (idx !== -1) {
    state.landfills[idx] = { ...state.landfills[idx], ...updates }
  }
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

export const landfillStore = {
  state,
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
}
