<script setup lang="ts">
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
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : (hint ? hintId : undefined)"
        class="app-input__field"
        :class="{ 'app-input__field--suffix': suffix }"
        @input="onInput"
        @blur="emit('blur')"
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
  font-size: 20px;
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
  padding: 10px 14px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 20px;
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

.app-input__field::placeholder { color: #475569; font-weight: 500; font-size: 20px; }

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

.app-input__suffix {
  position: absolute;
  right: 14px;
  font-size: 16px;
  color: #64748B;
  font-weight: 500;
  pointer-events: none;
}

.app-input__hint {
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  margin-top: 4px;
}

.app-input__error {
  font-size: 20px;
  font-weight: 600;
  color: #EF4444;
  margin-top: 4px;
}
</style>
