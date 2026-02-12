<script setup lang="ts">
/**
 * Subgroup picker modal for CalculatorView.
 * Works with rop-data.json format (index-based selection, GoodsSubgroup/PackagingSubgroup types).
 */
import { ref, computed, watch, nextTick } from 'vue'

interface GoodsSubgroup {
  name: string
  gskpCode: string
  tnVedCode: string
  tnVedName: string
  category: string
}

interface PackagingSubgroup {
  name: string
  material: string
  letterCode: string
  digitalCode: string
  category: string
}

type AnySubgroup = GoodsSubgroup | PackagingSubgroup

interface GroupData {
  number: number
  name: string
  shortName: string
  ropRate: number
  subgroups: AnySubgroup[]
}

const props = defineProps<{
  group: GroupData | null
  modelValue: number | null
  isPackaging: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectedSubgroup = computed(() => {
  if (props.modelValue === null || !props.group) return null
  return props.group.subgroups[props.modelValue] || null
})

const selectedLabel = computed(() => {
  if (!selectedSubgroup.value) return ''
  return selectedSubgroup.value.name
})

const filteredSubgroups = computed(() => {
  if (!props.group) return []
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) {
    return props.group.subgroups.map((sub, idx) => ({ sub, idx }))
  }
  return props.group.subgroups
    .map((sub, idx) => ({ sub, idx }))
    .filter(({ sub }) => {
      if (sub.name.toLowerCase().includes(q)) return true
      if (props.isPackaging) {
        const p = sub as PackagingSubgroup
        if (p.material?.toLowerCase().includes(q)) return true
        if (p.letterCode?.toLowerCase().includes(q)) return true
        if (p.digitalCode?.toLowerCase().includes(q)) return true
      } else {
        const g = sub as GoodsSubgroup
        if (g.gskpCode?.toLowerCase().includes(q)) return true
        if (g.tnVedCode?.toLowerCase().includes(q)) return true
        if (g.tnVedName?.toLowerCase().includes(q)) return true
      }
      return false
    })
})

