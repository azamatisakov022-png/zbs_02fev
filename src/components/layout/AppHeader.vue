

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { SELECTED_LOCAL_STORAGE_KEY } from '@/constants/keys'
import Select from '@/components/ui/general/Select.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)

const langOptions = [
  { value: 'kg', label: 'КЫР' },
  { value: 'ru', label: 'РУС' },
]

watch(locale, (newLocale) => {
  localStorage.setItem(SELECTED_LOCAL_STORAGE_KEY, newLocale)
})

const navItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.about'), path: '/about' },
  { label: t('nav.legislation'), path: '/legislation' },
  { label: t('nav.licenses'), path: '/licenses' },
  { label: t('nav.publications'), path: '/publications' },
  { label: t('nav.registries'), path: '/registries' },
  { label: t('nav.calculator'), path: '/calculator' },
  { label: t('nav.contests'), path: '/contests' },
  { label: t('nav.receptionPoints'), path: '/reception-points' },
])

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const toggleMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMenu = () => {
  mobileMenuOpen.value = false
}

router.afterEach(() => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <header class="header-wrapper container-main">
    <div>
      <div class="header-top-row">
        <router-link to="/">
          <img src="@/assets/images/icons/logo.svg" alt="logo" class="header-logo" />
        </router-link>

        <div class="header-info-group">
         <div class="header-info-contact">
           <div class="header-contact-item">
            <img src="@/assets/images/icons/phone.svg" alt="phone" class="w-6 h-6 shrink-0" />
            <p class="contact-text">
              {{ $t('header.phone1') }}<br />{{ $t('header.phone2') }}
            </p>
          </div>

          <div class="header-contact-item">
            <img src="@/assets/images/icons/clock.svg" alt="clock" class="w-6 h-6 shrink-0" />
            <p class="contact-text">
              {{ $t('header.workHours') }}<br />{{ $t('header.weekendClosed') }}
            </p>
          </div>

          <div class="header-contact-item">
            <img src="@/assets/images/icons/map-pin.svg" alt="map" class="w-6 h-6 shrink-0" />
            <p class="contact-text">
              {{ $t('header.zip') }}, {{ $t('header.city') }}<br />{{ $t('header.street') }}
            </p>
          </div>
         </div>
          <div class="header-actions-subgroup">
            <div class="divider-v" />
            <Select
              v-model="locale"
              :options="langOptions"
              class="lang-select"
              :background="false"
            />
            <div class="divider-v" />
          </div>

           <div class="header-actions-subgroup">
            <img src="../../assets/images/icons/search-header.svg" alt="search" class="w-[52px] h-[52px] shrink-0" />
            <div class="header-actions-register">
              <router-link to="/register" class="link-register">
                {{ $t('header.register') }}
              </router-link>
              <router-link to="/login" class="btn-login">
                <span>{{ $t('header.login') }}</span>
                <img src="../../assets/images/icons/circle-right-arrow.svg" alt="arrow right" class="w-[21px] h-[22px] shrink-0" />
              </router-link>
            </div>
          </div>
        </div>

        <!-- Mobile: lang + burger -->
        <div class="mobile-header-actions">
          <Select
            v-model="locale"
            :options="langOptions"
            class="lang-select"
          />
          <button class="burger-btn" @click="toggleMenu" aria-label="Menu">
            <span :class="['burger-line', { 'is-open': mobileMenuOpen }]"></span>
            <span :class="['burger-line', { 'is-open': mobileMenuOpen }]"></span>
            <span :class="['burger-line', { 'is-open': mobileMenuOpen }]"></span>
          </button>
        </div>
      </div>
    </div>

    <div class="divider-h" />

    <!-- Desktop nav -->
    <div class="desktop-nav">
      <nav class="nav-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'nav-link',
            isActive(item.path) ? 'active' : ''
          ]"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>

    <!-- Mobile menu overlay -->
    <Transition name="menu-fade">
      <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click="closeMenu" />
    </Transition>

    <!-- Mobile menu -->
    <Transition name="menu-slide">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <button class="mobile-menu-close" @click="closeMenu" aria-label="Close menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <nav class="mobile-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="['mobile-nav-link', isActive(item.path) ? 'active' : '']"
            @click="closeMenu"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <div class="mobile-menu-divider" />

        <div class="mobile-menu-contacts">
          <div class="header-contact-item">
            <img src="@/assets/images/icons/phone.svg" alt="phone" class="w-5 h-5 shrink-0" />
            <p class="contact-text">{{ $t('header.phone1') }}</p>
          </div>
          <div class="header-contact-item">
            <img src="@/assets/images/icons/clock.svg" alt="clock" class="w-5 h-5 shrink-0" />
            <p class="contact-text">{{ $t('header.workHours') }}</p>
          </div>
          <div class="header-contact-item">
            <img src="@/assets/images/icons/map-pin.svg" alt="map" class="w-5 h-5 shrink-0" />
            <p class="contact-text">{{ $t('header.city') }}, {{ $t('header.street') }}</p>
          </div>
        </div>

        <div class="mobile-menu-actions">
          <router-link to="/register" class="link-register" @click="closeMenu">
            {{ $t('header.register') }}
          </router-link>
          <router-link to="/login" class="btn-login" @click="closeMenu">
            <span>{{ $t('header.login') }}</span>
            <img src="../../assets/images/icons/circle-right-arrow.svg" alt="arrow right" class="w-[21px] h-[22px] shrink-0" />
          </router-link>
        </div>
      </div>
    </Transition>
  </header>
</template>


<style scoped src="@/assets/styles/views/header.css"></style>
