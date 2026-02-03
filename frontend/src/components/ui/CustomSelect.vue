<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface SelectOption {
  value: string | number | null
  label: string
  shortLabel?: string
  labelPrefix?: string  // Bold prefix (e.g., "Группа №1:")
  sublabel?: string
  group?: string
}

interface Props {
  modelValue: string | number | null
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  maxLabelLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '— Выберите —',
  disabled: false,
  maxLabelLength: 80
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const dropdownScrollRef = ref<HTMLElement>()
const hoveredOption = ref<SelectOption | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// Group options by their group property
const groupedOptions = computed(() => {
  const groups = new Map<string, SelectOption[]>()
  const ungrouped: SelectOption[] = []

  props.options.forEach(option => {
    if (option.group) {
      if (!groups.has(option.group)) {
        groups.set(option.group, [])
      }
      groups.get(option.group)!.push(option)
    } else {
      ungrouped.push(option)
    }
  })

  return { groups, ungrouped }
})

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const displayValue = computed(() => {
  if (!selectedOption.value) return props.placeholder
  return truncateText(selectedOption.value.shortLabel || selectedOption.value.label, props.maxLabelLength)
})

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3).trim() + '...'
}

function getDisplayText(option: SelectOption): string {
  const text = option.shortLabel || option.label
  // If there's a prefix, remove it from the display text
  if (option.labelPrefix && text.startsWith(option.labelPrefix)) {
    return text.slice(option.labelPrefix.length).trim()
  }
  return text
}

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function selectOption(option: SelectOption) {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function handleMouseEnter(option: SelectOption, event: MouseEvent) {
  hoveredOption.value = option
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.left,
    y: rect.top - 8
  }
}

function handleMouseLeave() {
  hoveredOption.value = null
}

// Hide tooltip on any scroll
function hideTooltip() {
  hoveredOption.value = null
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Watch for dropdown open to add/remove scroll listeners
watch(isOpen, (open) => {
  if (open) {
    // Add scroll listener to window (captures page scroll)
    window.addEventListener('scroll', hideTooltip, true)
  } else {
    window.removeEventListener('scroll', hideTooltip, true)
    hoveredOption.value = null
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', hideTooltip, true)
})
</script>

<template>
  <div ref="dropdownRef" class="custom-select" :class="{ 'is-disabled': disabled }">
    <!-- Selected value display -->
    <div
      class="select-trigger"
      :class="{ 'is-open': isOpen, 'has-value': selectedOption }"
      @click="toggleDropdown"
    >
      <div class="select-value">
        <template v-if="selectedOption">
          <div class="value-main">
            <span v-if="selectedOption.labelPrefix" class="label-prefix">{{ selectedOption.labelPrefix }}</span>
            {{ truncateText(getDisplayText(selectedOption), maxLabelLength) }}
          </div>
          <div v-if="selectedOption.sublabel" class="value-sub">{{ selectedOption.sublabel }}</div>
        </template>
        <template v-else>
          <span class="placeholder">{{ placeholder }}</span>
        </template>
      </div>
      <div class="select-arrow" :class="{ 'is-open': isOpen }">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="select-dropdown">
        <div class="dropdown-scroll">
          <!-- Ungrouped options first (like placeholder) -->
          <div
            v-for="option in groupedOptions.ungrouped"
            :key="String(option.value)"
            class="select-option"
            :class="{ 'is-selected': option.value === modelValue }"
            @click="selectOption(option)"
            @mouseenter="handleMouseEnter(option, $event)"
            @mouseleave="handleMouseLeave"
          >
            <div class="option-main">
              <span v-if="option.labelPrefix" class="label-prefix">{{ option.labelPrefix }}</span>
              {{ truncateText(getDisplayText(option), maxLabelLength) }}
            </div>
            <div v-if="option.sublabel" class="option-sub">{{ option.sublabel }}</div>
          </div>

          <!-- Grouped options -->
          <template v-for="[groupName, groupOptions] in groupedOptions.groups" :key="groupName">
            <div class="option-group-header">{{ groupName }}</div>
            <div
              v-for="option in groupOptions"
              :key="String(option.value)"
              class="select-option"
              :class="{ 'is-selected': option.value === modelValue }"
              @click="selectOption(option)"
              @mouseenter="handleMouseEnter(option, $event)"
              @mouseleave="handleMouseLeave"
            >
              <div class="option-main">
                <span v-if="option.labelPrefix" class="label-prefix">{{ option.labelPrefix }}</span>
                {{ truncateText(getDisplayText(option), maxLabelLength) }}
              </div>
              <div v-if="option.sublabel" class="option-sub">{{ option.sublabel }}</div>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <!-- Tooltip for full text -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="hoveredOption && (hoveredOption.label.length > maxLabelLength || hoveredOption.shortLabel)"
          class="select-tooltip"
          :style="{
            left: tooltipPosition.x + 'px',
            top: tooltipPosition.y + 'px'
          }"
        >
          {{ hoveredOption.label }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}

.custom-select.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.select-trigger {
  width: 100%;
  min-height: 70px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 55px 18px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.select-trigger:hover {
  border-color: #0e888d;
}

.select-trigger.is-open {
  border-color: #0e888d;
  box-shadow: 0 0 0 3px rgba(14, 136, 141, 0.1);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.select-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.value-main {
  font-size: 19px;
  font-weight: 500;
  color: #415861;
  line-height: 1.5;
  word-break: break-word;
}

.value-main .label-prefix {
  font-weight: 600;
  color: #1f2937;
}

.value-sub {
  font-size: 16px;
  color: #6b7280;
  margin-top: 6px;
}

.placeholder {
  font-size: 19px;
  color: #9ca3af;
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  transition: transform 0.2s ease;
}

.select-arrow.is-open {
  transform: translateY(-50%) rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #0e888d;
  border-top: none;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-scroll {
  max-height: 400px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.dropdown-scroll::-webkit-scrollbar {
  width: 8px;
}

.dropdown-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dropdown-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dropdown-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.option-group-header {
  padding: 18px 24px 14px;
  font-size: 15px;
  font-weight: 700;
  color: #0e888d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 1;
}

.option-group-header:first-child {
  border-top: none;
}

.select-option {
  padding: 20px 24px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid #f1f5f9;
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background: #e8f5f5;
}

.select-option.is-selected {
  background: #d1fae5;
}

.select-option.is-selected:hover {
  background: #a7f3d0;
}

.option-main {
  font-size: 19px;
  font-weight: 500;
  color: #374151;
  line-height: 1.5;
  word-break: break-word;
}

.label-prefix {
  font-weight: 600;
  color: #1f2937;
  margin-right: 4px;
}

.option-sub {
  font-size: 16px;
  color: #5a6d76;
  margin-top: 8px;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

</style>

<!-- Global styles for teleported tooltip -->
<style>
.select-tooltip {
  position: fixed;
  transform: translateY(-100%);
  background: #1f2937;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.5;
  max-width: 450px;
  word-break: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  pointer-events: none;
}

.select-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #1f2937;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-90%);
}
</style>
