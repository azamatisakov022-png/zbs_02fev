<script setup lang="ts">
const contests = [
  {
    id: 1,
    title: 'Грант на экологические проекты 2024',
    description: 'Грант до 500 000 сом на проекты в сфере переработки отходов и экологического просвещения.',
    deadline: '31 декабря 2024',
    status: 'active',
  },
  {
    id: 2,
    title: 'Конкурс инновационных решений',
    description: 'Поиск инновационных технологий для переработки пластиковых отходов.',
    deadline: '15 января 2025',
    status: 'active',
  },
  {
    id: 3,
    title: 'Лучший экологический проект года',
    description: 'Награждение лучших проектов в области устойчивого развития и управления отходами.',
    deadline: '28 февраля 2025',
    status: 'upcoming',
  },
]

const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Приём заявок', bg: 'rgba(14,136,141,0.2)', text: '#0e888d' },
  upcoming: { label: 'Скоро', bg: 'rgba(254,166,41,0.2)', text: '#fea629' },
  closed: { label: 'Завершён', bg: 'rgba(112,134,143,0.2)', text: '#70868f' },
}
</script>

<template>
  <div class="container-main">
    <div class="section-header pb-15">
      <div class="section-header-content max-w-[601px]">
        <h1 class="section-title">
          Конкурсы и гранты
        </h1>
        <p class="section-subtitle">
          Актуальные конкурсы и грантовые программы в сфере экологии
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-7.5">
      <div
        v-for="contest in contests"
        :key="contest.id"
        class="card-base p-10 flex-row justify-between items-start"
      >
        <div class="flex flex-col gap-4 max-w-[800px]">
          <div class="flex items-center gap-4">
            <h3 class="text-h5 font-bold text-text-main leading-normal">
              {{ contest.title }}
            </h3>
            <span
              class="badge"
              :style="{ backgroundColor: statusLabels[contest.status].bg, color: statusLabels[contest.status].text }"
            >
              {{ statusLabels[contest.status].label }}
            </span>
          </div>
          <p class="text-body-sm text-text-main leading-normal">
            {{ contest.description }}
          </p>
          <p class="text-caption text-text-secondary leading-normal">
            Дедлайн: {{ contest.deadline }}
          </p>
        </div>
        <button class="btn-primary px-6 py-3.5 rounded-3xl shrink-0">
          Подать заявку
        </button>
      </div>
    </div>
  </div>
</template>
