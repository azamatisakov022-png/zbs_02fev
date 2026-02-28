<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  title?: string
  contentHtml: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="drawer-overlay" @click.self="close">
        <div class="drawer-panel">
          <!-- Header -->
          <div class="drawer-header">
            <div class="drawer-header__icon">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="drawer-header__title">{{ title || t('instruction.title') }}</h2>
            <button @click="close" class="drawer-header__close" :aria-label="t('common.close')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="drawer-body" v-html="contentHtml"></div>

          <!-- Footer -->
          <div class="drawer-footer">
            <button @click="close" class="drawer-footer__btn">{{ t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}

.drawer-panel {
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
}

@media (max-width: 520px) {
  .drawer-panel {
    width: 100vw;
  }
}

/* Header */
.drawer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.drawer-header__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #ecfdf5;
  color: #2D8B4E;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drawer-header__title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.drawer-header__close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.15s;
  flex-shrink: 0;
}

.drawer-header__close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

/* Body */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  overscroll-behavior: contain;
}

/* Footer */
.drawer-footer {
  padding: 14px 20px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.drawer-footer__btn {
  width: 100%;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  color: #64748b;
  border: 1px solid #e2e8f0;
  transition: all 0.15s;
}

.drawer-footer__btn:hover {
  background: #f8fafc;
  color: #1e293b;
}

/* Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  background: rgba(0, 0, 0, 0);
}

.drawer-enter-from .drawer-panel {
  transform: translateX(100%);
}

.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>

<style>
/* Instruction content styles (unscoped so v-html picks them up) */
.inst-content {
  font-size: 14px;
  line-height: 1.65;
  color: #334155;
}

.inst-title {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.inst-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 20px;
}

.inst-section {
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f1f5f9;
}

.inst-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.inst-graph-label {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #2D8B4E;
  background: #ecfdf5;
  margin-bottom: 8px;
}

.inst-section p {
  margin: 6px 0;
}

.inst-formula {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 14px;
  margin: 10px 0;
}

.inst-legal-ref {
  color: #64748b;
  font-style: italic;
}

.inst-legal-ref-small {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
  margin-top: 4px;
}

.inst-note {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
}

.inst-list {
  list-style: disc;
  padding-left: 20px;
  margin: 8px 0;
}

.inst-list li {
  margin-bottom: 6px;
}

.inst-list li:last-child {
  margin-bottom: 0;
}
</style>
