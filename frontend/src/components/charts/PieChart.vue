<script setup lang="ts">
import { computed } from 'vue'

interface PieDataItem {
  label: string
  value: number
  color: string
}

const props = withDefaults(defineProps<{
  data: PieDataItem[]
  size?: number
  title?: string
}>(), {
  size: 200,
})

const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0))

const slices = computed(() => {
  let cumAngle = 0
  return props.data.map(d => {
    const pct = total.value > 0 ? d.value / total.value : 0
    const angle = pct * 360
    const startAngle = cumAngle
    cumAngle += angle
    return {
      ...d,
      pct,
      startAngle,
      angle,
    }
  })
})

const cx = computed(() => props.size / 2)
const cy = computed(() => props.size / 2)
const r = computed(() => props.size / 2 - 4)

function polarToCartesian(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return {
    x: cx.value + r.value * Math.cos(rad),
    y: cy.value + r.value * Math.sin(rad),
  }
}

function slicePath(start: number, angle: number): string {
  if (angle >= 359.99) {
    // Full circle: draw two arcs
    const mid = polarToCartesian(start + 180)
    const end = polarToCartesian(start + 359.99)
    const s = polarToCartesian(start)
    return `M ${s.x} ${s.y} A ${r.value} ${r.value} 0 0 1 ${mid.x} ${mid.y} A ${r.value} ${r.value} 0 0 1 ${end.x} ${end.y} L ${cx.value} ${cy.value} Z`
  }
  const s = polarToCartesian(start)
  const e = polarToCartesian(start + angle)
  const largeArc = angle > 180 ? 1 : 0
  return `M ${cx.value} ${cy.value} L ${s.x} ${s.y} A ${r.value} ${r.value} 0 ${largeArc} 1 ${e.x} ${e.y} Z`
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
    <h3 v-if="title" class="text-lg font-semibold text-[#1e293b] mb-4">{{ title }}</h3>
    <div class="flex flex-col sm:flex-row items-center gap-6">
      <!-- Pie SVG -->
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="flex-shrink-0">
        <path
          v-for="(slice, i) in slices"
          :key="i"
          :d="slicePath(slice.startAngle, slice.angle)"
          :fill="slice.color"
          stroke="white"
          stroke-width="2"
          class="pie-slice"
        >
          <title>{{ slice.label }}: {{ slice.value.toLocaleString('ru-RU') }} ({{ (slice.pct * 100).toFixed(1) }}%)</title>
        </path>
      </svg>

      <!-- Legend -->
      <div class="flex flex-col gap-2.5 min-w-0">
        <div
          v-for="(slice, i) in slices"
          :key="i"
          class="flex items-center gap-2.5"
        >
          <span
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: slice.color }"
          ></span>
          <span class="text-sm text-[#1e293b] truncate">{{ slice.label }}</span>
          <span class="text-sm text-[#94a3b8] ml-auto pl-2 whitespace-nowrap">{{ (slice.pct * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pie-slice {
  transition: opacity 0.2s;
}
.pie-slice:hover {
  opacity: 0.8;
}
</style>
