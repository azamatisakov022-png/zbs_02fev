<script setup lang="ts">
defineProps<{
  entries: Array<{ date?: string; action?: string; user?: string; comment?: string }>
  viewerRole?: string
  compact?: boolean
}>()
</script>

<template>
  <div class="audit-log">
    <h3 v-if="!compact" class="text-base font-semibold text-[#1e293b] mb-3">Audit Log</h3>
    <div v-for="(entry, idx) in entries" :key="idx" class="flex items-start gap-3 py-2 border-b border-[#f1f5f9] last:border-0">
      <div class="text-xs text-[#94a3b8] whitespace-nowrap mt-0.5">{{ entry.date }}</div>
      <div class="text-sm text-[#1e293b]">
        <span class="font-medium">{{ entry.action }}</span>
        <span v-if="entry.user" class="text-[#64748b]"> — {{ entry.user }}</span>
        <p v-if="entry.comment" class="text-xs text-[#64748b] mt-0.5">{{ entry.comment }}</p>
      </div>
    </div>
  </div>
</template>
