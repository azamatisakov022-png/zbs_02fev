/**
 * Payment account details — synced with backend application.yml → payment.accounts
 *
 * Статические реквизиты используются как fallback.
 * При появлении API бэкенда — вызвать fetchPaymentAccounts() для получения актуальных данных.
 */
import api from '../api/client'

export interface PaymentAccount {
  recipient: string
  bank: string
  account: string
  bik: string
  inn?: string
}

export const PAYMENT_ACCOUNTS: Record<string, PaymentAccount> & {
  utilization_fee: PaymentAccount
  penalty: PaymentAccount
} = {
  utilization_fee: {
    recipient: 'ГП «Эко Оператор» при МПРЭТН КР',
    bank: 'РСК Банк',
    account: '1280021000000730',
    bik: '128001',
    inn: '02109202010072',
  },
  penalty: {
    recipient: 'Центральное казначейство КР',
    bank: 'Национальный банк КР',
    account: '4402013100100330',
    bik: '440001',
  },
}

/**
 * Загружает актуальные реквизиты с бэкенда.
 * При ошибке (API ещё не готов) — возвращает статические данные.
 */
export async function fetchPaymentAccounts(): Promise<typeof PAYMENT_ACCOUNTS> {
  try {
    const { data } = await api.get('/public/payment-accounts')
    return data
  } catch {
    return PAYMENT_ACCOUNTS
  }
}
