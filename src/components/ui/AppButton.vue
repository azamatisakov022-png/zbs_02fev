<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning' | 'back' | 'icon-only' | 'icon-danger' | 'export'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconPosition?: 'left' | 'right'
  iconSize?: string
  label?: string
  color?: string
  bg?: string
  fontSize?: string
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}>()

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const customStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.color) s.color = props.color
  if (props.bg) s.background = props.bg
  if (props.fontSize) s['font-size'] = props.fontSize
  if (props.iconSize) s['--btn-icon-size'] = props.iconSize
  return Object.keys(s).length ? s : undefined
})

const iconRight = computed(() => props.iconPosition === 'right')
</script>

<template>
  <button
    :class="[
      'app-btn',
      `app-btn--${variant || 'primary'}`,
      `app-btn--${size || 'md'}`,
      {
        'app-btn--full': fullWidth,
        'app-btn--disabled': disabled,
        'app-btn--loading': loading,
        'app-btn--icon-right': iconRight,
        'app-btn--custom-icon': iconSize,
      }
    ]"
    :style="customStyle"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="app-btn__spinner" />
    <template v-else>
      <span v-if="icon && !iconRight" class="app-btn__icon" v-html="icon" />
      <slot>{{ label }}</slot>
      <span v-if="icon && iconRight" class="app-btn__icon" v-html="icon" />
    </template>
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
  font-size: 14px;
  border-radius: 8px;
}
.app-btn--sm :deep(svg) { width: 16px; height: 16px; }

.app-btn--md {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 10px;
}
.app-btn--md :deep(svg) { width: 18px; height: 18px; }

.app-btn--lg {
  padding: 14px 28px;
  font-size: 16px;
  border-radius: 12px;
}
.app-btn--lg :deep(svg) { width: 20px; height: 20px; }

.app-btn--custom-icon :deep(svg) {
  width: var(--btn-icon-size) !important;
  height: var(--btn-icon-size) !important;
}

/* Icon position */
.app-btn--icon-right { flex-direction: row; }

/* Variants */
.app-btn--primary {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(14, 136, 141, 0.25);
}
.app-btn--primary:hover { background: var(--color-primary-dark); }

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
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.app-btn--outline:hover { background: #e6f4f4; }

.app-btn--success {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
}
.app-btn--success:hover { background: linear-gradient(135deg, #15803d, #166534); }

.app-btn--warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);
}
.app-btn--warning:hover { background: linear-gradient(135deg, #d97706, #b45309); }

.app-btn--back {
  background: #fff;
  color: #64748b;
  border-color: #e2e8f0;
}
.app-btn--back:hover { background: #f8fafc; color: #475569; }

.app-btn--icon-only {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
  padding: 8px;
  border-radius: 10px;
}
.app-btn--icon-only:hover { background: #e2e8f0; }
.app-btn--icon-only.app-btn--sm { padding: 6px; border-radius: 8px; }
.app-btn--icon-only.app-btn--lg { padding: 12px; border-radius: 12px; }

.app-btn--icon-danger {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
  padding: 8px;
  border-radius: 10px;
}
.app-btn--icon-danger:hover { background: #fee2e2; color: #dc2626; }
.app-btn--icon-danger.app-btn--sm { padding: 6px; border-radius: 8px; }
.app-btn--icon-danger.app-btn--lg { padding: 12px; border-radius: 12px; }

.app-btn--export {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 500;
}
.app-btn--export:hover { background: #dcfce7; }

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
