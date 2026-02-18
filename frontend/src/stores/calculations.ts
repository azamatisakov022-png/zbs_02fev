import { reactive } from 'vue'
import { calculatePaymentDeadline, formatDateShort } from '../utils/dateUtils'

export type DocumentType = 'gtd' | 'act' | 'invoice_goods' | 'invoice' | 'contract' | 'other'

export const documentTypeLabels: Record<DocumentType, string> = {
  gtd: 'ГТД',
  act: 'Акт приёма-передачи',
  invoice_goods: 'Товарная накладная',
  invoice: 'Инвойс',
  contract: 'Договор с переработчиком',
  other: 'Иное',
}

export interface AttachedDocument {
  id: number
  fileName: string
  fileSize: number
  fileType: string
  docType: DocumentType
  dataUrl: string
}

export interface ProductItem {
  id: number
  group: string           // Гр.1: Группа товаров/упаковки
  subgroup: string        // Гр.2: Подгруппа
  gskpCode: string        // Гр.3: Код ГСКП (для производителей)
  tnvedCode: string       // Гр.4: Код ТН ВЭД (для импортёров, авто из подгруппы)
  volume: string          // Гр.5: Объём (масса) товаров/упаковки (тонн)
  recyclingStandard: number // Гр.6: Норматив переработки (%)
  volumeToRecycle: number  // Гр.7: Объём к переработке = Гр.5 × Гр.6 / 100
  transferredToRecycling: string // Гр.8: Передано на переработку (тонн)
  exportedFromKR: string  // Гр.9: Вывезено из КР (тонн)
  taxableVolume: number   // Гр.10: Облагаемый объём = max(0, Гр.7 - Гр.8 - Гр.9)
  rate: number            // Гр.11: Ставка утильсбора (сом/т)
  amount: number          // Гр.12: Сумма = Гр.10 × Гр.11
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
  rejectedAt?: string
  rejectedBy?: string
  parentId?: number
  paidAt?: string
  payment?: PaymentData
  paymentRejectionReason?: string
  attachedFiles?: string[]
  documents?: AttachedDocument[]
}

