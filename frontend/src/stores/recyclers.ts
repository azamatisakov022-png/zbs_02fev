import { reactive } from 'vue'

export type RecyclerStatus = 'active' | 'suspended' | 'revoked'

export interface Recycler {
  id: number
  name: string
  inn: string
  licenseNumber: string
  licenseDate: string
  licenseExpiry: string
  wasteTypes: string[]  // group values from productGroups, e.g. 'group_6'
  address: string
  contactPhone: string
  contactEmail: string
  status: RecyclerStatus
  addedDate: string
  addedBy: string
}

let nextId = 9

const state = reactive<{ recyclers: Recycler[] }>({
  recyclers: [
    {
      id: 1,
      name: 'ОсОО «ЭкоРесайкл»',
      inn: '02301200910345',
      licenseNumber: 'ЛИЦ-2023-001',
      licenseDate: '15.03.2023',
      licenseExpiry: '15.03.2028',
      wasteTypes: ['group_6', 'group_7', 'group_19', 'group_1', 'group_2', 'group_20'],
      address: 'г. Бишкек, ул. Ибраимова, 42',
      contactPhone: '+996 555 100 200',
      contactEmail: 'info@ecorecycle.kg',
      status: 'active',
      addedDate: '15.03.2023',
      addedBy: 'Мамытова А.',
    },
    {
      id: 2,
      name: 'ОсОО «ГринТек»',
      inn: '01508200810567',
      licenseNumber: 'ЛИЦ-2023-015',
      licenseDate: '01.06.2023',
      licenseExpiry: '01.06.2028',
      wasteTypes: ['group_9', 'group_10', 'group_11', 'group_13', 'group_16'],
      address: 'г. Бишкек, ул. Жибек Жолу, 114',
      contactPhone: '+996 555 300 400',
      contactEmail: 'office@greentech.kg',
      status: 'active',
      addedDate: '01.06.2023',
      addedBy: 'Мамытова А.',
    },
    {
      id: 3,
      name: 'ОсОО «ПластПром»',
      inn: '02209200710234',
      licenseNumber: 'ЛИЦ-2022-089',
      licenseDate: '10.09.2022',
      licenseExpiry: '10.09.2027',
      wasteTypes: ['group_6', 'group_7', 'group_19'],
      address: 'г. Кара-Балта, ул. Промышленная, 5',
      contactPhone: '+996 555 500 600',
      contactEmail: 'plastprom@mail.kg',
      status: 'active',
      addedDate: '10.09.2022',
      addedBy: 'Асанов Б.',
    },
    {
      id: 4,
      name: 'ОсОО «МеталлРесайкл»',
      inn: '01705200610789',
      licenseNumber: 'ЛИЦ-2023-034',
      licenseDate: '20.04.2023',
      licenseExpiry: '20.04.2028',
      wasteTypes: ['group_23', 'group_12', 'group_13'],
      address: 'г. Бишкек, ул. Алма-Атинская, 78',
      contactPhone: '+996 555 700 800',
      contactEmail: 'info@metalrecycle.kg',
      status: 'active',
      addedDate: '20.04.2023',
      addedBy: 'Мамытова А.',
    },
    {
      id: 5,
      name: 'ОсОО «СтеклоПром»',
      inn: '02604200510456',
      licenseNumber: 'ЛИЦ-2022-056',
      licenseDate: '15.07.2022',
      licenseExpiry: '15.07.2027',
      wasteTypes: ['group_8', 'group_22'],
      address: 'г. Токмок, ул. Заводская, 12',
      contactPhone: '+996 555 900 100',
      contactEmail: 'glass@stekloprom.kg',
      status: 'active',
      addedDate: '15.07.2022',
      addedBy: 'Асанов Б.',
    },
    {
      id: 6,
      name: 'ОсОО «АвтоУтиль»',
      inn: '01903200410678',
      licenseNumber: 'ЛИЦ-2024-012',
      licenseDate: '01.02.2024',
      licenseExpiry: '01.02.2029',
      wasteTypes: ['group_4', 'group_3', 'group_5', 'group_18'],
      address: 'г. Бишкек, ул. Южная Магистраль, 200',
      contactPhone: '+996 555 200 300',
      contactEmail: 'auto@autoutil.kg',
      status: 'active',
      addedDate: '01.02.2024',
      addedBy: 'Мамытова А.',
    },
    {
      id: 7,
      name: 'ОсОО «ТекстильРесайкл»',
      inn: '03102200310890',
      licenseNumber: 'ЛИЦ-2023-045',
      licenseDate: '10.05.2023',
      licenseExpiry: '10.05.2028',
      wasteTypes: ['group_5'],
      address: 'г. Ош, ул. Курманжан Датка, 55',
      contactPhone: '+996 555 400 500',
      contactEmail: 'info@textilrecycle.kg',
      status: 'suspended',
      addedDate: '10.05.2023',
      addedBy: 'Асанов Б.',
    },
    {
      id: 8,
      name: 'ОсОО «СтройПереработка»',
      inn: '04201200210123',
      licenseNumber: 'ЛИЦ-2022-023',
      licenseDate: '05.03.2022',
      licenseExpiry: '05.03.2027',
      wasteTypes: ['group_24'],
      address: 'г. Бишкек, ул. Интергельпо, 33',
      contactPhone: '+996 555 600 700',
      contactEmail: 'stroi@pererabotka.kg',
      status: 'revoked',
      addedDate: '05.03.2022',
      addedBy: 'Мамытова А.',
    },
  ],
})

function addRecycler(data: Omit<Recycler, 'id'>): Recycler {
  const recycler: Recycler = { id: nextId++, ...data }
  state.recyclers.push(recycler)
  return recycler
}

function updateRecycler(id: number, updates: Partial<Recycler>) {
  const idx = state.recyclers.findIndex(r => r.id === id)
  if (idx !== -1) {
    state.recyclers[idx] = { ...state.recyclers[idx], ...updates }
  }
}

function toggleStatus(id: number) {
  const recycler = state.recyclers.find(r => r.id === id)
  if (recycler) {
    recycler.status = recycler.status === 'active' ? 'suspended' : 'active'
  }
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

export const recyclerStore = {
  state,
  addRecycler,
  updateRecycler,
  toggleStatus,
  getActiveRecyclers,
  getActiveRecyclersByGroup,
  getRecyclerById,
  getRecyclerByName,
  getCounts,
}
