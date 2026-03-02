export interface PaymentAccount {
  recipient: string
  bank: string
  account: string
  bik: string
  inn?: string
}

export const PAYMENT_ACCOUNTS = {
  utilizationFee: {
    recipient: 'ГП «Эко Оператор» при МПРЭТН КР',
    bank: 'РСК Банк',
    account: '1280021000000730',
    bik: '128001',
    inn: '02109202010072',
  } as PaymentAccount,
  penalty: {
    recipient: 'Центральное казначейство КР',
    bank: 'Национальный банк КР',
    account: '4402013100100330',
    bik: '440001',
  } as PaymentAccount,
}
