<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'

const route = useRoute()

const { roleTitle, menuItems } = useEcoOperatorMenu()

const pageTitles: Record<string, string> = {
  '/eco-operator/incoming-declarations': 'Входящие декларации',
  '/eco-operator/incoming-reports': 'Отчёты о переработке',
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
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <StubPage :title="pageTitle" />
  </DashboardLayout>
</template>
