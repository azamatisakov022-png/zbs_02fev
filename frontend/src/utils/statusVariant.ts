/**
 * Maps status strings to AppBadge variant names.
 * Used across all dashboard views for consistent badge coloring.
 */
export function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = status.toLowerCase()

  // Success (green)
  if (['принято', 'принята', 'принят', 'оплачено', 'активен', 'активна', 'действует',
       'завершён', 'завершена', 'выполнено', 'одобрено', 'одобрена', 'подтверждён',
       'подтверждена', 'разблокирован', 'восстановлен', 'активирован', 'active', 'valid'].some(v => s.includes(v))) return 'success'

  // Warning (yellow/orange)
  if (['на проверке', 'на рассмотрении', 'ожидает', 'истекает', 'в обработке',
       'черновик', 'оплата на проверке', 'приостановлен', 'приостановлена',
       'в работе', 'на доработке', 'expiring', 'pending'].some(v => s.includes(v))) return 'warning'

  // Danger (red)
  if (['отклонено', 'отклонена', 'отклонён', 'аннулирован', 'аннулирована', 'просрочено',
       'просрочена', 'истекла', 'удалён', 'удалена', 'отменено', 'отменена',
       'заблокирован', 'expired', 'revoked'].some(v => s.includes(v))) return 'danger'

  // Info (blue)
  if (['новая', 'новый', 'подана', 'подан', 'отправлен', 'отправлена',
       'зарегистрирован', 'зарегистрирована', 'создан', 'создана'].some(v => s.includes(v))) return 'info'

  // Neutral (gray)
  if (['деактивирован', 'деактивирована', 'неактивен', 'неактивна', 'inactive'].some(v => s.includes(v))) return 'neutral'

  return 'neutral'
}
