import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all external dependencies
vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn().mockResolvedValue({ data: [] }),
    put: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  silentApi: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: [] }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

vi.mock('../i18n', () => ({
  default: {
    global: {
      t: (key: string) => key,
    },
  },
}))

vi.mock('../stores/notifications', () => ({
  notificationStore: {
    add: vi.fn(),
  },
}))

vi.mock('../utils/dateUtils', () => ({
  calculatePaymentDeadline: vi.fn(() => new Date('2026-06-30')),
  formatDateShort: vi.fn(() => '30.06.2026'),
}))

vi.mock('../utils/penalty', () => ({
  calculatePenalty: vi.fn(() => ({ totalPenalty: 0, overdueDays: 0 })),
  getOverdueDays: vi.fn(() => 0),
}))

vi.mock('../constants/statuses', () => ({
  CalcStatus: {
    DRAFT: 'draft',
    UNDER_REVIEW: 'under_review',
    IN_REVIEW: 'in_review',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    REVISION: 'revision',
    PAYMENT_PENDING: 'payment_pending',
    PAYMENT_REJECTED: 'payment_rejected',
    PAID: 'paid',
    FEE_PAID: 'fee_paid',
    PENALTY_PAID: 'penalty_paid',
    COMPLETED: 'completed',
  },
}))

