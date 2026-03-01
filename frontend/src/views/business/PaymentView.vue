<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">{{ t('common.payment') }}</h1>
    <p class="text-gray-500">{{ t('common.inDevelopment') }}</p>
  </div>
</template>
