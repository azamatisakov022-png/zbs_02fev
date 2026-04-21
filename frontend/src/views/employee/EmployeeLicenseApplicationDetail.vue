<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { licenseStore } from '../../stores/licenses'
import { adminApplicationApi, licenseRegistryApi } from '../../api/licenses'
import type {
  License,
  LicenseApplication,
  LicenseApplicationStatus,
  RejectionReason,
} from '../../types/licenses'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEmployeeMenu()

const app = ref<LicenseApplication | null>(null)
const license = ref<License | null>(null)
const uploadingDoc = ref(false)
const loading = ref(true)
const busy = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// формы
const rejectOpen = ref(false)
const rejectReason = ref<RejectionReason | ''>('')
const rejectComment = ref('')

const siteVisitForm = ref({ date: new Date().toISOString().slice(0, 10), inspector: '', comment: '' })
const approveForm = ref({ validUntil: '' })

const appId = computed(() => Number(route.params.id))

async function load() {
  loading.value = true
  try {
    await licenseStore.loadEnums()
    app.value = await adminApplicationApi.getById(appId.value)
    // дефолт срока действия: +3 года
    const d = new Date()
    d.setFullYear(d.getFullYear() + 3)
    approveForm.value.validUntil = d.toISOString().slice(0, 10)
    // Если лицензия уже выдана — подгружаем её, чтобы знать про загруженный PDF
    if (app.value?.licenseId) {
      try { license.value = await licenseRegistryApi.getById(app.value.licenseId) } catch {}
    }
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Не удалось загрузить заявку'
  } finally {
    loading.value = false
  }
}

/** Загрузка сотрудником подписанного PDF-скана. */
async function onUploadLicenseDocument(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0 || !license.value) return
  const file = input.files[0]
  uploadingDoc.value = true
  error.value = null
  try {
    license.value = await licenseRegistryApi.uploadDocument(license.value.id, file)
    success.value = 'Подписанная лицензия загружена. Заявитель может её скачать.'
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = err.response?.data?.message || err.message || 'Не удалось загрузить файл'
  } finally {
    uploadingDoc.value = false
    input.value = ''
  }
}

async function downloadLicense() {
  if (!license.value) return
  try {
    const blob = await licenseRegistryApi.downloadDocument(license.value.id)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = license.value.documentFileName || license.value.licenseNumber + '.pdf'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    error.value = 'Не удалось скачать файл'
  }
}

onMounted(load)

async function doAccept() {
  if (!app.value) return
  busy.value = true
  error.value = null
  try {
    app.value = await adminApplicationApi.accept(app.value.id)
    success.value = 'Заявка принята к рассмотрению'
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Ошибка'
  } finally { busy.value = false }
}

async function doReject() {
  if (!app.value || !rejectReason.value) return
  busy.value = true
  error.value = null
  try {
    app.value = await adminApplicationApi.reject(app.value.id, {
      reason: rejectReason.value,
      comment: rejectComment.value || undefined,
    })
    success.value = 'Заявка отклонена, заявитель уведомлён'
    rejectOpen.value = false
    rejectReason.value = ''
    rejectComment.value = ''
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Ошибка'
  } finally { busy.value = false }
}

async function doSiteVisit() {
  if (!app.value) return
  if (!siteVisitForm.value.inspector.trim()) {
    error.value = 'Укажите ФИО инспектора'
    return
  }
  busy.value = true
  error.value = null
  try {
    app.value = await adminApplicationApi.recordSiteVisit(app.value.id, { ...siteVisitForm.value })
    success.value = 'Данные выезда сохранены'
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Ошибка'
  } finally { busy.value = false }
}

async function doApprove() {
  if (!app.value) return
  if (!approveForm.value.validUntil) {
    error.value = 'Укажите срок действия лицензии'
    return
  }
  if (!confirm('Выдать лицензию? После этого заявитель получит уведомление, лицензия попадёт в публичный реестр.')) return
  busy.value = true
  error.value = null
  try {
    app.value = await adminApplicationApi.approve(app.value.id, {
      validUntil: approveForm.value.validUntil,
    })
    success.value = `Лицензия выдана: ${app.value.licenseNumber}`
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Ошибка выдачи'
  } finally { busy.value = false }
}

