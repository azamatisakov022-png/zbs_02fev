/**
 * Bank payment accounts (реквизиты для оплаты).
 * Used for utilization fee and penalty payments.
 */

export interface PaymentAccount {
  recipient: string
  bank: string
  account: string
  bik: string
  inn: string
}

export const PAYMENT_ACCOUNTS: Record<string, PaymentAccount> = {
  utilization_fee: {
    recipient: 'ГП «Оператор утилизационного сбора»',
    bank: 'НБ КР г. Бишкек',
    account: '4402012100009428',
    bik: '044012001',
    inn: '02312202010012',
  },
  penalty: {
    recipient: 'ГП «Оператор утилизационного сбора»',
    bank: 'НБ КР г. Бишкек',
    account: '4402012100009435',
    bik: '044012001',
    inn: '02312202010012',
  },
}
