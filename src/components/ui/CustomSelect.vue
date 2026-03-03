<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

export interface SelectOption {
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
  compact?: boolean
  searchable?: boolean
  dropdownMinWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  maxLabelLength: 80,
  compact: false,
  searchable: false,
  dropdownMinWidth: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const dropdownScrollRef = ref<HTMLElement>()
const searchInputRef = ref<HTMLInputElement>()
const hoveredOption = ref<SelectOption | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const searchQuery = ref('')

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

// Filtered options based on search query
const filteredGroupedOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return groupedOptions.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  const groups = new Map<string, SelectOption[]>()
  const ungrouped: SelectOption[] = []

  // Filter ungrouped
  groupedOptions.value.ungrouped.forEach(option => {
    if (matchesSearch(option, query)) {
      ungrouped.push(option)
    }
  })

  // Filter grouped
  groupedOptions.value.groups.forEach((options, groupName) => {
    const filtered = options.filter(option => matchesSearch(option, query))
    if (filtered.length > 0) {
      groups.set(groupName, filtered)
    }
  })

  return { groups, ungrouped }
})

function matchesSearch(option: SelectOption, query: string): boolean {
  // Always show placeholder options (null value)
  if (option.value === null) return true
  const label = (option.label || '').toLowerCase()
  const sublabel = (option.sublabel || '').toLowerCase()
  const shortLabel = (option.shortLabel || '').toLowerCase()
  return label.includes(query) || sublabel.includes(query) || shortLabel.includes(query)
}

const hasFilteredResults = computed(() => {
  return filteredGroupedOptions.value.ungrouped.some(o => o.value !== null) ||
    filteredGroupedOptions.value.groups.size > 0
})

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const displayValue = computed(() => {
  if (!selectedOption.value) return props.placeholder || t('ui.selectPlaceholder')
  return truncateText(selectedOption.value.shortLabel || selectedOption.value.label, props.maxLabelLength)
})

