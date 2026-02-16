<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { icons } from '../../utils/menuIcons'

const route = useRoute()

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'account', label: 'Лицевой счёт', icon: icons.money, route: '/business/account' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'reports', label: 'Отчёты о переработке', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы и ставки', icon: icons.registries, route: '/business/normatives' },
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
    roleTitle="Плательщик"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <StubPage :title="pageTitle" />
  </DashboardLayout>
</template>
