import { createI18n } from 'vue-i18n'
import ru from './locales/ru.json'
import kg from './locales/kg.json'
import { SELECTED_LOCAL_STORAGE_KEY } from '@/constants/keys'

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: localStorage.getItem(SELECTED_LOCAL_STORAGE_KEY) ?? 'kg',
    fallbackLocale: 'kg',
    messages: {
        ru,
        kg,
    },
    silentTranslationWarn: true,
    silentFallbackWarn: true,
})
