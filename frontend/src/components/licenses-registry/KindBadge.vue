<script setup lang="ts">
import { computed } from 'vue'
import { KINDS, type KindId } from './registry'

const props = withDefaults(defineProps<{ kind: KindId; size?: 'sm' | 'md' }>(), { size: 'md' })

const meta = computed(() => KINDS[props.kind])
const padding = computed(() => (props.size === 'sm' ? '3px 8px' : '5px 10px'))
const fontSize = computed(() => (props.size === 'sm' ? '11px' : '12px'))
const bg = computed(() => `oklch(96% 0.04 ${meta.value.hue})`)
const fg = computed(() => `oklch(34% 0.08 ${meta.value.hue})`)
const border = computed(() => `oklch(90% 0.06 ${meta.value.hue})`)
const iconBg = computed(() => `oklch(62% 0.14 ${meta.value.hue})`)
</script>

<template>
  <span
    class="kind-badge"
    :style="{
      padding,
      fontSize,
      background: bg,
      color: fg,
      borderColor: border,
    }"
  >
    <span class="kind-badge__short" :style="{ background: iconBg }">{{ meta.short }}</span>
    {{ meta.label }}
  </span>
</template>

<style scoped>
.kind-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
}
.kind-badge__short {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  color: #fff;
  font-size: 10px;
  display: grid;
  place-items: center;
  font-weight: 700;
}
</style>
