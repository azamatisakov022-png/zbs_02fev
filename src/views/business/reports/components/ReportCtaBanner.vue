<script setup lang="ts">
defineEmits<{
  (e: 'create'): void
}>()
</script>

<template>
  <div class="rcb-banner mb-6 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
    <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
    <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
    <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
      <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div class="flex-1">
        <h2 class="rcb-title font-bold mb-2">{{ $t('businessReports.ctaTitle') }}</h2>
        <p class="rcb-description text-white/80">{{ $t('businessReports.ctaDescription') }}</p>
      </div>
      <button
        @click="$emit('create')"
        class="rcb-action-btn flex items-center justify-center gap-2 bg-white px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors shadow-lg flex-shrink-0"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('businessReports.startFilling') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.rcb-banner {
  background: linear-gradient(to right, #10b981, #059669);
}
.rcb-title {
  font-size: 24px;
}
@media (min-width: 1024px) {
  .rcb-title {
    font-size: 27px;
  }
}
.rcb-description {
  font-size: 16px;
}
@media (min-width: 1024px) {
  .rcb-description {
    font-size: 18px;
  }
}
.rcb-action-btn {
  color: #10b981;
}
</style>
