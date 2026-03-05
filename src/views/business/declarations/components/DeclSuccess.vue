<script setup lang="ts">
import { AppBadge } from '@/components/ui'

defineProps<{
  submittedDeclaration: { number: string; date: string }
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

    <h1 class="ds-page-title">{{ $t('businessDecl.successTitle') }}</h1>

    <div class="ds-card">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p class="ds-label mb-1">{{ $t('businessDecl.declarationNumber') }}</p>
          <p class="ds-highlight-value font-mono">{{ submittedDeclaration.number }}</p>
        </div>
        <div>
          <p class="ds-label mb-1">{{ $t('businessDecl.submissionDate') }}</p>
          <p class="ds-large-value">{{ submittedDeclaration.date }}</p>
        </div>
        <div>
          <p class="ds-label mb-1">{{ $t('businessDecl.statusLabel') }}</p>
          <AppBadge variant="warning">{{ $t('status.underReview') }}</AppBadge>
        </div>
      </div>
    </div>

    <p class="ds-body-text mb-8">
      {{ $t('businessDecl.successMessage') }}<br />
      {{ $t('businessDecl.successMessageLine2') }}
    </p>

    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <button @click="$emit('print')" class="ds-btn-outline">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ $t('businessDecl.downloadPdf') }}
      </button>
      <button
        @click="$emit('backToList')"
        class="ds-btn-primary"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        {{ $t('businessDecl.returnToList') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.ds-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}
@media (min-width: 1024px) {
  .ds-page-title { font-size: 34px; }
}
.ds-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 32px;
}
.ds-label {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}
.ds-highlight-value {
  font-size: 22px;
  font-weight: 700;
  color: #2563eb;
}
.ds-large-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}
.ds-body-text {
  font-size: 17px;
  font-weight: 500;
  color: #1e293b;
}
.ds-btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #1e293b;
  transition: background-color 0.15s;
}
.ds-btn-outline:hover {
  background-color: #f8fafc;
}
.ds-btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #2563eb;
  color: white;
  border-radius: 12px;
  font-weight: 500;
  transition: background-color 0.15s;
}
.ds-btn-primary:hover {
  background-color: #1d4ed8;
}
</style>
