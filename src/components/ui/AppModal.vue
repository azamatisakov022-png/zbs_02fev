<script setup lang="ts">
defineProps<{
  visible: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  persistent?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const onOverlayClick = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="app-modal__overlay"
      @click.self="!persistent && onOverlayClick()"
    >
      <div
        class="app-modal__container"
        :class="[`app-modal--${size || 'md'}`]"
      >
        <div v-if="title || closable !== false" class="app-modal__header">
          <h2 v-if="title" class="app-modal__title">{{ title }}</h2>
          <slot name="header-extra" />
          <button
            v-if="closable !== false"
            class="app-modal__close"
            @click="emit('close')"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="app-modal__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="app-modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.app-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.app-modal__container {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.app-modal--sm { max-width: 400px; }
.app-modal--md { max-width: 560px; }
.app-modal--lg { max-width: 720px; }
.app-modal--xl { max-width: 960px; }

.app-modal__header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-modal__title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
}

.app-modal__close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.app-modal__close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.app-modal__body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.app-modal__footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
