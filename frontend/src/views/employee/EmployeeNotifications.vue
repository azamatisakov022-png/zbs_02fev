<script setup lang="ts">
import NotificationsPage from '../shared/NotificationsPage.vue'
import SectionGuide from '../../components/common/SectionGuide.vue'
</script>

<template>
  <NotificationsPage role="employee">
    <SectionGuide
      title="Центр уведомлений"
      description="Все системные уведомления о событиях и изменениях в реестрах."
      :actions="['Просмотр новых уведомлений', 'Фильтрация по типу', 'Отметить как прочитанное']"
      storageKey="employee-notifications"
    />
  </NotificationsPage>
</template>
