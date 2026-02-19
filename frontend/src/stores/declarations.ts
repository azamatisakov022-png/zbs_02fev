import { reactive } from 'vue'
import api from '../api/client'

export type DeclarationStatus = 'Черновик' | 'На рассмотрении' | 'Одобрена' | 'Отклонена' | 'На доработке'

export interface DeclarationCalcItem {
  number: string
  period: string
  categories: string
  mass: number
  amount: number
  calcStatus: string
  acceptedDate: string
}

export interface DeclarationReportItem {
  number: string
  period: string
  categories: string
  processed: number
  credited: number
  reportStatus: string
  acceptedDate: string
}

export interface DeclarationPayment {
  date: string
  number: string
  amount: number
  method: string
  paymentStatus: string
}

export interface DeclarationDocument {
  id: number
  name: string
  size: string
  source: string
}

export interface HistoryEntry {
  id: number
  action: string
  date: string
  user: string
  comment?: string
}

export interface Declaration {
  id: number
  number: string
  submittedAt: string
  submittedBy: string
  company: string
  opf: string
  inn: string
  address: string
  contactPerson: string
  phone: string
  email: string
  reportingYear: string

  calculationCount: number
  totalCharged: number
  totalPaid: number
  balance: number

  calculations: DeclarationCalcItem[]
  reports: DeclarationReportItem[]
  payments: DeclarationPayment[]
  documents: DeclarationDocument[]

  status: DeclarationStatus
  reviewComment?: string
  reviewDate?: string
  reviewer?: string
  history: HistoryEntry[]
}

let nextHistoryId = 100

