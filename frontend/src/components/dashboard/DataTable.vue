<script setup lang="ts">
interface Column {
  key: string
  label: string
  width?: string
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
  actions?: boolean
  rowClass?: (row: Record<string, any>) => string
}

defineProps<Props>()
defineEmits(['view', 'edit', 'delete', 'approve', 'reject'])
</script>

<template>
  <div class="dash-card overflow-hidden">
    <!-- Desktop: standard table -->
    <div class="overflow-x-auto hidden md:block">
      <table class="w-full" role="table">
        <thead>
          <tr class="bg-[#F8FAFC]" style="border-bottom: 1px solid rgba(0,0,0,0.06)">
            <th
              v-for="col in columns"
              :key="col.key"
              :style="col.width ? { width: col.width, minWidth: col.width } : {}"
              class="px-4 py-3.5 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.05em] whitespace-nowrap"
              scope="col"
            >
              {{ col.label }}
            </th>
            <th v-if="actions" class="px-4 py-3.5 text-right text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.05em] whitespace-nowrap" scope="col">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="data.length > 0">
            <tr
              v-for="(row, index) in data"
              :key="index"
              :class="[
                'table-row border-b border-[#F1F5F9] transition-colors',
                index % 2 === 1 ? 'bg-[#FAFBFC]' : 'bg-white',
                rowClass?.(row)
              ]"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-4 text-sm text-[#374151]"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  {{ row[col.key] }}
                </slot>
              </td>
              <td v-if="actions" class="px-4 py-4 text-right whitespace-nowrap">
                <slot name="actions" :row="row">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="$emit('view', row)"
                      class="btn-action btn-action-secondary text-xs px-3 py-1.5"
                      aria-label="Просмотреть"
                      data-tooltip="Просмотреть"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </slot>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="actions ? columns.length + 1 : columns.length">
              <slot name="empty">
                <div class="flex flex-col items-center justify-center py-[60px] px-5">
                  <div class="w-20 h-20 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-5 text-[#94a3b8]">
                    <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <h3 class="text-lg font-semibold text-[#64748b] mb-2">Нет данных</h3>
                  <p class="text-sm text-[#94a3b8]">Данные пока отсутствуют</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile: card-based layout -->
    <div class="md:hidden">
      <template v-if="data.length > 0">
        <div
          v-for="(row, index) in data"
          :key="index"
          :class="['p-4 border-b border-[#F1F5F9] transition-colors', rowClass?.(row)]"
          style="transition: background var(--transition-fast)"
        >
          <div class="space-y-2">
            <div
              v-for="col in columns"
              :key="col.key"
              class="flex items-start justify-between gap-3"
            >
              <span class="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.05em] flex-shrink-0 min-w-[100px]">{{ col.label }}</span>
              <span class="text-sm text-[#374151] text-right">
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  {{ row[col.key] }}
                </slot>
              </span>
            </div>
          </div>
          <div v-if="actions" class="mt-3 pt-3 border-t border-[#F1F5F9]">
            <slot name="actions" :row="row">
              <button
                @click="$emit('view', row)"
                class="btn-action btn-action-secondary w-full text-sm py-2"
                aria-label="Просмотреть"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Просмотреть
              </button>
            </slot>
          </div>
        </div>
      </template>
      <template v-else>
        <slot name="empty">
          <div class="flex flex-col items-center justify-center py-[60px] px-5">
            <div class="w-20 h-20 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-5 text-[#94a3b8]">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <h3 class="text-lg font-semibold text-[#64748b] mb-2">Нет данных</h3>
            <p class="text-sm text-[#94a3b8]">Данные пока отсутствуют</p>
          </div>
        </slot>
      </template>
    </div>
  </div>
</template>

<style scoped>
.table-row:hover {
  background: #F0FDF4 !important;
}
</style>
