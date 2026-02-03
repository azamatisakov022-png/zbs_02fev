<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { icons } from '../../utils/menuIcons'

const route = useRoute()

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/employee' },
  { id: 'applications', label: 'Входящие заявки', icon: icons.inbox, route: '/employee/applications' },
  { id: 'organizations', label: 'Организации', icon: icons.building, route: '/employee/organizations' },
  { id: 'licenses', label: 'Лицензии', icon: icons.license, route: '/employee/licenses' },
  { id: 'reports', label: 'Отчётность', icon: icons.report, route: '/employee/reports' },
  { id: 'map', label: 'ГИС-карта', icon: icons.map, route: '/employee/map' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/employee/analytics' },
  { id: 'profile', label: 'Мой профиль', icon: icons.profile, route: '/employee/profile' },
]

const pageTitles: Record<string, string> = {
  '/employee/organizations': 'Организации',
  '/employee/licenses': 'Лицензии',
  '/employee/map': 'ГИС-карта',
  '/employee/analytics': 'Аналитика',
  '/employee/profile': 'Мой профиль',
}

const pageTitle = computed(() => pageTitles[route.path] || 'Страница')
</script>

<template>
  <DashboardLayout
    role="employee"
    roleTitle="Сотрудник МПРЭТН"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <StubPage :title="pageTitle" />
  </DashboardLayout>
</template>
