<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import economicsImg from '../../assets/images/green-forest-aerial.webp'

const { t } = useI18n()

const benefits = computed(() => [
  t('economics.benefits.item1'),
  t('economics.benefits.item2'),
  t('economics.benefits.item3'),
  t('economics.benefits.item4'),
  t('economics.benefits.item5'),
])
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[80px] bg-white">
    <div class="container-main">
      <!-- Section header -->
      <div class="mb-8 md:mb-10 lg:mb-[48px]">
        <h2 class="text-2xl md:text-3xl lg:text-[40px] lg:leading-[55px] font-bold text-[#415861] mb-3 lg:mb-[20px]">
          {{ $t('economics.title') }}
        </h2>
        <div class="section-title-underline"></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[60px] items-center">
        <!-- Image -->
        <div class="relative order-2 lg:order-1">
          <div class="rounded-[24px] lg:rounded-[32px] overflow-hidden h-[260px] md:h-[340px] lg:h-[380px] w-full">
            <img
              :src="economicsImg"
              :alt="$t('economics.title')"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Content -->
        <div class="order-1 lg:order-2">
          <p class="text-[#415861] text-base md:text-lg lg:text-[20px] lg:leading-[1.55] font-medium mb-5 lg:mb-[24px]">
            {{ $t('economics.description') }}
          </p>

          <h3 class="text-[#415861] text-base md:text-lg lg:text-[19px] lg:leading-[1.4] font-semibold mb-4 lg:mb-[18px]">
            {{ $t('economics.fundsDirectedTo') }}
          </h3>

          <ul class="space-y-3 lg:space-y-[16px]">
            <li
              v-for="(benefit, index) in benefits"
              :key="index"
              class="flex items-start gap-3"
            >
              <img src="/images/check.svg" alt="check" class="w-6 h-6 lg:w-7 lg:h-7 mt-0.5 flex-shrink-0" />
              <span class="text-[#415861] text-base md:text-base lg:text-[17px] lg:leading-[1.55]">
                {{ benefit }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
