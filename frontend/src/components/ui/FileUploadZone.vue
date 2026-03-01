<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface FileData {
  fileName: string
  fileType: string
  fileDataUrl: string
}

const props = withDefaults(defineProps<{
  modelValue: FileData | null
  accept?: string
  maxSizeMB?: number
  label?: string
  disabled?: boolean
}>(), {
  accept: '.pdf,.jpg,.jpeg,.png',
  maxSizeMB: 10,
  label: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: FileData | null]
}>()

const { t } = useI18n()
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onDragOver(e: DragEvent) {
  if (props.disabled) return
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  if (props.disabled) return
  const file = e.dataTransfer?.files[0]
  if (file) processFile(file)
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) processFile(file)
  if (input) input.value = ''
}

function processFile(file: File) {
  const maxBytes = props.maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) return

  const reader = new FileReader()
  reader.onload = () => {
    emit('update:modelValue', {
      fileName: file.name,
      fileType: file.type,
      fileDataUrl: reader.result as string,
    })
  }
  reader.readAsDataURL(file)
}

function removeFile() {
  emit('update:modelValue', null)
}

function openPicker() {
  if (!props.disabled) fileInput.value?.click()
}

const isImage = (type: string) => type.startsWith('image/')
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-[#374151] mb-2">{{ label }}</label>

    <!-- File preview -->
    <div v-if="modelValue" class="flex items-center gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
      <!-- Thumbnail -->
      <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-[#e2e8f0] flex items-center justify-center">
        <img v-if="isImage(modelValue.fileType)" :src="modelValue.fileDataUrl" class="w-full h-full object-cover" />
        <svg v-else class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-[#1e293b] truncate">{{ modelValue.fileName }}</p>
      </div>
      <button
        v-if="!disabled"
        @click="removeFile"
        class="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Drop zone -->
    <div
      v-else
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="openPicker"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
        disabled ? 'border-[#e2e8f0] bg-[#f8fafc] opacity-50 cursor-not-allowed' : '',
        dragOver ? 'border-[#2563eb] bg-[#eff6ff]' : 'border-[#cbd5e1] hover:border-[#94a3b8] hover:bg-[#f8fafc]',
      ]"
    >
      <svg class="w-8 h-8 mx-auto mb-2 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p class="text-sm text-[#64748b]">
        {{ t('workflow.uploadReceipt') }}
      </p>
      <p class="text-xs text-[#94a3b8] mt-1">PDF, JPG, PNG — {{ t('calcDetail.maxFileSize') || `до ${maxSizeMB} МБ` }}</p>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="onFileSelect"
    />
  </div>
</template>
