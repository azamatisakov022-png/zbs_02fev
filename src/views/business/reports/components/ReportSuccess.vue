<script setup lang="ts">
import { AppBadge } from '@/components/ui'

defineProps<{
  reportNumber: string
  reportDate: string
}>()

defineEmits<{
  (e: 'print'): void
  (e: 'backToList'): void
}>()
</script>

<template>
  <div class="max-w-2xl mx-auto text-center py-12">
    <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
      <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <h1 class="rs-page-title">{{ $t('businessReports.successTitle') }}</h1>

    <div class="rs-card">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p class="rs-label mb-1">{{ $t('businessReports.reportNumber') }}</p>
          <p class="rs-value rs-value--green font-mono">{{ reportNumber }}</p>
        </div>
        <div>
          <p class="rs-label mb-1">{{ $t('businessReports.submissionDate') }}</p>
          <p class="rs-value rs-value--dark">{{ reportDate }}</p>
        </div>
        <div>
          <p class="rs-label mb-1">{{ $t('businessReports.statusLabel') }}</p>
          <AppBadge variant="warning">{{ $t('status.underReview') }}</AppBadge>
        </div>
      </div>
    </div>

    <p class="rs-message mb-8">
      {{ $t('businessReports.successMessage') }}<br/>
      {{ $t('businessReports.successNotice') }}
    </p>

    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <button @click="$emit('print')" class="rs-btn-outline flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ $t('businessReports.downloadPdf') }}
      </button>
      <button
        @click="$emit('backToList')"
        class="rs-btn-primary flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        {{ $t('businessReports.returnToList') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.rs-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}
@media (min-width: 1024px) {
  .rs-page-title { font-size: 34px; }
}
.rs-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 32px;
}
.rs-label {
  font-size: 16px;
  color: #64748b;
}
.rs-value {
  font-size: 20px;
  font-weight: 700;
}
.rs-value--green {
  color: #10b981;
}
.rs-value--dark {
  color: #1e293b;
}
.rs-message {
  color: #64748b;
}
.rs-btn-outline {
  border: 1px solid #e2e8f0;
  color: #1e293b;
}
.rs-btn-outline:hover {
  background: #f8fafc;
}
.rs-btn-primary {
  background: #10b981;
}
.rs-btn-primary:hover {
  background: #059669;
}
</style>
