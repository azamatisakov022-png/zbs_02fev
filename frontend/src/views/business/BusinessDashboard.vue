<script setup lang="ts">
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { calculationStore } from '../../stores/calculations'
import { accountStore } from '../../stores/account'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { CalcStatus } from '../../constants/statuses'

const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()

const userName = 'ОсОО «ТехПром»'
const companyName = 'ОсОО «ТехПром» · ИНН 02901199810123'
const accountNumber = 'ЛС-БО-0429810'
const today = new Date()
const currentYear = today.getFullYear()
const todayLabel = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })

const realCalcs = computed(() => calculationStore.getBusinessCalculations(userName))
const hasRealData = computed(() => realCalcs.value.length > 0)
// Empty-state скрыт: для демо всегда показываем populated с mock-fallback.
const isEmpty = false

// Тип плательщика — выводится из payerType расчётов.
// Производитель сдаёт ежеквартально; импортёр — по факту ввоза.
type PayerKind = 'importer' | 'producer' | 'both' | 'unknown'
const payerKind = computed<PayerKind>(() => {
  if (!hasRealData.value) return 'producer' // mock — показываем как производителя
  const types = new Set<string>()
  realCalcs.value.forEach(c => { if (c.payerType) types.add(c.payerType) })
  if (types.has('importer') && types.has('producer')) return 'both'
  if (types.has('importer')) return 'importer'
  if (types.has('producer')) return 'producer'
  return 'unknown'
})

const currentBalance = computed(() => {
  const real = accountStore.getCurrentBalance()
  return real !== 0 ? real : 85000
})
const balanceTone = computed(() => {
  const b = currentBalance.value
  if (b > 0) return { pill: 'bd-pill--success', label: 'Положительный' }
  if (b < 0) return { pill: 'bd-pill--danger', label: 'Отрицательный' }
  return { pill: 'bd-pill--neutral', label: 'Нулевой' }
})

// Последние 3 платежа из транзакций (тип 'payment') — fallback на mock.
const mockPayments = [
  { date: '12 апр 2026', amount: 257480, label: 'Платёж со счёта ОсОО «АКБ»' },
  { date: '28 фев 2026', amount: 180000, label: 'Платёж со счёта Демир Банк' },
  { date: '20 янв 2026', amount: 95000,  label: 'Платёж со счёта Кыргызкоммерцбанк' },
]
const recentPayments = computed(() => {
  const real = accountStore.getTransactions()
    .filter(tx => tx.type === 'payment')
    .slice(-3).reverse()
    .map(tx => ({
      date: tx.date,
      amount: tx.paymentAmount,
      label: tx.description || `Платёж по ${tx.calculationNumber}`,
    }))
  return real.length > 0 ? real : mockPayments
})

// Срочное действие зависит от типа плательщика.
// Импортёр платит по факту ввоза → срочно если есть просроченный расчёт.
// Производитель сдаёт квартальный расчёт → срочно если приближается 15 мая.
// Декларация (годовая) подаётся до 1 апреля.
const urgent = computed(() => {
  // Производитель — Q1 расчёт до 15 мая.
  if (payerKind.value === 'producer' || payerKind.value === 'both') {
    const deadline = new Date(currentYear, 4, 15)
    const daysLeft = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / 86400000))
    return {
      title: `Подайте расчёт за Q1 ${currentYear}`,
      body: 'Срок подачи — до 15 мая. Просрочка влечёт пени по ст. 37 Закона КР о налогах (0,09% от суммы за каждый день).',
      daysLabel: `${daysLeft} дн. до начисления пени`,
      cta: '/business/calculator',
    }
  }
  if (payerKind.value === 'importer') {
    const overdue = realCalcs.value.find(c =>
      c.status === CalcStatus.SUBMITTED || c.status === CalcStatus.UNDER_REVIEW
    )
    if (overdue) {
      return {
        title: `Оплатите расчёт ${overdue.number}`,
        body: 'Срок оплаты после ввоза партии истекает. Просрочка влечёт пени по ст. 37 Закона КР о налогах (0,09% от суммы за каждый день).',
        daysLabel: 'Срочно',
        cta: '/business/calculations',
      }
    }
  }
  return null
})
const postpone = () => { /* открыть модал переноса */ }

