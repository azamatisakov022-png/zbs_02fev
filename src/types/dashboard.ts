export interface CompanyProfile {
  id: number
  companyName: string
  fullName: string
  inn: string
  legalForm: string
  okpo: string
  registrationNumber: string
  region: string
  legalAddress: string
  actualAddress: string
  typeOfActivity: string
  okved: string
  directorFullName: string
  directorPosition: string
  contactPersonFullName: string
  contactPersonPosition: string
  contactPersonPhone: string
  contactPersonEmail: string
  phone: string
  email: string
  bankName: string
  bik: string
  paymentAccount: string
  correspondentAccount: string
  notificationSettings: CompanyNotificationSettings | null
}

export interface CompanyNotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  remindersAboutDeclarations: boolean
  paymentReminders: boolean
  reportingDates: boolean
  newsAndUpdates: boolean
}

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
  companyProfile: CompanyProfile | null
  account: DashboardAccount
  declarations: DashboardPaginatedList
  reports: DashboardPaginatedList
}
