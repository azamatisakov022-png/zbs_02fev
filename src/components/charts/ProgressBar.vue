<script setup lang="ts">
import { computed } from 'vue'

interface ProgressItem {
  label: string
  current: number
  target: number
  unit: string
}

defineProps<{
  items: ProgressItem[]
  title?: string
}>()

function getPercent(current: number, target: number) {
  if (target <= 0) return 0
  return Math.min((current / target) * 100, 100)
}

function getColor(current: number, target: number) {
  return current >= target ? '#10b981' : '#ef4444'
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
    <h3 v-if="title" class="text-lg font-semibold text-[#1e293b] mb-4">{{ title }}</h3>
    <div class="space-y-5">
      <div v-for="(item, i) in items" :key="i">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-[#415861] font-medium">{{ item.label }}</span>
          <span class="text-sm font-semibold" :style="{ color: getColor(item.current, item.target) }">
            {{ item.current }}{{ item.unit }} / {{ item.target }}{{ item.unit }}
            <span class="text-[#94a3b8] font-normal ml-1">({{ getPercent(item.current, item.target).toFixed(0) }}%)</span>
          </span>
        </div>
        <div class="w-full h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{
              width: getPercent(item.current, item.target) + '%',
              backgroundColor: getColor(item.current, item.target)
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
