import { statusI18nKey } from '../constants/statuses'

/**
 * Hardcoded status labels (Russian) — fallback when i18n is not available.
 */
export const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  under_review: 'На проверке',
  approved: 'Одобрен',
  rejected: 'Отклонён',
  paid: 'Оплачено',
  payment_pending: 'Оплата на проверке',
  payment_rejected: 'Оплата отклонена',
  revision: 'На доработке',
  new: 'Новая',
  valid: 'Действует',
  expiring: 'Истекает',
  expired: 'Истекла',
  revoked: 'Аннулирован',
  active: 'Активен',
  blocked: 'Заблокирован',
  temp_blocked: 'Временно заблокирован',
  pending: 'Ожидает подтверждения',
  deactivated: 'Деактивирован',
  suspended: 'Приостановлен',
  closed: 'Закрыт',
  recultivation: 'Рекультивация',
  submitted: 'Подана',
  in_review: 'На рассмотрении',
  fee_paid: 'Сбор оплачен',
  penalty_paid: 'Пеня оплачена',
  completed: 'Завершён',
}

/**
 * Status → CSS color mapping for inline use.
 */
export const statusColors: Record<string, string> = {
  draft: '#f59e0b',
  under_review: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
  paid: '#22c55e',
  payment_pending: '#f59e0b',
  payment_rejected: '#ef4444',
  revision: '#3b82f6',
  new: '#3b82f6',
  valid: '#22c55e',
  expiring: '#f59e0b',
  expired: '#ef4444',
  revoked: '#ef4444',
  active: '#22c55e',
  blocked: '#ef4444',
  temp_blocked: '#ef4444',
  pending: '#f59e0b',
  deactivated: '#6b7280',
  suspended: '#6b7280',
  closed: '#6b7280',
  submitted: '#f59e0b',
  in_review: '#f59e0b',
  fee_paid: '#3b82f6',
  penalty_paid: '#22c55e',
  completed: '#22c55e',
}

/**
 * Get a human-readable Russian label for a status string.
 */
export function getStatusLabel(status: string): string {
  return statusLabels[status] || status
}

/**
 * Get the color hex string for a status.
 */
export function getStatusColor(status: string): string {
  return statusColors[status] || '#6b7280'
}

/**
 * Get the i18n key for a status (delegates to statusI18nKey).
 */
export function getStatusI18nKey(status: string): string {
  return statusI18nKey[status] || status
}
