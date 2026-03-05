<script setup lang="ts">
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
    <button
      v-if="currentStep > 1"
      @click="emit('back')"
      class="btn-action btn-action-ghost"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      {{ $t('businessCalc.backBtn') }}
    </button>
    <div v-else></div>

    <div class="flex flex-col sm:flex-row gap-3">
      <button
        v-if="currentStep === 1"
        @click="emit('next')"
        class="btn-action btn-action-primary"
      >
        {{ $t('businessCalc.nextBtn') }}
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button
        v-if="currentStep === 2"
        @click="emit('calculate')"
        class="btn-action btn-action-primary"
        :disabled="formSubmitted && hasErrors"
        :title="formSubmitted && hasErrors ? $t('businessCalc.fixFormErrors') : ''"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        {{ $t('businessCalc.calculateBtn') }}
      </button>

      <template v-if="currentStep === 3">
        <button
          @click="emit('save-draft')"
          class="btn-action btn-action-ghost"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {{ $t('businessCalc.saveDraftBtn') }}
        </button>

        <button
          @click="emit('submit')"
          class="btn-action btn-action-primary"
          :disabled="formSubmitted && hasErrors"
          :title="formSubmitted && hasErrors ? $t('businessCalc.fixFormErrors') : ''"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {{ $t('businessCalc.submitForReview') }}
        </button>
      </template>
    </div>
  </div>
</template>
