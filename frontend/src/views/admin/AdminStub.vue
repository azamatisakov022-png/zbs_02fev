<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { useAdminMenu } from '../../composables/useRoleMenu'

const route = useRoute()
const { roleTitle, menuItems } = useAdminMenu()

const pageTitles: Record<string, string> = {
  '/admin/organizations': 'Организации',
  '/admin/declarations': 'Все декларации',
  '/admin/reports': 'Все отчёты',
  '/admin/registries': 'Реестры и справочники',
  '/admin/calculations': 'Настройки расчётов',
  '/admin/analytics': 'Аналитика',
  '/admin/audit': 'Журнал действий',
  '/admin/settings': 'Настройки системы',
  '/admin/support': 'Обращения пользователей',
}

const pageTitle = computed(() => pageTitles[route.path] || 'Страница')
</script>

<template>
  <DashboardLayout
    role="admin"
    :roleTitle="roleTitle"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <StubPage :title="pageTitle" />
  </DashboardLayout>
</template>
