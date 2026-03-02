/**
 * Payment account details for utilization fee and penalty payments.
 *
 * Utilization fee → special account of the Ministry (GP Eco Operator)
 * Penalty → accumulation account of the Central Treasury of KR (state budget)
 */

export interface PaymentAccount {
  recipient: string
  bank: string
  account: string
  bik: string
  inn: string
  description: string
}

export const PAYMENT_ACCOUNTS: Record<'utilization_fee' | 'penalty', PaymentAccount> = {
  utilization_fee: {
    recipient: 'ГП «Эко Оператор» при МПРЭТН КР',
    bank: 'РСК Банк',
    account: '1280021000000730',
    bik: '128001',
    inn: '02109202010072',
    description: 'Спецсчёт Министерства',
  },
  penalty: {
    recipient: 'Центральное казначейство КР',
    bank: 'Национальный банк КР',
    account: '4402013100100330',
    bik: '440001',
    inn: '00000000000000',
    description: 'Аккумуляционный счёт государства — ГП Эко Оператор не имеет права использовать',
  },
}
