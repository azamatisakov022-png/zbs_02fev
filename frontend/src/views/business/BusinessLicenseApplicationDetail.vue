<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { licenseStore } from '../../stores/licenses'
import { applicantApi, licenseRegistryApi } from '../../api/licenses'
import type { LicenseApplication, LicenseApplicationStatus } from '../../types/licenses'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()

const app = ref<LicenseApplication | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const reopening = ref(false)

const appId = computed(() => Number(route.params.id))

async function load() {
  loading.value = true
  error.value = null
  try {
    await licenseStore.loadEnums()
    app.value = await applicantApi.getMyApplication(appId.value)
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Не удалось загрузить заявку'
  } finally {
    loading.value = false
  }
}

async function downloadLicense() {
  if (!app.value?.licenseId) return
  try {
    const blob = await licenseRegistryApi.downloadDocument(app.value.licenseId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = app.value.licenseDocumentFileName || (app.value.licenseNumber || 'license') + '.pdf'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    error.value = 'Не удалось скачать файл'
  }
}

onMounted(load)

async function reopen() {
  if (!app.value) return
  if (!confirm('Переоткрыть заявку для повторной подачи? Госпошлина сохраняется, платить повторно не нужно.')) return
  reopening.value = true
  try {
    const updated = await applicantApi.reopen(app.value.id)
    app.value = updated
    router.push(`/business/license-applications/${updated.id}/edit`)
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Ошибка переоткрытия'
  } finally {
    reopening.value = false
  }
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

function rejectionReasonLabel(r?: string) {
  if (!r) return ''
  return licenseStore.state.rejectionReasonsEnum.find(e => e.value === r)?.labelRu || r
}

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleDateString('ru-RU') : '—'
}
</script>

<template>
  <DashboardLayout :role-title="roleTitle" :menu-items="menuItems">
    <div class="px-6 py-6 max-w-5xl mx-auto">
      <div class="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <router-link to="/business/license-applications" class="hover:text-emerald-600">Мои заявки</router-link>
        <span>›</span>
        <span class="text-gray-800">Заявка #{{ appId }}</span>
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-400">Загрузка…</div>
      <div v-else-if="error" class="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg">{{ error }}</div>
      <div v-else-if="app" class="space-y-6">
        <!-- Заголовок и статус -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ licenseStore.labelForLicenseType(app.licenseType) }}
            </h1>
            <div class="text-sm text-gray-500 mt-1">{{ app.applicantName }}</div>
          </div>
          <span
            :class="['inline-flex px-3 py-1.5 text-sm font-medium rounded-full', statusBadgeClass(app.status)]"
          >
            {{ licenseStore.labelForStatus(app.status) }}
          </span>
        </div>

        <!-- Статус: APPROVED / REJECTED — специальные блоки -->
        <div
          v-if="app.status === 'approved' && app.licenseNumber"
          class="bg-emerald-50 border border-emerald-200 rounded-lg p-6"
        >
          <div class="text-center">
            <div class="text-2xl mb-2">🎉</div>
            <div class="text-lg font-semibold text-emerald-800">Лицензия выдана</div>
            <div class="text-2xl font-bold text-emerald-900 my-2">{{ app.licenseNumber }}</div>
            <div class="text-sm text-emerald-700">Лицензия опубликована в публичном реестре.</div>
          </div>

          <!-- Электронная копия подписанной лицензии -->
          <div class="mt-4 pt-4 border-t border-emerald-200">
            <div v-if="app.licenseHasDocument" class="flex items-center justify-between bg-white rounded-md p-3 border border-emerald-200">
              <div class="text-sm">
                <div class="font-medium text-gray-900">📄 Подписанная лицензия (PDF)</div>
                <div class="text-xs text-gray-500">{{ app.licenseDocumentFileName }}</div>
              </div>
              <button
                @click="downloadLicense"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium"
              >
                ⬇ Скачать лицензию
              </button>
            </div>
            <div v-else class="text-sm text-emerald-700 text-center italic">
              Подписанный бумажный оригинал готовится. Как только сотрудник МПРЭТН
              загрузит скан, он появится здесь для скачивания.
            </div>
          </div>
        </div>

        <div
          v-if="app.status === 'rejected'"
          class="bg-rose-50 border border-rose-200 rounded-lg p-6"
        >
          <div class="text-lg font-semibold text-rose-800 mb-2">Заявка отклонена</div>
          <div class="text-sm text-rose-900 mb-1">
            <strong>Основание:</strong> {{ rejectionReasonLabel(app.rejectionReason) }}
          </div>
          <div v-if="app.rejectionComment" class="text-sm text-rose-900 mb-4 whitespace-pre-line">
            <strong>Комментарий:</strong> {{ app.rejectionComment }}
          </div>
          <button
            @click="reopen"
            :disabled="reopening"
            class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {{ reopening ? 'Обработка…' : 'Доработать и подать заново' }}
          </button>
          <p class="text-xs text-rose-700 mt-2">
            Платёж госпошлины сохраняется. Повторная оплата не требуется.
          </p>
        </div>

        <!-- Информация о заявке -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4">Сведения о заявке</h2>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt class="text-gray-500">ИНН</dt><dd class="font-medium">{{ app.applicantInn }}</dd></div>
            <div><dt class="text-gray-500">Наименование</dt><dd class="font-medium">{{ app.applicantName }}</dd></div>
            <div class="md:col-span-2"><dt class="text-gray-500">Юридический адрес</dt><dd>{{ app.legalAddress }}</dd></div>
            <div class="md:col-span-2"><dt class="text-gray-500">Фактический адрес</dt><dd>{{ app.actualAddress }}</dd></div>
            <div><dt class="text-gray-500">Контакт</dt><dd>{{ app.contactPerson || '—' }}</dd></div>
            <div><dt class="text-gray-500">Телефон/Email</dt><dd>{{ app.contactPhone || '—' }} / {{ app.contactEmail || '—' }}</dd></div>
            <div><dt class="text-gray-500">Подана</dt><dd>{{ formatDate(app.submittedAt) }}</dd></div>
            <div>
              <dt class="text-gray-500">Срок рассмотрения</dt>
              <dd>
                {{ formatDate(app.deadline) }}
                <span v-if="app.daysLeft !== undefined && app.daysLeft < 0" class="text-rose-600 text-xs ml-1">(просрочено)</span>
                <span v-else-if="app.daysLeft !== undefined" class="text-gray-500 text-xs ml-1">(осталось {{ app.daysLeft }} дн.)</span>
              </dd>
            </div>
            <div v-if="app.reopenedCount !== undefined && app.reopenedCount > 0" class="md:col-span-2">
              <dt class="text-gray-500">Заявка переоткрывалась</dt>
              <dd>{{ app.reopenedCount }} раз</dd>
            </div>
          </dl>
        </div>

        <!-- Выезд -->
        <div v-if="app.siteVisitDone" class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4">Выезд на объект</h2>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt class="text-gray-500">Дата выезда</dt><dd>{{ formatDate(app.siteVisitDate) }}</dd></div>
            <div><dt class="text-gray-500">Инспектор / секретарь</dt><dd>{{ app.siteVisitInspector }}</dd></div>
            <div v-if="app.siteVisitComment" class="md:col-span-2">
              <dt class="text-gray-500">Комментарий</dt>
              <dd class="whitespace-pre-line">{{ app.siteVisitComment }}</dd>
            </div>
          </dl>
        </div>

        <!-- Платёж -->
        <div v-if="app.payment" class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4">Оплата</h2>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt class="text-gray-500">Провайдер</dt><dd>{{ app.payment.provider }}</dd></div>
            <div><dt class="text-gray-500">Статус</dt><dd>{{ app.payment.status }}</dd></div>
            <div v-if="app.payment.paidAt"><dt class="text-gray-500">Оплачено</dt><dd>{{ formatDate(app.payment.paidAt) }}</dd></div>
            <div v-if="app.payment.receiptFileName"><dt class="text-gray-500">Квитанция</dt><dd>{{ app.payment.receiptFileName }}</dd></div>
          </dl>
        </div>

        <!-- Действия -->
        <div v-if="app.status === 'draft'" class="flex gap-3">
          <router-link
            :to="`/business/license-applications/${app.id}/edit`"
            class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            Продолжить заполнение
          </router-link>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
