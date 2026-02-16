import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Calculation, ProductItem } from '../stores/calculations'
import type { Report, ProcessingItem } from '../stores/reports'
import { productGroups, getSubgroupLabel } from '../data/product-groups'

// ── Helpers ──

function getGroupLabel(groupValue: string): string {
  const g = productGroups.find(pg => pg.value === groupValue)
  return g ? g.label : groupValue
}

function getGroupNumber(groupValue: string): string {
  // Extract number from group value like 'group_6' → '6'
  const match = groupValue.match(/(\d+)/)
  return match ? match[1] : groupValue
}

function s2ab(s: string): ArrayBuffer {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF
  return buf
}

/** Merge helper: merge range and set value with style */
function setMergedCell(ws: XLSX.WorkSheet, ref: string, mergeRange: string, value: string, style?: Record<string, unknown>) {
  ws[ref] = { v: value, t: 's', s: style || {} }
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push(XLSX.utils.decode_range(mergeRange))
}

function setCellValue(ws: XLSX.WorkSheet, ref: string, value: string | number, type?: string, style?: Record<string, unknown>) {
  ws[ref] = { v: value, t: type || (typeof value === 'number' ? 'n' : 's'), s: style || {} }
}

/** Ensure worksheet range covers all cells */
function updateRange(ws: XLSX.WorkSheet, maxRow: number, maxCol: number) {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1')
  range.e.r = Math.max(range.e.r, maxRow - 1)
  range.e.c = Math.max(range.e.c, maxCol - 1)
  ws['!ref'] = XLSX.utils.encode_range(range)
}

// ── Styles ──

const headerBg = { fgColor: { rgb: 'D9E2F3' } }
const totalBg = { fgColor: { rgb: 'F2F2F2' } }
const thinBorder = {
  top: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } },
}

