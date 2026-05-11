<script setup lang="ts">
/**
 * Форма создания/редактирования публикации.
 *
 * Маршруты:
 *   - /admin/publications/new        - создание
 *   - /admin/publications/:id/edit   - редактирование (загружает существующую)
 *
 * Многоязычность:
 *   - 3 языка (ru / ky / en) переключаются вкладками. RU обязателен,
 *     KY и EN - опциональны (если оставить пустыми, на публичной странице
 *     при выборе KY/EN будет показан RU-fallback).
 *   - Поле title/excerpt/body хранится в локальном reactive-стейте
 *     отдельно для каждого языка; при сохранении формируется единый запрос.
 *
 * Тело статьи - HTML. Полноценный редактор (Tiptap) НЕ ставим: для редакторов
 * АИС достаточно textarea с подсказкой по разрешённым тегам и кнопками
 * быстрой вставки h2 / lead / blockquote / списка. Это даёт правильный
 * результат без новой зависимости в bundle.
 */

import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
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
  CATEGORY_LABELS,
  type CreatePublicationRequest,
  type PublicationCategory,
  type PublicationLang,
} from '../../types/publications'

const route = useRoute()
const router = useRouter()

// Меню/заголовок выбираем по роли - одна форма для admin/employee/eco-operator.
const role = computed(() => authStore.userRole.value)
const adminBundle = useAdminMenu()
const employeeBundle = useEmployeeMenu()
const ecoBundle = useEcoOperatorMenu()
const layoutBundle = computed(() => {
  if (role.value === 'employee' || role.value === 'ministry') return employeeBundle
  if (role.value === 'eco-operator') return ecoBundle
  return adminBundle
})

// Категории, доступные конкретной роли:
//   - CONTEST имеет право публиковать только Эко-Оператор и Admin
//     (МПРЭТН-сотрудник конкурсы НЕ публикует - это ответственность Эко-Оператора).
const allowedCategories = computed<PublicationCategory[]>(() => {
  const all: PublicationCategory[] = ['news', 'contest', 'report_analytics', 'press']
  if (role.value === 'employee' || role.value === 'ministry') {
    return all.filter(c => c !== 'contest')
  }
  return all
})

// ─── State ────────────────────────────────────────────────────────────
const editingId = computed(() => {
  const v = route.params.id
  return v ? Number(v) : null
})
const isEdit = computed(() => editingId.value !== null)
const isLoading = ref(false)
const isSaving = ref(false)
const activeLang = ref<PublicationLang>('ru')
const coverFile = ref<File | null>(null)
const coverPreview = ref<string>('')

const form = reactive<{
  category: PublicationCategory
  slug: string
  coverUrl: string
  readMinutes: number | null
  ru: { title: string; excerpt: string; body: string }
  ky: { title: string; excerpt: string; body: string }
  en: { title: string; excerpt: string; body: string }
}>({
  category: 'news',
  slug: '',
  coverUrl: '',
  readMinutes: null,
  ru: { title: '', excerpt: '', body: '' },
  ky: { title: '', excerpt: '', body: '' },
  en: { title: '', excerpt: '', body: '' },
})

// Если у роли есть ограничения на категорию - синхронизируем default'.
watch(allowedCategories, (cats) => {
  if (!cats.includes(form.category)) form.category = cats[0]
}, { immediate: true })

// ─── Load (edit) ──────────────────────────────────────────────────────
//
// Текущий бэк возвращает GET /publications/{id} только в RU-версии (hasKy/hasEn -
// флаги наличия). Если у записи есть KY/EN перевод, поля в форме придётся
// заполнить заново при редактировании - это TODO для будущего расширения
// бэка (вернуть all-langs payload отдельным эндпойнтом). Для MVP:
// редактируем RU свободно, KY/EN дописываем при необходимости.
async function loadExisting() {
  if (!editingId.value) return
  isLoading.value = true
  try {
    const ru = await publicationsApi.getById(editingId.value)
    form.category = ru.category
    form.slug = ru.slug
    form.coverUrl = ru.coverUrl || ''
    form.readMinutes = ru.readMinutes
    form.ru.title = ru.title
    form.ru.excerpt = ru.excerpt
    form.ru.body = ru.body
    // KY/EN-поля остаются пустыми; редактор заполнит их вручную при
    // необходимости (бэк примет частичный update без ky/en).
  } catch (e: any) {
    toastStore.show({
      type: 'error', title: 'Не удалось загрузить публикацию',
      message: e?.response?.data?.message || '',
    })
    router.push('/admin/publications')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadExisting)

// ─── Cover upload ─────────────────────────────────────────────────────
function onCoverChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] || null
  coverFile.value = file
  if (file) {
    const reader = new FileReader()
    reader.onload = () => { coverPreview.value = reader.result as string }
    reader.readAsDataURL(file)
  } else {
    coverPreview.value = ''
  }
}

