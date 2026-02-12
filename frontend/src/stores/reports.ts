import { reactive } from 'vue'

export interface ProcessingItem {
  id: number
  wasteType: string
  wasteCode: string
  declared: string
  processed: string
  recycler: string
  contractNumber: string
  contractDate: string
}

export interface UploadedFile {
  id: number
  name: string
  size: string
  type: string
}

export type ReportStatus = 'Черновик' | 'На проверке' | 'Принят' | 'Отклонён'

export interface Report {
  id: number
  number: string
  date: string
  company: string
  inn: string
  year: string
  items: ProcessingItem[]
  files: UploadedFile[]
  totalDeclared: number
  totalProcessed: number
  processingPercent: number
  status: ReportStatus
  rejectionReason?: string
}

let nextId = 6

const state = reactive<{ reports: Report[] }>({
  reports: [
    {
      id: 1,
      number: 'РП-2026-012',
      date: '18.01.2026',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      year: '2025',
      items: [
        { id: 1, wasteType: 'group_6', wasteCode: '3923', declared: '12.5', processed: '11.8', recycler: 'ОсОО «ЭкоРесайкл»', contractNumber: 'ДГ-2024-045', contractDate: '2024-01-15' },
        { id: 2, wasteType: 'group_1', wasteCode: '4819 10', declared: '8.3', processed: '8.3', recycler: 'ОсОО «ГринТек»', contractNumber: 'ДГ-2024-046', contractDate: '2024-01-15' },
        { id: 3, wasteType: 'group_8', wasteCode: '7010', declared: '5.2', processed: '5.0', recycler: 'ОсОО «СтеклоПром»', contractNumber: 'ДГ-2024-047', contractDate: '2024-02-01' },
      ],
      files: [
        { id: 1, name: 'act_priema_peredachi_2025.pdf', size: '1.2 MB', type: 'application/pdf' },
        { id: 2, name: 'dogovor_ecorecycle.pdf', size: '845 KB', type: 'application/pdf' },
      ],
      totalDeclared: 26.0,
      totalProcessed: 25.1,
      processingPercent: 96.5,
      status: 'На проверке',
    },
    {
      id: 2,
      number: 'РП-2025-089',
      date: '15.07.2025',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      year: '2024',
      items: [
        { id: 1, wasteType: 'group_6', wasteCode: '3923', declared: '10.0', processed: '9.5', recycler: 'ОсОО «ЭкоРесайкл»', contractNumber: 'ДГ-2023-012', contractDate: '2023-03-10' },
        { id: 2, wasteType: 'group_1', wasteCode: '4819 10', declared: '6.0', processed: '6.0', recycler: 'ОсОО «ГринТек»', contractNumber: 'ДГ-2023-013', contractDate: '2023-03-10' },
      ],
      files: [
        { id: 1, name: 'otchet_pererabotka_2024.pdf', size: '2.1 MB', type: 'application/pdf' },
      ],
      totalDeclared: 16.0,
      totalProcessed: 15.5,
      processingPercent: 96.9,
      status: 'Принят',
    },
    {
      id: 3,
      number: 'РП-2025-056',
      date: '12.01.2025',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      year: '2024',
      items: [
        { id: 1, wasteType: 'group_6', wasteCode: '3923', declared: '8.0', processed: '7.2', recycler: 'ОсОО «ПластПром»', contractNumber: 'ДГ-2023-008', contractDate: '2023-01-20' },
      ],
      files: [],
      totalDeclared: 8.0,
      totalProcessed: 7.2,
      processingPercent: 90.0,
      status: 'Принят',
    },
    {
      id: 4,
      number: 'РП-2026-019',
      date: '22.01.2026',
      company: 'ОАО «СтройМаркет»',
      inn: '09876543210987',
      year: '2025',
      items: [
        { id: 1, wasteType: 'group_6', wasteCode: '3923', declared: '15.0', processed: '14.2', recycler: 'ОсОО «ЭкоРесайкл»', contractNumber: 'ДГ-2024-078', contractDate: '2024-02-15' },
        { id: 2, wasteType: 'group_1', wasteCode: '4819 10', declared: '10.5', processed: '10.0', recycler: 'ОсОО «ГринТек»', contractNumber: 'ДГ-2024-079', contractDate: '2024-02-15' },
        { id: 3, wasteType: 'group_5', wasteCode: '7204', declared: '3.8', processed: '3.8', recycler: 'ОсОО «МеталлРесайкл»', contractNumber: 'ДГ-2024-080', contractDate: '2024-03-01' },
      ],
      files: [
        { id: 1, name: 'akty_pererabotki_stroymarket.pdf', size: '3.4 MB', type: 'application/pdf' },
        { id: 2, name: 'dogovor_ecorecycle_2024.pdf', size: '1.1 MB', type: 'application/pdf' },
        { id: 3, name: 'dogovor_greentek_2024.pdf', size: '980 KB', type: 'application/pdf' },
      ],
      totalDeclared: 29.3,
      totalProcessed: 28.0,
      processingPercent: 95.6,
      status: 'На проверке',
    },
    {
      id: 5,
      number: 'РП-2026-020',
      date: '24.01.2026',
      company: 'ОсОО «ПищеПром»',
      inn: '05432109876543',
      year: '2025',
      items: [
        { id: 1, wasteType: 'group_6', wasteCode: '3923', declared: '6.0', processed: '4.5', recycler: 'ОсОО «ПластПром»', contractNumber: 'ДГ-2024-055', contractDate: '2024-04-10' },
        { id: 2, wasteType: 'group_1', wasteCode: '4819 10', declared: '3.5', processed: '2.0', recycler: 'ОсОО «ГринТек»', contractNumber: 'ДГ-2024-056', contractDate: '2024-04-10' },
      ],
      files: [
        { id: 1, name: 'otchet_pischeprom_2025.pdf', size: '1.8 MB', type: 'application/pdf' },
      ],
      totalDeclared: 9.5,
      totalProcessed: 6.5,
      processingPercent: 68.4,
      status: 'Отклонён',
      rejectionReason: 'Процент переработки ниже установленного норматива (68.4% < 100%). Необходимо предоставить дополнительные акты переработки или скорректировать данные.',
    },
  ],
})