// Иконки статусов — inline SVG-компоненты (currentColor).
const SvgCheck = () => h('svg', { viewBox: '0 0 24 24' }, [h('path', { d: 'm5 12 5 5 9-10' })])
const SvgClock = () => h('svg', { viewBox: '0 0 24 24' }, [h('path', { d: 'M12 7v5l3 2' })])
const SvgAlert = () => h('svg', { viewBox: '0 0 24 24' }, [h('path', { d: 'M12 8v5M12 17h.01' })])
const SvgDraft = () => h('svg', { viewBox: '0 0 24 24' }, [h('path', { d: 'M14 4H7v16h10V8z M14 4v4h4' })])
const statusIcon: Record<string, any> = {
  success: SvgCheck, info: SvgClock, warn: SvgAlert, danger: SvgAlert, draft: SvgDraft,
}

// Чек-лист обязательств. Группы зависят от типа плательщика.
type ObligationItem = {
  status: 'success' | 'info' | 'warn' | 'danger' | 'draft'
  title: string
  meta: string
  cta?: string
  ctaHref?: string
}
type ObligationGroup = { title: string; done: number; total: number; items: ObligationItem[] }

const obligationGroups = computed<ObligationGroup[]>(() => {
  const groups: ObligationGroup[] = []

  // Декларация — годовая, до 1 апреля.
  groups.push({
    title: 'Декларации', done: 1, total: 1,
    items: [
      { status: 'success', title: `Декларация за ${currentYear - 1} год`, meta: `Принята · 20.01.${currentYear} · ДЕК-${currentYear - 1}-Q4` },
    ],
  })

  // Расчёты — для производителя ежеквартально, для импортёра по партиям.
  const calcs = realCalcs.value.slice(-3).reverse()
  if (calcs.length > 0) {
    const items: ObligationItem[] = calcs.map(c => {
      let s: ObligationItem['status'] = 'draft'
      if (c.status === CalcStatus.PAID || c.status === CalcStatus.APPROVED || c.status === CalcStatus.COMPLETED) s = 'success'
      else if (c.status === CalcStatus.UNDER_REVIEW || c.status === CalcStatus.PAYMENT_PENDING) s = 'info'
      else if (c.status === CalcStatus.REJECTED || c.status === CalcStatus.REVISION) s = 'warn'
      const label = c.status === CalcStatus.PAID ? 'Оплачен' :
                    c.status === CalcStatus.UNDER_REVIEW ? 'На проверке' :
                    c.status === CalcStatus.PAYMENT_PENDING ? 'Ожидает оплаты' :
                    c.status === CalcStatus.APPROVED ? 'Одобрен' :
                    c.status === CalcStatus.COMPLETED ? 'Завершён' :
                    c.status === CalcStatus.REVISION ? 'На доработку' :
                    c.status === CalcStatus.REJECTED ? 'Отклонён' : 'Черновик'
      return {
        status: s,
        title: `Расчёт ${c.number}`,
        meta: `${label} · ${c.date} · ${c.totalAmount.toLocaleString('ru-RU')} сом`,
      }
    })
    const done = items.filter(i => i.status === 'success').length
    groups.push({
      title: 'Расчёты утильсбора',
      done,
      total: items.length,
      items,
    })
  } else {
    // Mock fallback для демо.
    groups.push({
      title: 'Расчёты утильсбора', done: 3, total: 3,
      items: [
        { status: 'info',    title: 'Расчёт за март 2026',    meta: 'На проверке · 02.04.2026 · 245 000 сом' },
        { status: 'success', title: 'Расчёт за февраль 2026', meta: 'Принят · 14.03.2026 · 218 750 сом' },
        { status: 'success', title: 'Расчёт за январь 2026',  meta: 'Принят · 12.02.2026 · 268 730 сом' },
      ],
    })
  }

  // Отчёт о переработке — Q1 до 15 мая.
  groups.push({
    title: 'Отчёты о переработке', done: 0, total: 1,
    items: [
      { status: 'warn', title: `Отчёт за Q1 ${currentYear}`, meta: 'Не подан · до 15 мая', cta: 'Подать', ctaHref: '/business/reports' },
    ],
  })

  return groups
})
const totalDone = computed(() => obligationGroups.value.reduce((s, g) => s + g.done, 0))
const totalAll  = computed(() => obligationGroups.value.reduce((s, g) => s + g.total, 0))

