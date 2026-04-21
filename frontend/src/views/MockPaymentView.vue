<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/client'

/**
 * Mock-страница платёжного шлюза.
 *
 * Эмулирует поведение реального шлюза: пользователь выбирает сценарий
 * (успех / отказ / таймаут), фронт отправляет webhook-имитацию на
 * /public/license-payments/webhook/MOCK и делает возврат на returnUrl.
 *
 * Только для локальной разработки / демо. В продакшене заменяется на
 * редирект в реальный платёжный шлюз выбранного провайдера.
 */

const route = useRoute()
const router = useRouter()

const orderId = route.params.orderId as string
const amount = route.query.amount as string
const applicationId = route.query.applicationId as string
const returnUrl = (route.query.returnUrl as string) || '/business/license-applications'

const processing = ref<'success' | 'failed' | 'expired' | null>(null)

async function simulate(event: 'success' | 'failed' | 'expired') {
  processing.value = event
  const payload = {
    event: `payment.${event}`,
    orderId,
    amount: Number(amount || 1000),
    paidAt: new Date().toISOString().slice(0, 19),
    receiptUrl: event === 'success' ? 'http://localhost/mock-receipt.pdf' : undefined,
    errorCode: event === 'failed' ? 'CARD_DECLINED' : undefined,
    errorMessage: event === 'failed' ? 'Банк-эмитент отклонил операцию' : undefined,
  }
  try {
    await api.post('/public/license-payments/webhook/MOCK', payload, {
      headers: { 'Content-Type': 'application/json', 'X-Signature': 'mock' },
    })
  } catch (e) {
    console.warn('Mock webhook error', e)
  }
  // Редирект обратно на страницу заявки
  setTimeout(() => {
    window.location.href = returnUrl
  }, 800)
}

onMounted(() => {
  console.log('Mock payment page:', { orderId, amount, applicationId, returnUrl })
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-6">
    <div class="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
      <div class="text-center mb-8">
        <div class="text-3xl mb-2">🧪</div>
        <div class="text-xl font-bold text-gray-900">Mock платёжный шлюз</div>
        <div class="text-sm text-gray-500 mt-1">
          Эмуляция платёжного провайдера для разработки и демо
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
        <div class="flex justify-between mb-1"><span class="text-gray-500">Номер заказа:</span><span class="font-mono text-xs">{{ orderId }}</span></div>
        <div class="flex justify-between mb-1"><span class="text-gray-500">Заявка:</span><span class="font-medium">#{{ applicationId }}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Сумма:</span><span class="font-bold text-emerald-600">{{ amount }} сом</span></div>
      </div>

      <div v-if="processing" class="text-center py-4">
        <div class="text-gray-700 mb-2">
          {{ processing === 'success' ? 'Обрабатываем успешную оплату…'
            : processing === 'failed' ? 'Обрабатываем отказ банка…'
            : 'Обрабатываем таймаут…' }}
        </div>
        <div class="text-xs text-gray-400">Возврат в АИС…</div>
      </div>

      <div v-else class="space-y-3">
        <button
          @click="simulate('success')"
          class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
        >
          ✓ Успешная оплата
        </button>
        <button
          @click="simulate('failed')"
          class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium"
        >
          ✗ Отказ банка
        </button>
        <button
          @click="simulate('expired')"
          class="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
        >
          ⏱ Истёк таймаут
        </button>
      </div>

      <p class="text-xs text-gray-400 text-center mt-6">
        Это тестовая страница. В продакшене здесь будет реальный платёжный шлюз выбранного провайдера.
      </p>
    </div>
  </div>
</template>