let nextId = 13

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
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '22.22.1', tnvedCode: '3923', volume: '3.5', recyclingStandard: 20, volumeToRecycle: 0.70, transferredToRecycling: '0.5', exportedFromKR: '', taxableVolume: 0.20, rate: 9418, amount: 1884 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '17.21.1', tnvedCode: '4819 10', volume: '2.1', recyclingStandard: 20, volumeToRecycle: 0.42, transferredToRecycling: '0.3', exportedFromKR: '', taxableVolume: 0.12, rate: 4793, amount: 575 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '23.13.1', tnvedCode: '7010', volume: '2.4', recyclingStandard: 10, volumeToRecycle: 0.24, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.24, rate: 4219, amount: 1013 },
      ],
      totalAmount: 3472,
      status: 'Оплачено',
      paidAt: '25.01.2026',
      attachedFiles: ['акт_приёма_передачи_пластик.pdf'],
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
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '', tnvedCode: '3923', volume: '5.0', recyclingStandard: 20, volumeToRecycle: 1.00, transferredToRecycling: '0.5', exportedFromKR: '', taxableVolume: 0.50, rate: 9418, amount: 4709 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '', tnvedCode: '4819 10', volume: '3.5', recyclingStandard: 20, volumeToRecycle: 0.70, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.70, rate: 4793, amount: 3355 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '', tnvedCode: '7010', volume: '3.6', recyclingStandard: 10, volumeToRecycle: 0.36, transferredToRecycling: '', exportedFromKR: '0.2', taxableVolume: 0.16, rate: 4219, amount: 675 },
      ],
      totalAmount: 8739,
      status: 'На проверке',
      attachedFiles: ['акт_переработка_пластик.pdf', 'ГТД_вывоз_стекло.pdf'],
    },
    {
      id: 3,
      number: 'РС-2026-021',
      date: '25.01.2026',
      company: 'ОсОО «ПищеПром»',
      inn: '05432109876543',
      address: 'г. Бишкек, ул. Жибек-Жолу, 45',
      period: 'Q4 2025',
      quarter: 'Q4',
      year: '2025',
      payerType: 'producer',
      dueDate: '15.01.2026',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '22.22.1', tnvedCode: '3923', volume: '1.8', recyclingStandard: 20, volumeToRecycle: 0.36, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.36, rate: 9418, amount: 3390 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '17.21.1', tnvedCode: '4819 10', volume: '1.2', recyclingStandard: 20, volumeToRecycle: 0.24, transferredToRecycling: '0.2', exportedFromKR: '', taxableVolume: 0.04, rate: 4793, amount: 192 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '23.13.1', tnvedCode: '7010', volume: '1.1', recyclingStandard: 10, volumeToRecycle: 0.11, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.11, rate: 4219, amount: 464 },
      ],
      totalAmount: 4046,
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
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '22.22.1', tnvedCode: '3923', volume: '1.2', recyclingStandard: 20, volumeToRecycle: 0.24, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.24, rate: 9418, amount: 2260 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '17.21.1', tnvedCode: '4819 10', volume: '0.8', recyclingStandard: 20, volumeToRecycle: 0.16, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.16, rate: 4793, amount: 767 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '23.13.1', tnvedCode: '7010', volume: '0.8', recyclingStandard: 10, volumeToRecycle: 0.08, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.08, rate: 4219, amount: 338 },
      ],
      totalAmount: 3365,
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
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '22.22.1', tnvedCode: '3923', volume: '3.0', recyclingStandard: 20, volumeToRecycle: 0.60, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.60, rate: 9418, amount: 5651 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '17.21.1', tnvedCode: '4819 10', volume: '1.8', recyclingStandard: 20, volumeToRecycle: 0.36, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.36, rate: 4793, amount: 1726 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '23.13.1', tnvedCode: '7010', volume: '2.0', recyclingStandard: 10, volumeToRecycle: 0.20, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.20, rate: 4219, amount: 844 },
      ],
      totalAmount: 8221,
      status: 'Принято',
      attachedFiles: ['акт_переработка_Q3.pdf'],
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
      payerType: 'producer',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '22.22.1', tnvedCode: '3923', volume: '2.0', recyclingStandard: 20, volumeToRecycle: 0.40, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.40, rate: 9418, amount: 3767 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '17.21.1', tnvedCode: '4819 10', volume: '1.5', recyclingStandard: 20, volumeToRecycle: 0.30, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.30, rate: 4793, amount: 1438 },
      ],
      totalAmount: 5205,
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
    // New mock calculations per spec
    {
      id: 7,
      number: 'РС-2026-379',
      date: '05.02.2026',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      address: 'г. Бишкек, ул. Московская, 123',
      period: 'Q1 2026',
      quarter: 'Q1',
      year: '2026',
      payerType: 'importer',
      importDate: '20.01.2026',
      dueDate: '09.02.2026',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '', tnvedCode: '3923', volume: '500.0', recyclingStandard: 20, volumeToRecycle: 100.0, transferredToRecycling: '5.0', exportedFromKR: '', taxableVolume: 95.0, rate: 9418, amount: 894710 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '', tnvedCode: '4819 10', volume: '200.0', recyclingStandard: 20, volumeToRecycle: 40.0, transferredToRecycling: '8.0', exportedFromKR: '2.0', taxableVolume: 30.0, rate: 4793, amount: 143790 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '', tnvedCode: '7010', volume: '150.0', recyclingStandard: 10, volumeToRecycle: 15.0, transferredToRecycling: '', exportedFromKR: '3.0', taxableVolume: 12.0, rate: 4219, amount: 50628 },
      ],
      totalAmount: 1089128,
      status: 'На проверке',
      attachedFiles: ['акт_приёма_передачи_пластик_Q1.pdf', 'акт_переработка_картон.pdf', 'ГТД_вывоз_картон_стекло.pdf'],
    },
    {
      id: 8,
      number: 'РС-2026-380',
      date: '06.02.2026',
      company: 'ОсОО «ЭкоТранс»',
      inn: '07654321098765',
      address: 'г. Ош, ул. Курманжан Датки, 56',
      period: 'Q1 2026',
      quarter: 'Q1',
      year: '2026',
      payerType: 'producer',
      dueDate: '15.04.2026',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '22.22.1', tnvedCode: '3923', volume: '200.0', recyclingStandard: 20, volumeToRecycle: 40.0, transferredToRecycling: '3.0', exportedFromKR: '', taxableVolume: 37.0, rate: 9418, amount: 348466 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '17.21.1', tnvedCode: '4819 10', volume: '80.0', recyclingStandard: 20, volumeToRecycle: 16.0, transferredToRecycling: '2.0', exportedFromKR: '', taxableVolume: 14.0, rate: 4793, amount: 67102 },
      ],
      totalAmount: 415568,
      status: 'На проверке',
      attachedFiles: ['акт_переработка_пластик_ЭкоТранс.pdf', 'акт_переработка_бумага_ЭкоТранс.pdf'],
    },
    {
      id: 9,
      number: 'РС-2026-375',
      date: '01.02.2026',
      company: 'ОсОО «КыргызИмпорт»',
      inn: '03216549870321',
      address: 'г. Бишкек, пр. Чуй, 200',
      period: 'Q4 2025',
      quarter: 'Q4',
      year: '2025',
      payerType: 'importer',
      importDate: '15.01.2026',
      dueDate: '02.02.2026',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '', tnvedCode: '3923', volume: '800.0', recyclingStandard: 20, volumeToRecycle: 160.0, transferredToRecycling: '10.0', exportedFromKR: '', taxableVolume: 150.0, rate: 9418, amount: 1412700 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '', tnvedCode: '4819 10', volume: '400.0', recyclingStandard: 20, volumeToRecycle: 80.0, transferredToRecycling: '5.0', exportedFromKR: '5.0', taxableVolume: 70.0, rate: 4793, amount: 335510 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '', tnvedCode: '7010', volume: '500.0', recyclingStandard: 10, volumeToRecycle: 50.0, transferredToRecycling: '', exportedFromKR: '5.0', taxableVolume: 45.0, rate: 4219, amount: 189855 },
        { id: 4, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '', tnvedCode: '3923', volume: '100.0', recyclingStandard: 20, volumeToRecycle: 20.0, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 20.0, rate: 9418, amount: 188360 },
      ],
      totalAmount: 2126425,
      status: 'Принято',
      attachedFiles: ['акт_переработка_пластик.pdf', 'акт_переработка_картон.pdf', 'ГТД_вывоз_КР.pdf', 'инвойс_вывоз.pdf'],
    },
    {
      id: 10,
      number: 'РС-2026-370',
      date: '30.01.2026',
      company: 'ОсОО «АзияТрейд»',
      inn: '06543210987654',
      address: 'г. Бишкек, ул. Абдрахманова, 170',
      period: 'Q4 2025',
      quarter: 'Q4',
      year: '2025',
      payerType: 'importer',
      importDate: '12.01.2026',
      dueDate: '30.01.2026',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '', tnvedCode: '3923', volume: '250.0', recyclingStandard: 20, volumeToRecycle: 50.0, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 50.0, rate: 9418, amount: 470900 },
        { id: 2, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '', tnvedCode: '4819 10', volume: '100.0', recyclingStandard: 20, volumeToRecycle: 20.0, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 20.0, rate: 4793, amount: 95860 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '', tnvedCode: '7010', volume: '80.0', recyclingStandard: 10, volumeToRecycle: 8.0, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 8.0, rate: 4219, amount: 33752 },
      ],
      totalAmount: 600512,
      status: 'Отклонено',
      rejectionReason: 'Неверно указан объём для группы 8 (стекло). Необходимо пересчитать.',
      attachedFiles: ['декларация_импорт.pdf'],
    },
    {
      id: 11,
      number: 'РС-2026-412',
      date: '28.01.2026',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      address: 'г. Бишкек, ул. Московская, 123',
      period: 'Q1 2026',
      quarter: 'Q1',
      year: '2026',
      payerType: 'importer',
      importDate: '15.01.2026',
      dueDate: '02.02.2026',
      items: [
        { id: 1, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '', tnvedCode: '3923', volume: '15.5', recyclingStandard: 20, volumeToRecycle: 3.10, transferredToRecycling: '0.5', exportedFromKR: '', taxableVolume: 2.60, rate: 9418, amount: 24487 },
        { id: 2, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '', tnvedCode: '7010', volume: '10.2', recyclingStandard: 10, volumeToRecycle: 1.02, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 1.02, rate: 4219, amount: 4303 },
      ],
      totalAmount: 28790,
      status: 'Отклонено',
      rejectionReason: 'Неверно указана масса товаров в группе 6 (пластик). Необходимо предоставить подтверждающие документы (таможенная декларация или накладная). Масса в накладной ГТД-2026-0045 указана 12.3 т, а в расчёте — 15.5 т.',
      rejectedAt: '01.02.2026',
      rejectedBy: 'Иванова А.К., ведущий специалист ГП Эко Оператор',
      attachedFiles: ['ГТД_ввоз_пластик.pdf'],
    },
    {
      id: 12,
      number: 'РС-2026-418',
      date: '30.01.2026',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      address: 'г. Бишкек, ул. Московская, 123',
      period: 'Q4 2025',
      quarter: 'Q4',
      year: '2025',
      payerType: 'producer',
      dueDate: '15.01.2026',
      items: [
        { id: 1, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '17.21.1', tnvedCode: '4819 10', volume: '8.0', recyclingStandard: 20, volumeToRecycle: 1.60, transferredToRecycling: '0.3', exportedFromKR: '', taxableVolume: 1.30, rate: 4793, amount: 6231 },
        { id: 2, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '22.22.1', tnvedCode: '3923', volume: '5.0', recyclingStandard: 20, volumeToRecycle: 1.00, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 1.00, rate: 9418, amount: 9418 },
        { id: 3, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '23.13.1', tnvedCode: '7010', volume: '3.0', recyclingStandard: 10, volumeToRecycle: 0.30, transferredToRecycling: '', exportedFromKR: '', taxableVolume: 0.30, rate: 4219, amount: 1266 },
      ],
      totalAmount: 16915,
      status: 'Отклонено',
      rejectionReason: 'Отсутствуют акты приёма-передачи на переработку для группы 1 (бумага/картон). Документ об утилизации 0.3 т не подтверждён переработчиком.',
      rejectedAt: '05.02.2026',
      rejectedBy: 'Сыдыкова Б.М., специалист отдела контроля',
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

function rejectCalculation(id: number, reason: string, rejectedBy?: string) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'На проверке') {
    calc.status = 'Отклонено'
    calc.rejectionReason = reason
    calc.rejectedAt = new Date().toLocaleDateString('ru-RU')
    calc.rejectedBy = rejectedBy
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

function updateCalculationItems(id: number, items: ProductItem[], totalAmount: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === 'Черновик' || calc.status === 'Отклонено')) {
    calc.items = items
    calc.totalAmount = totalAmount
  }
}

