import { reactive } from 'vue'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationRole = 'business' | 'eco-operator' | 'employee' | 'admin'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  time: string
  read: boolean
  role: NotificationRole
}

const state = reactive<{ notifications: Notification[] }>({
  notifications: [
    // Business notifications
    { id: 1, type: 'success', title: 'Расчёт РС-2026-015 принят', message: 'Ваш расчёт утилизационного сбора за Q4 2025 принят и ожидает оплаты.', time: '2 часа назад', read: false, role: 'business' },
    { id: 2, type: 'warning', title: 'Срок подачи декларации за Q1', message: 'Срок подачи декларации за I квартал 2026 года — до 20 апреля 2026 г.', time: '5 часов назад', read: false, role: 'business' },
    { id: 3, type: 'success', title: 'Платёж подтверждён', message: 'Платёж ПП-00412 на сумму 6 322 сом подтверждён.', time: '1 день назад', read: true, role: 'business' },
    { id: 4, type: 'error', title: 'Расчёт РС-2026-024 отклонён', message: 'Неверно указана масса товаров в группе 6. Исправьте и отправьте повторно.', time: '2 дня назад', read: true, role: 'business' },
    { id: 5, type: 'info', title: 'Обновление нормативов', message: 'С 1 января 2026 года вступают в силу новые нормативы переработки.', time: '3 дня назад', read: true, role: 'business' },

    // Eco-Operator notifications
    { id: 6, type: 'info', title: 'Новый расчёт от ОАО «СтройМаркет»', message: 'Расчёт РС-2026-018 на сумму 9 583 сом ожидает проверки.', time: '1 час назад', read: false, role: 'eco-operator' },
    { id: 7, type: 'error', title: 'Отчёт №45 отклонён', message: 'Отчёт ОсОО «ПищеПром» отклонён: процент переработки ниже норматива.', time: '3 часа назад', read: false, role: 'eco-operator' },
    { id: 8, type: 'success', title: 'Оплата подтверждена', message: 'Платёж ОсОО «ТехПром» на сумму 6 322 сом успешно подтверждён.', time: '6 часов назад', read: false, role: 'eco-operator' },
    { id: 9, type: 'warning', title: 'Новый отчёт о переработке', message: 'ОАО «СтройМаркет» подал отчёт РП-2026-019 на проверку.', time: '1 день назад', read: true, role: 'eco-operator' },
    { id: 10, type: 'info', title: 'Расчёт от ОсОО «ПищеПром»', message: 'Новый расчёт РС-2026-021 на сумму 3 309 сом поступил на проверку.', time: '2 дня назад', read: true, role: 'eco-operator' },

    // Employee notifications
    { id: 11, type: 'warning', title: 'Лицензия ОсОО «ТекстильРесайкл» истекает', message: 'Лицензия на переработку истекает через 30 дней. Требуется уведомление организации.', time: '30 мин назад', read: false, role: 'employee' },
    { id: 12, type: 'info', title: 'Новая заявка на регистрацию', message: 'ОсОО «НовоТрейд» подал заявку на регистрацию плательщика РОП.', time: '2 часа назад', read: false, role: 'employee' },
    { id: 13, type: 'success', title: 'Лицензия выдана', message: 'Лицензия ОсОО «ЭкоСервис» на переработку отходов одобрена и выдана.', time: '4 часа назад', read: false, role: 'employee' },
    { id: 14, type: 'info', title: 'Обновление реестра', message: 'В реестр переработчиков добавлено 3 новые организации за эту неделю.', time: '1 день назад', read: true, role: 'employee' },
    { id: 15, type: 'warning', title: 'Просроченные заявки', message: '5 заявок ожидают рассмотрения более 7 дней.', time: '1 день назад', read: true, role: 'employee' },

    // Admin notifications
    { id: 16, type: 'error', title: 'Ошибка интеграции с ЕСИ', message: 'Сервис аутентификации ЕСИ недоступен. Последняя проверка: 10:45.', time: '15 мин назад', read: false, role: 'admin' },
    { id: 17, type: 'info', title: 'Новый пользователь зарегистрирован', message: 'ОсОО «НовоТрейд» (ИНН: 07654321098765) завершил регистрацию.', time: '1 час назад', read: false, role: 'admin' },
    { id: 18, type: 'success', title: 'Резервное копирование выполнено', message: 'Автоматическое резервное копирование базы данных завершено успешно.', time: '3 часа назад', read: false, role: 'admin' },
    { id: 19, type: 'warning', title: 'Высокая нагрузка на сервер', message: 'Загрузка CPU превысила 85% в течение последних 15 минут.', time: '5 часов назад', read: true, role: 'admin' },
    { id: 20, type: 'info', title: 'Обновление системы', message: 'Запланировано техническое обслуживание на 15 февраля 2026 г., 02:00-04:00.', time: '1 день назад', read: true, role: 'admin' },
  ],
})

function getByRole(role: NotificationRole) {
  return state.notifications.filter(n => n.role === role)
}

function getUnreadCount(role: NotificationRole) {
  return state.notifications.filter(n => n.role === role && !n.read).length
}

function markAsRead(id: number) {
  const notification = state.notifications.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

function markAllAsRead(role: NotificationRole) {
  state.notifications.forEach(n => {
    if (n.role === role) {
      n.read = true
    }
  })
}

export const notificationStore = {
  state,
  getByRole,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
}
