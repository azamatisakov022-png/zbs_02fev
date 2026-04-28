<script setup lang="ts">
defineProps<{ label: string; value?: string | number; mono?: boolean }>()
</script>

<template>
  <div class="kv">
    <div class="kv__label">{{ label }}</div>
    <div class="kv__value" :class="{ mono }">
      <slot>{{ value || '—' }}</slot>
    </div>
  </div>
</template>

<style scoped>
.kv {
  min-width: 0;
}
.kv__label {
  font-size: 10.5px;
  color: var(--lf-ink-4);
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.kv__value {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--lf-ink);
  word-break: break-word;
}
.kv__value.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
}
</style>
