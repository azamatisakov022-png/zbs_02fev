<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { notificationStore } from '../stores/notifications'
import type { AuditEntry } from '@/types/calculation'

const props = withDefaults(defineProps<{
  entries: AuditEntry[]
  viewerRole?: 'payer' | 'operator'
  compact?: boolean
}>(), {
  viewerRole: 'operator',
  compact: false,
})

const { t } = useI18n()
const expanded = ref(false)

const filteredEntries = computed(() => {
  let list = [...props.entries]
  // Payer view hides internal actions
  if (props.viewerRole === 'payer') {
    list = list.filter(e => !['assigned', 'unassigned'].includes(e.action))
  }
  // Reverse chronological
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const visibleEntries = computed(() => {
  if (!props.compact || expanded.value) return filteredEntries.value
  return filteredEntries.value.slice(0, 3)
})

const hasMore = computed(() => props.compact && filteredEntries.value.length > 3)

type DotColor = 'green' | 'red' | 'orange' | 'blue' | 'gray'

function getDotColor(action: string): DotColor {
  if (['approved', 'fee_payment_confirmed', 'penalty_payment_confirmed', 'completed'].includes(action)) return 'green'
  if (['rejected'].includes(action)) return 'red'
  if (['revision'].includes(action)) return 'orange'
  if (['created', 'submitted', 'resubmitted', 'fee_payment_uploaded', 'penalty_payment_uploaded'].includes(action)) return 'blue'
  return 'gray'
}

const dotClasses: Record<DotColor, string> = {
  green: 'bg-[#22c55e]',
  red: 'bg-[#ef4444]',
  orange: 'bg-[#f59e0b]',
  blue: 'bg-[#3b82f6]',
  gray: 'bg-[#9ca3af]',
}

function formatTime(ts: string): string {
  return notificationStore.formatRelativeTime(ts)
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5">
    <h3 class="text-base font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ t('audit.title') }}
    </h3>

    <div v-if="visibleEntries.length === 0" class="text-sm text-[#94a3b8] text-center py-4">
      {{ t('common.noData') }}
    </div>

    <div v-else class="relative">
      <!-- Vertical line -->
      <div class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#e2e8f0]"></div>

      <div v-for="entry in visibleEntries" :key="entry.id" class="relative flex gap-3 pb-4 last:pb-0">
        <!-- Dot -->
        <div class="relative z-10 flex-shrink-0 mt-1">
          <div :class="['w-[14px] h-[14px] rounded-full border-2 border-white', dotClasses[getDotColor(entry.action)]]"></div>
        </div>
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-sm font-medium text-[#1e293b]">{{ entry.userName }}</span>
            <span class="text-sm text-[#64748b]">{{ t(`audit.action.${entry.action}`) }}</span>
          </div>
          <p class="text-xs text-[#94a3b8] mt-0.5">{{ formatTime(entry.timestamp) }}</p>
          <div v-if="entry.comment" class="mt-1.5 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#475569]">
            {{ entry.comment }}
          </div>
        </div>
      </div>
    </div>

    <!-- Show all / Collapse -->
    <button
      v-if="hasMore"
      @click="expanded = !expanded"
      class="mt-3 text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
    >
      {{ expanded ? t('audit.collapse') : t('audit.showAll') }}
    </button>
  </div>
</template>
