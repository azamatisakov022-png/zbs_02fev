<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const responsibilities = computed(() => [
  t('rop.item1'),
  t('rop.item2'),
  t('rop.item3'),
  t('rop.item4'),
])
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[100px] bg-white">
    <div class="container-main">
      <!-- Section header -->
      <div class="mb-8 md:mb-10 lg:mb-[75px]">
        <h2 class="text-2xl md:text-3xl lg:text-[40px] lg:leading-[55px] font-bold text-[#415861] mb-3 lg:mb-[20px] max-w-[711px]">
          {{ $t('rop.title') }}
        </h2>
        <div class="section-title-underline"></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[66px] items-start">
        <!-- Content -->
        <div class="lg:w-[554px]">
          <p class="text-[#415861] text-lg md:text-xl lg:text-[33px] lg:leading-[1.5] font-medium mb-6 lg:mb-[20px]">
            {{ $t('rop.principle') }}
          </p>

          <h3 class="text-[#415861] text-base md:text-lg lg:text-[22px] lg:leading-[1.5] font-medium mb-6 lg:mb-[20px]">
            {{ $t('rop.ensures') }}
          </h3>

          <ul class="space-y-4 lg:space-y-[22px]">
            <li
              v-for="(item, index) in responsibilities"
              :key="index"
              class="flex items-start gap-3 lg:gap-[12px]"
            >
              <img src="/images/check.svg" alt="check" class="w-6 h-6 lg:w-[34px] lg:h-[34px] flex-shrink-0" />
              <span class="text-[#415861] text-base md:text-lg lg:text-[24px] lg:leading-[1.5] font-medium">
                {{ item }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Image -->
        <div class="relative">
          <div class="rounded-[30px] lg:rounded-[50px] overflow-hidden h-[300px] md:h-[450px] lg:h-[653px] w-full lg:w-[620px]">
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600"
              :alt="$t('rop.imageAlt')"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
