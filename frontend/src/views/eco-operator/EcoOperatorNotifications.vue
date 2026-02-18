<script setup lang="ts">
import NotificationsPage from '../shared/NotificationsPage.vue'
import SectionGuide from '../../components/common/SectionGuide.vue'
</script>

<template>
  <NotificationsPage role="eco-operator">
    <SectionGuide
      title="Центр уведомлений"
      description="Уведомления о новых расчётах, декларациях и событиях."
      :actions="['Просмотр новых уведомлений', 'Фильтрация по типу', 'Отметить как прочитанное']"
      storageKey="eco-notifications"
    />
  </NotificationsPage>
</template>
