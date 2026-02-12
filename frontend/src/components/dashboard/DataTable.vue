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
  <div class="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-[#f8fafc] border-b border-[#e5e7eb]">
            <th
              v-for="col in columns"
              :key="col.key"
              :style="col.width ? { width: col.width, minWidth: col.width } : {}"
              class="px-4 py-4 text-left text-sm font-semibold text-[#415861] whitespace-nowrap"
            >
              {{ col.label }}
            </th>
            <th v-if="actions" class="px-4 py-4 text-right text-sm font-semibold text-[#415861] whitespace-nowrap">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in data"
            :key="index"
            :class="['border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors', rowClass?.(row)]"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-4 text-sm text-[#415861] whitespace-nowrap"
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
                    class="p-2 text-[#0e888d] hover:bg-[#e8f5f5] rounded-lg transition-colors"
                    title="Просмотреть"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
