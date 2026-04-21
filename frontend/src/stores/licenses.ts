// Реактивный store для модуля «Лицензии».
// Следует паттерну проекта: reactive + computed + функции (без defineStore).

import { reactive, computed } from 'vue'
import { adminApplicationApi, applicantApi, licenseRegistryApi, publicLicensesApi } from '../api/licenses'
import type {
  License,
  LicenseApplication,
  LicenseApplicationStatus,
  LicenseType,
  EnumItem,
  LicenseDocumentType,
} from '../types/licenses'

interface LicensesState {
  // Заявки
  myApplications: LicenseApplication[]
  adminApplications: LicenseApplication[]
  currentApplication: LicenseApplication | null
  statusCounts: Record<string, number>
  // Лицензии
  adminLicenses: License[]
  currentLicense: License | null
  // Публичный реестр
  publicLicenses: License[]
  publicPagination: { page: number; size: number; totalElements: number }
  // Справочники
  licenseTypesEnum: EnumItem<LicenseType>[]
  rejectionReasonsEnum: EnumItem[]
  documentTypesEnum: EnumItem<LicenseDocumentType>[]
  applicationStatusesEnum: EnumItem[]
  // Состояние загрузки
  loading: boolean
  error: string | null
}

const state = reactive<LicensesState>({
  myApplications: [],
  adminApplications: [],
  currentApplication: null,
  statusCounts: {},
  adminLicenses: [],
  currentLicense: null,
  publicLicenses: [],
  publicPagination: { page: 0, size: 20, totalElements: 0 },
  licenseTypesEnum: [],
  rejectionReasonsEnum: [],
  documentTypesEnum: [],
  applicationStatusesEnum: [],
  loading: false,
  error: null,
})

// ─── computed helpers ────────────────────────────────────────────

const pendingReviewCount = computed(() => (state.statusCounts.submitted || 0))
const overdueCount = computed(() => (state.statusCounts.overdue || 0))

const activeApplications = computed(() =>
  state.myApplications.filter(a =>
    ['draft', 'payment_pending', 'submitted', 'under_review', 'site_visit_done'].includes(a.status),
  ),
)

// ─── actions ─────────────────────────────────────────────────────

// Справочники (подгружаются один раз)
async function loadEnums(licenseTypeForDocs?: LicenseType) {
  try {
    const [types, reasons, statuses, docs] = await Promise.all([
      publicLicensesApi.licenseTypes(),
      publicLicensesApi.rejectionReasons(),
      publicLicensesApi.applicationStatuses(),
      publicLicensesApi.documentTypes(licenseTypeForDocs),
    ])
    state.licenseTypesEnum = types
    state.rejectionReasonsEnum = reasons
    state.applicationStatusesEnum = statuses
    state.documentTypesEnum = docs
  } catch (e) {
    console.warn('Failed to load license enums', e)
  }
}

async function reloadDocumentTypes(licenseType: LicenseType) {
  state.documentTypesEnum = await publicLicensesApi.documentTypes(licenseType)
}

// ─── applicant ───

async function loadMyApplications() {
  state.loading = true
  try {
    state.myApplications = await applicantApi.myApplications()
  } finally {
    state.loading = false
  }
}

async function loadMyApplication(id: number) {
  state.loading = true
  try {
    state.currentApplication = await applicantApi.getMyApplication(id)
  } finally {
    state.loading = false
  }
}

// ─── admin (employee/ministry) ───

async function loadAdminApplications(params?: {
  status?: LicenseApplicationStatus
  licenseType?: LicenseType
  overdue?: boolean
}) {
  state.loading = true
  try {
    state.adminApplications = await adminApplicationApi.list(params)
  } finally {
    state.loading = false
  }
}

async function loadStatusCounts() {
  try {
    state.statusCounts = await adminApplicationApi.statusCounts()
  } catch {
    state.statusCounts = {}
  }
}

async function loadAdminApplicationById(id: number) {
  state.loading = true
  try {
    state.currentApplication = await adminApplicationApi.getById(id)
  } finally {
    state.loading = false
  }
}

// ─── licenses registry ───

async function loadRegistry(licenseType?: LicenseType) {
  state.loading = true
  try {
    state.adminLicenses = await licenseRegistryApi.list(licenseType)
  } finally {
    state.loading = false
  }
}

async function loadLicenseById(id: number) {
  state.currentLicense = await licenseRegistryApi.getById(id)
}

// ─── public ───

async function loadPublicRegistry(params?: { search?: string; page?: number; size?: number }) {
  state.loading = true
  try {
    const res = await publicLicensesApi.listPublished(params)
    state.publicLicenses = res.content
    state.publicPagination = {
      page: res.number,
      size: res.size,
      totalElements: res.totalElements,
    }
  } finally {
    state.loading = false
  }
}

// ─── reset на выход ───

function reset() {
  state.myApplications = []
  state.adminApplications = []
  state.currentApplication = null
  state.statusCounts = {}
  state.adminLicenses = []
  state.currentLicense = null
  state.publicLicenses = []
  state.publicPagination = { page: 0, size: 20, totalElements: 0 }
  state.error = null
}

// ─── лейблы для отображения на фронте (fallback, если enum не загружен) ───

const labelForStatus = (s: LicenseApplicationStatus): string => {
  const fromEnum = state.applicationStatusesEnum.find(e => e.value === s)
  if (fromEnum) return fromEnum.labelRu
  const fallback: Record<LicenseApplicationStatus, string> = {
    draft: 'Черновик',
    payment_pending: 'Ожидает оплаты',
    submitted: 'Подана',
    under_review: 'На рассмотрении',
    site_visit_done: 'Выезд проведён',
    approved: 'Лицензия выдана',
    rejected: 'Отклонена',
  }
  return fallback[s] || s
}

const labelForLicenseType = (t: LicenseType): string => {
  const fromEnum = state.licenseTypesEnum.find(e => e.value === t)
  if (fromEnum) return fromEnum.labelRu
  const fallback: Record<LicenseType, string> = {
    collection: 'Сбор',
    transportation: 'Транспортировка',
    processing: 'Обработка (переработка)',
    neutralization: 'Обезвреживание (уничтожение)',
    storage_disposal: 'Хранение (захоронение)',
    complex: 'Комплексная',
  }
  return fallback[t] || t
}

export const licenseStore = {
  state,
  pendingReviewCount,
  overdueCount,
  activeApplications,
  loadEnums,
  reloadDocumentTypes,
  loadMyApplications,
  loadMyApplication,
  loadAdminApplications,
  loadStatusCounts,
  loadAdminApplicationById,
  loadRegistry,
  loadLicenseById,
  loadPublicRegistry,
  reset,
  labelForStatus,
  labelForLicenseType,
}
