<script setup lang="ts">
interface UploadedFile {
  id: number
  name: string
  size: string
  type: string
}

defineProps<{
  uploadedFiles: UploadedFile[]
  isDragging: boolean
}>()

defineEmits<{
  (e: 'drop', event: DragEvent): void
  (e: 'fileSelect', event: Event): void
  (e: 'removeFile', id: number): void
  (e: 'update:isDragging', value: boolean): void
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <h2 class="text-[27px] font-semibold text-[#1e293b] mb-2">{{ $t('businessReports.documentsTitle') }}</h2>
    <p class="text-[16px] text-[#64748b] mb-6">{{ $t('businessReports.documentsDescription') }}</p>

    <div
      @dragover.prevent="$emit('update:isDragging', true)"
      @dragleave="$emit('update:isDragging', false)"
      @drop.prevent="$emit('drop', $event)"
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
        isDragging ? 'border-[#10b981] bg-green-50' : 'border-[#e2e8f0] hover:border-[#10b981]'
      ]"
    >
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f1f5f9] flex items-center justify-center">
        <svg class="w-8 h-8 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p class="text-[#1e293b] font-medium mb-2">{{ $t('businessReports.dragFilesHere') }}</p>
      <p class="text-[16px] text-[#64748b] mb-4">{{ $t('businessReports.or') }}</p>
      <label class="inline-flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#059669] transition-colors cursor-pointer">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {{ $t('businessReports.chooseFiles') }}
        <input
          type="file"
          multiple
          class="hidden"
          @change="$emit('fileSelect', $event)"
        />
      </label>
      <p class="text-[14px] text-[#64748b] mt-4">{{ $t('businessReports.fileFormats') }}</p>
    </div>

    <div class="mt-6 bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
      <p class="font-medium text-[#1e293b] mb-2">{{ $t('businessReports.recommendedDocs') }}</p>
      <ul class="text-[16px] text-[#64748b] space-y-1">
        <li class="flex items-center gap-2">
          <svg class="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
          </svg>
          {{ $t('businessReports.docTransferActs') }}
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
          </svg>
          {{ $t('businessReports.docRecyclingContracts') }}
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
          </svg>
          {{ $t('businessReports.docCompletionActs') }}
        </li>
      </ul>
    </div>

    <div v-if="uploadedFiles.length > 0" class="mt-6">
      <h3 class="text-[16px] font-medium text-[#1e293b] mb-3">{{ $t('businessReports.uploadedFiles', { count: uploadedFiles.length }) }}</h3>
      <div class="space-y-2">
        <div
          v-for="file in uploadedFiles"
          :key="file.id"
          class="flex items-center justify-between bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-[16px] font-medium text-[#1e293b]">{{ file.name }}</p>
              <p class="text-[14px] text-[#64748b]">{{ file.size }}</p>
            </div>
          </div>
          <button
            @click="$emit('removeFile', file.id)"
            class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