// Норматив переработки — рассчитывается от того, что плательщик САМ ввёл в расчётах.
// При пустом store — mock fallback для демо.
const mockNormative = {
  overallPct: 78,
  done: 25.2,
  target: 30.0,
  remain: 4.8,
  monthsLeft: 8,
  fractions: [
    { name: 'Пластик', done: 11.2, target: 12.5, pct: 84  },
    { name: 'Бумага',  done: 8.3,  target: 8.3,  pct: 100 },
    { name: 'Стекло',  done: 3.2,  target: 5.2,  pct: 60  },
  ],
}
const normative = computed(() => {
  const items = realCalcs.value.flatMap(c => c.items || [])
  const target = items.reduce((s, p) => s + (p.volumeToRecycle || 0), 0)
  if (target === 0) return mockNormative

  const done = items.reduce((s, p) => s + (parseFloat(p.transferredToRecycling || '0') || 0), 0)
  const overallPct = Math.min(100, Math.round((done / target) * 100))
  const remain = Math.max(0, target - done)
  const monthsLeft = Math.max(0, 12 - today.getMonth())

  const byGroup: Record<string, { done: number; target: number }> = {}
  items.forEach(p => {
    const g = p.group || 'Прочее'
    if (!byGroup[g]) byGroup[g] = { done: 0, target: 0 }
    byGroup[g].done += parseFloat(p.transferredToRecycling || '0') || 0
    byGroup[g].target += p.volumeToRecycle || 0
  })
  const fractions = Object.entries(byGroup).map(([name, v]) => ({
    name,
    done: v.done,
    target: v.target,
    pct: v.target > 0 ? Math.min(100, Math.round((v.done / v.target) * 100)) : 0,
  }))

  return { overallPct, done, target, remain, monthsLeft, fractions }
})
const ringR = 70
const ringCirc = 2 * Math.PI * ringR
const ringDash = computed(() => (normative.value.overallPct / 100) * ringCirc)
const hasLaggingFraction = computed(() => normative.value.fractions.some(f => f.pct < 100))
const fractionColor = (pct: number) =>
  pct >= 100 ? '#0e888d' : pct >= 80 ? '#10b981' : pct >= 50 ? '#fea629' : '#dc2626'

// Календарь обязательств — 6 месяцев от текущего.
const monthShort = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
type CalChip = { tone: 'success' | 'inwork' | 'danger' | 'planned'; label: string }
const calendar = computed(() => {
  const arr: { month: string; year: number; current: boolean; items: CalChip[] }[] = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const m = d.getMonth()
    const y = d.getFullYear()
    const items: CalChip[] = []

    // Декларация — апрель. Если уже в текущем месяце или прошла — значит принята.
    if (m === 3) {
      items.push({
        tone: i === 0 ? 'success' : 'planned',
        label: i === 0 ? 'Декларация принята' : 'Декларация (до 1 апр)',
      })
    }

    if (payerKind.value === 'producer' || payerKind.value === 'both') {
      // Q1: апрель — в работе, май — дедлайн.
      if (m === 3) items.push({ tone: 'inwork', label: 'Расчёт Q1 — в работе' })
      if (m === 4) items.push({ tone: 'danger', label: 'Расчёт Q1 (до 15 мая)' })
      if (m === 4) items.push({ tone: 'inwork', label: 'Отчёт Q1 (до 15 мая)' })
      // Q2: июль — старт, август — дедлайн.
      if (m === 6) items.push({ tone: 'planned', label: 'Расчёт Q2 — старт' })
      if (m === 7) items.push({ tone: 'planned', label: 'Расчёт Q2 (до 15 авг)' })
      if (m === 7) items.push({ tone: 'planned', label: 'Отчёт Q2 (до 15 авг)' })
      // Q3: октябрь — старт, ноябрь — дедлайн.
      if (m === 9) items.push({ tone: 'planned', label: 'Расчёт Q3 — старт' })
      if (m === 10) items.push({ tone: 'planned', label: 'Расчёт Q3 (до 15 ноя)' })
    }

    if (payerKind.value === 'importer') {
      // Импортёр платит по партиям — события генерируются по факту ввоза.
      // Здесь показываем только декларацию.
    }

    arr.push({
      month: monthShort[m],
      year: y,
      current: i === 0,
      items,
    })
  }
  return arr
})

