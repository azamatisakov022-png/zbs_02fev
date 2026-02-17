/**
 * Form validation utilities for the project.
 * Each validator returns an error string or null if valid.
 */

export const validators = {
  required: (value: any, fieldName: string): string | null =>
    !value && value !== 0 ? `${fieldName} — обязательное поле` : null,

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (!value) return null
    if (value.length < min) return `${fieldName} — минимум ${min} символов`
    return null
  },

  positiveNumber: (value: any, fieldName: string): string | null => {
    if (value === '' || value === null || value === undefined) return null
    const num = Number(value)
    if (isNaN(num)) return `${fieldName} — введите число`
    if (num < 0) return `${fieldName} — значение не может быть отрицательным`
    return null
  },

  maxValue: (value: any, max: number, fieldName: string): string | null =>
    Number(value) > max ? `${fieldName} не может превышать ${max}` : null,

  inn: (value: string): string | null => {
    if (!value) return null
    if (!/^\d{14}$/.test(value)) return 'ИНН должен содержать 14 цифр'
    return null
  },

  email: (value: string): string | null => {
    if (!value) return null
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Некорректный email'
    return null
  },

  phone: (value: string): string | null => {
    if (!value) return null
    if (!/^\+?996\d{9}$/.test(value.replace(/[\s()-]/g, ''))) return 'Формат: +996 XXX XXX XXX'
    return null
  },

  fileSize: (file: File | null, maxMB: number): string | null =>
    file && file.size > maxMB * 1024 * 1024 ? `Максимальный размер файла: ${maxMB} МБ` : null,

  fileType: (file: File | null, types: string[]): string | null => {
    if (!file) return null
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!types.includes(ext)) return `Допустимые форматы: ${types.join(', ')}`
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
