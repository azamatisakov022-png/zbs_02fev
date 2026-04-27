// Константы и хелперы для публичного реестра лицензий.
// Соответствуют ст. 20 Закона КР № 181 от 15.08.2023:
// 5 лицензируемых видов деятельности по обращению с отходами.
//
// Слово «обезвреживание» (закон 2023) в редакции 2026 заменено на «уничтожение» —
// в UI отображаем «Уничтожение», внутренний id оставлен neutralization.

import type { License, LicenseType } from '../../types/licenses'

export type Variant = 'dashboard' | 'timeline' | 'cards'

// 5 подвидов деятельности (ст. 20 Закона № 181):
//  - transport     транспортирование (включая трансграничное)
//  - treatment     обработка (сортировка, разборка, очистка)
//  - recycle       переработка (производство продукции/энергии)
//  - neutralization уничтожение (= обезвреживание: сжигание, обеззараживание)
//  - disposal      хранение и захоронение (= размещение)
export type KindId = 'transport' | 'treatment' | 'recycle' | 'neutralization' | 'disposal'

export interface KindMeta {
  id: KindId
  label: string
  short: string
  hue: number
}

export const KINDS: Record<KindId, KindMeta> = {
  transport: { id: 'transport', label: 'Транспортировка', short: 'Т', hue: 205 },
  treatment: { id: 'treatment', label: 'Обработка', short: 'О', hue: 260 },
  recycle: { id: 'recycle', label: 'Переработка', short: 'П', hue: 140 },
  neutralization: { id: 'neutralization', label: 'Уничтожение', short: 'У', hue: 0 },
  disposal: { id: 'disposal', label: 'Хранение и захоронение', short: 'Х', hue: 28 },
}

// Категория лицензии по бизнес-модели заказчика:
// transportation — отдельная лицензия на перевозку отходов;
// complex — лицензия «на всю деятельность с отходами» (с выбранными подвидами).
export type LicenseCategory = 'transportation' | 'complex'

// Старый бэкенд-enum (6 значений) → новый UI-подвид. Используется для
// показа уже выданных лицензий без миграции БД.
const LEGACY_LICENSE_TYPE_TO_KIND: Partial<Record<LicenseType, KindId>> = {
  transportation: 'transport',
  collection: 'treatment',          // legacy «сбор» в новой схеме относим к обработке
  processing: 'recycle',            // legacy processing = переработка
  neutralization: 'neutralization', // обезвреживание = уничтожение
  storage_disposal: 'disposal',     // хранение/захоронение = размещение
}

// Маппинг activityTypes (мультивыбор подвидов в complex-заявке) на KindId.
// Бэкенд хранит activityTypes как string[], мы понимаем эти ключи.
const ACTIVITY_TO_KIND: Record<string, KindId> = {
  treatment: 'treatment',
  recycling: 'recycle',
  recycle: 'recycle',
  neutralization: 'neutralization',
  destruction: 'neutralization',
  disposal: 'disposal',
  storage: 'disposal',
  storage_disposal: 'disposal',
  transportation: 'transport',
  transport: 'transport',
}

// Главный helper: возвращает все подвиды деятельности, которые покрывает
// данная лицензия. Для transportation = ['transport']. Для complex —
// активити-подвиды; если activityTypes не заданы (legacy) — выводим из
// исходного licenseType.
export function licenseToKinds(l: License): KindId[] {
  if (l.licenseType === 'transportation') return ['transport']

  const fromActivities = (l.activityTypes || [])
    .map(a => ACTIVITY_TO_KIND[a])
    .filter((k): k is KindId => Boolean(k))

  if (fromActivities.length > 0) {
    // Уникальные значения, сохраняя порядок.
    return Array.from(new Set(fromActivities))
  }

  // Legacy fallback.
  const legacy = LEGACY_LICENSE_TYPE_TO_KIND[l.licenseType]
  if (legacy) return [legacy]

  // complex без activityTypes — показываем все 4 подвида.
  if (l.licenseType === 'complex') {
    return ['treatment', 'recycle', 'neutralization', 'disposal']
  }

  return []
}

export function licenseCategory(l: License): LicenseCategory {
  return l.licenseType === 'transportation' ? 'transportation' : 'complex'
}

// Все activity-значения, которые форма заявления складывает в complex-лицензию.
export const ACTIVITY_OPTIONS: { value: string; kind: KindId; label: string }[] = [
  { value: 'treatment',      kind: 'treatment',      label: 'Обработка' },
  { value: 'recycling',      kind: 'recycle',        label: 'Переработка' },
  { value: 'neutralization', kind: 'neutralization', label: 'Уничтожение' },
  { value: 'disposal',       kind: 'disposal',       label: 'Хранение и захоронение' },
]