// Хелперы.
const formatNumber = (n: number) => Math.abs(n).toLocaleString('ru-RU').replace(/\u00a0|\u202f/g, ' ')
const formatTons   = (n: number) => n.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :menuItems="menuItems"
    :userName="userName"
  >
    <div class="bd-page">
      <header class="bd-page__header">
        <div class="bd-page__crumbs">
          {{ companyName }} · Плательщик утилизационного сбора
        </div>
        <h1 class="bd-page__title">{{ $t('businessDashboard.pageTitle') }}</h1>
        <div class="bd-page__sub">
          {{ $t('businessDashboard.pageSubtitle') }} · {{ todayLabel }}
        </div>
      </header>

      <!-- ===== EMPTY STATE ===== -->
      <template v-if="isEmpty">
        <section class="bd-card bd-account bd-account--empty">
          <div class="bd-card__eyebrow">
            <svg class="bd-ic" viewBox="0 0 24 24"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"/></svg>
            <span>Лицевой счёт № {{ accountNumber }}</span>
          </div>
          <div class="bd-account__balance">
            <span class="bd-account__amount">0</span>
            <span class="bd-account__currency">сом</span>
            <span class="bd-pill bd-pill--neutral">
              <i class="bd-pill__dot" />Нулевой
            </span>
          </div>
          <p class="bd-account__hint">
            Реквизиты для оплаты появятся после подачи первого расчёта.
          </p>
        </section>

        <section class="bd-card bd-empty">
          <div class="bd-empty__icon">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
          </div>
          <h2 class="bd-empty__title">Подайте первый расчёт утильсбора</h2>
          <p class="bd-empty__body">
            Когда подадите расчёт, здесь появится статус ваших обязательств и прогресс норматива переработки.
          </p>
          <div class="bd-empty__actions">
            <router-link to="/business/calculator" class="bd-btn bd-btn--primary">
              <svg class="bd-ic" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Подать расчёт
              <svg class="bd-ic" viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </router-link>
          </div>
          <ol class="bd-empty__steps">
            <li><span>1</span>Заполните расчёт по партии</li>
            <li><span>2</span>Оплатите утилизационный сбор</li>
            <li><span>3</span>Передайте на переработку</li>
          </ol>
        </section>
      </template>

      <!-- ===== POPULATED ===== -->
      <template v-else>
        <!-- 1. Срочное действие -->
        <section v-if="urgent" class="bd-urgent">
          <div class="bd-urgent__main">
            <div class="bd-urgent__icon">
              <svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
            </div>
            <div>
              <div class="bd-urgent__meta">
                <span class="bd-urgent__eyebrow">Срочно</span>
                <span class="bd-pill bd-pill--danger">
                  <i class="bd-pill__dot" />{{ urgent.daysLabel }}
                </span>
              </div>
              <h3 class="bd-urgent__title">{{ urgent.title }}</h3>
              <p class="bd-urgent__body">{{ urgent.body }}</p>
            </div>
          </div>
          <div class="bd-urgent__actions">
            <button class="bd-btn bd-btn--ghost" @click="postpone">Перенести</button>
            <router-link :to="urgent.cta" class="bd-btn bd-btn--danger">
              Подать сейчас
              <svg class="bd-ic" viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </router-link>
          </div>
        </section>

        <div class="bd-grid bd-grid--primary">
          <!-- 3. Чек-лист обязательств -->
          <section>
            <header class="bd-section">
              <div class="bd-section__title">
                <h2>Обязательства</h2>
                <span class="bd-section__count">{{ totalDone }} / {{ totalAll }}</span>
              </div>
              <router-link to="/business/documents" class="bd-section__link">
                Все документы
                <svg class="bd-ic" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </router-link>
            </header>

            <div class="bd-card bd-card--padless">
              <div v-for="(group, gi) in obligationGroups" :key="gi" class="bd-grp">
                <div class="bd-grp__head">
                  <span>{{ group.title }}</span>
                  <span :class="['bd-grp__count', group.done < group.total && 'bd-grp__count--warn']">
                    {{ group.done }} из {{ group.total }} поданы
                  </span>
                </div>
                <div
                  v-for="(item, ii) in group.items"
                  :key="ii"
                  class="bd-row"
                >
                  <div :class="['bd-status', `bd-status--${item.status}`]">
                    <component :is="statusIcon[item.status]" />
                  </div>
                  <div class="bd-row__main">
                    <div class="bd-row__title">{{ item.title }}</div>
                    <div class="bd-row__meta">{{ item.meta }}</div>
                  </div>
                  <router-link
                    v-if="item.cta"
                    :to="item.ctaHref"
                    class="bd-btn bd-btn--primary bd-btn--sm"
                  >
                    {{ item.cta }}
                    <svg class="bd-ic" viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </router-link>
                  <svg v-else class="bd-ic bd-ic--mute" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Лицевой счёт -->
          <section class="bd-card bd-account">
            <div class="bd-card__eyebrow">
              <svg class="bd-ic" viewBox="0 0 24 24"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"/></svg>
              <span>Лицевой счёт № {{ accountNumber }}</span>
            </div>
            <div class="bd-account__balance">
              <span class="bd-account__amount">{{ formatNumber(currentBalance) }}</span>
              <span class="bd-account__currency">сом</span>
              <span :class="['bd-pill', balanceTone.pill]">
                <i class="bd-pill__dot" />{{ balanceTone.label }}
              </span>
            </div>

            <div class="bd-divider" />

            <div class="bd-account__sublabel">Последние платежи</div>
            <ul v-if="recentPayments.length" class="bd-payments">
              <li v-for="(p, i) in recentPayments" :key="i" class="bd-payment">
                <div class="bd-payment__icon">
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                </div>
                <div class="bd-payment__date">{{ p.date }}</div>
                <div class="bd-payment__label">{{ p.label }}</div>
                <div class="bd-payment__amount">+{{ formatNumber(p.amount) }} сом</div>
              </li>
            </ul>
            <p v-else class="bd-account__hint">Платежей пока нет.</p>

            <div class="bd-account__actions">
              <router-link to="/business/account" class="bd-btn bd-btn--primary">
                <svg class="bd-ic" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Реквизиты для оплаты
              </router-link>
              <router-link to="/business/account" class="bd-btn bd-btn--ghost">
                История
                <svg class="bd-ic" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </router-link>
            </div>
          </section>
        </div>

        <!-- 4. Норматив переработки -->
        <section v-if="normative.target > 0">
          <header class="bd-section">
            <div class="bd-section__title">
              <h2>Норматив переработки</h2>
            </div>
            <a class="bd-section__link">
              {{ currentYear }} год
              <svg class="bd-ic" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </header>

          <div class="bd-card bd-normative">
            <div class="bd-normative__inner">
              <div class="bd-ring">
                <svg viewBox="0 0 180 180" width="180" height="180">
                  <circle cx="90" cy="90" r="70" fill="none" stroke="#f1f5f9" stroke-width="12" />
                  <circle
                    cx="90" cy="90" r="70"
                    fill="none" stroke="#0e888d" stroke-width="12" stroke-linecap="round"
                    :stroke-dasharray="`${ringDash} ${ringCirc}`"
                    transform="rotate(-90 90 90)"
                  />
                </svg>
                <div class="bd-ring__label">
                  <div class="bd-ring__pct">{{ normative.overallPct }}%</div>
                  <div class="bd-ring__cap">выполнено</div>
                </div>
              </div>
              <div class="bd-normative__detail">
                <p class="bd-normative__lead">
                  <strong>{{ formatTons(normative.done) }} т</strong>
                  переработано из
                  <strong>{{ formatTons(normative.target) }} т</strong>
                  целевых
                </p>
                <p class="bd-normative__sub">
                  До цели —
                  <strong class="bd-normative__remain">{{ formatTons(normative.remain) }} т</strong>
                  · до конца года {{ normative.monthsLeft }} мес.
                </p>
                <ul class="bd-fractions">
                  <li v-for="(f, i) in normative.fractions" :key="i">
                    <div class="bd-fraction__row">
                      <div class="bd-fraction__name">
                        <span>{{ f.name }}</span>
                        <span v-if="f.pct >= 100" class="bd-pill bd-pill--success">
                          <i class="bd-pill__dot" />Выполнено
                        </span>
                      </div>
                      <div class="bd-fraction__num">
                        {{ formatTons(f.done) }} / {{ formatTons(f.target) }} т ·
                        <strong :style="{ color: fractionColor(f.pct) }">{{ f.pct }}%</strong>
                      </div>
                    </div>
                    <div class="bd-fraction__bar">
                      <span :style="{ width: f.pct + '%', background: fractionColor(f.pct) }" />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <router-link
              v-if="hasLaggingFraction"
              to="/business/recyclers"
              class="bd-btn bd-btn--outline bd-normative__cta"
            >
              <svg class="bd-ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              Найти переработчика
            </router-link>
          </div>
        </section>

        <!-- 5. Календарь обязательств (6 мес.) -->
        <section>
          <header class="bd-section">
            <div class="bd-section__title">
              <h2>Календарь обязательств</h2>
              <span class="bd-section__count">6 месяцев</span>
            </div>
          </header>

          <div class="bd-card">
            <div class="bd-cal">
              <div
                v-for="(mo, i) in calendar"
                :key="i"
                :class="['bd-cal__cell', mo.current && 'bd-cal__cell--current']"
              >
                <div class="bd-cal__head">
                  {{ mo.month }} {{ mo.year }}{{ mo.current ? ' · сейчас' : '' }}
                </div>
                <div class="bd-cal__items">
                  <span
                    v-for="(it, ii) in mo.items"
                    :key="ii"
                    :class="['bd-chip', `bd-chip--${it.tone}`]"
                  >{{ it.label }}</span>
                  <span v-if="!mo.items.length" class="bd-cal__free">Без обязательств</span>
                </div>
              </div>
            </div>
            <div class="bd-cal__legend">
              <span><i style="background:#10b981" />готово</span>
              <span><i style="background:#fea629" />в работе</span>
              <span><i style="background:#dc2626" />просрочено</span>
              <span><i style="background:#94a3b8" />запланировано</span>
            </div>
          </div>
        </section>
      </template>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.bd-page {
  font-family: 'Inter', 'Source Sans 3', system-ui, sans-serif;
  color: #1e293b;
  display: grid;
  gap: 20px;
  padding: 24px clamp(16px, 3vw, 32px) 48px;
  max-width: 1280px;
}