const state = reactive<{ declarations: Declaration[] }>({
  declarations: [
    // 1 — На рассмотрении (ТехПром)
    {
      id: 1,
      number: 'ДЕК-2026-0001',
      submittedAt: '05.02.2026',
      submittedBy: 'Абдыкеримов К.Б.',
      company: 'ОсОО «ТехПром»',
      opf: 'ОсОО',
      inn: '01234567890123',
      address: 'г. Бишкек, ул. Московская, 123',
      contactPerson: 'Абдыкеримов Кубанычбек Бакытович',
      phone: '+996 555 12-34-56',
      email: 'info@techprom.kg',
      reportingYear: '2025',
      calculationCount: 3,
      totalCharged: 3_180_000,
      totalPaid: 2_856_425,
      balance: -323_575,
      calculations: [
        { number: 'РС-2026-015', period: 'Q4 2025', categories: 'Пластмассы, Бумага/картон, Стекло', mass: 8.0, amount: 3_472, calcStatus: 'Оплачено', acceptedDate: '20.01.2026' },
        { number: 'РС-2025-089', period: 'Q3 2025', categories: 'Пластмассы, Бумага/картон, Стекло', mass: 6.8, amount: 8_221, calcStatus: 'Принято', acceptedDate: '15.10.2025' },
        { number: 'РС-2026-379', period: 'Q1 2026', categories: 'Пластмассы, Бумага/картон, Стекло', mass: 850.0, amount: 1_089_128, calcStatus: 'На проверке', acceptedDate: '—' },
      ],
      reports: [
        { number: 'РП-2026-012', period: '2025', categories: 'Пластмассы, Бумага/картон, Стекло', processed: 25.1, credited: 48_200, reportStatus: 'На проверке', acceptedDate: '—' },
      ],
      payments: [
        { date: '24.01.2026', number: 'ПП-00412', amount: 6_322, method: 'Банковский перевод', paymentStatus: 'Подтверждён' },
        { date: '28.01.2026', number: 'ПП-00498', amount: 2_850_103, method: 'Банковский перевод', paymentStatus: 'Подтверждён' },
      ],
      documents: [
        { id: 1, name: 'акт_приёма_передачи_пластик.pdf', size: '1.2 MB', source: 'Расчёт РС-2026-015' },
        { id: 2, name: 'акт_переработка_Q3.pdf', size: '845 KB', source: 'Расчёт РС-2025-089' },
        { id: 3, name: 'act_priema_peredachi_2025.pdf', size: '1.2 MB', source: 'Отчёт РП-2026-012' },
        { id: 4, name: 'dogovor_ecorecycle.pdf', size: '845 KB', source: 'Отчёт РП-2026-012' },
      ],
      status: 'На рассмотрении',
      history: [
        { id: 1, action: 'Декларация подана', date: '05.02.2026 14:32', user: 'Абдыкеримов К.Б.', comment: 'Годовая декларация за 2025 год' },
      ],
    },
    // 2 — На рассмотрении (СтройМаркет)
    {
      id: 2,
      number: 'ДЕК-2026-0002',
      submittedAt: '06.02.2026',
      submittedBy: 'Сыдыков А.Т.',
      company: 'ОАО «СтройМаркет»',
      opf: 'ОАО',
      inn: '09876543210987',
      address: 'с. Беловодское, ул. Ленина, 15',
      contactPerson: 'Сыдыков Аскар Толкунович',
      phone: '+996 770 98-76-54',
      email: 'stroymarket@mail.kg',
      reportingYear: '2025',
      calculationCount: 1,
      totalCharged: 8_739,
      totalPaid: 0,
      balance: -8_739,
      calculations: [
        { number: 'РС-2026-018', period: 'Q4 2025', categories: 'Пластмассы, Бумага/картон, Стекло', mass: 12.1, amount: 8_739, calcStatus: 'На проверке', acceptedDate: '—' },
      ],
      reports: [
        { number: 'РП-2026-019', period: '2025', categories: 'Пластмассы, Бумага/картон, Металлы', processed: 28.0, credited: 65_400, reportStatus: 'На проверке', acceptedDate: '—' },
      ],
      payments: [],
      documents: [
        { id: 1, name: 'акт_переработка_пластик.pdf', size: '2.1 MB', source: 'Расчёт РС-2026-018' },
        { id: 2, name: 'ГТД_вывоз_стекло.pdf', size: '980 KB', source: 'Расчёт РС-2026-018' },
        { id: 3, name: 'akty_pererabotki_stroymarket.pdf', size: '3.4 MB', source: 'Отчёт РП-2026-019' },
      ],
      status: 'На рассмотрении',
      history: [
        { id: 2, action: 'Декларация подана', date: '06.02.2026 09:15', user: 'Сыдыков А.Т.', comment: 'Годовая декларация за 2025 год' },
      ],
    },
    // 3 — Одобрена (КыргызИмпорт)
    {
      id: 3,
      number: 'ДЕК-2026-0003',
      submittedAt: '01.02.2026',
      submittedBy: 'Молдобаев Э.К.',
      company: 'ОсОО «КыргызИмпорт»',
      opf: 'ОсОО',
      inn: '03216549870321',
      address: 'г. Бишкек, пр. Чуй, 200',
      contactPerson: 'Молдобаев Эрнис Калыкович',
      phone: '+996 550 32-16-54',
      email: 'import@kyrgyz.kg',
      reportingYear: '2025',
      calculationCount: 1,
      totalCharged: 2_126_425,
      totalPaid: 2_126_425,
      balance: 0,
      calculations: [
        { number: 'РС-2026-375', period: 'Q4 2025', categories: 'Пластмассы, Бумага/картон, Стекло', mass: 1700.0, amount: 2_126_425, calcStatus: 'Принято', acceptedDate: '03.02.2026' },
      ],
      reports: [],
      payments: [
        { date: '04.02.2026', number: 'ПП-00621', amount: 2_126_425, method: 'Банковский перевод', paymentStatus: 'Подтверждён' },
      ],
      documents: [
        { id: 1, name: 'акт_переработка_пластик.pdf', size: '1.8 MB', source: 'Расчёт РС-2026-375' },
        { id: 2, name: 'ГТД_вывоз_КР.pdf', size: '2.3 MB', source: 'Расчёт РС-2026-375' },
      ],
      status: 'Одобрена',
      reviewComment: 'Все данные корректны, расхождений не выявлено.',
      reviewDate: '07.02.2026',
      reviewer: 'Асанов Б.Т.',
      history: [
        { id: 3, action: 'Декларация подана', date: '01.02.2026 11:20', user: 'Молдобаев Э.К.' },
        { id: 4, action: 'Декларация одобрена', date: '07.02.2026 16:45', user: 'Асанов Б.Т.', comment: 'Все данные корректны, расхождений не выявлено.' },
      ],
    },
    // 4 — Одобрена (ПищеПром)
    {
      id: 4,
      number: 'ДЕК-2026-0004',
      submittedAt: '30.01.2026',
      submittedBy: 'Турсунова Г.М.',
      company: 'ОсОО «ПищеПром»',
      opf: 'ОсОО',
      inn: '05432109876543',
      address: 'г. Бишкек, ул. Жибек-Жолу, 45',
      contactPerson: 'Турсунова Гульмира Маратовна',
      phone: '+996 555 54-32-10',
      email: 'pischeprom@inbox.kg',
      reportingYear: '2025',
      calculationCount: 2,
      totalCharged: 9_251,
      totalPaid: 5_205,
      balance: -4_046,
      calculations: [
        { number: 'РС-2026-021', period: 'Q4 2025', categories: 'Пластмассы, Бумага/картон, Стекло', mass: 4.1, amount: 4_046, calcStatus: 'На проверке', acceptedDate: '—' },
        { number: 'РС-2026-027', period: 'Q3 2025', categories: 'Пластмассы, Бумага/картон', mass: 3.5, amount: 5_205, calcStatus: 'Оплата на проверке', acceptedDate: '—' },
      ],
      reports: [
        { number: 'РП-2026-020', period: '2025', categories: 'Пластмассы, Бумага/картон', processed: 6.5, credited: 12_800, reportStatus: 'Отклонён', acceptedDate: '—' },
      ],
      payments: [
        { date: '29.01.2026', number: 'ПП-00587', amount: 5_205, method: 'Банковский перевод', paymentStatus: 'На проверке' },
      ],
      documents: [
        { id: 1, name: 'otchet_pischeprom_2025.pdf', size: '1.8 MB', source: 'Отчёт РП-2026-020' },
      ],
      status: 'Одобрена',
      reviewComment: 'Декларация принята. Рекомендовано обратить внимание на низкий процент переработки.',
      reviewDate: '08.02.2026',
      reviewer: 'Касымова Н.Р.',
      history: [
        { id: 5, action: 'Декларация подана', date: '30.01.2026 16:00', user: 'Турсунова Г.М.' },
        { id: 6, action: 'Декларация одобрена', date: '08.02.2026 10:30', user: 'Касымова Н.Р.', comment: 'Декларация принята. Рекомендовано обратить внимание на низкий процент переработки.' },
      ],
    },
    // 5 — Отклонена (АзияТрейд)
    {
      id: 5,
      number: 'ДЕК-2026-0005',
      submittedAt: '02.02.2026',
      submittedBy: 'Жумабеков Д.А.',
      company: 'ОсОО «АзияТрейд»',
      opf: 'ОсОО',
      inn: '06543210987654',
      address: 'г. Бишкек, ул. Абдрахманова, 170',
      contactPerson: 'Жумабеков Данияр Асанович',
      phone: '+996 700 65-43-21',
      email: 'asia-trade@bk.ru',
      reportingYear: '2025',
      calculationCount: 1,
      totalCharged: 600_512,
      totalPaid: 0,
      balance: -600_512,
      calculations: [
        { number: 'РС-2026-370', period: 'Q4 2025', categories: 'Пластмассы, Бумага/картон, Стекло', mass: 430.0, amount: 600_512, calcStatus: 'Отклонено', acceptedDate: '—' },
      ],
      reports: [],
      payments: [],
      documents: [
        { id: 1, name: 'декларация_импорт.pdf', size: '1.5 MB', source: 'Расчёт РС-2026-370' },
      ],
      status: 'Отклонена',
      reviewComment: 'В расчёте РС-2026-370 выявлены расхождения: неверно указан объём для группы 8 (стекло). Расчёт отклонён, необходимо пересчитать и подать декларацию повторно.',
      reviewDate: '09.02.2026',
      reviewer: 'Асанов Б.Т.',
      history: [
        { id: 7, action: 'Декларация подана', date: '02.02.2026 12:10', user: 'Жумабеков Д.А.' },
        { id: 8, action: 'Декларация отклонена', date: '09.02.2026 14:20', user: 'Асанов Б.Т.', comment: 'В расчёте РС-2026-370 выявлены расхождения: неверно указан объём для группы 8 (стекло). Расчёт отклонён, необходимо пересчитать и подать декларацию повторно.' },
      ],
    },
    // 6 — На доработке (ЭкоТранс)
    {
      id: 6,
      number: 'ДЕК-2026-0006',
      submittedAt: '07.02.2026',
      submittedBy: 'Бакиров Т.Н.',
      company: 'ОсОО «ЭкоТранс»',
      opf: 'ОсОО',
      inn: '07654321098765',
      address: 'г. Ош, ул. Курманжан Датки, 56',
      contactPerson: 'Бакиров Таалайбек Нурланович',
      phone: '+996 555 76-54-32',
      email: 'ecotrans@osh.kg',
      reportingYear: '2026',
      calculationCount: 1,
      totalCharged: 415_568,
      totalPaid: 0,
      balance: -415_568,
      calculations: [
        { number: 'РС-2026-380', period: 'Q1 2026', categories: 'Пластмассы, Бумага/картон', mass: 280.0, amount: 415_568, calcStatus: 'На проверке', acceptedDate: '—' },
      ],
      reports: [],
      payments: [],
      documents: [
        { id: 1, name: 'акт_переработка_пластик_ЭкоТранс.pdf', size: '2.4 MB', source: 'Расчёт РС-2026-380' },
        { id: 2, name: 'акт_переработка_бумага_ЭкоТранс.pdf', size: '1.1 MB', source: 'Расчёт РС-2026-380' },
      ],
      status: 'На доработке',
      reviewComment: 'Не приложены подтверждающие документы по переработке бумаги/картона (группа 1). Необходимо дополнить акты приёма-передачи от переработчика и повторно подать декларацию.',
      reviewDate: '10.02.2026',
      reviewer: 'Касымова Н.Р.',
      history: [
        { id: 9, action: 'Декларация подана', date: '07.02.2026 10:45', user: 'Бакиров Т.Н.' },
        { id: 10, action: 'Возвращена на доработку', date: '10.02.2026 11:30', user: 'Касымова Н.Р.', comment: 'Не приложены подтверждающие документы по переработке бумаги/картона (группа 1). Необходимо дополнить акты приёма-передачи от переработчика и повторно подать декларацию.' },
      ],
    },
  ],
})

