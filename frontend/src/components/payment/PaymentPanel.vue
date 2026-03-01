<script setup lang="ts">
defineProps<{
  calculationId: number
  modelValue: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="payment-panel bg-white border border-[#e2e8f0] rounded-xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-[#1e293b]">Payment Panel</h3>
      <button @click="emit('close')" class="text-[#94a3b8] hover:text-[#64748b]">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
    <p class="text-sm text-[#64748b]">Calculation #{{ calculationId }}</p>
  </div>
</template>
