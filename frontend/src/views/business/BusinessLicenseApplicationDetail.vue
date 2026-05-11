<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { licenseStore } from '../../stores/licenses'
import { applicantApi, licenseRegistryApi } from '../../api/licenses'
import type { LicenseApplication, DocumentItem } from '../../types/licenses'

import PageHeader from '../../components/licenses-flow/PageHeader.vue'
import FormCard from '../../components/licenses-flow/FormCard.vue'
import SectionLabel from '../../components/licenses-flow/SectionLabel.vue'
import KeyVal from '../../components/licenses-flow/KeyVal.vue'
import Lifecycle from '../../components/licenses-flow/Lifecycle.vue'
import DocsGrid from '../../components/licenses-flow/DocsGrid.vue'
import TimelinePanel, { type TimelineEvent } from '../../components/licenses-flow/TimelinePanel.vue'
import InProgressHero from '../../components/licenses-flow/InProgressHero.vue'
import ApprovedHero from '../../components/licenses-flow/ApprovedHero.vue'
import RejectedHero from '../../components/licenses-flow/RejectedHero.vue'
import '../../components/licenses-flow/palette.css'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems, primaryAction } = useBusinessMenu()

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

onMounted(load)

async function downloadLicense() {
  if (!app.value?.licenseId) return
  try {
    const blob = await licenseRegistryApi.downloadDocument(app.value.licenseId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = app.value.licenseDocumentFileName || (app.value.licenseNumber || 'license') + '.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    error.value = 'Не удалось скачать файл'
  }
}

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

function fmt(d?: string) {
  return d ? new Date(d).toLocaleDateString('ru-RU') : '-'
}
function fmtDateTime(d?: string) {
  if (!d) return ''
  const dt = new Date(d)
  const date = dt.toLocaleDateString('ru-RU')
  const time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
  return `${date} ${time}`
}

const licenseTypeLabel = computed(() =>
  app.value ? licenseStore.labelForLicenseType(app.value.licenseType) : '',
)
const rejectionReasonLabel = computed(() =>
  app.value?.rejectionReason
    ? licenseStore.state.rejectionReasonsEnum.find(e => e.value === app.value?.rejectionReason)?.labelRu || app.value.rejectionReason
    : '',
)
const rejectionReasonDesc = computed(() =>
  app.value?.rejectionReason
    ? String(licenseStore.state.rejectionReasonsEnum.find(e => e.value === app.value?.rejectionReason)?.extra?.description || '')
    : '',
)

const docsByType = computed(() => {
  const map = new Map<string, string>()
  for (const e of licenseStore.state.documentTypesEnum) map.set(e.value, e.labelRu)
  return map
})
function docLabel(d: DocumentItem) {
  return docsByType.value.get(d.docType) || d.docType
}

const timelineEvents = computed<TimelineEvent[]>(() => {
  if (!app.value) return []
  const a = app.value
  const events: TimelineEvent[] = []
  events.push({
    at: fmtDateTime(a.createdAt),
    title: 'Заявка создана',
    desc: 'Черновик сохранён',
    icon: 'check',
    done: true,
  })
  if (a.submittedAt) {
    events.push({
      at: fmtDateTime(a.submittedAt),
      title: 'Заявка подана',
      desc: 'Пакет документов передан инспектору',
      icon: 'check',
      done: true,
    })
  }
  if (a.payment?.paidAt) {
    events.push({
      at: fmtDateTime(a.payment.paidAt),
      title: 'Госпошлина оплачена',
      desc: a.payment.paymentMethod === 'manual_offline' ? 'Офлайн-платёж, подтверждён' : 'Онлайн-платёж',
      icon: 'bolt',
      done: true,
    })
  }
  if (a.siteVisitDone) {
    events.push({
      at: fmtDateTime(a.siteVisitDate) || '-',
      title: 'Выезд на объект проведён',
      desc: a.siteVisitInspector || '',
      icon: 'pin',
      done: true,
    })
  } else if (a.status === 'under_review' || a.status === 'submitted') {
    events.push({
      at: 'ожидается',
      title: 'Выезд на объект',
      desc: 'Будет назначен инспектором',
      icon: 'pin',
      done: false,
    })
  }
  if (a.status === 'approved') {
    events.push({
      at: fmtDateTime(a.updatedAt),
      title: 'Лицензия выдана',
      desc: a.licenseNumber ? `№ ${a.licenseNumber}` : '',
      icon: 'stamp',
      done: true,
    })
  } else if (a.status === 'rejected') {
    events.push({
      at: fmtDateTime(a.updatedAt),
      title: 'Заявка отклонена',
      desc: rejectionReasonLabel.value,
      icon: 'x',
      done: true,
    })
  } else {
    events.push({
      at: a.deadline ? `до ${fmt(a.deadline)}` : 'ожидается',
      title: 'Решение о выдаче лицензии',
      desc: 'Будет принято инспектором',
      icon: 'stamp',
      done: false,
    })
  }
  return events
})

const paymentStatusKey = computed(() =>
  app.value?.payment?.status ? String(app.value.payment.status).toLowerCase() : '',
)

const statusBadge = computed(() => {
  if (!app.value) return { label: '', class: '' }
  const labelsMap: Record<string, { label: string; class: string }> = {
    draft: { label: 'Черновик', class: 'state-draft' },
    payment_pending: { label: 'Ожидает оплаты', class: 'state-warn' },
    submitted: { label: 'Подана', class: 'state-info' },
    under_review: { label: 'На рассмотрении', class: 'state-info' },
    site_visit_done: { label: 'Выезд проведён', class: 'state-info' },
    approved: { label: 'Лицензия выдана', class: 'state-success' },
    rejected: { label: 'Отклонена', class: 'state-danger' },
  }
  return labelsMap[app.value.status] || { label: app.value.status, class: '' }
})

function initials(name?: string) {
  if (!name) return '-'
  return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function showQr() {
  alert(`Ссылка для проверки: reestr.kg/v/${app.value?.licenseNumber || ''}`)
}
function messageInspector() {
  alert('Канал обсуждения с инспектором будет доступен в следующей версии.')
}
</script>

<template>
  <DashboardLayout :role-title="roleTitle" :menu-items="menuItems" :primary-action="primaryAction">
    <div class="licenses-flow-page lf-detail">
      <PageHeader
        :title="licenseTypeLabel || 'Заявка на лицензию'"
        :breadcrumb="['Личный кабинет', 'Мои заявки', app ? `#${app.id}` : `#${appId}`]"
      >
        <template v-if="app" #subtitle>
          <span class="mono lf-detail__id">#{{ app.id }}</span>
          <span v-if="app.applicantName"> · {{ app.applicantName }}</span>
        </template>
      </PageHeader>

      <div v-if="loading" class="lf-detail__state">Загрузка заявки…</div>
      <div v-else-if="error" class="lf-detail__state lf-detail__state--error">{{ error }}</div>

      <template v-else-if="app">
        <!-- Hero в зависимости от статуса -->
        <InProgressHero
          v-if="app.status === 'submitted' || app.status === 'under_review' || app.status === 'site_visit_done'"
          :days-left="app.daysLeft"
          :status-label="statusBadge.label"
        />
        <ApprovedHero
          v-else-if="app.status === 'approved'"
          :license-number="app.licenseNumber"
          :issued-at="app.updatedAt"
          :license-type-label="licenseTypeLabel"
          :has-document="!!app.licenseHasDocument"
          @download="downloadLicense"
          @qr="showQr"
        />
        <RejectedHero
          v-else-if="app.status === 'rejected'"
          :reason-label="rejectionReasonLabel"
          :reason-desc="rejectionReasonDesc"
          :inspector-comment="app.rejectionComment"
          :rejected-at="app.updatedAt"
          :reopening="reopening"
          @reopen="reopen"
          @message="messageInspector"
        />
        <FormCard v-else class="lf-detail__draft-hero">
          <div class="lf-detail__draft-row">
            <div class="lf-detail__draft-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
              </svg>
            </div>
            <div style="flex:1">
              <div class="lf-detail__draft-eyebrow">{{ statusBadge.label }}</div>
              <div class="lf-detail__draft-title">
                <template v-if="app.status === 'draft'">Заявка-черновик - продолжите заполнение</template>
                <template v-else-if="app.status === 'payment_pending'">Ожидается оплата госпошлины</template>
              </div>
              <div class="lf-detail__draft-lead">
                <template v-if="app.status === 'draft'">
                  Вы можете вернуться к заполнению в любой момент. Черновик автоматически сохраняется.
                </template>
                <template v-else-if="app.status === 'payment_pending'">
                  После подтверждения платежа банком заявка автоматически уйдёт инспектору.
                </template>
              </div>
            </div>
            <router-link
              v-if="app.status === 'draft'"
              :to="`/business/license-applications/${app.id}/edit`"
              class="lf-detail__draft-btn"
            >
              Продолжить
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </FormCard>

        <!-- Основная сетка -->
        <div class="lf-detail__grid">
          <div class="lf-detail__main">
            <!-- Lifecycle (только для in-progress и черновика) -->
            <FormCard v-if="app.status !== 'approved' && app.status !== 'rejected'">
              <SectionLabel>Прогресс рассмотрения</SectionLabel>
              <Lifecycle :status="app.status" />
            </FormCard>

            <!-- Документы -->
            <FormCard v-if="app.documents && app.documents.length > 0" :no-pad="true">
              <div class="lf-detail__docs-head">
                <div class="lf-detail__docs-title">Документы ({{ app.documents.length }})</div>
              </div>
              <DocsGrid :docs="app.documents" :label-for="docLabel" @preview="() => {}" />
            </FormCard>

            <!-- Реквизиты -->
            <FormCard>
              <SectionLabel>Реквизиты заявки</SectionLabel>
              <div class="lf-detail__kvs">
                <KeyVal label="Организация" :value="app.applicantName" />
                <KeyVal label="ИНН" :value="app.applicantInn" mono />
                <KeyVal label="Дата подачи" :value="fmt(app.submittedAt)" mono />
                <KeyVal label="Адрес объекта" :value="app.actualAddress" />
                <KeyVal label="Срок рассмотрения" :value="fmt(app.deadline)" mono />
                <KeyVal label="Руководитель" :value="app.contactPerson" />
              </div>
            </FormCard>

            <!-- Хроника -->
            <FormCard>
              <SectionLabel>Хроника</SectionLabel>
              <TimelinePanel :events="timelineEvents" />
            </FormCard>
          </div>

          <aside class="lf-detail__side">
            <FormCard :pad="18">
              <SectionLabel>Куратор</SectionLabel>
              <div class="lf-detail__curator">
                <div class="lf-detail__avatar">
                  {{ initials(app.siteVisitInspector) }}
                </div>
                <div style="min-width:0">
                  <div class="lf-detail__curator-name">
                    {{ app.siteVisitInspector || 'Будет назначен' }}
                  </div>
                  <div class="lf-detail__curator-role">Инспектор МПРЭТН</div>
                </div>
              </div>
            </FormCard>

            <FormCard v-if="app.siteVisitDone" :pad="18">
              <SectionLabel>Выезд на объект</SectionLabel>
              <div class="lf-detail__site">
                <div class="lf-detail__site-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 21s-7-6-7-12a7 7 0 1114 0c0 6-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <div>
                  <div class="lf-detail__site-date">{{ fmt(app.siteVisitDate) }}</div>
                  <div class="lf-detail__site-sub">Проведён ✓</div>
                </div>
              </div>
              <div v-if="app.siteVisitComment" class="lf-detail__site-comment">{{ app.siteVisitComment }}</div>
            </FormCard>

            <FormCard :pad="18">
              <SectionLabel>Госпошлина</SectionLabel>
              <div class="lf-detail__fee-value mono">
                <template v-if="app.payment">1 000 с.</template>
                <template v-else>-</template>
              </div>
              <div v-if="app.payment" class="lf-detail__fee-status" :class="`lf-detail__fee-status--${paymentStatusKey}`">
                <svg
                  v-if="paymentStatusKey === 'success' || paymentStatusKey === 'manual_confirmed'"
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                ><path d="M5 12l5 5L20 7" stroke-linecap="round" /></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                </svg>
                <template v-if="paymentStatusKey === 'success'">Оплачено · онлайн</template>
                <template v-else-if="paymentStatusKey === 'manual_confirmed'">Оплачено · офлайн подтверждено</template>
                <template v-else-if="paymentStatusKey === 'pending'">Ожидает подтверждения банком</template>
                <template v-else-if="paymentStatusKey === 'failed'">Платёж не прошёл</template>
                <template v-else-if="paymentStatusKey === 'expired'">Срок платежа истёк</template>
                <template v-else>{{ app.payment.status }}</template>
              </div>
              <div v-else class="lf-detail__fee-status lf-detail__fee-status--none">Оплата не инициирована</div>
            </FormCard>

            <FormCard v-if="app.reopenedCount && app.reopenedCount > 0" :pad="18">
              <SectionLabel>Заявка переоткрывалась</SectionLabel>
              <div class="lf-detail__reopened">{{ app.reopenedCount }} раз(а)</div>
            </FormCard>
          </aside>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.lf-detail {
  /* Адаптивный контейнер: max 1440px на широких экранах, padding растёт с шириной. */
  width: min(100%, 1440px);
  margin-inline: auto;
  padding-block: 24px 48px;
  padding-inline: clamp(16px, 3vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.lf-detail__id {
  color: var(--lf-ink-3);
  font-weight: 600;
}
.lf-detail__state {
  background: #fff;
  border: 1px solid var(--lf-line);
  border-radius: 14px;
  padding: 48px 24px;
  text-align: center;
  color: var(--lf-ink-3);
  font-size: 14px;
}
.lf-detail__state--error {
  color: var(--lf-rose);
  background: var(--lf-rose-050);
  border-color: #fecaca;
}
.lf-detail__grid {
  display: grid;
  /* minmax(0, 1fr) спасает от переполнения главной колонки длинным контентом. */
  grid-template-columns: minmax(0, 1fr) clamp(280px, 22%, 360px);
  gap: 20px;
  align-items: flex-start;
}
.lf-detail__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.lf-detail__side {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lf-detail__docs-head {
  padding: 14px 20px;
  border-bottom: 1px solid var(--lf-line);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.lf-detail__docs-title {
  font-size: 14px;
  font-weight: 600;
}
.lf-detail__kvs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
}

/* Draft / payment_pending hero */
.lf-detail__draft-hero {
  padding: 20px 24px;
}
.lf-detail__draft-row {
  display: flex;
  gap: 16px;
  align-items: center;
}
.lf-detail__draft-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--lf-line-2);
  color: var(--lf-ink-3);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.lf-detail__draft-eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: var(--lf-ink-4);
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.lf-detail__draft-title {
  font-size: 17px;
  font-weight: 700;
  margin-top: 2px;
  letter-spacing: -0.2px;
}
.lf-detail__draft-lead {
  font-size: 12.5px;
  color: var(--lf-ink-3);
  margin-top: 4px;
  line-height: 1.5;
}
.lf-detail__draft-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 10px;
  background: var(--lf-brand);
  color: #fff !important;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  flex-shrink: 0;
}
.lf-detail__draft-btn:hover {
  filter: brightness(1.08);
}

/* Curator */
.lf-detail__curator {
  display: flex;
  gap: 10px;
  align-items: center;
}
.lf-detail__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--lf-indigo-050);
  color: var(--lf-indigo);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}
.lf-detail__curator-name {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lf-detail__curator-role {
  font-size: 11px;
  color: var(--lf-ink-4);
  margin-top: 1px;
}

/* Site visit */
.lf-detail__site {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.lf-detail__site-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #ecfeff;
  color: #0891b2;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.lf-detail__site-date {
  font-size: 13px;
  font-weight: 600;
}
.lf-detail__site-sub {
  font-size: 11px;
  color: var(--lf-ink-4);
  margin-top: 2px;
}
.lf-detail__site-comment {
  font-size: 12px;
  color: var(--lf-ink-3);
  margin-top: 10px;
  padding: 10px;
  background: var(--lf-bg);
  border-radius: 8px;
  line-height: 1.5;
}

/* Fee */
.lf-detail__fee-value {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--lf-ink);
}
.lf-detail__fee-status {
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.lf-detail__fee-status--success,
.lf-detail__fee-status--manual_confirmed {
  color: var(--lf-brand);
}
.lf-detail__fee-status--pending {
  color: var(--lf-amber);
}
.lf-detail__fee-status--failed {
  color: var(--lf-rose);
}
.lf-detail__fee-status--none {
  color: var(--lf-ink-4);
}
.lf-detail__reopened {
  font-size: 14px;
  font-weight: 600;
  color: var(--lf-ink-2);
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

@media (max-width: 960px) {
  .lf-detail__grid {
    grid-template-columns: 1fr;
  }
  .lf-detail__side {
    position: static;
  }
  .lf-detail__kvs {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 640px) {
  .lf-detail__kvs {
    grid-template-columns: 1fr;
  }
}
</style>
