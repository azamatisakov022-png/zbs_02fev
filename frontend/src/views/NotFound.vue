<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="not-found min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
    <div class="text-center">
      <p class="nf-code">404</p>
      <h1 class="text-xl font-semibold text-[#1e293b] mb-2">{{ t('notFound.title') }}</h1>
      <p class="text-sm text-[#94a3b8] mb-8 max-w-sm mx-auto">
        {{ t('notFound.description') }}
      </p>
      <button
        @click="router.push('/')"
        class="px-6 py-3 bg-[#2D8B4E] text-white rounded-xl font-medium hover:bg-[#246e3e] transition-colors text-sm"
      >
        {{ t('notFound.goHome') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.nf-code {
  font-size: 72px;
  font-weight: 800;
  color: #E2E8F0;
  line-height: 1;
  margin-bottom: 12px;
}
</style>
