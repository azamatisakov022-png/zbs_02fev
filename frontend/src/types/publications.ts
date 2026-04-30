// TypeScript-типы модуля «Публикации».
// Согласованы с бэк-енумами kg.eco.operator.entity.enums.PublicationCategory
// и PublicationAuthorOrg.

export type PublicationCategory =
  | 'news'
  | 'contest'
  | 'report_analytics'
  | 'press'

export type PublicationAuthorOrg =
  | 'MPRETN'
  | 'ECO_OPERATOR'
  | 'ADMIN_GENERIC'

export type PublicationLang = 'ru' | 'ky' | 'en'

export interface PublicationListItem {
  id: number
  slug: string
  category: PublicationCategory
  authorOrg: PublicationAuthorOrg
  coverUrl: string
  title: string
  excerpt: string
  readMinutes: number
  isPublished: boolean
  publishedAt: string
}

export interface Publication {
  id: number
  slug: string
  category: PublicationCategory
  authorOrg: PublicationAuthorOrg
  coverUrl: string
  title: string
  excerpt: string
  body: string
  hasRu: boolean
  hasKy: boolean
  hasEn: boolean
  readMinutes: number
  isPublished: boolean
  publishedAt: string
  updatedAt?: string
  viewCount: number
}

export interface CreatePublicationRequest {
  category: PublicationCategory
  slug?: string | null
  coverUrl?: string | null
  titleRu: string
  titleKy?: string | null
  titleEn?: string | null
  excerptRu: string
  excerptKy?: string | null
  excerptEn?: string | null
  bodyRu: string
  bodyKy?: string | null
  bodyEn?: string | null
  readMinutes?: number | null
}

export interface PageResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ─── UI helpers ────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<PublicationCategory, string> = {
  news: 'Новости',
  contest: 'Конкурсы',
  report_analytics: 'Отчёты и аналитика',
  press: 'Пресс-релизы',
}

export const CATEGORY_COLORS: Record<PublicationCategory, string> = {
  news: '#10b981',           // emerald-500
  contest: '#f59e0b',        // amber-500
  report_analytics: '#0d9488', // teal-600
  press: '#475569',          // slate-600
}

export const AUTHOR_LABELS: Record<PublicationAuthorOrg, string> = {
  MPRETN: 'МПРЭТН КР',
  ECO_OPERATOR: 'ГП «Эко Оператор»',
  ADMIN_GENERIC: 'Администрация АИС',
}

export const AUTHOR_FULL_LABELS: Record<PublicationAuthorOrg, string> = {
  MPRETN: 'Министерство природных ресурсов, экологии и технического надзора КР',
  ECO_OPERATOR: 'ГП «Эко Оператор» при МПРЭТН КР',
  ADMIN_GENERIC: 'Администрация АИС',
}
