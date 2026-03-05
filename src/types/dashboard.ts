export interface DashboardPayer {
  id: number
  companyName: string
  inn: string
  legalForm: string
  category: string
  subcategory: string
  productGroups: string[]
  region: string
  address: string
  director: string
  contactPerson: string
  phone: string
  email: string
  registrationDate: string
  reportingStatus: string
  settlementStatus: string
  systemStatus: string
  paymentStatus: string
}

export interface DashboardAccount {
  id: number
  companyId: number
  companyName: string
  companyInn: string
  balance: number
  totalCharged: number
  totalPaid: number
  totalOffset: number
  transactions: unknown[]
  lastUpdated: string
}

export interface DashboardPaginatedList<T = unknown> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CabinetDashboard {
  type: string
  role: string
  userName: string
  companyName: string
  payer: DashboardPayer
  account: DashboardAccount
  declarations: DashboardPaginatedList
  reports: DashboardPaginatedList
}
