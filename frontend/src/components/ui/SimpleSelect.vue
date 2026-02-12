<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

export interface SimpleSelectOption {
  value: string | number | null
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string | number | null
  options: SimpleSelectOption[]
  disabled?: boolean
  placeholder?: string
  compact?: boolean
}>(), {
  disabled: false,
  placeholder: 'Выберите...',
  compact: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt ? opt.label : props.placeholder
})

const isPlaceholder = computed(() => {
  return !props.options.some(o => o.value === props.modelValue)
})

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToSelected()
    })
  }
}

const select = (option: SimpleSelectOption) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

const scrollToSelected = () => {
  if (!dropdownRef.value) return
  const active = dropdownRef.value.querySelector('.ss-option--active')
  if (active) {
    active.scrollIntoView({ block: 'nearest' })
  }
}

const onClickOutside = (e: MouseEvent) => {
  if (!triggerRef.value?.contains(e.target as Node) && !dropdownRef.value?.contains(e.target as Node)) {
    isOpen.value = false
  }
}

watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('click', onClickOutside, true)
  } else {
    document.removeEventListener('click', onClickOutside, true)
  }
})
</script>

<template>
  <div class="ss-wrapper" :class="{ 'ss-compact': compact }">
    <button
      ref="triggerRef"
      type="button"
      class="ss-trigger"
      :class="{ 'ss-trigger--disabled': disabled, 'ss-trigger--placeholder': isPlaceholder, 'ss-trigger--open': isOpen }"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="ss-trigger-text">{{ selectedLabel }}</span>
      <svg class="ss-arrow" :class="{ 'ss-arrow--open': isOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div v-if="isOpen" ref="dropdownRef" class="ss-dropdown">
      <div class="ss-list">
        <div
          v-for="opt in options"
          :key="String(opt.value)"
          class="ss-option"
          :class="{ 'ss-option--active': opt.value === modelValue }"
          @click="select(opt)"
        >
          {{ opt.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ss-wrapper {
  position: relative;
  width: 100%;
}

/* === DEFAULT (large) — for public calculator === */
.ss-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  font-size: 18px;
  font-weight: 500;
  color: #415861;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  line-height: 1.5;
}

.ss-trigger:hover:not(:disabled) {
  border-color: #0e888d;
}

.ss-trigger--open {
  border-color: #0e888d;
  box-shadow: 0 0 0 3px rgba(14, 136, 141, 0.1);
}

.ss-trigger--disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.ss-trigger--placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.ss-trigger-text {
  flex: 1;
  min-width: 0;
  white-space: normal;
  word-wrap: break-word;
  overflow: visible;
}

.ss-arrow {
  flex-shrink: 0;
  color: #94a3b8;
  transition: transform 0.15s;
}

.ss-arrow--open {
  transform: rotate(180deg);
}

.ss-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: max-content;
  min-width: 100%;
  max-width: 90vw;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.ss-list {
  max-height: 500px;
  overflow-y: auto;
  border-radius: 12px;
}

.ss-option {
  padding: 14px 20px;
  font-size: 16px;
  color: #1e293b;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  white-space: normal;
  word-wrap: break-word;
  overflow: visible;
  line-height: 1.5;
  height: auto;
}

.ss-option:last-child {
  border-bottom: none;
}

.ss-option:hover {
  background: #f0fdf4;
}

.ss-option--active {
  background: #f0fdf4;
  font-weight: 500;
}

/* === COMPACT — for business forms === */
.ss-compact .ss-trigger {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  font-weight: 400;
  color: #1e293b;
  line-height: 1.4;
}

.ss-compact .ss-trigger:hover:not(:disabled) {
  border-color: #94a3b8;
}

.ss-compact .ss-trigger.ss-trigger--open {
  border-color: #64748b;
  box-shadow: none;
}

.ss-compact .ss-dropdown {
  border-radius: 8px;
}

.ss-compact .ss-list {
  max-height: 500px;
  border-radius: 8px;
}

.ss-compact .ss-option {
  padding: 10px 16px;
  font-size: 14px;
  white-space: normal;
  word-wrap: break-word;
  overflow: visible;
  line-height: 1.4;
  height: auto;
}
</style>
