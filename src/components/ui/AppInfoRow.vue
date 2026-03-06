<script setup lang="ts">
defineProps<{
  label: string
  value?: string
  mono?: boolean
}>()
</script>

<template>
  <div class="app-info-row">
    <span class="app-info-row__label">{{ label }}</span>
    <span :class="['app-info-row__value', { 'app-info-row__value--mono': mono }]">
      <slot>{{ value }}</slot>
    </span>
  </div>
</template>

<style scoped>
.app-info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
  font-size: 15px;
}

.app-info-row__label {
  color: #64748b;
  flex-shrink: 0;
}

.app-info-row__value {
  color: #1e293b;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.app-info-row__value--mono {
  font-family: ui-monospace, SFMono-Regular, 'Cascadia Code', monospace;
}
</style>
