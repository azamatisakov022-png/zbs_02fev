<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { icons } from '../../utils/menuIcons'

const route = useRoute()

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/admin' },
  { id: 'users', label: 'Пользователи', icon: icons.users, route: '/admin/users' },
  { id: 'roles', label: 'Роли и права', icon: icons.shield, route: '/admin/roles' },
  { id: 'references', label: 'Справочники', icon: icons.registries, route: '/admin/references' },
  { id: 'audit', label: 'Журнал аудита', icon: icons.audit, route: '/admin/audit' },
  { id: 'notifications', label: 'Уведомления', icon: icons.notification, route: '/admin/notifications' },
  { id: 'settings', label: 'Настройки системы', icon: icons.settings, route: '/admin/settings' },
]

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
    roleTitle="Администратор"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <StubPage :title="pageTitle" />
  </DashboardLayout>
</template>
