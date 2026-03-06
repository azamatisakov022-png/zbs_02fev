<script setup lang="ts">
import { AppButton } from '@/components/ui'

defineProps<{
  currentStep: number
  totalSteps: number
  formSubmitted: boolean
  hasErrors: boolean
}>()

const emit = defineEmits<{
  (e: 'next'): void
  (e: 'back'): void
  (e: 'calculate'): void
  (e: 'save-draft'): void
  (e: 'submit'): void
}>()
</script>

<template>
  <div class="px-6 lg:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 sticky bottom-0 z-10 rounded-b-2xl">
    <AppButton
      v-if="currentStep > 1"
      variant="outline"
      @click="emit('back')"
      :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M15 19l-7-7 7-7&quot; /></svg>'"
      :label="$t('businessCalc.backBtn')"
    />
    <div v-else></div>

    <div class="flex flex-col sm:flex-row gap-3">
      <AppButton
        v-if="currentStep === 1"
        variant="primary"
        bg="#f59e0b"
        @click="emit('next')"
        :label="$t('businessCalc.nextBtn')"
        :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M9 5l7 7-7 7&quot; /></svg>'"
        icon-position="right"
      />

      <AppButton
        v-if="currentStep === 2"
        variant="primary"
        bg="#f59e0b"
        @click="emit('calculate')"
        :disabled="formSubmitted && hasErrors"
        :title="formSubmitted && hasErrors ? $t('businessCalc.fixFormErrors') : ''"
        :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z&quot; /></svg>'"
        :label="$t('businessCalc.calculateBtn')"
      />

      <template v-if="currentStep === 3">
        <AppButton
          variant="outline"
          @click="emit('save-draft')"
          :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4&quot; /></svg>'"
          :label="$t('businessCalc.saveDraftBtn')"
        />

        <AppButton
          variant="primary"
          bg="#f59e0b"
          @click="emit('submit')"
          :disabled="formSubmitted && hasErrors"
          :title="formSubmitted && hasErrors ? $t('businessCalc.fixFormErrors') : ''"
          :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M12 19l9 2-9-18-9 18 9-2zm0 0v-8&quot; /></svg>'"
          :label="$t('businessCalc.submitForReview')"
        />
      </template>
    </div>
  </div>
</template>