async function fetchAll() {
  try {
    const { data } = await api.get('/declarations')
    if (Array.isArray(data)) {
      state.declarations = data
    } else if (data?.content && Array.isArray(data.content)) {
      state.declarations = data.content
    }
  } catch { /* keep local data */ }
}

function getById(id: number): Declaration | undefined {
  return state.declarations.find(d => d.id === id)
}

function approveDeclaration(id: number, comment?: string) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== 'На рассмотрении')) return
  const now = new Date()
  decl.status = 'Одобрена'
  decl.reviewComment = comment || undefined
  decl.reviewDate = now.toLocaleDateString('ru-RU')
  decl.reviewer = 'Асанов Б.Т.'
  decl.history.push({
    id: nextHistoryId++,
    action: 'Декларация одобрена',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    user: 'Асанов Б.Т.',
    comment: comment || undefined,
  })
  api.post(`/declarations/${id}/approve`, { comment }).catch(() => {})
}

function rejectDeclaration(id: number, reason: string) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== 'На рассмотрении')) return
  const now = new Date()
  decl.status = 'Отклонена'
  decl.reviewComment = reason
  decl.reviewDate = now.toLocaleDateString('ru-RU')
  decl.reviewer = 'Асанов Б.Т.'
  decl.history.push({
    id: nextHistoryId++,
    action: 'Декларация отклонена',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    user: 'Асанов Б.Т.',
    comment: reason,
  })
  api.post(`/declarations/${id}/reject`, { reason }).catch(() => {})
}

