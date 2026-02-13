<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { productGroups, productSubgroups } from '../../data/product-groups'
import { calculatePaymentDeadline, getRemainingDays, formatDateShort } from '../../utils/dateUtils'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'reports', label: 'Отчёты о переработке', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы и ставки', icon: icons.registries, route: '/business/normatives' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

const calcId = computed(() => Number(route.params.id))
const calc = computed(() => calculationStore.getCalculationById(calcId.value))

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

const getSubgroupLabel = (group: string, subgroup: string) => {
  return productSubgroups[group]?.find(s => s.value === subgroup)?.label || subgroup || '—'
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Черновик': return 'badge badge-neutral'
    case 'На проверке': return 'badge badge-warning'
    case 'Принято': return 'badge badge-success'
    case 'Отклонено': return 'badge badge-danger'
    case 'Оплата на проверке': return 'badge badge-purple'
    case 'Оплачено': return 'badge badge-info'
    case 'Оплата отклонена': return 'badge badge-danger'
    default: return 'badge badge-neutral'
  }
}

const totalMass = computed(() => {
  if (!calc.value) return '0'
  return calc.value.items.reduce((s, i) => s + (parseFloat(i.mass) || 0), 0).toFixed(2)
})

const totalRecycled = computed(() => {
  if (!calc.value) return '0'
  return calc.value.items.reduce((s, i) => s + (parseFloat(i.recycledMass || '0') || 0), 0).toFixed(2)
})

const totalTaxable = computed(() => {
  return (parseFloat(totalMass.value) - parseFloat(totalRecycled.value)).toFixed(2)
})

const payerTypeLabel = computed(() => {
  if (!calc.value) return ''
  return calc.value.payerType === 'importer' ? 'Импортёр' : 'Производитель'
})

const periodLabel = computed(() => {
  if (!calc.value) return ''
  if (calc.value.payerType === 'importer' && calc.value.importDate) {
    return `Ввоз: ${calc.value.importDate}`
  }
  return calc.value.period
})

const computedDueDate = computed(() => {
  if (!calc.value) return null
  const pt = calc.value.payerType || 'producer'
  const deadline = calculatePaymentDeadline(pt, {
    quarter: calc.value.quarter,
    year: calc.value.year,
    importDate: calc.value.importDate,
  })
  return deadline
})

const dueDateFormatted = computed(() => {
  if (!computedDueDate.value) return calc.value?.dueDate || '—'
  return formatDateShort(computedDueDate.value)
})

const deadlineStatus = computed(() => {
  if (!computedDueDate.value) return null
  return getRemainingDays(computedDueDate.value)
})

const goBack = () => {
  router.push('/business/calculator')
}

const mockAction = (action: string) => {
  alert(action)
}
</script>