async function doConfirmManualPayment() {
  if (!app.value || !app.value.payment) return
  if (!confirm('Подтвердить офлайн-оплату? Квитанция считается корректной, заявка готова к рассмотрению.')) return
  busy.value = true
  try {
    await adminApplicationApi.confirmManualPayment(app.value.payment.id)
    await load()
    success.value = 'Оплата подтверждена'
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Ошибка подтверждения'
  } finally { busy.value = false }
}

function statusBadgeClass(s: LicenseApplicationStatus) {
  const map: Record<LicenseApplicationStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    payment_pending: 'bg-amber-100 text-amber-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-indigo-100 text-indigo-800',
    site_visit_done: 'bg-cyan-100 text-cyan-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
  }
  return map[s] || 'bg-gray-100 text-gray-700'
}

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleDateString('ru-RU') : '—'
}

const canAccept = computed(() => app.value?.status === 'submitted')
const canReject = computed(() => app.value && ['submitted', 'under_review', 'site_visit_done'].includes(app.value.status))
const canSiteVisit = computed(() => app.value && (app.value.status === 'under_review' || app.value.status === 'site_visit_done'))
const canApprove = computed(() => app.value?.status === 'site_visit_done' && app.value?.payment && ['SUCCESS', 'MANUAL_CONFIRMED'].includes(app.value.payment.status))
const canConfirmManualPayment = computed(
  () => app.value?.payment && app.value.payment.status === 'PENDING' && app.value.payment.paymentMethod === 'MANUAL_OFFLINE',
)
</script>

