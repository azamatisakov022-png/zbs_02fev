<script setup lang="ts">
import category from '@/assets/images/icons/category.svg';
import activity from '@/assets/images/icons/activity.svg';
import star from '@/assets/images/icons/star.svg';
import chart from '@/assets/images/icons/chart.svg';
import chartDown from '@/assets/images/icons/chart-down.svg';
import users from '@/assets/images/icons/users.svg';
import ecology from '@/assets/images/icons/ecology.svg';

const missionCards = [
  { id: 1, title: 'Создание интегрированной системы управления отходами', icon:category },
  { id: 2, title: 'Экономическая устойчивость переработки вторсырья', icon: activity},
  { id: 3, title: 'Формирование экологичной культуры населения и бизнеса', icon: star},
  { id: 4, title: 'Рост доли переработанных отходов', icon: chart },
  { id: 5, title: 'Снижение объёмов захоронения', icon: chartDown, flipIcon: true },
  { id: 6, title: 'Развитие партнёрств государство–бизнес–переработчики', icon: users },
  { id: 7, title: 'Внедрение экологических инноваций', icon: ecology },
]
</script>

<template>
  <section class="strategy-section">
    <div class="container-main">
      <div class="strategy-header">
        <h2 class="page-title">Стратегия и миссия</h2>
        <p class="strategy-subtitle">
          Миссия — создание современной системы обращения с отходами,
          обеспечивающей чистоту окружающей среды и устойчивое развитие страны.
        </p>
      </div>

      <div class="strategy-grid">
        <div
          v-for="card in missionCards.slice(0, 3)"
          :key="card.id"
          class="mission-card"
        >
          <div :class="['mission-card-icon', { 'is-flipped': card.flipIcon }]">
            <img :src="card.icon" alt="" />
          </div>
          <h3 class="mission-card-title">{{ card.title }}</h3>
        </div>
      </div>

      <div class="strategy-grid">
        <div
          v-for="card in missionCards.slice(3, 6)"
          :key="card.id"
          class="mission-card"
        >
          <div :class="['mission-card-icon', { 'is-flipped': card.flipIcon }]">
            <img :src="card.icon" alt="" />
          </div>
          <h3 class="mission-card-title">{{ card.title }}</h3>
        </div>
      </div>

      <div class="strategy-grid">
        <div class="mission-card">
          <div class="mission-card-icon">
            <img :src="missionCards[6].icon" alt="" />
          </div>
          <h3 class="mission-card-title">{{ missionCards[6].title }}</h3>
        </div>
      </div>
    </div>
  </section>
</template>
