<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'

const route = useRoute()
const { t } = useI18n()

const { roleTitle, menuItems } = useEcoOperatorMenu()

const pageTitleKeys: Record<string, string> = {
  '/eco-operator/incoming-declarations': 'pages.ecoOperator.incomingDeclarationsTitle',
  '/eco-operator/incoming-reports': 'pages.ecoOperator.incomingReportsTitle',
  '/eco-operator/licenses': 'pages.ecoOperator.licensesTitle',
  '/eco-operator/waste-types': 'pages.ecoOperator.wasteTypesTitle',
  '/eco-operator/my-reports': 'pages.ecoOperator.myReportsTitle',
  '/eco-operator/profile': 'pages.ecoOperator.profileTitle',
}

const pageTitle = computed(() => {
  const key = pageTitleKeys[route.path]
  return key ? t(key) : t('common.page')
})
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
