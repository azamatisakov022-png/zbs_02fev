<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/client'
import '../components/licenses-flow/palette.css'

/**
 * Платёжный шлюз - демо-версия.
 *
 * Технически имитирует поведение реального provider-шлюза: отправляет
 * webhook на /public/license-payments/webhook/MOCK и возвращает пользователя
 * на returnUrl. Визуально - стилизована под обычный платёжный шлюз
 * (один CTA «Оплатить»), без отладочных кнопок «Отказ» / «Таймаут» -
 * заказчик их видеть не должен.
 *
 * После успешной оплаты - finalScreen с галочкой и кнопкой
 * «Перейти к заявке» (без auto-redirect).
 */

const route = useRoute()

const orderId = route.params.orderId as string
const amount = route.query.amount as string
const applicationId = route.query.applicationId as string
const returnUrl = (route.query.returnUrl as string) || '/business/license-applications'

type Stage = 'form' | 'processing' | 'success'
const stage = ref<Stage>('form')
const txnId = ref<string>('')
const txnTime = ref<string>('')

const amountText = computed(() => `${Number(amount || 1000).toLocaleString('ru-RU')} сом`)
const fmtAmount = computed(() => Number(amount || 1000).toLocaleString('ru-RU'))

async function pay() {
  stage.value = 'processing'
  // Имитируем задержку реального банковского запроса
  await new Promise(r => setTimeout(r, 1800))
  try {
    await api.post('/public/license-payments/webhook/MOCK', {
      event: 'payment.success',
      orderId,
      amount: Number(amount || 1000),
      paidAt: new Date().toISOString().slice(0, 19),
      receiptUrl: 'http://localhost/mock-receipt.pdf',
    }, {
      headers: { 'Content-Type': 'application/json', 'X-Signature': 'mock' },
    })
  } catch (e) {
    console.warn('Mock webhook error', e)
  }
  // Заполняем «реквизиты транзакции» для финального экрана
  const now = new Date()
  txnId.value = `TX-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 90000 + 10000)}`
  txnTime.value = now.toLocaleString('ru-RU')
  stage.value = 'success'
}

onMounted(() => {
  console.debug('Payment gateway:', { orderId, amount, applicationId, returnUrl })
})
</script>

<template>
  <div class="licenses-flow-page pg">
    <div class="pg__card">
      <!-- ── FORM ── -->
      <template v-if="stage === 'form'">
        <div class="pg__head">
          <div class="pg__head-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="14" rx="3" />
              <path d="M2 11h20M6 16h4" />
            </svg>
          </div>
          <div>
            <div class="pg__title">Оплата госпошлины</div>
            <div class="pg__subtitle">Защищённый платёж · SSL · ПЦИ DSS Level 1</div>
          </div>
        </div>

        <div class="pg__receipt">
          <div class="pg__receipt-row">
            <span class="pg__receipt-label">Заявка</span>
            <span class="pg__receipt-value mono">№ {{ applicationId }}</span>
          </div>
          <div class="pg__receipt-row">
            <span class="pg__receipt-label">Назначение</span>
            <span class="pg__receipt-value">Госпошлина за лицензию</span>
          </div>
          <div class="pg__receipt-row">
            <span class="pg__receipt-label">Комиссия</span>
            <span class="pg__receipt-value pg__receipt-value--free">0.00 сом</span>
          </div>
          <div class="pg__receipt-divider" />
          <div class="pg__receipt-row pg__receipt-total">
            <span>К оплате</span>
            <span class="mono">{{ fmtAmount }} <small>сом</small></span>
          </div>
        </div>

        <button class="pg__pay-btn" @click="pay">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Оплатить {{ amountText }}
        </button>

        <div class="pg__brands">
          <div class="pg__brand">VISA</div>
          <div class="pg__brand">Mastercard</div>
          <div class="pg__brand">Элкарт</div>
          <div class="pg__brand">Элдик</div>
        </div>
      </template>

      <!-- ── PROCESSING ── -->
      <template v-else-if="stage === 'processing'">
        <div class="pg__processing">
          <div class="pg__spinner" />
          <div class="pg__processing-title">Банк подтверждает операцию…</div>
          <div class="pg__processing-sub">Не закрывайте окно. Это займёт несколько секунд.</div>
        </div>
      </template>

      <!-- ── SUCCESS ── -->
      <template v-else-if="stage === 'success'">
        <div class="pg__success">
          <div class="pg__success-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="pg__success-title">Платёж принят</div>
          <div class="pg__success-text">
            Списано <b>{{ amountText }}</b>. Заявка №{{ applicationId }} передана инспектору
            на рассмотрение. Срок - <b>30 календарных дней</b>.
          </div>

          <div class="pg__txn">
            <div class="pg__txn-row">
              <span class="pg__txn-label">Номер транзакции</span>
              <span class="pg__txn-value mono">{{ txnId }}</span>
            </div>
            <div class="pg__txn-row">
              <span class="pg__txn-label">Дата и время</span>
              <span class="pg__txn-value mono">{{ txnTime }}</span>
            </div>
            <div class="pg__txn-row">
              <span class="pg__txn-label">Статус</span>
              <span class="pg__txn-value pg__txn-status">Одобрен банком</span>
            </div>
          </div>

          <div class="pg__success-actions">
            <a :href="returnUrl" class="pg__btn pg__btn--primary">
              Перейти к заявке
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <button class="pg__btn pg__btn--ghost" @click="alert('Квитанция в формате PDF будет доступна в боевой версии')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v13M6 12l6 5 6-5M4 21h16" />
              </svg>
              Квитанция PDF
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.pg {
  min-height: 100vh;
  background: var(--lf-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}
.pg__card {
  width: min(460px, 100%);
  background: #fff;
  border-radius: 18px;
  border: 1px solid var(--lf-line);
  padding: 32px 28px;
  box-shadow: 0 24px 56px -28px rgba(15, 23, 42, 0.18);
}

/* ─── FORM stage ─── */
.pg__head {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 22px;
}
.pg__head-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--lf-brand) 0%, var(--lf-brand-700) 100%);
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px -6px rgba(13, 148, 136, 0.5);
}
.pg__title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--lf-ink);
}
.pg__subtitle {
  font-size: 11.5px;
  color: var(--lf-ink-3);
  margin-top: 2px;
}
.pg__receipt {
  background: var(--lf-bg);
  border: 1px solid var(--lf-line);
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 22px;
}
.pg__receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 12.5px;
}
.pg__receipt-label {
  color: var(--lf-ink-4);
}
.pg__receipt-value {
  color: var(--lf-ink);
  font-weight: 500;
}
.pg__receipt-value--free {
  color: var(--lf-brand);
}
.pg__receipt-divider {
  border-top: 1px dashed var(--lf-line);
  margin: 6px 0;
}
.pg__receipt-total {
  font-size: 14px;
  font-weight: 600;
  padding-top: 6px;
}
.pg__receipt-total .mono {
  font-size: 22px;
  font-weight: 700;
  color: var(--lf-brand-700);
  letter-spacing: -0.3px;
}
.pg__receipt-total small {
  font-size: 13px;
  font-weight: 600;
  color: var(--lf-ink-3);
  margin-left: 2px;
}
.pg__pay-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--lf-brand) 0%, var(--lf-brand-700) 100%);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 22px -8px rgba(13, 148, 136, 0.55);
  transition: filter 0.12s ease, transform 0.12s ease;
}
.pg__pay-btn:hover {
  filter: brightness(1.07);
  transform: translateY(-1px);
}
.pg__brands {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 18px;
  opacity: 0.55;
}
.pg__brand {
  padding: 4px 10px;
  border: 1px solid var(--lf-line);
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: var(--lf-ink-3);
  text-transform: uppercase;
}

