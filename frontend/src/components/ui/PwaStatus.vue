<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isOffline = ref(!navigator.onLine)
const showUpdateBanner = ref(false)
const showOfflineBanner = ref(false)

let offlineTimeout: ReturnType<typeof setTimeout> | null = null

function handleOnline() {
  isOffline.value = false
  showOfflineBanner.value = false
  if (offlineTimeout) {
    clearTimeout(offlineTimeout)
    offlineTimeout = null
  }
}

function handleOffline() {
  isOffline.value = true
  // Show banner after a short delay to avoid flashing on brief disconnects
  offlineTimeout = setTimeout(() => {
    showOfflineBanner.value = true
  }, 1500)
}

function handleSwUpdate() {
  showUpdateBanner.value = true
}

function reloadApp() {
  window.location.reload()
}

function dismissOffline() {
  showOfflineBanner.value = false
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Listen for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', handleSwUpdate)
  }

  // Check initial state
  if (!navigator.onLine) {
    showOfflineBanner.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  if (offlineTimeout) clearTimeout(offlineTimeout)
})
</script>

<template>
  <!-- Offline Banner -->
  <Transition name="slide-down">
    <div
      v-if="showOfflineBanner"
      class="fixed top-0 left-0 right-0 z-[9999] bg-amber-600 text-white px-4 py-3 flex items-center justify-between shadow-lg"
    >
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01M8.464 8.464a5 5 0 010 7.072M15.536 8.464a5 5 0 000 7.072" />
          <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span class="text-sm font-medium">
          {{ t('pwa.offline', 'Нет подключения к интернету. Данные отображаются из кэша.') }}
        </span>
      </div>
      <button
        @click="dismissOffline"
        class="text-white/80 hover:text-white transition-colors ml-4"
        :aria-label="t('pwa.dismiss', 'Закрыть')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>

  <!-- Update Available Banner -->
  <Transition name="slide-down">
    <div
      v-if="showUpdateBanner"
      class="fixed top-0 left-0 right-0 z-[9999] bg-primary text-white px-4 py-3 flex items-center justify-between shadow-lg"
    >
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="text-sm font-medium">
          {{ t('pwa.updateAvailable', 'Доступно обновление приложения.') }}
        </span>
      </div>
      <button
        @click="reloadApp"
        class="bg-white text-primary px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors ml-4"
      >
        {{ t('pwa.reload', 'Обновить') }}
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
