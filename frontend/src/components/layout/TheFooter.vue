<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const footerLinks = computed(() => [
  { name: 'legal-base', path: '/legal-base', label: t('nav.legalBase') },
  { name: 'licenses', path: '/licenses', label: t('nav.licenses') },
  { name: 'publications', path: '/publications', label: t('nav.publications') },
  { name: 'registries', path: '/registries', label: t('nav.registries') },
  { name: 'calculator', path: '/calculator', label: t('nav.calculator') },
  { name: 'contests', path: '/contests', label: t('nav.contests') },
  { name: 'glossary', path: '/glossary', label: t('nav.glossary') },
])

const socialLinks = [
  { name: 'instagram', icon: '/images/social/instagram.svg', url: 'https://instagram.com/reestr_kg', label: 'Instagram', handle: 'reestr_kg' },
  { name: 'telegram', icon: '/images/social/telegram.svg', url: 'https://t.me/reestr_kg', label: 'Telegram', handle: '@reestr_kg' },
  { name: 'facebook', icon: '/images/social/facebook.svg', url: 'https://facebook.com/reestr_kg', label: 'Facebook', handle: '@reestr_kg' },
  { name: 'youtube', icon: '/images/social/youtube.svg', url: 'https://youtube.com/@reestr_kg', label: 'YouTube', handle: '@reestr_kg' },
  { name: 'linkedin', icon: '/images/social/linkedin.svg', url: 'https://linkedin.com/company/reestr_kg', label: 'Linkedin', handle: '@reestr_kg' },
]

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="container-main">
      <!-- Top footer: logo + navigation -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between py-5 lg:py-6 gap-4 lg:gap-0">
        <router-link to="/" class="flex items-center gap-2">
          <img src="/images/logo-eco.png" :alt="$t('common.companyName')" style="height: 48px; width: 48px; object-fit: cover; object-position: left;" />
          <div class="flex flex-col whitespace-nowrap">
            <span class="text-[14px] font-bold text-[#065f46] uppercase" style="letter-spacing: 0.5px">{{ $t('common.companyName') }}</span>
            <span class="text-[11px] font-normal text-[#6b7280]">{{ $t('common.companyType') }}</span>
          </div>
        </router-link>

        <nav class="hidden lg:flex items-center gap-[40px]">
          <router-link
            v-for="link in footerLinks"
            :key="link.name"
            :to="link.path"
            class="text-[#415861] text-base font-medium uppercase hover:text-[#0e888d] transition-colors"
          >
            {{ link.label }}
          </router-link>
        </nav>

        <nav class="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
          <router-link
            v-for="link in footerLinks"
            :key="link.name"
            :to="link.path"
            class="text-[#415861] text-xs md:text-sm font-medium uppercase hover:text-[#0e888d] transition-colors"
          >
            {{ link.label }}
          </router-link>
        </nav>
      </div>

      <!-- Middle footer: two organizations + shared work schedule -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 py-8 border-t border-gray-100">
        <!-- Founder: Ministry -->
        <div>
          <p class="text-[#415861] text-sm font-semibold leading-snug mb-3">
            {{ $t('contacts.organization') }}
          </p>
          <ul class="space-y-2.5">
            <li class="flex items-start gap-2.5 text-[#415861] text-[13px] leading-[1.45]">
              <svg class="w-[18px] h-[18px] text-[#0e888d] mt-px flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>{{ $t('contacts.address') }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <svg class="w-[18px] h-[18px] text-[#0e888d] mt-px flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <a href="tel:+996312623228" class="text-[#415861] text-[13px] hover:text-[#0e888d] transition-colors">+996 (312) 62-32-28</a>
            </li>
            <li class="flex items-start gap-2.5">
              <svg class="w-[18px] h-[18px] text-[#0e888d] mt-px flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <a href="mailto:info@ecology.gov.kg" class="text-[#415861] text-[13px] hover:text-[#0e888d] transition-colors">info@ecology.gov.kg</a>
            </li>
          </ul>
        </div>

        <!-- Operator: GP Eco Operator -->
        <div>
          <p class="text-[#415861] text-sm font-semibold leading-snug mb-3">
            {{ $t('common.companyType') }} «{{ $t('common.companyName') }}»
          </p>
          <ul class="space-y-2.5">
            <li class="flex items-start gap-2.5 text-[#415861] text-[13px] leading-[1.45]">
              <svg class="w-[18px] h-[18px] text-[#0e888d] mt-px flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>г. Бишкек, переулок Чернышевского, 30</span>
            </li>
            <li class="flex items-start gap-2.5">
              <svg class="w-[18px] h-[18px] text-[#0e888d] mt-px flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <a href="tel:+996312442233" class="text-[#415861] text-[13px] hover:text-[#0e888d] transition-colors">+996 (312) 44 22 33, 44 22 44</a>
            </li>
            <li class="flex items-start gap-2.5">
              <svg class="w-[18px] h-[18px] text-[#0e888d] mt-px flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <a href="mailto:gp.ecooperator2025@mail.ru" class="text-[#415861] text-[13px] hover:text-[#0e888d] transition-colors">gp.ecooperator2025@mail.ru</a>
            </li>
          </ul>
        </div>

        <!-- Shared work schedule + reception -->
        <div>
          <h3 class="text-[#415861] text-sm font-semibold mb-3">{{ $t('contacts.workSchedule') }}</h3>
          <div class="space-y-2 text-[13px]">
            <div class="flex justify-between gap-4">
              <span class="text-[#6b7280]">{{ $t('contacts.weekdays') }}</span>
              <span class="text-[#415861] font-medium">08:30 – 17:30</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[#6b7280]">{{ $t('contacts.lunch') }}</span>
              <span class="text-[#415861] font-medium">12:00 – 13:00</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[#6b7280]">{{ $t('contacts.saturday') }}</span>
              <span class="text-[#415861] font-medium">{{ $t('contacts.dayOff') }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[#6b7280]">{{ $t('contacts.sunday') }}</span>
              <span class="text-[#415861] font-medium">{{ $t('contacts.dayOff') }}</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-[#415861] text-[13px] font-semibold mb-1">{{ $t('contacts.reception') }}</p>
            <p class="text-[#6b7280] text-xs leading-[1.5]">{{ $t('contacts.receptionDescription') }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom footer: copyright + social -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between py-5 lg:py-6 border-t border-gray-100 gap-4 lg:gap-0">
        <p class="text-[#6b7280] text-xs">
          © {{ currentYear }} {{ $t('common.companyType') }} «{{ $t('common.companyName') }}»
        </p>

        <div class="flex items-center gap-4 lg:gap-[40px] flex-wrap">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 lg:gap-3 text-[#415861] text-xs leading-[15px] hover:text-[#0e888d] transition-colors"
          >
            <img :src="social.icon" :alt="social.label" class="w-5 h-5 lg:w-6 lg:h-6" />
            <span class="hidden sm:block">
              {{ social.label }}<br/>{{ social.handle }}
            </span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
