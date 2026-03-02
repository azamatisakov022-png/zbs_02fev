<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import NotificationsPage from '../shared/NotificationsPage.vue'
import SectionGuide from '../../components/common/SectionGuide.vue'

const { t } = useI18n()
</script>

<template>
  <NotificationsPage role="employee">
    <SectionGuide
      :title="$t('employeeNotifications.guideTitle')"
      :description="$t('employeeNotifications.guideDescription')"
      :actions="[$t('employeeNotifications.guideAction1'), $t('employeeNotifications.guideAction2'), $t('employeeNotifications.guideAction3')]"
      storageKey="employee-notifications"
    />
  </NotificationsPage>
</template>
