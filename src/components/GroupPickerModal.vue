<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { productGroups, isPackagingGroup } from '../data/product-groups'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectedGroup = computed(() => {
  return productGroups.find(g => g.value === props.modelValue)
})

const filteredGroups = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return productGroups
  return productGroups.filter(g => {
    if (g.label.toLowerCase().includes(q)) return true
    if (g.code.toLowerCase().includes(q)) return true
    if (g.value.toLowerCase().includes(q)) return true
    return false
  })
})

const openModal = () => {
  searchQuery.value = ''
  isOpen.value = true
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const closeModal = () => {
  isOpen.value = false
}

const selectGroup = (group: typeof productGroups[0]) => {
  emit('update:modelValue', group.value)
  isOpen.value = false
}

const onOverlayClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('gpm-overlay')) {
    closeModal()
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeModal()
  }
}

watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('keydown', onKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})

const getGroupType = (group: typeof productGroups[0]) => {
  return isPackagingGroup(group.value)
    ? t('groupPicker.packaging')
    : t('groupPicker.product')
}
</script>

<template>
  <div class="gpm-field-wrapper">
    <button
      type="button"
      class="gpm-trigger"
      :class="{ 'gpm-trigger--has-value': !!selectedGroup }"
      @click="openModal"
    >
      <span class="gpm-trigger-text" :title="selectedGroup?.label || ''">
        {{ selectedGroup ? selectedGroup.label : $t('productGroup.selectGroup') }}
      </span>
      <svg class="gpm-trigger-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" stroke-linecap="round" />
      </svg>
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="gpm-overlay" @click="onOverlayClick">
        <div class="gpm-modal">
          <div class="gpm-header">
            <div>
              <h2 class="gpm-title">{{ $t('groupPicker.title') }}</h2>
              <p class="gpm-subtitle">{{ $t('groupPicker.subtitle') }}</p>
            </div>
            <button class="gpm-close" @click="closeModal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="gpm-search-wrap">
            <svg class="gpm-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" stroke-linecap="round" />
            </svg>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="gpm-search"
              :placeholder="$t('groupPicker.searchPlaceholder')"
            />
            <button v-if="searchQuery" class="gpm-search-clear" @click="searchQuery = ''">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="gpm-list-wrap">
            <div
              v-for="group in filteredGroups"
              :key="group.value"
              class="gpm-item"
              :class="{ 'gpm-item--selected': group.value === modelValue }"
              @click="selectGroup(group)"
            >
              <div class="gpm-item-main">
                <span class="gpm-item-label">{{ group.label }}</span>
                <span class="gpm-item-type" :class="isPackagingGroup(group.value) ? 'gpm-item-type--packaging' : 'gpm-item-type--product'">
                  {{ getGroupType(group) }}
                </span>
              </div>
              <div class="gpm-item-meta">
                <span class="gpm-item-rate">{{ group.baseRate.toLocaleString('ru-RU') }} {{ $t('groupPicker.somPerTon') }}</span>
                <span class="gpm-item-norm">{{ $t('groupPicker.norm') }}: {{ group.recyclingStandard }}%</span>
              </div>
              <svg v-if="group.value === modelValue" class="gpm-item-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div v-if="filteredGroups.length === 0" class="gpm-empty">
              {{ $t('ui.nothingFound') }}
            </div>
          </div>

          <div class="gpm-footer">
            <span class="gpm-footer-count">{{ $t('groupPicker.ofGroups', { filtered: filteredGroups.length, total: productGroups.length }) }}</span>
            <button class="gpm-cancel" @click="closeModal">{{ $t('common.cancel') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.gpm-field-wrapper {
  width: 100%;
}

.gpm-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 18px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  font-size: 20px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s;
}

.gpm-trigger:hover {
  border-color: #94a3b8;
}

.gpm-trigger--has-value {
  color: #1e293b;
}

.gpm-trigger-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gpm-trigger-icon {
  flex-shrink: 0;
  color: #64748b;
}

.gpm-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.gpm-modal {
  width: 85vw;
  max-width: 1200px;
  height: 85vh;
  max-height: 800px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.gpm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.gpm-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.gpm-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: #475569;
  margin: 4px 0 0;
}

.gpm-close {
  padding: 4px;
  border: none;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s;
}

.gpm-close:hover {
  background: #f1f5f9;
  color: #475569;
}

.gpm-search-wrap {
  position: relative;
  padding: 12px 24px;
  flex-shrink: 0;
}

.gpm-search-icon {
  position: absolute;
  left: 38px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.gpm-search {
  width: 100%;
  padding: 14px 44px 14px 46px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s;
}

.gpm-search:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gpm-search::placeholder {
  color: #64748b;
}

.gpm-search-clear {
  position: absolute;
  right: 38px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  border: none;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
}

.gpm-search-clear:hover {
  color: #64748b;
}

.gpm-list-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 8px 24px;
}

.gpm-item {
  position: relative;
  padding: 16px 44px 16px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
}

.gpm-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.gpm-item--selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.gpm-item--selected:hover {
  background: #dbeafe;
}

.gpm-item-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.gpm-item-label {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.gpm-item-type {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
}

.gpm-item-type--product {
  background: #dbeafe;
  color: #1e40af;
}

.gpm-item-type--packaging {
  background: #fef3c7;
  color: #92400e;
}

.gpm-item-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.gpm-item-rate {
  font-weight: 700;
  color: #059669;
}

.gpm-item-check {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #3b82f6;
}

.gpm-empty {
  text-align: center;
  padding: 40px 0;
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
}

.gpm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: #f8fafc;
}

.gpm-footer-count {
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
}

.gpm-cancel {
  padding: 10px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.gpm-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

@media (max-width: 768px) {
  .gpm-modal {
    width: 95vw;
    height: 90vh;
  }

  .gpm-header {
    padding: 16px;
  }

  .gpm-search-wrap {
    padding: 8px 16px;
  }

  .gpm-search-icon {
    left: 30px;
  }

  .gpm-search-clear {
    right: 30px;
  }

  .gpm-list-wrap {
    padding: 8px 16px;
  }

  .gpm-footer {
    padding: 12px 16px;
  }
}
</style>