const openModal = () => {
  if (!props.group || props.disabled) return
  searchQuery.value = ''
  isOpen.value = true
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const closeModal = () => {
  isOpen.value = false
}

const selectSubgroup = (idx: number) => {
  emit('update:modelValue', idx)
  isOpen.value = false
}

const onOverlayClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('spm-overlay')) {
    closeModal()
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeModal()
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
    <!-- Trigger -->
    <button
      type="button"
      class="spm-trigger"
      :class="{ 'spm-trigger--disabled': !group || disabled, 'spm-trigger--has-value': !!selectedSubgroup }"
      :disabled="!group || disabled"
      @click="openModal"
    >
      <span class="spm-trigger-text">
        {{ selectedSubgroup ? selectedLabel : (group ? '— Нажмите для выбора подгруппы —' : '— Сначала выберите группу —') }}
      </span>
      <svg class="spm-trigger-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" stroke-linecap="round" />
      </svg>
    </button>
    <div v-if="selectedSubgroup" class="spm-hint">
      {{ selectedLabel }}
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="isOpen" class="spm-overlay" @click="onOverlayClick">
        <div class="spm-modal">
          <!-- Header -->
          <div class="spm-header">
            <div>
              <h2 class="spm-title">Выбор подгруппы товара</h2>
              <p v-if="group" class="spm-subtitle">{{ group.name }} &mdash; ставка {{ group.ropRate.toLocaleString('ru-RU') }} сом/т</p>
            </div>
            <button class="spm-close" @click="closeModal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search -->
          <div class="spm-search-wrap">
            <svg class="spm-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" stroke-linecap="round" />
            </svg>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="spm-search"
              placeholder="Поиск по наименованию или коду..."
            />
            <button v-if="searchQuery" class="spm-search-clear" @click="searchQuery = ''">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Table -->
          <div class="spm-table-wrap">
            <table class="spm-table">
              <thead>
                <tr v-if="!isPackaging">
                  <th class="spm-th spm-th-num">#</th>
                  <th class="spm-th spm-th-name">Наименование подгруппы</th>
                  <th class="spm-th spm-th-code">Код ГСКП</th>
                  <th class="spm-th spm-th-code">Код ТН ВЭД</th>
                  <th class="spm-th spm-th-tnved">Наименование ТН ВЭД</th>
                </tr>
                <tr v-else>
                  <th class="spm-th spm-th-num">#</th>
                  <th class="spm-th spm-th-name">Наименование подгруппы</th>
                  <th class="spm-th spm-th-material">Материал упаковки</th>
                  <th class="spm-th spm-th-code">Код по ТР ТС</th>
                  <th class="spm-th spm-th-code">Обозначение по ТР ТС</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="filteredSubgroups.length > 0">
                  <tr
                    v-for="({ sub, idx }, i) in filteredSubgroups"
                    :key="idx"
                    class="spm-row"
                    :class="{ 'spm-row--selected': idx === modelValue }"
                    @click="selectSubgroup(idx)"
                  >
                    <template v-if="!isPackaging">
                      <td class="spm-td spm-td-num">{{ i + 1 }}</td>
                      <td class="spm-td spm-td-name">{{ (sub as GoodsSubgroup).name }}</td>
                      <td class="spm-td spm-td-code">{{ (sub as GoodsSubgroup).gskpCode || '—' }}</td>
                      <td class="spm-td spm-td-code">{{ (sub as GoodsSubgroup).tnVedCode || '—' }}</td>
                      <td class="spm-td spm-td-tnved">{{ (sub as GoodsSubgroup).tnVedName || '—' }}</td>
                    </template>
                    <template v-else>
                      <td class="spm-td spm-td-num">{{ i + 1 }}</td>
                      <td class="spm-td spm-td-name">{{ (sub as PackagingSubgroup).name }}</td>
                      <td class="spm-td spm-td-material">{{ (sub as PackagingSubgroup).material || '—' }}</td>
                      <td class="spm-td spm-td-code">{{ (sub as PackagingSubgroup).digitalCode || '—' }}</td>
                      <td class="spm-td spm-td-code">{{ (sub as PackagingSubgroup).letterCode || '—' }}</td>
                    </template>
                  </tr>
                </template>
                <tr v-else>
                  <td :colspan="5" class="spm-td text-center py-8 text-[#94a3b8]">
                    Ничего не найдено
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="spm-footer">
            <span class="spm-footer-count">{{ filteredSubgroups.length }} из {{ group?.subgroups.length || 0 }} позиций</span>
            <button class="spm-cancel" @click="closeModal">Отмена</button>
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

/* Large trigger for public calculator */
.spm-trigger {
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
  color: #94a3b8;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  line-height: 1.5;
}

.spm-trigger:hover:not(:disabled) {
  border-color: #0e888d;
}

.spm-trigger--has-value {
  color: #415861;
}

.spm-trigger--disabled {
  background: #f1f5f9;
  color: #94a3b8;
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
  color: #94a3b8;
}

.spm-hint {
  margin-top: 6px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
  word-wrap: break-word;
}

/* === Overlay === */
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
  width: 90vw;
  max-width: 1100px;
  height: 80vh;
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
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.spm-subtitle {
  font-size: 14px;
  color: #64748b;
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
  padding: 10px 40px 10px 42px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s;
}

.spm-search:focus {
  border-color: #0e888d;
  box-shadow: 0 0 0 3px rgba(14, 136, 141, 0.1);
}

.spm-search::placeholder {
  color: #94a3b8;
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

.spm-table-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 0 24px;
}

.spm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.spm-th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
  z-index: 1;
}

.spm-th-num { width: 40px; text-align: center; }
.spm-th-name { min-width: 250px; width: 40%; }
.spm-th-code { min-width: 100px; }
.spm-th-tnved { min-width: 200px; width: 30%; }
.spm-th-material { min-width: 150px; width: 25%; }

.spm-row {
  cursor: pointer;
  transition: background-color 0.1s;
}

.spm-row:hover { background: #f0fdf4; }
.spm-row--selected { background: #ecfdf5; }
.spm-row--selected:hover { background: #d1fae5; }

.spm-td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: top;
}

.spm-td-num { text-align: center; color: #94a3b8; font-size: 12px; }
.spm-td-name { white-space: normal; word-wrap: break-word; line-height: 1.4; font-weight: 500; }
.spm-td-code { font-family: ui-monospace, SFMono-Regular, 'Cascadia Code', monospace; font-size: 12px; white-space: nowrap; color: #475569; }
.spm-td-tnved { white-space: normal; word-wrap: break-word; line-height: 1.4; color: #475569; font-size: 12px; }
.spm-td-material { white-space: normal; word-wrap: break-word; line-height: 1.4; color: #475569; }

.spm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: #f8fafc;
}

.spm-footer-count { font-size: 13px; color: #64748b; }

.spm-cancel {
  padding: 8px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.spm-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

@media (max-width: 768px) {
  .spm-modal { width: 95vw; height: 90vh; }
  .spm-header { padding: 16px; }
  .spm-search-wrap { padding: 8px 16px; }
  .spm-search-icon { left: 30px; }
  .spm-search-clear { right: 30px; }
  .spm-table-wrap { padding: 0 16px; }
  .spm-footer { padding: 12px 16px; }
  .spm-th, .spm-td { padding: 8px; }
}
</style>