.bd-page__header { margin-bottom: 4px; }
.bd-page__crumbs {
  font-size: 11px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
}
.bd-page__title { font-size: 22px; font-weight: 700; letter-spacing: -0.4px; margin: 0; color: #1e293b; }
.bd-page__sub { font-size: 13px; color: #64748b; margin-top: 2px; }

.bd-card {
  background: #fff; border: 1px solid #e6ebf1; border-radius: 10px; padding: 20px;
}
.bd-card--padless { padding: 0; }
.bd-card__eyebrow {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
  font-size: 11px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.5px;
}

.bd-section {
  display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px;
}
.bd-section__title { display: flex; align-items: center; gap: 8px; }
.bd-section__title h2 {
  font-size: 13px; font-weight: 700; color: #1e293b; margin: 0;
  text-transform: uppercase; letter-spacing: 0.6px;
}
.bd-section__count {
  font-size: 11px; font-weight: 700; color: #64748b;
  background: #f1f5f9; padding: 2px 8px; border-radius: 999px;
}
.bd-section__link {
  font-size: 12px; color: #0e888d; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 4px; text-decoration: none;
}

.bd-grid--primary {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; align-items: start;
}
@media (max-width: 1024px) {
  .bd-grid--primary { grid-template-columns: 1fr; }
}

.bd-ic { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.bd-ic--mute { color: #cbd5e1; }

.bd-pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600;
  padding: 3px 8px; border-radius: 999px;
  background: #f1f5f9; color: #475569;
}
.bd-pill__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .9; }
.bd-pill--success { background: #ecfdf5; color: #067647; }
.bd-pill--success .bd-pill__dot { background: #10b981; opacity: 1; }
.bd-pill--warn    { background: #fffaeb; color: #a05a00; }
.bd-pill--warn    .bd-pill__dot { background: #fea629; opacity: 1; }
.bd-pill--danger  { background: #fef2f2; color: #b42318; }
.bd-pill--danger  .bd-pill__dot { background: #dc2626; opacity: 1; }
.bd-pill--info    { background: #eff8f8; color: #0e888d; }
.bd-pill--info    .bd-pill__dot { background: #0e888d; opacity: 1; }
.bd-pill--neutral { background: #f1f5f9; color: #475569; }
.bd-pill--neutral .bd-pill__dot { background: #94a3b8; opacity: 1; }

.bd-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;
  text-decoration: none; cursor: pointer; border: 1px solid transparent;
  transition: background .15s, border-color .15s, color .15s, transform .05s;
}
.bd-btn:active { transform: scale(.98); }
.bd-btn--sm      { padding: 6px 12px; font-size: 12px; }
.bd-btn--primary { background: #0e888d; color: #fff; border-color: #0e888d; }
.bd-btn--primary:hover { background: #0a7378; border-color: #0a7378; }
.bd-btn--ghost   { background: #fff; color: #1e293b; border-color: #d6dde5; }
.bd-btn--ghost:hover { background: #f8fafc; }
.bd-btn--danger  { background: #dc2626; color: #fff; border-color: #dc2626; }
.bd-btn--danger:hover { background: #b91c1c; border-color: #b91c1c; }
.bd-btn--outline { background: #fff; color: #0e888d; border-color: #c5e3e4; }
.bd-btn--outline:hover { background: #eff8f8; }

.bd-urgent {
  background: linear-gradient(180deg, #fff5f5 0%, #fffaf0 100%);
  border: 1px solid #fecaca; border-left: 3px solid #dc2626;
  border-radius: 10px; padding: 18px 22px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.bd-urgent__main { display: flex; gap: 14px; align-items: flex-start; }
.bd-urgent__icon {
  width: 36px; height: 36px; border-radius: 8px; background: #fff;
  border: 1px solid #fecaca; color: #dc2626;
  display: grid; place-items: center; flex-shrink: 0;
}
.bd-urgent__icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.bd-urgent__meta { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.bd-urgent__eyebrow {
  font-size: 11px; font-weight: 700; color: #dc2626;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.bd-urgent__title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 2px; }
.bd-urgent__body  { font-size: 13px; color: #475569; margin: 0; }
.bd-urgent__actions { display: flex; gap: 8px; flex-shrink: 0; }
@media (max-width: 768px) {
  .bd-urgent { flex-direction: column; align-items: stretch; }
  .bd-urgent__actions { justify-content: flex-end; }
}

.bd-account__balance { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.bd-account__amount {
  font-size: 36px; font-weight: 700; color: #1e293b; letter-spacing: -0.8px;
  font-variant-numeric: tabular-nums; line-height: 1;
}
.bd-account__currency { font-size: 16px; color: #64748b; font-weight: 600; }
.bd-divider { height: 1px; background: #eef2f6; margin: 16px 0 14px; }
.bd-account__sublabel {
  font-size: 11px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;
}
.bd-account__hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
.bd-payments { list-style: none; margin: 0; padding: 0; }
.bd-payment {
  display: grid; grid-template-columns: 24px 92px 1fr auto; gap: 10px;
  padding: 10px 0; align-items: center;
  border-top: 1px dashed #eef2f6;
}
.bd-payment:first-child { border-top: 0; }
.bd-payment__icon {
  width: 22px; height: 22px; border-radius: 6px;
  background: #ecfdf5; color: #067647;
  display: grid; place-items: center;
}
.bd-payment__icon svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.bd-payment__date   { font-size: 11px; color: #94a3b8; font-weight: 600; font-variant-numeric: tabular-nums; }
.bd-payment__label  { font-size: 12px; color: #475569; }
.bd-payment__amount { font-size: 13px; font-weight: 600; color: #067647; font-variant-numeric: tabular-nums; }
.bd-account__actions { display: flex; gap: 8px; margin-top: 16px; }
.bd-account__actions .bd-btn { flex: 1; }

.bd-grp__head {
  padding: 12px 20px; background: #f8fafc;
  border-top: 1px solid #eef2f6; border-bottom: 1px solid #eef2f6;
  font-size: 11px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.5px;
  display: flex; justify-content: space-between; align-items: center;
}
.bd-grp:first-child .bd-grp__head { border-top: 0; }
.bd-grp__count { color: #94a3b8; }
.bd-grp__count--warn { color: #a05a00; }
.bd-row {
  display: grid; grid-template-columns: 32px 1fr auto; gap: 14px;
  padding: 14px 20px; align-items: center;
  border-top: 1px solid #f1f5f9;
}
.bd-row:first-of-type { border-top: 0; }
.bd-row__title { font-size: 13px; font-weight: 600; color: #1e293b; }
.bd-row__meta  { font-size: 12px; color: #64748b; margin-top: 2px; }
.bd-status {
  width: 28px; height: 28px; border-radius: 999px;
  display: grid; place-items: center; border: 1px solid;
}
.bd-status svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.bd-status--success { background: #ecfdf5; color: #067647; border-color: #bbf7d0; }
.bd-status--info    { background: #fffaeb; color: #a05a00; border-color: #fde0a3; }
.bd-status--warn    { background: #fffaeb; color: #a05a00; border-color: #fde0a3; }
.bd-status--danger  { background: #fef2f2; color: #b42318; border-color: #fecaca; }
.bd-status--draft   { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

.bd-normative__inner {
  display: grid; grid-template-columns: 180px 1fr; gap: 24px; align-items: center;
}
@media (max-width: 768px) {
  .bd-normative__inner { grid-template-columns: 1fr; justify-items: center; }
}
.bd-ring { position: relative; display: grid; place-items: center; }
.bd-ring__label { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
.bd-ring__pct {
  font-size: 32px; font-weight: 700; color: #1e293b;
  letter-spacing: -0.6px; line-height: 1; font-variant-numeric: tabular-nums;
}
.bd-ring__cap {
  font-size: 11px; color: #94a3b8; font-weight: 700; margin-top: 4px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.bd-normative__lead { font-size: 14px; color: #1e293b; margin: 0 0 4px; }
.bd-normative__lead strong:first-child { font-size: 16px; }
.bd-normative__sub  { font-size: 12px; color: #64748b; margin: 0 0 16px; }
.bd-normative__remain { color: #a05a00; }
.bd-fractions { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.bd-fraction__row {
  display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;
}
.bd-fraction__name { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #1e293b; }
.bd-fraction__num  { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }
.bd-fraction__bar  { height: 4px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.bd-fraction__bar span { display: block; height: 100%; transition: width .4s ease; }
.bd-normative__cta { margin-top: 18px; width: 100%; }

.bd-cal {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;
}
@media (max-width: 1024px) { .bd-cal { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 560px)  { .bd-cal { grid-template-columns: repeat(2, 1fr); } }
.bd-cal__cell {
  border: 1px solid #eef2f6; border-radius: 8px; padding: 12px;
  background: #fff; min-height: 100px;
}
.bd-cal__cell--current { border-color: #0e888d; background: #eff8f8; }
.bd-cal__head {
  font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 8px;
}
.bd-cal__cell--current .bd-cal__head { color: #0e888d; }
.bd-cal__items { display: grid; gap: 4px; }
.bd-cal__empty { color: #cbd5e1; font-size: 12px; }
.bd-cal__free  { color: #94a3b8; font-size: 11px; font-style: italic; padding: 4px 0; }
.bd-chip {
  font-size: 10px; font-weight: 600; padding: 3px 6px; border-radius: 4px;
  border: 1px solid; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bd-chip--success { background: #ecfdf5; color: #067647; border-color: #bbf7d0; }
.bd-chip--inwork  { background: #fffaeb; color: #a05a00; border-color: #fde0a3; }
.bd-chip--danger  { background: #fef2f2; color: #b42318; border-color: #fecaca; }
.bd-chip--planned { background: #f8fafc; color: #64748b; border-color: #e6ebf1; }
.bd-cal__legend {
  display: flex; gap: 16px; flex-wrap: wrap;
  margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f6;
  font-size: 11px; color: #64748b;
}
.bd-cal__legend span { display: inline-flex; align-items: center; gap: 6px; }
.bd-cal__legend i { width: 8px; height: 8px; border-radius: 2px; }

.bd-empty { padding: 64px 40px; text-align: center; }
.bd-empty__icon {
  width: 72px; height: 72px; border-radius: 999px;
  background: #eff8f8; color: #0e888d;
  display: grid; place-items: center; margin: 0 auto 20px;
}
.bd-empty__icon svg { width: 32px; height: 32px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.bd-empty__title { font-size: 22px; font-weight: 700; color: #1e293b; letter-spacing: -0.4px; margin: 0 0 8px; }
.bd-empty__body  { font-size: 14px; color: #64748b; max-width: 480px; margin: 0 auto 24px; line-height: 1.6; }
.bd-empty__actions { display: inline-flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.bd-empty__steps {
  margin: 36px 0 0; padding: 24px 0 0; border-top: 1px solid #eef2f6;
  list-style: none; display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;
  font-size: 12px; color: #94a3b8;
}
.bd-empty__steps li { display: inline-flex; align-items: center; gap: 8px; }
.bd-empty__steps span {
  width: 18px; height: 18px; border-radius: 999px;
  background: #f1f5f9; color: #475569;
  font-size: 11px; font-weight: 700;
  display: grid; place-items: center;
}

.bd-account--empty .bd-account__amount { color: #94a3b8; }
</style>
