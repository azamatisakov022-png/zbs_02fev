<script setup lang="ts">
import { computed } from 'vue'

interface Item {
  id: number | string
  amount: number
  label?: string
}

const props = defineProps<{
  items: Item[]
  total: number
}>()

// Палитра сегментов — из брендовой гаммы (бирюзовый → зелёный).
const COLORS = ['#0e888d', '#10b981', '#34d399', '#0c6267', '#047857', '#2dd4bf', '#059669', '#42acb3']

// Вычисляем сегменты с накопительным offset для SVG stroke-dashoffset.
const segments = computed(() => {
  if (!props.total || props.total <= 0) return []
  const circumference = 2 * Math.PI * 45 // r=45
  let offset = 0
  return props.items
    .filter(it => Number.isFinite(it.amount) && it.amount > 0)
    .map((it, i) => {
      const pct = it.amount / props.total
      const dash = pct * circumference
      const seg = {
        id: it.id,
        label: it.label || `#${i + 1}`,
        color: COLORS[i % COLORS.length],
        dash,
        gap: circumference - dash,
        offset,
        percent: Math.round(pct * 100),
      }
      offset -= dash
      return seg
    })
})

const circumference = 2 * Math.PI * 45
</script>

<template>
  <div v-if="segments.length" class="flex items-center gap-4">
    <!-- SVG donut -->
    <svg viewBox="0 0 100 100" class="w-24 h-24 flex-shrink-0 -rotate-90">
      <!-- Background track -->
      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10" />
      <!-- Segments -->
      <circle
        v-for="s in segments"
        :key="s.id"
        cx="50" cy="50" r="45"
        fill="none"
        :stroke="s.color"
        stroke-width="10"
        :stroke-dasharray="`${s.dash} ${s.gap}`"
        :stroke-dashoffset="s.offset"
        stroke-linecap="butt"
        class="transition-all duration-500"
      />
    </svg>

    <!-- Legend -->
    <ul class="flex-1 space-y-1.5 text-[11px]">
      <li
        v-for="s in segments.slice(0, 4)"
        :key="s.id"
        class="flex items-center gap-2"
      >
        <span class="w-2 h-2 rounded-sm flex-shrink-0" :style="{ background: s.color }"></span>
        <span class="truncate flex-1 text-white/80">{{ s.label }}</span>
        <span class="font-semibold text-white tabular-nums">{{ s.percent }}%</span>
      </li>
      <li v-if="segments.length > 4" class="text-white/50 pl-4">
        +{{ segments.length - 4 }} ещё
      </li>
    </ul>
  </div>
  <div v-else class="text-xs text-white/40 italic text-center py-4">
    Введите позиции — появится разбивка
  </div>
</template>
