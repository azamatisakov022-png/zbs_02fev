<script setup lang="ts">
import { computed } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

const props = defineProps<{
  modelValue: string | number
  options: SelectOption[]
  label?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  error?: string
  required?: boolean
  disabled?: boolean
  color?: string
  bg?: string
  fontSize?: string
  borderColor?: string
  focusColor?: string
  labelColor?: string
  labelSize?: string
  hideLabel?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const sizeClass = computed(() => `app-select--${props.size || 'md'}`)

const customFieldStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.color) s.color = props.color
  if (props.bg) s.background = props.bg
  if (props.fontSize) s['font-size'] = props.fontSize
  if (props.borderColor) s['border-color'] = props.borderColor
  if (props.focusColor) s['--select-focus-color'] = props.focusColor
  return Object.keys(s).length ? s : undefined
})

const customLabelStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.labelColor) s.color = props.labelColor
  if (props.labelSize) s['font-size'] = props.labelSize
  return Object.keys(s).length ? s : undefined
})
</script>

<template>
  <div class="app-select-group">
    <label v-if="label && !hideLabel" class="app-select__label" :style="customLabelStyle">
      {{ label }}
      <span v-if="required" class="app-select__required">*</span>
    </label>
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="[
        'app-select',
        sizeClass,
        { 'app-select--error': error, 'app-select--placeholder': !modelValue && modelValue !== 0 }
      ]"
      :style="customFieldStyle"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="app-select__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.app-select-group {
  display: flex;
  flex-direction: column;
}

.app-select__label {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}

.app-select__required {
  color: #ef4444;
  margin-left: 2px;
}

.app-select {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #1e293b;
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.app-select:focus {
  border-color: var(--select-focus-color, #0e888d);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--select-focus-color, #0e888d) 12%, transparent);
}

.app-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f8fafc;
}

.app-select--sm {
  padding: 6px 36px 6px 10px;
  font-size: 14px;
  border-radius: 8px;
}

.app-select--md {
  padding: 10px 36px 10px 14px;
  font-size: 15px;
  border-radius: 12px;
}

.app-select--lg {
  padding: 14px 36px 14px 18px;
  font-size: 16px;
  border-radius: 14px;
}

.app-select--error {
  border-color: #ef4444;
  background-color: rgba(254, 242, 242, 0.5);
}

.app-select--placeholder {
  color: #9ca3af;
}

.app-select__error {
  font-size: 13px;
  font-weight: 500;
  color: #ef4444;
  margin-top: 4px;
}
</style>