function returnForRevision(id: number, comment: string) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== 'На рассмотрении')) return
  const now = new Date()
  decl.status = 'На доработке'
  decl.reviewComment = comment
  decl.reviewDate = now.toLocaleDateString('ru-RU')
  decl.reviewer = 'Асанов Б.Т.'
  decl.history.push({
    id: nextHistoryId++,
    action: 'Возвращена на доработку',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    user: 'Асанов Б.Т.',
    comment,
  })
  api.post(`/declarations/${id}/return`, { comment }).catch(() => {})
}

function resubmitDeclaration(id: number) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== 'На доработке' && decl.status !== 'Отклонена')) return
  const now = new Date()
  decl.status = 'На рассмотрении'
  decl.reviewComment = undefined
  decl.reviewDate = undefined
  decl.reviewer = undefined
  decl.history.push({
    id: nextHistoryId++,
    action: 'Декларация повторно подана',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    user: decl.submittedBy,
  })
  api.post(`/declarations/${id}/resubmit`).catch(() => {})
}

let nextId = 7

function addDeclaration(data: {
  company: string
  opf: string
  inn: string
  address: string
  contactPerson: string
  phone: string
  email: string
  reportingYear: string
  calculationCount: number
  totalCharged: number
  totalPaid: number
  balance: number
  calculations: DeclarationCalcItem[]
  reports: DeclarationReportItem[]
  payments: DeclarationPayment[]
  documents: DeclarationDocument[]
}, status: DeclarationStatus = 'На рассмотрении'): Declaration {
  const now = new Date()
  const num = String(state.declarations.length + 1).padStart(4, '0')
  const decl: Declaration = {
    id: nextId++,
    number: `ДЕК-${now.getFullYear()}-${num}`,
    submittedAt: now.toLocaleDateString('ru-RU'),
    submittedBy: data.contactPerson || data.company,
    ...data,
    status,
    history: [{
      id: nextHistoryId++,
      action: status === 'Черновик' ? 'Черновик создан' : 'Декларация подана',
      date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
      user: data.contactPerson || data.company,
    }],
  }
  state.declarations.unshift(decl)
  api.post('/declarations', data).catch(() => {})
  return decl
}

function submitDraft(id: number) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || decl.status !== 'Черновик') return
  const now = new Date()
  decl.status = 'На рассмотрении'
  decl.submittedAt = now.toLocaleDateString('ru-RU')
  decl.history.push({
    id: nextHistoryId++,
    action: 'Декларация подана',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    user: decl.submittedBy,
  })
  api.post(`/declarations/${id}/submit`).catch(() => {})
}

function getPendingCount() {
  return state.declarations.filter(d => d.status === 'На рассмотрении').length
}

function getByCompany(company: string) {
  return state.declarations.filter(d => d.company === company)
}

export const declarationStore = {
  state,
  fetchAll,
  getById,
  addDeclaration,
  submitDraft,
  approveDeclaration,
  rejectDeclaration,
  returnForRevision,
  resubmitDeclaration,
  getPendingCount,
  getByCompany,
}
