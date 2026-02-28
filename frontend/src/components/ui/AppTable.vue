<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

export interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

defineProps<{
  columns: TableColumn[]
  rows: Record<string, any>[]
  clickable?: boolean
}>()

defineEmits<{
  (e: 'rowClick', row: Record<string, any>): void
}>()
</script>

<template>
  <div class="app-table-wrap">
    <table class="app-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : {}"
            :class="{ [`app-table__th--${col.align || 'left'}`]: true }"
          >
            {{ col.label }}
          </th>
          <th v-if="$slots.actions" class="app-table__th--right">{{ t('common.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, idx) in rows"
          :key="idx"
          :class="{ 'app-table__row--clickable': clickable }"
          @click="clickable && $emit('rowClick', row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="{ [`app-table__td--${col.align || 'left'}`]: true }"
          >
            <slot :name="`cell-${col.key}`" :value="row[col.key]" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="app-table__td--right">
            <slot name="actions" :row="row" />
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="app-table__empty">
            <slot name="empty">
              <span class="text-[#94A3B8]">{{ t('common.noData') }}</span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.app-table-wrap {
  overflow-x: auto;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
}

.app-table {
  width: 100%;
  border-collapse: collapse;
}

.app-table thead th {
  background: #F8FAFC;
  font-size: 11px;
  text-transform: uppercase;
  color: #94A3B8;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 1px solid #E2E8F0;
  white-space: nowrap;
}

.app-table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid #F1F5F9;
  font-size: 14px;
  color: #1e293b;
  font-variant-numeric: tabular-nums;
}

.app-table tbody tr:last-child td { border-bottom: none; }
.app-table tbody tr:hover { background: #FAFBFC; }

.app-table__row--clickable { cursor: pointer; }

.app-table__th--left,
.app-table__td--left { text-align: left; }

.app-table__th--center,
.app-table__td--center { text-align: center; }

.app-table__th--right,
.app-table__td--right { text-align: right; }

.app-table__empty {
  padding: 40px 16px !important;
  text-align: center;
}
</style>
