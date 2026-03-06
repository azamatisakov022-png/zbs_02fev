<script setup lang="ts">
import { AppButton, AppCtaBanner } from '@/components/ui'

defineEmits<{
  (e: 'create'): void
}>()
</script>

<template>
  <AppCtaBanner :title="$t('businessReports.ctaTitle')" :description="$t('businessReports.ctaDescription')" color="green" class="mb-6">
    <template #icon>
      <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </template>
    <template #action>
      <AppButton variant="secondary" bg="white" color="#10b981" font-size="16px" :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M12 4v16m8-8H4&quot; /></svg>'" :label="$t('businessReports.startFilling')" @click="$emit('create')" />
    </template>
  </AppCtaBanner>
</template>
