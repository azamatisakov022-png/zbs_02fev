<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PublicationListItem } from '../../types/publications'
import CategoryPill from './CategoryPill.vue'

const props = defineProps<{
  pub: PublicationListItem
  index?: number
}>()

const router = useRouter()

const animDelay = computed(() => `${Math.min((props.index || 0) * 50, 600)}ms`)

const dateLabel = computed(() => {
  const d = new Date(props.pub.publishedAt)
  const today = new Date()
  const days = Math.floor((today.getTime() - d.getTime()) / 86400000)
  if (days < 1) return 'сегодня'
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} дн. назад`
  if (days < 31) return `${days} дн. назад`
  if (days < 60) return '1 месяц назад'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
})

function open() {
  router.push(`/publications/${props.pub.slug}`)
}
</script>

<template>
  <article
    class="pub-card fade-up"
    :style="{ animationDelay: animDelay }"
    @click="open"
  >
    <div
      class="pub-card__cover"
      :style="{ backgroundImage: `url(${pub.coverUrl})` }"
    />
    <div class="pub-card__body">
      <CategoryPill :category="pub.category" size="sm" />
      <h3 class="pub-card__title">{{ pub.title }}</h3>
      <p class="pub-card__lead">{{ pub.excerpt }}</p>
      <div class="pub-card__foot">
        <span class="pub-card__date">{{ dateLabel }}</span>
        <span class="pub-card__read">{{ pub.readMinutes }} мин чтения</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.pub-card {
  background: var(--pub-card);
  border: 1px solid var(--pub-line);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1),
              box-shadow 0.18s,
              border-color 0.18s;
}
.pub-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -16px rgba(15, 23, 42, 0.18);
  border-color: var(--pub-brand-100);
}
.pub-card__cover {
  aspect-ratio: 4 / 3;
  background-color: var(--pub-bg-2);
  background-size: cover;
  background-position: center;
}
.pub-card__body {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.pub-card__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--pub-ink);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pub-card__lead {
  margin: 0;
  font-size: 13px;
  color: var(--pub-ink-3);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pub-card__foot {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--pub-line-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  color: var(--pub-ink-4);
}
</style>
