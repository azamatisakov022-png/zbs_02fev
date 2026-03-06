import { createI18n } from 'vue-i18n'
import ru from '../locales/ru.json'
import ky from '../locales/ky.json'
import en from '../locales/en.json'

export type AppLocale = 'ru' | 'ky' | 'en'

export const LOCALES: { code: AppLocale; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ky', label: 'Кыргызча', flag: '🇰🇬' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

const savedLocale = typeof localStorage !== 'undefined'
  ? localStorage.getItem('locale') || 'ru'
  : 'ru'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'ru',
  messages: { ru, ky, en },
})

// BCP 47 tags so browsers (date pickers, Intl, etc.) use the correct regional format
const htmlLangMap: Record<string, string> = { ru: 'ru-RU', ky: 'ky-KG', en: 'en-GB' }

// Set initial HTML lang attribute so native date pickers, calendars etc. follow the locale
if (typeof document !== 'undefined') {
  document.documentElement.lang = htmlLangMap[savedLocale] || savedLocale
}

// Expose i18n instance for non-component helpers (e.g. product-groups.ts)
;(globalThis as any).__app_i18n = i18n

export default i18n

export function setLocale(locale: AppLocale) {
  ;(i18n.global.locale as any).value = locale
  localStorage.setItem('locale', locale)
  // Update HTML lang attribute with proper BCP 47 tag
  document.documentElement.lang = htmlLangMap[locale] || locale
}

export function getLocale(): AppLocale {
  return (i18n.global.locale as any).value
}