// ─── Quick-insert HTML helpers ────────────────────────────────────────
function insertHtml(snippet: string) {
  const cur = form[activeLang.value].body || ''
  // Добавляем с новой строки для читаемости HTML-исходника
  form[activeLang.value].body = cur ? `${cur}\n${snippet}` : snippet
}

const snippets: Array<{ label: string; html: string }> = [
  { label: 'Лид-абзац', html: '<p class="lead">Краткое введение к статье…</p>' },
  { label: 'Заголовок H2', html: '<h2>Подзаголовок</h2>' },
  { label: 'Абзац', html: '<p>Текст абзаца.</p>' },
  { label: 'Цитата', html: '<blockquote>Цитата автора или ключевая мысль.</blockquote>' },
  { label: 'Список', html: '<ul>\n  <li>Пункт 1</li>\n  <li>Пункт 2</li>\n  <li>Пункт 3</li>\n</ul>' },
]

// ─── Save ─────────────────────────────────────────────────────────────
const isValid = computed(() => {
  return form.ru.title.trim().length > 0
    && form.ru.excerpt.trim().length > 0
    && form.ru.body.trim().length > 0
})

async function onSave() {
  if (!isValid.value) {
    toastStore.show({
      type: 'error',
      title: 'Не заполнены обязательные поля',
      message: 'Заголовок, лид и текст на русском обязательны.',
    })
    activeLang.value = 'ru'
    return
  }

  isSaving.value = true
  try {
    const payload: CreatePublicationRequest = {
      category: form.category,
      slug: form.slug.trim() || null,
      coverUrl: form.coverUrl.trim() || null,
      readMinutes: form.readMinutes,
      titleRu: form.ru.title.trim(),
      excerptRu: form.ru.excerpt.trim(),
      bodyRu: form.ru.body.trim(),
      titleKy: form.ky.title.trim() || null,
      excerptKy: form.ky.excerpt.trim() || null,
      bodyKy: form.ky.body.trim() || null,
      titleEn: form.en.title.trim() || null,
      excerptEn: form.en.excerpt.trim() || null,
      bodyEn: form.en.body.trim() || null,
    }

    let saved
    if (isEdit.value && editingId.value) {
      saved = await publicationsApi.update(editingId.value, payload)
    } else {
      saved = await publicationsApi.create(payload)
    }

    // Загрузка cover-картинки (если выбрана) - отдельный запрос.
    if (coverFile.value && saved?.id) {
      try {
        await publicationsApi.uploadCover(saved.id, coverFile.value)
      } catch (e: any) {
        toastStore.show({
          type: 'warning', title: 'Публикация сохранена, но обложка не загрузилась',
          message: e?.response?.data?.message || '',
        })
      }
    }

    toastStore.show({
      type: 'success',
      title: isEdit.value ? 'Изменения сохранены' : 'Публикация создана',
    })
    router.push('/admin/publications')
  } catch (e: any) {
    toastStore.show({
      type: 'error', title: 'Не удалось сохранить',
      message: e?.response?.data?.message || '',
    })
  } finally {
    isSaving.value = false
  }
}

function onCancel() {
  router.push('/admin/publications')
}

const langTabs: Array<{ id: PublicationLang; label: string; required: boolean }> = [
  { id: 'ru', label: 'Русский', required: true },
  { id: 'ky', label: 'Кыргызча', required: false },
  { id: 'en', label: 'English', required: false },
]

const langFilled = computed(() => ({
  ru: !!form.ru.title.trim() && !!form.ru.excerpt.trim() && !!form.ru.body.trim(),
  ky: !!form.ky.title.trim() && !!form.ky.excerpt.trim() && !!form.ky.body.trim(),
  en: !!form.en.title.trim() && !!form.en.excerpt.trim() && !!form.en.body.trim(),
}))
</script>

