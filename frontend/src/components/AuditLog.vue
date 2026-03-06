<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface AuditEntry {
  date: string
  action: string
  user?: string
  details?: string
  status?: string
}

withDefaults(defineProps<{
  entries: AuditEntry[]
  viewerRole?: 'payer' | 'operator' | 'admin'
  compact?: boolean
}>(), {
  viewerRole: 'payer',
  compact: false,
})

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div class="audit-log" :class="{ 'audit-log--compact': compact }">
    <h3 v-if="!compact" class="audit-log__title">{{ t('audit.history', 'История изменений') }}</h3>
    <div class="audit-log__list">
      <div v-for="(entry, idx) in entries" :key="idx" class="audit-log__item">
        <span class="audit-log__date">{{ formatDate(entry.date) }}</span>
        <span class="audit-log__action">{{ entry.action }}</span>
        <span v-if="entry.user" class="audit-log__user">{{ entry.user }}</span>
        <span v-if="entry.details" class="audit-log__details">{{ entry.details }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.audit-log__title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.audit-log__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audit-log__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
}

.audit-log--compact .audit-log__item {
  padding: 6px 10px;
  font-size: 12px;
}

.audit-log__date {
  color: #64748b;
  white-space: nowrap;
  flex-shrink: 0;
}

.audit-log__action {
  color: #1e293b;
  font-weight: 500;
}

.audit-log__user {
  color: #64748b;
  margin-left: auto;
}

.audit-log__details {
  color: #94a3b8;
  font-size: 12px;
}
</style>
