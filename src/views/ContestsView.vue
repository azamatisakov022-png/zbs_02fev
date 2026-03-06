<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const handleApply = () => {
  // TODO: Implement application logic
}
</script>

<template>
  <div class="py-10 lg:py-[60px]">
    <!-- Page header -->
    <div class="container-main">
      <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-2 lg:mb-[12px]">
        {{ $t('contests.title') }}
      </h1>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861]">
        {{ $t('contests.subtitle') }}
      </p>
    </div>

    <!-- Main content -->
    <div class="container-main pt-8 lg:pt-[60px]">
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-[92px]">
        <!-- Left side - Image -->
        <div class="w-full lg:w-[675px] flex-shrink-0">
          <div class="relative rounded-[30px] lg:rounded-[50px] overflow-hidden aspect-[675/480]">
            <img
              src="/images/contests-hero.jpg"
              :alt="$t('contests.heroAlt')"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Right side - Content -->
        <div class="flex flex-col justify-between lg:min-h-[480px]">
          <!-- Top section - Open applications -->
          <div class="mb-8 lg:mb-0">
            <h2 class="text-xl md:text-2xl lg:text-[30px] font-bold text-[#415861] uppercase mb-4 lg:mb-[20px]">
              <span class="mr-2">🏆</span>{{ $t('contests.openApplications') }}
            </h2>
            <div class="text-[#415861] text-base lg:text-[18px] font-medium leading-relaxed">
              <p>{{ $t('contests.contestTitle') }}</p>
              <p>{{ $t('contests.applicationDeadline') }}</p>
              <p>{{ $t('contests.grantSize') }}</p>
            </div>
          </div>

          <!-- Middle section - Conditions -->
          <div class="mb-8 lg:mb-0">
            <h2 class="text-xl md:text-2xl lg:text-[30px] font-bold text-[#415861] uppercase mb-4 lg:mb-[20px]">
              {{ $t('contests.participationConditions') }}
            </h2>
            <ul class="text-[#415861] text-base lg:text-[18px] font-medium leading-relaxed list-disc pl-7 space-y-1">
              <li>{{ $t('contests.condition1') }}</li>
              <li>{{ $t('contests.condition2') }}</li>
              <li>{{ $t('contests.condition3') }}</li>
            </ul>
          </div>

          <!-- Button -->
          <button
            @click="handleApply"
            class="w-full bg-[#0e888d] text-white text-xl lg:text-[24px] font-medium py-5 lg:py-[28px] rounded-[30px] hover:bg-[#0a6d71] transition-colors"
          >
            {{ $t('contests.submitApplication') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
