<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getLocale, setLocale } from '../../i18n'
import NotificationBell from './NotificationBell.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'

interface MenuItem {
  id: string
  label: string
  icon: string
  route: string
  badge?: number
}

interface Props {
  role: 'admin' | 'employee' | 'business' | 'eco-operator'
  roleTitle: string
  userName: string
  menuItems: MenuItem[]
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const sidebarOpen = ref(false)
const currentLocale = computed(() => getLocale())

const switchLocale = (locale: 'ru' | 'ky') => {
  setLocale(locale)
}

const currentRoute = computed(() => route.path)

const isActive = (itemRoute: string) => {
  if (itemRoute === '/admin' || itemRoute === '/employee' || itemRoute === '/business' || itemRoute === '/eco-operator') {
    return currentRoute.value === itemRoute
  }
  return currentRoute.value === itemRoute || currentRoute.value.startsWith(itemRoute + '/')
}

const navigateTo = (itemRoute: string) => {
  router.push(itemRoute)
  sidebarOpen.value = false
}

const handleLogout = () => {
  router.push('/login')
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const basePaths: Record<string, string> = {
  admin: '/admin',
  employee: '/employee',
  business: '/business',
  'eco-operator': '/eco-operator',
}

const breadcrumbs = computed(() => {
  const basePath = basePaths[props.role] || '/'
  if (route.path === basePath) return []
  const label = route.meta.breadcrumbLabel as string | undefined
  if (!label) return []
  return [
    { label: t('breadcrumb.home'), path: basePath },
    { label },
  ]
})
</script>

<template>
  <div class="dashboard-layout min-h-screen bg-[#F8FAFC]">
    <!-- Skip to content link -->
    <a href="#main-content" class="skip-link">{{ t('common.skipToContent') }}</a>

    <!-- Mobile Header -->
    <header
      class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-50 flex items-center justify-between px-4"
      style="box-shadow: var(--shadow-sm); border-bottom: 1px solid rgba(0,0,0,0.06)"
      role="banner"
    >
      <button
        @click="toggleSidebar"
        class="p-2 text-[#4B5563] hover:bg-[#f1f5f9] rounded-lg transition-colors"
        :aria-label="t('common.openMenu')"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="font-semibold text-[#111827]">{{ roleTitle }}</span>
      <div class="flex items-center gap-1">
        <NotificationBell :role="role" />
        <button
          @click="handleLogout"
          class="p-2 text-[#4B5563] hover:bg-[#f1f5f9] rounded-lg transition-colors"
          :aria-label="t('common.logoutSystem')"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Sidebar Overlay -->
    <div
      v-if="sidebarOpen"
      class="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
      @click="sidebarOpen = false"
      aria-hidden="true"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300',
        'lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      style="box-shadow: 4px 0 6px rgba(0,0,0,0.04), 2px 0 4px rgba(0,0,0,0.03)"
      role="navigation"
      :aria-label="t('common.mainNav')"
    >
      <!-- Logo -->
      <div class="h-20 flex items-center px-6" style="border-bottom: 1px solid rgba(0,0,0,0.06)">
        <router-link to="/" class="flex items-center gap-2">
          <img src="/images/logo-eco.png" alt="ГП Эко Оператор" style="height: 44px; width: 44px; object-fit: cover; object-position: left;" />
          <div class="flex flex-col whitespace-nowrap">
            <span class="text-[14px] font-bold text-[#065f46] uppercase" style="letter-spacing: 0.5px">ГП Эко Оператор</span>
            <span class="text-[11px] font-normal text-[#6b7280]">Государственное предприятие</span>
          </div>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="p-3 space-y-0.5 overflow-y-auto h-[calc(100%-5rem-4rem)]" :aria-label="t('common.menu')">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="navigateTo(item.route)"
          :class="[
            'nav-item w-full flex items-center gap-3 px-4 py-3 text-left transition-all',
            isActive(item.route)
              ? 'nav-item-active bg-[rgba(45,139,78,0.12)] text-[#2D8B4E] font-semibold border-l-[3px] border-[#2D8B4E]'
              : 'text-[#4B5563] hover:bg-[rgba(45,139,78,0.06)] hover:text-[#2D8B4E] border-l-[3px] border-transparent'
          ]"
          style="border-radius: var(--radius-sm)"
          :aria-current="isActive(item.route) ? 'page' : undefined"
        >
          <span class="nav-icon w-6 h-6 flex items-center justify-center transition-transform" v-html="item.icon" aria-hidden="true"></span>
          <span class="text-[15px]">{{ item.label }}</span>
          <span
            v-if="item.badge && item.badge > 0"
            class="badge badge-danger ml-auto text-[10px] px-1.5 py-0.5"
            :aria-label="`${item.badge} новых`"
          >{{ item.badge }}</span>
        </button>
      </nav>

      <!-- User section -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-white" style="border-top: 1px solid rgba(0,0,0,0.06)">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#ecfdf5] flex items-center justify-center">
            <svg class="w-5 h-5 text-[#2D8B4E]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[#111827] truncate">{{ userName }}</p>
            <p class="text-xs text-[#6B7280]">{{ roleTitle }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="lg:ml-72 min-h-screen">
      <!-- Desktop Header -->
      <header
        class="hidden lg:flex h-20 bg-white items-center justify-between px-8"
        style="box-shadow: var(--shadow-sm); border-bottom: 1px solid rgba(0,0,0,0.06)"
        role="banner"
      >
        <h1 class="text-xl font-bold text-[#111827] tracking-tight">{{ roleTitle }}</h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1 text-sm">
            <button
              @click="switchLocale('ru')"
              :class="['px-1.5 py-0.5 rounded transition-colors', currentLocale === 'ru' ? 'font-bold text-[#2D8B4E]' : 'text-[#94a3b8] hover:text-[#4B5563]']"
            >RU</button>
            <span class="text-[#cbd5e1]">|</span>
            <button
              @click="switchLocale('ky')"
              :class="['px-1.5 py-0.5 rounded transition-colors', currentLocale === 'ky' ? 'font-bold text-[#2D8B4E]' : 'text-[#94a3b8] hover:text-[#4B5563]']"
            >KY</button>
          </div>
          <span class="text-[#4B5563] font-medium">{{ userName }}</span>
          <NotificationBell :role="role" />
          <button
            @click="handleLogout"
            class="btn-action btn-action-ghost text-sm"
            :aria-label="t('common.logoutSystem')"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ t('common.logout') }}
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div id="main-content" class="p-4 lg:p-8 pt-20 lg:pt-8" role="main">
        <BreadcrumbNav :items="breadcrumbs" />
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
.nav-item {
  transition: all var(--transition-fast);
}
.nav-item:hover .nav-icon {
  transform: scale(1.1);
}
.nav-item:not(.nav-item-active):hover {
  transform: translateX(4px);
}
</style>
