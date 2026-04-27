<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { licenseStore } from '../../stores/licenses'
import { applicantApi } from '../../api/licenses'
import { authStore } from '../../stores/auth'
import type {
  ApplicantEntity,
  ApplicantType,
  CreateApplicationRequest,
  LicenseDocumentType,
  LicenseType,
} from '../../types/licenses'

import PageHeader from '../../components/licenses-flow/PageHeader.vue'
import Stepper from '../../components/licenses-flow/Stepper.vue'
import FormCard from '../../components/licenses-flow/FormCard.vue'
import FormField from '../../components/licenses-flow/FormField.vue'
import SectionLabel from '../../components/licenses-flow/SectionLabel.vue'
import KeyVal from '../../components/licenses-flow/KeyVal.vue'
import GuideCard from '../../components/licenses-flow/GuideCard.vue'
import '../../components/licenses-flow/palette.css'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems, primaryAction } = useBusinessMenu()

const editId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => !!editId.value)

const step = ref(1)
const saving = ref(false)
const error = ref<string | null>(null)

const STEPS = ['Заявитель', 'Вид лицензии', 'Адреса', 'Документы', 'Проверка', 'Оплата']

// 4 визуальных варианта ОПФ (как в mockup) → маппятся на 2 enum'а API (legal_entity / sole_proprietor)
const orgForm = ref<'llc' | 'jsc' | 'ip' | 'other'>(
  (authStore.state.user as { orgForm?: 'llc' | 'jsc' | 'ip' | 'other' })?.orgForm || 'llc'
)
const entityOptions = [
  { value: 'llc', short: 'ОсОО', label: 'Общество с ОО', entity: 'legal_entity' },
  { value: 'jsc', short: 'ОАО', label: 'Акционерное общество', entity: 'legal_entity' },
  { value: 'ip', short: 'ИП', label: 'Индивидуальный предприниматель', entity: 'sole_proprietor' },
  { value: 'other', short: 'Иная', label: 'Другая форма', entity: 'legal_entity' },
] as const
function pickOrgForm(v: 'llc' | 'jsc' | 'ip' | 'other') {
  orgForm.value = v
  const opt = entityOptions.find(o => o.value === v)
  if (opt) form.value.applicantEntity = opt.entity as ApplicantEntity
}

const applicantTypeOptions = [
  { value: 'recycler', label: 'Переработчик', desc: 'Механическая / химическая обработка отходов' },
  { value: 'landfill', label: 'Полигон ТБО', desc: 'Захоронение и длительное хранение' },
  { value: 'collection_point', label: 'Пункт приёма', desc: 'Сбор и первичная сортировка' },
  { value: 'other', label: 'Иная организация', desc: 'Не подходит ни один из вариантов' },
]

// hue значения для типов лицензий (для градиентов карточек)
const LICENSE_HUES: Record<string, number> = {
  complex: 165,
  storage_disposal: 28,
  transportation: 205,
  processing: 140,
  collection: 260,
  neutralization: 0,
}
const LICENSE_SHORTS: Record<string, string> = {
  complex: 'К',
  storage_disposal: 'Х',
  transportation: 'Т',
  processing: 'П',
  collection: 'С',
  neutralization: 'О',
}
function hueOf(lt: string) {
  return LICENSE_HUES[lt] ?? 165
}
function shortOf(lt: string) {
  return LICENSE_SHORTS[lt] ?? '·'
}
const STEP_GUIDES: { title: string; description: string }[] = [
  { title: 'Заявитель', description: 'Укажите реквизиты организации-заявителя. ИНН должен совпадать с вашей учётной записью.' },
  { title: 'Вид лицензии', description: 'Выберите лицензируемый вид деятельности. Допускается несколько связанных видов в одной заявке.' },
  { title: 'Адреса и контакты', description: 'Юридический и фактический адреса объекта. На фактический адрес будет проведён выезд инспекторов.' },
  { title: 'Документы', description: 'Загрузите обязательные документы пакета. Опциональные можно приложить позже.' },
  { title: 'Проверка', description: 'Проверьте данные перед отправкой. После оплаты редактирование возможно только через инспектора.' },
  { title: 'Оплата', description: 'Оплатите госпошлину онлайн или приложите квитанцию. После подтверждения заявка уходит инспектору.' },
]

const form = ref<CreateApplicationRequest>({
  applicantType: 'recycler' as ApplicantType,
  applicantEntity: 'legal_entity' as ApplicantEntity,
  applicantName: '',
  applicantInn: authStore.state.user?.inn || '',
  licenseType: 'complex' as LicenseType,
  activityTypes: [],
  legalAddress: '',
  actualAddress: '',
  contactPhone: '',
  contactEmail: '',
  contactPerson: '',
})

// Запрашиваемый срок лицензии (1-5 лет, ст. 20 Закона КР № 181 от 15.08.2023).
// Ввод заявителя — окончательный срок устанавливает инспектор при выдаче.
const requestedTermYears = ref<number>(5)

// Категория лицензии: «Транспортировка» отдельно или «вся деятельность с отходами».
// Маппится на бэкенд licenseType: transportation → 'transportation', complex → 'complex'.
type LicenseCategory = 'transportation' | 'complex'
const licenseCategory = computed<LicenseCategory>(() =>
  form.value.licenseType === 'transportation' ? 'transportation' : 'complex'
)
function setCategory(cat: LicenseCategory) {
  form.value.licenseType = (cat === 'transportation' ? 'transportation' : 'complex') as LicenseType
  // При переключении на «транспортировку» сбрасываем подвиды.
  if (cat === 'transportation') form.value.activityTypes = []
}