<template>
  <DashboardLayout :role-title="roleTitle" :menu-items="menuItems">
    <div class="px-6 py-6 max-w-6xl mx-auto">
      <div class="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <router-link to="/employee/licenses" class="hover:text-emerald-600">Лицензии</router-link>
        <span>›</span>
        <span class="text-gray-800">Заявка #{{ appId }}</span>
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-400">Загрузка…</div>
      <div v-else-if="!app" class="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg">
        {{ error || 'Заявка не найдена' }}
      </div>
      <div v-else class="space-y-6">
        <!-- Messages -->
        <div v-if="success" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-sm">{{ success }}</div>
        <div v-if="error" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm">{{ error }}</div>

        <!-- Заголовок -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Заявка #{{ app.id }}</h1>
            <div class="text-sm text-gray-500 mt-1">{{ licenseStore.labelForLicenseType(app.licenseType) }}</div>
          </div>
          <span :class="['inline-flex px-3 py-1.5 text-sm font-medium rounded-full', statusBadgeClass(app.status)]">
            {{ licenseStore.labelForStatus(app.status) }}
          </span>
        </div>

        <!-- Срок -->
        <div v-if="app.deadline" :class="['rounded-lg border p-4', (app.daysLeft || 0) < 5 ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200']">
          <div class="text-sm">
            <strong>Срок рассмотрения:</strong> до {{ formatDate(app.deadline) }}
            <span v-if="(app.daysLeft || 0) < 0" class="text-rose-700 font-medium ml-2">({{ -(app.daysLeft || 0) }} дн. просрочено)</span>
            <span v-else class="ml-2">({{ app.daysLeft }} дн. осталось)</span>
          </div>
        </div>

        <!-- Заявитель -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4">Заявитель</h2>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt class="text-gray-500">Наименование</dt><dd class="font-medium">{{ app.applicantName }}</dd></div>
            <div><dt class="text-gray-500">ИНН</dt><dd>{{ app.applicantInn }}</dd></div>
            <div><dt class="text-gray-500">Тип</dt><dd>{{ app.applicantType }}</dd></div>
            <div><dt class="text-gray-500">Орг.-правовая форма</dt><dd>{{ app.applicantEntity }}</dd></div>
            <div class="md:col-span-2"><dt class="text-gray-500">Юридический адрес</dt><dd>{{ app.legalAddress }}</dd></div>
            <div class="md:col-span-2"><dt class="text-gray-500">Фактический адрес</dt><dd>{{ app.actualAddress }}</dd></div>
            <div><dt class="text-gray-500">Контакт</dt><dd>{{ app.contactPerson || '—' }}</dd></div>
            <div><dt class="text-gray-500">Телефон/Email</dt><dd>{{ app.contactPhone || '—' }} / {{ app.contactEmail || '—' }}</dd></div>
          </dl>
        </div>

        <!-- Документы -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4">Документы ({{ (app.documents || []).length }})</h2>
          <div v-if="!app.documents || app.documents.length === 0" class="text-sm text-gray-500">Документы не загружены</div>
          <ul v-else class="space-y-2">
            <li
              v-for="d in app.documents"
              :key="d.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md text-sm"
            >
              <div>
                <div class="font-medium">
                  {{ licenseStore.state.documentTypesEnum.find(e => e.value === d.docType)?.labelRu || d.docType }}
                </div>
                <div class="text-xs text-gray-500">{{ d.fileName }} • {{ ((d.fileSize || 0) / 1024).toFixed(0) }} КБ</div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Платёж -->
        <div v-if="app.payment" class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Оплата госпошлины</h2>
            <button
              v-if="canConfirmManualPayment"
              @click="doConfirmManualPayment"
              :disabled="busy"
              class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium"
            >
              Подтвердить оплату
            </button>
          </div>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt class="text-gray-500">Провайдер</dt><dd>{{ app.payment.provider }}</dd></div>
            <div><dt class="text-gray-500">Статус</dt><dd class="font-medium">{{ app.payment.status }}</dd></div>
            <div v-if="app.payment.paidAt"><dt class="text-gray-500">Оплачено</dt><dd>{{ formatDate(app.payment.paidAt) }}</dd></div>
            <div v-if="app.payment.receiptFileName"><dt class="text-gray-500">Квитанция</dt><dd>{{ app.payment.receiptFileName }}</dd></div>
          </dl>
        </div>

        <!-- Секция: принять/отклонить (SUBMITTED) -->
        <div v-if="canAccept || canReject" class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4">Рассмотрение заявки</h2>
          <div class="flex gap-3">
            <button
              v-if="canAccept"
              @click="doAccept"
              :disabled="busy"
              class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              Принять к рассмотрению
            </button>
            <button
              v-if="canReject"
              @click="rejectOpen = true"
              :disabled="busy"
              class="px-5 py-2.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg font-medium disabled:opacity-50"
            >
              Отклонить
            </button>
          </div>
        </div>

        <!-- Секция: выезд (UNDER_REVIEW или SITE_VISIT_DONE) -->
        <div v-if="canSiteVisit" class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4">Выезд на объект</h2>
          <p class="text-sm text-gray-500 mb-4">
            Выезд обязателен для всех типов лицензий и должен быть проведён внутри 30-дневного срока.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Дата выезда *</label>
              <input v-model="siteVisitForm.date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ФИО инспектора / секретаря *</label>
              <input v-model="siteVisitForm.inspector" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
              <textarea v-model="siteVisitForm.comment" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
          <button
            @click="doSiteVisit"
            :disabled="busy"
            class="mt-4 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {{ app.siteVisitDone ? 'Обновить данные выезда' : 'Зафиксировать выезд' }}
          </button>
        </div>

        <!-- Секция: финальная выдача (SITE_VISIT_DONE + оплачено) -->
        <div v-if="canApprove" class="bg-white rounded-lg border border-emerald-300 bg-emerald-50 p-6">
          <h2 class="text-lg font-semibold mb-4 text-emerald-900">Выдача лицензии</h2>
          <div class="max-w-sm mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Срок действия до *</label>
            <input v-model="approveForm.validUntil" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            <p class="text-xs text-gray-500 mt-1">Бессрочных лицензий не бывает. Обычная практика — 3–5 лет.</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="doApprove"
              :disabled="busy"
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              Выдать лицензию
            </button>
            <button
              @click="rejectOpen = true"
              :disabled="busy"
              class="px-5 py-2.5 border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg font-medium disabled:opacity-50"
            >
              Отклонить
            </button>
          </div>
        </div>

        <!-- Статус-блок: одобрено -->
        <div v-if="app.status === 'approved' && app.licenseNumber" class="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <div class="text-center">
            <div class="text-2xl mb-2">🎉</div>
            <div class="text-lg font-semibold text-emerald-800">Лицензия выдана</div>
            <div class="text-2xl font-bold text-emerald-900 my-2">{{ app.licenseNumber }}</div>
          </div>

          <!-- Блок загрузки/скачивания подписанной копии -->
          <div class="mt-4 pt-4 border-t border-emerald-200">
            <div class="text-sm font-medium text-emerald-900 mb-2">📄 Электронная копия подписанной лицензии</div>

            <div v-if="license?.hasDocument" class="flex items-center justify-between bg-white rounded-md p-3 border border-emerald-200">
              <div class="text-sm">
                <div class="font-medium text-gray-900">✓ {{ license.documentFileName }}</div>
                <div class="text-xs text-gray-500">
                  Загружено: {{ new Date(license.documentUploadedAt!).toLocaleString('ru-RU') }}
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="downloadLicense"
                  class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium"
                >
                  Скачать
                </button>
                <label class="cursor-pointer px-3 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-md text-sm">
                  Заменить
                  <input type="file" class="hidden" accept="application/pdf,image/*"
                         :disabled="uploadingDoc" @change="onUploadLicenseDocument" />
                </label>
              </div>
            </div>

            <div v-else class="bg-white rounded-md p-3 border border-dashed border-emerald-300">
              <p class="text-sm text-gray-600 mb-3">
                Распечатайте бланк, подпишите у замминистра, поставьте печать, отсканируйте
                и загрузите PDF — заявитель сможет скачать подписанную копию из своего ЛК.
              </p>
              <label class="inline-block cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium">
                {{ uploadingDoc ? 'Загрузка…' : 'Загрузить подписанный PDF' }}
                <input type="file" class="hidden" accept="application/pdf,image/*"
                       :disabled="uploadingDoc" @change="onUploadLicenseDocument" />
              </label>
            </div>
          </div>
        </div>

        <!-- Статус-блок: отклонено -->
        <div v-if="app.status === 'rejected'" class="bg-rose-50 border border-rose-200 rounded-lg p-6">
          <div class="text-lg font-semibold text-rose-800 mb-2">Заявка отклонена</div>
          <div class="text-sm text-rose-900 mb-1">
            <strong>Основание:</strong>
            {{ licenseStore.state.rejectionReasonsEnum.find(e => e.value === app.rejectionReason)?.labelRu || app.rejectionReason }}
          </div>
          <div v-if="app.rejectionComment" class="text-sm text-rose-900 whitespace-pre-line">
            <strong>Комментарий:</strong> {{ app.rejectionComment }}
          </div>
        </div>

        <!-- Модалка отклонения -->
        <div
          v-if="rejectOpen"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="rejectOpen = false"
        >
          <div class="bg-white rounded-xl max-w-md w-full p-6">
            <h3 class="text-lg font-semibold mb-4">Отклонить заявку</h3>
            <label class="block text-sm font-medium text-gray-700 mb-1">Основание отказа *</label>
            <select v-model="rejectReason" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3">
              <option value="">Выберите основание</option>
              <option v-for="r in licenseStore.state.rejectionReasonsEnum" :key="r.value" :value="r.value">{{ r.labelRu }}</option>
            </select>
            <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий (опционально)</label>
            <textarea v-model="rejectComment" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4" />
            <p class="text-xs text-gray-500 mb-4">
              После отклонения заявитель увидит причину в своём ЛК. Для устранимых оснований он сможет доработать и подать повторно с той же квитанцией.
            </p>
            <div class="flex justify-end gap-2">
              <button @click="rejectOpen = false" class="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-md text-sm">Отмена</button>
              <button
                @click="doReject"
                :disabled="!rejectReason || busy"
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
