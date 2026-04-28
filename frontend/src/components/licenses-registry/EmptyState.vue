<script setup lang="ts">
defineProps<{ query: string }>()
defineEmits<{ (e: 'clear'): void }>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    </div>
    <div class="empty-state__title">Ничего не найдено</div>
    <div class="empty-state__text">
      <template v-if="query">По запросу «<b>{{ query }}</b>» нет совпадений.</template>
      <template v-else>Попробуйте изменить фильтры.</template>
    </div>
    <button class="empty-state__btn" @click="$emit('clear')">Сбросить фильтры</button>
  </div>
</template>

<style scoped>
.empty-state {
  padding: 56px 24px;
  text-align: center;
}
.empty-state__icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--lr-brand-050);
  color: var(--lr-brand);
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
}
.empty-state__title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}
.empty-state__text {
  font-size: 13px;
  color: var(--lr-ink-3);
  margin-bottom: 16px;
}
.empty-state__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  background: var(--lr-brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
</style>
