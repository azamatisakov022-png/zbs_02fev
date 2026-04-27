<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { publicLicensesApi } from '../api/licenses'
import { toLicenseUI, type LicenseUI, type StatusKey, type KindId, type Variant } from '../components/licenses-registry/registry'
import LicensesHero from '../components/licenses-registry/LicensesHero.vue'
import DashboardVariant from '../components/licenses-registry/DashboardVariant.vue'
import TimelineVariant from '../components/licenses-registry/TimelineVariant.vue'
import CardsVariant from '../components/licenses-registry/CardsVariant.vue'
import LicenseDetailModal from '../components/licenses-registry/LicenseDetailModal.vue'

const today = new Date()

const licenses = ref<LicenseUI[]>([])
const loading = ref(false)
const loadError = ref('')

const STORAGE_KEY = 'licenses-registry.variant'
const variant = ref<Variant>((localStorage.getItem(STORAGE_KEY) as Variant) || 'dashboard')
function setVariant(v: Variant) {
  variant.value = v
  localStorage.setItem(STORAGE_KEY, v)
}

const query = ref('')
const filters = ref<{ status: StatusKey | 'all'; kinds: KindId[]; regions: string[] }>({ status: 'all', kinds: [], regions: [] })
const selected = ref<LicenseUI | null>(null)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await publicLicensesApi.listPublished({ page: 0, size: 1000 })
    licenses.value = res.content.map(l => toLicenseUI(l, today))
  } catch (e) {
    loadError.value = 'Не удалось загрузить реестр'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const counts = computed(() => ({
  all: licenses.value.length,
  active: licenses.value.filter(l => l.status.key === 'active').length,
  expiring: licenses.value.filter(l => l.status.key === 'expiring').length,
  expired: licenses.value.filter(l => l.status.key === 'expired').length,
}))

function setStatus(s: StatusKey | 'all') {
  filters.value = { ...filters.value, status: s }
}
function toggleKind(k: KindId) {
  const kinds = filters.value.kinds.includes(k)
    ? filters.value.kinds.filter(x => x !== k)
    : [...filters.value.kinds, k]
  filters.value = { ...filters.value, kinds }
}
function toggleRegion(r: string) {
  const regions = filters.value.regions.includes(r)
    ? filters.value.regions.filter(x => x !== r)
    : [...filters.value.regions, r]
  filters.value = { ...filters.value, regions }
}
function reset() {
  filters.value = { status: 'all', kinds: [], regions: [] }
  query.value = ''
}

function openDetail(lic: LicenseUI) {
  selected.value = lic
}
function closeDetail() {
  selected.value = null
}

const variants: { id: Variant; label: string; icon: 'grid' | 'time' | 'card' }[] = [
  { id: 'dashboard', label: 'Панель', icon: 'grid' },
  { id: 'timeline', label: 'Таймлайн', icon: 'time' },
  { id: 'cards', label: 'Карточки', icon: 'card' },
]

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') selected.value = null
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    const input = document.querySelector<HTMLInputElement>('.licenses-registry input[type=text]')
    input?.focus()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

onMounted(() => document.documentElement.classList.add('has-licenses-registry'))
onUnmounted(() => document.documentElement.classList.remove('has-licenses-registry'))
</script>

<template>
  <div class="licenses-registry">
    <div class="container-main">
      <LicensesHero />

      <div class="licenses-registry__toolbar">
        <div class="licenses-registry__switch">
          <button
            v-for="v in variants"
            :key="v.id"
            class="licenses-registry__switch-btn"
            :class="{ 'licenses-registry__switch-btn--active': variant === v.id }"
            @click="setVariant(v.id)"
          >
            <svg v-if="v.icon === 'grid'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
            <svg v-else-if="v.icon === 'time'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" />
            </svg>
            {{ v.label }}
          </button>
        </div>
      </div>

      <main class="licenses-registry__main">
        <div v-if="loading" class="licenses-registry__state">Загрузка реестра…</div>
        <div v-else-if="loadError" class="licenses-registry__state licenses-registry__state--error">
          {{ loadError }}
          <button class="licenses-registry__retry" @click="load">Повторить</button>
        </div>
        <template v-else>
          <DashboardVariant
            v-if="variant === 'dashboard'"
            :data="licenses"
            :query="query"
            :filters="filters"
            :counts="counts"
            :today="today"
            @update:query="query = $event"
            @open="openDetail"
            @set-status="setStatus"
            @toggle-kind="toggleKind"
            @toggle-region="toggleRegion"
            @reset="reset"
          />
          <TimelineVariant
            v-else-if="variant === 'timeline'"
            :data="licenses"
            :query="query"
            :filters="filters"
            :counts="counts"
            :today="today"
            @update:query="query = $event"
            @open="openDetail"
            @set-status="setStatus"
            @toggle-kind="toggleKind"
            @toggle-region="toggleRegion"
            @reset="reset"
          />
          <CardsVariant
            v-else
            :data="licenses"
            :query="query"
            :filters="filters"
            :counts="counts"
            :today="today"
            @update:query="query = $event"
            @open="openDetail"
            @set-status="setStatus"
            @toggle-kind="toggleKind"
            @toggle-region="toggleRegion"
            @reset="reset"
          />
        </template>
      </main>
    </div>

    <LicenseDetailModal v-if="selected" :lic="selected" :today="today" @close="closeDetail" />
  </div>
</template>

<style>
/* Reserve scrollbar space on both sides so contained layout stays optically centered. */
html.has-licenses-registry {
  scrollbar-gutter: stable both-edges;
}

/* Scoped through the .licenses-registry class to avoid leaking to the rest of the AIS. */
.licenses-registry {
  /* Palette */
  --lr-brand: #10b981;
  --lr-brand-600: #0d9488;
  --lr-brand-700: #0f766e;
  --lr-brand-050: #ecfdf5;
  --lr-brand-025: #f0fdf4;
  --lr-accent: #f59a2e;
  --lr-accent-050: #fff4e4;
  --lr-ink: #0c1713;
  --lr-ink-2: #2b3a34;
  --lr-ink-3: #566560;
  --lr-ink-4: #8a9691;
  --lr-line: #e6ebe8;
  --lr-line-2: #f0f3f1;
  --lr-bg: #f8fafc;
  --lr-amber: #c98116;
  --lr-amber-050: #fff6e3;
  --lr-rose: #b23b3b;
  --lr-rose-050: #fbecec;

  background: var(--lr-bg);
  color: var(--lr-ink);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  padding-bottom: 48px;
}
.licenses-registry * {
  box-sizing: border-box;
}
.licenses-registry .mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
</style>

<style scoped>
.licenses-registry__toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
}
.licenses-registry__switch {
  display: inline-flex;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.licenses-registry__switch-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--lr-ink-2);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.licenses-registry__switch-btn:hover:not(.licenses-registry__switch-btn--active) {
  color: var(--lr-ink);
}
.licenses-registry__switch-btn--active {
  background: #fff;
  color: var(--lr-brand-700);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.licenses-registry__main {
  padding: 24px 0 0;
}
.licenses-registry__state {
  background: #fff;
  border: 1px solid var(--lr-line);
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  color: var(--lr-ink-3);
  font-size: 14px;
}
.licenses-registry__state--error {
  color: var(--lr-rose);
}
.licenses-registry__retry {
  display: block;
  margin: 16px auto 0;
  padding: 8px 16px;
  border: 1px solid var(--lr-line);
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
}
</style>
