<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductGroupStore } from '@/stores/product-groups'
import type { ProductSubgroupDTO } from '@/types/product-group'
import SubgroupPickerModal from './SubgroupPickerModal.vue'
import GroupPickerModal from './GroupPickerModal.vue'
import TnvedCode from './TnvedCode.vue'

const { t } = useI18n()
const groupStore = useProductGroupStore()

const props = withDefaults(defineProps<{
  group: string
  subgroup: string
  readonly?: boolean
  disabled?: boolean
  showLabels?: boolean
  compact?: boolean
  accentColor?: string
}>(), {
  readonly: false,
  disabled: false,
  showLabels: true,
  compact: false,
  accentColor: '#f59e0b',
})

const emit = defineEmits<{
  'update:group': [value: string]
  'update:subgroup': [value: string]
  'subgroupSelected': [data: ProductSubgroupDTO | null]
}>()

const groupNumber = computed(() => groupStore.getGroupNumberFromValue(props.group))

const selectedSubgroupData = computed(() => {
  if (!props.group || !props.subgroup) return null
  return groupStore.getSubgroupById(groupNumber.value, props.subgroup)
})

const isPackaging = computed(() => groupStore.isPackagingGroup(props.group))

const groupLabel = computed(() => groupStore.getGroupLabel(props.group))

const subgroupLabel = computed(() => selectedSubgroupData.value?.name || '')

const onGroupChange = (value: string) => {
  emit('update:group', value)
  emit('update:subgroup', '')
  emit('subgroupSelected', null)
}

const onSubgroupChange = (value: string) => {
  emit('update:subgroup', value)
}

const onSubgroupSelected = (data: ProductSubgroupDTO | null) => {
  emit('subgroupSelected', data)
}

watch(() => props.subgroup, () => {
  emit('subgroupSelected', selectedSubgroupData.value)
})
</script>

<template>
  <div class="product-group-selector">
    <!-- Row 1: Group — modal picker -->
    <div :class="compact ? 'mb-2' : 'mb-4'">
      <label v-if="showLabels" class="block text-[20px] font-semibold text-[#1e293b] mb-1">{{ $t('productGroup.label') }}</label>
      <template v-if="readonly">
        <div class="w-full px-4 py-3 bg-gray-50 border border-[#e2e8f0] rounded-lg text-[18px] font-semibold text-[#1e293b] truncate" :title="groupLabel">
          {{ groupLabel || '—' }}
        </div>
      </template>
      <template v-else>
        <GroupPickerModal
          :modelValue="group"
          @update:modelValue="onGroupChange"
        />
      </template>
    </div>

    <!-- Row 2: Subgroup — modal picker -->
    <div :class="compact ? '' : 'mb-4'">
      <label v-if="showLabels" class="block text-[20px] font-semibold text-[#1e293b] mb-1">{{ $t('productGroup.subgroupLabel') }}</label>
      <template v-if="readonly">
        <div class="w-full px-4 py-3 bg-gray-50 border border-[#e2e8f0] rounded-lg text-[18px] font-semibold text-[#1e293b] truncate" :title="subgroupLabel">
          {{ subgroupLabel || '—' }}
        </div>
      </template>
      <template v-else>
        <SubgroupPickerModal
          :groupId="group"
          :modelValue="subgroup"
          @update:modelValue="onSubgroupChange"
          @subgroupSelected="onSubgroupSelected"
        />
      </template>
    </div>

    <!-- Row 3: Type-specific readonly fields (hidden in compact mode) -->
    <template v-if="!compact">
      <div v-if="!isPackaging" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <div>
          <label v-if="showLabels" class="block text-[20px] font-semibold text-[#1e293b] mb-1">{{ $t('productGroup.gskpCode') }}</label>
          <div class="w-full px-4 py-3 bg-gray-50 border border-[#e2e8f0] rounded-lg text-[18px] font-semibold text-[#1e293b] font-mono">
            {{ selectedSubgroupData?.gskpCode || '—' }}
          </div>
        </div>
        <div>
          <label v-if="showLabels" class="block text-[20px] font-semibold text-[#1e293b] mb-1">{{ $t('productGroup.tnvedCode') }}</label>
          <div class="w-full px-4 py-3 bg-gray-50 border border-[#e2e8f0] rounded-lg text-[18px] font-semibold text-[#1e293b] font-mono">
            <TnvedCode v-if="selectedSubgroupData?.tnvedCode" :code="selectedSubgroupData.tnvedCode" />
            <span v-else>—</span>
          </div>
        </div>
        <div class="sm:col-span-2 lg:col-span-3">
          <label v-if="showLabels" class="block text-[20px] font-semibold text-[#1e293b] mb-1">{{ $t('productGroup.tnvedName') }}</label>
          <div class="w-full px-4 py-3 bg-gray-50 border border-[#e2e8f0] rounded-lg text-[18px] font-semibold text-[#1e293b]" :title="selectedSubgroupData?.tnvedName || ''">
            {{ selectedSubgroupData?.tnvedName || '—' }}
          </div>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-3 lg:gap-4">
        <div class="sm:col-span-2 lg:col-span-4">
          <label v-if="showLabels" class="block text-[20px] font-semibold text-[#1e293b] mb-1">{{ $t('productGroup.packagingMaterial') }}</label>
          <div class="w-full px-4 py-3 bg-gray-50 border border-[#e2e8f0] rounded-lg text-[18px] font-semibold text-[#1e293b]">
            {{ selectedSubgroupData?.packagingMaterial || '—' }}
          </div>
        </div>
        <div class="lg:col-span-3">
          <label v-if="showLabels" class="block text-[20px] font-semibold text-[#1e293b] mb-1">{{ $t('productGroup.trtsDesignation') }}</label>
          <div class="w-full px-4 py-3 bg-gray-50 border border-[#e2e8f0] rounded-lg text-[18px] font-semibold text-[#1e293b] font-mono">
            {{ selectedSubgroupData?.packagingLetterCode || '—' }}
          </div>
        </div>
        <div class="lg:col-span-3">
          <label v-if="showLabels" class="block text-[20px] font-semibold text-[#1e293b] mb-1">{{ $t('productGroup.trtsCode') }}</label>
          <div class="w-full px-4 py-3 bg-gray-50 border border-[#e2e8f0] rounded-lg text-[18px] font-semibold text-[#1e293b] font-mono">
            {{ selectedSubgroupData?.packagingDigitalCode || '—' }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.product-group-selector {
  max-width: 100%;
}
</style>
