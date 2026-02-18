<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

interface Props {
  visible: boolean
  title?: string
  message?: string
  icon?: 'warning' | 'danger' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  confirmColor?: 'green' | 'red' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Подтвердите действие',
  message: '',
  icon: 'warning',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  confirmColor: 'green',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    emit('cancel')
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

watch(() => props.visible, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div v-if="visible" class="cd-overlay" @click.self="emit('cancel')">
        <Transition name="cd-scale" appear>
          <div class="cd-modal">
            <!-- Icon -->
            <div
              :class="[
                'cd-icon',
                icon === 'warning' ? 'cd-icon--warning' : '',
                icon === 'danger' ? 'cd-icon--danger' : '',
                icon === 'info' ? 'cd-icon--info' : '',
                icon === 'success' ? 'cd-icon--success' : '',
              ]"
            >
              <!-- Warning: triangle ! -->
              <svg v-if="icon === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <!-- Danger: trash -->
              <svg v-else-if="icon === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
              <!-- Info: i circle -->
              <svg v-else-if="icon === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <!-- Success: check circle -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>

            <!-- Title -->
            <h3 class="cd-title">{{ title }}</h3>

            <!-- Message -->
            <p v-if="message" class="cd-message">{{ message }}</p>

            <!-- Buttons -->
            <div class="cd-buttons">
              <button class="cd-btn cd-btn--cancel" @click="emit('cancel')">{{ cancelText }}</button>
              <button
                :class="[
                  'cd-btn cd-btn--confirm',
                  confirmColor === 'green' ? 'cd-btn--green' : '',
                  confirmColor === 'red' ? 'cd-btn--red' : '',
                  confirmColor === 'orange' ? 'cd-btn--orange' : '',
                ]"
                @click="emit('confirm')"
              >{{ confirmText }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.cd-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 28px;
  max-width: 420px;
  width: 100%;
  text-align: center;
}

/* Icon */
.cd-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.cd-icon svg {
  width: 24px;
  height: 24px;
}
.cd-icon--warning {
  background: #fef3c7;
  color: #f59e0b;
}
.cd-icon--danger {
  background: #fef2f2;
  color: #ef4444;
}
.cd-icon--info {
  background: #eff6ff;
  color: #3b82f6;
}
.cd-icon--success {
  background: #ecfdf5;
  color: #10b981;
}

/* Title */
.cd-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

/* Message */
.cd-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px;
  line-height: 1.5;
}

/* Buttons */
.cd-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.cd-btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  outline: none;
}
.cd-btn--cancel {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
}
.cd-btn--cancel:hover {
  background: #f3f4f6;
}
.cd-btn--confirm {
  color: white;
}
.cd-btn--green {
  background: #10b981;
}
.cd-btn--green:hover {
  background: #059669;
}
.cd-btn--red {
  background: #ef4444;
}
.cd-btn--red:hover {
  background: #dc2626;
}
.cd-btn--orange {
  background: #f59e0b;
}
.cd-btn--orange:hover {
  background: #d97706;
}

/* Animations */
.cd-fade-enter-active,
.cd-fade-leave-active {
  transition: opacity 0.2s ease;
}
.cd-fade-enter-from,
.cd-fade-leave-to {
  opacity: 0;
}

.cd-scale-enter-active {
  transition: all 0.2s ease;
}
.cd-scale-leave-active {
  transition: all 0.15s ease;
}
.cd-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.cd-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
