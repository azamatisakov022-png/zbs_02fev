<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface BreadcrumbItem {
  label: string
  path?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav v-if="items.length > 0" class="mb-6 flex items-center flex-wrap gap-1" aria-label="Breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <router-link
        v-if="item.path"
        :to="item.path"
        class="text-[13px] text-[#94a3b8] hover:text-[#0e888d] transition-colors"
      >
        {{ t(item.label) }}
      </router-link>
      <span
        v-else
        class="text-[13px] text-[#1e293b] font-medium"
      >
        {{ t(item.label) }}
      </span>
      <span
        v-if="index < items.length - 1"
        class="text-[13px] text-[#94a3b8] mx-1"
      >›</span>
    </template>
  </nav>
</template>
