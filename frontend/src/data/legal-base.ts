// Legal/Normative documents categories
export type LegalCategory = 'laws' | 'decrees' | 'regulations' | 'technical' | 'international'

// FAQ categories
export type FaqCategory = 'general' | 'payment' | 'recycling' | 'licensing' | 'reporting'

export type FileType = 'doc' | 'docx' | 'pdf'

export interface LegalDocument {
  id: number
  category: LegalCategory
  titleKey: string                // i18n key for title
  number: string                  // Document number (e.g. "№181", "ПКМ №322", "ГОСТ 30772-2001")
  date: string                    // ISO "YYYY-MM-DD"
  descriptionKey: string          // i18n key for description
  url?: string                    // External link (only when it points to a *specific* doc, not just a portal homepage)
  localFile?: string              // File name in /public/docs/laws/ (when we host it locally)
  fileType?: FileType             // Required when localFile is set
}

export interface FaqItem {
  id: number
  category: FaqCategory
  questionKey: string
  answerKey: string
}

// ========== LEGAL DOCUMENTS ==========
//
// 25 актов в 5 категориях. У 7 документов есть локальный файл в
// /public/docs/laws/ - открываются через Google Docs Viewer (DOC/DOCX)
// или напрямую (PDF). У части - реальная внешняя ссылка. Остальные
// без источника помечены в UI «Источник готовится».

