<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()

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
    <AppHeader v-if="!isDashboard" />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter v-if="!isDashboard" />
  </div>
</template>
