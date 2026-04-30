<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PublicationListItem } from '../../types/publications'
import CategoryPill from './CategoryPill.vue'

const props = defineProps<{ pub: PublicationListItem }>()

const router = useRouter()

const fullDate = computed(() =>
  new Date(props.pub.publishedAt).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
)

function open() {
  router.push(`/publications/${props.pub.slug}`)
}
</script>

<template>
  <article class="hero fade-up" @click="open">
    <div
      class="hero__cover"
      :style="{ backgroundImage: `url(${pub.coverUrl})` }"
    />
    <div class="hero__body">
      <div class="hero__meta">
        <CategoryPill :category="pub.category" />
        <span class="hero__dot" />
        <span>{{ fullDate }}</span>
        <span class="hero__dot" />
        <span>{{ pub.readMinutes }} мин чтения</span>
      </div>
      <h2 class="hero__title">{{ pub.title }}</h2>
      <p class="hero__lead">{{ pub.excerpt }}</p>
      <div class="hero__cta">
        Читать публикацию
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </div>
    </div>
  </article>
</template>

<style scoped>
.hero {
  background: var(--pub-card);
  border: 1px solid var(--pub-line);
  border-radius: 18px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s;
}
.hero:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px -20px rgba(15, 23, 42, 0.22);
}
.hero__cover {
  aspect-ratio: 16 / 9;
  background-color: var(--pub-bg-2);
  background-size: cover;
  background-position: center;
}
.hero__body {
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: center;
}
.hero__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--pub-ink-3);
  flex-wrap: wrap;
}
.hero__dot {
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: var(--pub-ink-4);
}
.hero__title {
  margin: 0;
  font-size: 30px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: 700;
  color: var(--pub-ink);
}
.hero__lead {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--pub-ink-3);
}
.hero__cta {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--pub-brand-700);
  font-weight: 600;
  font-size: 14px;
}
.hero__cta svg {
  transition: transform 0.18s;
}
.hero:hover .hero__cta svg {
  transform: translateX(3px);
}

@media (max-width: 760px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero__body {
    padding: 24px 22px;
  }
  .hero__title {
    font-size: 22px;
  }
}
</style>
