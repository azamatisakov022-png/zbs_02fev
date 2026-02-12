<script setup lang="ts">
import { computed, watch } from 'vue'
import {
  productGroups,
  productSubgroups,
  isPackagingGroup,
  type ProductSubgroup,
} from '../data/product-groups'

const props = withDefaults(defineProps<{
  group: string
  subgroup: string
  readonly?: boolean
  disabled?: boolean
  showLabels?: boolean
  accentColor?: string
}>(), {
  readonly: false,
  disabled: false,
  showLabels: true,
  accentColor: '#f59e0b',
})

const emit = defineEmits<{
  'update:group': [value: string]
  'update:subgroup': [value: string]
  'subgroupSelected': [data: ProductSubgroup | null]
}>()

const availableSubgroups = computed(() => {
  return productSubgroups[props.group] || []
})

const selectedSubgroupData = computed<ProductSubgroup | null>(() => {
  if (!props.group || !props.subgroup) return null
  return availableSubgroups.value.find(s => s.value === props.subgroup) || null
})

const isPackaging = computed(() => isPackagingGroup(props.group))

const groupLabel = computed(() => {
  return productGroups.find(g => g.value === props.group)?.label || ''
})

const subgroupLabel = computed(() => {
  return selectedSubgroupData.value?.label || ''
})

const onGroupChange = (value: string) => {
  emit('update:group', value)
  emit('update:subgroup', '')
  emit('subgroupSelected', null)
}

const onSubgroupChange = (value: string) => {
  emit('update:subgroup', value)
  const sub = availableSubgroups.value.find(s => s.value === value)
  emit('subgroupSelected', sub || null)
}

watch(() => props.subgroup, () => {
  emit('subgroupSelected', selectedSubgroupData.value)
})
</script>

<template>
  <div class="space-y-3">
    <!-- Row 1: Group + Subgroup -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="lg:col-span-2">
        <label v-if="showLabels" class="block text-xs text-[#64748b] mb-1">Группа товара</label>
        <template v-if="readonly">
          <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b]">
            {{ groupLabel || '—' }}
          </div>
        </template>
        <template v-else>
          <select
            :value="group"
            @change="onGroupChange(($event.target as HTMLSelectElement).value)"
            :disabled="disabled"
            class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            :style="{ '--tw-ring-color': accentColor }"
          >
            <option value="">Выберите группу</option>
            <option v-for="g in productGroups" :key="g.value" :value="g.value">{{ g.label }}</option>
          </select>
        </template>
      </div>
      <div class="lg:col-span-2">
        <label v-if="showLabels" class="block text-xs text-[#64748b] mb-1">Подгруппа</label>
        <template v-if="readonly">
          <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b]">
            {{ subgroupLabel || '—' }}
          </div>
        </template>
        <template v-else>
          <select
            :value="subgroup"
            @change="onSubgroupChange(($event.target as HTMLSelectElement).value)"
            :disabled="disabled || !group"
            class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Выберите подгруппу</option>
            <option v-for="sub in availableSubgroups" :key="sub.value" :value="sub.value">{{ sub.label }}</option>
          </select>
        </template>
      </div>
    </div>

    <!-- Row 2: Type-specific fields -->
    <div v-if="group" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      <template v-if="!isPackaging">
        <!-- Product fields (groups 1-18) -->
        <div>
          <label v-if="showLabels" class="block text-xs text-[#64748b] mb-1">Код ГСКП</label>
          <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-mono">
            {{ selectedSubgroupData?.gskpCode || '—' }}
          </div>
        </div>
        <div>
          <label v-if="showLabels" class="block text-xs text-[#64748b] mb-1">Код ТН ВЭД</label>
          <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-mono">
            {{ selectedSubgroupData?.tnvedCode || '—' }}
          </div>
        </div>
        <div class="lg:col-span-4">
          <label v-if="showLabels" class="block text-xs text-[#64748b] mb-1">Наименование ТН ВЭД</label>
          <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b]">
            {{ selectedSubgroupData?.tnvedName || '—' }}
          </div>
        </div>
      </template>
      <template v-else>
        <!-- Packaging fields (groups 19-24) -->
        <div class="lg:col-span-2">
          <label v-if="showLabels" class="block text-xs text-[#64748b] mb-1">Материал упаковки</label>
          <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b]">
            {{ selectedSubgroupData?.packagingMaterial || '—' }}
          </div>
        </div>
        <div class="lg:col-span-2">
          <label v-if="showLabels" class="block text-xs text-[#64748b] mb-1">Обозначение ТР ТС</label>
          <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-mono">
            {{ selectedSubgroupData?.packagingLetterCode || '—' }}
          </div>
        </div>
        <div class="lg:col-span-2">
          <label v-if="showLabels" class="block text-xs text-[#64748b] mb-1">Код ТР ТС</label>
          <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-mono">
            {{ selectedSubgroupData?.packagingDigitalCode || '—' }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
