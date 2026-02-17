<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { calculationStore, type Calculation } from '../../stores/calculations'
import { productGroups, getSubgroupLabel, getSubgroupData, isPackagingGroup } from '../../data/product-groups'
import TnvedCode from '../../components/TnvedCode.vue'
import { generateCalculationExcel } from '../../utils/excelExport'
import { accountStore } from '../../stores/account'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { notificationStore } from '../../stores/notifications'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

const calcId = computed(() => Number(route.params.id))
const calc = computed<Calculation | undefined>(() => calculationStore.getCalculationById(calcId.value))

const getStatusClass = (status: string) => {
  switch (status) {
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Принято': return 'bg-green-100 text-green-800'
    case 'Отклонено': return 'bg-red-100 text-red-800'
    case 'Оплата на проверке': return 'bg-purple-100 text-purple-800'
    case 'Оплачено': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const payerTypeLabel = computed(() => {
  if (!calc.value) return ''
  return calc.value.payerType === 'importer' ? 'Импортёр' : 'Производитель'
})

const getGroupLabel = (value: string) => productGroups.find(g => g.value === value)?.label || value

// Totals
const totalVolume = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(i.volume) || 0), 0)
})
const totalVolumeToRecycle = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(String(i.volumeToRecycle ?? '0')) || 0), 0)
})
const totalTransferredToRecycling = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(i.transferredToRecycling || '0') || 0), 0)
})
const totalExportedFromKR = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(i.exportedFromKR || '0') || 0), 0)
})
const totalTaxableVolume = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(String(i.taxableVolume ?? '0')) || 0), 0)
})

const reconciliation = computed(() => {
  if (!calc.value) return { charged: 0, paid: 0, difference: 0 }
  return accountStore.getReconciliationForCalculationGlobal(calc.value.id)
})

// Approve / Reject
const showRejectModal = ref(false)
const rejectionReason = ref('')
const showToast = ref(false)
const toastMessage = ref('')