const sTitle: Record<string, unknown> = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } }
const sSectionBold: Record<string, unknown> = { font: { bold: true, sz: 11 } }
const sRight: Record<string, unknown> = { alignment: { horizontal: 'right' } }
const sRightItalic: Record<string, unknown> = { font: { italic: true }, alignment: { horizontal: 'right' } }
const sCenterItalic: Record<string, unknown> = { font: { italic: true }, alignment: { horizontal: 'center' } }
const sCenterBold: Record<string, unknown> = { font: { bold: true }, alignment: { horizontal: 'center' } }
const sHeader: Record<string, unknown> = { font: { bold: true, sz: 9 }, fill: headerBg, border: thinBorder, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } }
const sHeaderGraf: Record<string, unknown> = { font: { bold: true, sz: 9, italic: true }, fill: headerBg, border: thinBorder, alignment: { horizontal: 'center', vertical: 'center' } }
const sDataCell: Record<string, unknown> = { font: { sz: 10 }, border: thinBorder, alignment: { vertical: 'center' } }
const sDataNum: Record<string, unknown> = { font: { sz: 10 }, border: thinBorder, alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0.00' }
const sDataPct: Record<string, unknown> = { font: { sz: 10 }, border: thinBorder, alignment: { horizontal: 'center', vertical: 'center' } }
const sTotalCell: Record<string, unknown> = { font: { bold: true, sz: 10 }, fill: totalBg, border: thinBorder }
const sTotalNum: Record<string, unknown> = { font: { bold: true, sz: 10 }, fill: totalBg, border: thinBorder, alignment: { horizontal: 'right' }, numFmt: '#,##0.00' }

// ════════════════════════════════════════════════════════════════
// FUNCTION 1: Generate Calculation Excel
// ════════════════════════════════════════════════════════════════

interface CompanyData {
  name: string
  inn: string
  address: string
  okpo?: string
  ogrn?: string
  contactPerson?: string
  phone?: string
  email?: string
  director?: string
}

export function generateCalculationExcel(calc: Calculation, company: CompanyData, reconciliation?: { charged: number; paid: number }) {
  const wb = XLSX.utils.book_new()
  const ws: XLSX.WorkSheet = {}
  ws['!merges'] = []

  const colWidths = [5, 25, 15, 15, 12, 10, 12, 12, 12, 12, 12, 14, 12, 12]
  ws['!cols'] = colWidths.map(w => ({ wch: w }))

  let r = 0 // 0-indexed row
  const maxCol = 14 // A-N

  // Row 1: Приложение
  setMergedCell(ws, 'A1', 'A1:N1', 'Приложение 2 к приказу', sRightItalic)
  r++

  // Row 2
  setMergedCell(ws, 'A2', 'A2:N2', 'От «___» _____________ 2026 года', sRight)
  r++

  // Row 3: empty
  r++

  // Row 4: ФОРМА
  setMergedCell(ws, 'A4', 'A4:N4', 'ФОРМА', sTitle)
  r++

  // Row 5: period
  const periodText = `расчета суммы утилизационного сбора за «${calc.period || calc.quarter}» ${calc.year} год`
  setMergedCell(ws, 'A5', 'A5:N5', periodText, sCenterBold)
  r++

  // Row 6: empty
  r++

  // Row 7
  setMergedCell(ws, 'A7', 'A7:N7', 'Расчет предоставляется Оператору расширенной ответственности производителей (РОП)', sCenterItalic)
  r++

  // Row 8: empty
  r++

  // Row 9: Section 1
  setMergedCell(ws, 'A9', 'A9:N9', 'Раздел 1. Общие сведения о производителе, импортере', sSectionBold)
  r = 9

  // Rows 10-17: Company data
  const companyRows: [string, string][] = [
    ['Организационно-правовая форма и наименование:', company.name],
    ['Адрес:', company.address],
    ['ИНН:', company.inn],
    ['Код ОКПО:', company.okpo || '—'],
    ['ОГРН:', company.ogrn || '—'],
    ['Руководитель:', company.director || '—'],
    ['Контактная информация:', [company.contactPerson, company.phone, company.email].filter(Boolean).join(', ') || '—'],
  ]

  companyRows.forEach((row, i) => {
    const rowNum = 10 + i
    setMergedCell(ws, `A${rowNum}`, `A${rowNum}:D${rowNum}`, row[0], { font: { sz: 10, color: { rgb: '64748B' } } })
    setMergedCell(ws, `E${rowNum}`, `E${rowNum}:N${rowNum}`, row[1], { font: { sz: 10 } })
  })

  // Row 18: empty
  // Row 19: Section 2
  const secRow = 10 + companyRows.length + 1
  setMergedCell(ws, `A${secRow}`, `A${secRow}:N${secRow}`, 'Раздел 2. Расчет утилизационного сбора', sSectionBold)

  // Header row (secRow + 2)
  const hRow = secRow + 2
  const headers = [
    '№', 'Номер группы', 'Код товара\nГСКП', 'Код ТН ВЭД\nЕАЭС',
    'Кол-во товаров,\nвыпущенных в\nобращение (тн)',
    'Норматив\nпереработки',
    'Кол-во товаров,\nподлежащих\nпереработке (тн)\n(гр.5×гр.6)',
    'Кол-во отходов,\nпереданных на\nпереработку (тн)',
    'Вывезено с\nтерритории КР\n(тн)',
    'Итоговое кол-во,\nза которые\nнеобходимо\nуплатить (тн)\n(гр.7–гр.8–гр.9)',
    'Ставка утил.\nсбора (сом/тн)',
    'Итоговая сумма\nутил. сбора\nк оплате (сом)',
    'Сумма утил.\nсбора начис-\nленная (сом)',
    'Сумма утил.\nсбора уплачен-\nная (сом)',
  ]
  const cols = 'ABCDEFGHIJKLMN'.split('')

  headers.forEach((h, i) => {
    setCellValue(ws, `${cols[i]}${hRow}`, h, 's', sHeader)
  })

  // Graf row
  const gRow = hRow + 1
  const grafLabels = ['Гр.1', 'Гр.2', 'Гр.3', 'Гр.4', 'Гр.5', 'Гр.6', 'Гр.7', 'Гр.8', 'Гр.9', 'Гр.10', 'Гр.11', 'Гр.12', 'Гр.13а', 'Гр.13б']
  grafLabels.forEach((g, i) => {
    setCellValue(ws, `${cols[i]}${gRow}`, g, 's', sHeaderGraf)
  })

  // Set header row height
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][hRow - 1] = { hpt: 60 }

  // Data rows
  const items = calc.items.filter(i => i.group && i.volume)
  let dataRow = gRow + 1

  // Totals
  let totVol = 0, totRecycle = 0, totTransferred = 0, totExported = 0, totTaxable = 0, totAmount = 0

  items.forEach((item, idx) => {
    const vol = parseFloat(item.volume) || 0
    const transferred = parseFloat(item.transferredToRecycling) || 0
    const exported = parseFloat(item.exportedFromKR) || 0

    totVol += vol
    totRecycle += item.volumeToRecycle
    totTransferred += transferred
    totExported += exported
    totTaxable += item.taxableVolume
    totAmount += item.amount

    const groupNum = getGroupNumber(item.group)
    const groupLabel = `${groupNum}. ${getGroupLabel(item.group)}`

    setCellValue(ws, `A${dataRow}`, idx + 1, 'n', sDataCell)
    setCellValue(ws, `B${dataRow}`, groupLabel, 's', sDataCell)
    setCellValue(ws, `C${dataRow}`, item.gskpCode || '—', 's', sDataCell)
    setCellValue(ws, `D${dataRow}`, item.tnvedCode || '—', 's', sDataCell)
    setCellValue(ws, `E${dataRow}`, vol, 'n', sDataNum)
    setCellValue(ws, `F${dataRow}`, `${item.recyclingStandard}%`, 's', sDataPct)
    setCellValue(ws, `G${dataRow}`, item.volumeToRecycle, 'n', sDataNum)
    setCellValue(ws, `H${dataRow}`, transferred, 'n', sDataNum)
    setCellValue(ws, `I${dataRow}`, exported, 'n', sDataNum)
    setCellValue(ws, `J${dataRow}`, item.taxableVolume, 'n', sDataNum)
    setCellValue(ws, `K${dataRow}`, item.rate, 'n', sDataNum)
    setCellValue(ws, `L${dataRow}`, item.amount, 'n', sDataNum)
    const itemCharged = reconciliation ? Math.round(item.amount / calc.totalAmount * reconciliation.charged) : item.amount
    const itemPaid = reconciliation ? Math.round(item.amount / calc.totalAmount * reconciliation.paid) : 0
    setCellValue(ws, `M${dataRow}`, itemCharged, 'n', sDataNum)
    setCellValue(ws, `N${dataRow}`, itemPaid, 'n', sDataNum)

    dataRow++
  })

  // TOTALS row
  setMergedCell(ws, `A${dataRow}`, `A${dataRow}:D${dataRow}`, 'ВСЕГО', sTotalCell)
  setCellValue(ws, `E${dataRow}`, totVol, 'n', sTotalNum)
  setCellValue(ws, `F${dataRow}`, '', 's', sTotalCell)
  setCellValue(ws, `G${dataRow}`, totRecycle, 'n', sTotalNum)
  setCellValue(ws, `H${dataRow}`, totTransferred, 'n', sTotalNum)
  setCellValue(ws, `I${dataRow}`, totExported, 'n', sTotalNum)
  setCellValue(ws, `J${dataRow}`, totTaxable, 'n', sTotalNum)
  setCellValue(ws, `K${dataRow}`, '', 's', sTotalCell)
  setCellValue(ws, `L${dataRow}`, totAmount, 'n', sTotalNum)
  setCellValue(ws, `M${dataRow}`, reconciliation ? reconciliation.charged : totAmount, 'n', sTotalNum)
  setCellValue(ws, `N${dataRow}`, reconciliation ? reconciliation.paid : 0, 'n', sTotalNum)
  dataRow++

  // Footer
  dataRow++
  setMergedCell(ws, `A${dataRow}`, `A${dataRow}:N${dataRow}`,
    'Документ составлен на ___ листах с приложением подтверждающих документов на ___ листах.', { font: { sz: 10 } })
  dataRow += 2
  setMergedCell(ws, `A${dataRow}`, `A${dataRow}:N${dataRow}`,
    'Должностное лицо: ______________________ / _________________________ / подпись', { font: { sz: 10 } })
  dataRow++
  setMergedCell(ws, `A${dataRow}`, `A${dataRow}:N${dataRow}`, 'М.П.', { font: { sz: 10 } })

  // Update ref
  updateRange(ws, dataRow, maxCol)

  XLSX.utils.book_append_sheet(wb, ws, 'Расчёт утильсбора')

  // Generate and save
  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const companyShort = company.name.replace(/[«»"'ОсОО\s]/g, '').substring(0, 20)
  const fileName = `Расчет_утильсбора_${calc.number}_${companyShort}.xlsx`
  saveAs(new Blob([wbOut], { type: 'application/octet-stream' }), fileName)
}


// ════════════════════════════════════════════════════════════════
// FUNCTION 2: Generate Recycling Report Excel
// ════════════════════════════════════════════════════════════════

export function generateRecyclingReportExcel(report: Report, company: CompanyData) {
  const wb = XLSX.utils.book_new()

  // ── SHEET 1: Отчётность ──
  const ws1: XLSX.WorkSheet = {}
  ws1['!merges'] = []
  ws1['!cols'] = [5, 5, 20, 15, 20, 15, 12, 10, 12, 12, 12, 12, 12, 20, 12].map(w => ({ wch: w }))

  const cols1 = 'ABCDEFGHIJKLMNO'.split('')
  const maxCol1 = 14 // A-N

  // Header block
  setMergedCell(ws1, 'A1', 'A1:N1', 'Приложение к постановлению КМ КР №563', sRightItalic)
  setMergedCell(ws1, 'A2', 'A2:N2', 'От «___» _____________ 2026 года', sRight)
  setMergedCell(ws1, 'A4', 'A4:N4', 'ФОРМА', sTitle)
  setMergedCell(ws1, 'A5', 'A5:N5',
    `ОТЧЁТНОСТЬ о выполнении нормативов переработки отходов от использования товаров за ${report.year} год`,
    sCenterBold)
  setMergedCell(ws1, 'A7', 'A7:N7', 'Отчётность предоставляется Оператору РОП', sCenterItalic)

  // Section 1: Company data
  setMergedCell(ws1, 'A9', 'A9:N9', 'Раздел 1. Общие сведения о производителе, импортере', sSectionBold)

  const companyRows: [string, string][] = [
    ['Наименование:', company.name],
    ['Адрес:', company.address],
    ['ИНН:', company.inn],
    ['Код ОКПО:', company.okpo || '—'],
    ['ОГРН:', company.ogrn || '—'],
    ['Контактная информация:', [company.contactPerson, company.phone, company.email].filter(Boolean).join(', ') || '—'],
  ]

  companyRows.forEach((row, i) => {
    const rn = 10 + i
    setMergedCell(ws1, `A${rn}`, `A${rn}:D${rn}`, row[0], { font: { sz: 10, color: { rgb: '64748B' } } })
    setMergedCell(ws1, `E${rn}`, `E${rn}:N${rn}`, row[1], { font: { sz: 10 } })
  })

  // Section 2
  const s2Row = 10 + companyRows.length + 1
  setMergedCell(ws1, `A${s2Row}`, `A${s2Row}:N${s2Row}`, 'Раздел 2. Информация о товарах и упаковке товаров', sSectionBold)
  const sub1Row = s2Row + 1
  setMergedCell(ws1, `A${sub1Row}`, `A${sub1Row}:N${sub1Row}`, '1. Информация о товарах (без упаковки товаров)', { font: { bold: true, sz: 10 } })

  // Table 1 header
  const t1hRow = sub1Row + 1
  const t1Headers = [
    '№ п/п', 'Наименование\nтовара', 'Код товара\nпо ГСКП', 'Наименование\nпозиции ТН ВЭД',
    'Код ТН ВЭД\nЕАЭС', 'Кол-во товаров,\nвыпущенных в\nобращение (кг)',
    'Норматив\nпереработки', 'Кол-во,\nподлежащих\nпереработке (кг)\n(гр.6×гр.7)',
    'Кол-во\nпереработанных\nв отчёт. период\n(кг)',
    'Кол-во перераб.\nв предыдущий\nпериод (кг)',
    'Итого перераб.,\nзасчитываемых\n(кг)\n(гр.9+гр.10)',
    'Кол-во, за\nкоторые\nнеобходимо\nуплатить (кг)\n(гр.8−гр.11)',
    'Сведения о\nдокументах',
    'Примечание',
  ]

  t1Headers.forEach((h, i) => {
    setCellValue(ws1, `${cols1[i]}${t1hRow}`, h, 's', sHeader)
  })

  // Graf row
  const t1gRow = t1hRow + 1
  for (let i = 1; i <= 14; i++) {
    setCellValue(ws1, `${cols1[i - 1]}${t1gRow}`, String(i), 's', sHeaderGraf)
  }

  ws1['!rows'] = ws1['!rows'] || []
  ws1['!rows'][t1hRow - 1] = { hpt: 60 }

  // Data rows from report
  let dRow = t1gRow + 1
  let totDeclared = 0, totProcessed = 0

  report.items.forEach((item, idx) => {
    const declared = parseFloat(item.declared) || 0
    const processed = parseFloat(item.processed) || 0
    const groupLabel = getGroupLabel(item.wasteType)
    totDeclared += declared
    totProcessed += processed

    const declaredKg = declared * 1000
    const processedKg = processed * 1000
    const toRecycleKg = declaredKg * 0.2 // default normative
    const totalRecycledKg = processedKg
    const remaining = Math.max(0, toRecycleKg - totalRecycledKg)

    setCellValue(ws1, `${cols1[0]}${dRow}`, idx + 1, 'n', sDataCell)
    setCellValue(ws1, `${cols1[1]}${dRow}`, groupLabel, 's', sDataCell)
    setCellValue(ws1, `${cols1[2]}${dRow}`, item.wasteCode, 's', sDataCell)
    setCellValue(ws1, `${cols1[3]}${dRow}`, '—', 's', sDataCell)
    setCellValue(ws1, `${cols1[4]}${dRow}`, item.wasteCode, 's', sDataCell)
    setCellValue(ws1, `${cols1[5]}${dRow}`, declaredKg, 'n', sDataNum)
    setCellValue(ws1, `${cols1[6]}${dRow}`, '20%', 's', sDataPct)
    setCellValue(ws1, `${cols1[7]}${dRow}`, toRecycleKg, 'n', sDataNum)
    setCellValue(ws1, `${cols1[8]}${dRow}`, processedKg, 'n', sDataNum)
    setCellValue(ws1, `${cols1[9]}${dRow}`, 0, 'n', sDataNum)
    setCellValue(ws1, `${cols1[10]}${dRow}`, totalRecycledKg, 'n', sDataNum)
    setCellValue(ws1, `${cols1[11]}${dRow}`, remaining, 'n', sDataNum)
    setCellValue(ws1, `${cols1[12]}${dRow}`, `Договор ${item.contractNumber}`, 's', sDataCell)
    setCellValue(ws1, `${cols1[13]}${dRow}`, '', 's', sDataCell)
    dRow++
  })

  // Totals
  setMergedCell(ws1, `A${dRow}`, `A${dRow}:E${dRow}`, 'ВСЕГО', sTotalCell)
  setCellValue(ws1, `${cols1[5]}${dRow}`, totDeclared * 1000, 'n', sTotalNum)
  setCellValue(ws1, `${cols1[6]}${dRow}`, '', 's', sTotalCell)
  setCellValue(ws1, `${cols1[7]}${dRow}`, totDeclared * 1000 * 0.2, 'n', sTotalNum)
  setCellValue(ws1, `${cols1[8]}${dRow}`, totProcessed * 1000, 'n', sTotalNum)
  setCellValue(ws1, `${cols1[9]}${dRow}`, 0, 'n', sTotalNum)
  setCellValue(ws1, `${cols1[10]}${dRow}`, totProcessed * 1000, 'n', sTotalNum)
  setCellValue(ws1, `${cols1[11]}${dRow}`, Math.max(0, (totDeclared - totProcessed) * 1000 * 0.2), 'n', sTotalNum)
  setCellValue(ws1, `${cols1[12]}${dRow}`, '', 's', sTotalCell)
  setCellValue(ws1, `${cols1[13]}${dRow}`, '', 's', sTotalCell)

  dRow += 2
  setMergedCell(ws1, `A${dRow}`, `A${dRow}:N${dRow}`,
    'Должностное лицо: ______________________ / _________________________ / подпись', { font: { sz: 10 } })
  dRow++
  setMergedCell(ws1, `A${dRow}`, `A${dRow}:N${dRow}`, 'М.П.', { font: { sz: 10 } })

  updateRange(ws1, dRow, maxCol1)
  XLSX.utils.book_append_sheet(wb, ws1, 'Отчётность')

  // ── SHEET 2: Акт переработки ──
  const ws2: XLSX.WorkSheet = {}
  ws2['!merges'] = []
  ws2['!cols'] = [5, 25, 15, 15, 12].map(w => ({ wch: w }))

  const cols2 = 'ABCDE'.split('')

  setMergedCell(ws2, 'A1', 'A1:E1', 'АКТ', sTitle)
  setMergedCell(ws2, 'A2', 'A2:E2', 'приёма-передачи отходов на переработку', sCenterBold)
  setMergedCell(ws2, 'A4', 'A4:B4', 'г. Бишкек', { font: { sz: 10 } })
  setMergedCell(ws2, 'D4', 'D4:E4', `«___» _____________ ${report.year} г.`, sRight)

  let r2 = 6
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, 'Исполнитель (переработчик):', { font: { bold: true, sz: 10 } })
  r2++
  const recyclerName = report.items[0]?.recycler || 'ОсОО «ЭкоРесайкл»'
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, `Наименование: ${recyclerName}`, { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, 'ИНН: _______________ ОКПО: _______________', { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, 'Лицензия: № _________ от ___________', { font: { sz: 10 } })

  r2 += 2
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, 'Заказчик (плательщик утильсбора):', { font: { bold: true, sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, `Наименование: ${company.name}`, { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, `ИНН: ${company.inn}`, { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, `Адрес: ${company.address}`, { font: { sz: 10 } })

  r2 += 2
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, 'Таблица 1. Осуществил переработку отходов:', { font: { bold: true, sz: 10 } })
  r2++

  // Table header
  const actHeaders = ['№ п/п', 'Наименование отхода', 'Статистический код', 'Количество (кг)', 'Группа товаров']
  actHeaders.forEach((h, i) => {
    setCellValue(ws2, `${cols2[i]}${r2}`, h, 's', sHeader)
  })
  r2++

  report.items.forEach((item, idx) => {
    const processedKg = (parseFloat(item.processed) || 0) * 1000
    setCellValue(ws2, `A${r2}`, idx + 1, 'n', sDataCell)
    setCellValue(ws2, `B${r2}`, getGroupLabel(item.wasteType), 's', sDataCell)
    setCellValue(ws2, `C${r2}`, item.wasteCode, 's', sDataCell)
    setCellValue(ws2, `D${r2}`, processedKg, 'n', sDataNum)
    setCellValue(ws2, `E${r2}`, getGroupLabel(item.wasteType), 's', sDataCell)
    r2++
  })

  r2 += 2
  setMergedCell(ws2, `A${r2}`, `A${r2}:B${r2}`, 'Исполнитель: _______________ / подпись', { font: { sz: 10 } })
  setMergedCell(ws2, `D${r2}`, `D${r2}:E${r2}`, 'Заказчик: _______________ / подпись', { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:B${r2}`, 'М.П.', { font: { sz: 10 } })
  setMergedCell(ws2, `D${r2}`, `D${r2}:E${r2}`, 'М.П.', { font: { sz: 10 } })

  updateRange(ws2, r2, 5)
  XLSX.utils.book_append_sheet(wb, ws2, 'Акт переработки')

  // Generate and save
  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const companyShort = company.name.replace(/[«»"'ОсОО\s]/g, '').substring(0, 20)
  const fileName = `Отчет_переработка_${report.year}_${companyShort}.xlsx`
  saveAs(new Blob([wbOut], { type: 'application/octet-stream' }), fileName)
}
