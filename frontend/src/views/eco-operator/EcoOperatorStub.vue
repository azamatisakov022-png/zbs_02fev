<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { icons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { refundStore } from '../../stores/refunds'
import { reportStore } from '../../stores/reports'

const route = useRoute()

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-calculations', label: 'Входящие расчёты', icon: icons.calculator, route: '/eco-operator/calculations', badge: calculationStore.getCalcReviewCount() },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
  { id: 'refunds', label: 'Заявки на возврат', icon: icons.refund, route: '/eco-operator/refunds', badge: refundStore.getPendingRefundsCount() },
  { id: 'accounts', label: 'Лицевые счета', icon: icons.money, route: '/eco-operator/accounts' },
  { id: 'analytics', label: 'Аналитика и отчёты', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
  { id: 'recyclers-registry', label: 'Реестр переработчиков', icon: icons.recycle, route: '/eco-operator/recyclers' },
])

const pageTitles: Record<string, string> = {
  '/eco-operator/incoming-declarations': 'Входящие декларации',
  '/eco-operator/incoming-reports': 'Входящие отчёты',
  '/eco-operator/licenses': 'Лицензии и документы',
  '/eco-operator/waste-types': 'Виды отходов',
  '/eco-operator/my-reports': 'Мои отчёты',
  '/eco-operator/profile': 'Профиль компании',
}

const pageTitle = computed(() => pageTitles[route.path] || 'Страница')
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="ГП «Эко Оператор»"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <StubPage :title="pageTitle" />
  </DashboardLayout>
</template>
