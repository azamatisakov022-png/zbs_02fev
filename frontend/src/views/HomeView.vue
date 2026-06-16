<script setup lang="ts">
import HeroSection from '../components/sections/HeroSection.vue'
import FeaturesSection from '../components/sections/FeaturesSection.vue'
import EconomicsSection from '../components/sections/EconomicsSection.vue'
import ROPSection from '../components/sections/ROPSection.vue'
import StrategySection from '../components/sections/StrategySection.vue'
import WasteLifetimePromoSection from '../components/sections/WasteLifetimePromoSection.vue'
import DocumentsSection from '../components/sections/DocumentsSection.vue'
import FAQSection from '../components/sections/FAQSection.vue'
import CTASection from '../components/sections/CTASection.vue'
</script>

<template>
  <div>
    <HeroSection />
    <FeaturesSection v-reveal />
    <EconomicsSection v-reveal />
    <ROPSection v-reveal />
    <StrategySection v-reveal />
    <WasteLifetimePromoSection v-reveal />
    <DocumentsSection v-reveal />
    <FAQSection v-reveal />
    <CTASection v-reveal />
  </div>
</template>
