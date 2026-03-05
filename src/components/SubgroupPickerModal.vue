<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductGroupStore } from '@/stores/product-groups'
import type { ProductSubgroupDTO } from '@/types/product-group'

const { t } = useI18n()
const groupStore = useProductGroupStore()

const props = defineProps<{
  groupId: string
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'subgroupSelected': [data: ProductSubgroupDTO | null]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const groupNumber = computed(() => groupStore.getGroupNumberFromValue(props.groupId))

const groupData = computed(() => groupStore.getGroupByValue(props.groupId))

const isPackaging = computed(() => groupStore.isPackagingGroup(props.groupId))

const availableSubgroups = computed(() => groupStore.getSubgroups(groupNumber.value))

const selectedSubgroupData = computed(() => {
  if (!props.groupId || !props.modelValue) return null
  return groupStore.getSubgroupById(groupNumber.value, props.modelValue)
})

const filteredSubgroups = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return availableSubgroups.value
  return availableSubgroups.value.filter(sub => {
    if (sub.name.toLowerCase().includes(q)) return true
    if (sub.gskpCode?.toLowerCase().includes(q)) return true
    if (sub.tnvedCode?.toLowerCase().includes(q)) return true
    if (sub.tnvedName?.toLowerCase().includes(q)) return true
    if (sub.packagingMaterial?.toLowerCase().includes(q)) return true
    if (sub.packagingLetterCode?.toLowerCase().includes(q)) return true
    if (sub.packagingDigitalCode?.toLowerCase().includes(q)) return true
    return false
  })
})

