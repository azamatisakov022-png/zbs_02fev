<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'

const route = useRoute()

const { roleTitle, menuItems } = useEmployeeMenu()

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
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <StubPage :title="pageTitle" />
  </DashboardLayout>
</template>
