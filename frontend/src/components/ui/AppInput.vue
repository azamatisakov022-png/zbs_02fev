<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const props = defineProps<{
  label?: string
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'textarea'
  modelValue?: string | number
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  suffix?: string
  autocomplete?: string
  rows?: number
  maxlength?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur'): void
}>()

const inputId = `input-${Math.random().toString(36).slice(2, 9)}`
const errorId = `${inputId}-error`
const hintId = `${inputId}-hint`

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', props.type === 'number' ? Number(target.value) : target.value)
}

// BCP 47 lang tag for native date inputs – helps browsers show the correct date format
const inputLang = computed(() => {
  const map: Record<string, string> = { ru: 'ru-RU', ky: 'ky-KG', en: 'en-GB' }
  return map[(locale as any).value || 'ru'] || 'ru-RU'
})
</script>

<template>
  <div class="app-input">
    <label v-if="label" :for="inputId" class="app-input__label">
      {{ label }}
      <span v-if="required" class="app-input__req">*</span>
    </label>
    <div class="app-input__wrap" :class="{ 'app-input__wrap--error': error, 'app-input__wrap--disabled': disabled }">
      <!-- Textarea -->
      <textarea
        v-if="type === 'textarea'"
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows || 3"
        :maxlength="maxlength"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : (hint ? hintId : undefined)"
        class="app-input__field app-input__field--textarea"
        @input="onInput"
        @blur="emit('blur')"
      />
      <!-- Input -->
      <input
        v-else
        :id="inputId"
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :lang="type === 'date' ? inputLang : undefined"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : (hint ? hintId : undefined)"
        class="app-input__field"
        :class="{ 'app-input__field--suffix': suffix, 'app-input__field--date-empty': type === 'date' && !modelValue }"
        @input="onInput"
        @blur="emit('blur')"
      />
      <!-- Translated date placeholder overlay (hides browser-native ДД.ММ.ГГГГ) -->
      <span v-if="type === 'date' && !modelValue" class="app-input__date-placeholder">
        {{ placeholder || $t('common.datePlaceholder') }}
      </span>
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
  font-size: 13px;
  color: #475569;
  font-weight: 500;
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
  padding: 10px 14px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  background: #fff;
  transition: all 0.2s ease;
  outline: none;
}

.app-input__field--textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
  font-family: inherit;
}

.app-input__field::placeholder { color: #94A3B8; font-weight: 400; }

.app-input__field:focus {
  border-color: var(--color-primary);
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

/* Hide native date placeholder text when our overlay is active */
.app-input__field--date-empty::-webkit-datetime-edit {
  color: transparent;
}

.app-input__date-placeholder {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #94A3B8;
  font-size: 14px;
  font-weight: 400;
}

.app-input__suffix {
  position: absolute;
  right: 14px;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
  pointer-events: none;
}

.app-input__hint {
  font-size: 11px;
  color: #64748B;
  margin-top: 4px;
}

.app-input__error {
  font-size: 11px;
  color: #EF4444;
  margin-top: 4px;
}
</style>
