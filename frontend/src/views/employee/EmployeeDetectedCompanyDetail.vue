<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import {
  detectedCompanyStore,
  getSourceLabel,
  sourceColors,
  getStatusLabel,
  statusColors,
  type DetectedCompanyStatus,
} from '../../stores/detectedCompanies'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useEmployeeMenu()

const companyId = computed(() => Number(route.params.id))
const company = computed(() => detectedCompanyStore.getById(companyId.value))

// ── Status pipeline ─────────────────────────────────────────
const statusPipeline: DetectedCompanyStatus[] = [
  'new',
  'notified',
  'registration_submitted',
  'under_review',
  'approved',
]

function getPipelineIndex(status: DetectedCompanyStatus): number {
  if (status === 'rejected' || status === 'revision_requested') return -1
  return statusPipeline.indexOf(status)
}

function isStepCompleted(stepIdx: number): boolean {
  if (!company.value) return false
  const currentIdx = getPipelineIndex(company.value.status)
  return currentIdx >= 0 && stepIdx < currentIdx
}

function isStepCurrent(stepIdx: number): boolean {
  if (!company.value) return false
  return getPipelineIndex(company.value.status) === stepIdx
}

// ── Actions ─────────────────────────────────────────────────
const actionLoading = ref(false)
const rejectReason = ref('')
const showRejectForm = ref(false)
const assignEmployeeId = ref<number | null>(null)
const showAssignForm = ref(false)

async function handleNotify() {
  if (!company.value) return
  actionLoading.value = true
  try {
    await detectedCompanyStore.notify(company.value.id)
    await detectedCompanyStore.fetchAll()
  } finally {
    actionLoading.value = false
  }
}

async function handleReject() {
  if (!company.value || !rejectReason.value.trim()) return
  actionLoading.value = true
  try {
    await detectedCompanyStore.reject(company.value.id, rejectReason.value.trim())
    showRejectForm.value = false
    rejectReason.value = ''
    await detectedCompanyStore.fetchAll()
  } finally {
    actionLoading.value = false
  }
}

async function handleAssign() {
  if (!company.value || !assignEmployeeId.value) return
  actionLoading.value = true
  try {
    await detectedCompanyStore.assignEmployee(company.value.id, assignEmployeeId.value)
    showAssignForm.value = false
    assignEmployeeId.value = null
    await detectedCompanyStore.fetchAll()
  } finally {
    actionLoading.value = false
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

function formatMass(mass: number | null): string {
  if (mass == null) return '—'
  return mass.toLocaleString('ru-RU') + ' ' + t('detectedCompanies.kg')
}

function goBack() {
  router.push('/employee/detected-companies')
}

onMounted(() => {
  if (detectedCompanyStore.getAll().length === 0) {
    detectedCompanyStore.fetchAll()
  }
})
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Сотрудник МПРЭТН"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Back button -->
      <button
        @click="goBack"
        class="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {{ $t('detectedCompanies.backToList') }}
      </button>

      <!-- Not found -->
      <div v-if="!company" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p class="text-gray-500">{{ $t('detectedCompanies.notFound') }}</p>
      </div>

      <template v-if="company">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ company.companyName || '—' }}</h1>
              <p class="text-gray-500 mt-1">{{ $t('detectedCompanies.colInn') }}: {{ company.inn }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span :class="['px-3 py-1 rounded-full text-sm font-semibold', sourceColors[company.source]]">
                {{ getSourceLabel(company.source) }}
              </span>
              <span :class="['px-3 py-1 rounded-full text-sm font-semibold', statusColors[company.status]]">
                {{ getStatusLabel(company.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Status pipeline -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-sm font-semibold text-gray-600 uppercase mb-4">{{ $t('detectedCompanies.statusPipeline') }}</h2>
          <div class="flex items-center gap-0 overflow-x-auto">
            <template v-for="(step, idx) in statusPipeline" :key="step">
              <div class="flex items-center gap-2 flex-shrink-0">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  :class="isStepCurrent(idx)
                    ? 'bg-green-600 text-white ring-2 ring-green-300'
                    : isStepCompleted(idx)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-400'"
                >
                  <svg v-if="isStepCompleted(idx)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <span
                  class="text-xs font-medium whitespace-nowrap"
                  :class="isStepCurrent(idx) ? 'text-green-700' : isStepCompleted(idx) ? 'text-green-600' : 'text-gray-400'"
                >
                  {{ getStatusLabel(step) }}
                </span>
              </div>
              <div
                v-if="idx < statusPipeline.length - 1"
                class="w-8 h-0.5 mx-1 flex-shrink-0"
                :class="isStepCompleted(idx) ? 'bg-green-300' : 'bg-gray-200'"
              />
            </template>
          </div>
          <div v-if="company.status === 'rejected' || company.status === 'revision_requested'" class="mt-3">
            <span :class="['px-3 py-1 rounded-full text-sm font-semibold', statusColors[company.status]]">
              {{ getStatusLabel(company.status) }}
            </span>
          </div>
        </div>

        <!-- Company data -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('detectedCompanies.companyData') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldLegalForm') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.legalForm || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldLegalAddress') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.legalAddress || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldDirector') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.director || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldPhone') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.phone || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldEmail') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.email || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldOkpo') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.okpoCode || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldOked') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.okedCodes || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldTnved') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.tnvedCodes || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.colMass') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatMass(company.estimatedMass) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldGnsStatus') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.gnsStatus || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.colEmployee') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ company.assignedEmployeeName || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.fieldNotifiedAt') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDate(company.notifiedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('detectedCompanies.actions') }}</h2>
          <div class="flex flex-wrap gap-3">
            <button
              @click="handleNotify"
              :disabled="actionLoading || company.status !== 'new'"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ $t('detectedCompanies.actionNotify') }}
            </button>

            <button
              @click="showRejectForm = !showRejectForm"
              :disabled="actionLoading"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ $t('detectedCompanies.actionReject') }}
            </button>

            <button
              @click="showAssignForm = !showAssignForm"
              :disabled="actionLoading"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ $t('detectedCompanies.actionAssign') }}
            </button>
          </div>

          <!-- Reject form -->
          <div v-if="showRejectForm" class="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('detectedCompanies.rejectReason') }}</label>
            <textarea
              v-model="rejectReason"
              rows="3"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              :placeholder="$t('detectedCompanies.rejectReasonPlaceholder')"
            />
            <div class="flex gap-2 mt-2">
              <button
                @click="handleReject"
                :disabled="!rejectReason.trim() || actionLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {{ $t('detectedCompanies.confirmReject') }}
              </button>
              <button
                @click="showRejectForm = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {{ $t('detectedCompanies.cancel') }}
              </button>
            </div>
          </div>

          <!-- Assign form -->
          <div v-if="showAssignForm" class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('detectedCompanies.assignEmployeeId') }}</label>
            <input
              v-model.number="assignEmployeeId"
              type="number"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              :placeholder="$t('detectedCompanies.assignPlaceholder')"
            />
            <div class="flex gap-2 mt-2">
              <button
                @click="handleAssign"
                :disabled="!assignEmployeeId || actionLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {{ $t('detectedCompanies.confirmAssign') }}
              </button>
              <button
                @click="showAssignForm = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {{ $t('detectedCompanies.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
