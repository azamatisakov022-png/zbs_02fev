import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Calculation, ProductItem } from '../stores/calculations'
import type { Report, ProcessingItem } from '../stores/reports'
import { productGroups, getSubgroupLabel } from '../data/product-groups'
import i18n from '../i18n'

const t = (key: string, params?: Record<string, string | number>) => i18n.global.t(key, params || {})

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
  setMergedCell(ws, 'A1', 'A1:N1', t('excelExport.appendix'), sRightItalic)
  r++

  // Row 2
  setMergedCell(ws, 'A2', 'A2:N2', t('excelExport.dateFrom'), sRight)
  r++

  // Row 3: empty
  r++

  // Row 4: ФОРМА
  setMergedCell(ws, 'A4', 'A4:N4', t('excelExport.form'), sTitle)
  r++

  // Row 5: period
  const periodText = t('excelExport.calcPeriodTitle', { period: calc.period || calc.quarter, year: calc.year })
  setMergedCell(ws, 'A5', 'A5:N5', periodText, sCenterBold)
  r++

  // Row 6: empty
  r++

  // Row 7
  setMergedCell(ws, 'A7', 'A7:N7', t('excelExport.calcProvidedTo'), sCenterItalic)
  r++

  // Row 8: empty
  r++

  // Row 9: Section 1
  setMergedCell(ws, 'A9', 'A9:N9', t('excelExport.section1Title'), sSectionBold)
  r = 9

  // Rows 10-17: Company data
  const companyRows: [string, string][] = [
    [t('excelExport.legalFormAndName'), company.name],
    [t('excelExport.address'), company.address],
    [t('excelExport.inn'), company.inn],
    [t('excelExport.okpo'), company.okpo || '—'],
    [t('excelExport.ogrn'), company.ogrn || '—'],
    [t('excelExport.director'), company.director || '—'],
    [t('excelExport.contactInfo'), [company.contactPerson, company.phone, company.email].filter(Boolean).join(', ') || '—'],
  ]

  companyRows.forEach((row, i) => {
    const rowNum = 10 + i
    setMergedCell(ws, `A${rowNum}`, `A${rowNum}:D${rowNum}`, row[0], { font: { sz: 10, color: { rgb: '64748B' } } })
    setMergedCell(ws, `E${rowNum}`, `E${rowNum}:N${rowNum}`, row[1], { font: { sz: 10 } })
  })

  // Row 18: empty
  // Row 19: Section 2
  const secRow = 10 + companyRows.length + 1
  setMergedCell(ws, `A${secRow}`, `A${secRow}:N${secRow}`, t('excelExport.section2Title'), sSectionBold)

  // Header row (secRow + 2)
  const hRow = secRow + 2
  const headers = [
    t('excelExport.colNumber'), t('excelExport.colGroupNumber'), t('excelExport.colGskpCode'), t('excelExport.colTnvedCode'),
    t('excelExport.colVolume'),
    t('excelExport.colNorm'),
    t('excelExport.colToRecycle'),
    t('excelExport.colTransferred'),
    t('excelExport.colExported'),
    t('excelExport.colTaxable'),
    t('excelExport.colRate'),
    t('excelExport.colTotalAmount'),
    t('excelExport.colCharged'),
    t('excelExport.colPaid'),
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
  setMergedCell(ws, `A${dataRow}`, `A${dataRow}:D${dataRow}`, t('excelExport.totalRow'), sTotalCell)
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
    t('excelExport.footer'), { font: { sz: 10 } })
  dataRow += 2
  setMergedCell(ws, `A${dataRow}`, `A${dataRow}:N${dataRow}`,
    t('excelExport.official'), { font: { sz: 10 } })
  dataRow++
  setMergedCell(ws, `A${dataRow}`, `A${dataRow}:N${dataRow}`, t('excelExport.stamp'), { font: { sz: 10 } })

  // Update ref
  updateRange(ws, dataRow, maxCol)

  XLSX.utils.book_append_sheet(wb, ws, t('excelExport.sheetCalc'))

  // Generate and save
  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const companyShort = company.name.replace(/[«»"'ОсОО\s]/g, '').substring(0, 20)
  const fileName = `${t('excelExport.fileCalc')}_${calc.number}_${companyShort}.xlsx`
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
  setMergedCell(ws1, 'A1', 'A1:N1', t('excelExport.appendixReport'), sRightItalic)
  setMergedCell(ws1, 'A2', 'A2:N2', t('excelExport.dateFrom'), sRight)
  setMergedCell(ws1, 'A4', 'A4:N4', t('excelExport.form'), sTitle)
  setMergedCell(ws1, 'A5', 'A5:N5',
    t('excelExport.reportTitle', { year: report.year }),
    sCenterBold)
  setMergedCell(ws1, 'A7', 'A7:N7', t('excelExport.reportProvidedTo'), sCenterItalic)

  // Section 1: Company data
  setMergedCell(ws1, 'A9', 'A9:N9', t('excelExport.section1TitleReport'), sSectionBold)

  const companyRows: [string, string][] = [
    [t('excelExport.name'), company.name],
    [t('excelExport.address'), company.address],
    [t('excelExport.inn'), company.inn],
    [t('excelExport.okpo'), company.okpo || '—'],
    [t('excelExport.ogrn'), company.ogrn || '—'],
    [t('excelExport.contactInfo'), [company.contactPerson, company.phone, company.email].filter(Boolean).join(', ') || '—'],
  ]

  companyRows.forEach((row, i) => {
    const rn = 10 + i
    setMergedCell(ws1, `A${rn}`, `A${rn}:D${rn}`, row[0], { font: { sz: 10, color: { rgb: '64748B' } } })
    setMergedCell(ws1, `E${rn}`, `E${rn}:N${rn}`, row[1], { font: { sz: 10 } })
  })

  // Section 2
  const s2Row = 10 + companyRows.length + 1
  setMergedCell(ws1, `A${s2Row}`, `A${s2Row}:N${s2Row}`, t('excelExport.section2TitleReport'), sSectionBold)
  const sub1Row = s2Row + 1
  setMergedCell(ws1, `A${sub1Row}`, `A${sub1Row}:N${sub1Row}`, t('excelExport.subsection1'), { font: { bold: true, sz: 10 } })

  // Table 1 header
  const t1hRow = sub1Row + 1
  const t1Headers = [
    t('excelExport.colRowNumber'), t('excelExport.colProductName'), t('excelExport.colGskpCodeReport'), t('excelExport.colTnvedName'),
    t('excelExport.colTnvedCodeReport'), t('excelExport.colVolumeKg'),
    t('excelExport.colNormReport'), t('excelExport.colToRecycleKg'),
    t('excelExport.colRecycled'),
    t('excelExport.colPrevRecycled'),
    t('excelExport.colTotalRecycled'),
    t('excelExport.colRemaining'),
    t('excelExport.colDocuments'),
    t('excelExport.colNote'),
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
  setMergedCell(ws1, `A${dRow}`, `A${dRow}:E${dRow}`, t('excelExport.totalRow'), sTotalCell)
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
    t('excelExport.official'), { font: { sz: 10 } })
  dRow++
  setMergedCell(ws1, `A${dRow}`, `A${dRow}:N${dRow}`, t('excelExport.stamp'), { font: { sz: 10 } })

  updateRange(ws1, dRow, maxCol1)
  XLSX.utils.book_append_sheet(wb, ws1, t('excelExport.sheetReport'))

  // ── SHEET 2: Акт переработки ──
  const ws2: XLSX.WorkSheet = {}
  ws2['!merges'] = []
  ws2['!cols'] = [5, 25, 15, 15, 12].map(w => ({ wch: w }))

  const cols2 = 'ABCDE'.split('')

  setMergedCell(ws2, 'A1', 'A1:E1', t('excelExport.actTitle'), sTitle)
  setMergedCell(ws2, 'A2', 'A2:E2', t('excelExport.actSubtitle'), sCenterBold)
  setMergedCell(ws2, 'A4', 'A4:B4', t('excelExport.cityBishkek'), { font: { sz: 10 } })
  setMergedCell(ws2, 'D4', 'D4:E4', t('excelExport.actDate', { year: report.year }), sRight)

  let r2 = 6
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, t('excelExport.executorRecycler'), { font: { bold: true, sz: 10 } })
  r2++
  const recyclerName = report.items[0]?.recycler || 'ОсОО «ЭкоРесайкл»'
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, `${t('excelExport.nameLabel')} ${recyclerName}`, { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, t('excelExport.innOkpoLine'), { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, t('excelExport.licenseLine'), { font: { sz: 10 } })

  r2 += 2
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, t('excelExport.customerPayer'), { font: { bold: true, sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, `${t('excelExport.nameLabel')} ${company.name}`, { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, `${t('excelExport.inn')} ${company.inn}`, { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, `${t('excelExport.address')} ${company.address}`, { font: { sz: 10 } })

  r2 += 2
  setMergedCell(ws2, `A${r2}`, `A${r2}:E${r2}`, t('excelExport.actTableTitle'), { font: { bold: true, sz: 10 } })
  r2++

  // Table header
  const actHeaders = [t('excelExport.colRowNumber'), t('excelExport.colWasteName'), t('excelExport.colStatCode'), t('excelExport.colQuantityKg'), t('excelExport.colProductGroup')]
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
  setMergedCell(ws2, `A${r2}`, `A${r2}:B${r2}`, t('excelExport.executorSignature'), { font: { sz: 10 } })
  setMergedCell(ws2, `D${r2}`, `D${r2}:E${r2}`, t('excelExport.customerSignature'), { font: { sz: 10 } })
  r2++
  setMergedCell(ws2, `A${r2}`, `A${r2}:B${r2}`, t('excelExport.stamp'), { font: { sz: 10 } })
  setMergedCell(ws2, `D${r2}`, `D${r2}:E${r2}`, t('excelExport.stamp'), { font: { sz: 10 } })

  updateRange(ws2, r2, 5)
  XLSX.utils.book_append_sheet(wb, ws2, t('excelExport.sheetAct'))

  // Generate and save
  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const companyShort = company.name.replace(/[«»"'ОсОО\s]/g, '').substring(0, 20)
  const fileName = `${t('excelExport.fileReport')}_${report.year}_${companyShort}.xlsx`
  saveAs(new Blob([wbOut], { type: 'application/octet-stream' }), fileName)
}
