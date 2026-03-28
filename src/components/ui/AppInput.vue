<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label?: string
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'tel' | 'textarea'
  modelValue?: string | number
  error?: string
  hint?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  suffix?: string
  prefix?: string
  autocomplete?: string
  rows?: number
  maxlength?: number
  min?: number | string
  max?: number | string
  step?: number | string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  bg?: string
  fontSize?: string
  borderColor?: string
  focusColor?: string
  labelColor?: string
  labelSize?: string
  hideLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

const inputId = `input-${Math.random().toString(36).slice(2, 9)}`
const errorId = `${inputId}-error`
const hintId = `${inputId}-hint`

const sizeClass = computed(() => `app-input__field--${props.size || 'md'}`)

const customFieldStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.color) s.color = props.color
  if (props.bg) s.background = props.bg
  if (props.fontSize) s['font-size'] = props.fontSize
  if (props.borderColor) s['border-color'] = props.borderColor
  if (props.focusColor) s['--input-focus-color'] = props.focusColor
  return Object.keys(s).length ? s : undefined
})

const customLabelStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.labelColor) s.color = props.labelColor
  if (props.labelSize) s['font-size'] = props.labelSize
  return Object.keys(s).length ? s : undefined
})

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', props.type === 'number' ? Number(target.value) : target.value)
}
</script>

<template>
  <div class="app-input">
    <label v-if="label && !hideLabel" :for="inputId" class="app-input__label" :style="customLabelStyle">
      {{ label }}
      <span v-if="required" class="app-input__req">*</span>
    </label>
    <div class="app-input__wrap" :class="{ 'app-input__wrap--error': error, 'app-input__wrap--disabled': disabled }">
      <span v-if="prefix" class="app-input__prefix">{{ prefix }}</span>
      <span v-if="$slots.prefix" class="app-input__prefix"><slot name="prefix" /></span>
      <textarea
        v-if="type === 'textarea'"
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows || 3"
        :maxlength="maxlength"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : (hint ? hintId : undefined)"
        class="app-input__field app-input__field--textarea"
        :class="[sizeClass, { 'app-input__field--prefix': prefix || $slots.prefix }]"
        :style="customFieldStyle"
        @input="onInput"
        @blur="emit('blur')"
        @focus="emit('focus')"
      />
      <input
        v-else
        :id="inputId"
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : (hint ? hintId : undefined)"
        class="app-input__field"
        :class="[sizeClass, { 'app-input__field--suffix': suffix, 'app-input__field--prefix': prefix || $slots.prefix }]"
        :style="customFieldStyle"
        @input="onInput"
        @blur="emit('blur')"
        @focus="emit('focus')"
        @keydown="emit('keydown', $event)"
      />
      <span v-if="suffix && type !== 'textarea'" class="app-input__suffix">{{ suffix }}</span>
    </div>
    <p v-if="error" :id="errorId" class="app-input__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="app-input__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.app-input { width: 100%; }

.app-input__label {
  display: block;
  font-size: 15px;
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 6px;
}

.app-input__req { color: #EF4444; margin-left: 2px; }

.app-input__wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.app-input__field {
  width: 100%;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-weight: 500;
  color: #1e293b;
  background: #fff;
  transition: all 0.2s ease;
  outline: none;
}

.app-input__field--sm {
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 8px;
}
.app-input__field--md {
  padding: 10px 14px;
  font-size: 15px;
}
.app-input__field--lg {
  padding: 14px 18px;
  font-size: 16px;
}

.app-input__field--textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
  font-family: inherit;
}

.app-input__field::placeholder { color: #94a3b8; font-weight: 400; }

.app-input__field:focus {
  border-color: var(--input-focus-color, var(--color-primary));
  box-shadow: 0 0 0 3px rgba(14, 136, 141, 0.1);
}

.app-input__wrap--error .app-input__field {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.app-input__wrap--disabled .app-input__field {
  background: #F8FAFC;
  opacity: 0.6;
  cursor: not-allowed;
}

.app-input__field--suffix { padding-right: 60px; }
.app-input__field--prefix { padding-left: 40px; }

.app-input__suffix {
  position: absolute;
  right: 14px;
  font-size: 16px;
  color: #64748B;
  font-weight: 500;
  pointer-events: none;
}

.app-input__prefix {
  position: absolute;
  left: 14px;
  font-size: 16px;
  color: #64748B;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
  display: flex;
  align-items: center;
}

.app-input__hint {
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  margin-top: 4px;
}

.app-input__error {
  font-size: 13px;
  font-weight: 500;
  color: #EF4444;
  margin-top: 4px;
}
</style>
