<script setup lang="ts">
import { computed } from 'vue'

interface BarDataItem {
  label: string
  value: number
  color?: string
}

const props = withDefaults(defineProps<{
  data: BarDataItem[]
  height?: number
  title?: string
}>(), {
  height: 280,
})

const defaultColors = ['#0e888d', '#2563eb', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#ef4444', '#8b5cf6']

const padding = { top: 10, right: 80, bottom: 10, left: 160 }
const viewWidth = 600

const barHeight = 32
const barGap = 12
const computedHeight = computed(() => {
  const content = props.data.length * (barHeight + barGap) - barGap + padding.top + padding.bottom
  return Math.max(content, props.height)
})

const maxValue = computed(() => {
  const max = Math.max(...props.data.map(d => d.value))
  return max || 1
})

const chartWidth = computed(() => viewWidth - padding.left - padding.right)

const bars = computed(() => {
  return props.data.map((d, i) => {
    const y = padding.top + i * (barHeight + barGap)
    const width = (d.value / maxValue.value) * chartWidth.value
    const color = d.color || defaultColors[i % defaultColors.length]
    return { ...d, y, width, color }
  })
})

function formatValue(val: number): string {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'М'
  if (val >= 1000) return (val / 1000).toFixed(0) + 'К'
  return val.toString()
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
    <h3 v-if="title" class="text-lg font-semibold text-[#1e293b] mb-4">{{ title }}</h3>
    <svg :viewBox="`0 0 ${viewWidth} ${computedHeight}`" width="100%" preserveAspectRatio="xMidYMid meet">
      <g v-for="(bar, i) in bars" :key="i">
        <!-- Label -->
        <text
          :x="padding.left - 10"
          :y="bar.y + barHeight / 2 + 4"
          text-anchor="end"
          fill="#415861"
          font-size="12"
        >{{ bar.label }}</text>

        <!-- Background bar -->
        <rect
          :x="padding.left"
          :y="bar.y"
          :width="chartWidth"
          :height="barHeight"
          fill="#f1f5f9"
          rx="4"
        />

        <!-- Value bar -->
        <rect
          :x="padding.left"
          :y="bar.y"
          :width="bar.width"
          :height="barHeight"
          :fill="bar.color"
          rx="4"
          class="bar-fill"
        >
          <title>{{ bar.label }}: {{ bar.value.toLocaleString() }}</title>
        </rect>

        <!-- Value label -->
        <text
          :x="padding.left + bar.width + 8"
          :y="bar.y + barHeight / 2 + 4"
          fill="#415861"
          font-size="12"
          font-weight="600"
        >{{ formatValue(bar.value) }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.bar-fill {
  transition: opacity 0.2s;
}
.bar-fill:hover {
  opacity: 0.8;
}
</style>
