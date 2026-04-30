<script setup lang="ts">
/**
 * Список публикаций для редакторов.
 * Доступен ролям: ADMIN, EMPLOYEE (МПРЭТН), ECO_OPERATOR.
 *
 * UX:
 *   - Таблица с колонками: обложка, заголовок, категория, автор, статус, дата.
 *   - Фильтры: вкладки «Все / Опубликованные / Черновики».
 *   - Действия в строке: редактировать, опубликовать/снять, удалить (только admin).
 *   - Кнопка «Новая публикация» сверху → форма создания.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { AppButton } from '../../components/ui'
import {
  useAdminMenu,
  useEmployeeMenu,
  useEcoOperatorMenu,
} from '../../composables/useRoleMenu'
import { authStore } from '../../stores/auth'
import { toastStore } from '../../stores/toast'
import { publicationsApi } from '../../api/publications'
import {
  AUTHOR_LABELS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type PublicationListItem,
} from '../../types/publications'

const router = useRouter()

// Меню/заголовок выбираем в зависимости от роли пользователя:
// одна страница работает для admin / employee / eco-operator,
// но визуально оборачивается в их собственный сайдбар.
const role = computed(() => authStore.userRole.value)
const adminBundle = useAdminMenu()
const employeeBundle = useEmployeeMenu()
const ecoBundle = useEcoOperatorMenu()
const layoutBundle = computed(() => {
  if (role.value === 'employee' || role.value === 'ministry') return employeeBundle
  if (role.value === 'eco-operator') return ecoBundle
  return adminBundle
})
const isAdmin = computed(() => role.value === 'admin')

// Данные
const items = ref<PublicationListItem[]>([])
const totalElements = ref(0)
const page = ref(0)
const SIZE = 20
const isLoading = ref(true)
const error = ref('')
const activeTab = ref<'all' | 'published' | 'drafts'>('all')

async function load() {
  isLoading.value = true
  error.value = ''
  try {
    const res = await publicationsApi.listAdmin({ page: page.value, size: SIZE })
    items.value = res.content
    totalElements.value = res.totalElements
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Не удалось загрузить публикации'
  } finally {
    isLoading.value = false
  }
}

onMounted(load)

const filtered = computed(() => {
  if (activeTab.value === 'published') return items.value.filter(p => p.isPublished)
  if (activeTab.value === 'drafts') return items.value.filter(p => !p.isPublished)
  return items.value
})

const counts = computed(() => ({
  all: items.value.length,
  published: items.value.filter(p => p.isPublished).length,
  drafts: items.value.filter(p => !p.isPublished).length,
}))

const totalPages = computed(() => Math.max(1, Math.ceil(totalElements.value / SIZE)))

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function goCreate() {
  router.push('/admin/publications/new')
}
function goEdit(id: number) {
  router.push(`/admin/publications/${id}/edit`)
}
function goView(slug: string) {
  router.push(`/publications/${slug}`)
}

async function onPublish(p: PublicationListItem) {
  try {
    await publicationsApi.publish(p.id)
    p.isPublished = true
    toastStore.show({ type: 'success', title: 'Публикация опубликована' })
  } catch (e: any) {
    toastStore.show({
      type: 'error', title: 'Не удалось опубликовать',
      message: e?.response?.data?.message || '',
    })
  }
}

async function onUnpublish(p: PublicationListItem) {
  if (!confirm(`Снять с публикации «${p.title}»?`)) return
  try {
    await publicationsApi.unpublish(p.id)
    p.isPublished = false
    toastStore.show({ type: 'success', title: 'Снято с публикации' })
  } catch (e: any) {
    toastStore.show({
      type: 'error', title: 'Не удалось снять',
      message: e?.response?.data?.message || '',
    })
  }
}

async function onDelete(p: PublicationListItem) {
  if (!confirm(`Удалить публикацию «${p.title}»? Действие необратимо.`)) return
  try {
    await publicationsApi.delete(p.id)
    items.value = items.value.filter(i => i.id !== p.id)
    totalElements.value = Math.max(0, totalElements.value - 1)
    toastStore.show({ type: 'success', title: 'Публикация удалена' })
  } catch (e: any) {
    toastStore.show({
      type: 'error', title: 'Не удалось удалить',
      message: e?.response?.data?.message || '',
    })
  }
}

function goPage(p: number) {
  if (p < 0 || p >= totalPages.value) return
  page.value = p
  load()
}
</script>

<template>
  <DashboardLayout :roleTitle="layoutBundle.roleTitle.value" :menuItems="layoutBundle.menuItems.value">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl lg:text-2xl font-bold text-gray-800">Публикации</h1>
          <p class="text-sm text-gray-500 mt-1">
            Управление лентой новостей, отчётов, конкурсов и пресс-релизов.
          </p>
        </div>
        <div>
          <AppButton label="Новая публикация" variant="primary" @click="goCreate" />
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-xl border border-gray-100 p-2 inline-flex gap-1 flex-wrap">
        <button
          v-for="tab in [
            { id: 'all', label: 'Все', count: counts.all },
            { id: 'published', label: 'Опубликованные', count: counts.published },
            { id: 'drafts', label: 'Черновики', count: counts.drafts },
          ]"
          :key="tab.id"
          @click="activeTab = tab.id as any"
          :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === tab.id ? 'bg-[#0d9488] text-white' : 'text-gray-600 hover:bg-gray-50']"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <!-- States -->
      <SkeletonLoader v-if="isLoading" :rows="5" />
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
        {{ error }}
      </div>
      <EmptyState
        v-else-if="filtered.length === 0"
        title="Публикаций нет"
        subtitle="Нажмите «Новая публикация», чтобы создать первую запись."
      />

      <!-- Table -->
      <div v-else class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table class="pubs-admin-table">
          <thead>
            <tr>
              <th style="width: 80px">Обложка</th>
              <th>Заголовок</th>
              <th style="width: 160px">Категория</th>
              <th style="width: 200px">Автор</th>
              <th style="width: 110px">Статус</th>
              <th style="width: 110px">Дата</th>
              <th style="width: 220px">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td>
                <div class="pubs-admin-cover" :style="{ backgroundImage: `url(${p.coverUrl})` }" />
              </td>
              <td>
                <div class="pubs-admin-title">{{ p.title }}</div>
                <div class="pubs-admin-slug">/{{ p.slug }}</div>
              </td>
              <td>
                <span class="pubs-admin-pill" :style="{ '--c': CATEGORY_COLORS[p.category] }">
                  <i class="pubs-admin-pill__dot" />
                  {{ CATEGORY_LABELS[p.category] }}
                </span>
              </td>
              <td class="text-sm text-gray-600">{{ AUTHOR_LABELS[p.authorOrg] }}</td>
              <td>
                <span
                  :class="['pubs-admin-status',
                    p.isPublished ? 'pubs-admin-status--ok' : 'pubs-admin-status--draft']"
                >
                  {{ p.isPublished ? 'Опубликовано' : 'Черновик' }}
                </span>
              </td>
              <td class="text-sm text-gray-500 whitespace-nowrap">{{ formatDate(p.publishedAt) }}</td>
              <td>
                <div class="pubs-admin-actions">
                  <button class="pubs-admin-link" @click="goEdit(p.id)">Редактировать</button>
                  <button v-if="p.isPublished" class="pubs-admin-link" @click="goView(p.slug)">
                    Открыть
                  </button>
                  <button
                    v-if="!p.isPublished"
                    class="pubs-admin-link pubs-admin-link--primary"
                    @click="onPublish(p)"
                  >
                    Опубликовать
                  </button>
                  <button
                    v-else
                    class="pubs-admin-link pubs-admin-link--warn"
                    @click="onUnpublish(p)"
                  >
                    Снять
                  </button>
                  <button
                    v-if="isAdmin"
                    class="pubs-admin-link pubs-admin-link--danger"
                    @click="onDelete(p)"
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-6">
        <button
          class="px-3 h-9 border border-gray-200 rounded-lg bg-white text-sm disabled:opacity-40"
          :disabled="page === 0" @click="goPage(page - 1)"
        >
          ← Назад
        </button>
        <button
          v-for="n in totalPages" :key="n"
          @click="goPage(n - 1)"
          :class="['min-w-9 h-9 px-3 border rounded-lg text-sm font-semibold',
            n - 1 === page
              ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#0d9488]'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50']"
        >
          {{ n }}
        </button>
        <button
          class="px-3 h-9 border border-gray-200 rounded-lg bg-white text-sm disabled:opacity-40"
          :disabled="page + 1 >= totalPages" @click="goPage(page + 1)"
        >
          Далее →
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.pubs-admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.pubs-admin-table thead th {
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
  padding: 12px 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.pubs-admin-table tbody td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.pubs-admin-table tbody tr:last-child td {
  border-bottom: none;
}
.pubs-admin-table tbody tr:hover {
  background: #fafafa;
}
.pubs-admin-cover {
  width: 64px;
  height: 44px;
  border-radius: 6px;
  background-color: #e2e8f0;
  background-size: cover;
  background-position: center;
}
.pubs-admin-title {
  font-weight: 600;
  color: #0f172a;
  line-height: 1.35;
  /* Обрезаем до 2 строк, чтобы строка таблицы не «прыгала» */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 480px;
}
.pubs-admin-slug {
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}
.pubs-admin-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  background: color-mix(in oklab, var(--c) 12%, white);
  color: color-mix(in oklab, var(--c) 80%, black);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.pubs-admin-pill__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--c);
}
.pubs-admin-status {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.pubs-admin-status--ok {
  background: #ecfdf5;
  color: #047857;
}
.pubs-admin-status--draft {
  background: #f1f5f9;
  color: #475569;
}
.pubs-admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}
.pubs-admin-link {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  font-family: inherit;
}
.pubs-admin-link:hover {
  color: #0d9488;
}
.pubs-admin-link--primary {
  color: #0d9488;
}
.pubs-admin-link--warn {
  color: #b45309;
}
.pubs-admin-link--danger {
  color: #b91c1c;
}
.pubs-admin-link--danger:hover {
  color: #7f1d1d;
}
</style>
