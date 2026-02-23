<script setup lang="ts">
import Button from '@/components/ui/general/Button.vue'
import { useI18n } from 'vue-i18n'

useI18n()

const documents = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: 'Постановление Кабинета Министров КР №730 от 03.12.2024 «О порядке уплаты утилизационного сбора»',
  date: '03.12.2024',
}))
</script>

<template>
  <div class="container-main">
    <div class="legislation-page">
      <div class="section-header">
        <div class="section-header-content max-w-[601px]">
          <h1 class="section-title">
            {{ $t('legislation.title') }}
          </h1>
          <p class="section-subtitle">
            {{ $t('legislation.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="table-wrapper legislation-table-desktop">
        <div class="table-header">
          <div class="table-cell w-[78px] justify-center">
            <span class="table-cell-text">{{ $t('legislation.table.number') }}</span>
          </div>
          <div class="table-cell flex-1">
            <span class="table-cell-text">{{ $t('legislation.table.documentName') }}</span>
          </div>
          <div class="table-cell w-[150px] justify-center">
            <span class="table-cell-text">{{ $t('legislation.table.date') }}</span>
          </div>
          <div class="table-cell w-[250px] justify-center">
            <span class="table-cell-text">{{ $t('legislation.table.actions') }}</span>
          </div>
        </div>

        <div
          v-for="doc in documents"
          :key="doc.id"
          class="table-row"
        >
          <div class="table-cell w-[78px] justify-center">
            <span class="table-cell-text">{{ doc.id }}</span>
          </div>
          <div class="table-cell flex-1">
            <span class="table-cell-text">{{ doc.name }}</span>
          </div>
          <div class="table-cell w-[150px] justify-center">
            <span class="table-cell-text">{{ doc.date }}</span>
          </div>
          <div class="table-cell w-[250px] justify-center">
            <Button variant="primary" size="xs" class="mr-[10px]">
              {{ $t('legislation.viewBtn') }}
            </Button>
            <Button variant="accent" size="xs">
              {{ $t('legislation.downloadBtn') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="legislation-cards-mobile">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="legislation-card"
        >
          <div class="legislation-card-header">
            <span class="legislation-card-num">{{ $t('legislation.table.number') }} {{ doc.id }}</span>
            <span class="legislation-card-date">{{ doc.date }}</span>
          </div>
          <p class="legislation-card-name">{{ doc.name }}</p>
          <div class="legislation-card-actions">
            <Button variant="primary" size="xs">{{ $t('legislation.viewBtn') }}</Button>
            <Button variant="accent" size="xs">{{ $t('legislation.downloadBtn') }}</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/styles/views/legislation.css"></style>