const openModal = async () => {
  if (!props.groupId) return
  if (availableSubgroups.value.length === 0) {
    await groupStore.fetchSubgroups(groupNumber.value)
  }
  searchQuery.value = ''
  isOpen.value = true
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const closeModal = () => {
  isOpen.value = false
}

const selectSubgroup = (sub: ProductSubgroupDTO) => {
  emit('update:modelValue', String(sub.id))
  emit('subgroupSelected', sub)
  isOpen.value = false
}

const onOverlayClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('spm-overlay')) {
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
</script>

<template>
  <div class="spm-field-wrapper">
    <button
      type="button"
      class="spm-trigger"
      :class="{ 'spm-trigger--disabled': !groupId, 'spm-trigger--has-value': !!selectedSubgroupData }"
      :disabled="!groupId"
      @click="openModal"
    >
      <span class="spm-trigger-text" :title="selectedSubgroupData ? selectedSubgroupData.name : ''">
        {{ selectedSubgroupData ? selectedSubgroupData.name : $t('subgroupPicker.clickToSelect') }}
      </span>
      <svg class="spm-trigger-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" stroke-linecap="round" />
      </svg>
    </button>
    <div v-if="selectedSubgroupData" class="spm-hint">
      {{ selectedSubgroupData.name }}
    </div>

    <Teleport to="body">
      <div v-if="isOpen" class="spm-overlay" @click="onOverlayClick">
        <div class="spm-modal">
          <div class="spm-header">
            <div>
              <h2 class="spm-title">{{ $t('subgroupPicker.title') }}</h2>
              <p v-if="groupData" class="spm-subtitle">{{ groupData.groupNumber }}. {{ groupData.name }}</p>
            </div>
            <button class="spm-close" @click="closeModal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="spm-search-wrap">
            <svg class="spm-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" stroke-linecap="round" />
            </svg>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="spm-search"
              :placeholder="$t('subgroupPicker.searchPlaceholder')"
            />
            <button v-if="searchQuery" class="spm-search-clear" @click="searchQuery = ''">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="spm-list-wrap">
            <template v-if="filteredSubgroups.length > 0">
              <div
                v-for="sub in filteredSubgroups"
                :key="sub.id"
                class="spm-item"
                :class="{ 'spm-item--selected': String(sub.id) === modelValue }"
                @click="selectSubgroup(sub)"
              >
                <div class="spm-item-main">
                  <span class="spm-item-label">{{ sub.name }}</span>
                </div>
                <div class="spm-item-meta">
                  <template v-if="!isPackaging">
                    <span v-if="sub.gskpCode" class="spm-item-code">ГСКП: {{ sub.gskpCode }}</span>
                    <span v-if="sub.tnvedCode" class="spm-item-code">ТН ВЭД: {{ sub.tnvedCode }}</span>
                  </template>
                  <template v-else>
                    <span v-if="sub.packagingMaterial" class="spm-item-material">{{ sub.packagingMaterial }}</span>
                    <span v-if="sub.packagingLetterCode" class="spm-item-code">{{ sub.packagingLetterCode }}</span>
                    <span v-if="sub.packagingDigitalCode" class="spm-item-code">{{ sub.packagingDigitalCode }}</span>
                  </template>
                  <span class="spm-item-rate">{{ groupData?.currentRate?.toLocaleString('ru-RU') || '—' }} {{ $t('groupPicker.somPerTon') }}</span>
                </div>
                <div v-if="!isPackaging && sub.tnvedName" class="spm-item-tnved">
                  {{ sub.tnvedName }}
                </div>
                <svg v-if="String(sub.id) === modelValue" class="spm-item-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </template>
            <div v-else class="spm-empty">
              {{ $t('ui.nothingFound') }}
            </div>
          </div>

          <div class="spm-footer">
            <span class="spm-footer-count">{{ $t('subgroupPicker.ofPositions', { filtered: filteredSubgroups.length, total: availableSubgroups.length }) }}</span>
            <button class="spm-cancel" @click="closeModal">{{ $t('common.cancel') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.spm-field-wrapper {
  width: 100%;
}

.spm-trigger {
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

.spm-trigger:hover:not(:disabled) {
  border-color: #94a3b8;
}

.spm-trigger--has-value {
  color: #1e293b;
}

.spm-trigger--disabled {
  background: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

.spm-trigger-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spm-trigger-icon {
  flex-shrink: 0;
  color: #64748b;
}

.spm-hint {
  margin-top: 6px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.spm-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.spm-modal {
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

.spm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.spm-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.spm-subtitle {
  font-size: 18px;
  font-weight: 500;
  color: #475569;
  margin: 4px 0 0;
}

.spm-close {
  padding: 4px;
  border: none;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s;
}

.spm-close:hover {
  background: #f1f5f9;
  color: #475569;
}

.spm-search-wrap {
  position: relative;
  padding: 12px 24px;
  flex-shrink: 0;
}

.spm-search-icon {
  position: absolute;
  left: 38px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.spm-search {
  width: 100%;
  padding: 14px 44px 14px 46px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s;
}

.spm-search:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.spm-search::placeholder {
  color: #64748b;
}

.spm-search-clear {
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

.spm-search-clear:hover {
  color: #64748b;
}

.spm-list-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 8px 24px;
}

.spm-item {
  position: relative;
  padding: 16px 44px 16px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
}

.spm-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.spm-item--selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.spm-item--selected:hover {
  background: #dbeafe;
}

.spm-item-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.spm-item-label {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.spm-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
}

.spm-item-code {
  font-family: ui-monospace, SFMono-Regular, 'Cascadia Code', monospace;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.spm-item-material {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.spm-item-rate {
  font-weight: 700;
  color: #059669;
}

.spm-item-tnved {
  margin-top: 4px;
  font-size: 16px;
  font-weight: 500;
  color: #475569;
  line-height: 1.4;
}

.spm-item-check {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #3b82f6;
}

.spm-empty {
  text-align: center;
  padding: 40px 0;
  color: #64748b;
  font-size: 18px;
  font-weight: 500;
}

.spm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: #f8fafc;
}

.spm-footer-count {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
}

.spm-cancel {
  padding: 10px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.spm-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

@media (max-width: 768px) {
  .spm-modal {
    width: 95vw;
    height: 90vh;
  }

  .spm-header {
    padding: 16px;
  }

  .spm-search-wrap {
    padding: 8px 16px;
  }

  .spm-search-icon {
    left: 30px;
  }

  .spm-search-clear {
    right: 30px;
  }

  .spm-list-wrap {
    padding: 8px 16px;
  }

  .spm-footer {
    padding: 12px 16px;
  }
}
</style>
