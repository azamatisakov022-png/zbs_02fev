<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useAccountStore } from '../../stores/account'
import { useProductGroupStore } from '../../stores/product-groups'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { AppTabs, AppPageHeader } from '../../components/ui'
import NormsTable from './components/normatives/NormsTable.vue'
import RatesTab from './components/normatives/RatesTab.vue'
import CalculationExample from './components/normatives/CalculationExample.vue'
import InfoCards from './components/normatives/InfoCards.vue'

const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()
const productGroupStore = useProductGroupStore()

onMounted(() => {
  accountStore.fetchAll()
  productGroupStore.fetchAllGroupsWithNorms()
})

const currentYear = new Date().getFullYear()
const activeTab = ref<'norms' | 'rates'>('norms')

const tabItems = computed(() => [
  { key: 'norms', label: t('businessNorms.tabNorms') },
  { key: 'rates', label: t('businessNorms.tabRates') },
])
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="accountStore.myAccount?.company || ''"
    :menuItems="menuItems"
  >
    <div class="bn-page">
      <AppPageHeader :title="$t('businessNorms.pageTitle')" :subtitle="$t('businessNorms.pageSubtitle')" subtitleSize="22px" subtitleColor="#4b5563" titleColor="#111827" />

      <div class="bn-banner">
        <div class="bn-banner-inner">
          <div class="bn-banner-icon">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 class="bn-banner-title">{{ $t('businessNorms.bannerTitle', { year: currentYear }) }}</h2>
            <p class="bn-banner-desc">{{ $t('businessNorms.bannerDesc') }}</p>
            <div class="bn-banner-links">
              <router-link to="/legislation" class="bn-link-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {{ $t('businessNorms.legislation') }}
              </router-link>
              <router-link to="/business/calculator" class="bn-link-secondary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {{ $t('businessNorms.calculateFee') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <AppTabs v-model="activeTab" :tabs="tabItems" activeBg="#0e888d" />

      <div v-if="productGroupStore.loading" class="bn-loading">
        {{ $t('common.loading', 'Загрузка...') }}
      </div>

      <NormsTable
        v-if="activeTab === 'norms' && !productGroupStore.loading"
        :norms="productGroupStore.normsTableData"
        :years="productGroupStore.normYears"
        :currentYear="currentYear"
      />

      <RatesTab
        v-if="activeTab === 'rates' && !productGroupStore.loading"
        :feeRateGroups="productGroupStore.feeRateGroups"
      />

      <template v-if="activeTab === 'norms'">
        <CalculationExample />
      </template>

      <InfoCards />
    </div>
  </DashboardLayout>
</template>

<style scoped>
.bn-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.bn-banner {
  background: linear-gradient(to right, #0e888d, #0b6d71);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
}
.bn-banner-inner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.bn-banner-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bn-banner-title {
  font-size: 26px;
  font-weight: 700;
}
.bn-banner-desc {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
  max-width: 42rem;
}
.bn-banner-links {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}
.bn-link-primary {
  font-size: 21px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  background: #fff;
  color: #0e888d;
  transition: background-color 0.15s;
}
.bn-link-primary:hover {
  background: #f3f4f6;
}
.bn-link-secondary {
  font-size: 21px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.15s;
}
.bn-link-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}
.bn-loading {
  text-align: center;
  padding: 48px;
  font-size: 20px;
  color: #6b7280;
}
</style>
