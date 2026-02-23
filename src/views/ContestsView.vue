<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/general/Button.vue'

const { t } = useI18n()

const statuses = ['active', 'active', 'upcoming']

const contests = computed(() =>
  Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    title: t(`contests.items.${i}.title`),
    description: t(`contests.items.${i}.description`),
    deadline: t(`contests.items.${i}.deadline`),
    status: statuses[i],
  }))
)

const statusLabels = computed(() => ({
  active: { label: t('contests.status.active'), bg: 'rgba(14,136,141,0.2)', text: '#0e888d' },
  upcoming: { label: t('contests.status.upcoming'), bg: 'rgba(254,166,41,0.2)', text: '#fea629' },
  closed: { label: t('contests.status.closed'), bg: 'rgba(112,134,143,0.2)', text: '#70868f' },
}) as Record<string, { label: string; bg: string; text: string }>)
</script>

<template>
  <div class="container-main">
    <div class="section-header pb-15">
      <div class="section-header-content max-w-[601px]">
        <h1 class="section-title">
          {{ $t('contests.title') }}
        </h1>
        <p class="section-subtitle">
          {{ $t('contests.subtitle') }}
        </p>
      </div>
    </div>

    <div class="contests-list">
      <div
        v-for="contest in contests"
        :key="contest.id"
        class="card-base contest-card"
      >
        <div class="contest-card-content">
          <div class="contest-card-header">
            <h3 class="contest-card-title">
              {{ contest.title }}
            </h3>
            <span
              class="badge"
              :style="{ backgroundColor: statusLabels[contest.status].bg, color: statusLabels[contest.status].text }"
            >
              {{ statusLabels[contest.status].label }}
            </span>
          </div>
          <p class="contest-card-desc">
            {{ contest.description }}
          </p>
          <p class="contest-card-deadline">
            {{ $t('contests.deadline') }} {{ contest.deadline }}
          </p>
        </div>
        <Button variant="primary" size="md" class="contest-apply-btn">
          {{ $t('contests.applyBtn') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/styles/views/contests.css"></style>
