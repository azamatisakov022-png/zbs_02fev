<script setup lang="ts">
import HeroSection from '@/components/sections/HeroSection.vue'
import DirectionsSection from '@/components/sections/DirectionsSection.vue'
import EconomicSection from '@/components/sections/EconomicSection.vue'
import ProducerObligationsSection from '@/components/sections/ProducerObligationsSection.vue'
import MissionSection from '@/components/sections/MissionSection.vue'
import CTASection from '@/components/sections/CTASection.vue'
</script>

<template>
  <div class="container-main home-page-wrapper">
    <HeroSection />
    <DirectionsSection />
    <EconomicSection />
    <ProducerObligationsSection />
    <MissionSection />
    <CTASection />
  </div>
</template>

<style src="@/assets/styles/views/home.css"></style>

<style scoped>
.home-page-wrapper {
  @apply mt-7.5 mb-[160px];
}

@media (max-width: 1024px) {
  .home-page-wrapper {
    @apply mb-25;
  }
}

@media (max-width: 768px) {
  .home-page-wrapper {
    margin-top: 8px;
    margin-bottom: 40px;
  }
}
</style>
