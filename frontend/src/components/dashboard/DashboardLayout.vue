<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface MenuItem {
  id: string
  label: string
  icon: string
  route: string
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

const sidebarOpen = ref(false)

const currentRoute = computed(() => route.path)

const isActive = (itemRoute: string) => {
  // Exact match for dashboard/home routes
  if (itemRoute === '/admin' || itemRoute === '/employee' || itemRoute === '/business' || itemRoute === '/eco-operator') {
    return currentRoute.value === itemRoute
  }
  // For other routes, check exact match or child routes
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
</script>

<template>
  <div class="dashboard-layout min-h-screen bg-[#f1f5f9]">
    <!-- Mobile Header -->
    <header class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e5e7eb] z-50 flex items-center justify-between px-4">
      <button @click="toggleSidebar" class="p-2 text-[#415861] hover:bg-[#f1f5f9] rounded-lg">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="font-semibold text-[#415861]">{{ roleTitle }}</span>
      <button @click="handleLogout" class="p-2 text-[#415861] hover:bg-[#f1f5f9] rounded-lg">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </header>

    <!-- Sidebar Overlay (mobile) -->
    <div
      v-if="sidebarOpen"
      class="lg:hidden fixed inset-0 bg-black/50 z-40"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full w-72 bg-white border-r border-[#e5e7eb] z-50 transform transition-transform duration-300',
        'lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Logo -->
      <div class="h-20 flex items-center px-6 border-b border-[#e5e7eb]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#0e888d] flex items-center justify-center">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-[#0e888d] font-bold text-sm leading-tight">Цифровой реестр</span>
            <span class="text-[#70868f] text-xs">отходов МПРЭТН</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1 overflow-y-auto h-[calc(100%-5rem-4rem)]">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="navigateTo(item.route)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
            isActive(item.route)
              ? 'bg-[#0e888d] text-white shadow-md'
              : 'text-[#415861] hover:bg-[#f1f5f9]'
          ]"
        >
          <span class="w-6 h-6 flex items-center justify-center" v-html="item.icon"></span>
          <span class="font-medium text-[15px]">{{ item.label }}</span>
        </button>
      </nav>

      <!-- User section -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-[#e5e7eb] bg-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#e8f5f5] flex items-center justify-center">
            <svg class="w-5 h-5 text-[#0e888d]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[#415861] truncate">{{ userName }}</p>
            <p class="text-xs text-[#70868f]">{{ roleTitle }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="lg:ml-72 min-h-screen">
      <!-- Desktop Header -->
      <header class="hidden lg:flex h-20 bg-white border-b border-[#e5e7eb] items-center justify-between px-8">
        <h1 class="text-xl font-bold text-[#415861]">{{ roleTitle }}</h1>
        <div class="flex items-center gap-4">
          <span class="text-[#415861] font-medium">{{ userName }}</span>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Выйти
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-4 lg:p-8 pt-20 lg:pt-8">
        <slot></slot>
      </div>
    </main>
  </div>
</template>
