<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  duration?: number
  decimals?: number
}>(), {
  duration: 700,
  decimals: 0,
})

const display = ref(props.value)

function animate(from: number, to: number) {
  if (from === to) return
  const start = performance.now()
  function tick(now: number) {
    const progress = Math.min((now - start) / props.duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    display.value = from + (to - from) * eased
    if (progress < 1) requestAnimationFrame(tick)
    else display.value = to
  }
  requestAnimationFrame(tick)
}

watch(() => props.value, (newVal, oldVal) => {
  animate(oldVal ?? 0, newVal)
})

onMounted(() => {
  if (props.value !== 0) animate(0, props.value)
})

function format(n: number): string {
  return Number.isFinite(n)
    ? n.toLocaleString('ru-RU', {
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: props.decimals,
      })
    : '—'
}
</script>

<template>
  <span class="tnum" style="font-variant-numeric: tabular-nums">{{ format(display) }}</span>
</template>
