<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from './components/layout/TheHeader.vue'
import TheNavigation from './components/layout/TheNavigation.vue'
import TheFooter from './components/layout/TheFooter.vue'
import AppToast from './components/ui/AppToast.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'

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
    <!-- Skip to main content link (a11y) -->
    <a href="#main-content" class="skip-link">
      {{ $t('common.skipToContent') }}
    </a>

    <!-- Public header and navigation - only show on public pages -->
    <template v-if="!isDashboard">
      <TheHeader />
      <TheNavigation />
    </template>

    <main id="main-content" class="flex-1" tabindex="-1">
      <ErrorBoundary>
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </ErrorBoundary>
    </main>

    <!-- Public footer - only show on public pages -->
    <TheFooter v-if="!isDashboard" />

    <!-- Global Toast Notifications -->
    <AppToast />
  </div>
</template>
