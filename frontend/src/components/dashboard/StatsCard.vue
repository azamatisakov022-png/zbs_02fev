<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  title: string
  value: string | number
  icon?: string
  color?: 'teal' | 'orange' | 'purple' | 'green' | 'blue' | 'red'
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'teal'
})

const colorClasses = {
  teal: 'bg-[#e8f5f5] text-[#0e888d]',
  orange: 'bg-[#fff7ed] text-[#ea580c]',
  purple: 'bg-[#f3e8ff] text-[#7c3aed]',
  green: 'bg-[#ecfdf5] text-[#059669]',
  blue: 'bg-[#eff6ff] text-[#2563eb]',
  red: 'bg-[#fef2f2] text-[#dc2626]'
}

const accentColors: Record<string, string> = {
  teal: '#0e888d',
  orange: '#ea580c',
  purple: '#7c3aed',
  green: '#059669',
  blue: '#2563eb',
  red: '#dc2626',
}

// CountUp animation
const displayValue = ref('')
const hasAnimated = ref(false)

function animateValue() {
  const raw = String(props.value)
  // Extract leading number (e.g. "387 т" → 387, "161 050 сом" → 161050)
  const cleaned = raw.replace(/\s/g, '')
  const match = cleaned.match(/^(\d+)/)
  if (!match) {
    displayValue.value = raw
    return
  }

  const target = parseInt(match[1])
  const suffix = raw.slice(raw.indexOf(match[1]) + match[1].length)
  const duration = 800
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // ease-out
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.round(target * eased)

    // Format with spaces as thousands separator
    const formatted = current.toLocaleString('ru-RU')
    displayValue.value = formatted + suffix

    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  if (!hasAnimated.value) {
    hasAnimated.value = true
    animateValue()
  }
})

watch(() => props.value, () => {
  displayValue.value = String(props.value)
})
</script>

<template>
  <div class="stats-card dash-card dash-card-hover relative overflow-hidden p-6">
    <div class="stats-accent" :style="{ background: accentColors[color] }"></div>
    <div class="flex items-start justify-between">
      <div>
        <p class="text-[#6B7280] text-sm font-medium mb-2">{{ title }}</p>
        <p class="text-3xl font-bold text-[#111827] tracking-tight">{{ displayValue || value }}</p>
        <p v-if="subtitle" class="text-sm text-[#6B7280] mt-1">{{ subtitle }}</p>
      </div>
      <div
        v-if="icon"
        :class="['stats-icon w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color]]"
        v-html="icon"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.stats-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
}

.stats-icon {
  transition: transform var(--transition-normal);
}

.stats-card:hover .stats-icon {
  transform: rotate(5deg) scale(1.1);
}
</style>