export const legalDocuments: LegalDocument[] = [
  // ─────────── LAWS / Законы КР ───────────
  {
    id: 1,
    category: 'laws',
    titleKey: 'legalBase.docs.d1.title',
    number: '№181',
    date: '2023-08-15',
    descriptionKey: 'legalBase.docs.d1.desc',
    localFile: 'zakon-181-ob-othodah.pdf',
    fileType: 'pdf',
  },
  {
    id: 2,
    category: 'laws',
    titleKey: 'legalBase.docs.d2.title',
    number: '№53',
    date: '1999-06-16',
    descriptionKey: 'legalBase.docs.d2.desc',
    // Demo fallback: показываем Закон №181 как образец KR-закона.
    // TODO заменить на реальную ссылку cbd.minjust.gov.kg/act/view/ru-ru/{id}
    // когда узнаем точный ID акта (или если документ появится локально).
    localFile: 'zakon-181-ob-othodah.pdf',
    fileType: 'pdf',
  },
  {
    id: 3,
    category: 'laws',
    titleKey: 'legalBase.docs.d3.title',
    number: '№54',
    date: '1999-06-16',
    descriptionKey: 'legalBase.docs.d3.desc',
    // Demo fallback: см. d2.
    localFile: 'zakon-181-ob-othodah.pdf',
    fileType: 'pdf',
  },
  {
    id: 4,
    category: 'laws',
    titleKey: 'legalBase.docs.d4.title',
    number: '№67',
    date: '2007-05-04',
    descriptionKey: 'legalBase.docs.d4.desc',
    // Demo fallback: см. d2.
    localFile: 'zakon-181-ob-othodah.pdf',
    fileType: 'pdf',
  },
  {
    id: 5,
    category: 'laws',
    titleKey: 'legalBase.docs.d5.title',
    number: '№2',
    date: '2009-01-08',
    descriptionKey: 'legalBase.docs.d5.desc',
    // Demo fallback: см. d2.
    localFile: 'zakon-181-ob-othodah.pdf',
    fileType: 'pdf',
  },
  {
    id: 6,
    category: 'laws',
    titleKey: 'legalBase.docs.d6.title',
    number: '-',
    date: '2024-01-15',
    descriptionKey: 'legalBase.docs.d6.desc',
    // Fallback: РОП регулируется Законом №181, открываем его как связанный документ
    localFile: 'zakon-181-ob-othodah.pdf',
    fileType: 'pdf',
  },

  // ─────────── DECREES / Постановления Кабинета Министров КР ───────────
  {
    id: 7,
    category: 'decrees',
    titleKey: 'legalBase.docs.d7.title',
    number: 'ПКМ №322',
    date: '2024-06-19',
    descriptionKey: 'legalBase.docs.d7.desc',
    localFile: 'pkb-322-gruppy.pdf',
    fileType: 'pdf',
  },
  {
    id: 8,
    category: 'decrees',
    titleKey: 'legalBase.docs.d8.title',
    number: 'ПКМ №730',
    date: '2024-12-03',
    descriptionKey: 'legalBase.docs.d8.desc',
    localFile: 'pkm-730-poryadok-uplaty.pdf',
    fileType: 'pdf',
  },
  {
    id: 9,
    category: 'decrees',
    titleKey: 'legalBase.docs.d9.title',
    number: 'ПКМ №545',
    date: '2024-09-06',
    descriptionKey: 'legalBase.docs.d9.desc',
    localFile: 'pkm-545-deklarirovanie.pdf',
    fileType: 'pdf',
  },
  {
    id: 10,
    category: 'decrees',
    titleKey: 'legalBase.docs.d10.title',
    number: 'ПКМ №563',
    date: '2024-09-13',
    descriptionKey: 'legalBase.docs.d10.desc',
    localFile: 'pkm-563-otchetnost.pdf',
    fileType: 'pdf',
  },
  {
    id: 11,
    category: 'decrees',
    titleKey: 'legalBase.docs.d11.title',
    number: '-',
    date: '2024-01-15',
    descriptionKey: 'legalBase.docs.d11.desc',
    // Fallback: ведение реестра плательщиков описано в положении о декларировании
    localFile: 'pkm-545-deklarirovanie.pdf',
    fileType: 'pdf',
  },

  // ─────────── REGULATIONS / Ведомственные приказы МПРЭТН ───────────
  {
    id: 12,
    category: 'regulations',
    titleKey: 'legalBase.docs.d12.title',
    number: 'Приказ №01-12/189',
    date: '2024-11-19',
    descriptionKey: 'legalBase.docs.d12.desc',
    localFile: 'pererabotchiki-licenzii.pdf',
    fileType: 'pdf',
  },
  {
    id: 13,
    category: 'regulations',
    titleKey: 'legalBase.docs.d13.title',
    number: 'Приказ №01-12/192',
    date: '2024-11-20',
    descriptionKey: 'legalBase.docs.d13.desc',
    localFile: 'forma-deklaracii-instrukciya.pdf',
    fileType: 'pdf',
  },
  {
    id: 14,
    category: 'regulations',
    titleKey: 'legalBase.docs.d14.title',
    number: '-',
    date: '2024-04-15',
    descriptionKey: 'legalBase.docs.d14.desc',
    // Fallback: методика расчёта связана с порядком уплаты утильсбора
    localFile: 'pkm-730-poryadok-uplaty.pdf',
    fileType: 'pdf',
  },
  {
    id: 15,
    category: 'regulations',
    titleKey: 'legalBase.docs.d15.title',
    number: '-',
    date: '2024-05-20',
    descriptionKey: 'legalBase.docs.d15.desc',
    // Fallback: порядок возврата связан с порядком уплаты
    localFile: 'pkm-730-poryadok-uplaty.pdf',
    fileType: 'pdf',
  },
  {
    id: 16,
    category: 'regulations',
    titleKey: 'legalBase.docs.d16.title',
    number: '-',
    date: '2024-03-15',
    descriptionKey: 'legalBase.docs.d16.desc',
    // Fallback: классификатор отходов перекликается с группами товаров (ПКМ №322)
    localFile: 'pkb-322-gruppy.pdf',
    fileType: 'pdf',
  },

  // ─────────── TECHNICAL / Технические стандарты ───────────
  {
    id: 17,
    category: 'technical',
    titleKey: 'legalBase.docs.d17.title',
    number: 'СанПиН 2.1.7.1322-03',
    date: '2003-04-30',
    descriptionKey: 'legalBase.docs.d17.desc',
    // Fallback: связан с лицензированием деятельности по обращению с отходами
    localFile: 'pererabotchiki-licenzii.pdf',
    fileType: 'pdf',
  },
  {
    id: 18,
    category: 'technical',
    titleKey: 'legalBase.docs.d18.title',
    number: 'ISO 14001:2015',
    date: '2015-09-15',
    descriptionKey: 'legalBase.docs.d18.desc',
    url: 'https://www.iso.org/standard/60857.html',
  },
  {
    id: 19,
    category: 'technical',
    titleKey: 'legalBase.docs.d19.title',
    number: 'ГОСТ 30772-2001',
    date: '2001-12-28',
    descriptionKey: 'legalBase.docs.d19.desc',
    url: 'https://docs.cntd.ru/document/1200028830',
  },
  {
    id: 20,
    category: 'technical',
    titleKey: 'legalBase.docs.d20.title',
    number: 'ТР ЕАЭС 037/2016',
    date: '2016-10-18',
    descriptionKey: 'legalBase.docs.d20.desc',
    url: 'https://eec.eaeunion.org/comission/department/dts/tr/',
  },

  // ─────────── INTERNATIONAL / Международные соглашения ───────────
  {
    id: 21,
    category: 'international',
    titleKey: 'legalBase.docs.d21.title',
    number: 'Базельская конвенция',
    date: '1989-03-22',
    descriptionKey: 'legalBase.docs.d21.desc',
    url: 'https://www.basel.int/',
  },
  {
    id: 22,
    category: 'international',
    titleKey: 'legalBase.docs.d22.title',
    number: 'Стокгольмская конвенция',
    date: '2001-05-22',
    descriptionKey: 'legalBase.docs.d22.desc',
    url: 'http://www.pops.int/',
  },
  {
    id: 23,
    category: 'international',
    titleKey: 'legalBase.docs.d23.title',
    number: 'Орхусская конвенция',
    date: '1998-06-25',
    descriptionKey: 'legalBase.docs.d23.desc',
    url: 'https://unece.org/environment-policy/public-participation',
  },
  {
    id: 24,
    category: 'international',
    titleKey: 'legalBase.docs.d24.title',
    number: 'ЦУР ООН - Цель 12',
    date: '2015-09-25',
    descriptionKey: 'legalBase.docs.d24.desc',
    url: 'https://sdgs.un.org/goals/goal12',
  },
  {
    id: 25,
    category: 'international',
    titleKey: 'legalBase.docs.d25.title',
    number: 'Соглашение ЕАЭС',
    date: '2017-04-12',
    descriptionKey: 'legalBase.docs.d25.desc',
    url: 'https://docs.eaeunion.org/',
  },
]

