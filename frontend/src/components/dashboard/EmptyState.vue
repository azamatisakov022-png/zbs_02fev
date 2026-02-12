<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  actionLabel?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-[60px] px-5">
    <div
      v-if="icon"
      class="w-20 h-20 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-5 text-[#94a3b8]"
      v-html="icon"
    ></div>
    <h3 class="text-lg font-semibold text-[#64748b] mb-2 text-center">{{ title }}</h3>
    <p v-if="description" class="text-sm text-[#94a3b8] text-center max-w-sm mb-5">{{ description }}</p>
    <button
      v-if="actionLabel"
      @click="emit('action')"
      class="px-5 py-2.5 bg-[#0e888d] text-white rounded-lg font-medium hover:bg-[#0a6d71] transition-colors text-sm"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
