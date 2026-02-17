<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  label?: string
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}>()

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    :class="[
      'app-btn',
      `app-btn--${variant || 'primary'}`,
      `app-btn--${size || 'md'}`,
      { 'app-btn--full': fullWidth, 'app-btn--disabled': disabled, 'app-btn--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="app-btn__spinner" />
    <span v-else-if="icon" class="app-btn__icon" v-html="icon" />
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid transparent;
  white-space: nowrap;
  line-height: 1.2;
}

/* Sizes */
.app-btn--sm {
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 8px;
}
.app-btn--sm :deep(svg) { width: 14px; height: 14px; }

.app-btn--md {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 10px;
}
.app-btn--md :deep(svg) { width: 18px; height: 18px; }

.app-btn--lg {
  padding: 14px 28px;
  font-size: 16px;
  border-radius: 12px;
}
.app-btn--lg :deep(svg) { width: 20px; height: 20px; }

/* Variants */
.app-btn--primary {
  background: #22C55E;
  color: #fff;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);
}
.app-btn--primary:hover { background: #16A34A; }

.app-btn--secondary {
  background: #fff;
  color: #475569;
  border-color: #E2E8F0;
}
.app-btn--secondary:hover { background: #F8FAFC; }

.app-btn--danger {
  background: #EF4444;
  color: #fff;
}
.app-btn--danger:hover { background: #DC2626; }

.app-btn--ghost {
  background: transparent;
  color: #3B82F6;
}
.app-btn--ghost:hover { background: #EFF6FF; }

.app-btn--outline {
  background: #fff;
  color: #22C55E;
  border-color: #22C55E;
}
.app-btn--outline:hover { background: #F0FDF4; }

/* States */
.app-btn--full { width: 100%; }

.app-btn--disabled,
.app-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Spinner */
.app-btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: app-btn-spin 0.6s linear infinite;
}

.app-btn__icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

@keyframes app-btn-spin {
  to { transform: rotate(360deg); }
}
</style>
