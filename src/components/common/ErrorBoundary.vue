<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../ui/AppButton.vue'

const { t } = useI18n()

const error = ref<Error | null>(null)

onErrorCaptured((err: Error) => {
  error.value = err
  console.error('[ErrorBoundary]', err)
  return false
})

const retry = () => {
  error.value = null
}
</script>

<template>
  <slot v-if="!error" />
  <div v-else class="flex flex-col items-center justify-center min-h-[400px] px-5">
    <div class="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5 text-red-400">
      <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-[#64748b] mb-2">{{ t('error.title') }}</h3>
    <p class="text-sm text-[#64748b] text-center max-w-sm mb-5">{{ t('error.description') }}</p>
    <AppButton
      variant="primary"
      :label="t('error.retry')"
      @click="retry"
    />
  </div>
</template>
