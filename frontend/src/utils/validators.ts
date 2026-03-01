/**
 * Form validation utilities for the project.
 * Each validator returns an error string or null if valid.
 */

import i18n from '../i18n'

function t(key: string, params?: Record<string, any>): string {
  return i18n.global.t(key, params) as string
}

export const validators = {
  required: (value: any, fieldName: string): string | null =>
    !value && value !== 0 ? t('validation.required', { field: fieldName }) : null,

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (!value) return null
    if (value.length < min) return t('validation.minLength', { field: fieldName, min })
    return null
  },

  positiveNumber: (value: any, fieldName: string): string | null => {
    if (value === '' || value === null || value === undefined) return null
    const num = Number(value)
    if (isNaN(num)) return t('validation.enterNumber', { field: fieldName })
    if (num < 0) return t('validation.negativeNotAllowed', { field: fieldName })
    return null
  },

  maxValue: (value: any, max: number, fieldName: string): string | null =>
    Number(value) > max ? t('validation.maxValue', { field: fieldName, max }) : null,

  inn: (value: string): string | null => {
    if (!value) return null
    if (!/^\d{14}$/.test(value)) return t('validation.inn')
    return null
  },

  email: (value: string): string | null => {
    if (!value) return null
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value))
      return t('validation.email')
    return null
  },

  password: (value: string): string | null => {
    if (!value) return null
    if (value.length < 8) return t('validation.passwordMinLength', { min: 8 })
    if (value.length > 72) return t('validation.passwordMaxLength', { max: 72 })
    if (!/[A-Za-zА-Яа-яЁё]/.test(value) || !/\d/.test(value))
      return t('validation.passwordComplexity')
    return null
  },

  phone: (value: string): string | null => {
    if (!value) return null
    if (!/^\+?996\d{9}$/.test(value.replace(/[\s()-]/g, ''))) return t('validation.phone')
    return null
  },

  fileSize: (file: File | null, maxMB: number): string | null =>
    file && file.size > maxMB * 1024 * 1024 ? t('validation.fileSize', { max: maxMB }) : null,

  fileType: (file: File | null, types: string[]): string | null => {
    if (!file) return null
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!types.includes(ext)) return t('validation.fileType', { types: types.join(', ') })
    return null
  },
}

/**
 * Scroll to the first element with validation error.
 */
export function scrollToFirstError(): void {
  setTimeout(() => {
    const el = document.querySelector('.vld-error, .app-input__error, [data-validation-error]')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 50)
}