<template>
  <DashboardLayout
    role="business"
    roleTitle="Плательщик"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <!-- Not found -->
    <div v-if="!calc" class="text-center py-20">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-[#f1f5f9] flex items-center justify-center">
        <svg class="w-10 h-10 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-[#1e293b] mb-2">Расчёт не найден</h2>
      <p class="text-[#64748b] mb-6">Расчёт с указанным номером не существует</p>
      <button @click="goBack" class="btn-action btn-action-primary">Назад к списку</button>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-6">
        <button @click="goBack" class="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-4 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад к списку
        </button>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] font-mono">{{ calc.number }}</h1>
          <span :class="getStatusClass(calc.status)" class="text-sm">{{ calc.status }}</span>
          <span class="text-[#64748b] text-sm">от {{ calc.date }}</span>
        </div>
      </div>

      <!-- Payer Data -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-5 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Данные плательщика
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p class="text-xs text-[#64748b] mb-1">Тип плательщика</p>
            <p class="font-medium text-[#1e293b]">{{ payerTypeLabel }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">Наименование</p>
            <p class="font-medium text-[#1e293b]">{{ calc.company }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">ИНН</p>
            <p class="font-medium text-[#1e293b] font-mono">{{ calc.inn }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">Адрес</p>
            <p class="font-medium text-[#1e293b]">{{ calc.address || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">{{ calc.payerType === 'importer' ? 'Дата ввоза' : 'Расчётный период' }}</p>
            <p class="font-medium text-[#1e293b]">{{ periodLabel }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">Срок оплаты</p>
            <p class="font-medium" :style="{ color: deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? '#DC2626' : '#f59e0b' }">
              {{ dueDateFormatted }}
            </p>
            <p v-if="deadlineStatus" class="text-xs mt-0.5" :style="{ color: deadlineStatus.overdue ? '#DC2626' : '#94a3b8' }">
              <template v-if="deadlineStatus.overdue">Просрочено на {{ deadlineStatus.days }} дн.!</template>
              <template v-else>Осталось {{ deadlineStatus.days }} дн.</template>
            </p>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-lg font-semibold text-[#1e293b]">Товары и упаковка</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-[#f8fafc]">
              <tr class="text-left text-[11px] tracking-[0.05em] uppercase text-[#64748b]">
                <th class="px-5 py-3 font-semibold w-10">#</th>
                <th class="px-5 py-3 font-semibold">Группа товара</th>
                <th class="px-5 py-3 font-semibold">Подгруппа</th>
                <th class="px-5 py-3 font-semibold">Код ТН ВЭД</th>
                <th class="px-5 py-3 font-semibold text-right">Масса (т)</th>
                <th class="px-5 py-3 font-semibold text-right">Сдано на перераб. (т)</th>
                <th class="px-5 py-3 font-semibold text-right">Ставка (сом/т)</th>
                <th class="px-5 py-3 font-semibold text-right">Сумма (сом)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              <tr
                v-for="(item, index) in calc.items"
                :key="item.id"
                :class="index % 2 === 1 ? 'bg-[#FAFBFC]' : ''"
              >
                <td class="px-5 py-3 text-[#94a3b8]">{{ index + 1 }}</td>
                <td class="px-5 py-3 text-[#1e293b] font-medium">{{ getGroupLabel(item.group) }}</td>
                <td class="px-5 py-3 text-[#64748b]">{{ getSubgroupLabel(item.group, item.subgroup) }}</td>
                <td class="px-5 py-3 text-[#64748b] font-mono text-xs">{{ item.tnvedCode }}</td>
                <td class="px-5 py-3 text-right font-medium text-[#1e293b]">{{ item.mass }}</td>
                <td class="px-5 py-3 text-right text-[#10b981]">{{ item.recycledMass || '0' }}</td>
                <td class="px-5 py-3 text-right text-[#64748b]">{{ item.rate.toLocaleString() }}</td>
                <td class="px-5 py-3 text-right font-bold text-[#f59e0b]">{{ item.amount.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-5">Итоги расчёта</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p class="text-sm text-[#64748b] mb-1">Общая масса</p>
            <p class="text-xl font-bold text-[#1e293b]">{{ totalMass }} тонн</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Сдано на переработку</p>
            <p class="text-xl font-bold text-[#10b981]">{{ totalRecycled }} тонн</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Облагаемая масса</p>
            <p class="text-xl font-bold text-[#1e293b]">{{ totalTaxable }} тонн</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Итого к оплате</p>
            <p class="text-2xl font-bold text-[#10b981]">{{ calc.totalAmount.toLocaleString('ru-RU') }} сом</p>
          </div>
        </div>
      </div>

      <!-- Rejection Comment -->
      <div v-if="calc.status === 'Отклонено' && calc.rejectionReason" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-lg">
            ❌
          </div>
          <div>
            <h3 class="font-semibold text-red-800 mb-1">Комментарий МПРЭТН</h3>
            <p class="text-red-700">{{ calc.rejectionReason }}</p>
          </div>
        </div>
      </div>

      <!-- Payment rejection -->
      <div v-if="calc.status === 'Оплата отклонена' && calc.paymentRejectionReason" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-lg">
            ❌
          </div>
          <div>
            <h3 class="font-semibold text-red-800 mb-1">Оплата отклонена</h3>
            <p class="text-red-700">{{ calc.paymentRejectionReason }}</p>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="sticky bottom-0 bg-white border-t border-[#e2e8f0] -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3" style="box-shadow: 0 -4px 12px rgba(0,0,0,0.05)">
        <button @click="goBack" class="btn-action btn-action-ghost text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад к списку
        </button>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Draft actions -->
          <template v-if="calc.status === 'Черновик'">
            <button @click="mockAction('Редактирование расчёта')" class="btn-action btn-action-primary text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Редактировать
            </button>
            <button @click="mockAction('Удаление расчёта')" class="btn-action btn-action-danger text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Удалить
            </button>
            <button @click="mockAction('Отправка на проверку')" class="btn-action btn-action-primary text-sm" style="background: #10b981; border-color: #10b981;">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              Отправить на проверку
            </button>
          </template>

          <!-- На проверке actions -->
          <template v-if="calc.status === 'На проверке'">
            <button @click="mockAction('Скачивание PDF')" class="btn-pdf">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Скачать PDF
            </button>
            <button @click="mockAction('Отзыв расчёта')" class="btn-action btn-action-warning text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
              Отозвать расчёт
            </button>
          </template>

          <!-- Принято actions -->
          <template v-if="calc.status === 'Принято'">
            <button @click="mockAction('Скачивание PDF')" class="btn-pdf">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Скачать PDF
            </button>
            <button @click="mockAction('Переход к оплате')" class="btn-action btn-action-primary text-sm" style="background: #10b981; border-color: #10b981;">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              Оплатить
            </button>
            <button @click="mockAction('Создание декларации')" class="btn-action btn-action-secondary text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Создать декларацию
            </button>
          </template>

          <!-- Отклонено actions -->
          <template v-if="calc.status === 'Отклонено'">
            <button @click="mockAction('Создание копии для исправления')" class="btn-action btn-action-primary text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              Создать копию и исправить
            </button>
          </template>

          <!-- Оплачено / Оплата на проверке -->
          <template v-if="calc.status === 'Оплачено' || calc.status === 'Оплата на проверке'">
            <button @click="mockAction('Скачивание PDF')" class="btn-pdf">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Скачать PDF
            </button>
            <button @click="mockAction('Печать расчёта')" class="btn-print">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              Печать
            </button>
          </template>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.btn-pdf,
.btn-print {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-pdf {
  background: #DC2626;
}
.btn-pdf:hover {
  background: #B91C1C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-print {
  background: #2563EB;
}
.btn-print:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
</style>