function updateCalculationDocuments(id: number, documents: AttachedDocument[]) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc) {
    calc.documents = documents
  }
}

function copyCalculation(sourceId: number): Calculation | undefined {
  const src = state.calculations.find(c => c.id === sourceId)
  if (!src) return undefined
  const newId = nextId++
  const now = new Date()
  const dateStr = now.toLocaleDateString('ru-RU')
  const numStr = `РСЧ-${now.getFullYear()}-${String(newId).padStart(3, '0')}`
  const copy: Calculation = {
    id: newId,
    number: numStr,
    date: dateStr,
    company: src.company,
    inn: src.inn,
    address: src.address,
    period: src.period,
    quarter: src.quarter,
    year: src.year,
    payerType: src.payerType,
    importDate: src.importDate,
    dueDate: src.dueDate,
    items: src.items.map(i => ({ ...i })),
    totalAmount: src.totalAmount,
    status: 'Черновик',
    parentId: sourceId,
    attachedFiles: src.attachedFiles ? [...src.attachedFiles] : undefined,
  }
  state.calculations.unshift(copy)
  return copy
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

function getCalcReviewCount() {
  return state.calculations.filter(c => c.status === 'На проверке').length
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
  updateCalculationItems,
  updateCalculationDocuments,
  copyCalculation,
  getCalculationById,
  getBusinessCalculations,
  getPendingCount,
  getPaymentPendingCount,
  getCalcReviewCount,
}