const approveCalc = () => {
  if (!calc.value) return
  calculationStore.approveCalculation(calc.value.id)
  notificationStore.add({
    type: 'success',
    title: `Расчёт ${calc.value.number} принят`,
    message: 'Ваш расчёт утилизационного сбора принят и ожидает оплаты.',
    role: 'business',
    link: `/business/calculations/${calc.value.id}`
  })
  toastMessage.value = `Расчёт ${calc.value.number} принят`
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const openRejectModal = () => {
  rejectionReason.value = ''
  showRejectModal.value = true
}

const rejectCalc = () => {
  if (!calc.value || rejectionReason.value.trim().length < 10) return
  calculationStore.rejectCalculation(calc.value.id, rejectionReason.value.trim())
  notificationStore.add({
    type: 'error',
    title: `Расчёт ${calc.value.number} отклонён`,
    message: rejectionReason.value.trim() || 'Расчёт отклонён. Исправьте и отправьте повторно.',
    role: 'business'
  })
  showRejectModal.value = false
  toastMessage.value = `Расчёт ${calc.value.number} отклонён`
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const goBack = () => router.push('/eco-operator/calculations')

const downloadFile = (name: string) => {
  toastStore.show({ type: 'info', title: 'Скачивание файла', message: name })
}

const downloadExcel = () => {
  if (!calc.value) return
  generateCalculationExcel(calc.value, {
    name: calc.value.company,
    inn: calc.value.inn,
    address: calc.value.address || '',
  }, reconciliation.value)
}
</script>

<template>
  <DashboardLayout role="eco-operator" :roleTitle="roleTitle" userName="ОсОО «ЭкоПереработка»" :menuItems="menuItems">
    <!-- Not Found -->
    <div v-if="!calc" class="text-center py-16">
      <p class="text-lg text-[#64748b] mb-4">Расчёт не найден</p>
      <button @click="goBack" class="px-6 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8]">{{ $t('common.back') }}</button>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">{{ calc.number }}</h1>
            <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(calc.status)]">{{ calc.status }}</span>
          </div>
          <p class="text-[#64748b]">Дата подачи: {{ calc.date }}</p>
        </div>
        <button @click="goBack" class="inline-flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-gray-50 text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {{ $t('common.back') }}
        </button>
      </div>

      <!-- Rejection reason block -->
      <div v-if="calc.status === 'Отклонено' && calc.rejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <div>
            <p class="font-medium text-red-800 mb-1">Причина отклонения</p>
            <p class="text-sm text-red-700">{{ calc.rejectionReason }}</p>
          </div>
        </div>
      </div>

      <!-- Payer Data -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Данные плательщика</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-[#64748b]">Тип плательщика</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ payerTypeLabel }}</p>
          </div>
          <div>
            <span class="text-[#64748b]">Наименование</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ calc.company }}</p>
          </div>
          <div>
            <span class="text-[#64748b]">ИНН</span>
            <p class="font-medium text-[#1e293b] font-mono mt-0.5">{{ calc.inn }}</p>
          </div>
          <div v-if="calc.address">
            <span class="text-[#64748b]">Адрес</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ calc.address }}</p>
          </div>
          <div>
            <span class="text-[#64748b]">{{ calc.payerType === 'importer' ? 'Дата ввоза' : 'Период' }}</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ calc.payerType === 'importer' ? calc.importDate : calc.period }}</p>
          </div>
          <div v-if="calc.dueDate">
            <span class="text-[#64748b]">Срок оплаты</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ calc.dueDate }}</p>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] mb-6 overflow-hidden">
        <div class="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-lg font-semibold text-[#1e293b]">Товары и упаковка</h2>
          <p class="text-sm text-[#64748b]">{{ calc.items.length }} {{ calc.items.length === 1 ? 'позиция' : 'позиций' }}</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-[#f8fafc]">
              <tr class="text-left text-[#64748b]">
                <th class="px-4 py-3 font-medium w-10">#</th>
                <th class="px-4 py-3 font-medium">Группа/подгруппа</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">Гр.5 Объём (т)</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">Гр.6 Норм. (%)</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">Гр.7 К перераб. (т)</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">Гр.8 Передано (т)</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">Гр.9 Вывезено (т)</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">Гр.10 Облагаемый (т)</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">Гр.11 Ставка</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">Гр.12 Сумма</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              <tr v-for="(item, idx) in calc.items" :key="item.id" class="hover:bg-[#f8fafc]">
                <td class="px-4 py-3 text-[#94a3b8]">{{ idx + 1 }}</td>
                <td class="px-4 py-3 text-[#1e293b]">
                  <div class="font-medium">{{ getGroupLabel(item.group) }}</div>
                  <div class="text-xs text-[#64748b] truncate max-w-[220px]" :title="getSubgroupLabel(item.group, item.subgroup)">{{ getSubgroupLabel(item.group, item.subgroup) }}</div>
                  <div v-if="item.gskpCode" class="text-xs font-mono text-[#94a3b8] mt-0.5">ГСКП {{ item.gskpCode }}</div>
                  <div v-if="item.tnvedCode" class="text-xs font-mono text-[#94a3b8] mt-0.5">ТН ВЭД <TnvedCode :code="item.tnvedCode" /></div>
                </td>
                <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ item.volume }}</td>
                <td class="px-4 py-3 text-right text-[#64748b]">{{ item.recyclingStandard != null ? item.recyclingStandard + '%' : '—' }}</td>
                <td class="px-4 py-3 text-right text-[#64748b]">{{ item.volumeToRecycle != null ? item.volumeToRecycle : '—' }}</td>
                <td class="px-4 py-3 text-right text-[#10b981] font-medium">{{ item.transferredToRecycling || '—' }}</td>
                <td class="px-4 py-3 text-right text-[#2563eb] font-medium">{{ item.exportedFromKR || '—' }}</td>
                <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ item.taxableVolume != null ? item.taxableVolume : '—' }}</td>
                <td class="px-4 py-3 text-right text-[#64748b]">{{ item.rate.toLocaleString('ru-RU') }}</td>
                <td class="px-4 py-3 text-right font-bold text-[#f59e0b]">{{ item.amount.toLocaleString('ru-RU') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Attached Documents -->
      <div v-if="calc.attachedFiles && calc.attachedFiles.length > 0" class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Прикреплённые документы</h2>
        <div class="space-y-2">
          <button
            v-for="(file, idx) in calc.attachedFiles"
            :key="idx"
            @click="downloadFile(file)"
            class="w-full flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg hover:bg-[#f1f5f9] transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </div>
            <span class="text-sm font-medium text-[#2563eb] hover:underline">{{ file }}</span>
          </button>
        </div>
      </div>

      <!-- Totals -->
      <div class="bg-gradient-to-r from-[#0e888d]/10 to-[#0e888d]/5 rounded-2xl p-6 border border-[#0e888d]/20 mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Итоги расчёта</h2>
        <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <p class="text-sm text-[#64748b] mb-1">Гр.5 Общий объём</p>
            <p class="text-xl font-bold text-[#1e293b]">{{ totalVolume.toLocaleString('ru-RU') }} т</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Гр.7 К переработке</p>
            <p class="text-xl font-bold text-[#64748b]">{{ totalVolumeToRecycle.toLocaleString('ru-RU') }} т</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Гр.8 Передано на переработку</p>
            <p class="text-xl font-bold text-[#10b981]">{{ totalTransferredToRecycling.toLocaleString('ru-RU') }} т</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Гр.9 Вывезено из КР</p>
            <p class="text-xl font-bold text-[#2563eb]">{{ totalExportedFromKR.toLocaleString('ru-RU') }} т</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Гр.10 Облагаемый объём</p>
            <p class="text-xl font-bold text-[#1e293b]">{{ totalTaxableVolume.toLocaleString('ru-RU') }} т</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Гр.12 Итого к оплате</p>
            <p class="text-2xl font-bold text-[#10b981]">{{ calc.totalAmount.toLocaleString('ru-RU') }} сом</p>
          </div>
        </div>
      </div>

      <!-- Графа 13: Сверка платежей -->
      <div class="g13-container mb-6">
        <div class="g13-header">
          <h3 class="g13-title">Графа 13. Сверка платежей за отчётный период</h3>
          <div class="g13-tooltip-wrap">
            <svg class="w-4 h-4 text-[#94a3b8] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="g13-tooltip">Заполняется автоматически на основании данных лицевого счёта. Для производителей — по суммам ежеквартальных платежей, для импортёров — по суммам платежей при фактическом ввозе товаров.</div>
          </div>
        </div>
        <div class="g13-cards">
          <div class="g13-card">
            <span class="g13-card__label">Начислено за период</span>
            <span class="g13-card__value">{{ reconciliation.charged.toLocaleString('ru-RU') }} сом</span>
            <span class="g13-card__sub">Из лицевого счёта</span>
          </div>
          <div class="g13-card">
            <span class="g13-card__label">Уплачено за период</span>
            <span class="g13-card__value g13-card__value--green">{{ reconciliation.paid.toLocaleString('ru-RU') }} сом</span>
            <span class="g13-card__sub">Из лицевого счёта</span>
          </div>
          <div :class="['g13-card g13-card--diff', reconciliation.difference > 0 ? 'g13-card--debt' : reconciliation.difference < 0 ? 'g13-card--overpay' : 'g13-card--zero']">
            <span class="g13-card__label">Разница (начислено − уплачено)</span>
            <span class="g13-card__value" :class="{ 'g13-card__value--red': reconciliation.difference > 0, 'g13-card__value--green': reconciliation.difference < 0, 'g13-card__value--gray': reconciliation.difference === 0 }">
              <template v-if="reconciliation.difference > 0">Недоимка: +{{ reconciliation.difference.toLocaleString('ru-RU') }} сом</template>
              <template v-else-if="reconciliation.difference < 0">Переплата: {{ Math.abs(reconciliation.difference).toLocaleString('ru-RU') }} сом</template>
              <template v-else>Задолженность отсутствует</template>
            </span>
          </div>
        </div>
      </div>

      <!-- Sticky Action Bar -->
      <div class="sticky bottom-0 bg-white border-t border-[#e2e8f0] -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button @click="goBack" class="px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-gray-50 text-sm font-medium">
          {{ $t('common.back') }}
        </button>
                <button @click="downloadExcel" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#059669;color:white;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Скачать Excel
                </button>
        <div v-if="calc.status === 'На проверке'" class="flex items-center gap-3">
          <button @click="openRejectModal" class="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            Отклонить
          </button>
          <button @click="approveCalc" class="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors text-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            Принять расчёт
          </button>
        </div>
      </div>
    </template>

    <!-- Reject Modal -->
    <Teleport to="body">
      <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" @click.self="showRejectModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div class="p-6 border-b border-[#e2e8f0]">
            <h3 class="text-lg font-bold text-[#1e293b]">Отклонить расчёт</h3>
            <p class="text-sm text-[#64748b] mt-1">Укажите причину отклонения расчёта {{ calc?.number }}</p>
          </div>
          <div class="p-6">
            <label class="block text-sm font-medium text-[#1e293b] mb-2">Причина отклонения <span class="text-[#EF4444]">*</span></label>
            <textarea
              v-model="rejectionReason"
              rows="4"
              placeholder="Опишите причину отклонения (минимум 10 символов)..."
              class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-red-400 text-sm resize-none"
            ></textarea>
            <p class="text-xs text-[#94a3b8] mt-1">{{ rejectionReason.length }} / мин. 10 символов</p>
          </div>
          <div class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <button @click="showRejectModal = false" class="px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-gray-50 text-sm font-medium">
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="rejectCalc"
              :disabled="rejectionReason.trim().length < 10"
              class="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отклонить
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="showToast" class="fixed top-6 right-6 z-[200] bg-[#10b981] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          <span class="font-medium">{{ toastMessage }}</span>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: translateY(-20px); }

/* Графа 13 styles */
.g13-container {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 20px;
}
.g13-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.g13-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}
.g13-tooltip-wrap {
  position: relative;
}
.g13-tooltip-wrap:hover .g13-tooltip {
  opacity: 1;
  visibility: visible;
}
.g13-tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(100% + 8px);
  width: 320px;
  padding: 10px 14px;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.15s;
  z-index: 50;
  pointer-events: none;
}
.g13-cards {
  display: flex;
  gap: 16px;
}
@media (max-width: 768px) {
  .g13-cards { flex-direction: column; }
}
.g13-card {
  flex: 1;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.g13-card--diff {
  border-left-width: 3px;
}
.g13-card--debt {
  border-left-color: #EF4444;
  background: #FEF2F2;
}
.g13-card--overpay {
  border-left-color: #059669;
  background: #F0FDF4;
}
.g13-card--zero {
  border-left-color: #64748B;
  background: #F8FAFC;
}
.g13-card__label {
  font-size: 12px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.g13-card__value {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
}
.g13-card__value--green { color: #059669; }
.g13-card__value--red { color: #EF4444; }
.g13-card__value--gray { color: #64748B; }
.g13-card__sub {
  font-size: 11px;
  color: #94A3B8;
}
</style>
