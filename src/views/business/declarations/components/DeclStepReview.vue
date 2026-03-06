<script setup lang="ts">
import { AppButton } from '@/components/ui'

defineProps<{
  reportingYear: string
  companyData: { name: string; inn: string }
  yearCalculationsCount: number
  totalMass: number
  totalAmount: number
  totalPaid: number
  totalDebt: number
  attachedDocs: { id: number; name: string; size: string }[]
  signedWithEcp: boolean
  confirmData: boolean
}>()

defineEmits<{
  (e: 'upload', event: Event): void
  (e: 'removeDoc', id: number): void
  (e: 'signEcp'): void
  (e: 'update:confirmData', value: boolean): void
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <h2 class="dsr-section-title mb-6">{{ $t('businessDecl.reviewAndSubmit') }}</h2>

    <div class="space-y-6">
      <div class="dsr-card">
        <h3 class="dsr-subsection-title mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 dsr-icon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ $t('businessDecl.summaryInfo') }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span class="dsr-label">{{ $t('businessDecl.reportingYearLabel') }}</span>
            <p class="dsr-value">{{ reportingYear }}</p>
          </div>
          <div>
            <span class="dsr-label">{{ $t('businessDecl.organizationLabel') }}</span>
            <p class="dsr-value">{{ companyData.name }}</p>
          </div>
          <div>
            <span class="dsr-label">{{ $t('businessDecl.innLabel') }}</span>
            <p class="dsr-value">{{ companyData.inn }}</p>
          </div>
          <div>
            <span class="dsr-label">{{ $t('businessDecl.calcCountLabel') }}</span>
            <p class="dsr-value">{{ yearCalculationsCount }}</p>
          </div>
          <div>
            <span class="dsr-label">{{ $t('businessDecl.totalMassLabel') }}</span>
            <p class="dsr-value">{{ totalMass.toFixed(2) }} {{ $t('businessDecl.tonsSuffix') }}</p>
          </div>
          <div>
            <span class="dsr-label">{{ $t('businessDecl.totalAmountLabel') }}</span>
            <p class="dsr-value">{{ totalAmount.toLocaleString() }} {{ $t('businessDecl.som') }}</p>
          </div>
          <div>
            <span class="dsr-label">{{ $t('businessDecl.paidLabel') }}</span>
            <p class="font-medium text-green-600">{{ totalPaid.toLocaleString() }} {{ $t('businessDecl.som') }}</p>
          </div>
          <div v-if="totalDebt > 0">
            <span class="dsr-label">{{ $t('businessDecl.remainderLabel') }}</span>
            <p class="font-medium text-red-600">{{ totalDebt.toLocaleString() }} {{ $t('businessDecl.som') }}</p>
          </div>
        </div>
      </div>

      <div class="dsr-card">
        <h3 class="dsr-subsection-title mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 dsr-icon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {{ $t('businessDecl.attachedDocs') }}
        </h3>
        <p class="dsr-body-text mb-3">{{ $t('businessDecl.attachedDocsHint') }}</p>

        <div v-if="attachedDocs.length > 0" class="space-y-2 mb-3">
          <div v-for="doc in attachedDocs" :key="doc.id" class="flex items-center justify-between px-3 py-2 bg-white rounded-lg dsr-doc-row">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 dsr-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span class="dsr-doc-name">{{ doc.name }}</span>
              <span class="dsr-doc-size">{{ doc.size }}</span>
            </div>
            <AppButton
              variant="icon-danger"
              size="sm"
              @click="$emit('removeDoc', doc.id)"
              :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M6 18L18 6M6 6l12 12&quot; /></svg>'"
            />
          </div>
        </div>

        <label class="dsr-upload-label">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('businessDecl.addFile') }}
          <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="$emit('upload', $event)" />
        </label>
      </div>

      <div class="rounded-xl p-5 border" :class="signedWithEcp ? 'bg-green-50 border-green-200' : 'dsr-card-base'">
        <h3 class="dsr-subsection-title mb-3 flex items-center gap-2">
          <svg class="w-5 h-5" :class="signedWithEcp ? 'text-green-600' : 'dsr-text-dark'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {{ $t('businessDecl.ecpTitle') }}
        </h3>

        <div v-if="!signedWithEcp">
          <p class="dsr-body-text mb-3">{{ $t('businessDecl.ecpHint') }}</p>
          <AppButton
            variant="primary"
            @click="$emit('signEcp')"
            :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z&quot; /></svg>'"
            :label="$t('businessDecl.signEcp')"
          />
        </div>

        <div v-else class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="dsr-signed-title">{{ $t('businessDecl.docSignedEcp') }}</p>
            <p class="dsr-signed-subtitle">{{ $t('businessDecl.certificateLabel', { name: companyData.name, inn: companyData.inn }) }}</p>
          </div>
        </div>
      </div>

      <label class="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          :checked="confirmData"
          @change="$emit('update:confirmData', ($event.target as HTMLInputElement).checked)"
          class="dsr-checkbox"
        />
        <span class="dsr-body-text">{{ $t('businessDecl.confirmCheckbox') }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.dsr-section-title {
  font-size: 27px;
  font-weight: 600;
  color: #1e293b;
}
.dsr-card {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}
.dsr-card-base {
  background-color: #f8fafc;
  border-color: #e2e8f0;
}
.dsr-icon-blue {
  color: #2563eb;
}
.dsr-text-dark {
  color: #1e293b;
}
.dsr-subsection-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}
.dsr-label {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}
.dsr-value {
  font-weight: 500;
  color: #1e293b;
}
.dsr-body-text {
  font-size: 17px;
  font-weight: 500;
  color: #1e293b;
}
.dsr-doc-row {
  border: 1px solid #e2e8f0;
}
.dsr-doc-name {
  font-size: 16px;
  color: #1e293b;
}
.dsr-doc-size {
  font-size: 14px;
  color: #475569;
}
.dsr-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px dashed #475569;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.dsr-upload-label:hover {
  border-color: #2563eb;
  color: #2563eb;
}
.dsr-signed-title {
  font-size: 17px;
  font-weight: 600;
  color: #166534;
}
.dsr-signed-subtitle {
  font-size: 16px;
  color: #16a34a;
}
.dsr-checkbox {
  margin-top: 4px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border-color: #e2e8f0;
  color: #2563eb;
}
.dsr-checkbox:focus {
  --tw-ring-color: rgba(37, 99, 235, 0.2);
}
</style>
