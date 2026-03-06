<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'DatePicker',
})

const { t, locale } = useI18n()

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  variant?: 'default' | 'form' | 'compact'
  label?: string
  disabled?: boolean
  error?: string
  min?: string
  max?: string
  size?: 'sm' | 'md'
}>(), {
  placeholder: '',
  variant: 'form',
  label: '',
  disabled: false,
  error: '',
  min: '',
  max: '',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const pickerRef = ref<HTMLElement | null>(null)

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const monthNames = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value === 'ky' ? 'ky-KG' : 'ru-RU', { month: 'long' })
  return Array.from({ length: 12 }, (_, i) => {
    const name = formatter.format(new Date(2024, i, 1))
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
})

const weekDays = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value === 'ky' ? 'ky-KG' : 'ru-RU', { weekday: 'short' })
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(2024, 0, i + 1)
    return formatter.format(day).slice(0, 2)
  })
})

const selectedDate = computed(() => {
  if (!props.modelValue) return null
  const [y, m, d] = props.modelValue.split('-').map(Number)
  return new Date(y, m - 1, d)
})

const displayValue = computed(() => {
  if (!selectedDate.value) return props.placeholder || t('penalty.selectDate')
  return selectedDate.value.toLocaleDateString(locale.value === 'ky' ? 'ky-KG' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)

  let startWeekday = firstDay.getDay()
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1

  const days: { date: Date; currentMonth: boolean; disabled: boolean }[] = []

  const prevMonthLast = new Date(currentYear.value, currentMonth.value, 0)
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(currentYear.value, currentMonth.value - 1, prevMonthLast.getDate() - i)
    days.push({ date: d, currentMonth: false, disabled: isDateDisabled(d) })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(currentYear.value, currentMonth.value, i)
    days.push({ date: d, currentMonth: true, disabled: isDateDisabled(d) })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({ date: d, currentMonth: false, disabled: isDateDisabled(d) })
  }

  return days
})

function isDateDisabled(date: Date): boolean {
  if (props.min) {
    const [y, m, d] = props.min.split('-').map(Number)
    const minDate = new Date(y, m - 1, d)
    if (date < minDate) return true
  }
  if (props.max) {
    const [y, m, d] = props.max.split('-').map(Number)
    const maxDate = new Date(y, m - 1, d)
    if (date > maxDate) return true
  }
  return false
}

function isSameDay(a: Date, b: Date | null): boolean {
  if (!b) return false
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

function isToday(date: Date): boolean {
  const now = new Date()
  return isSameDay(date, now)
}

function formatToValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function selectDay(day: { date: Date; disabled: boolean }) {
  if (day.disabled) return
  emit('update:modelValue', formatToValue(day.date))
  isOpen.value = false
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function handleClickOutside(e: MouseEvent) {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

watch(isOpen, (open) => {
  if (open && selectedDate.value) {
    currentMonth.value = selectedDate.value.getMonth()
    currentYear.value = selectedDate.value.getFullYear()
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="pickerRef"
    class="app-datepicker"
    :class="[
      `app-datepicker--${variant}`,
      {
        'app-datepicker--open': isOpen,
        'app-datepicker--disabled': disabled,
        'app-datepicker--error': !!error,
        'app-datepicker--sm': size === 'sm',
      }
    ]"
  >
    <label v-if="label" class="app-datepicker-label">{{ label }}</label>
    <button type="button" class="app-datepicker-trigger" @click="toggle" :disabled="disabled">
      <svg class="app-datepicker-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
        <path d="M1.5 6h13" stroke="currentColor" stroke-width="1.2"/>
        <path d="M5 1v3M11 1v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      <span class="app-datepicker-value" :class="{ 'app-datepicker-value--placeholder': !modelValue }">
        {{ displayValue }}
      </span>
      <svg class="app-datepicker-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <Transition name="datepicker-dropdown">
      <div v-if="isOpen" class="app-datepicker-dropdown">
        <div class="datepicker-header">
          <button type="button" class="datepicker-nav" @click="prevMonth">
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M6 1L1 6L6 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="datepicker-month-year">
            {{ monthNames[currentMonth] }} {{ currentYear }}
          </span>
          <button type="button" class="datepicker-nav" @click="nextMonth">
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M1 1L6 6L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="datepicker-weekdays">
          <span v-for="day in weekDays" :key="day" class="datepicker-weekday">{{ day }}</span>
        </div>

        <div class="datepicker-grid">
          <button
            v-for="(day, idx) in calendarDays"
            :key="idx"
            type="button"
            class="datepicker-day"
            :class="{
              'datepicker-day--other': !day.currentMonth,
              'datepicker-day--selected': isSameDay(day.date, selectedDate),
              'datepicker-day--today': isToday(day.date) && !isSameDay(day.date, selectedDate),
              'datepicker-day--disabled': day.disabled,
            }"
            @click="selectDay(day)"
            :disabled="day.disabled"
          >
            {{ day.date.getDate() }}
          </button>
        </div>
      </div>
    </Transition>

    <p v-if="error" class="app-datepicker-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.app-datepicker {
  position: relative;
  display: inline-flex;
}

.app-datepicker--default .app-datepicker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-field);
  border-radius: var(--radius-lg);
  padding: 12px 30px;
  font-size: 16px;
  font-weight: var(--font-medium);
  color: var(--text-main);
  cursor: pointer;
  transition: background-color 0.15s;
  white-space: nowrap;
  border: 1px solid transparent;
}

.app-datepicker--default .app-datepicker-trigger:hover {
  background: var(--bg-field-hover);
}

.app-datepicker--default.app-datepicker--open .app-datepicker-trigger {
  background: var(--primary);
  color: var(--white);
}

.app-datepicker--form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.app-datepicker--form .app-datepicker-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: var(--bg-field);
  border-radius: var(--radius-md);
  padding:  16px;
  font-size: 20px;
  font-weight: var(--font-regular);
  color: var(--text-main);
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.15s;
}

