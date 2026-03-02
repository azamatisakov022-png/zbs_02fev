<script setup lang="ts">
const publications = [
  {
    id: 1,
    emoji: '🆕',
    title: 'Запущена новая версия калькулятора утилизационного сбора',
    description:
      'Обновлённый калькулятор позволяет более точно рассчитать сумму утилизационного сбора с учётом новых категорий товаров и коэффициентов.',
    date: '15 ноября 2024',
  },
  {
    id: 2,
    emoji: '📊',
    title: 'Отчёт по сбору и переработке отходов за III квартал 2024',
    description:
      'Собрано 42.3 млн сом утилизационного сбора, переработано 12,450 тонн отходов.',
    date: '10 ноября 2024',
  },
  {
    id: 3,
    emoji: '🏆',
    title: 'Открыт приём заявок на конкурс экологических проектов',
    description:
      'Грант до 500 000 сом на проекты в сфере переработки отходов.',
    date: '10 ноября 2024',
  },
  {
    id: 4,
    emoji: '📊',
    title: 'Отчёт по сбору и переработке отходов за III квартал 2024',
    description:
      'Собрано 42.3 млн сом утилизационного сбора, переработано 12,450 тонн отходов.',
    date: '10 ноября 2024',
  },
]
</script>

<template>
  <div class="container-main">
  <div class="publications-section">
    <div class="publications-header-box">
      <div class="publications-title-group">
        <h1 class="section-title">
          Публикации
        </h1>
        <p class="section-subtitle">
          Новости, отчёты и пресс-релизы
        </p>
      </div>
    </div>

    <div class="publications-scroll-container">
      <div class="publications-list">
        <div
          v-for="pub in publications"
          :key="pub.id"
          class="publication-card"
        >
          <div class="publication-card-content">
            <h3 class="publication-card-title">
              {{ pub.emoji }} {{ pub.title }}
            </h3>
            <p class="publication-card-desc">
              {{ pub.description }}
            </p>
          </div>
          <span class="publication-card-date">
            {{ pub.date }}
          </span>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>


<style scoped src="@/assets/styles/views/publication.css"></style>