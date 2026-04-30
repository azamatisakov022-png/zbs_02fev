<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { publicPublicationsApi } from '../../api/publications'
import type { Publication, PublicationLang } from '../../types/publications'
import CategoryPill from '../../components/publications/CategoryPill.vue'
import AuthorBadge from '../../components/publications/AuthorBadge.vue'
import PubCard from '../../components/publications/PubCard.vue'
import '../../components/publications/palette.css'

const route = useRoute()
const router = useRouter()

const pub = ref<Publication | null>(null)
const loading = ref(true)
const error = ref('')
const lang = ref<PublicationLang>('ru')
const related = ref<Publication['title'] extends string ? any[] : never>([] as any)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const slug = route.params.slug as string
    pub.value = await publicPublicationsApi.getBySlug(slug, lang.value)
    // Похожие — последние 3 той же категории (исключая текущую)
    if (pub.value) {
      const list = await publicPublicationsApi.list({
        category: pub.value.category, lang: lang.value, page: 0, size: 4,
      })
      related.value = list.content.filter(p => p.slug !== pub.value!.slug).slice(0, 3)
    }
  } catch (e) {
    error.value = 'Публикация не найдена или произошла ошибка'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.params.slug, load)
watch(lang, load)

const fullDate = computed(() => {
  if (!pub.value) return ''
  return new Date(pub.value.publishedAt).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
})

function setLang(l: PublicationLang) {
  lang.value = l
}
</script>

<template>
  <div class="pubs-page detail">
    <div class="detail__container">
      <div class="detail__head-row">
        <button class="detail__back" @click="router.back()">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 8H3M7 4l-4 4 4 4" />
          </svg>
          К публикациям
        </button>
        <div v-if="pub" class="detail__lang">
          <button :class="{ active: lang === 'ru' }" @click="setLang('ru')">RU</button>
          <button
            :class="{ active: lang === 'ky', disabled: !pub.hasKy }"
            :disabled="!pub.hasKy"
            @click="pub.hasKy && setLang('ky')"
          >KY</button>
          <button
            :class="{ active: lang === 'en', disabled: !pub.hasEn }"
            :disabled="!pub.hasEn"
            @click="pub.hasEn && setLang('en')"
          >EN</button>
        </div>
      </div>

      <div v-if="loading" class="detail__state">Загрузка…</div>
      <div v-else-if="error" class="detail__state detail__state--error">{{ error }}</div>

      <article v-else-if="pub" class="detail__article fade-up">
        <div class="detail__meta">
          <CategoryPill :category="pub.category" />
          <span class="detail__dot" />
          <AuthorBadge :author="pub.authorOrg" />
          <span class="detail__dot" />
          <span class="detail__date">{{ fullDate }}</span>
          <span class="detail__dot" />
          <span class="detail__read">{{ pub.readMinutes }} мин чтения</span>
        </div>

        <h1 class="serif detail__title">{{ pub.title }}</h1>
        <p class="detail__excerpt">{{ pub.excerpt }}</p>

        <figure class="detail__cover">
          <img :src="pub.coverUrl" :alt="pub.title" />
        </figure>

        <!-- Body — HTML из БД, доверенный (создаётся редакторами через Tiptap) -->
        <div class="detail__body" v-html="pub.body" />

        <hr class="detail__divider" />

        <div class="detail__author-block">
          <div class="detail__author-side">
            <span class="detail__author-label">Опубликовано</span>
            <AuthorBadge :author="pub.authorOrg" full />
          </div>
        </div>

        <div v-if="related.length > 0" class="detail__related">
          <h3 class="detail__related-title">Похожие публикации</h3>
          <div class="detail__related-grid">
            <PubCard v-for="(p, i) in related" :key="p.id" :pub="p" :index="i" />
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.detail {
  background: var(--pub-bg);
  min-height: 100vh;
}
.detail__container {
  max-width: 880px;
  margin: 0 auto;
  padding: 32px 40px 80px;
}
.detail__head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}
.detail__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--pub-line);
  border-radius: 999px;
  background: #fff;
  color: var(--pub-ink-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}
.detail__back:hover {
  background: var(--pub-bg-2);
}
.detail__lang {
  display: inline-flex;
  padding: 3px;
  background: var(--pub-bg-2);
  border-radius: 8px;
  border: 1px solid var(--pub-line);
}
.detail__lang button {
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--pub-ink-3);
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
}
.detail__lang button.active {
  background: #fff;
  color: var(--pub-brand-700);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.detail__lang button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.detail__state {
  text-align: center;
  padding: 64px 24px;
  color: var(--pub-ink-3);
  background: #fff;
  border: 1px solid var(--pub-line);
  border-radius: 14px;
}
.detail__state--error {
  color: #b23b3b;
}
.detail__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--pub-ink-3);
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.detail__dot {
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: var(--pub-ink-4);
}
.detail__title {
  font-size: 44px;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin: 0 0 14px;
  color: var(--pub-ink);
  font-weight: 800;
}
.detail__excerpt {
  margin: 0 0 28px;
  font-size: 18px;
  line-height: 1.6;
  color: var(--pub-ink-3);
  font-style: italic;
}
.detail__cover {
  margin: 0 0 36px;
}
.detail__cover img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 14px;
  background: var(--pub-bg-2);
  display: block;
}
.detail__body {
  font-size: 16px;
  line-height: 1.75;
  color: var(--pub-ink);
}
.detail__body :deep(h2) {
  margin: 36px 0 16px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--pub-ink);
}
.detail__body :deep(p) {
  margin: 0 0 18px;
}
.detail__body :deep(.lead) {
  font-size: 17px;
  color: var(--pub-ink-2);
  line-height: 1.65;
}
.detail__body :deep(blockquote) {
  margin: 32px 0;
  padding: 18px 24px;
  border-left: 3px solid var(--pub-brand);
  background: var(--pub-brand-050);
  border-radius: 0 10px 10px 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 19px;
  color: var(--pub-ink);
  line-height: 1.5;
}
.detail__body :deep(ul),
.detail__body :deep(ol) {
  margin: 0 0 18px 24px;
}
.detail__body :deep(li) {
  margin-bottom: 6px;
}
.detail__body :deep(strong) {
  font-weight: 700;
  color: var(--pub-ink);
}
.detail__divider {
  border: none;
  border-top: 1px solid var(--pub-line);
  margin: 40px 0 24px;
}
.detail__author-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.detail__author-side {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail__author-label {
  font-size: 11px;
  color: var(--pub-ink-4);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.detail__related {
  margin-top: 56px;
}
.detail__related-title {
  margin: 0 0 18px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--pub-ink-4);
}
.detail__related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}

@media (max-width: 720px) {
  .detail__container {
    padding: 24px 20px 60px;
  }
  .detail__title {
    font-size: 30px;
  }
  .detail__excerpt {
    font-size: 16px;
  }
}
</style>