/* ─── PROCESSING stage ─── */
.pg__processing {
  text-align: center;
  padding: 36px 0 16px;
}
.pg__spinner {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 4px solid var(--lf-line-2);
  border-top-color: var(--lf-brand);
  margin: 0 auto 24px;
  animation: pg-spin 0.9s linear infinite;
}
@keyframes pg-spin {
  to { transform: rotate(360deg); }
}
.pg__processing-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--lf-ink);
}
.pg__processing-sub {
  font-size: 12.5px;
  color: var(--lf-ink-3);
  margin-top: 6px;
}

/* ─── SUCCESS stage ─── */
.pg__success {
  text-align: center;
  padding-top: 8px;
  animation: pg-fade-in 0.3s ease-out;
}
@keyframes pg-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pg__success-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--lf-brand-050);
  color: var(--lf-brand);
  display: grid;
  place-items: center;
  margin: 0 auto 18px;
  animation: pg-pop 0.4s cubic-bezier(.2, .8, .2, 1);
}
@keyframes pg-pop {
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
}
.pg__success-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--lf-ink);
}
.pg__success-text {
  font-size: 13.5px;
  color: var(--lf-ink-3);
  margin-top: 8px;
  line-height: 1.55;
}
.pg__txn {
  background: var(--lf-bg);
  border: 1px solid var(--lf-line);
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 22px;
  text-align: left;
}
.pg__txn-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 12px;
}
.pg__txn-label {
  color: var(--lf-ink-4);
}
.pg__txn-value {
  color: var(--lf-ink);
  font-weight: 500;
}
.pg__txn-status {
  color: var(--lf-brand-700);
  font-weight: 600;
}
.pg__success-actions {
  display: flex;
  gap: 8px;
  margin-top: 22px;
}
.pg__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  border: none;
  transition: filter 0.12s ease;
}
.pg__btn--primary {
  background: var(--lf-brand);
  color: #fff;
}
.pg__btn--primary:hover {
  filter: brightness(1.06);
}
.pg__btn--ghost {
  background: #fff;
  color: var(--lf-ink-2);
  border: 1px solid var(--lf-line);
}
.pg__btn--ghost:hover {
  background: var(--lf-bg);
  border-color: var(--lf-brand);
  color: var(--lf-brand-700);
}

.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
</style>