.app-datepicker--form .app-datepicker-trigger:hover {
  border-color: var(--border-input);
}

.app-datepicker--form.app-datepicker--open .app-datepicker-trigger {
  border-color: var(--primary);
}

.app-datepicker-label {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.app-datepicker--compact {
  display: inline-flex;
  width: 100%;
}

.app-datepicker--compact .app-datepicker-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 160px;
  padding: 5px 8px;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-size: 16px;
  background: #fff;
  color: #1e293b;
  cursor: pointer;
  transition: border-color 0.15s;
}

.app-datepicker--compact .app-datepicker-trigger:hover {
  border-color: #94a3b8;
}

.app-datepicker--compact.app-datepicker--open .app-datepicker-trigger {
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
}

.app-datepicker--compact .app-datepicker-arrow {
  width: 8px;
  height: 5px;
}

.app-datepicker--compact .app-datepicker-icon {
  width: 12px;
  height: 12px;
}

.app-datepicker--sm.app-datepicker--default .app-datepicker-trigger,
.app-datepicker--sm.app-datepicker--form .app-datepicker-trigger {
  padding: 8px 14px;
  font-size: 14px;
}

.app-datepicker--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.app-datepicker--disabled .app-datepicker-trigger {
  cursor: not-allowed;
}

.app-datepicker--error .app-datepicker-trigger {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.app-datepicker-error {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-datepicker-icon {
  flex-shrink: 0;
  color: #94a3b8;
}

.app-datepicker--open .app-datepicker-icon,
.app-datepicker--default.app-datepicker--open .app-datepicker-icon {
  color: currentColor;
}

.app-datepicker-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.app-datepicker-value--placeholder {
  color: #475569;
  font-weight: 500;
}

.app-datepicker-arrow {
  transition: transform 0.2s;
  flex-shrink: 0;
}

.app-datepicker--open .app-datepicker-arrow {
  transform: rotate(180deg);
}

.app-datepicker-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 320px;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-dropdown);
  z-index: 50;
  padding: 12px;
}

.datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.datepicker-month-year {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-main);
}

.datepicker-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-main);
  transition: background-color 0.15s;
  border: none;
  background: none;
}

.datepicker-nav:hover {
  background: var(--bg-field);
}

.datepicker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.datepicker-weekday {
  font-size: 17px;
  font-weight: 600;
  color: #94a3b8;
  text-align: center;
  text-transform: uppercase;
  padding: 4px 0;
}

.datepicker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.datepicker-day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin: 0 auto;
  border-radius: 8px;
  font-size: 19px;
  font-weight: var(--font-medium);
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.1s;
  border: none;
  background: none;
}

.datepicker-day:hover:not(.datepicker-day--disabled):not(.datepicker-day--selected) {
  background: var(--bg-field);
}

.datepicker-day--other {
  color: #cbd5e1;
}

.datepicker-day--today {
  border: 1px solid var(--primary);
  color: var(--primary);
}

.datepicker-day--selected {
  background: var(--primary);
  color: var(--white, #fff);
}

.datepicker-day--selected:hover {
  background: var(--primary);
}

.datepicker-day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.datepicker-dropdown-enter-active,
.datepicker-dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.datepicker-dropdown-enter-from,
.datepicker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 1024px) {
  .app-datepicker--default .app-datepicker-trigger {
    padding: 10px 20px;
    font-size: 15px;
  }

  .app-datepicker--form .app-datepicker-trigger {
    padding: 12px 16px;
    font-size: 15px;
  }

  .app-datepicker-label {
    font-size: 15px;
  }
}

@media (max-width: 768px) {
  .app-datepicker {
    width: 100%;
  }

  .app-datepicker--default .app-datepicker-trigger {
    width: 100%;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 15px;
    border-radius: var(--radius-md);
  }

  .app-datepicker--form .app-datepicker-trigger {
    padding: 10px 14px;
    font-size: 15px;
    border-radius: var(--radius-sm);
  }

  .app-datepicker--form {
    gap: 6px;
  }

  .app-datepicker-label {
    font-size: 15px;
  }

  .app-datepicker-dropdown {
    min-width: 300px;
  }
}
</style>
