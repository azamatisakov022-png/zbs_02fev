<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { publicPublicationsApi } from '../api/publications'
import {
  CATEGORY_LABELS,
  type PublicationCategory,
  type PublicationListItem,
} from '../types/publications'
import HeroCard from '../components/publications/HeroCard.vue'
import PubCard from '../components/publications/PubCard.vue'
import '../components/publications/palette.css'

const items = ref<PublicationListItem[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref('')

const search = ref('')
const category = ref<PublicationCategory | ''>('')
const page = ref(0)
const SIZE = 12

const categoryOptions = Object.entries(CATEGORY_LABELS) as [PublicationCategory, string][]

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await publicPublicationsApi.list({
      category: (category.value || undefined) as PublicationCategory | undefined,
      search: search.value.trim() || undefined,
      page: page.value,
      size: SIZE,
    })
    items.value = res.content
    total.value = res.totalElements
  } catch (e) {
    error.value = 'Не удалось загрузить публикации'
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Debounce search
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 0
    load()
  }, 250)
})

watch(category, () => {
  page.value = 0
  load()
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / SIZE)))

// Hero - самая свежая публикация (только когда нет фильтра/поиска)
const showHero = computed(() => !search.value && !category.value && items.value.length > 0)
const heroPub = computed(() => (showHero.value ? items.value[0] : null))
const gridItems = computed(() => (showHero.value ? items.value.slice(1) : items.value))

function reset() {
  search.value = ''
  category.value = ''
  page.value = 0
  load()
}
function goPage(p: number) {
  if (p < 0 || p >= totalPages.value) return
  page.value = p
  load()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="pubs-page pubs">
    <div class="pubs__container">
      <!-- Заголовок и подзаголовок убраны: активная вкладка «Публикации»
           в шапке уже задаёт контекст страницы.
           Редакционные ленты не нуждаются в дополнительной обложке. -->

      <!-- Hero - свежая публикация (скрыт при фильтре/поиске) -->
      <HeroCard v-if="heroPub" :pub="heroPub" class="pubs__hero" />

      <!-- Фильтры: поиск + dropdown категорий -->
      <div class="pubs__filters">
        <div class="pubs__search">
          <svg class="pubs__search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L13.5 13.5" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Поиск по публикациям…"
            class="pubs__search-input"
          />
          <button v-if="search" class="pubs__search-clear" @click="search = ''" aria-label="Очистить">×</button>
        </div>
        <select v-model="category" class="pubs__dropdown">
          <option value="">Все категории</option>
          <option v-for="[id, label] in categoryOptions" :key="id" :value="id">
            {{ label }}
          </option>
        </select>
      </div>

      <!-- Лента -->
      <div v-if="loading" class="pubs__state">Загрузка…</div>
      <div v-else-if="error" class="pubs__state pubs__state--error">{{ error }}</div>
      <div v-else-if="gridItems.length === 0" class="pubs__empty">
        <div class="pubs__empty-title">Ничего не найдено</div>
        <p class="pubs__empty-text">Попробуйте изменить фильтр или поисковый запрос.</p>
        <button class="pubs__empty-btn" @click="reset">Сбросить</button>
      </div>
      <div v-else class="pubs__grid">
        <PubCard
          v-for="(p, i) in gridItems"
          :key="p.id"
          :pub="p"
          :index="i"
        />
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1 && gridItems.length > 0" class="pubs__pagination">
        <button class="pubs__page pubs__page--ghost" :disabled="page === 0" @click="goPage(page - 1)">
          ← Назад
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="pubs__page"
          :class="{ 'pubs__page--active': p - 1 === page }"
          @click="goPage(p - 1)"
        >
          {{ p }}
        </button>
        <button class="pubs__page pubs__page--ghost" :disabled="page + 1 >= totalPages" @click="goPage(page + 1)">
          Далее →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pubs {
  background: var(--pub-bg);
  min-height: 100vh;
}
.pubs__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 40px 80px;
}
/* Заголовок «Публикации» удалён вместе с подзаголовком - стили
   .pubs__head / .pubs__title / .pubs__lead больше не нужны. */
.pubs__hero {
  margin-bottom: 36px;
}
.pubs__filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0 28px;
  flex-wrap: wrap;
}
.pubs__search {
  position: relative;
  flex: 1;
  min-width: 240px;
  max-width: 480px;
}
.pubs__search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--pub-ink-4);
  pointer-events: none;
}
.pubs__search-input {
  width: 100%;
  height: 40px;
  padding: 0 36px 0 38px;
  background: #fff;
  border: 1px solid var(--pub-line);
  border-radius: 8px;
  font-size: 13.5px;
  font-family: inherit;
  color: var(--pub-ink);
  outline: none;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.pubs__search-input:focus {
  border-color: var(--pub-brand);
  box-shadow: 0 0 0 3px var(--pub-brand-050);
}
.pubs__search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--pub-bg-2);
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--pub-ink-3);
  cursor: pointer;
  font-family: inherit;
}
.pubs__search-clear:hover {
  background: var(--pub-line);
}
.pubs__dropdown {
  height: 40px;
  padding: 0 36px 0 14px;
  background: #fff;
  border: 1px solid var(--pub-line);
  border-radius: 8px;
  font-size: 13.5px;
  font-family: inherit;
  color: var(--pub-ink-2);
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none' stroke='%23566560' stroke-width='1.8' stroke-linecap='round'%3E%3Cpath d='M2 4l3 3 3-3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}
.pubs__dropdown:focus {
  border-color: var(--pub-brand);
  box-shadow: 0 0 0 3px var(--pub-brand-050);
}
.pubs__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.pubs__state {
  text-align: center;
  padding: 48px 24px;
  color: var(--pub-ink-3);
  font-size: 14px;
  background: #fff;
  border: 1px solid var(--pub-line);
  border-radius: 16px;
}
.pubs__state--error {
  color: #b23b3b;
}
.pubs__empty {
  text-align: center;
  padding: 64px 24px;
  background: #fff;
  border: 1px solid var(--pub-line);
  border-radius: 16px;
}
.pubs__empty-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--pub-ink);
  margin-bottom: 6px;
}
.pubs__empty-text {
  margin: 0 0 16px;
  font-size: 13.5px;
  color: var(--pub-ink-3);
}
.pubs__empty-btn {
  display: inline-block;
  padding: 9px 18px;
  background: var(--pub-brand);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.pubs__pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 48px;
}
.pubs__page {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--pub-line);
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--pub-ink-2);
  cursor: pointer;
  font-family: inherit;
}
.pubs__page--active {
  background: var(--pub-brand-050);
  border-color: var(--pub-brand-100);
  color: var(--pub-brand-700);
}
.pubs__page--ghost {
  border-color: transparent;
  background: transparent;
  color: var(--pub-ink-3);
}
.pubs__page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .pubs__container {
    padding: 32px 20px 64px;
  }
  /* Заголовок теперь управляется через mobile-first блок выше,
     отдельный mobile-override не нужен. */
}
</style>
