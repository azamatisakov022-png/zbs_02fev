import { createI18n } from 'vue-i18n'
import ru from './locales/ru.json'
import ky from './locales/kg.json'
import { SELECTED_LOCAL_STORAGE_KEY } from '@/constants/keys'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem(SELECTED_LOCAL_STORAGE_KEY) ?? 'ky',
    fallbackLocale: 'ky',
    messages: {
        ru,
        ky,
    },
    silentTranslationWarn: true,
    silentFallbackWarn: true,
})

export { i18n }
export default i18n

export function setLocale(locale: string) {
  ;(i18n.global.locale as any).value = locale
  localStorage.setItem(SELECTED_LOCAL_STORAGE_KEY, locale)
}

export function getLocale(): string {
  return (i18n.global.locale as any).value
}
