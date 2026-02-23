import { setLocale } from 'yup'
import { i18n } from './index'
import { watch } from 'vue'

export const applyYupLocale = () => {
    setLocale({
        mixed: {
            required: () => i18n.global.t('validation.required'),
            notType: ({ type }) => {
                return i18n.global.t(`validation.notType.${type}`)
                    || i18n.global.t('validation.notType.default')
            },
        },
        string: {
            email: () => i18n.global.t('validation.email'),
        },
        number: {
            integer: () => i18n.global.t('validation.integer'),
        },
    })
}


applyYupLocale()


watch(
    () => i18n.global.locale.value,
    () => {
        applyYupLocale()
    },
)
