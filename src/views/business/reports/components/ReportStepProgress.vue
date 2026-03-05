<script setup lang="ts">
import StepperProgress from '@/components/ui/StepperProgress.vue'

defineProps<{
  steps: { number: number; title: string }[]
  currentStep: number
}>()

defineEmits<{
  (e: 'goToStep', step: number): void
}>()
</script>

<template>
  <StepperProgress
    :steps="steps"
    :currentStep="currentStep"
    accentColor="#10b981"
    @go-to-step="$emit('goToStep', $event)"
  />
</template>
