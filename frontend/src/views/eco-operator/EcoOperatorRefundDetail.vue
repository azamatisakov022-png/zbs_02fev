<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { refundStore, type Refund } from '../../stores/refunds'
import { productGroups, getSubgroupLabel } from '../../data/product-groups'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

// Refund data
const refundId = computed(() => Number(route.params.id))
const refund = computed<Refund | undefined>(() => refundStore.getRefundById(refundId.value))

// Status helpers
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Новая': return 'bg-blue-100 text-blue-800'
    case 'На рассмотрении': return 'bg-yellow-100 text-yellow-800'
    case 'Одобрена': return 'bg-green-100 text-green-800'
    case 'Отклонена': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const canTakeAction = computed(() => {
  return refund.value && (refund.value.status === 'На рассмотрении' || refund.value.status === 'Новая')
})

// Group/subgroup label helpers
const getGroupLabel = (value: string) => productGroups.find(g => g.value === value)?.label || value

// Approve
const successMessage = ref('')
const approveRefund = () => {
  if (refund.value) {
    refundStore.approveRefund(refund.value.id)
    successMessage.value = 'Заявка на возврат успешно одобрена'
    setTimeout(() => { successMessage.value = '' }, 4000)
  }
}

// Reject modal
const showRejectModal = ref(false)
const rejectionReason = ref('')

const openRejectModal = () => {
  rejectionReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  rejectionReason.value = ''
}

