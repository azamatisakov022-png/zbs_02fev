import type { ProductItem } from './calculation'

export type PayerType = 'producer' | 'importer'

export interface CalculatorProductItem extends ProductItem {
  recycledFile: { name: string; file: File } | null
  exportedFile: { name: string; file: File } | null
}

export type NormStatus = { met: boolean; message: string }

export interface ConfirmDialogState {
  visible: boolean
  title: string
  message: string
  icon: 'warning' | 'danger' | 'info' | 'success'
  confirmText: string
  confirmColor: 'green' | 'red' | 'orange'
  onConfirm: () => void
}

export interface CalculationResult {
  number: string
  date: string
  dueDate: string
}