// 4 подвида деятельности для complex (ст. 20 Закона № 181):
const ACTIVITY_KINDS = [
  { value: 'treatment',      label: 'Обработка',              desc: 'Сортировка, разборка, очистка отходов' },
  { value: 'recycling',      label: 'Переработка',            desc: 'Производство продукции / получение энергии' },
  { value: 'neutralization', label: 'Уничтожение',            desc: 'Сжигание, обеззараживание, снижение массы' },
  { value: 'disposal',       label: 'Хранение и захоронение', desc: 'Размещение в специализированных хранилищах' },
] as const
function toggleActivityKind(value: string) {
  const idx = form.value.activityTypes.indexOf(value)
  if (idx === -1) form.value.activityTypes.push(value)
  else form.value.activityTypes.splice(idx, 1)
}
function isActivityChecked(value: string) {
  return form.value.activityTypes.includes(value)
}

onMounted(async () => {
  await licenseStore.loadEnums(form.value.licenseType)
  if (editId.value) {
    try {
      const app = await applicantApi.getMyApplication(editId.value)
      form.value = {
        applicantType: app.applicantType,
        applicantId: app.applicantId ?? null,
        applicantEntity: app.applicantEntity,
        applicantName: app.applicantName,
        applicantInn: app.applicantInn,
        licenseType: app.licenseType,
        activityTypes: app.activityTypes || [],
        legalAddress: app.legalAddress,
        actualAddress: app.actualAddress,
        contactPhone: app.contactPhone,
        contactEmail: app.contactEmail,
        contactPerson: app.contactPerson,
      }
      await licenseStore.reloadDocumentTypes(app.licenseType)
      currentApp.value = app
      uploadedDocTypes.value = new Set((app.documents || []).map(d => d.docType))
    } catch (e: unknown) {
      error.value = 'Не удалось загрузить заявку'
    }
  }
})

watch(
  () => form.value.licenseType,
  async (val) => {
    if (val) await licenseStore.reloadDocumentTypes(val)
  },
)

// ─── документы ───

const currentApp = ref<import('../../types/licenses').LicenseApplication | null>(null)
const uploadedDocTypes = ref<Set<string>>(new Set())

const requiredDocs = computed(() =>
  licenseStore.state.documentTypesEnum.filter(d => d.extra?.required),
)
const optionalDocs = computed(() =>
  licenseStore.state.documentTypesEnum.filter(d => !d.extra?.required),
)

function isUploaded(docType: string) {
  return uploadedDocTypes.value.has(docType)
}
const requiredDone = computed(() =>
  requiredDocs.value.filter(d => isUploaded(d.value)).length,
)
const optionalDone = computed(() =>
  optionalDocs.value.filter(d => isUploaded(d.value)).length,
)

async function onFileSelected(docType: LicenseDocumentType, event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  if (!currentApp.value) {
    error.value = 'Сначала сохраните черновик (шаги 1–3), затем загружайте документы'
    return
  }
  try {
    const updated = await applicantApi.uploadDocument(currentApp.value.id, docType, file)
    currentApp.value = updated
    uploadedDocTypes.value = new Set((updated.documents || []).map(d => d.docType))
  } catch (e: unknown) {
    error.value = extractErrorMessage(e, 'Не удалось загрузить файл')
  } finally {
    input.value = ''
  }
}

// ─── виды деятельности ───

const newActivity = ref('')
const addingActivity = ref(false)
const activityInput = ref<HTMLInputElement | null>(null)

function addActivity() {
  const v = newActivity.value.trim()
  if (!v) return
  if (!form.value.activityTypes.includes(v)) form.value.activityTypes.push(v)
  newActivity.value = ''
}
function removeActivity(index: number) {
  form.value.activityTypes.splice(index, 1)
}
function startAddActivity() {
  addingActivity.value = true
  newActivity.value = ''
  nextTick(() => activityInput.value?.focus())
}
function confirmAddActivity() {
  addActivity()
  addingActivity.value = false
}
function cancelAddActivity() {
  newActivity.value = ''
  addingActivity.value = false
}

// ─── навигация по шагам ───

async function saveDraftAndNext() {
  if (newActivity.value.trim()) addActivity()
  saving.value = true
  error.value = null
  try {
    if (!currentApp.value) {
      const created = await applicantApi.createDraft(form.value)
      currentApp.value = created
      await router.replace(`/business/license-applications/${created.id}/edit`)
    } else {
      const updated = await applicantApi.updateDraft(currentApp.value.id, form.value)
      currentApp.value = updated
    }
    step.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: unknown) {
    error.value = extractErrorMessage(e, 'Не удалось сохранить')
  } finally {
    saving.value = false
  }
}