describe('calculationStore', () => {
  let calculationStore: any

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../stores/calculations')
    calculationStore = mod.calculationStore
  })

  describe('addCalculation', () => {
    it('adds a new calculation to state', () => {
      const calc = calculationStore.addCalculation({
        number: 'РСЧ-2026-001',
        date: '01.01.2026',
        company: 'ООО Тест',
        inn: '02312200210134',
        quarter: 'Q1',
        year: '2026',
        items: [],
        totalAmount: 50000,
      })

      expect(calc).toBeDefined()
      expect(calc.number).toBe('РСЧ-2026-001')
      expect(calc.status).toBe('draft')
      expect(calculationStore.state.calculations).toHaveLength(1)
    })

    it('adds calculation as under_review when status specified', () => {
      const calc = calculationStore.addCalculation(
        {
          number: 'РСЧ-2026-002',
          date: '01.01.2026',
          company: 'ООО Тест',
          inn: '02312200210134',
          quarter: 'Q1',
          year: '2026',
          items: [],
          totalAmount: 30000,
        },
        'under_review',
      )

      expect(calc.status).toBe('under_review')
    })
  })

  describe('submitForReview', () => {
    it('changes DRAFT to UNDER_REVIEW', () => {
      const calc = calculationStore.addCalculation({
        number: 'РСЧ-001',
        date: '01.01.2026',
        company: 'ООО Тест',
        inn: '111',
        quarter: 'Q1',
        year: '2026',
        items: [],
        totalAmount: 1000,
      })

      calculationStore.submitForReview(calc.id)

      const updated = calculationStore.getCalculationById(calc.id)
      expect(updated.status).toBe('under_review')
    })

    it('ignores calculation in APPROVED status', () => {
      const calc = calculationStore.addCalculation({
        number: 'РСЧ-002',
        date: '01.01.2026',
        company: 'ООО',
        inn: '222',
        quarter: 'Q1',
        year: '2026',
        items: [],
        totalAmount: 2000,
      })
      // Manually set to approved
      calc.status = 'approved'

      calculationStore.submitForReview(calc.id)

      expect(calc.status).toBe('approved') // unchanged
    })
  })

  describe('approveCalculation', () => {
    it('changes UNDER_REVIEW to APPROVED', () => {
      const calc = calculationStore.addCalculation({
        number: 'РСЧ-003',
        date: '01.01.2026',
        company: 'ООО',
        inn: '333',
        quarter: 'Q2',
        year: '2026',
        items: [],
        totalAmount: 5000,
      })
      calc.status = 'under_review'

      calculationStore.approveCalculation(calc.id)

      expect(calc.status).toBe('approved')
      expect(calc.approvedAt).toBeDefined()
    })
  })

  describe('rejectCalculation', () => {
    it('changes UNDER_REVIEW to REJECTED with reason', () => {
      const calc = calculationStore.addCalculation({
        number: 'РСЧ-004',
        date: '01.01.2026',
        company: 'ООО',
        inn: '444',
        quarter: 'Q3',
        year: '2026',
        items: [],
        totalAmount: 7000,
      })
      calc.status = 'under_review'

      calculationStore.rejectCalculation(calc.id, 'Неверные данные', 'Оператор')

      expect(calc.status).toBe('rejected')
      expect(calc.rejectionReason).toBe('Неверные данные')
      expect(calc.rejectedBy).toBe('Оператор')
    })
  })

  describe('copyCalculation', () => {
    it('creates a draft copy of existing calculation', () => {
      const original = calculationStore.addCalculation({
        number: 'РСЧ-005',
        date: '01.01.2026',
        company: 'ООО Копия',
        inn: '555',
        quarter: 'Q1',
        year: '2026',
        items: [
          {
            id: 1,
            group: 'Пластик',
            subgroup: 'PET',
            gskpCode: '',
            tnvedCode: '3901',
            volume: '100',
            recyclingStandard: 10,
            volumeToRecycle: 10,
            transferredToRecycling: '0',
            exportedFromKR: '',
            taxableVolume: 10,
            rate: 5000,
            amount: 50000,
          },
        ],
        totalAmount: 50000,
      })

      const copy = calculationStore.copyCalculation(original.id)

      expect(copy).toBeDefined()
      expect(copy!.status).toBe('draft')
      expect(copy!.id).not.toBe(original.id)
      expect(copy!.company).toBe('ООО Копия')
      expect(copy!.items).toHaveLength(1)
      expect(copy!.parentId).toBe(original.id)
    })

    it('returns undefined for non-existent id', () => {
      const result = calculationStore.copyCalculation(999999)
      expect(result).toBeUndefined()
    })
  })

  describe('submitPayment', () => {
    it('changes APPROVED to PAYMENT_PENDING', () => {
      const calc = calculationStore.addCalculation({
        number: 'РСЧ-006',
        date: '01.01.2026',
        company: 'ООО',
        inn: '666',
        quarter: 'Q1',
        year: '2026',
        items: [],
        totalAmount: 10000,
      })
      calc.status = 'approved'

      const payment = {
        paymentOrderNumber: 'ПП-001',
        paymentDate: '2026-01-15',
        payerBank: 'Банк',
        transferAmount: 10000,
        fileName: 'receipt.pdf',
        fileType: 'application/pdf',
        fileDataUrl: '',
      }

      calculationStore.submitPayment(calc.id, payment)

      expect(calc.status).toBe('payment_pending')
      expect(calc.payment).toBeDefined()
      expect(calc.payment!.paymentOrderNumber).toBe('ПП-001')
    })
  })

  describe('approvePayment', () => {
    it('changes PAYMENT_PENDING to PAID', () => {
      const calc = calculationStore.addCalculation({
        number: 'РСЧ-007',
        date: '01.01.2026',
        company: 'ООО',
        inn: '777',
        quarter: 'Q1',
        year: '2026',
        items: [],
        totalAmount: 5000,
      })
      calc.status = 'payment_pending'

      calculationStore.approvePayment(calc.id)

      expect(calc.status).toBe('paid')
      expect(calc.paidAt).toBeDefined()
    })
  })

  describe('counters', () => {
    it('getPendingCount returns correct count', () => {
      const c1 = calculationStore.addCalculation({
        number: 'A', date: '', company: '', inn: '', quarter: 'Q1', year: '2026', items: [], totalAmount: 0,
      })
      const c2 = calculationStore.addCalculation({
        number: 'B', date: '', company: '', inn: '', quarter: 'Q1', year: '2026', items: [], totalAmount: 0,
      })
      const c3 = calculationStore.addCalculation({
        number: 'C', date: '', company: '', inn: '', quarter: 'Q1', year: '2026', items: [], totalAmount: 0,
      })
      c1.status = 'under_review'
      c2.status = 'payment_pending'
      c3.status = 'approved'

      expect(calculationStore.getPendingCount()).toBe(2) // under_review + payment_pending
    })

    it('getCalculationById returns correct calculation', () => {
      const calc = calculationStore.addCalculation({
        number: 'FIND-ME', date: '', company: '', inn: '', quarter: 'Q1', year: '2026', items: [], totalAmount: 0,
      })

      const found = calculationStore.getCalculationById(calc.id)
      expect(found).toBeDefined()
      expect(found!.number).toBe('FIND-ME')
    })
  })

  describe('fetchAll', () => {
    it('populates calculations from backend API', async () => {
      const api = (await import('../api/client')).default
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 100,
              number: 'РС-2026-000100',
              status: 'draft',
              totalAmount: '25000',
              items: [],
              createdAt: '2026-01-01T00:00:00',
            },
          ],
        },
      })

      await calculationStore.fetchAll()

      expect(calculationStore.state.calculations).toHaveLength(1)
      expect(calculationStore.state.calculations[0].number).toBe('РС-2026-000100')
      expect(calculationStore.state.loading).toBe(false)
    })
  })
})
