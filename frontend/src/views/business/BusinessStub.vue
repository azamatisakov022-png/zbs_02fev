<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { icons } from '../../utils/menuIcons'

const route = useRoute()

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'reports', label: 'Отчёты', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы переработки', icon: icons.registries, route: '/business/normatives' },
  { id: 'recyclers', label: 'Переработчики отходов', icon: icons.recycle, route: '/business/recyclers' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

const pageTitles: Record<string, string> = {
  '/business/payments': 'Платежи',
  '/business/documents': 'Документы',
  '/business/normatives': 'Нормативы переработки',
  '/business/recyclers': 'Переработчики отходов',
  '/business/profile': 'Профиль компании',
}

const pageTitle = computed(() => pageTitles[route.path] || 'Страница')
</script>

<template>
  <DashboardLayout
    role="business"
    roleTitle="Бизнес"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <StubPage :title="pageTitle" />
  </DashboardLayout>
</template>
