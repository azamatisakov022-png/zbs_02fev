<script setup lang="ts">
import { computed } from 'vue'
import { AppButton, AppBadge } from '../ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { toastStore } from '../../stores/toast'

export interface PreviewDocument {
  name: string
  type?: string
  size?: string
  date?: string
  status?: string
  category?: string
  source?: string
}

const props = defineProps<{
  doc: PreviewDocument | null
}>()

const emit = defineEmits<{
  close: []
}>()

const fileType = computed(() => {
  if (props.doc?.type) return props.doc.type.toUpperCase()
  const ext = props.doc?.name?.split('.').pop()?.toUpperCase()
  return ext || 'FILE'
})

const typeStyle = computed(() => {
  const t = fileType.value
  if (t === 'PDF') return { bg: 'bg-red-100', text: 'text-red-600' }
  if (t === 'DOC' || t === 'DOCX') return { bg: 'bg-blue-100', text: 'text-blue-600' }
  if (t === 'XLS' || t === 'XLSX') return { bg: 'bg-green-100', text: 'text-green-600' }
  if (t === 'JPG' || t === 'JPEG' || t === 'PNG') return { bg: 'bg-purple-100', text: 'text-purple-600' }
  return { bg: 'bg-gray-100', text: 'text-gray-600' }
})

function handleDownload() {
  toastStore.show({ type: 'info', title: 'Скачивание документа', message: 'Скачивание будет доступно после подключения файлового хранилища' })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="doc"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div
        class="bg-white rounded-xl shadow-2xl flex flex-col"
        style="width: 95%; max-width: 900px; height: 85%; max-height: 760px;"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center gap-3 flex-shrink-0">
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeStyle.bg]">
            <svg :class="['w-5 h-5', typeStyle.text]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-lg font-bold text-[#1e293b] flex-1 min-w-0 truncate">{{ doc.name }}</h2>
          <button @click="emit('close')" class="p-2 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg transition-colors flex-shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content (scrollable) -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- File icon + name -->
          <div class="flex items-center gap-4 mb-6">
            <div :class="['w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0', typeStyle.bg]">
              <svg :class="['w-10 h-10', typeStyle.text]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-[#1e293b] text-xl leading-tight break-all">{{ doc.name }}</p>
              <p v-if="doc.source" class="text-sm text-[#64748b] mt-1">{{ doc.source }}</p>
              <p v-if="doc.category" class="text-sm text-[#64748b] mt-1">{{ doc.category }}</p>
            </div>
          </div>

          <!-- Info grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]">
              <p class="text-xs text-[#64748b] mb-1">Тип файла</p>
              <p class="font-medium text-[#1e293b]">{{ fileType }}</p>
            </div>
            <div v-if="doc.size" class="bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]">
              <p class="text-xs text-[#64748b] mb-1">Размер</p>
              <p class="font-medium text-[#1e293b]">{{ doc.size }}</p>
            </div>
            <div v-if="doc.date" class="bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]">
              <p class="text-xs text-[#64748b] mb-1">Дата загрузки</p>
              <p class="font-medium text-[#1e293b]">{{ doc.date }}</p>
            </div>
            <div v-if="doc.status" class="bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]">
              <p class="text-xs text-[#64748b] mb-1">Статус</p>
              <AppBadge :variant="getStatusBadgeVariant(doc.status)">{{ doc.status }}</AppBadge>
            </div>
          </div>

          <!-- Preview placeholder -->
          <div class="bg-[#f1f5f9] border border-dashed border-[#cbd5e1] rounded-xl p-10 text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-[#e2e8f0] rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p class="text-[#64748b] text-sm">Предпросмотр содержимого будет доступен после подключения файлового хранилища</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-[#e2e8f0] flex justify-end gap-3 flex-shrink-0">
          <AppButton variant="secondary" @click="emit('close')">
            Закрыть
          </AppButton>
          <AppButton variant="primary" @click="handleDownload">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Скачать
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
