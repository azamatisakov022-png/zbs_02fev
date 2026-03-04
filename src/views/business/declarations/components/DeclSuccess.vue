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

    <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">{{ $t('businessDecl.successTitle') }}</h1>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-[17px] font-semibold text-[#1e293b] mb-1">{{ $t('businessDecl.declarationNumber') }}</p>
          <p class="text-lg font-bold text-[#2563eb] font-mono">{{ submittedDeclaration.number }}</p>
        </div>
        <div>
          <p class="text-[17px] font-semibold text-[#1e293b] mb-1">{{ $t('businessDecl.submissionDate') }}</p>
          <p class="text-lg font-bold text-[#1e293b]">{{ submittedDeclaration.date }}</p>
        </div>
        <div>
          <p class="text-[17px] font-semibold text-[#1e293b] mb-1">{{ $t('businessDecl.statusLabel') }}</p>
          <AppBadge variant="warning">{{ $t('status.underReview') }}</AppBadge>
        </div>
      </div>
    </div>

    <p class="text-[17px] font-medium text-[#1e293b] mb-8">
      {{ $t('businessDecl.successMessage') }}<br />
      {{ $t('businessDecl.successMessageLine2') }}
    </p>

    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <button @click="$emit('print')" class="flex items-center justify-center gap-2 px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#1e293b] hover:bg-[#f8fafc] transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ $t('businessDecl.downloadPdf') }}
      </button>
      <button
        @click="$emit('backToList')"
        class="flex items-center justify-center gap-2 px-6 py-3 bg-[#2563eb] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        {{ $t('businessDecl.returnToList') }}
      </button>
    </div>
  </div>
</template>
