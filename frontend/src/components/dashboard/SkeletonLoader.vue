<script setup lang="ts">
interface Props {
  variant: 'table' | 'card' | 'chart' | 'form'
  rows?: number
  cards?: number
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  cards: 4,
})
</script>

<template>
  <!-- Table skeleton -->
  <div v-if="variant === 'table'" class="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden">
    <div class="bg-[#f8fafc] border-b border-[#e5e7eb] px-4 py-4 flex gap-8">
      <div class="sk h-4 rounded w-16"></div>
      <div class="sk h-4 rounded w-20"></div>
      <div class="sk h-4 rounded w-24"></div>
      <div class="sk h-4 rounded w-16 hidden sm:block"></div>
      <div class="sk h-4 rounded w-20 hidden sm:block"></div>
    </div>
    <div v-for="r in rows" :key="r" class="px-4 py-4 border-b border-[#f1f5f9] flex gap-8">
      <div class="sk h-4 rounded w-20"></div>
      <div class="sk h-4 rounded w-16"></div>
      <div class="sk h-4 rounded w-28"></div>
      <div class="sk h-4 rounded w-20 hidden sm:block"></div>
      <div class="sk h-4 rounded w-16 hidden sm:block"></div>
    </div>
  </div>

  <!-- Card skeleton -->
  <div v-else-if="variant === 'card'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div v-for="i in cards" :key="i" class="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e7eb]">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="sk h-3 w-24 rounded mb-3"></div>
          <div class="sk h-8 w-20 rounded"></div>
        </div>
        <div class="sk w-12 h-12 rounded-xl"></div>
      </div>
    </div>
  </div>

  <!-- Chart skeleton -->
  <div v-else-if="variant === 'chart'" class="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e7eb]">
    <div class="sk h-5 w-48 rounded mb-6"></div>
    <div class="flex items-end gap-3 h-[200px] px-4">
      <div class="sk flex-1 rounded-t" style="height: 45%"></div>
      <div class="sk flex-1 rounded-t" style="height: 70%"></div>
      <div class="sk flex-1 rounded-t" style="height: 55%"></div>
      <div class="sk flex-1 rounded-t" style="height: 85%"></div>
      <div class="sk flex-1 rounded-t" style="height: 60%"></div>
      <div class="sk flex-1 rounded-t" style="height: 40%"></div>
      <div class="sk flex-1 rounded-t" style="height: 75%"></div>
    </div>
    <div class="flex justify-between mt-3 px-4">
      <div v-for="i in 7" :key="i" class="sk h-3 w-8 rounded"></div>
    </div>
  </div>

  <!-- Form skeleton -->
  <div v-else-if="variant === 'form'" class="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-[#e5e7eb] space-y-6">
    <div class="sk h-6 w-56 rounded"></div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i">
        <div class="sk h-3 w-24 rounded mb-2"></div>
        <div class="sk h-11 w-full rounded-xl"></div>
      </div>
    </div>
    <div class="sk h-32 w-full rounded-xl"></div>
    <div class="flex justify-end gap-3 pt-4">
      <div class="sk h-10 w-24 rounded-lg"></div>
      <div class="sk h-10 w-36 rounded-lg"></div>
    </div>
  </div>
</template>

<style scoped>
.sk {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