<template>
  <DashboardLayout :roleTitle="layoutBundle.roleTitle.value" :menuItems="layoutBundle.menuItems.value">
    <div class="pubs-form-page space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <button class="text-sm text-gray-500 hover:text-gray-800 mb-1" @click="onCancel">
            ← К списку публикаций
          </button>
          <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
            {{ isEdit ? 'Редактирование публикации' : 'Новая публикация' }}
          </h1>
        </div>
        <div class="flex gap-2">
          <AppButton label="Отмена" variant="outline" @click="onCancel" :disabled="isSaving" />
          <AppButton
            :label="isSaving ? 'Сохранение…' : (isEdit ? 'Сохранить' : 'Создать')"
            variant="primary" @click="onSave" :disabled="isSaving || !isValid"
          />
        </div>
      </div>

      <SkeletonLoader v-if="isLoading" :rows="6" />

      <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <!-- ─── Левая колонка: контент ──────────────────────────────── -->
        <section class="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <!-- Lang tabs -->
          <div class="flex gap-1 bg-slate-50 p-1 rounded-lg w-fit">
            <button
              v-for="t in langTabs" :key="t.id"
              @click="activeLang = t.id"
              :class="['px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2',
                activeLang === t.id ? 'bg-white text-[#0d9488] shadow-sm' : 'text-slate-600 hover:text-slate-900']"
            >
              {{ t.label }}
              <span v-if="t.required" class="text-[10px] uppercase tracking-wider text-red-500">Обяз.</span>
              <span v-else-if="langFilled[t.id]" class="w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          </div>

          <!-- Title -->
          <div>
            <label class="pubs-form-label">Заголовок ({{ activeLang.toUpperCase() }})</label>
            <input
              v-model="form[activeLang].title"
              type="text" class="pubs-form-input"
              :placeholder="activeLang === 'ru' ? 'Например: Запущена онлайн-подача заявок на лицензию' : ''"
            />
          </div>

          <!-- Excerpt -->
          <div>
            <label class="pubs-form-label">Лид / краткое описание ({{ activeLang.toUpperCase() }})</label>
            <textarea
              v-model="form[activeLang].excerpt"
              rows="3" class="pubs-form-input"
              placeholder="2–3 предложения. Показываются на карточке и в соцпревью."
            />
          </div>

          <!-- Body -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="pubs-form-label !mb-0">Текст ({{ activeLang.toUpperCase() }}) - HTML</label>
              <div class="text-[11px] text-slate-400">
                Поддерживаются: &lt;p&gt;, &lt;h2&gt;, &lt;blockquote&gt;, &lt;ul&gt;/&lt;ol&gt;/&lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;
              </div>
            </div>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <button
                v-for="s in snippets" :key="s.label"
                type="button"
                class="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 hover:text-[#0d9488]"
                @click="insertHtml(s.html)"
              >
                + {{ s.label }}
              </button>
            </div>
            <textarea
              v-model="form[activeLang].body"
              rows="14" class="pubs-form-input pubs-form-input--mono"
              placeholder="<p class=&quot;lead&quot;>Введение…</p>&#10;<h2>Подзаголовок</h2>&#10;<p>Текст…</p>"
            />
          </div>
        </section>

        <!-- ─── Правая колонка: метаданные ──────────────────────────── -->
        <aside class="space-y-5">
          <!-- Категория -->
          <div class="bg-white rounded-xl border border-gray-100 p-5">
            <label class="pubs-form-label">Категория</label>
            <select v-model="form.category" class="pubs-form-input">
              <option v-for="c in allowedCategories" :key="c" :value="c">
                {{ CATEGORY_LABELS[c] }}
              </option>
            </select>
            <p v-if="role === 'employee' || role === 'ministry'" class="text-[11px] text-slate-400 mt-1.5">
              Конкурсы публикует Эко-Оператор - категория недоступна для сотрудников МПРЭТН.
            </p>
          </div>

          <!-- Slug -->
          <div class="bg-white rounded-xl border border-gray-100 p-5">
            <label class="pubs-form-label">Slug (URL)</label>
            <input
              v-model="form.slug"
              type="text" class="pubs-form-input pubs-form-input--mono"
              placeholder="otchet-utilsbor-q1-2026"
            />
            <p class="text-[11px] text-slate-400 mt-1.5">
              Если оставить пустым - сгенерируется автоматически из заголовка.
            </p>
          </div>

          <!-- Cover -->
          <div class="bg-white rounded-xl border border-gray-100 p-5">
            <label class="pubs-form-label">Обложка</label>
            <div
              v-if="coverPreview || form.coverUrl"
              class="w-full aspect-video rounded-lg bg-slate-100 bg-cover bg-center mb-3"
              :style="{ backgroundImage: `url(${coverPreview || form.coverUrl})` }"
            />
            <input
              type="file" accept="image/*"
              class="block text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md
                     file:border-0 file:text-xs file:font-semibold
                     file:bg-[#ecfdf5] file:text-[#0d9488] hover:file:bg-[#d1fae5]"
              @change="onCoverChange"
            />
            <div class="text-[11px] text-slate-400 mt-3">или ссылка:</div>
            <input
              v-model="form.coverUrl"
              type="text" class="pubs-form-input pubs-form-input--mono mt-1"
              placeholder="https://images.unsplash.com/…"
            />
          </div>

          <!-- Read minutes -->
          <div class="bg-white rounded-xl border border-gray-100 p-5">
            <label class="pubs-form-label">Время чтения, мин</label>
            <input
              v-model.number="form.readMinutes"
              type="number" min="1" max="60" class="pubs-form-input"
              placeholder="Авто (по объёму текста)"
            />
            <p class="text-[11px] text-slate-400 mt-1.5">
              Если не задано - рассчитывается автоматически (~200 слов/мин).
            </p>
          </div>
        </aside>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.pubs-form-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.03em;
  margin-bottom: 6px;
  text-transform: uppercase;
}
.pubs-form-input {
  width: 100%;
  padding: 9px 12px;
  font-family: inherit;
  font-size: 14px;
  color: #0f172a;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.pubs-form-input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}
.pubs-form-input--mono {
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
  font-size: 13px;
}
textarea.pubs-form-input {
  resize: vertical;
  line-height: 1.55;
}
</style>
