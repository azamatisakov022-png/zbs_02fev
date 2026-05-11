<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  debt: number
  days: number
}>()

// Коэффициент пени: 0,09% / день (ст. 37 Закона КР о налогах).
const RATE = 0.0009

// Строим точки кривой накопления пени по дням.
// Упрощение: линейная функция от debt × rate × days.
const points = computed(() => {
  const maxDays = Math.max(props.days, 30)
  const steps = 40
  const arr: { x: number; y: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const d = (i / steps) * maxDays
    const p = props.debt * RATE * d
    arr.push({ x: d, y: p })
  }
  return arr
})

const maxY = computed(() => {
  const last = points.value[points.value.length - 1]
  return last ? last.y : 1
})

// SVG path - 300x80 viewport
const pathD = computed(() => {
  if (!points.value.length || maxY.value <= 0) return 'M 0 80 L 300 80'
  return points.value.map((p, i) => {
    const x = (p.x / (props.days > 0 ? props.days * 1.05 : 1)) * 300
    const y = 80 - Math.min(p.y / maxY.value, 1) * 75
    return (i === 0 ? 'M' : 'L') + ' ' + x.toFixed(1) + ' ' + y.toFixed(1)
  }).join(' ')
})

// Точка «сегодня» на кривой (где days остановились)
const currentPoint = computed(() => {
  if (!props.days || props.days <= 0) return null
  const currentPenalty = props.debt * RATE * props.days
  const x = (props.days / (props.days * 1.05)) * 300
  const y = 80 - Math.min(currentPenalty / maxY.value, 1) * 75
  return { x, y }
})
</script>

<template>
  <div class="pt-4 border-t border-white/10">
    <div class="flex items-center justify-between mb-2">
      <span class="text-[10px] uppercase tracking-wider text-white/50 font-semibold">
        Динамика начисления
      </span>
      <span class="text-[10px] text-white/40 font-mono tabular-nums">
        0 → {{ days }} {{ $t('calculatorPage.penaltyDayShort') }}
      </span>
    </div>
    <svg viewBox="0 0 300 80" class="w-full h-20" preserveAspectRatio="none">
      <!-- Линия сетки -->
      <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2 3" />
      <!-- Кривая пени (градиент заливка под ней) -->
      <defs>
        <linearGradient id="accrual-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fca5a5" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#fca5a5" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="pathD + ' L 300 80 L 0 80 Z'" fill="url(#accrual-grad)" />
      <path :d="pathD" fill="none" stroke="#fca5a5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Точка «сегодня» -->
      <g v-if="currentPoint">
        <circle :cx="currentPoint.x" :cy="currentPoint.y" r="5" fill="#fca5a5" fill-opacity="0.3" />
        <circle :cx="currentPoint.x" :cy="currentPoint.y" r="3" fill="#fff" />
      </g>
    </svg>
  </div>
</template>
