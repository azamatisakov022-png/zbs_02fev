<script setup lang="ts">
import { computed } from 'vue'

interface DataPoint {
  label: string
  value: number
}

const props = withDefaults(defineProps<{
  data: DataPoint[]
  color?: string
  height?: number
  title?: string
}>(), {
  color: '#0e888d',
  height: 280,
})

const padding = { top: 20, right: 20, bottom: 40, left: 60 }
const viewWidth = 600
const viewHeight = computed(() => props.height)

const chartWidth = computed(() => viewWidth - padding.left - padding.right)
const chartHeight = computed(() => viewHeight.value - padding.top - padding.bottom)

const maxValue = computed(() => {
  const max = Math.max(...props.data.map(d => d.value))
  return Math.ceil(max / 1000) * 1000 || 1000
})

const yTicks = computed(() => {
  const ticks: number[] = []
  const step = maxValue.value / 4
  for (let i = 0; i <= 4; i++) {
    ticks.push(Math.round(step * i))
  }
  return ticks
})

const points = computed(() => {
  if (props.data.length === 0) return []
  return props.data.map((d, i) => {
    const x = padding.left + (i / Math.max(props.data.length - 1, 1)) * chartWidth.value
    const y = padding.top + chartHeight.value - (d.value / maxValue.value) * chartHeight.value
    return { x, y, ...d }
  })
})

const polylinePath = computed(() => {
  return points.value.map(p => `${p.x},${p.y}`).join(' ')
})

const areaPath = computed(() => {
  if (points.value.length === 0) return ''
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  const bottom = padding.top + chartHeight.value
  return `M ${first.x},${bottom} ` +
    points.value.map(p => `L ${p.x},${p.y}`).join(' ') +
    ` L ${last.x},${bottom} Z`
})

const gradientId = computed(() => `line-gradient-${Math.random().toString(36).slice(2, 9)}`)

function formatValue(val: number): string {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'М'
  if (val >= 1000) return (val / 1000).toFixed(0) + 'К'
  return val.toString()
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
    <h3 v-if="title" class="text-lg font-semibold text-[#1e293b] mb-4">{{ title }}</h3>
    <svg :viewBox="`0 0 ${viewWidth} ${viewHeight}`" width="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      <line
        v-for="tick in yTicks"
        :key="tick"
        :x1="padding.left"
        :y1="padding.top + chartHeight - (tick / maxValue) * chartHeight"
        :x2="padding.left + chartWidth"
        :y2="padding.top + chartHeight - (tick / maxValue) * chartHeight"
        stroke="#e2e8f0"
        stroke-width="1"
      />

      <!-- Y-axis labels -->
      <text
        v-for="tick in yTicks"
        :key="'y-' + tick"
        :x="padding.left - 10"
        :y="padding.top + chartHeight - (tick / maxValue) * chartHeight + 4"
        text-anchor="end"
        fill="#94a3b8"
        font-size="11"
      >{{ formatValue(tick) }}</text>

      <!-- Area fill -->
      <path
        v-if="points.length > 0"
        :d="areaPath"
        :fill="`url(#${gradientId})`"
      />

      <!-- Line -->
      <polyline
        v-if="points.length > 0"
        :points="polylinePath"
        fill="none"
        :stroke="color"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Dots -->
      <circle
        v-for="(p, i) in points"
        :key="i"
        :cx="p.x"
        :cy="p.y"
        r="4"
        :fill="color"
        stroke="white"
        stroke-width="2"
        class="chart-dot"
      />

      <!-- X-axis labels -->
      <text
        v-for="(p, i) in points"
        :key="'x-' + i"
        :x="p.x"
        :y="padding.top + chartHeight + 25"
        text-anchor="middle"
        fill="#94a3b8"
        font-size="11"
      >{{ p.label }}</text>

      <!-- Tooltip values on hover (CSS-only via title) -->
      <g v-for="(p, i) in points" :key="'tip-' + i">
        <title>{{ p.label }}: {{ p.value.toLocaleString() }}</title>
        <rect
          :x="p.x - 20"
          :y="padding.top"
          width="40"
          :height="chartHeight + 10"
          fill="transparent"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.chart-dot {
  transition: r 0.2s;
}
.chart-dot:hover {
  r: 6;
}
</style>
