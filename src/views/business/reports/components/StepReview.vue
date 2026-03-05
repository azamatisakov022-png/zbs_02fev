<script setup lang="ts">
import type { ProcessingItem } from '@/stores/reports'

interface UploadedFile {
  id: number
  name: string
  size: string
  type: string
}

defineProps<{
  reportingYear: string
  companyData: { name: string; inn: string; address: string }
  processingItems: ProcessingItem[]
  uploadedFiles: UploadedFile[]
  totalDeclared: string
  totalProcessed: string
  processingPercent: string
  weightedNormativePercent: number
  formSubmitted: boolean
  formErrors: Record<string, string>
  hasErrors: boolean
  getWasteTypeLabel: (value: string) => string
  getRecyclerLabel: (value: string) => string
  getItemNormativePercent: (wasteType: string) => number
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <h2 class="text-[27px] font-semibold text-[#1e293b] mb-6">{{ $t('businessReports.reviewTitle') }}</h2>

    <div v-if="formSubmitted && hasErrors" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3" data-validation-error>
      <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <p class="font-medium text-red-800">{{ $t('businessReports.formErrors') }}</p>
        <ul class="mt-1 text-[16px] text-red-700 list-disc list-inside">
          <li v-for="(msg, key) in formErrors" :key="key">{{ msg }}</li>
        </ul>
      </div>
    </div>

    <div class="space-y-6">
      <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
        <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ $t('businessReports.basicDataSummary') }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[16px]">
          <div>
            <span class="text-[#64748b]">{{ $t('businessReports.reportingYearLabel') }}</span>
            <p class="font-medium text-[#1e293b]">{{ reportingYear }}</p>
          </div>
          <div>
            <span class="text-[#64748b]">{{ $t('businessReports.organizationLabel') }}</span>
            <p class="font-medium text-[#1e293b]">{{ companyData.name }}</p>
          </div>
          <div>
            <span class="text-[#64748b]">{{ $t('businessReports.innLabel') }}</span>
            <p class="font-medium text-[#1e293b]">{{ companyData.inn }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
        <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('businessReports.processingDataSummary') }}
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-[16px] border-collapse">
            <thead>
              <tr class="text-left text-[#64748b]">
                <th class="px-3 py-2 pb-3" style="min-width: 250px">{{ $t('businessReports.thProductGroup') }}</th>
                <th class="px-3 py-2 pb-3" style="min-width: 80px">{{ $t('businessReports.thCode') }}</th>
                <th class="px-3 py-2 pb-3 text-right" style="min-width: 100px">{{ $t('businessReports.thDeclared') }}</th>
                <th class="px-3 py-2 pb-3 text-right" style="min-width: 100px">{{ $t('businessReports.thProcessed') }}</th>
                <th class="px-3 py-2 pb-3 text-right" style="min-width: 80px">{{ $t('businessReports.thPercent') }}</th>
                <th class="px-3 py-2 pb-3" style="min-width: 150px">{{ $t('businessReports.thRecycler') }}</th>
              </tr>
            </thead>
            <tbody class="text-[#1e293b]">
              <tr v-for="item in processingItems.filter(i => i.wasteType)" :key="item.id" class="border-t border-[#e2e8f0]">
                <td class="px-3 py-2">{{ getWasteTypeLabel(item.wasteType) }}</td>
                <td class="px-3 py-2 font-mono text-[14px]">{{ item.wasteCode }}</td>
                <td class="px-3 py-2 text-right">{{ item.declared }}</td>
                <td class="px-3 py-2 text-right font-medium text-[#10b981]">{{ item.processed }}</td>
                <td class="px-3 py-2 text-right font-semibold" :class="((parseFloat(item.processed) / parseFloat(item.declared)) * 100) >= getItemNormativePercent(item.wasteType) ? 'text-[#10b981]' : 'text-[#ef4444]'">
                  {{ ((parseFloat(item.processed) / parseFloat(item.declared)) * 100).toFixed(1) }}%
                </td>
                <td class="px-3 py-2 text-[14px]">{{ getRecyclerLabel(item.recycler) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-[#e2e8f0] font-semibold">
                <td colspan="2" class="px-3 py-2 pt-3">{{ $t('businessReports.total') }}</td>
                <td class="px-3 py-2 pt-3 text-right">{{ totalDeclared }} {{ $t('businessReports.tons') }}</td>
                <td class="px-3 py-2 pt-3 text-right text-[#10b981]">{{ totalProcessed }} {{ $t('businessReports.tons') }}</td>
                <td class="px-3 py-2 pt-3 text-right" :class="parseFloat(processingPercent) >= weightedNormativePercent ? 'text-[#10b981]' : 'text-[#ef4444]'">{{ processingPercent }}%</td>
                <td class="px-3 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div :class="[
          'mt-4 p-3 rounded-lg flex items-center gap-2',
          parseFloat(processingPercent) >= weightedNormativePercent ? 'bg-green-100' : 'bg-yellow-100'
        ]">
          <svg v-if="parseFloat(processingPercent) >= weightedNormativePercent" class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span :class="parseFloat(processingPercent) >= weightedNormativePercent ? 'text-green-800' : 'text-yellow-800'">
            {{ parseFloat(processingPercent) >= weightedNormativePercent ? $t('businessReports.normFulfilled') : $t('businessReports.normNotFulfilled') }}
          </span>
        </div>
      </div>

      <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
        <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {{ $t('businessReports.attachedDocs', { count: uploadedFiles.length }) }}
        </h3>
        <div v-if="uploadedFiles.length > 0" class="space-y-2">
          <div v-for="file in uploadedFiles" :key="file.id" class="flex items-center gap-2 text-[16px] text-[#1e293b]">
            <svg class="w-4 h-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ file.name }} ({{ file.size }})
          </div>
        </div>
        <p v-else class="text-[16px] text-[#64748b]">{{ $t('businessReports.noDocsAttached') }}</p>
      </div>
    </div>
  </div>
</template>
