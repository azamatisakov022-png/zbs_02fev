<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface FAQItem {
  id: number
  question: string
  answer: string
}

const faqItems = computed<FAQItem[]>(() => [
  {
    id: 1,
    question: t('faq.items.q1'),
    answer: t('faq.items.a1'),
  },
  {
    id: 2,
    question: t('faq.items.q2'),
    answer: t('faq.items.a2'),
  },
  {
    id: 3,
    question: t('faq.items.q3'),
    answer: t('faq.items.a3'),
  },
  {
    id: 4,
    question: t('faq.items.q4'),
    answer: t('faq.items.a4'),
  },
  {
    id: 5,
    question: t('faq.items.q5'),
    answer: t('faq.items.a5'),
  },
  {
    id: 6,
    question: t('faq.items.q6'),
    answer: t('faq.items.a6'),
  },
])

const openId = ref<number | null>(null)

function toggle(id: number) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <section style="background: linear-gradient(180deg, white 0%, #F0FDF4 100%)">
    <div class="container-main py-20">
      <!-- Section header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-[#111827] tracking-tight mb-2">
          {{ $t('faq.title') }}
        </h2>
        <p class="text-[#6B7280]">
          {{ $t('faq.subtitle') }}
        </p>
      </div>

      <!-- FAQ items -->
      <div class="max-w-3xl mx-auto space-y-3">
        <div
          v-for="item in faqItems"
          :key="item.id"
          class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
        >
          <!-- Question header -->
          <button
            class="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
            @click="toggle(item.id)"
          >
            <span class="font-semibold text-[#111827] pr-4">{{ item.question }}</span>
            <svg
              class="w-5 h-5 text-[#6B7280] flex-shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180': openId === item.id }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Answer content -->
          <div
            class="faq-answer overflow-hidden transition-all duration-300"
            :style="{
              maxHeight: openId === item.id ? '500px' : '0px',
              opacity: openId === item.id ? 1 : 0,
            }"
          >
            <div class="px-6 pb-5 text-[#6B7280] leading-relaxed text-sm">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