function addReport(data: {
  company: string
  inn: string
  year: string
  items: ProcessingItem[]
  files: UploadedFile[]
  totalDeclared: number
  totalProcessed: number
  processingPercent: number
}, status: ReportStatus = 'Черновик'): Report {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const report: Report = {
    id: nextId++,
    number: `РП-${now.getFullYear()}-${num}`,
    date: now.toLocaleDateString('ru-RU'),
    company: data.company,
    inn: data.inn,
    year: data.year,
    items: data.items,
    files: data.files,
    totalDeclared: data.totalDeclared,
    totalProcessed: data.totalProcessed,
    processingPercent: data.processingPercent,
    status,
  }
  state.reports.unshift(report)
  return report
}

function submitForReview(id: number) {
  const report = state.reports.find(r => r.id === id)
  if (report && (report.status === 'Черновик' || report.status === 'Отклонён')) {
    report.status = 'На проверке'
    report.rejectionReason = undefined
  }
}

function approveReport(id: number) {
  const report = state.reports.find(r => r.id === id)
  if (report && report.status === 'На проверке') {
    report.status = 'Принят'
  }
}

function rejectReport(id: number, reason: string) {
  const report = state.reports.find(r => r.id === id)
  if (report && report.status === 'На проверке') {
    report.status = 'Отклонён'
    report.rejectionReason = reason
  }
}

function getBusinessReports(company: string) {
  return state.reports.filter(r => r.company === company)
}

function getPendingCount() {
  return state.reports.filter(r => r.status === 'На проверке').length
}

export const reportStore = {
  state,
  addReport,
  submitForReview,
  approveReport,
  rejectReport,
  getBusinessReports,
  getPendingCount,
}
