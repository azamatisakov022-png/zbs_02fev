<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const id = route.params.id
  router.replace(`/business/calculations/${id}`)
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <p class="text-gray-500">Перенаправление...</p>
  </div>
</template>
