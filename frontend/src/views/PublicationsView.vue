<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

function goToWasteLifetime() {
  router.push('/publications/waste-lifetime')
}

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
      <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-6 lg:mb-8">
        {{ $t('publications.title') }}
      </h1>

    </div>

    <div class="container-main">
      <!-- Promo banner -->
      <div class="promo-banner" @click="goToWasteLifetime">
        <span class="promo-badge">{{ $t('publications.bannerBadge') }}</span>
        <div class="promo-icon-box">
          <span class="promo-icon">♻️</span>
        </div>
        <div class="promo-content">
          <h3 class="promo-title">
            {{ $t('publications.bannerTitleStart') }} <span class="promo-title-accent">{{ $t('publications.bannerTitleAccent') }}</span>
          </h3>
          <p class="promo-desc">{{ $t('publications.bannerDescription') }}</p>
        </div>
        <button class="promo-btn" @click.stop="goToWasteLifetime">
          {{ $t('publications.bannerButton') }} →
        </button>
      </div>

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
/* Promo banner */
.promo-banner {
  display: flex;
  align-items: center;
  gap: 24px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #fef9c3 100%);
  border-radius: 16px;
  padding: 28px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
}
.promo-banner:hover {
  border-color: #10b981;
  box-shadow: 0 6px 24px rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}
.promo-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: #10b981;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.promo-icon-box {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
}
.promo-icon {
  font-size: 48px;
  line-height: 1;
}
.promo-content {
  flex: 1;
  min-width: 0;
}
.promo-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 6px;
  line-height: 1.3;
}
.promo-title-accent {
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.promo-desc {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}
.promo-btn {
  flex-shrink: 0;
  padding: 10px 20px;
  border-radius: 10px;
  background: #10b981;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}
.promo-btn:hover {
  background: #059669;
}

@media (max-width: 767px) {
  .promo-banner {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
    gap: 16px;
  }
  .promo-btn {
    width: 100%;
  }
  .promo-title {
    font-size: 19px;
  }
}

/* Publication cards */
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
