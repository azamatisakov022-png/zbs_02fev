<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const hasError = ref(false)
const errorMsg = ref('')

onErrorCaptured((err: Error) => {
  hasError.value = true
  errorMsg.value = err.message || t('error.unknown')
  console.error('[ErrorBoundary]', err)
  return false // prevent propagation
})

function retry() {
  hasError.value = false
  errorMsg.value = ''
}
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary__icon">
      <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h2 class="error-boundary__title">{{ t('error.componentError') }}</h2>
    <p class="error-boundary__message">{{ errorMsg }}</p>
    <button @click="retry" class="error-boundary__btn">
      {{ t('error.tryAgain') }}
    </button>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px 20px;
  text-align: center;
}

.error-boundary__icon {
  color: #f59e0b;
  margin-bottom: 16px;
}

.error-boundary__title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.error-boundary__message {
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
  margin-bottom: 20px;
}

.error-boundary__btn {
  padding: 10px 24px;
  background: #2D8B4E;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.15s;
}

.error-boundary__btn:hover {
  background: #246e3e;
}
</style>
