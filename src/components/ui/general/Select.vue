<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SelectOption, SelectGroup } from '@/types/select'

defineOptions({
  name: 'Select',
})

const { t } = useI18n()

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  options?: SelectOption[]
  groups?: SelectGroup[]
  placeholder?: string
  variant?: 'default' | 'form' | 'compact'
  label?: string
  background?: boolean
  disabled?: boolean
  error?: string
  size?: 'sm' | 'md'
}>(), {
  modelValue: '',
  options: () => [],
  placeholder: '',
  variant: 'default',
  label: '',
  background: true,
  disabled: false,
  error: '',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'change': [value: string | number | null]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const allOptions = computed<SelectOption[]>(() => {
  if (props.groups && props.groups.length > 0) {
    return props.groups.flatMap(g => g.options)
  }
  return props.options
})

const isPlaceholder = computed(() => {
  return props.modelValue === '' || props.modelValue === null || props.modelValue === undefined
})

const selectedLabel = computed(() => {
  if (isPlaceholder.value) return props.placeholder || t('common.select')
  const found = allOptions.value.find(o => o.value === props.modelValue)
  return found ? found.label : (props.placeholder || t('common.select'))
})

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const select = (option: SelectOption) => {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
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
      {
        'app-select--open': isOpen,
        'app-select--no-bg': !background,
        'app-select--disabled': disabled,
        'app-select--error': !!error,
        'app-select--sm': size === 'sm',
      }
    ]"
  >
    <label v-if="label" class="app-select-field-label">{{ label }}</label>
    <button type="button" class="app-select-trigger" @click="toggle" :disabled="disabled">
      <span class="app-select-label" :class="{ 'app-select-label--placeholder': isPlaceholder }">{{ selectedLabel }}</span>
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
        <template v-if="groups && groups.length > 0">
          <template v-for="group in groups" :key="group.label">
            <div class="app-select-group-label">{{ group.label }}</div>
            <button
              v-for="option in group.options"
              :key="String(option.value)"
              type="button"
              class="app-select-option"
              :class="{
                'app-select-option--active': modelValue === option.value,
                'app-select-option--disabled': option.disabled,
              }"
              @click="select(option)"
            >
              <span>{{ option.label }}</span>
              <svg v-if="modelValue === option.value" class="app-select-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </template>
        </template>
        <template v-else>
          <button
            v-for="option in options"
            :key="String(option.value)"
            type="button"
            class="app-select-option"
            :class="{
              'app-select-option--active': modelValue === option.value,
              'app-select-option--disabled': option.disabled,
            }"
            @click="select(option)"
          >
            <span>{{ option.label }}</span>
            <svg v-if="modelValue === option.value" class="app-select-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </template>
      </div>
    </Transition>

    <p v-if="error" class="app-select-error">{{ error }}</p>
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
  font-size: 18px;
  font-weight: var(--font-medium);
  color: var(--text-main);
  cursor: pointer;
  transition: background-color 0.15s;
  white-space: nowrap;
  border: 1px solid transparent;
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
  font-size: 20px;
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
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

/* ──────────────────────────────────
   Compact variant (table-cell inline)
   ────────────────────────────────── */
.app-select--compact {
  display: inline-flex;
  width: 100%;
}

.app-select--compact .app-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
  min-width: 160px;
  padding: 5px 8px;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
  color: #1e293b;
  cursor: pointer;
  transition: border-color 0.15s;
}

.app-select--compact .app-select-trigger:hover {
  border-color: #94a3b8;
}

.app-select--compact.app-select--open .app-select-trigger {
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
}

.app-select--compact .app-select-arrow {
  width: 8px;
  height: 5px;
}

.app-select--compact .app-select-option {
  padding: 6px 12px;
  font-size: 12px;
}

.app-select--compact .app-select-dropdown {
  max-height: 200px;
  overflow-y: auto;
}

/* ──────────────────────────────────
   Size: sm
   ────────────────────────────────── */
.app-select--sm.app-select--default .app-select-trigger,
.app-select--sm.app-select--form .app-select-trigger {
  padding: 8px 14px;
  font-size: 15px;
}

/* ──────────────────────────────────
   Disabled state
   ────────────────────────────────── */
.app-select--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.app-select--disabled .app-select-trigger {
  cursor: not-allowed;
}

/* ──────────────────────────────────
   Error state
   ────────────────────────────────── */
.app-select--error .app-select-trigger {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.app-select-error {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 600;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 4px;
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

.app-select-label--placeholder {
  color: #475569;
  font-weight: 500;
}

.app-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  max-height: 280px;
  overflow-y: auto;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-dropdown);
  z-index: 50;
}

.app-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 20px;
  font-size: 18px;
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

.app-select-option--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.app-select-check {
  flex-shrink: 0;
  color: var(--primary);
}

.app-select-group-label {
  padding: 8px 20px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: default;
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
    font-size: 16px;
  }

  .app-select--form .app-select-trigger {
    padding: 12px 16px;
    font-size: 18px;
  }

  .app-select-field-label {
    font-size: 18px;
  }

  .app-select-option {
    padding: 9px 16px;
    font-size: 16px;
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
    font-size: 16px;
    border-radius: var(--radius-md);
  }

  .app-select--form .app-select-trigger {
    padding: 10px 14px;
    font-size: 18px;
    border-radius: var(--radius-sm);
  }

  .app-select--form {
    gap: 6px;
  }

  .app-select-field-label {
    font-size: 18px;
  }

  .app-select-dropdown {
    width: 100%;
  }

  .app-select-option {
    padding: 10px 16px;
    font-size: 16px;
  }
}
</style>
