<script setup lang="ts">
const footerLinks = [
  { name: 'legislation', path: '/legislation', label: 'Законодательство' },
  { name: 'licenses', path: '/licenses', label: 'Лицензии' },
  { name: 'publications', path: '/publications', label: 'Публикации' },
  { name: 'registries', path: '/registries', label: 'Реестры' },
  { name: 'calculator', path: '/calculator', label: 'Калькулятор' },
  { name: 'contests', path: '/contests', label: 'Конкурсы' },
  { name: 'reception-points', path: '/reception-points', label: 'Пункты приема' },
  { name: 'recyclers', path: '/recyclers', label: 'Переработчики' },
  { name: 'glossary', path: '/glossary', label: 'Глоссарий' },
]

const socialLinks = [
  { name: 'instagram', icon: '/images/social/instagram.svg', url: '#', label: 'Instagram', handle: 'reestr_kg' },
  { name: 'telegram', icon: '/images/social/telegram.svg', url: '#', label: 'Telegram', handle: '@reestr_kg' },
  { name: 'facebook', icon: '/images/social/facebook.svg', url: '#', label: 'Facebook', handle: '@reestr_kg' },
  { name: 'youtube', icon: '/images/social/youtube.svg', url: '#', label: 'YouTube', handle: '@reestr_kg' },
  { name: 'linkedin', icon: '/images/social/linkedin.svg', url: '#', label: 'Linkedin', handle: '@reestr_kg' },
]
</script>

<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="container-main">
      <!-- Top footer - Logo and Navigation -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between py-5 lg:py-6 gap-4 lg:gap-0">
        <!-- Logo -->
        <div class="flex items-center gap-2 lg:gap-3">
          <div class="flex items-center relative w-[60px] h-[50px] lg:w-[76px] lg:h-[64px]">
            <img src="/images/logo-circle1.svg" alt="" class="absolute" style="top: 48px; left: 5px; width: 48px; height: 36px;" />
            <img src="/images/logo-circle2.svg" alt="" class="absolute" style="top: 5px; left: 0; width: 37px; height: 47px;" />
            <img src="/images/logo-circle3.svg" alt="" class="absolute" style="top: 0; left: 33px; width: 49px; height: 36px;" />
          </div>
          <div class="flex flex-col ml-2">
            <span class="text-[#0e888d] font-bold text-xs md:text-sm lg:text-base uppercase leading-[16px]">
              ГП Эко Оператор
            </span>
          </div>
        </div>

        <!-- Footer navigation -->
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

        <!-- Mobile footer navigation -->
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

      <!-- Bottom footer - Contact and Social -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between py-5 lg:py-6 border-t border-gray-100 gap-4 lg:gap-0">
        <!-- Contact info -->
        <div class="grid grid-cols-1 sm:grid-cols-3 lg:flex gap-4 lg:gap-[49px] w-full lg:w-auto">
          <!-- Phone -->
          <div class="flex items-center gap-3">
            <img src="/images/icons/phone.svg" alt="phone" class="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <div class="text-[#415861] text-xs leading-[15px]">
              <p>+996 (312) 54-15-16</p>
              <p>+996 (312) 54-15-17</p>
            </div>
          </div>

          <!-- Working hours -->
          <div class="flex items-center gap-3">
            <img src="/images/icons/clock.svg" alt="clock" class="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <div class="text-[#415861] text-xs leading-[15px]">
              <p>Пн-Пт: 9:00 - 18:00</p>
              <p>Сб-Вс: выходной</p>
            </div>
          </div>

          <!-- Address -->
          <div class="flex items-center gap-3">
            <img src="/images/icons/map-pin.svg" alt="location" class="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <div class="text-[#415861] text-xs leading-[15px]">
              <p>720040, г. Бишкек</p>
              <p>ул. Токтогула, 228</p>
            </div>
          </div>
        </div>

        <!-- Social links -->
        <div class="flex items-center gap-4 lg:gap-[49px] flex-wrap">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.url"
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
