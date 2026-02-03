<script setup lang="ts">
interface Publication {
  id: number
  icon: string
  title: string
  description: string
  date: string
  slug?: string
}

// Sample data
const publications: Publication[] = [
  {
    id: 1,
    icon: '🆕',
    title: 'Запущена новая версия калькулятора утилизационного сбора',
    description: 'Обновлённый калькулятор позволяет более точно рассчитать сумму утилизационного сбора с учётом новых категорий товаров и коэффициентов.',
    date: '15 ноября 2024'
  },
  {
    id: 2,
    icon: '📊',
    title: 'Отчёт по сбору и переработке отходов за III квартал 2024',
    description: 'Собрано 42.3 млн сом утилизационного сбора, переработано 12,450 тонн отходов.',
    date: '10 ноября 2024'
  },
  {
    id: 3,
    icon: '🏆',
    title: 'Открыт приём заявок на конкурс экологических проектов',
    description: 'Грант до 500 000 сом на проекты в сфере переработки отходов.',
    date: '10 ноября 2024'
  },
  {
    id: 4,
    icon: '📊',
    title: 'Отчёт по сбору и переработке отходов за III квартал 2024',
    description: 'Собрано 42.3 млн сом утилизационного сбора, переработано 12,450 тонн отходов.',
    date: '10 ноября 2024'
  },
  {
    id: 5,
    icon: '📋',
    title: 'Обновлены правила лицензирования',
    description: 'Вступили в силу новые требования к организациям, занимающимся сбором и переработкой отходов.',
    date: '5 ноября 2024'
  },
  {
    id: 6,
    icon: '🌱',
    title: 'Запущена программа поддержки экологических стартапов',
    description: 'Министерство объявляет о начале программы грантовой поддержки инновационных проектов в сфере экологии.',
    date: '1 ноября 2024'
  },
  {
    id: 7,
    icon: '📈',
    title: 'Статистика за октябрь 2024',
    description: 'Опубликованы данные о собранных отходах и выданных лицензиях за прошедший месяц.',
    date: '28 октября 2024'
  },
  {
    id: 8,
    icon: '🔔',
    title: 'Напоминание о сроках подачи отчётности',
    description: 'До 15 ноября необходимо подать квартальную отчётность по утилизационному сбору.',
    date: '25 октября 2024'
  }
]

const handleClick = (_publication: Publication) => {
  // TODO: Implement navigation logic
}
</script>

<template>
  <div class="py-10 lg:py-[60px]">
    <!-- Page header -->
    <div class="container-main">
      <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-2 lg:mb-[12px]">
        Публикации
      </h1>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861] pb-8 lg:pb-[60px]">
        Новости, отчёты и пресс-релизы
      </p>
    </div>

    <!-- Publications grid -->
    <div class="container-main">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-[30px]">
        <article
          v-for="publication in publications"
          :key="publication.id"
          @click="handleClick(publication)"
          class="publication-card"
        >
          <div class="flex-1">
            <h3 class="text-[#415861] text-lg lg:text-[20px] font-medium leading-normal mb-3 lg:mb-[12px]">
              <span class="mr-1">{{ publication.icon }}</span>
              {{ publication.title }}
            </h3>
            <p class="text-[#415861] text-sm lg:text-[14px] leading-normal">
              {{ publication.description }}
            </p>
          </div>
          <time class="text-[#70868f] text-xs lg:text-[12px] mt-auto">
            {{ publication.date }}
          </time>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.publication-card {
  background: #fafafa;
  border-radius: 30px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  min-height: 280px;
}

.publication-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

@media (max-width: 767px) {
  .publication-card {
    padding: 20px;
    min-height: auto;
    gap: 20px;
  }
}
</style>
