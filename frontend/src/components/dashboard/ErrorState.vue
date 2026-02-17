<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  title?: string
  description?: string
}>()

const emit = defineEmits<{
  retry: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-[60px] px-5">
    <div class="w-20 h-20 rounded-full bg-[#fef2f2] flex items-center justify-center mb-5">
      <svg class="w-10 h-10 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-[#64748b] mb-2 text-center">
      {{ title || t('error.loadingFailed') }}
    </h3>
    <p v-if="description" class="text-sm text-[#94a3b8] text-center max-w-sm mb-5">
      {{ description }}
    </p>
    <button
      @click="emit('retry')"
      class="px-5 py-2.5 bg-[#ef4444] text-white rounded-lg font-medium hover:bg-[#dc2626] transition-colors text-sm"
    >
      {{ t('error.retry') }}
    </button>
  </div>
</template>
