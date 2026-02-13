import { reactive } from 'vue'
import { calculatePaymentDeadline, formatDateShort } from '../utils/dateUtils'

export interface ProductItem {
  id: number
  group: string
  subgroup: string
  tnvedCode: string
  mass: string
  recycledMass?: string
  rate: number
  amount: number
}

export type CalculationStatus =
  | 'Черновик'
  | 'На проверке'
  | 'Принято'
  | 'Отклонено'
  | 'Оплата на проверке'
  | 'Оплачено'
  | 'Оплата отклонена'

export interface PaymentData {
  paymentOrderNumber: string
  paymentDate: string
  payerBank: string
  transferAmount: number
  fileName: string
  fileType: string
  fileDataUrl: string
  comment?: string
}

export interface Calculation {
  id: number
  number: string
  date: string
  company: string
  inn: string
  address?: string
  period: string
  quarter: string
  year: string
  payerType?: 'producer' | 'importer'
  importDate?: string
  dueDate?: string
  items: ProductItem[]
  totalAmount: number
  status: CalculationStatus
  rejectionReason?: string
  paidAt?: string
  payment?: PaymentData
  paymentRejectionReason?: string
}

let nextId = 7

// Ставки (Сус) из постановления: group_1=4793, group_6=9418, group_8=4219
// Нормативы (Нпер): 2025 — группы 1-4: 0.2, группы 5-24: 0.1
//                    2026 — группы 1-4: 0.3, группы 5-24: 0.2
// Формула: Усб = Сус × Мтв/уп × Нпер
const state = reactive<{ calculations: Calculation[] }>({
  calculations: [
    {
      id: 1,
      number: 'РС-2026-015',
      date: '18.01.2026',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      address: 'г. Бишкек, ул. Московская, 123',
      period: 'Q4 2025',
      quarter: 'Q4',
      year: '2025',
      payerType: 'producer',
      dueDate: '15.01.2026',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', tnvedCode: '3923', mass: '3.5', rate: 9418, amount: 3296 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', tnvedCode: '4819 10', mass: '2.1', rate: 4793, amount: 2013 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', tnvedCode: '7010', mass: '2.4', rate: 4219, amount: 1013 },
      ],
      totalAmount: 6322,
      status: 'Оплачено',
      paidAt: '25.01.2026',
      payment: {
        paymentOrderNumber: 'ПП-00412',
        paymentDate: '2026-01-24',
        payerBank: 'Оптима Банк',
        transferAmount: 6322,
        fileName: 'payment_pp_00412.pdf',
        fileType: 'application/pdf',
        fileDataUrl: '',
      },
    },
    {
      id: 2,
      number: 'РС-2026-018',
      date: '22.01.2026',
      company: 'ОАО «СтройМаркет»',
      inn: '09876543210987',
      address: 'с. Беловодское, ул. Ленина, 15',
      period: 'Q4 2025',
      quarter: 'Q4',
      year: '2025',
      payerType: 'importer',
      importDate: '10.01.2026',
      dueDate: '29.01.2026',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', tnvedCode: '3923', mass: '5.0', rate: 9418, amount: 4709 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', tnvedCode: '4819 10', mass: '3.5', rate: 4793, amount: 3355 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', tnvedCode: '7010', mass: '3.6', rate: 4219, amount: 1519 },
      ],
      totalAmount: 9583,
      status: 'На проверке',
    },
    {
      id: 3,
      number: 'РС-2026-021',
      date: '25.01.2026',
      company: 'ОсОО «ПищеПром»',
      inn: '05432109876543',
      period: 'Q4 2025',
      quarter: 'Q4',
      year: '2025',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', tnvedCode: '3923', mass: '1.8', rate: 9418, amount: 1695 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', tnvedCode: '4819 10', mass: '1.2', rate: 4793, amount: 1150 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', tnvedCode: '7010', mass: '1.1', rate: 4219, amount: 464 },
      ],
      totalAmount: 3309,
      status: 'На проверке',
    },
    {
      id: 4,
      number: 'РС-2026-024',
      date: '28.01.2026',
      company: 'ИП Асанов',
      inn: '11223344556677',
      address: 'г. Бишкек, ул. Токтогула, 88',
      period: 'Q1 2026',
      quarter: 'Q1',
      year: '2026',
      payerType: 'producer',
      dueDate: '15.04.2026',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', tnvedCode: '3923', mass: '1.2', rate: 9418, amount: 2260 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', tnvedCode: '4819 10', mass: '0.8', rate: 4793, amount: 1150 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', tnvedCode: '7010', mass: '0.8', rate: 4219, amount: 675 },
      ],
      totalAmount: 4085,
      status: 'Отклонено',
      rejectionReason: 'Неверно указана масса товаров в группе 6',
    },
    {
      id: 5,
      number: 'РС-2025-089',
      date: '12.10.2025',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      address: 'г. Бишкек, ул. Московская, 123',
      period: 'Q3 2025',
      quarter: 'Q3',
      year: '2025',
      payerType: 'producer',
      dueDate: '15.10.2025',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', tnvedCode: '3923', mass: '3.0', rate: 9418, amount: 2825 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', tnvedCode: '4819 10', mass: '1.8', rate: 4793, amount: 1725 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', tnvedCode: '7010', mass: '2.0', rate: 4219, amount: 844 },
      ],
      totalAmount: 5394,
      status: 'Принято',
    },
    {
      id: 6,
      number: 'РС-2026-027',
      date: '30.01.2026',
      company: 'ОсОО «ПищеПром»',
      inn: '05432109876543',
      period: 'Q3 2025',
      quarter: 'Q3',
      year: '2025',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', tnvedCode: '3923', mass: '2.0', rate: 9418, amount: 1884 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', tnvedCode: '4819 10', mass: '1.5', rate: 4793, amount: 1438 },
      ],
      totalAmount: 3322,
      status: 'Оплата на проверке',
      payment: {
        paymentOrderNumber: 'ПП-00587',
        paymentDate: '2026-01-29',
        payerBank: 'Демир Банк',
        transferAmount: 3322,
        fileName: 'scan_pp_00587.jpg',
        fileType: 'image/jpeg',
        fileDataUrl: '',
        comment: 'Оплата за Q3 2025',
      },
    },
  ],
})

