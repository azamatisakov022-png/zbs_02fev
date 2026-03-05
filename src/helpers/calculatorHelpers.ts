import type { CalculatorProductItem, NormStatus } from '@/types/calculator'
import { getNormativeForGroup } from '@/data/recycling-norms'
import { useProductGroupStore } from '@/stores/product-groups'
import { PAYMENT_ACCOUNTS } from '@/config/payment-accounts'
import { CalcStatus } from '@/constants/statuses'

let nextProductId = 2

export const emptyItem = (): CalculatorProductItem => ({
  id: nextProductId++,
  group: '',
  subgroup: '',
  gskpCode: '',
  tnvedCode: '',
  volume: '',
  recyclingStandard: 0,
  volumeToRecycle: 0,
  transferredToRecycling: '',
  recycledFile: null,
  exportedFromKR: '',
  exportedFile: null,
  taxableVolume: 0,
  rate: 0,
  amount: 0,
})

export const resetProductIdCounter = () => {
  nextProductId = 2
}

export const getNextProductId = () => nextProductId++

export const updateItemRate = (item: CalculatorProductItem, year: string) => {
  const groupStore = useProductGroupStore()
  const group = groupStore.getGroupByValue(item.group)
  if (!group) {
    item.rate = 0
    item.recyclingStandard = 0
    item.amount = 0
    item.tnvedCode = ''
    return
  }

  let multiplier = 1
  item.tnvedCode = group.code
  const selectedYear = parseInt(year) || 2026
  const normFraction = getNormativeForGroup(item.group, selectedYear)
  item.recyclingStandard = Math.round(normFraction * 100)

  if (item.subgroup) {
    const sub = groupStore.getSubgroupById(group.groupNumber, item.subgroup)
    if (sub) {
      item.tnvedCode = sub.tnvedCode || group.code
      multiplier = sub.rateMultiplier
    }
  }

  item.rate = Math.round(group.currentRate * multiplier)
  calculateAmount(item)
}

export const calculateAmount = (item: CalculatorProductItem) => {
  const vol = parseFloat(item.volume) || 0
  item.volumeToRecycle = Math.round(vol * item.recyclingStandard / 100 * 100) / 100
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  item.taxableVolume = Math.max(0, Math.round((item.volumeToRecycle - transferred - exported) * 100) / 100)
  item.amount = Math.round(item.taxableVolume * item.rate)
}

export const getVolumeError = (item: CalculatorProductItem, errorMessage: string): string => {
  const vol = parseFloat(item.volume) || 0
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  if (vol > 0 && (transferred + exported) > vol) {
    return errorMessage
  }
  return ''
}

export const getNormStatus = (item: CalculatorProductItem, metMsg: string, notMetMsg: string): NormStatus | null => {
  const vol = parseFloat(item.volume) || 0
  if (!item.group || vol <= 0) return null
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  if (transferred + exported >= item.volumeToRecycle) {
    return { met: true, message: metMsg }
  }
  const taxable = item.taxableVolume
  if (taxable > 0) {
    return { met: false, message: notMetMsg }
  }
  return null
}

export const getRemaining = (item: CalculatorProductItem): number => {
  const toRecycle = item.volumeToRecycle || 0
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  return +(toRecycle - transferred - exported).toFixed(4)
}

export const getGroupLabel = (value: string): string => {
  return useProductGroupStore().getGroupLabel(value) || value
}

export const copyRequisites = async (
  type: 'utilization_fee' | 'penalty',
  amount: number,
  purpose: string,
  labels: Record<string, string>,
  onSuccess: () => void,
  onFallback: () => void,
) => {
  const acc = PAYMENT_ACCOUNTS[type]
  const text = [
    `${labels.recipient}: ${acc.recipient}`,
    `${labels.bank}: ${acc.bank}`,
    `${labels.account}: ${acc.account}`,
    `${labels.bik}: ${acc.bik}`,
    `${labels.inn}: ${acc.inn}`,
    `${labels.amount}: ${amount.toLocaleString()} ${labels.som}`,
    `${labels.purpose}: ${purpose}`,
  ].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    onSuccess()
  } catch {
    onFallback()
  }
}