const triggerTitle = computed(() => {
  if (!selectedOption.value) return ''
  return selectedOption.value.label
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
  searchQuery.value = ''
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

function clearSearch() {
  searchQuery.value = ''
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

// Watch for dropdown open to add/remove scroll listeners
watch(isOpen, (open) => {
  if (open) {
    // Add scroll listener to window (captures page scroll)
    window.addEventListener('scroll', hideTooltip, true)
    // Auto-focus search input
    if (props.searchable) {
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  } else {
    window.removeEventListener('scroll', hideTooltip, true)
    hoveredOption.value = null
    searchQuery.value = ''
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
  <div ref="dropdownRef" class="custom-select" :class="{ 'is-disabled': disabled, 'is-compact': compact }">
    <!-- Selected value display -->
    <div
      class="select-trigger"
      :class="{ 'is-open': isOpen, 'has-value': selectedOption }"
      :title="triggerTitle"
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
          <span class="placeholder">{{ placeholder || t('ui.selectPlaceholder') }}</span>
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
      <div v-if="isOpen" class="select-dropdown" :style="dropdownMinWidth ? { minWidth: dropdownMinWidth, maxWidth: 'calc(100vw - 32px)' } : {}">
        <!-- Search input -->
        <div v-if="searchable" class="search-container">
          <div class="search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.333 12.667A5.333 5.333 0 107.333 2a5.333 5.333 0 000 10.667zM14 14l-2.9-2.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="t('ui.searchPlaceholder')"
            @click.stop
          />
          <button v-if="searchQuery" class="search-clear" @click.stop="clearSearch">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="dropdown-scroll">
          <!-- No results message -->
          <div v-if="searchable && searchQuery && !hasFilteredResults" class="no-results">
            {{ t('ui.nothingFound') }}
          </div>

          <!-- Ungrouped options first (like placeholder) -->
          <div
            v-for="option in filteredGroupedOptions.ungrouped"
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
          <template v-for="[groupName, groupOptions] in filteredGroupedOptions.groups" :key="groupName">
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.select-trigger:hover {
  border-color: var(--border-input, #cbd5e1);
}

.select-trigger.is-open {
  border-color: var(--primary);
}

.select-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.value-main {
  font-size: var(--text-caption);
  font-weight: var(--font-medium);
  color: var(--text-main);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value-main .label-prefix {
  font-weight: 600;
}

.value-sub {
  font-size: var(--text-caption-sm);
  color: #6b7280;
  margin-top: 2px;
}

.placeholder {
  font-size: var(--text-caption);
  color: #70868f;
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: currentColor;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.select-arrow svg {
  width: 10px;
  height: 6px;
}

.select-arrow.is-open {
  transform: translateY(-50%) rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  min-width: 100%;
  background: var(--white, #fff);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-dropdown);
  z-index: 50;
  overflow: hidden;
}

.search-container {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-field);
  border-bottom: 1px solid var(--border-light);
}

.search-icon {
  flex-shrink: 0;
  color: #94a3b8;
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.search-icon svg {
  width: 14px;
  height: 14px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-caption);
  color: var(--text-main);
  padding: 4px 0;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-clear {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-left: 8px;
}

.search-clear:hover {
  background: #d1d5db;
  color: #374151;
}

.no-results {
  padding: 16px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: var(--text-caption);
}

.dropdown-scroll {
  max-height: 280px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.dropdown-scroll::-webkit-scrollbar {
  width: 6px;
}

.dropdown-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dropdown-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.option-group-header {
  padding: 8px 20px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: default;
}

.select-option {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.1s;
  text-align: left;
  white-space: normal;
}

.select-option:hover {
  background: var(--bg-field);
}

.select-option.is-selected {
  color: var(--primary);
  background: var(--primary-subtle);
}

.option-main {
  font-size: var(--text-caption);
  font-weight: var(--font-medium);
  color: var(--text-main);
  line-height: 1.4;
  word-break: break-word;
}

.select-option.is-selected .option-main {
  color: var(--primary);
}

.label-prefix {
  font-weight: 600;
  margin-right: 4px;
}

.option-sub {
  font-size: var(--text-caption-sm);
  color: #64748b;
  margin-top: 2px;
}

/* Compact mode */
.is-compact .select-trigger {
  padding: 8px 14px;
  border-radius: 8px;
}

.is-compact .value-main {
  font-size: 13px;
}

.is-compact .value-sub {
  font-size: 11px;
}

.is-compact .placeholder {
  font-size: 13px;
}

.is-compact .select-arrow {
  right: 10px;
}

.is-compact .select-option {
  padding: 8px 14px;
}

.is-compact .option-main {
  font-size: 13px;
}

.is-compact .option-sub {
  font-size: 11px;
}

.is-compact .option-group-header {
  padding: 6px 14px 2px;
  font-size: 10px;
}

.is-compact .no-results {
  padding: 12px;
  font-size: 13px;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Tablet */
@media (max-width: 1024px) {
  .select-trigger {
    padding: 12px 16px;
    font-size: var(--text-body-sm);
  }

  .value-main {
    font-size: 13px;
  }

  .select-option {
    padding: 9px 16px;
    font-size: 13px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .select-trigger {
    padding: 10px 14px;
    font-size: var(--text-caption);
    border-radius: var(--radius-sm);
  }

  .option-main {
    font-size: 13px;
  }

  .select-option {
    padding: 10px 16px;
  }
}
</style>

<style>
.select-tooltip {
  position: fixed;
  transform: translateY(-100%);
  background: #1e293b;
  color: white;
  padding: 8px 12px;
  border-radius: var(--radius-sm, 8px);
  font-size: 13px;
  line-height: 1.4;
  max-width: 400px;
  word-break: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  pointer-events: none;
}

.select-tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 16px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #1e293b;
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
