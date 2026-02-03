<script setup lang="ts">
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
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e7eb]">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-[#70868f] text-sm font-medium mb-2">{{ title }}</p>
        <p class="text-3xl font-bold text-[#415861]">{{ value }}</p>
        <p v-if="subtitle" class="text-sm text-[#70868f] mt-1">{{ subtitle }}</p>
      </div>
      <div
        v-if="icon"
        :class="['w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color]]"
        v-html="icon"
      ></div>
    </div>
  </div>
</template>