export interface BuildCalcDataParams {
  calculationResultNumber: string
  calculationResultDate: string
  companyName: string
  companyInn: string
  companyAddress: string
  quarter: string
  year: string
  payerType: 'producer' | 'importer'
  importDate: string
  items: CalculatorProductItem[]
  totalAmount: number
}

export const buildCalcData = (params: BuildCalcDataParams) => {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  return {
    number: params.calculationResultNumber || `РС-${now.getFullYear()}-${num}`,
    date: params.calculationResultDate || now.toLocaleDateString(),
    company: params.companyName,
    inn: params.companyInn,
    address: params.companyAddress,
    quarter: params.quarter,
    year: params.year,
    payerType: params.payerType,
    importDate: params.payerType === 'importer' ? params.importDate : undefined,
    items: params.items.filter(i => i.group && i.volume).map(i => ({ ...i })),
    totalAmount: params.totalAmount,
  }
}

export const downloadReceipt = (
  calcNumber: string,
  calcDate: string,
  formattedAmount: string,
  dueDate: string,
  companyName: string,
  companyInn: string,
) => {
  const receiptText = `КВИТАНЦИЯ НА ОПЛАТУ УТИЛИЗАЦИОННОГО СБОРА
========================================

Номер расчёта: ${calcNumber}
Дата: ${calcDate}
Сумма к оплате: ${formattedAmount}
Срок оплаты: ${dueDate}

РЕКВИЗИТЫ ДЛЯ ОПЛАТЫ:
Получатель: Государственный экологический фонд КР
ИНН получателя: 00000000000000
Расчётный счёт: 1234567890123456
Банк: Национальный банк КР (НБКР)
БИК: 044583001
Назначение платежа: Утилизационный сбор по расчёту ${calcNumber}

Плательщик: ${companyName}
ИНН плательщика: ${companyInn}
`
  const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Квитанция_${calcNumber}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export const statusStyles: Record<string, string> = {
  [CalcStatus.DRAFT]: 'background:#F3F4F6;color:#6B7280',
  [CalcStatus.UNDER_REVIEW]: 'background:#FEF3C7;color:#92400E',
  [CalcStatus.APPROVED]: 'background:#D1FAE5;color:#065F46',
  [CalcStatus.PAID]: 'background:#DBEAFE;color:#1D4ED8',
  [CalcStatus.REJECTED]: 'background:#FEE2E2;color:#991B1B',
  [CalcStatus.PAYMENT_PENDING]: 'background:#EDE9FE;color:#6D28D9',
  [CalcStatus.PAYMENT_REJECTED]: 'background:#FEE2E2;color:#991B1B',
  [CalcStatus.FEE_PAID]: 'background:#FEF3C7;color:#92400E',
  [CalcStatus.PENALTY_PAID]: 'background:#DBEAFE;color:#1D4ED8',
  [CalcStatus.COMPLETED]: 'background:#D1FAE5;color:#065F46',
}

export const getStatusStyle = (status: string) => statusStyles[status] || 'background:#F3F4F6;color:#6B7280'

export const calcRowClass = (row: Record<string, any>): string => {
  const map: Record<string, string> = {
    [CalcStatus.PAID]: 'calc-row--paid',
    [CalcStatus.APPROVED]: 'calc-row--accepted',
    [CalcStatus.UNDER_REVIEW]: 'calc-row--review',
    [CalcStatus.DRAFT]: 'calc-row--draft',
    [CalcStatus.REJECTED]: 'calc-row--rejected',
    [CalcStatus.PAYMENT_PENDING]: 'calc-row--pay-review',
    [CalcStatus.PAYMENT_REJECTED]: 'calc-row--pay-rejected',
    [CalcStatus.FEE_PAID]: 'calc-row--fee-paid',
    [CalcStatus.PENALTY_PAID]: 'calc-row--penalty-paid',
    [CalcStatus.COMPLETED]: 'calc-row--completed',
  }
  return map[row.status] || ''
}
