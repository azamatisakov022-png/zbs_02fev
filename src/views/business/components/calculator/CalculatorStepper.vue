<script setup lang="ts">
import StepperProgress from '@/components/ui/StepperProgress.vue'

defineProps<{
  steps: { number: number; title: string }[]
  currentStep: number
}>()

defineEmits<{
  (e: 'go-to-step', step: number): void
}>()
</script>

<template>
  <StepperProgress
    :steps="steps"
    :currentStep="currentStep"
    accentColor="#2D8B4E"
    @go-to-step="$emit('go-to-step', $event)"
  />
</template>
