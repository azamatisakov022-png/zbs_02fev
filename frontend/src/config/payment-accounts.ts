/**
 * Payment account details — synced with backend application.yml → payment.accounts
 */
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
