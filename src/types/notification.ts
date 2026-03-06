export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationRole = 'business' | 'eco-operator' | 'employee' | 'admin'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  role: NotificationRole
  createdAt: string
  read: boolean
  link?: string
  referenceId?: number
  referenceType?: string
}
