<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()

const editId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => !!editId.value)

const step = ref(1)
const saving = ref(false)
const error = ref<string | null>(null)

const form = ref<CreateApplicationRequest>({
  applicantType: 'RECYCLER' as unknown as ApplicantType,
  applicantEntity: 'LEGAL_ENTITY' as unknown as ApplicantEntity,
  applicantName: '',
  applicantInn: authStore.state.user?.inn || '',
  licenseType: 'PROCESSING' as unknown as LicenseType,
  activityTypes: [],
  legalAddress: '',
  actualAddress: '',
  contactPhone: '',
  contactEmail: '',
  contactPerson: '',
})

// Нормализуем значения enum'ов в lowercase (бэк возвращает 'recycler', не 'RECYCLER')
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
  } else {
    // По умолчанию — переводим enums в lowercase
    form.value.applicantType = 'recycler' as ApplicantType
    form.value.applicantEntity = 'legal_entity' as ApplicantEntity
    form.value.licenseType = 'processing' as LicenseType
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

async function onFileSelected(docType: LicenseDocumentType, event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  if (!currentApp.value) {
    error.value = 'Сначала сохраните черновик (Шаг 1–3), затем загружайте документы'
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

// ─── добавление вида деятельности ───

const newActivity = ref('')

function addActivity() {
  const v = newActivity.value.trim()
  if (!v) return
  if (!form.value.activityTypes.includes(v)) form.value.activityTypes.push(v)
  newActivity.value = ''
}

function removeActivity(index: number) {
  form.value.activityTypes.splice(index, 1)
}

// ─── навигация по шагам ───

async function saveDraftAndNext() {
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
  } catch (e: unknown) {
    error.value = extractErrorMessage(e, 'Не удалось сохранить')
  } finally {
    saving.value = false
  }
}

// ─── финальная отправка ───

const paymentMode = ref<'online' | 'offline'>('online')
const offlineReceiptFile = ref<File | null>(null)
const offlineAmount = ref<number>(1000)
const offlineDate = ref<string>(new Date().toISOString().slice(0, 16))

async function submit() {
  if (!currentApp.value) return
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
      // Online: сначала фиксируем submit → PAYMENT_PENDING, затем создаём intent → редирект.
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

/** Достаёт осмысленное сообщение из axios-ошибки: приоритет response.data.message. */
function extractErrorMessage(e: unknown, fallback: string): string {
  const err = e as {
    response?: { data?: { message?: string; error?: string } }
    message?: string
  }
  return err.response?.data?.message
    || err.response?.data?.error
    || err.message
    || fallback
}

function onReceiptFile(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) offlineReceiptFile.value = input.files[0]
}
</script>

<template>
  <DashboardLayout :role-title="roleTitle" :menu-items="menuItems">
    <div class="px-6 py-6">
      <div class="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <router-link to="/business/license-applications" class="hover:text-emerald-600">Мои заявки</router-link>
        <span>›</span>
        <span class="text-gray-800">{{ isEdit ? 'Редактирование' : 'Новая заявка' }}</span>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 mb-2">Заявка на лицензию</h1>
      <p class="text-sm text-gray-500 mb-6">В сфере обращения с отходами</p>

      <!-- Step indicator -->
      <div class="flex gap-2 mb-8">
        <div
          v-for="s in 6"
          :key="s"
          :class="[
            'flex-1 h-2 rounded-full',
            s <= step ? 'bg-emerald-500' : 'bg-gray-200',
          ]"
        />
      </div>

      <div v-if="error" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg mb-4 text-sm">
        {{ error }}
      </div>

      <!-- ── Step 1: заявитель ── -->
      <div v-if="step === 1" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Шаг 1. Заявитель</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Тип заявителя</label>
            <select v-model="form.applicantType" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="recycler">Переработчик</option>
              <option value="landfill">Полигон ТБО</option>
              <option value="collection_point">Пункт приёма</option>
              <option value="other">Иная организация</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Организационно-правовая форма</label>
            <select v-model="form.applicantEntity" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="legal_entity">Юридическое лицо</option>
              <option value="sole_proprietor">Индивидуальный предприниматель</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Наименование *</label>
            <input v-model="form.applicantName" class="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ИНН *</label>
            <input v-model="form.applicantInn" class="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
      </div>

      <!-- ── Step 2: вид лицензии ── -->
      <div v-if="step === 2" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Шаг 2. Вид лицензии</h2>
        <label class="block text-sm font-medium text-gray-700 mb-1">Запрашиваемый вид лицензии *</label>
        <select v-model="form.licenseType" class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 max-w-md">
          <option v-for="opt in licenseStore.state.licenseTypesEnum" :key="opt.value" :value="opt.value">
            {{ opt.labelRu }}
          </option>
        </select>

        <label class="block text-sm font-medium text-gray-700 mb-1 mt-4">Виды деятельности</label>
        <div class="flex gap-2 mb-2">
          <input
            v-model="newActivity"
            @keyup.enter.prevent="addActivity"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Например: сортировка"
          />
          <button
            type="button"
            @click="addActivity"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
          >
            Добавить
          </button>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="(act, i) in form.activityTypes"
            :key="act"
            class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm"
          >
            {{ act }}
            <button type="button" @click="removeActivity(i)" class="ml-1 text-emerald-600 hover:text-emerald-900">×</button>
          </span>
        </div>
      </div>

      <!-- ── Step 3: адреса и контакты ── -->
      <div v-if="step === 3" class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 class="text-lg font-semibold mb-4">Шаг 3. Адреса и контакты</h2>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Юридический адрес *</label>
          <textarea v-model="form.legalAddress" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Фактический адрес осуществления деятельности *</label>
          <textarea v-model="form.actualAddress" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input v-model="form.contactPhone" class="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.contactEmail" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ФИО ответственного</label>
            <input v-model="form.contactPerson" class="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
      </div>

      <!-- ── Step 4: документы ── -->
      <div v-if="step === 4" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Шаг 4. Документы</h2>
        <p class="text-sm text-gray-600 mb-4">
          Для выбранного вида лицензии (<strong>{{ licenseStore.labelForLicenseType(form.licenseType) }}</strong>)
          необходимо загрузить следующие документы:
        </p>

        <div v-if="!currentApp" class="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-4 text-sm">
          Для загрузки документов сначала сохраните черновик, нажав «Далее».
        </div>

        <div class="space-y-3">
          <div
            v-for="doc in [...requiredDocs, ...optionalDocs]"
            :key="doc.value"
            class="flex items-center justify-between p-3 border rounded-lg"
            :class="doc.extra?.required ? 'border-gray-300' : 'border-gray-200 bg-gray-50'"
          >
            <div>
              <div class="text-sm font-medium text-gray-900">
                {{ doc.labelRu }}
                <span v-if="doc.extra?.required" class="text-rose-600 ml-1">*</span>
              </div>
              <div class="text-xs text-gray-500 mt-0.5">{{ doc.extra?.required ? 'Обязательный' : 'Опциональный' }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="isUploaded(doc.value)" class="text-xs text-emerald-600 font-medium">✓ Загружен</span>
              <label class="cursor-pointer px-3 py-1.5 text-xs border border-gray-300 hover:bg-gray-100 rounded-md">
                {{ isUploaded(doc.value) ? 'Заменить' : 'Загрузить' }}
                <input
                  type="file"
                  class="hidden"
                  :disabled="!currentApp"
                  @change="e => onFileSelected(doc.value as LicenseDocumentType, e)"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Step 5: предпросмотр ── -->
      <div v-if="step === 5" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Шаг 5. Предпросмотр</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div><dt class="text-gray-500">Заявитель</dt><dd class="font-medium">{{ form.applicantName }} (ИНН {{ form.applicantInn }})</dd></div>
          <div><dt class="text-gray-500">Вид лицензии</dt><dd class="font-medium">{{ licenseStore.labelForLicenseType(form.licenseType) }}</dd></div>
          <div><dt class="text-gray-500">Юридический адрес</dt><dd>{{ form.legalAddress }}</dd></div>
          <div><dt class="text-gray-500">Фактический адрес</dt><dd>{{ form.actualAddress }}</dd></div>
          <div><dt class="text-gray-500">Контакт</dt><dd>{{ form.contactPerson || '—' }}, {{ form.contactPhone || '—' }}</dd></div>
          <div>
            <dt class="text-gray-500">Виды деятельности</dt>
            <dd class="flex flex-wrap gap-1 mt-1">
              <span v-for="a in form.activityTypes" :key="a" class="px-2 py-0.5 bg-gray-100 rounded text-xs">{{ a }}</span>
            </dd>
          </div>
        </dl>
        <div class="mt-6">
          <div class="text-sm text-gray-500 mb-2">Загруженные документы:</div>
          <ul class="text-sm space-y-1">
            <li v-for="d in currentApp?.documents || []" :key="d.id">
              ✓ {{ licenseStore.state.documentTypesEnum.find(e => e.value === d.docType)?.labelRu || d.docType }}
              — <span class="text-gray-500">{{ d.fileName }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- ── Step 6: оплата ── -->
      <div v-if="step === 6" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Шаг 6. Оплата государственной пошлины</h2>
        <p class="text-sm text-gray-600 mb-4">
          Размер пошлины: <strong>1&nbsp;000 сом</strong>. Выберите способ оплаты:
        </p>

        <div class="space-y-3 mb-6">
          <label class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer"
                 :class="paymentMode === 'online' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'">
            <input type="radio" v-model="paymentMode" value="online" class="mt-1" />
            <div>
              <div class="font-medium">Оплатить онлайн</div>
              <div class="text-sm text-gray-500">Карта / QR через платёжный шлюз. После оплаты автоматический возврат в АИС.</div>
            </div>
          </label>
          <label class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer"
                 :class="paymentMode === 'offline' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'">
            <input type="radio" v-model="paymentMode" value="offline" class="mt-1" />
            <div>
              <div class="font-medium">Я уже оплатил офлайн</div>
              <div class="text-sm text-gray-500">Приложить скан квитанции (касса банка, терминал). Подтверждение сотрудником вручную.</div>
            </div>
          </label>
        </div>

        <div v-if="paymentMode === 'offline'" class="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Квитанция (скан или фото, до 10 МБ)</label>
            <input type="file" @change="onReceiptFile" class="text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Сумма, сом</label>
              <input v-model.number="offlineAmount" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Дата и время оплаты</label>
              <input v-model="offlineDate" type="datetime-local" class="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Navigation ── -->
      <div class="flex justify-between mt-6">
        <button
          @click="step > 1 ? step-- : router.push('/business/license-applications')"
          class="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {{ step > 1 ? '← Назад' : 'Отмена' }}
        </button>
        <button
          v-if="step < 6"
          @click="saveDraftAndNext"
          :disabled="saving"
          class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {{ saving ? 'Сохранение…' : 'Далее →' }}
        </button>
        <button
          v-else
          @click="submit"
          :disabled="saving"
          class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {{ saving ? 'Отправка…' : (paymentMode === 'online' ? 'Оплатить и отправить' : 'Отправить заявку') }}
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>
