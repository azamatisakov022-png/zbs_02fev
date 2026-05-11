<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from './components/layout/TheHeader.vue'
import TheNavigation from './components/layout/TheNavigation.vue'
import TheFooter from './components/layout/TheFooter.vue'
import AppToast from './components/ui/AppToast.vue'
import PwaStatus from './components/ui/PwaStatus.vue'

const route = useRoute()

// Check if current route is a dashboard (personal cabinet)
const isDashboard = computed(() => {
  const path = route.path
  return (
    path.startsWith('/admin') ||
    path.startsWith('/employee') ||
    path.startsWith('/business') ||
    path.startsWith('/eco-operator') ||
    path.startsWith('/ministry')
  )
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Public header and navigation - only show on public pages -->
    <template v-if="!isDashboard">
      <TheHeader />
      <TheNavigation />
    </template>

    <main class="flex-1">
      <router-view v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <!--
            :key="route.fullPath" - Vue пересоздаёт компонент при каждой смене маршрута
            (в т.ч. при возврате на уже посещённую страницу). Это лечит «пустая страница
            при повторном заходе» в разделах с Leaflet-картами (Полигоны ТБО, Пункты приёма,
            ГИС-карта): vue-leaflet иногда держит битые ссылки на DOM при re-mount без key.
          -->
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </router-view>
    </main>

    <!-- Public footer - only show on public pages -->
    <TheFooter v-if="!isDashboard" />

    <!-- Global Toast Notifications -->
    <AppToast />

    <!-- PWA Status (offline banner, update notification) -->
    <PwaStatus />
  </div>
</template>
