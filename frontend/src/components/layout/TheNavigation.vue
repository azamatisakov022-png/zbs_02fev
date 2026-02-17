<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

interface NavItem {
  name: string
  path: string
  label: string
}

const route = useRoute()
const mobileNavOpen = ref(false)

const navItems: NavItem[] = [
  { name: 'home', path: '/', label: 'Главная' },
  { name: 'about', path: '/about', label: 'О портале' },
  { name: 'legislation', path: '/legislation', label: 'Законодательство' },
  { name: 'licenses', path: '/licenses', label: 'Лицензии' },
  { name: 'publications', path: '/publications', label: 'Публикации' },
  { name: 'gis-map', path: '/registries', label: 'ГИС-Карта' },
  { name: 'calculator', path: '/calculator', label: 'Калькулятор РОП' },
  { name: 'contests', path: '/contests', label: 'Конкурсы' },
]

const isActive = (path: string) => {
  return route.path === path
}

const closeNav = () => {
  mobileNavOpen.value = false
}
</script>

<template>
  <nav class="bg-white border-b border-gray-100">
    <div class="container-main">
      <!-- Desktop navigation -->
      <ul class="hidden lg:flex items-center justify-between py-5">
        <li v-for="item in navItems" :key="item.name">
          <router-link
            :to="item.path"
            :class="[
              'text-base leading-normal font-medium uppercase transition-colors duration-200',
              isActive(item.path)
                ? 'text-[#0e888d]'
                : 'text-[#415861] hover:text-[#0e888d]'
            ]"
          >
            {{ item.label }}
          </router-link>
        </li>
      </ul>

      <!-- Mobile navigation toggle -->
      <div class="lg:hidden py-3">
        <button
          @click="mobileNavOpen = !mobileNavOpen"
          class="flex items-center justify-between w-full text-[#415861]"
        >
          <span class="font-medium">Меню</span>
          <svg
            :class="['w-5 h-5 transition-transform', mobileNavOpen ? 'rotate-180' : '']"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Mobile menu dropdown -->
        <ul v-if="mobileNavOpen" class="mt-3 space-y-1 border-t border-gray-100 pt-3">
          <li v-for="item in navItems" :key="item.name">
            <router-link
              :to="item.path"
              @click="closeNav"
              :class="[
                'block py-2 text-sm leading-normal font-medium uppercase transition-colors duration-200',
                isActive(item.path)
                  ? 'text-[#0e888d]'
                  : 'text-[#415861] hover:text-[#0e888d]'
              ]"
            >
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
