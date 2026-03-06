<script setup lang="ts">
import { AppButton } from '@/components/ui'
import type { UploadedFile } from '@/types/report'

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
    <h2 class="sd-title font-semibold mb-2">{{ $t('businessReports.documentsTitle') }}</h2>
    <p class="sd-description mb-6">{{ $t('businessReports.documentsDescription') }}</p>

    <div
      @dragover.prevent="$emit('update:isDragging', true)"
      @dragleave="$emit('update:isDragging', false)"
      @drop.prevent="$emit('drop', $event)"
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
        isDragging ? 'sd-dropzone--active' : 'sd-dropzone--idle'
      ]"
    >
      <div class="sd-dropzone-icon w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 sd-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p class="sd-text-dark font-medium mb-2">{{ $t('businessReports.dragFilesHere') }}</p>
      <p class="sd-description mb-4">{{ $t('businessReports.or') }}</p>
      <label class="sd-upload-btn inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer">
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
      <p class="sd-hint mt-4">{{ $t('businessReports.fileFormats') }}</p>
    </div>

    <div class="sd-panel mt-6 rounded-xl p-4">
      <p class="sd-text-dark font-medium mb-2">{{ $t('businessReports.recommendedDocs') }}</p>
      <ul class="sd-description space-y-1">
        <li class="flex items-center gap-2">
          <svg class="w-4 h-4 sd-icon-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
          </svg>
          {{ $t('businessReports.docTransferActs') }}
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-4 h-4 sd-icon-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
          </svg>
          {{ $t('businessReports.docRecyclingContracts') }}
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-4 h-4 sd-icon-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
          </svg>
          {{ $t('businessReports.docCompletionActs') }}
        </li>
      </ul>
    </div>

    <div v-if="uploadedFiles.length > 0" class="mt-6">
      <h3 class="sd-files-heading font-medium mb-3">{{ $t('businessReports.uploadedFiles', { count: uploadedFiles.length }) }}</h3>
      <div class="space-y-2">
        <div
          v-for="file in uploadedFiles"
          :key="file.id"
          class="sd-file-row flex items-center justify-between rounded-lg px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <div class="sd-file-icon w-10 h-10 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 sd-icon-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="sd-file-name font-medium">{{ file.name }}</p>
              <p class="sd-file-size">{{ file.size }}</p>
            </div>
          </div>
          <AppButton variant="icon-danger" size="sm" @click="$emit('removeFile', file.id)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sd-title {
  font-size: 27px;
  color: #1e293b;
}
.sd-description {
  font-size: 16px;
  color: #64748b;
}
.sd-dropzone--active {
  border-color: #10b981;
  background: #f0fdf4;
}
.sd-dropzone--idle {
  border-color: #e2e8f0;
}
.sd-dropzone--idle:hover {
  border-color: #10b981;
}
.sd-dropzone-icon {
  background: #f1f5f9;
}
.sd-text-muted {
  color: #64748b;
}
.sd-text-dark {
  color: #1e293b;
}
.sd-upload-btn {
  background: #10b981;
}
.sd-upload-btn:hover {
  background: #059669;
}
.sd-hint {
  font-size: 14px;
  color: #64748b;
}
.sd-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.sd-icon-accent {
  color: #10b981;
}
.sd-files-heading {
  font-size: 16px;
  color: #1e293b;
}
.sd-file-row {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.sd-file-icon {
  background: rgba(16, 185, 129, 0.1);
}
.sd-file-name {
  font-size: 16px;
  color: #1e293b;
}
.sd-file-size {
  font-size: 14px;
  color: #64748b;
}
</style>