const confirmReject = () => {
  if (refund.value && rejectionReason.value.trim()) {
    refundStore.rejectRefund(refund.value.id, rejectionReason.value.trim())
    closeRejectModal()
    successMessage.value = 'Заявка на возврат отклонена'
    setTimeout(() => { successMessage.value = '' }, 4000)
  }
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="Экологический оператор"
    :menuItems="menuItems"
  >
    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="form" />
    </template>

    <template v-if="!isLoading && refund">
      <!-- Success notification -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
      </div>

      <!-- Back button -->
      <button
        @click="router.push('/eco-operator/refunds')"
        class="inline-flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-6 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span class="text-sm font-medium">{{ $t('common.back') }}</span>
      </button>

      <!-- Header -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Заявка {{ refund.number }}</h1>
              <AppBadge :variant="getStatusBadgeVariant(refund.status)">{{ refund.status }}</AppBadge>
            </div>
            <p class="text-[#64748b]">от {{ refund.date }}</p>
          </div>
        </div>
      </div>

      <!-- Payer data -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h3 class="font-semibold text-[#1e293b] mb-4 text-lg">Данные плательщика</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
            <span class="text-[#64748b]">Организация:</span>
            <p class="font-medium text-[#1e293b] mt-1">{{ refund.company }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
            <span class="text-[#64748b]">ИНН:</span>
            <p class="font-medium text-[#1e293b] mt-1">{{ refund.inn }}</p>
          </div>
        </div>
      </div>

      <!-- Linked calculation -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h3 class="font-semibold text-[#1e293b] mb-4 text-lg">Связанный расчёт</h3>
        <div class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-[#64748b]">Номер расчёта</p>
            <p class="font-mono font-medium text-[#2563eb]">{{ refund.calculationNumber }}</p>
          </div>
        </div>
      </div>

      <!-- Items table -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h3 class="font-semibold text-[#1e293b] mb-4 text-lg">Вывезенные товары</h3>
        <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-[#f8fafc]">
              <tr class="text-left text-[#64748b]">
                <th class="px-4 py-3 font-medium" style="min-width: 180px">Группа</th>
                <th class="px-4 py-3 font-medium" style="min-width: 180px">Подгруппа</th>
                <th class="px-4 py-3 font-medium text-right" style="min-width: 120px">Масса ввоза (тн)</th>
                <th class="px-4 py-3 font-medium text-right" style="min-width: 140px">Вывезено из КР (тн)</th>
                <th class="px-4 py-3 font-medium text-right" style="min-width: 110px">Ставка (сом/т)</th>
                <th class="px-4 py-3 font-medium text-right" style="min-width: 130px">Сумма к возврату (сом)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              <tr v-for="(item, idx) in refund.items" :key="idx" class="hover:bg-[#f8fafc]">
                <td class="px-4 py-3 text-[#1e293b]">{{ getGroupLabel(item.group) }}</td>
                <td class="px-4 py-3 text-[#64748b]">{{ getSubgroupLabel(item.group, item.subgroup) }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ item.mass }}</td>
                <td class="px-4 py-3 text-right font-medium text-[#2563eb]">{{ item.exportedMass }}</td>
                <td class="px-4 py-3 text-right">{{ item.rate.toLocaleString('ru-RU') }}</td>
                <td class="px-4 py-3 text-right font-bold text-[#10b981]">{{ item.refundAmount.toLocaleString('ru-RU') }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-[#f8fafc] font-semibold">
              <tr>
                <td colspan="5" class="px-4 py-3">Итого к возврату</td>
                <td class="px-4 py-3 text-right text-[#10b981]">{{ refund.totalRefund.toLocaleString('ru-RU') }} сом</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Attached documents -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h3 class="font-semibold text-[#1e293b] mb-4 text-lg">Прикреплённые документы ({{ refund.documents.length }})</h3>
        <div v-if="refund.documents.length > 0" class="space-y-2">
          <div v-for="(doc, idx) in refund.documents" :key="idx" class="flex items-center gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]">
            <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-[#1e293b]">{{ doc }}</p>
            </div>
            <button class="text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium">{{ $t('common.download') }}</button>
          </div>
        </div>
        <div v-else class="text-sm text-[#64748b]">Документы не прикреплены</div>
      </div>

      <!-- Total refund amount -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-[#1e293b] text-lg">Итого к возврату</h3>
          <p class="text-3xl font-bold text-[#10b981]">{{ refund.totalRefund.toLocaleString('ru-RU') }} сом</p>
        </div>
      </div>

      <!-- Rejection reason block -->
      <div v-if="refund.status === 'Отклонена' && refund.rejectionReason" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-red-800 mb-1">Причина отклонения</p>
            <p class="text-sm text-red-700">{{ refund.rejectionReason }}</p>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div v-if="canTakeAction" class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-wrap justify-end gap-3">
          <AppButton variant="danger" @click="openRejectModal">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Отклонить
          </AppButton>
          <AppButton variant="primary" @click="approveRefund">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Одобрить возврат
          </AppButton>
        </div>
      </div>
    </template>

    <!-- Not found state -->
    <template v-if="!isLoading && !refund">
      <div class="bg-white rounded-2xl p-12 shadow-sm border border-[#e2e8f0] text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-[#1e293b] mb-2">Заявка не найдена</h2>
        <p class="text-[#64748b] mb-6">Заявка с указанным идентификатором не существует</p>
        <button
          @click="router.push('/eco-operator/refunds')"
          class="px-5 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors"
        >
          Вернуться к списку
        </button>
      </div>
    </template>

    <!-- Rejection modal -->
    <Teleport to="body">
      <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center" @click.self="closeRejectModal">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
          <div class="flex items-center justify-between p-6 border-b border-[#e2e8f0]">
            <h2 class="text-lg font-bold text-[#1e293b]">Отклонение заявки на возврат</h2>
            <button @click="closeRejectModal" class="p-2 text-[#64748b] hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <p class="text-sm text-[#64748b] mb-4">Укажите причину отклонения заявки <span class="font-medium text-[#1e293b]">{{ refund?.number }}</span></p>
            <textarea
              v-model="rejectionReason"
              rows="4"
              placeholder="Опишите причину отклонения заявки на возврат..."
              class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#ef4444] text-sm resize-none"
            ></textarea>
          </div>
          <div class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <AppButton variant="secondary" @click="closeRejectModal">
              {{ $t('common.cancel') }}
            </AppButton>
            <AppButton
              variant="danger"
              @click="confirmReject"
              :disabled="!rejectionReason.trim()"
            >
              {{ $t('common.confirm') }}
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
