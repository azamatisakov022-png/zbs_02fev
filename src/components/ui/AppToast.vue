<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { toastStore, type ToastType } from '../../stores/toast'

const { t } = useI18n()

const typeConfig: Record<ToastType, { color: string; bg: string; border: string; icon: string }> = {
  success: { color: '#059669', bg: '#ecfdf5', border: '#10b981', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  error: { color: '#dc2626', bg: '#fef2f2', border: '#ef4444', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  warning: { color: '#d97706', bg: '#fffbeb', border: '#f59e0b', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  info: { color: '#2563eb', bg: '#eff6ff', border: '#3b82f6', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
}

// Track progress per toast
const progressMap = ref<Record<number, number>>({})
const timerMap = new Map<number, ReturnType<typeof setInterval>>()

function startProgress(id: number, duration: number) {
  const step = 50 // ms per tick
  const decrement = 100 / (duration / step)
  progressMap.value[id] = 100
  const timer = setInterval(() => {
    progressMap.value[id] -= decrement
    if (progressMap.value[id] <= 0) {
      progressMap.value[id] = 0
      clearInterval(timer)
      timerMap.delete(id)
    }
  }, step)
  timerMap.set(id, timer)
}

function cleanupTimer(id: number) {
  const timer = timerMap.get(id)
  if (timer) {
    clearInterval(timer)
    timerMap.delete(id)
  }
  delete progressMap.value[id]
}

watch(() => toastStore.state.toasts, (toasts, oldToasts) => {
  // Start progress for new toasts
  for (const toast of toasts) {
    if (!(toast.id in progressMap.value)) {
      startProgress(toast.id, toast.duration)
    }
  }
  // Cleanup removed toasts
  if (oldToasts) {
    const currentIds = new Set(toasts.map(t => t.id))
    for (const old of oldToasts) {
      if (!currentIds.has(old.id)) {
        cleanupTimer(old.id)
      }
    }
  }
}, { deep: true, immediate: true })

onUnmounted(() => {
  for (const [, timer] of timerMap) clearInterval(timer)
  timerMap.clear()
})

function handleKeydown(e: KeyboardEvent, id: number) {
  if (e.key === 'Escape') {
    toastStore.dismiss(id)
  }
}

const roleByType: Record<ToastType, string> = {
  success: 'status',
  info: 'status',
  warning: 'alert',
  error: 'alert',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      style="max-width: 400px; width: calc(100vw - 2rem);"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-8"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-8"
      >
        <div
          v-for="toast in toastStore.state.toasts"
          :key="toast.id"
          :role="roleByType[toast.type]"
          class="pointer-events-auto bg-white rounded-lg shadow-lg border border-[#e2e8f0] overflow-hidden flex flex-col"
          :style="{ borderLeftWidth: '4px', borderLeftColor: typeConfig[toast.type].border }"
          @keydown="handleKeydown($event, toast.id)"
        >
          <div class="flex">
            <!-- Icon -->
            <div class="flex items-start pt-3.5 pl-3.5">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                :style="{ backgroundColor: typeConfig[toast.type].bg }"
              >
                <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" :stroke="typeConfig[toast.type].color" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="typeConfig[toast.type].icon" />
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 py-3 px-3 min-w-0">
              <p class="text-sm font-semibold text-[#1e293b] leading-tight">{{ toast.title }}</p>
              <p v-if="toast.message" class="text-xs text-[#64748b] mt-1 line-clamp-2">{{ toast.message }}</p>
            </div>

            <!-- Close -->
            <button
              @click="toastStore.dismiss(toast.id)"
              class="self-start p-2 text-[#94a3b8] hover:text-[#64748b] transition-colors flex-shrink-0"
              :aria-label="t('common.close')"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Progress bar -->
          <div class="h-[3px] w-full bg-[#f1f5f9]">
            <div
              class="h-full transition-[width] duration-75 ease-linear rounded-r-full"
              :style="{
                width: (progressMap[toast.id] ?? 0) + '%',
                backgroundColor: typeConfig[toast.type].border,
                opacity: 0.6,
              }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
