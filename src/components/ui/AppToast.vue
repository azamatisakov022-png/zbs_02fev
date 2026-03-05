<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { toastStore, type ToastType } from '../../stores/toast'

const { t } = useI18n()

const typeConfig: Record<ToastType, { color: string; bg: string; border: string; iconBg: string; icon: string }> = {
  success: { color: '#059669', bg: '#f0fdf4', border: '#10b981', iconBg: '#dcfce7', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  error: { color: '#dc2626', bg: '#fef2f2', border: '#ef4444', iconBg: '#fee2e2', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  warning: { color: '#d97706', bg: '#fffbeb', border: '#f59e0b', iconBg: '#fef3c7', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  info: { color: '#2563eb', bg: '#eff6ff', border: '#3b82f6', iconBg: '#dbeafe', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
}

const progressMap = ref<Record<number, number>>({})
const timerMap = new Map<number, ReturnType<typeof setInterval>>()

function startProgress(id: number, duration: number) {
  const step = 50
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
  for (const toast of toasts) {
    if (!(toast.id in progressMap.value)) {
      startProgress(toast.id, toast.duration)
    }
  }
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
      class="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-3 pointer-events-none"
      style="max-width: 440px; width: calc(100vw - 2.5rem);"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
      >
        <div
          v-for="toast in toastStore.state.toasts"
          :key="toast.id"
          :role="roleByType[toast.type]"
          class="toast-card pointer-events-auto"
          :style="{
            backgroundColor: typeConfig[toast.type].bg,
            borderColor: typeConfig[toast.type].border,
          }"
          @keydown="handleKeydown($event, toast.id)"
        >
          <div class="toast-card__body">
            <div
              class="toast-card__icon"
              :style="{ backgroundColor: typeConfig[toast.type].iconBg }"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" :stroke="typeConfig[toast.type].color" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" :d="typeConfig[toast.type].icon" />
              </svg>
            </div>

            <div class="toast-card__content">
              <p class="toast-card__title" :style="{ color: typeConfig[toast.type].color }">{{ toast.title }}</p>
              <p v-if="toast.message" class="toast-card__message">{{ toast.message }}</p>
            </div>

            <button
              @click="toastStore.dismiss(toast.id)"
              class="toast-card__close"
              :aria-label="t('common.close')"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="toast-card__progress-track">
            <div
              class="toast-card__progress-bar"
              :style="{
                width: (progressMap[toast.id] ?? 0) + '%',
                backgroundColor: typeConfig[toast.type].border,
              }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-card {
  border-radius: 14px;
  border-width: 1.5px;
  border-style: solid;
  overflow: hidden;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.toast-card__body {
  display: flex;
  align-items: flex-start;
  padding: 16px 14px 14px 16px;
  gap: 14px;
}

.toast-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-card__content {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.toast-card__title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.toast-card__message {
  font-size: 16px;
  color: #475569;
  margin-top: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toast-card__close {
  padding: 4px;
  color: #94a3b8;
  border-radius: 8px;
  flex-shrink: 0;
  transition: color 0.15s, background-color 0.15s;
}

.toast-card__close:hover {
  color: #475569;
  background-color: rgba(0, 0, 0, 0.05);
}

.toast-card__progress-track {
  height: 4px;
  width: 100%;
  background: rgba(0, 0, 0, 0.06);
}

.toast-card__progress-bar {
  height: 100%;
  transition: width 75ms linear;
  border-radius: 0 4px 4px 0;
  opacity: 0.7;
}
</style>
