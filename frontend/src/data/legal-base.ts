// Legal/Normative documents categories
export type LegalCategory = 'laws' | 'decrees' | 'regulations' | 'technical' | 'international'

// FAQ categories
export type FaqCategory = 'general' | 'payment' | 'recycling' | 'licensing' | 'reporting'

export interface LegalDocument {
  id: number
  category: LegalCategory
  titleKey: string      // i18n key for title
  number: string        // Document number
  date: string          // e.g. "2001-11-13"
  descriptionKey: string // i18n key for description
  url?: string           // External link to official source
}

export interface FaqItem {
  id: number
  category: FaqCategory
  questionKey: string   // i18n key
  answerKey: string     // i18n key
}

// ========== LEGAL DOCUMENTS ==========

export const legalDocuments: LegalDocument[] = [
  // --- LAWS ---
  {
    id: 1,
    category: 'laws',
    titleKey: 'legalBase.docs.d1.title',
    number: '89-ФЗ',
    date: '2001-11-13',
    descriptionKey: 'legalBase.docs.d1.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },
  {
    id: 2,
    category: 'laws',
    titleKey: 'legalBase.docs.d2.title',
    number: '№ 151',
    date: '2001-06-25',
    descriptionKey: 'legalBase.docs.d2.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },
  {
    id: 3,
    category: 'laws',
    titleKey: 'legalBase.docs.d3.title',
    number: '№ 53',
    date: '1999-06-16',
    descriptionKey: 'legalBase.docs.d3.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },
  {
    id: 4,
    category: 'laws',
    titleKey: 'legalBase.docs.d4.title',
    number: '№ 67',
    date: '2007-05-04',
    descriptionKey: 'legalBase.docs.d4.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },
  {
    id: 5,
    category: 'laws',
    titleKey: 'legalBase.docs.d5.title',
    number: '№ 2',
    date: '2009-01-08',
    descriptionKey: 'legalBase.docs.d5.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },
  {
    id: 6,
    category: 'laws',
    titleKey: 'legalBase.docs.d6.title',
    number: '№ 71',
    date: '2015-07-18',
    descriptionKey: 'legalBase.docs.d6.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },

  // --- DECREES ---
  {
    id: 7,
    category: 'decrees',
    titleKey: 'legalBase.docs.d7.title',
    number: '№ 885',
    date: '2019-12-30',
    descriptionKey: 'legalBase.docs.d7.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },
  {
    id: 8,
    category: 'decrees',
    titleKey: 'legalBase.docs.d8.title',
    number: '№ 408',
    date: '2020-07-10',
    descriptionKey: 'legalBase.docs.d8.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },
  {
    id: 9,
    category: 'decrees',
    titleKey: 'legalBase.docs.d9.title',
    number: '№ 561',
    date: '2021-11-15',
    descriptionKey: 'legalBase.docs.d9.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },
  {
    id: 10,
    category: 'decrees',
    titleKey: 'legalBase.docs.d10.title',
    number: '№ 127',
    date: '2022-03-14',
    descriptionKey: 'legalBase.docs.d10.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },
  {
    id: 11,
    category: 'decrees',
    titleKey: 'legalBase.docs.d11.title',
    number: '№ 342',
    date: '2023-06-20',
    descriptionKey: 'legalBase.docs.d11.desc',
    url: 'http://cbd.minjust.gov.kg/',
  },

  // --- REGULATIONS ---
  {
    id: 12,
    category: 'regulations',
    titleKey: 'legalBase.docs.d12.title',
    number: 'Приказ № 01-12/45',
    date: '2020-03-15',
    descriptionKey: 'legalBase.docs.d12.desc',
  },
  {
    id: 13,
    category: 'regulations',
    titleKey: 'legalBase.docs.d13.title',
    number: 'Приказ № 01-12/78',
    date: '2021-05-20',
    descriptionKey: 'legalBase.docs.d13.desc',
  },
  {
    id: 14,
    category: 'regulations',
    titleKey: 'legalBase.docs.d14.title',
    number: 'Приказ № 01-12/112',
    date: '2022-08-10',
    descriptionKey: 'legalBase.docs.d14.desc',
  },
  {
    id: 15,
    category: 'regulations',
    titleKey: 'legalBase.docs.d15.title',
    number: 'Приказ № 01-12/156',
    date: '2023-11-28',
    descriptionKey: 'legalBase.docs.d15.desc',
  },
  {
    id: 16,
    category: 'regulations',
    titleKey: 'legalBase.docs.d16.title',
    number: 'Приказ № 01-12/189',
    date: '2024-04-15',
    descriptionKey: 'legalBase.docs.d16.desc',
  },

  // --- TECHNICAL ---
  {
    id: 17,
    category: 'technical',
    titleKey: 'legalBase.docs.d17.title',
    number: 'СанПиН 2.1.7.1322-03',
    date: '2003-04-30',
    descriptionKey: 'legalBase.docs.d17.desc',
  },
  {
    id: 18,
    category: 'technical',
    titleKey: 'legalBase.docs.d18.title',
    number: 'КМС ISO 14001',
    date: '2015-09-15',
    descriptionKey: 'legalBase.docs.d18.desc',
  },
  {
    id: 19,
    category: 'technical',
    titleKey: 'legalBase.docs.d19.title',
    number: 'ГОСТ 30772-2001',
    date: '2001-12-28',
    descriptionKey: 'legalBase.docs.d19.desc',
  },
  {
    id: 20,
    category: 'technical',
    titleKey: 'legalBase.docs.d20.title',
    number: 'ТР ЕАЭС 037/2016',
    date: '2016-10-18',
    descriptionKey: 'legalBase.docs.d20.desc',
  },

  // --- INTERNATIONAL ---
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
  },
  {
    id: 24,
    category: 'international',
    titleKey: 'legalBase.docs.d24.title',
    number: 'ЦУР ООН (Цель 12)',
    date: '2015-09-25',
    descriptionKey: 'legalBase.docs.d24.desc',
  },
  {
    id: 25,
    category: 'international',
    titleKey: 'legalBase.docs.d25.title',
    number: 'Соглашение ЕАЭС',
    date: '2017-04-12',
    descriptionKey: 'legalBase.docs.d25.desc',
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
