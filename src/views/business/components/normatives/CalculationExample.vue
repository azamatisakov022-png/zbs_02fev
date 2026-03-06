<script setup lang="ts">
</script>

<template>
  <div class="ce-card">
    <div class="ce-header">
      <div class="ce-header-inner">
        <div class="ce-icon-box">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 class="ce-title">{{ $t('businessNorms.exampleTitle') }}</h3>
          <p class="ce-subtitle">{{ $t('businessNorms.exampleSubtitle') }}</p>
        </div>
      </div>
    </div>
    <div class="ce-body">
      <div class="ce-grid">
        <div class="ce-data-section">
          <h4 class="ce-data-title">{{ $t('businessNorms.initialData') }}:</h4>
          <div class="ce-data-row">
            <span class="ce-data-label">{{ $t('businessNorms.category') }}:</span>
            <span class="ce-data-value">{{ $t('businessNorms.exCategory') }}</span>
          </div>
          <div class="ce-data-row">
            <span class="ce-data-label">{{ $t('businessNorms.batchMass') }}:</span>
            <span class="ce-data-value">{{ $t('businessNorms.exMass') }}</span>
          </div>
          <div class="ce-data-row">
            <span class="ce-data-label">{{ $t('businessNorms.calcYear') }}:</span>
            <span class="ce-data-value">2026</span>
          </div>
          <div class="ce-data-row">
            <span class="ce-data-label">{{ $t('businessNorms.operation') }}:</span>
            <span class="ce-data-value">{{ $t('businessNorms.importOp') }}</span>
          </div>
          <div class="ce-data-row">
            <span class="ce-data-label">{{ $t('businessNorms.rateLabel') }} (С<sub>ус</sub>):</span>
            <span class="ce-data-value">{{ $t('businessNorms.exRate') }}</span>
          </div>
          <div class="ce-data-row">
            <span class="ce-data-label">{{ $t('businessNorms.recyclingNorm') }} (2026):</span>
            <span class="ce-data-value ce-accent-text">30%</span>
          </div>
          <div class="ce-data-row ce-data-row--last">
            <span class="ce-data-label">{{ $t('businessNorms.coefficient') }} (Н<sub>пер</sub>):</span>
            <span class="ce-data-value">1 − 0,30 = <strong>0,70</strong></span>
          </div>
        </div>
        <div class="ce-calc-section">
          <h4 class="ce-data-title">{{ $t('businessNorms.calculation') }}:</h4>
          <div class="ce-calc-steps">
            <div class="ce-formula-block">
              <p class="ce-formula-label">{{ $t('businessNorms.formula') }}:</p>
              <p class="ce-formula-text">У<sub>сб</sub> = С<sub>ус</sub> × М × Н<sub>пер</sub></p>
            </div>
            <div class="ce-substitute-block">
              <p class="ce-formula-label">{{ $t('businessNorms.substituteValues') }}:</p>
              <p class="ce-formula-value">У<sub>сб</sub> = 12 345 × 5 × 0,70</p>
            </div>
            <div class="ce-result-block">
              <p class="ce-result-label">{{ $t('businessNorms.totalToPay') }}:</p>
              <p class="ce-result-value">43 207,50 {{ $t('businessNorms.som') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="ce-note">
    <div class="ce-note-icon">
      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <p class="ce-note-title">{{ $t('businessNorms.nperFormulaTitle') }}</p>
      <p class="ce-note-text">
        {{ $t('businessNorms.nperFormulaDesc') }}
        <br/>
        <span class="ce-note-hint">{{ $t('businessNorms.nperExample') }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.ce-card {
  background: linear-gradient(to bottom right, #fffbeb, #fff7ed);
  border-radius: 12px;
  border: 1px solid #fbbf24;
  overflow: hidden;
}
.ce-header {
  padding: 16px 24px;
  border-bottom: 1px solid #fbbf24;
  background: rgba(251, 191, 36, 0.15);
}
.ce-header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ce-icon-box {
  width: 40px;
  height: 40px;
  background: #f59e0b;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ce-title {
  font-size: 26px;
  font-weight: 600;
  color: #111827;
}
.ce-subtitle {
  font-size: 21px;
  color: #4b5563;
}
.ce-body {
  padding: 24px;
}
.ce-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 1024px) {
  .ce-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.ce-data-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ce-data-title {
  font-size: 22px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}
.ce-data-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(251, 191, 36, 0.3);
}
.ce-data-row--last {
  border-bottom: none;
}
.ce-data-label {
  font-size: 21px;
  color: #4b5563;
}
.ce-data-value {
  font-size: 21px;
  font-weight: 500;
  color: #111827;
}
.ce-accent-text {
  color: #0e888d;
  font-weight: 500;
}
.ce-calc-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #fbbf24;
}
.ce-calc-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ce-formula-block {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  font-family: ui-monospace, monospace;
}
.ce-formula-label {
  font-size: 21px;
  color: #4b5563;
  margin-bottom: 8px;
}
.ce-formula-text {
  font-size: 21px;
  color: #111827;
  font-weight: 600;
}
.ce-substitute-block {
  padding: 16px;
  background: rgba(14, 136, 141, 0.1);
  border-radius: 8px;
  font-family: ui-monospace, monospace;
}
.ce-formula-value {
  font-size: 21px;
  color: #111827;
}
.ce-result-block {
  padding: 16px;
  background: #0e888d;
  color: #fff;
  border-radius: 8px;
  text-align: center;
}
.ce-result-label {
  font-size: 21px;
  opacity: 0.8;
  margin-bottom: 4px;
}
.ce-result-value {
  font-size: 24px;
  font-weight: 700;
}
.ce-note {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.ce-note-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ce-note-title {
  font-size: 22px;
  font-weight: 500;
  color: #111827;
}
.ce-note-text {
  font-size: 21px;
  color: #4b5563;
  margin-top: 4px;
}
.ce-note-hint {
  color: #6b7280;
}
</style>
