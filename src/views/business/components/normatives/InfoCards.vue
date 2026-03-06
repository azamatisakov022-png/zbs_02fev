<script setup lang="ts">
</script>

<template>
  <div class="ic-grid">
    <div class="ic-card ic-card--teal">
      <div class="ic-icon ic-icon--teal">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h4 class="ic-title">{{ $t('businessNorms.infoCard1Title') }}</h4>
      <p class="ic-text">{{ $t('businessNorms.infoCard1Desc') }}</p>
    </div>

    <div class="ic-card ic-card--amber">
      <div class="ic-icon ic-icon--amber">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h4 class="ic-title">{{ $t('businessNorms.infoCard2Title') }}</h4>
      <p class="ic-text">{{ $t('businessNorms.infoCard2Desc') }}</p>
    </div>

    <div class="ic-card ic-card--green">
      <div class="ic-icon ic-icon--green">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h4 class="ic-title">{{ $t('businessNorms.infoCard3Title') }}</h4>
      <p class="ic-text">{{ $t('businessNorms.infoCard3Desc') }}</p>
    </div>
  </div>
</template>

<style scoped>
.ic-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .ic-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.ic-card {
  border-radius: 12px;
  padding: 20px;
}
.ic-card--teal {
  background: linear-gradient(to bottom right, rgba(14, 136, 141, 0.1), rgba(14, 136, 141, 0.05));
  border: 1px solid rgba(14, 136, 141, 0.2);
}
.ic-card--amber {
  background: linear-gradient(to bottom right, #fffbeb, #fef3c7);
  border: 1px solid #fbbf24;
}
.ic-card--green {
  background: linear-gradient(to bottom right, #f0fdf4, #dcfce7);
  border: 1px solid #86efac;
}
.ic-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.ic-icon--teal {
  background-color: #0e888d;
}
.ic-icon--amber {
  background-color: #f59e0b;
}
.ic-icon--green {
  background-color: #22c55e;
}
.ic-title {
  font-size: 22px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}
.ic-text {
  font-size: 21px;
  color: #4b5563;
}
</style>
