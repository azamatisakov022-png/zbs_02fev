<script setup lang="ts">
import type { KindId } from './registry'

defineProps<{ hue: number; shape: KindId }>()

const bg = 'rgba(255,255,255,.1)'
const strokeS = 'rgba(255,255,255,.28)'

function treatmentDots() {
  const dots: { x: number; y: number; r: number }[] = []
  for (let i = 0; i < 30; i++) {
    dots.push({ x: (i * 97) % 300, y: (i * 53) % 120, r: 3 + (i % 3) * 2 })
  }
  return dots
}
const treatmentDotsList = treatmentDots()
</script>

<template>
  <svg v-if="shape === 'transport'" width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
    <line
      v-for="i in 14"
      :key="i"
      :x1="-40 + (i - 1) * 30"
      y1="120"
      :x2="40 + (i - 1) * 30"
      y2="0"
      :stroke="strokeS"
      stroke-width="1.5"
    />
    <path d="M 20 80 Q 150 20 280 80" :stroke="strokeS" stroke-width="2" fill="none" />
  </svg>

  <svg v-else-if="shape === 'treatment'" width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
    <circle
      v-for="(d, i) in treatmentDotsList"
      :key="i"
      :cx="d.x"
      :cy="d.y"
      :r="d.r"
      :fill="bg"
      :stroke="strokeS"
      stroke-width="0.5"
    />
  </svg>

  <svg v-else-if="shape === 'recycle'" width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
    <path d="M 80 30 L 220 30 L 220 90 L 80 90 Z" fill="none" :stroke="strokeS" stroke-width="1.5" />
    <path d="M 100 30 L 200 90 M 200 30 L 100 90" :stroke="strokeS" stroke-width="1" />
    <circle cx="150" cy="60" r="20" :fill="bg" />
  </svg>

  <svg v-else-if="shape === 'neutralization'" width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="10" :stroke="strokeS" stroke-width="2" />
      </pattern>
    </defs>
    <rect width="300" height="120" fill="url(#hatch)" />
    <polygon points="150,30 190,95 110,95" :fill="bg" :stroke="strokeS" stroke-width="2" />
    <line x1="150" y1="55" x2="150" y2="78" stroke="white" stroke-width="2.5" />
    <circle cx="150" cy="86" r="2.5" fill="white" />
  </svg>

  <svg v-else-if="shape === 'disposal'" width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
    <rect
      v-for="i in 6"
      :key="i"
      :x="20 + (i - 1) * 45"
      :y="30 + ((i - 1) % 2) * 15"
      width="36"
      :height="60 - ((i - 1) % 2) * 15"
      :fill="bg"
      :stroke="strokeS"
      stroke-width="1"
    />
  </svg>
</template>