export type StatusKey = 'active' | 'expiring' | 'expired'

export interface StatusInfo {
  key: StatusKey
  label: string
  days: number
}

export interface LicenseUI {
  id: number
  num: string
  org: string
  inn: string
  kind: KindId           // главный (первый из kinds) — для бейджа в карточке
  kindMeta: KindMeta
  kinds: KindId[]        // все подвиды деятельности, которые покрывает лицензия
  category: LicenseCategory
  issued: Date
  expires: Date
  region: string
  address: string
  issuedByName?: string
  isRevoked: boolean
  hasDocument: boolean
  status: StatusInfo
  raw: License
}

export function parseISO(s?: string): Date {
  if (!s) return new Date(NaN)
  // handles both "YYYY-MM-DD" and full ISO
  const datePart = s.substring(0, 10)
  const [y, m, d] = datePart.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function fmt(d: Date | string | undefined): string {
  if (!d) return '—'
  const dt = typeof d === 'string' ? parseISO(d) : d
  if (isNaN(dt.getTime())) return '—'
  return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`
}

export function monthLabel(d: Date): string {
  const M = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
  return M[d.getMonth()]
}

export function ruPlural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}

// Все регионы КР, как они отображаются в реестре (8 значений согласовано с
// заказчиком 2026-04-27: г. Ош отнесён к Ошской, отдельно не выделяем).
export const KG_REGIONS = [
  'Бишкек',
  'Чуйская',
  'Ошская',
  'Джалал-Абадская',
  'Иссык-Кульская',
  'Нарынская',
  'Таласская',
  'Баткенская',
] as const

export type RegionKg = typeof KG_REGIONS[number]

// Нормализация legalAddress → один из 8 регионов. Маппится по ключевым
// словам и крупным населённым пунктам каждой области. Если адрес не
// распознан — возвращаем «—».
export function addressToRegion(legalAddress?: string): RegionKg | '—' {
  if (!legalAddress) return '—'
  const a = legalAddress.toLowerCase()
  // Бишкек — по г. Бишкек.
  if (/бишкек/.test(a)) return 'Бишкек'
  // Иссык-Кульская — Каракол, Балыкчы, Чолпон-Ата + явная «иссык-куль».
  if (/иссык[-\s]?куль|каракол|балыкчы|чолпон[-\s]?ата/.test(a)) return 'Иссык-Кульская'
  // Чуйская — Кара-Балта, Сокулук, Токмок, Кант + явная «чуйск».
  if (/чуйск|чуй\b|сокулук|кант\b|токмок|кара[-\s]?балта|кара[-\s]?балт/.test(a)) return 'Чуйская'
  // Нарынская.
  if (/нарын/.test(a)) return 'Нарынская'
  // Таласская.
  if (/талас/.test(a)) return 'Таласская'
  // Джалал-Абадская — Джалал-Абад, Таш-Кумыр, Майлы-Сай, Кара-Куль.
  if (/джалал[-\s]?абад|таш[-\s]?кумыр|майлы[-\s]?сай|кара[-\s]?куль/.test(a)) return 'Джалал-Абадская'
  // Баткенская.
  if (/баткен|сулюкта|кызыл[-\s]?кия/.test(a)) return 'Баткенская'
  // Ошская — Ош (город включаем сюда), Узген, Ноокат, Кара-Суу.
  if (/ошск|\bош\b|узген|ноокат|кара[-\s]?суу/.test(a)) return 'Ошская'
  return '—'
}

function statusFromLicense(l: License, today: Date): StatusInfo {
  if (l.statusLabel === 'revoked') {
    return { key: 'expired', label: 'Отозвана', days: 0 }
  }
  const exp = parseISO(l.validUntil)
  const d = daysBetween(today, exp)
  if (d < 0) return { key: 'expired', label: 'Истёкшая', days: d }
  if (d <= 90) return { key: 'expiring', label: 'Истекает', days: d }
  return { key: 'active', label: 'Действует', days: d }
}

export function toLicenseUI(l: License, today: Date = new Date()): LicenseUI {
  const kinds = licenseToKinds(l)
  const primaryKind: KindId = kinds[0] || 'treatment'
  return {
    id: l.id,
    num: l.licenseNumber,
    org: l.applicantName,
    inn: l.applicantInn,
    kind: primaryKind,
    kindMeta: KINDS[primaryKind],
    kinds,
    category: licenseCategory(l),
    issued: parseISO(l.issuedAt),
    expires: parseISO(l.validUntil),
    region: addressToRegion(l.legalAddress),
    address: l.legalAddress || '—',
    issuedByName: l.issuedByName,
    isRevoked: l.isRevoked,
    hasDocument: !!l.hasDocument,
    status: statusFromLicense(l, today),
    raw: l,
  }
}
