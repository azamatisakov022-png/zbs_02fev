<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import IconChevron from '../icons/IconChevron.vue'

const currentLang = ref('РУС')
const languages = ['РУС', 'КЫР', 'ENG']
const mobileMenuOpen = ref(false)

const toggleLang = () => {
  const currentIndex = languages.indexOf(currentLang.value)
  currentLang.value = languages[(currentIndex + 1) % languages.length] ?? 'РУС'
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <header class="bg-white border-b border-gray-200">
    <div class="container-main">
      <!-- Top bar -->
      <div class="flex items-center justify-between py-4 lg:py-5 h-[100px] lg:h-[144px]">
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

        <!-- Contact info - hidden on mobile -->
        <div class="hidden lg:flex items-center gap-[50px]">
          <!-- Phone -->
          <div class="flex items-center gap-3">
            <img src="/images/icons/phone.svg" alt="phone" class="w-6 h-6" />
            <div class="text-[#415861] text-xs leading-[15px]">
              <p>+996 (312) 54-15-16</p>
              <p>+996 (312) 54-15-17</p>
            </div>
          </div>

          <!-- Working hours -->
          <div class="flex items-center gap-3">
            <img src="/images/icons/clock.svg" alt="clock" class="w-6 h-6" />
            <div class="text-[#415861] text-xs leading-[15px]">
              <p>Пн-Пт: 9:00 - 18:00</p>
              <p>Сб-Вс: выходной</p>
            </div>
          </div>

          <!-- Address -->
          <div class="flex items-center gap-3">
            <img src="/images/icons/map-pin.svg" alt="location" class="w-6 h-6" />
            <div class="text-[#415861] text-xs leading-[15px]">
              <p>720040, г. Бишкек</p>
              <p>ул. Токтогула, 228</p>
            </div>
          </div>
        </div>

        <!-- Right side: Language + Auth -->
        <div class="flex items-center gap-2 md:gap-4 lg:gap-[30px]">
          <!-- Language selector -->
          <div class="hidden sm:flex items-center">
            <div class="w-px h-5 bg-gray-300"></div>
            <button
              @click="toggleLang"
              class="flex items-center gap-2 px-4 lg:px-[31px] text-[#415861] text-sm font-medium hover:text-[#0e888d] transition-colors"
            >
              {{ currentLang }}
              <IconChevron class="w-[10px] h-[10px]" />
            </button>
            <div class="w-px h-5 bg-gray-300"></div>
          </div>

          <!-- Auth buttons -->
          <div class="hidden md:flex items-center gap-4 lg:gap-[30px]">
            <!-- QR Code icon -->
            <div class="hidden lg:flex w-[52px] h-[52px] bg-gray-100 rounded-lg items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="10" height="10" stroke="#415861" stroke-width="2" fill="none"/>
                <rect x="18" y="4" width="10" height="10" stroke="#415861" stroke-width="2" fill="none"/>
                <rect x="4" y="18" width="10" height="10" stroke="#415861" stroke-width="2" fill="none"/>
                <rect x="7" y="7" width="4" height="4" fill="#415861"/>
                <rect x="21" y="7" width="4" height="4" fill="#415861"/>
                <rect x="7" y="21" width="4" height="4" fill="#415861"/>
                <rect x="18" y="18" width="3" height="3" fill="#415861"/>
                <rect x="24" y="18" width="4" height="4" fill="#415861"/>
                <rect x="18" y="24" width="4" height="4" fill="#415861"/>
                <rect x="24" y="24" width="4" height="4" fill="#415861"/>
              </svg>
            </div>

            <!-- Registration link -->
            <RouterLink to="/register" class="hidden lg:block text-[#415861] text-sm font-bold uppercase hover:text-[#0e888d] transition-colors">
              регистрация
            </RouterLink>

            <!-- Login button -->
            <RouterLink
              to="/login"
              class="flex items-center gap-3 bg-[#fea629] text-[#415861] font-bold text-sm uppercase px-5 py-[15px] rounded-[30px] hover:bg-[#e5951f] transition-colors"
            >
              войти
              <svg width="21" height="22" viewBox="0 0 21 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 11C13.5376 11 16 8.53756 16 5.5C16 2.46244 13.5376 0 10.5 0C7.46244 0 5 2.46244 5 5.5C5 8.53756 7.46244 11 10.5 11ZM10.5 13.75C6.66313 13.75 0 15.6744 0 19.5V22H21V19.5C21 15.6744 14.3369 13.75 10.5 13.75Z"/>
              </svg>
            </RouterLink>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-[#415861] hover:text-[#0e888d] transition-colors"
          >
            <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-100 py-4">
        <!-- Contact info -->
        <div class="space-y-3 mb-4">
          <div class="flex items-center gap-3">
            <img src="/images/icons/phone.svg" alt="phone" class="w-5 h-5" />
            <span class="text-[#415861] text-sm">+996 (312) 54-15-16</span>
          </div>
          <div class="flex items-center gap-3">
            <img src="/images/icons/clock.svg" alt="clock" class="w-5 h-5" />
            <span class="text-[#415861] text-sm">Пн-Пт: 9:00 - 18:00</span>
          </div>
          <div class="flex items-center gap-3">
            <img src="/images/icons/map-pin.svg" alt="location" class="w-5 h-5" />
            <span class="text-[#415861] text-sm">г. Бишкек, ул. Токтогула, 228</span>
          </div>
        </div>

        <!-- Auth buttons -->
        <div class="flex items-center gap-4 pt-4 border-t border-gray-100">
          <RouterLink to="/register" class="text-[#415861] text-sm font-bold uppercase" @click="mobileMenuOpen = false">регистрация</RouterLink>
          <RouterLink
            to="/login"
            class="flex items-center gap-2 bg-[#fea629] text-[#415861] font-bold text-sm uppercase px-4 py-2.5 rounded-full"
            @click="mobileMenuOpen = false"
          >
            войти
            <svg width="16" height="16" viewBox="0 0 21 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 11C13.5376 11 16 8.53756 16 5.5C16 2.46244 13.5376 0 10.5 0C7.46244 0 5 2.46244 5 5.5C5 8.53756 7.46244 11 10.5 11ZM10.5 13.75C6.66313 13.75 0 15.6744 0 19.5V22H21V19.5C21 15.6744 14.3369 13.75 10.5 13.75Z"/>
            </svg>
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
