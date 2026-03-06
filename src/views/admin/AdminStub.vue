<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StubPage from '../../components/dashboard/StubPage.vue'
import { useAdminMenu } from '../../composables/useRoleMenu'

const route = useRoute()
const { roleTitle, menuItems } = useAdminMenu()
const { t } = useI18n()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin/organizations': t('adminStub.organizations'),
    '/admin/declarations': t('adminStub.allDeclarations'),
    '/admin/reports': t('adminStub.allReports'),
    '/admin/registries': t('adminStub.registries'),
    '/admin/calculations': t('adminStub.calcSettings'),
    '/admin/analytics': t('adminStub.analytics'),
    '/admin/audit': t('adminStub.auditLog'),
    '/admin/settings': t('adminStub.systemSettings'),
    '/admin/support': t('adminStub.support'),
  }
  return titles[route.path] || t('adminStub.page')
})
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