function addCalculation(data: {
  number: string
  date: string
  company: string
  inn: string
  quarter: string
  year: string
  payerType?: 'producer' | 'importer'
  importDate?: string
  address?: string
  items: ProductItem[]
  totalAmount: number
}, status: CalculationStatus = 'Черновик'): Calculation {
  const pt = data.payerType || 'producer'
  const deadline = calculatePaymentDeadline(pt, {
    quarter: data.quarter,
    year: data.year,
    importDate: data.importDate,
  })
  const calc: Calculation = {
    id: nextId++,
    number: data.number,
    date: data.date,
    company: data.company,
    inn: data.inn,
    address: data.address,
    period: pt === 'importer' && data.importDate
      ? `Ввоз: ${new Date(data.importDate).toLocaleDateString('ru-RU')}`
      : `${data.quarter} ${data.year}`,
    quarter: data.quarter,
    year: data.year,
    payerType: pt,
    importDate: data.importDate,
    dueDate: deadline ? formatDateShort(deadline) : undefined,
    items: data.items,
    totalAmount: data.totalAmount,
    status,
  }
  state.calculations.unshift(calc)
  return calc
}

function submitForReview(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === 'Черновик' || calc.status === 'Отклонено')) {
    calc.status = 'На проверке'
    calc.rejectionReason = undefined
  }
}

function approveCalculation(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'На проверке') {
    calc.status = 'Принято'
  }
}

function rejectCalculation(id: number, reason: string) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'На проверке') {
    calc.status = 'Отклонено'
    calc.rejectionReason = reason
  }
}

function submitPayment(id: number, payment: PaymentData) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === 'Принято' || calc.status === 'Оплата отклонена')) {
    calc.payment = payment
    calc.status = 'Оплата на проверке'
    calc.paymentRejectionReason = undefined
  }
}

function approvePayment(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'Оплата на проверке') {
    calc.status = 'Оплачено'
    calc.paidAt = new Date().toLocaleDateString('ru-RU')
  }
}

function rejectPayment(id: number, reason: string) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'Оплата на проверке') {
    calc.status = 'Оплата отклонена'
    calc.paymentRejectionReason = reason
  }
}

function markAsPaid(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'Принято') {
    calc.status = 'Оплачено'
    calc.paidAt = new Date().toLocaleDateString('ru-RU')
  }
}

function resubmitCalculation(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'Отклонено') {
    calc.status = 'На проверке'
    calc.rejectionReason = undefined
  }
}

function getCalculationById(id: number): Calculation | undefined {
  return state.calculations.find(c => c.id === id)
}

function getBusinessCalculations(company: string) {
  return state.calculations.filter(c => c.company === company)
}

function getPendingCount() {
  return state.calculations.filter(c => c.status === 'На проверке' || c.status === 'Оплата на проверке').length
}

function getPaymentPendingCount() {
  return state.calculations.filter(c => c.status === 'Оплата на проверке').length
}

export const calculationStore = {
  state,
  addCalculation,
  submitForReview,
  approveCalculation,
  rejectCalculation,
  submitPayment,
  approvePayment,
  rejectPayment,
  markAsPaid,
  resubmitCalculation,
  getCalculationById,
  getBusinessCalculations,
  getPendingCount,
  getPaymentPendingCount,
}