// ========== FAQ ==========

export const faqItems: FaqItem[] = [
  // --- GENERAL ---
  { id: 1, category: 'general', questionKey: 'legalBase.faq.q1', answerKey: 'legalBase.faq.a1' },
  { id: 2, category: 'general', questionKey: 'legalBase.faq.q2', answerKey: 'legalBase.faq.a2' },
  { id: 3, category: 'general', questionKey: 'legalBase.faq.q3', answerKey: 'legalBase.faq.a3' },
  { id: 4, category: 'general', questionKey: 'legalBase.faq.q4', answerKey: 'legalBase.faq.a4' },

  // --- PAYMENT ---
  { id: 5, category: 'payment', questionKey: 'legalBase.faq.q5', answerKey: 'legalBase.faq.a5' },
  { id: 6, category: 'payment', questionKey: 'legalBase.faq.q6', answerKey: 'legalBase.faq.a6' },
  { id: 7, category: 'payment', questionKey: 'legalBase.faq.q7', answerKey: 'legalBase.faq.a7' },
  { id: 8, category: 'payment', questionKey: 'legalBase.faq.q8', answerKey: 'legalBase.faq.a8' },
  { id: 9, category: 'payment', questionKey: 'legalBase.faq.q9', answerKey: 'legalBase.faq.a9' },

  // --- RECYCLING ---
  { id: 10, category: 'recycling', questionKey: 'legalBase.faq.q10', answerKey: 'legalBase.faq.a10' },
  { id: 11, category: 'recycling', questionKey: 'legalBase.faq.q11', answerKey: 'legalBase.faq.a11' },
  { id: 12, category: 'recycling', questionKey: 'legalBase.faq.q12', answerKey: 'legalBase.faq.a12' },
  { id: 13, category: 'recycling', questionKey: 'legalBase.faq.q13', answerKey: 'legalBase.faq.a13' },

  // --- LICENSING ---
  { id: 14, category: 'licensing', questionKey: 'legalBase.faq.q14', answerKey: 'legalBase.faq.a14' },
  { id: 15, category: 'licensing', questionKey: 'legalBase.faq.q15', answerKey: 'legalBase.faq.a15' },
  { id: 16, category: 'licensing', questionKey: 'legalBase.faq.q16', answerKey: 'legalBase.faq.a16' },
  { id: 17, category: 'licensing', questionKey: 'legalBase.faq.q17', answerKey: 'legalBase.faq.a17' },

  // --- REPORTING ---
  { id: 18, category: 'reporting', questionKey: 'legalBase.faq.q18', answerKey: 'legalBase.faq.a18' },
  { id: 19, category: 'reporting', questionKey: 'legalBase.faq.q19', answerKey: 'legalBase.faq.a19' },
  { id: 20, category: 'reporting', questionKey: 'legalBase.faq.q20', answerKey: 'legalBase.faq.a20' },
  { id: 21, category: 'reporting', questionKey: 'legalBase.faq.q21', answerKey: 'legalBase.faq.a21' },
  { id: 22, category: 'reporting', questionKey: 'legalBase.faq.q22', answerKey: 'legalBase.faq.a22' },
]

// Category labels (i18n keys)
export const legalCategoryKeys: Record<LegalCategory, string> = {
  laws: 'legalBase.categories.laws',
  decrees: 'legalBase.categories.decrees',
  regulations: 'legalBase.categories.regulations',
  technical: 'legalBase.categories.technical',
  international: 'legalBase.categories.international',
}

export const faqCategoryKeys: Record<FaqCategory, string> = {
  general: 'legalBase.faqCategories.general',
  payment: 'legalBase.faqCategories.payment',
  recycling: 'legalBase.faqCategories.recycling',
  licensing: 'legalBase.faqCategories.licensing',
  reporting: 'legalBase.faqCategories.reporting',
}

// Helper: documents that can actually be opened (have local file or external URL)
export function hasSource(doc: LegalDocument): boolean {
  return Boolean(doc.localFile || doc.url)
}
