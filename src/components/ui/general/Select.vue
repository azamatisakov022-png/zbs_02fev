<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'Select',
})

const { t } = useI18n()

const props = withDefaults(defineProps<{
  modelValue?: string
  options: { value: string; label: string }[]
  placeholder?: string
  variant?: 'default' | 'form'
  label?: string
  background?: boolean
}>(), {
  modelValue: '',
  placeholder: '',
  variant: 'default',
  label: '',
  background: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const selectedLabel = () => {
  if (!props.modelValue) return props.placeholder || t('common.select')
  const found = props.options.find(o => o.value === props.modelValue)
  return found ? found.label : (props.placeholder || t('common.select'))
}

const toggle = () => {
  isOpen.value = !isOpen.value
}

const select = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="selectRef"
    class="app-select"
    :class="[
      `app-select--${variant}`,
      { 'app-select--open': isOpen, 'app-select--no-bg': !background }
    ]"
  >
    <label v-if="label" class="app-select-field-label">{{ label }}</label>
    <button type="button" class="app-select-trigger" @click="toggle">
      <span class="app-select-label">{{ selectedLabel() }}</span>
      <svg
        class="app-select-arrow"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
      >
        <path
          d="M1 1L5 5L9 1"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Transition name="select-dropdown">
      <div v-if="isOpen" class="app-select-dropdown">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="app-select-option"
          :class="{ 'app-select-option--active': modelValue === option.value }"
          @click="select(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-select {
  position: relative;
  display: inline-flex;
}

/* ──────────────────────────────────
   Default variant (chip / pill style)
   ────────────────────────────────── */
.app-select--default .app-select-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-field);
  border-radius: var(--radius-lg);
  padding: 12px 30px;
  font-size: var(--text-caption);
  font-weight: var(--font-medium);
  color: var(--text-main);
  cursor: pointer;
  transition: background-color 0.15s;
  white-space: nowrap;
}

.app-select--default .app-select-trigger:hover {
  background: var(--bg-field-hover);
}

.app-select--default.app-select--open .app-select-trigger {
  background: var(--primary);
  color: var(--white);
}

/* ──────────────────────────────────
   No-background modifier (default variant)
   ────────────────────────────────── */
.app-select--no-bg.app-select--default .app-select-trigger {
  background: transparent;
}

.app-select--no-bg.app-select--default .app-select-trigger:hover {
  background: transparent;
  opacity: 0.7;
}

.app-select--no-bg.app-select--default.app-select--open .app-select-trigger {
  background: transparent;
  color: var(--primary);
}

/* ──────────────────────────────────
   Form variant (full-width field style)
   ────────────────────────────────── */
.app-select--form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.app-select--form .app-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: var(--bg-field);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  font-size: var(--text-body);
  font-weight: var(--font-regular);
  color: var(--text-main);
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.15s;
}

.app-select--form .app-select-trigger:hover {
  border-color: var(--border-input);
}

.app-select--form.app-select--open .app-select-trigger {
  border-color: var(--primary);
}

.app-select-field-label {
  font-size: var(--text-body);
  font-weight: var(--font-regular);
  color: var(--text-main);
}

/* ──────────────────────────────────
   Shared styles
   ────────────────────────────────── */
.app-select-arrow {
  transition: transform 0.2s;
  flex-shrink: 0;
}

.app-select--open .app-select-arrow {
  transform: rotate(180deg);
}

.app-select-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-dropdown);
  z-index: 50;
  overflow: hidden;
}

.app-select-option {
  display: block;
  width: 100%;
  padding: 10px 20px;
  font-size: var(--text-caption);
  font-weight: var(--font-medium);
  color: var(--text-main);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.1s;
  white-space: nowrap;
}

.app-select-option:hover {
  background: var(--bg-field);
}

.app-select-option--active {
  color: var(--primary);
  background: var(--primary-subtle);
}

/* Transition */
.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Tablet (<=1024px) ── */
@media (max-width: 1024px) {
  .app-select--default .app-select-trigger {
    padding: 10px 20px;
    font-size: 13px;
  }

  .app-select--form .app-select-trigger {
    padding: 12px 16px;
    font-size: var(--text-body-sm);
  }

  .app-select-field-label {
    font-size: var(--text-body-sm);
  }

  .app-select-option {
    padding: 9px 16px;
    font-size: 13px;
  }
}

/* ── Mobile (<=768px) ── */
@media (max-width: 768px) {
  .app-select {
    width: 100%;
  }

  .app-select--default .app-select-trigger {
    width: 100%;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 13px;
    border-radius: var(--radius-md);
  }

  .app-select--form .app-select-trigger {
    padding: 10px 14px;
    font-size: var(--text-caption);
    border-radius: var(--radius-sm);
  }

  .app-select--form {
    gap: 6px;
  }

  .app-select-field-label {
    font-size: var(--text-caption);
  }

  .app-select-dropdown {
    width: 100%;
  }

  .app-select-option {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
