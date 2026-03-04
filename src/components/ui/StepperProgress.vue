<script setup lang="ts">
defineProps<{
  steps: { number: number; title: string }[]
  currentStep: number
  accentColor?: string
}>()

const emit = defineEmits<{
  (e: 'go-to-step', step: number): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
    <div class="flex items-center justify-between">
      <template v-for="(step, index) in steps" :key="step.number">
        <button
          @click="step.number <= currentStep && emit('go-to-step', step.number)"
          :class="[
            'flex items-center gap-2 lg:gap-3',
            step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
          ]"
        >
          <div
            :class="[
              'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-colors',
              currentStep >= step.number
                ? 'text-white'
                : 'bg-[#e2e8f0] text-[#64748b]'
            ]"
            :style="currentStep >= step.number ? { background: accentColor || '#2563eb' } : {}"
          >
            <svg v-if="currentStep > step.number" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else>{{ step.number }}</span>
          </div>
          <span
            :class="[
              'hidden sm:block text-[17px] lg:text-[20px] font-semibold',
              currentStep >= step.number ? 'text-[#1e293b]' : 'text-[#64748b]'
            ]"
          >
            {{ step.title }}
          </span>
        </button>
        <div
          v-if="index < steps.length - 1"
          class="flex-1 h-1 mx-2 lg:mx-4 rounded-full transition-all duration-500"
          :style="{ background: currentStep > step.number ? (accentColor || '#2563eb') : '#e2e8f0' }"
        ></div>
      </template>
    </div>
  </div>
</template>
