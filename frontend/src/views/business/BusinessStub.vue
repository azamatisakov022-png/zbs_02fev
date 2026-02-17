<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { useBusinessMenu } from '../../composables/useRoleMenu'

const route = useRoute()
const { roleTitle, menuItems } = useBusinessMenu()

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
    :roleTitle="roleTitle"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <StubPage :title="pageTitle" />
  </DashboardLayout>
</template>
