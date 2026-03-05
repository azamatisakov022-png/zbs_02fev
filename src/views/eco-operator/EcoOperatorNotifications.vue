<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import NotificationsPage from '../shared/NotificationsPage.vue'
import SectionGuide from '../../components/common/SectionGuide.vue'

const { t } = useI18n()
</script>

<template>
  <NotificationsPage role="eco-operator">
    <SectionGuide
      :title="$t('ecoNotifications.guideTitle')"
      :description="$t('ecoNotifications.guideDescription')"
      :actions="[$t('ecoNotifications.actionViewNew'), $t('ecoNotifications.actionFilterByType'), $t('ecoNotifications.actionMarkRead')]"
      storageKey="eco-notifications"
    />
  </NotificationsPage>
</template>
