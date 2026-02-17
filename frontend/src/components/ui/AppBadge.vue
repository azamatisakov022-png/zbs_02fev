<script setup lang="ts">
defineProps<{
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  label?: string
}>()
</script>

<template>
  <span :class="['app-badge', `app-badge--${variant || 'neutral'}`]">
    <slot>{{ label }}</slot>
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  line-height: 1.4;
}

.app-badge--success { background: #DCFCE7; color: #16A34A; }
.app-badge--warning { background: #FEF9C3; color: #CA8A04; }
.app-badge--danger  { background: #FEE2E2; color: #DC2626; }
.app-badge--info    { background: #DBEAFE; color: #2563EB; }
.app-badge--neutral { background: #F1F5F9; color: #64748B; }
</style>