function goToStep(s: number) {
  if (s < step.value) {
    step.value = s
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ─── оплата / отправка ───

const paymentMode = ref<'online' | 'offline'>('online')
const offlineReceiptFile = ref<File | null>(null)
const offlineAmount = ref<number>(1000)
const offlineDate = ref<string>(new Date().toISOString().slice(0, 16))

async function submit() {
  if (!currentApp.value) return
  if (newActivity.value.trim()) {
    addActivity()
    try {
      currentApp.value = await applicantApi.updateDraft(currentApp.value.id, form.value)
    } catch {}
  }
  saving.value = true
  error.value = null
  try {
    if (paymentMode.value === 'offline') {
      if (!offlineReceiptFile.value) {
        error.value = 'Приложите скан квитанции'
        saving.value = false
        return
      }
      await applicantApi.submitOfflineReceipt(
        currentApp.value.id,
        offlineReceiptFile.value,
        { amount: offlineAmount.value, paidAt: offlineDate.value + ':00' },
      )
      router.push(`/business/license-applications/${currentApp.value.id}`)
    } else {
      await applicantApi.submit(currentApp.value.id, { paymentMode: 'online' })
      const intent = await applicantApi.createPaymentIntent(
        currentApp.value.id,
        window.location.origin + `/business/license-applications/${currentApp.value.id}`,
      )
      window.location.href = intent.paymentUrl
    }
  } catch (e: unknown) {
    error.value = extractErrorMessage(e, 'Ошибка отправки')
  } finally {
    saving.value = false
  }
}

function extractErrorMessage(e: unknown, fallback: string): string {
  const err = e as {
    response?: {
      data?: {
        message?: string
        error?: string
        details?: Array<{ field?: string; message?: string }>
      }
    }
    message?: string
  }
  const data = err.response?.data
  if (data?.details && data.details.length > 0) {
    const lines = data.details.map(d => `• ${d.field || ''}: ${d.message || ''}`)
    return (data.message || 'Ошибка валидации') + '\n' + lines.join('\n')
  }
  return data?.message || data?.error || err.message || fallback
}

function onReceiptFile(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) offlineReceiptFile.value = input.files[0]
}

// ─── computed labels ───

const licenseTypeLabel = computed(() => licenseStore.labelForLicenseType(form.value.licenseType))

const allDocs = computed(() => [...requiredDocs.value, ...optionalDocs.value])

const applicantTypeLabel = computed(() => ({
  recycler: 'Переработчик',
  landfill: 'Полигон ТБО',
  collection_point: 'Пункт приёма',
  other: 'Иная организация',
}[form.value.applicantType as string] || form.value.applicantType))

const applicantEntityLabel = computed(() =>
  form.value.applicantEntity === 'legal_entity' ? 'Юридическое лицо' : 'Индивидуальный предприниматель',
)

const savedLabel = computed(() => {
  if (!currentApp.value) return 'Черновик не создан'
  const d = new Date(currentApp.value.updatedAt || currentApp.value.createdAt)
  return `Черновик сохранён в ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})
</script>

<template>
  <DashboardLayout :role-title="roleTitle" :menu-items="menuItems" :primary-action="primaryAction">
    <div class="licenses-flow-page lf-wizard">
      <PageHeader
        :title="isEdit ? 'Редактирование заявки' : 'Новая заявка на лицензию'"
        subtitle="Заполните 6 шагов, чтобы подать заявку. Черновик сохраняется при переходе на следующий шаг."
        :breadcrumb="['Личный кабинет', 'Заявки', isEdit ? 'Редактирование' : 'Новая заявка']"
      />

      <FormCard :pad="20" class="lf-wizard__stepper-card">
        <Stepper :steps="STEPS" :current="step" @jump="goToStep" />
      </FormCard>

      <div v-if="error" class="lf-wizard__error">{{ error }}</div>

      <div class="lf-wizard__grid">
        <div class="lf-wizard__main">
          <!-- ── Step 1: заявитель ── -->
          <FormCard v-if="step === 1">
            <SectionLabel>Организационно-правовая форма</SectionLabel>
            <div class="lf-pick-grid lf-pick-grid--4">
              <button
                v-for="o in entityOptions"
                :key="o.value"
                type="button"
                class="lf-pick"
                :class="{ 'lf-pick--active': orgForm === o.value }"
                @click="pickOrgForm(o.value)"
              >
                <div class="lf-pick__title">{{ o.short }}</div>
                <div class="lf-pick__desc">{{ o.label }}</div>
              </button>
            </div>

            <SectionLabel mt>Реквизиты организации</SectionLabel>
            <div class="lf-wizard__grid-2">
              <FormField label="Наименование организации" required>
                <input v-model="form.applicantName" placeholder="ОсОО «…»" />
              </FormField>
              <FormField label="ИНН" required>
                <input v-model="form.applicantInn" class="mono" />
              </FormField>
            </div>

            <SectionLabel mt>Тип заявителя</SectionLabel>
            <div class="lf-pick-grid lf-pick-grid--2">
              <button
                v-for="o in applicantTypeOptions"
                :key="o.value"
                type="button"
                class="lf-pick lf-pick--tall"
                :class="{ 'lf-pick--active': form.applicantType === o.value }"
                @click="form.applicantType = o.value as ApplicantType"
              >
                <div class="lf-pick__head">
                  <div class="lf-pick__title">{{ o.label }}</div>
                  <svg
                    v-if="form.applicantType === o.value"
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                    class="lf-pick__check"
                  >
                    <path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div class="lf-pick__desc">{{ o.desc }}</div>
              </button>
            </div>
          </FormCard>

          <!-- ── Step 2: вид лицензии ── -->
          <FormCard v-if="step === 2">
            <SectionLabel>Категория лицензии</SectionLabel>
            <p class="lf-activity__hint">
              По ст. 20 Закона КР № 181 от 15.08.2023 лицензированию подлежат две категории деятельности.
            </p>
            <div class="lf-kind-grid">
              <button
                type="button"
                class="lf-kind"
                :class="{ 'lf-kind--active': licenseCategory === 'transportation' }"
                @click="setCategory('transportation')"
              >
                <div class="lf-kind__body">
                  <div class="lf-kind__title">Транспортировка</div>
                  <div class="lf-kind__fee">Перевозка отходов автомобильным, ж/д, воздушным или водным транспортом</div>
                </div>
                <svg
                  v-if="licenseCategory === 'transportation'"
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                  class="lf-kind__check"
                >
                  <path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                class="lf-kind"
                :class="{ 'lf-kind--active': licenseCategory === 'complex' }"
                @click="setCategory('complex')"
              >
                <div class="lf-kind__body">
                  <div class="lf-kind__title">Вся деятельность с отходами</div>
                  <div class="lf-kind__fee">Обработка, переработка, уничтожение, хранение и захоронение — выберите подвиды ниже</div>
                </div>
                <svg
                  v-if="licenseCategory === 'complex'"
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                  class="lf-kind__check"
                >
                  <path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <template v-if="licenseCategory === 'complex'">
              <SectionLabel mt>Подвиды деятельности</SectionLabel>
              <p class="lf-activity__hint">Отметьте все подвиды, которыми вы планируете заниматься. Можно несколько.</p>
              <div class="lf-activity-grid">
                <label
                  v-for="ak in ACTIVITY_KINDS"
                  :key="ak.value"
                  class="lf-activity-card"
                  :class="{ 'lf-activity-card--active': isActivityChecked(ak.value) }"
                >
                  <input
                    type="checkbox"
                    :checked="isActivityChecked(ak.value)"
                    @change="toggleActivityKind(ak.value)"
                    class="lf-activity-card__check"
                  />
                  <div class="lf-activity-card__body">
                    <div class="lf-activity-card__title">{{ ak.label }}</div>
                    <div class="lf-activity-card__desc">{{ ak.desc }}</div>
                  </div>
                </label>
              </div>
            </template>

            <SectionLabel mt>Запрашиваемый срок</SectionLabel>
            <p class="lf-activity__hint">Срок действия лицензии — от 1 до 5 лет. Окончательный срок устанавливает лицензирующий орган.</p>
            <div class="lf-term-grid">
              <button
                v-for="y in [1, 2, 3, 4, 5]"
                :key="y"
                type="button"
                class="lf-term-chip"
                :class="{ 'lf-term-chip--active': requestedTermYears === y }"
                @click="requestedTermYears = y"
              >
                {{ y }} {{ y === 1 ? 'год' : (y < 5 ? 'года' : 'лет') }}
              </button>
            </div>
          </FormCard>

          <!-- ── Step 3: адреса ── -->
          <FormCard v-if="step === 3">
            <SectionLabel>Адреса и контакты</SectionLabel>
            <div class="lf-wizard__stack">
              <FormField label="Юридический адрес" required>
                <textarea v-model="form.legalAddress" rows="2" />
              </FormField>
              <FormField
                label="Фактический адрес объекта"
                required
                hint="На этот адрес будет проведён выезд инспекторов"
              >
                <textarea v-model="form.actualAddress" rows="2" />
              </FormField>
              <div class="lf-wizard__grid-3">
                <FormField label="Телефон">
                  <input v-model="form.contactPhone" class="mono" placeholder="+996 (___) __-__-__" />
                </FormField>
                <FormField label="Email">
                  <input v-model="form.contactEmail" type="email" />
                </FormField>
                <FormField label="ФИО ответственного">
                  <input v-model="form.contactPerson" />
                </FormField>
              </div>
            </div>
          </FormCard>

          <!-- ── Step 4: документы ── -->
          <div v-if="step === 4" class="lf-wizard__stack">
            <FormCard v-if="!currentApp" class="lf-wizard__warn">
              <div class="lf-warn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16v.01" />
                </svg>
                <div>
                  Чтобы загружать документы, сначала сохраните черновик — пройдите шаги 1–3 и нажмите «Далее».
                </div>
              </div>
            </FormCard>

            <div class="lf-dropzone-big" :class="{ 'lf-dropzone-big--disabled': !currentApp }">
              <div class="lf-dropzone-big__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 3v13M6 12l6-5 6 5M4 21h16" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="lf-dropzone-big__title">Перетащите документы сюда</div>
              <div class="lf-dropzone-big__sub">
                или используйте кнопки «Загрузить» в списке ниже · PDF, JPG, PNG до 10 МБ
              </div>
            </div>

            <FormCard v-if="requiredDocs.length" :no-pad="true">
              <div class="lf-docs-head">
                <div>
                  <div class="lf-docs-title">Базовый пакет</div>
                  <div class="lf-docs-subtitle">Обязательные документы для лицензии «{{ licenseTypeLabel }}»</div>
                </div>
                <div class="lf-docs-progress">
                  <span class="lf-docs-progress__text" :class="{ 'lf-docs-progress__text--done': requiredDone === requiredDocs.length }">
                    {{ requiredDone }} из {{ requiredDocs.length }}
                  </span>
                  <div class="lf-docs-progress__bar">
                    <div
                      class="lf-docs-progress__fill"
                      :style="{ width: `${(requiredDone / requiredDocs.length) * 100}%` }"
                    />
                  </div>
                </div>
              </div>
              <div
                v-for="(doc, i) in requiredDocs"
                :key="doc.value"
                class="lf-doc"
                :class="{ 'lf-doc--last': i === requiredDocs.length - 1 }"
              >
                <div class="lf-doc__icon" :class="{ 'lf-doc__icon--done': isUploaded(doc.value) }">
                  <svg v-if="isUploaded(doc.value)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M5 12l5 5L20 7" stroke-linecap="round" />
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                  </svg>
                </div>
                <div class="lf-doc__info">
                  <div class="lf-doc__label">
                    {{ doc.labelRu }}
                    <span class="lf-doc__req">*</span>
                  </div>
                  <div class="lf-doc__meta">Обязательный</div>
                </div>
                <span v-if="isUploaded(doc.value)" class="lf-doc__status lf-doc__status--done">Загружено</span>
                <span v-else class="lf-doc__status lf-doc__status--pending">Не загружен</span>
                <label class="lf-doc__btn" :class="{ 'lf-doc__btn--disabled': !currentApp, 'lf-doc__btn--secondary': isUploaded(doc.value) }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="isUploaded(doc.value)" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle v-if="isUploaded(doc.value)" cx="12" cy="12" r="3" />
                    <path v-else d="M12 3v13M6 12l6-5 6 5M4 21h16" />
                  </svg>
                  {{ isUploaded(doc.value) ? 'Просмотр' : 'Загрузить' }}
                  <input
                    type="file"
                    class="lf-doc__input"
                    :disabled="!currentApp"
                    @change="e => onFileSelected(doc.value as LicenseDocumentType, e)"
                  />
                </label>
              </div>
            </FormCard>

            <FormCard v-if="optionalDocs.length" :no-pad="true">
              <div class="lf-docs-head">
                <div>
                  <div class="lf-docs-title">Дополнительный пакет</div>
                  <div class="lf-docs-subtitle">Опциональные документы — могут запросить дополнительно</div>
                </div>
                <div class="lf-docs-progress">
                  <span class="lf-docs-progress__text">
                    {{ optionalDone }} из {{ optionalDocs.length }}
                  </span>
                  <div class="lf-docs-progress__bar">
                    <div
                      class="lf-docs-progress__fill lf-docs-progress__fill--amber"
                      :style="{ width: `${(optionalDone / optionalDocs.length) * 100}%` }"
                    />
                  </div>
                </div>
              </div>
              <div
                v-for="(doc, i) in optionalDocs"
                :key="doc.value"
                class="lf-doc"
                :class="{ 'lf-doc--last': i === optionalDocs.length - 1 }"
              >
                <div class="lf-doc__icon" :class="{ 'lf-doc__icon--done': isUploaded(doc.value) }">
                  <svg v-if="isUploaded(doc.value)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M5 12l5 5L20 7" stroke-linecap="round" />
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                  </svg>
                </div>
                <div class="lf-doc__info">
                  <div class="lf-doc__label">{{ doc.labelRu }}</div>
                  <div class="lf-doc__meta">Опциональный</div>
                </div>
                <span v-if="isUploaded(doc.value)" class="lf-doc__status lf-doc__status--done">Загружено</span>
                <label class="lf-doc__btn lf-doc__btn--secondary" :class="{ 'lf-doc__btn--disabled': !currentApp }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="isUploaded(doc.value)" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle v-if="isUploaded(doc.value)" cx="12" cy="12" r="3" />
                    <path v-else d="M12 3v13M6 12l6-5 6 5M4 21h16" />
                  </svg>
                  {{ isUploaded(doc.value) ? 'Просмотр' : 'Загрузить' }}
                  <input
                    type="file"
                    class="lf-doc__input"
                    :disabled="!currentApp"
                    @change="e => onFileSelected(doc.value as LicenseDocumentType, e)"
                  />
                </label>
              </div>
            </FormCard>
          </div>

          <!-- ── Step 5: проверка ── -->
          <FormCard v-if="step === 5">
            <div class="lf-preview-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16v.01" />
              </svg>
              <div>Проверьте данные перед отправкой. После оплаты редактирование ограничено — только через обращение к инспектору.</div>
            </div>

            <div class="lf-preview-block">
              <SectionLabel>
                Заявитель
                <template #right>
                  <button class="lf-link" type="button" @click="step = 1">Редактировать</button>
                </template>
              </SectionLabel>
              <div class="lf-wizard__grid-3">
                <KeyVal label="Организация" :value="form.applicantName" />
                <KeyVal label="ИНН" :value="form.applicantInn" mono />
                <KeyVal label="ОПФ" :value="applicantEntityLabel" />
                <KeyVal label="Тип" :value="applicantTypeLabel" />
              </div>
            </div>

            <div class="lf-preview-block">
              <SectionLabel>
                Вид лицензии
                <template #right>
                  <button class="lf-link" type="button" @click="step = 2">Редактировать</button>
                </template>
              </SectionLabel>
              <div class="lf-preview-type">{{ licenseTypeLabel }}</div>
              <div v-if="form.activityTypes.length" class="lf-preview-activities">
                <span v-for="a in form.activityTypes" :key="a" class="lf-chip lf-chip--muted">
                  {{ ACTIVITY_KINDS.find(k => k.value === a)?.label || a }}
                </span>
              </div>
              <div class="lf-preview-term">Запрашиваемый срок: <b>{{ requestedTermYears }} {{ requestedTermYears === 1 ? 'год' : (requestedTermYears < 5 ? 'года' : 'лет') }}</b></div>
            </div>

            <div class="lf-preview-block">
              <SectionLabel>
                Адреса и контакты
                <template #right>
                  <button class="lf-link" type="button" @click="step = 3">Редактировать</button>
                </template>
              </SectionLabel>
              <div class="lf-wizard__grid-2">
                <KeyVal label="Юридический адрес" :value="form.legalAddress" />
                <KeyVal label="Фактический адрес" :value="form.actualAddress" />
                <KeyVal label="Телефон" :value="form.contactPhone" mono />
                <KeyVal label="Email" :value="form.contactEmail" />
                <KeyVal label="Ответственный" :value="form.contactPerson" />
              </div>
            </div>

            <div class="lf-preview-block">
              <SectionLabel>
                Документы
                <template #right>
                  <button class="lf-link" type="button" @click="step = 4">Редактировать</button>
                </template>
              </SectionLabel>
              <div class="lf-preview-docs">
                <div class="lf-preview-docs__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M5 12l5 5L20 7" stroke-linecap="round" />
                  </svg>
                </div>
                <div>
                  <div class="lf-preview-docs__title">
                    Загружено {{ (currentApp?.documents || []).length }} документов
                    <span v-if="requiredDocs.length">({{ requiredDone }} из {{ requiredDocs.length }} обязательных)</span>
                  </div>
                  <div class="lf-preview-docs__sub">
                    <template v-if="requiredDone < requiredDocs.length">
                      Не все обязательные документы загружены — вернитесь на шаг 4.
                    </template>
                    <template v-else>
                      Все обязательные документы приложены.
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </FormCard>

          <!-- ── Step 6: оплата ── -->
          <FormCard v-if="step === 6">
            <SectionLabel>Оплата государственной пошлины</SectionLabel>

            <div class="lf-fee">
              <div class="lf-fee__label">Сумма к оплате</div>
              <div class="lf-fee__value mono">1 000 сом</div>
              <div class="lf-fee__hint">Госпошлина за рассмотрение заявки «{{ licenseTypeLabel }}»</div>
            </div>

            <div class="lf-wizard__grid-2 lf-wizard__gap-sm">
              <button
                type="button"
                class="lf-pay-card"
                :class="{ 'lf-pay-card--active': paymentMode === 'online' }"
                @click="paymentMode = 'online'"
              >
                <div class="lf-pay-card__head">
                  <div class="lf-pay-card__icon lf-pay-card__icon--brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div class="lf-pay-card__title">Оплатить онлайн</div>
                </div>
                <div class="lf-pay-card__text">Карта Visa / Mastercard или Элдик. Зачисление за 5 минут, автоматический возврат в АИС.</div>
              </button>
              <button
                type="button"
                class="lf-pay-card"
                :class="{ 'lf-pay-card--active': paymentMode === 'offline' }"
                @click="paymentMode = 'offline'"
              >
                <div class="lf-pay-card__head">
                  <div class="lf-pay-card__icon lf-pay-card__icon--dark">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                    </svg>
                  </div>
                  <div class="lf-pay-card__title">Я уже оплатил офлайн</div>
                </div>
                <div class="lf-pay-card__text">Приложите квитанцию из банка или терминала. Подтверждение инспектором до 2 рабочих дней.</div>
              </button>
            </div>

            <div v-if="paymentMode === 'offline'" class="lf-offline">
              <label class="lf-dropzone" :class="{ 'lf-dropzone--filled': offlineReceiptFile }">
                <svg v-if="offlineReceiptFile" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M5 12l5 5L20 7" stroke-linecap="round" />
                </svg>
                <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 3v13M6 12l6-5 6 5M4 21h16" />
                </svg>
                <div>
                  <div class="lf-dropzone__title">
                    {{ offlineReceiptFile ? offlineReceiptFile.name : 'Загрузите скан квитанции' }}
                  </div>
                  <div class="lf-dropzone__sub">
                    {{ offlineReceiptFile
                      ? `${(offlineReceiptFile.size / 1024).toFixed(0)} КБ — кликните чтобы заменить`
                      : 'PDF или JPG, до 10 МБ' }}
                  </div>
                </div>
                <input type="file" accept="application/pdf,image/*" class="lf-dropzone__input" @change="onReceiptFile" />
              </label>
              <div class="lf-wizard__grid-2">
                <FormField label="Сумма, сом" required>
                  <input v-model.number="offlineAmount" type="number" class="mono" />
                </FormField>
                <FormField label="Дата и время оплаты" required>
                  <input v-model="offlineDate" type="datetime-local" class="mono" />
                </FormField>
              </div>
            </div>

            <div class="lf-info-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16v.01" />
              </svg>
              <div>
                После отправки заявка попадёт к инспектору. Если будет отказ, квитанция сохранится — повторная оплата не потребуется.
              </div>
            </div>
          </FormCard>
        </div>

        <aside class="lf-wizard__side">
          <GuideCard
            :step="step"
            :total="STEPS.length"
            :title="STEP_GUIDES[step - 1].title"
            :description="STEP_GUIDES[step - 1].description"
          />
          <FormCard :pad="14">
            <div class="lf-security">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" /><path d="M9 12l2 2 4-4" />
              </svg>
              <div>
                Данные защищены SSL-шифрованием. Черновик доступен 90 дней.
              </div>
            </div>
          </FormCard>
        </aside>
      </div>

      <div class="lf-wizard__footer">
        <button
          type="button"
          class="lf-btn lf-btn--ghost"
          :disabled="saving"
          @click="step > 1 ? step-- : router.push('/business/license-applications')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {{ step > 1 ? 'Назад' : 'Отмена' }}
        </button>
        <div class="lf-wizard__footer-status">
          <span class="lf-wizard__footer-dot" />
          {{ savedLabel }}
        </div>
        <button
          v-if="step < 6"
          type="button"
          class="lf-btn lf-btn--primary"
          :disabled="saving"
          @click="saveDraftAndNext"
        >
          {{ saving ? 'Сохранение…' : 'Далее' }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <button
          v-else
          type="button"
          class="lf-btn lf-btn--accent"
          :disabled="saving"
          @click="submit"
        >
          {{ saving
            ? 'Отправка…'
            : paymentMode === 'online' ? 'Оплатить и отправить' : 'Отправить заявку' }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.lf-wizard {
  padding: 24px 32px 140px;
  max-width: 1200px;
  margin: 0 auto;
}
.lf-wizard__stepper-card {
  margin-bottom: 20px;
}
.lf-wizard__error {
  background: var(--lf-rose-050);
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 16px;
  white-space: pre-line;
}
.lf-wizard__grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: flex-start;
}
.lf-wizard__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.lf-wizard__side {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lf-wizard__stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.lf-wizard__grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.lf-wizard__grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.lf-wizard__gap-sm {
  margin-top: 16px;
}
.lf-wizard__warn .lf-warn {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 13px;
  color: var(--lf-amber);
}
.lf-wizard__warn {
  background: var(--lf-amber-050);
  border-color: #fde68a;
}

/* ─── pick cards (Step 1 ОПФ и тип заявителя) ─── */
.lf-pick-grid {
  display: grid;
  gap: 10px;
}
.lf-pick-grid--2 {
  grid-template-columns: 1fr 1fr;
}
.lf-pick-grid--4 {
  grid-template-columns: repeat(4, 1fr);
}
.lf-pick {
  text-align: left;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--lf-line);
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
}
.lf-pick:hover {
  border-color: var(--lf-brand-100);
}
.lf-pick--active {
  border-color: var(--lf-brand);
  background: var(--lf-brand-050);
}
.lf-pick--tall {
  padding: 16px 18px;
}
.lf-pick__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.lf-pick__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--lf-ink);
}
.lf-pick--active .lf-pick__title {
  color: var(--lf-brand-700);
}
.lf-pick__desc {
  font-size: 11.5px;
  color: var(--lf-ink-3);
  margin-top: 3px;
  line-height: 1.45;
}
.lf-pick__check {
  color: var(--lf-brand);
  flex-shrink: 0;
}

/* ─── kind cards (Step 2 — 6 видов лицензий с hue) ─── */
.lf-kind-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.lf-activity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.lf-activity-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--lf-line);
  background: #fff;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease;
}
.lf-activity-card:hover {
  border-color: var(--lf-brand);
}
.lf-activity-card--active {
  border-color: var(--lf-brand);
  background: var(--lf-brand-050);
}
.lf-activity-card__check {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  accent-color: var(--lf-brand);
  flex-shrink: 0;
}
.lf-activity-card__body {
  flex: 1;
  min-width: 0;
}
.lf-activity-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--lf-ink);
}
.lf-activity-card__desc {
  font-size: 12px;
  color: var(--lf-ink-3);
  margin-top: 2px;
}
.lf-term-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.lf-term-chip {
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid var(--lf-line);
  background: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--lf-ink);
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease, color 0.12s ease;
}
.lf-term-chip:hover {
  border-color: var(--lf-brand);
  color: var(--lf-brand);
}
.lf-term-chip--active {
  background: var(--lf-brand);
  border-color: var(--lf-brand);
  color: #fff;
}
@media (max-width: 640px) {
  .lf-activity-grid {
    grid-template-columns: 1fr;
  }
}
.lf-kind {
  text-align: left;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--lf-line);
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  gap: 14px;
  align-items: center;
  transition: border-color 0.12s ease, background 0.12s ease;
}
.lf-kind:hover {
  border-color: var(--lf-brand);
}
.lf-kind--active {
  border-color: var(--lf-brand);
  background: var(--lf-brand-050);
}
.lf-kind__body {
  flex: 1;
  min-width: 0;
}
.lf-kind__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--lf-ink);
}
.lf-kind__fee {
  font-size: 11.5px;
  color: var(--lf-ink-3);
  margin-top: 3px;
}
.lf-kind__check {
  flex-shrink: 0;
  color: var(--lf-brand);
}
.lf-kind--active .lf-kind__title {
  color: var(--lf-brand-700);
}

/* ─── dropzone Step 4 ─── */
.lf-dropzone-big {
  background: var(--lf-brand-050);
  border: 2px dashed var(--lf-brand-100);
  border-radius: 14px;
  padding: 28px 24px;
  text-align: center;
  transition: all 0.15s ease;
}
.lf-dropzone-big:hover:not(.lf-dropzone-big--disabled) {
  border-color: var(--lf-brand);
  background: #fff;
}
.lf-dropzone-big--disabled {
  opacity: 0.55;
}
.lf-dropzone-big__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #fff;
  color: var(--lf-brand-700);
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
}
.lf-dropzone-big__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--lf-ink);
}
.lf-dropzone-big__sub {
  font-size: 12.5px;
  color: var(--lf-ink-3);
  margin-top: 4px;
}

/* ─── activities ─── */
.lf-activity-box {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px;
  border: 1px dashed var(--lf-line);
  border-radius: 10px;
  background: var(--lf-bg);
  min-height: 58px;
  align-items: center;
}
.lf-activity-box__input {
  flex: 1;
  min-width: 180px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--lf-brand);
  background: #fff;
  font-size: 12.5px;
  font-family: inherit;
  outline: none;
}
.lf-activity-box__input:focus {
  box-shadow: 0 0 0 3px var(--lf-brand-050);
}
.lf-activity__hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--lf-ink-4);
}
.lf-chip--add {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--lf-brand-050);
  color: var(--lf-brand-700);
  border: 1px dashed var(--lf-brand);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.lf-chip--add:hover {
  background: #fff;
}
.lf-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--lf-line);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--lf-ink-2);
}
.lf-chip--muted {
  background: var(--lf-line-2);
  border-color: var(--lf-line-2);
}
.lf-chip__x {
  border: none;
  background: transparent;
  color: var(--lf-ink-4);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  display: grid;
  place-items: center;
}
.lf-chip__x:hover {
  color: var(--lf-rose);
}

/* ─── documents ─── */
.lf-docs-head {
  padding: 14px 20px;
  border-bottom: 1px solid var(--lf-line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.lf-docs-title {
  font-size: 14px;
  font-weight: 600;
}
.lf-docs-subtitle {
  display: block;
  font-size: 11.5px;
  color: var(--lf-ink-4);
  font-weight: 500;
  margin-top: 2px;
}
.lf-docs-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lf-docs-progress__text {
  font-size: 12px;
  font-weight: 500;
  color: var(--lf-ink-3);
}
.lf-docs-progress__text--done {
  color: var(--lf-brand);
}
.lf-docs-progress__bar {
  width: 90px;
  height: 6px;
  background: var(--lf-line-2);
  border-radius: 3px;
  overflow: hidden;
}
.lf-docs-progress__fill {
  height: 100%;
  background: var(--lf-brand);
  border-radius: 3px;
  transition: width 0.4s ease;
}
.lf-docs-progress__fill--amber {
  background: var(--lf-accent);
}
.lf-doc {
  display: grid;
  grid-template-columns: 36px 1fr auto auto;
  gap: 14px;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--lf-line-2);
}
.lf-doc--last {
  border-bottom: none;
}
.lf-doc__icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--lf-line-2);
  color: var(--lf-ink-4);
  display: grid;
  place-items: center;
}
.lf-doc__icon--done {
  background: var(--lf-brand-050);
  color: var(--lf-brand);
}
.lf-doc__label {
  font-size: 13px;
  font-weight: 500;
}
.lf-doc__req {
  color: var(--lf-rose);
  margin-left: 3px;
}
.lf-doc__meta {
  font-size: 11px;
  color: var(--lf-ink-4);
  margin-top: 2px;
}
.lf-doc__status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
}
.lf-doc__status--done {
  background: var(--lf-brand-050);
  color: var(--lf-brand-700);
}
.lf-doc__status--pending {
  color: var(--lf-amber);
  background: var(--lf-amber-050);
}
.lf-doc__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--lf-brand);
  background: var(--lf-brand);
  color: #fff;
  white-space: nowrap;
  font-family: inherit;
  transition: filter 0.12s ease;
}
.lf-doc__btn:hover:not(.lf-doc__btn--disabled) {
  filter: brightness(1.08);
}
.lf-doc__btn--disabled {
  opacity: 0.45;
  pointer-events: none;
}
.lf-doc__btn--secondary {
  background: #fff;
  color: var(--lf-ink-2);
  border: 1px solid var(--lf-line);
}
.lf-doc__btn--secondary:hover:not(.lf-doc__btn--disabled) {
  border-color: var(--lf-brand);
  color: var(--lf-brand-700);
  filter: none;
}
.lf-doc__input {
  display: none;
}

/* ─── preview (step 5) ─── */
.lf-preview-note {
  padding: 12px 14px;
  background: var(--lf-amber-050);
  border: 1px solid #fde68a;
  border-radius: 10px;
  color: #92400e;
  font-size: 12.5px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 20px;
}
.lf-preview-block {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px dashed var(--lf-line);
}
.lf-preview-block:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}
.lf-preview-type {
  font-size: 15px;
  font-weight: 600;
  color: var(--lf-brand-700);
}
.lf-preview-term {
  margin-top: 8px;
  font-size: 13px;
  color: var(--lf-ink-3);
}
.lf-preview-term b {
  color: var(--lf-ink);
}
.lf-preview-activities {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.lf-preview-docs {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: var(--lf-bg);
  border-radius: 10px;
  align-items: flex-start;
}
.lf-preview-docs__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--lf-brand);
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.lf-preview-docs__title {
  font-size: 13px;
  font-weight: 600;
}
.lf-preview-docs__sub {
  font-size: 11.5px;
  color: var(--lf-ink-4);
  margin-top: 3px;
}
.lf-link {
  font-size: 12px;
  color: var(--lf-brand);
  background: transparent;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  text-transform: none;
  letter-spacing: 0;
}
.lf-link:hover {
  color: var(--lf-brand-700);
  text-decoration: underline;
}

/* ─── payment (step 6) ─── */
.lf-fee {
  padding: 18px;
  background: linear-gradient(135deg, var(--lf-brand-050) 0%, #fff 100%);
  border: 1px solid var(--lf-brand-100);
  border-radius: 12px;
  margin-bottom: 20px;
}
.lf-fee__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--lf-brand-700);
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.lf-fee__value {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.8px;
  color: var(--lf-brand-700);
  margin-top: 4px;
  line-height: 1;
}
.lf-fee__hint {
  font-size: 12.5px;
  color: var(--lf-ink-3);
  margin-top: 6px;
}
.lf-pay-card {
  text-align: left;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid var(--lf-line);
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
}
.lf-pay-card:hover {
  border-color: var(--lf-brand);
}
.lf-pay-card--active {
  border-color: var(--lf-brand);
  background: var(--lf-brand-050);
}
.lf-pay-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.lf-pay-card__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #fff;
  display: grid;
  place-items: center;
}
.lf-pay-card__icon--brand {
  background: var(--lf-brand);
}
.lf-pay-card__icon--dark {
  background: var(--lf-ink-2);
}
.lf-pay-card__title {
  font-size: 13.5px;
  font-weight: 600;
}
.lf-pay-card__text {
  font-size: 12px;
  color: var(--lf-ink-3);
  line-height: 1.4;
}
.lf-offline {
  margin-top: 16px;
  padding: 16px;
  background: var(--lf-bg);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lf-dropzone {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border: 2px dashed var(--lf-line);
  border-radius: 10px;
  cursor: pointer;
  background: #fff;
  transition: all 0.12s ease;
}
.lf-dropzone:hover {
  border-color: var(--lf-brand);
}
.lf-dropzone--filled {
  border-color: var(--lf-brand);
  background: var(--lf-brand-050);
  color: var(--lf-brand-700);
}
.lf-dropzone__title {
  font-size: 13.5px;
  font-weight: 600;
}
.lf-dropzone__sub {
  font-size: 11.5px;
  color: var(--lf-ink-4);
  margin-top: 2px;
}
.lf-dropzone__input {
  display: none;
}
.lf-info-note {
  margin-top: 16px;
  padding: 12px 14px;
  background: var(--lf-bg);
  border-radius: 10px;
  font-size: 12px;
  color: var(--lf-ink-3);
  display: flex;
  gap: 10px;
  align-items: flex-start;
  line-height: 1.5;
}

/* ─── security sidebar ─── */
.lf-security {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 11.5px;
  color: var(--lf-ink-3);
  line-height: 1.5;
}
.lf-security svg {
  color: var(--lf-brand);
  flex-shrink: 0;
}

/* ─── footer nav ─── */
.lf-wizard__footer {
  position: sticky;
  bottom: 0;
  margin: 20px -32px 0;
  padding: 14px 32px;
  background: #fff;
  border-top: 1px solid var(--lf-line);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
  box-shadow: 0 -4px 16px -8px rgba(15, 23, 42, 0.08);
}
.lf-wizard__footer-status {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--lf-ink-4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.lf-wizard__footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--lf-brand);
}
.lf-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: filter 0.12s ease, opacity 0.12s ease;
}
.lf-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.lf-btn--ghost {
  background: #fff;
  color: var(--lf-ink-2);
  border: 1px solid var(--lf-line);
}
.lf-btn--ghost:hover:not(:disabled) {
  background: var(--lf-bg);
}
.lf-btn--primary {
  background: var(--lf-brand);
  color: #fff;
}
.lf-btn--primary:hover:not(:disabled) {
  filter: brightness(1.08);
}
.lf-btn--accent {
  background: var(--lf-accent);
  color: #fff;
  box-shadow: 0 4px 12px -4px rgba(245, 154, 46, 0.5);
}
.lf-btn--accent:hover:not(:disabled) {
  filter: brightness(1.05);
}

.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

@media (max-width: 960px) {
  .lf-wizard__grid {
    grid-template-columns: 1fr;
  }
  .lf-wizard__side {
    position: static;
  }
  .lf-wizard__grid-3 {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
  .lf-pick-grid--4 {
    grid-template-columns: 1fr 1fr;
  }
  .lf-pick-grid--2 {
    grid-template-columns: 1fr;
  }
  .lf-kind-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .lf-wizard__grid-2 {
    grid-template-columns: 1fr;
  }
  .lf-wizard {
    padding: 16px 16px 140px;
  }
  .lf-wizard__footer {
    margin: 20px -16px 0;
    padding: 12px 16px;
    flex-wrap: wrap;
  }
  .lf-wizard__footer-status {
    order: -1;
    width: 100%;
  }
}
</style>
