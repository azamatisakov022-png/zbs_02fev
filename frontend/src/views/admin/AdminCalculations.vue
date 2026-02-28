<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton } from '../../components/ui'
import { useAdminMenu } from '../../composables/useRoleMenu'
import { getRatePerKg } from '../../data/rates'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

const activeTab = ref('rates')

interface FeeRate {
  id: number; category: string; subcategory: string; code: string
  rate: number; unit: string; effectiveFrom: string; effectiveTo: string | null; isActive: boolean
}

// Ставки из единого источника data/rates.ts (ПКМ КР №730)
const feeRates = ref<FeeRate[]>([
  { id: 1, category: 'Упаковка', subcategory: 'Изделия пластмассовые упаковочные', code: 'УП-ПЛ', rate: getRatePerKg(6), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
  { id: 2, category: 'Упаковка', subcategory: 'Изделия пластмассовые прочие', code: 'УП-ПП', rate: getRatePerKg(7), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
  { id: 3, category: 'Упаковка', subcategory: 'Стекло полое', code: 'УП-СТ', rate: getRatePerKg(8), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
  { id: 4, category: 'Упаковка', subcategory: 'Упаковка из комбинированных материалов', code: 'УП-КМ', rate: getRatePerKg(21), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
  { id: 5, category: 'Упаковка', subcategory: 'Упаковка из гофрированного картона', code: 'УП-КР', rate: getRatePerKg(22), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
  { id: 6, category: 'Электроника', subcategory: 'Техника бытовая крупная', code: 'ЭЛ-КБТ', rate: getRatePerKg(15), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
  { id: 7, category: 'Электроника', subcategory: 'Техника бытовая мелкая', code: 'ЭЛ-МБТ', rate: getRatePerKg(16), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
  { id: 8, category: 'Батареи', subcategory: 'Элементы первичные и батареи', code: 'БТ-ПТ', rate: getRatePerKg(11), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
  { id: 9, category: 'Батареи', subcategory: 'Аккумуляторы свинцовые', code: 'БТ-АВТ', rate: getRatePerKg(12), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
  { id: 10, category: 'Шины', subcategory: 'Шины, покрышки и камеры резиновые', code: 'ШН-ЛГ', rate: getRatePerKg(4), unit: 'сом/кг', effectiveFrom: '2025-01-01', effectiveTo: null, isActive: true },
])

interface Normative {
  id: number; category: string; year: number; targetPercent: number; currentPercent: number
}

const normatives = ref<Normative[]>([
  { id: 1, category: 'Пластик', year: 2026, targetPercent: 20, currentPercent: 18 },
  { id: 2, category: 'Пластик', year: 2027, targetPercent: 25, currentPercent: 0 },
  { id: 3, category: 'Бумага и картон', year: 2026, targetPercent: 25, currentPercent: 28 },
  { id: 4, category: 'Стекло', year: 2026, targetPercent: 30, currentPercent: 25 },
  { id: 5, category: 'Металл', year: 2026, targetPercent: 35, currentPercent: 42 },
  { id: 6, category: 'Электроника', year: 2026, targetPercent: 40, currentPercent: 35 },
])

const formulas = ref([
  { id: 1, name: 'Расчёт утильсбора', formula: 'Сумма = Масса × Ставка × Коэффициент', active: true },
  { id: 2, name: 'Коэффициент региона', formula: 'K = 1.0 (Бишкек), 0.8 (регионы)', active: true },
  { id: 3, name: 'Льготный коэффициент', formula: 'K = 0.5 для экспортёров', active: true },
  { id: 4, name: 'Штраф за просрочку', formula: '0.1% в день от суммы', active: true },
])

const formatNumber = (num: number) => num.toLocaleString()

// --- Edit Rate Modal ---
const showEditModal = ref(false)
const editingRate = ref<FeeRate | null>(null)

function openEditModal(rate: FeeRate) {
  editingRate.value = { ...rate }
  showEditModal.value = true
}

function saveRate() {
  if (editingRate.value) {
    const index = feeRates.value.findIndex(r => r.id === editingRate.value!.id)
    if (index !== -1) feeRates.value[index] = { ...editingRate.value }
  }
  showEditModal.value = false
}

// --- Add Rate Modal ---
const showAddModal = ref(false)
const newRate = reactive({
  category: '', subcategory: '', code: '', rate: 0, unit: 'сом/кг', effectiveFrom: '', isActive: true,
})
const addErrors = reactive<Record<string, string>>({})

function openAddModal() {
  Object.assign(newRate, { category: '', subcategory: '', code: '', rate: 0, unit: 'сом/кг', effectiveFrom: '', isActive: true })
  Object.keys(addErrors).forEach(k => delete addErrors[k])
  showAddModal.value = true
}

function validateAddRate(): boolean {
  Object.keys(addErrors).forEach(k => delete addErrors[k])
  if (!newRate.category.trim()) addErrors.category = t('adminCalcs.errSelectCategory')
  if (!newRate.subcategory.trim()) addErrors.subcategory = t('adminCalcs.errEnterSubcategory')
  if (!newRate.code.trim()) addErrors.code = t('adminCalcs.errEnterCode')
  if (!newRate.rate || newRate.rate <= 0) addErrors.rate = t('adminCalcs.errEnterRate')
  if (!newRate.effectiveFrom) addErrors.effectiveFrom = t('adminCalcs.errSelectDate')
  return Object.keys(addErrors).length === 0
}

function addRate() {
  if (!validateAddRate()) return
  feeRates.value.push({
    id: Math.max(...feeRates.value.map(r => r.id)) + 1,
    category: newRate.category, subcategory: newRate.subcategory, code: newRate.code,
    rate: newRate.rate, unit: newRate.unit, effectiveFrom: newRate.effectiveFrom,
    effectiveTo: null, isActive: newRate.isActive,
  })
  showAddModal.value = false
}

// --- Delete Rate ---
const showDeleteConfirm = ref(false)
const deletingRate = ref<FeeRate | null>(null)

function confirmDeleteRate(rate: FeeRate) {
  deletingRate.value = rate
  showDeleteConfirm.value = true
}

function deleteRate() {
  if (deletingRate.value) {
    feeRates.value = feeRates.value.filter(r => r.id !== deletingRate.value!.id)
  }
  showDeleteConfirm.value = false
}

// --- Edit Normative ---
const showNormModal = ref(false)
const editingNorm = ref<Normative | null>(null)

function openNormEdit(norm: Normative) {
  editingNorm.value = { ...norm }
  showNormModal.value = true
}

function saveNorm() {
  if (editingNorm.value) {
    const idx = normatives.value.findIndex(n => n.id === editingNorm.value!.id)
    if (idx !== -1) normatives.value[idx] = { ...editingNorm.value }
  }
  showNormModal.value = false
}

// --- Edit Formula ---
const showFormulaModal = ref(false)
const editingFormula = ref<{ id: number; name: string; formula: string; active: boolean } | null>(null)

function openFormulaEdit(f: typeof formulas.value[0]) {
  editingFormula.value = { ...f }
  showFormulaModal.value = true
}

function saveFormula() {
  if (editingFormula.value) {
    const idx = formulas.value.findIndex(f => f.id === editingFormula.value!.id)
    if (idx !== -1) formulas.value[idx] = { ...editingFormula.value }
  }
  showFormulaModal.value = false
}

function toggleFormula(f: typeof formulas.value[0]) {
  f.active = !f.active
}

function handleOverlay(e: MouseEvent, close: () => void) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) close()
}
</script>

<template>
  <DashboardLayout role="admin" :roleTitle="roleTitle" userName="Иван Петров" :menuItems="menuItems">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('adminCalcs.title') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('adminCalcs.subtitle') }}</p>
        </div>
        <AppButton variant="primary" @click="openAddModal">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          {{ $t('adminCalcs.addRate') }}
        </AppButton>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <div><p class="text-amber-800 font-medium">{{ $t('adminCalcs.warningTitle') }}</p><p class="text-amber-700 text-sm">{{ $t('adminCalcs.warningText') }}</p></div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex gap-8">
          <button @click="activeTab = 'rates'" :class="['pb-4 px-1 font-medium text-sm border-b-2 transition-colors', activeTab === 'rates' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700']">{{ $t('adminCalcs.tabRates') }}</button>
          <button @click="activeTab = 'normatives'" :class="['pb-4 px-1 font-medium text-sm border-b-2 transition-colors', activeTab === 'normatives' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700']">{{ $t('adminCalcs.tabNormatives') }}</button>
          <button @click="activeTab = 'formulas'" :class="['pb-4 px-1 font-medium text-sm border-b-2 transition-colors', activeTab === 'formulas' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700']">{{ $t('adminCalcs.tabFormulas') }}</button>
        </nav>
      </div>

      <!-- Rates Tab -->
      <div v-if="activeTab === 'rates'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminCalcs.colCode') }}</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminCalcs.colCategory') }}</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminCalcs.colSubcategory') }}</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('adminCalcs.colRate') }}</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminCalcs.colEffectiveFrom') }}</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminCalcs.colStatus') }}</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminCalcs.colActions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="rate in feeRates" :key="rate.id" class="hover:bg-gray-50">
              <td class="px-6 py-4"><span class="font-mono text-sm text-rose-600 bg-rose-50 px-2 py-1 rounded">{{ rate.code }}</span></td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ rate.category }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ rate.subcategory }}</td>
              <td class="px-6 py-4 text-right"><span class="font-semibold text-gray-900">{{ formatNumber(rate.rate) }}</span><span class="text-gray-500 text-sm ml-1">{{ rate.unit }}</span></td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ new Date(rate.effectiveFrom).toLocaleDateString() }}</td>
              <td class="px-6 py-4 text-center"><span :class="rate.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 rounded-full text-xs font-medium">{{ rate.isActive ? $t('adminCalcs.statusActive') : $t('adminCalcs.statusInactive') }}</span></td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <AppButton variant="secondary" size="sm" @click="openEditModal(rate)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    {{ $t('adminCalcs.btnEdit') }}
                  </AppButton>
                  <AppButton variant="danger" size="sm" @click="confirmDeleteRate(rate)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    {{ $t('adminCalcs.btnDelete') }}
                  </AppButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Normatives Tab -->
      <div v-if="activeTab === 'normatives'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="norm in normatives" :key="norm.id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-4">
              <div><h3 class="font-semibold text-gray-900">{{ norm.category }}</h3><p class="text-sm text-gray-500">{{ norm.year }} {{ $t('adminCalcs.year') }}</p></div>
              <button @click="openNormEdit(norm)" class="p-2 text-gray-400 hover:text-rose-600 transition-colors" :title="$t('adminCalcs.editBtn')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between text-sm"><span class="text-gray-500">{{ $t('adminCalcs.targetNorm') }}</span><span class="font-semibold text-gray-900">{{ norm.targetPercent }}%</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">{{ $t('adminCalcs.currentIndicator') }}</span><span :class="norm.currentPercent >= norm.targetPercent ? 'text-green-600' : 'text-orange-600'" class="font-semibold">{{ norm.currentPercent }}%</span></div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" :class="norm.currentPercent >= norm.targetPercent ? 'bg-green-500' : 'bg-orange-500'" :style="{ width: `${Math.min(100, (norm.currentPercent / norm.targetPercent) * 100)}%` }"></div>
              </div>
              <p class="text-xs text-gray-500 text-center">{{ norm.currentPercent >= norm.targetPercent ? $t('adminCalcs.normMet') : `${$t('adminCalcs.remaining')} ${norm.targetPercent - norm.currentPercent}%` }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulas Tab -->
      <div v-if="activeTab === 'formulas'" class="space-y-4">
        <div v-for="formula in formulas" :key="formula.id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <div><h3 class="font-semibold text-gray-900">{{ formula.name }}</h3><p class="text-sm text-gray-500 font-mono mt-1">{{ formula.formula }}</p></div>
            </div>
            <div class="flex items-center gap-3">
              <button @click="toggleFormula(formula)" :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors', formula.active ? 'bg-green-500' : 'bg-gray-300']">
                <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform', formula.active ? 'translate-x-6' : 'translate-x-1']" />
              </button>
              <button @click="openFormulaEdit(formula)" class="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== EDIT RATE MODAL ===== -->
    <Teleport to="body">
      <div v-if="showEditModal && editingRate" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="(e: MouseEvent) => handleOverlay(e, () => showEditModal = false)">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('adminCalcs.editRateTitle') }}</h3>
            <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelCode') }}</label><input v-model="editingRate.code" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" readonly /></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelRate') }}</label><div class="flex gap-2"><input v-model.number="editingRate.rate" type="number" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" /><input v-model="editingRate.unit" type="text" class="w-28 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readonly /></div></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelEffectiveFrom') }}</label><input v-model="editingRate.effectiveFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" /></div>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="editingRate.isActive" class="w-4 h-4 text-rose-600 rounded" /><span class="text-sm text-gray-700">{{ $t('adminCalcs.labelRateActive') }}</span></label>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
            <AppButton variant="secondary" class="flex-1" @click="showEditModal = false">{{ $t('adminCalcs.cancel') }}</AppButton>
            <AppButton variant="primary" class="flex-1" @click="saveRate">{{ $t('adminCalcs.save') }}</AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== ADD RATE MODAL ===== -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="(e: MouseEvent) => handleOverlay(e, () => showAddModal = false)">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('adminCalcs.addRateTitle') }}</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelWasteCategory') }} <span class="text-red-500">*</span></label>
              <select v-model="newRate.category" :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500', addErrors.category ? 'border-red-400' : 'border-gray-300']">
                <option value="" disabled>{{ $t('adminCalcs.selectCategory') }}</option>
                <option>Упаковка</option><option>Электроника</option><option>Батареи</option><option>Шины</option><option>Масла</option>
              </select>
              <p v-if="addErrors.category" class="mt-1 text-xs text-red-500">{{ addErrors.category }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelSubcategory') }} <span class="text-red-500">*</span></label>
              <input v-model="newRate.subcategory" type="text" :placeholder="$t('adminCalcs.placeholderSubcategory')" :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500', addErrors.subcategory ? 'border-red-400' : 'border-gray-300']" />
              <p v-if="addErrors.subcategory" class="mt-1 text-xs text-red-500">{{ addErrors.subcategory }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelCode') }} <span class="text-red-500">*</span></label>
                <input v-model="newRate.code" type="text" placeholder="УП-ПЭТ" :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 font-mono', addErrors.code ? 'border-red-400' : 'border-gray-300']" />
                <p v-if="addErrors.code" class="mt-1 text-xs text-red-500">{{ addErrors.code }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelUnit') }}</label>
                <select v-model="newRate.unit" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500">
                  <option>сом/кг</option><option>сом/шт</option><option>сом/л</option><option>сом/т</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelRateValue') }} <span class="text-red-500">*</span></label>
                <input v-model.number="newRate.rate" type="number" min="0" step="0.01" placeholder="0" :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500', addErrors.rate ? 'border-red-400' : 'border-gray-300']" />
                <p v-if="addErrors.rate" class="mt-1 text-xs text-red-500">{{ addErrors.rate }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelStartDate') }} <span class="text-red-500">*</span></label>
                <input v-model="newRate.effectiveFrom" type="date" :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500', addErrors.effectiveFrom ? 'border-red-400' : 'border-gray-300']" />
                <p v-if="addErrors.effectiveFrom" class="mt-1 text-xs text-red-500">{{ addErrors.effectiveFrom }}</p>
              </div>
            </div>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="newRate.isActive" class="w-4 h-4 text-rose-600 rounded" /><span class="text-sm text-gray-700">{{ $t('adminCalcs.labelRateActive') }}</span></label>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
            <AppButton variant="secondary" class="flex-1" @click="showAddModal = false">{{ $t('adminCalcs.cancel') }}</AppButton>
            <AppButton variant="primary" class="flex-1" @click="addRate">{{ $t('adminCalcs.btnAdd') }}</AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== DELETE RATE CONFIRM ===== -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm && deletingRate" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="(e: MouseEvent) => handleOverlay(e, () => showDeleteConfirm = false)">
        <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full text-center p-8">
          <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('adminCalcs.deleteRateTitle') }}</h3>
          <p class="text-gray-500 text-sm mb-6">{{ deletingRate.code }} — {{ deletingRate.subcategory }} ({{ formatNumber(deletingRate.rate) }} {{ deletingRate.unit }})</p>
          <div class="flex gap-3">
            <AppButton variant="secondary" class="flex-1" @click="showDeleteConfirm = false">{{ $t('adminCalcs.cancel') }}</AppButton>
            <AppButton variant="danger" class="flex-1" @click="deleteRate">{{ $t('adminCalcs.btnDelete') }}</AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== EDIT NORMATIVE MODAL ===== -->
    <Teleport to="body">
      <div v-if="showNormModal && editingNorm" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="(e: MouseEvent) => handleOverlay(e, () => showNormModal = false)">
        <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('adminCalcs.editNormTitle') }}</h3>
            <button @click="showNormModal = false" class="text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelCategory') }}</label><input :value="editingNorm.category" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readonly /></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelYear') }}</label><input v-model.number="editingNorm.year" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" /></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelTargetPercent') }}</label><input v-model.number="editingNorm.targetPercent" type="number" min="0" max="100" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" /></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelCurrentPercent') }}</label><input v-model.number="editingNorm.currentPercent" type="number" min="0" max="100" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" /></div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
            <AppButton variant="secondary" class="flex-1" @click="showNormModal = false">{{ $t('adminCalcs.cancel') }}</AppButton>
            <AppButton variant="primary" class="flex-1" @click="saveNorm">{{ $t('adminCalcs.save') }}</AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== EDIT FORMULA MODAL ===== -->
    <Teleport to="body">
      <div v-if="showFormulaModal && editingFormula" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="(e: MouseEvent) => handleOverlay(e, () => showFormulaModal = false)">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('adminCalcs.editFormulaTitle') }}</h3>
            <button @click="showFormulaModal = false" class="text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelName') }}</label><input v-model="editingFormula.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" /></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminCalcs.labelFormula') }}</label><input v-model="editingFormula.formula" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-mono" /></div>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="editingFormula.active" class="w-4 h-4 text-rose-600 rounded" /><span class="text-sm text-gray-700">{{ $t('adminCalcs.labelFormulaActive') }}</span></label>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
            <AppButton variant="secondary" class="flex-1" @click="showFormulaModal = false">{{ $t('adminCalcs.cancel') }}</AppButton>
            <AppButton variant="primary" class="flex-1" @click="saveFormula">{{ $t('adminCalcs.save') }}</AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
