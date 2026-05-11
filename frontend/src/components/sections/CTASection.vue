<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const routerButtons = computed(() => [
  { label: t('cta.registries'), href: '/registries' },
  { label: t('cta.calculator'), href: '/calculator' },
])

const scrollToContacts = () => {
  const el = document.getElementById('contacts')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  } else {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }
}
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[80px]">
    <div class="container-main">
      <div
        class="rounded-[24px] md:rounded-[32px] lg:rounded-[40px] py-10 md:py-14 lg:py-[56px] px-6 md:px-12 lg:px-[80px] text-center"
        style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);"
      >
        <h2 class="text-white text-2xl md:text-3xl lg:text-[40px] lg:leading-[1.2] font-bold uppercase mb-4 md:mb-5 lg:mb-[20px]">
          {{ $t('cta.title') }}
        </h2>

        <p class="text-white/95 text-sm md:text-base lg:text-[17px] lg:leading-[1.55] max-w-[760px] mx-auto mb-7 md:mb-8 lg:mb-[36px]">
          {{ $t('cta.description') }}
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-5">
          <router-link
            v-for="button in routerButtons"
            :key="button.label"
            :to="button.href"
            class="w-full sm:w-auto min-w-[200px] lg:min-w-[220px] bg-white/20 text-white px-6 lg:px-7 py-3 lg:py-3.5 rounded-[14px] text-sm lg:text-[14px] font-semibold uppercase tracking-wide hover:bg-white/30 transition-colors"
          >
            {{ button.label }}
          </router-link>
          <button
            @click="scrollToContacts"
            class="w-full sm:w-auto min-w-[200px] lg:min-w-[220px] bg-white/20 text-white px-6 lg:px-7 py-3 lg:py-3.5 rounded-[14px] text-sm lg:text-[14px] font-semibold uppercase tracking-wide hover:bg-white/30 transition-colors"
          >
            {{ $t('cta.contactUs') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
