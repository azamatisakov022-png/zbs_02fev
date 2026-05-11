<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Document {
  id: number
  title: string
  description: string
}

const documents = computed<Document[]>(() => [
  {
    id: 1,
    title: t('documents.items.title1'),
    description: t('documents.items.desc1'),
  },
  {
    id: 2,
    title: t('documents.items.title2'),
    description: t('documents.items.desc2'),
  },
  {
    id: 3,
    title: t('documents.items.title3'),
    description: t('documents.items.desc3'),
  },
  {
    id: 4,
    title: t('documents.items.title4'),
    description: t('documents.items.desc4'),
  },
])
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[80px] bg-white">
    <div class="container-main">
      <!-- Section header -->
      <div class="mb-8 md:mb-10 lg:mb-[48px]">
        <h2 class="text-2xl md:text-3xl lg:text-[40px] lg:leading-[55px] font-bold text-[#415861] mb-3 lg:mb-[20px]">
          {{ $t('documents.title') }}
        </h2>
        <div class="section-title-underline"></div>
        <p class="text-[#415861] text-sm md:text-base lg:text-[17px] lg:leading-[1.55] max-w-[760px] mt-4 lg:mt-[20px]">
          {{ $t('documents.subtitle') }}
        </p>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        <router-link
          v-for="doc in documents"
          :key="doc.id"
          to="/legal-base"
          class="dash-card dash-card-hover p-6 flex flex-col group"
        >
          <!-- Document icon -->
          <div class="mb-4">
            <svg
              class="w-9 h-9 text-[#0e888d]"
              fill="none"
              viewBox="0 0 40 40"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect x="8" y="4" width="24" height="32" rx="2" />
              <line x1="13" y1="14" x2="27" y2="14" />
              <line x1="13" y1="20" x2="27" y2="20" />
              <line x1="13" y1="26" x2="21" y2="26" />
            </svg>
          </div>

          <!-- Title -->
          <h3 class="text-[#415861] text-base lg:text-[17px] lg:leading-[24px] font-semibold mb-2">
            {{ doc.title }}
          </h3>

          <!-- Description -->
          <p class="text-[#415861] text-sm lg:text-[14px] leading-[1.55] flex-1">
            {{ doc.description }}
          </p>
        </router-link>
      </div>
    </div>
  </section>
</template>
