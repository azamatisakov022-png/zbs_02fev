import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { icons } from '../utils/menuIcons'
import { calculationStore } from '../stores/calculations'
import { refundStore } from '../stores/refunds'
import { reportStore } from '../stores/reports'
import { notificationStore } from '../stores/notifications'
import { feedbackStore } from '../stores/feedback'
import { contestStore } from '../stores/contests'
import { authStore } from '../stores/auth'

/**
 * Меню для BUSINESS-пользователя.
 * Состав меню определяется полем business_type:
 *   - PAYER     — плательщик утильсбора, видит декларации, расчёты, баланс. Раздел «Лицензии» скрыт.
 *   - APPLICANT — заявитель на лицензию (переработчик, полигон, пункт приёма).
 *                 Видит только профиль, уведомления и раздел «Лицензии».
 *                 Разделы утильсбора скрыты, т.к. он не платит РОП.
 *   - BOTH      — редкий гибрид (плательщик, одновременно подающий на лицензию).
 *                 Видит оба набора.
 */
export function useBusinessMenu() {
  const { t } = useI18n()

  const bt = computed(() => authStore.state.user?.businessType || 'payer')

  // Название роли в сайдбаре зависит от типа: APPLICANT = «Заявитель».
  const roleTitle = computed(() => {
    if (bt.value === 'applicant') return 'Заявитель'
    if (bt.value === 'both') return 'Плательщик и заявитель'
    return t('roles.business')
  })

  const commonItems = computed(() => [
    { id: 'dashboard', label: t('nav.business.dashboard'), icon: icons.dashboard, route: '/business' },
    { id: 'notifications', label: t('notifications.title'), icon: icons.notification, route: '/business/notifications', badge: notificationStore.getUnreadCount('business') },
  ])

  const payerItems = computed(() => [
    { id: 'account', label: t('nav.business.account'), icon: icons.money, route: '/business/account' },
    { id: 'calculator', label: t('nav.business.calculator'), icon: icons.calculator, route: '/business/calculator' },
    { id: 'reports', label: t('nav.business.reports'), icon: icons.report, route: '/business/reports' },
    { id: 'declarations', label: t('nav.business.declarations'), icon: icons.document, route: '/business/declarations' },
    { id: 'documents', label: t('nav.business.documents'), icon: icons.folder, route: '/business/documents' },
    { id: 'normatives', label: t('nav.business.normatives'), icon: icons.registries, route: '/business/normatives' },
  ])

  const licenseItems = computed(() => [
    { id: 'license-applications', label: t('nav.business.licenseApplications') || 'Мои заявки', icon: icons.document, route: '/business/license-applications' },
    { id: 'my-licenses', label: t('nav.business.myLicenses') || 'Мои лицензии', icon: icons.license, route: '/business/my-licenses' },
  ])

  const profileItem = computed(() => ({
    id: 'profile', label: t('nav.business.profile'), icon: icons.building, route: '/business/profile',
  }))

  const menuItems = computed(() => {
    const items: Array<{ id: string; label: string; icon: unknown; route: string; badge?: number }> = [
      ...commonItems.value,
    ]
    if (bt.value === 'payer' || bt.value === 'both') items.push(...payerItems.value)
    if (bt.value === 'applicant' || bt.value === 'both') items.push(...licenseItems.value)
    items.push(profileItem.value)
    return items
  })

  return { roleTitle, menuItems, businessType: bt }
}

export function useEcoOperatorMenu() {
  const { t } = useI18n()
  const roleTitle = computed(() => t('roles.ecoOperator'))
  const menuItems = computed(() => [
    { id: 'dashboard', label: t('nav.ecoOperator.dashboard'), icon: icons.dashboard, route: '/eco-operator' },
    { id: 'notifications', label: t('notifications.title'), icon: icons.notification, route: '/eco-operator/notifications', badge: notificationStore.getUnreadCount('eco-operator') },
    { id: 'incoming-calculations', label: t('nav.ecoOperator.calculations'), icon: icons.calculator, route: '/eco-operator/calculations', badge: calculationStore.getCalcReviewCount() },
    { id: 'incoming-declarations', label: t('nav.ecoOperator.incomingDeclarations'), icon: icons.document, route: '/eco-operator/incoming-declarations' },
    { id: 'incoming-reports', label: t('nav.ecoOperator.incomingReports'), icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
    { id: 'refunds', label: t('nav.ecoOperator.refunds'), icon: icons.refund, route: '/eco-operator/refunds', badge: refundStore.getPendingRefundsCount() },
    { id: 'contests', label: t('nav.ecoOperator.contests'), icon: icons.trophy, route: '/eco-operator/contests', badge: contestStore.getPendingCount() },
    { id: 'accounts', label: t('nav.ecoOperator.accounts'), icon: icons.money, route: '/eco-operator/accounts' },
    { id: 'analytics', label: t('nav.ecoOperator.analytics'), icon: icons.analytics, route: '/eco-operator/analytics' },
    { id: 'profile', label: t('nav.ecoOperator.profile'), icon: icons.profile, route: '/eco-operator/profile' },
    { id: 'payers', label: t('nav.ecoOperator.payers'), icon: icons.registries, route: '/eco-operator/payers' },
    { id: 'recyclers-registry', label: t('nav.ecoOperator.recyclers'), icon: icons.recycle, route: '/eco-operator/recyclers' },
    { id: 'licenses-registry', label: t('nav.ecoOperator.licenses') || 'Реестр лицензий', icon: icons.license, route: '/eco-operator/licenses' },
  ])
  return { roleTitle, menuItems }
}

export function useEmployeeMenu() {
  const { t } = useI18n()
  const roleTitle = computed(() => t('roles.employee'))
  const menuItems = computed(() => [
    { id: 'dashboard', label: t('nav.employee.dashboard'), icon: icons.dashboard, route: '/employee' },

    // Секция: Заявления и обращения
    { id: 'licenses', label: t('nav.employee.licenses'), icon: icons.license, route: '/employee/licenses', groupTitle: t('nav.employee.sections.applications') },
    { id: 'feedback', label: t('nav.employee.feedback'), icon: icons.feedback, route: '/employee/feedback', badge: feedbackStore.getNewCount() },
    { id: 'compliance', label: t('nav.employee.compliance'), icon: icons.compliance, route: '/employee/compliance' },

    // Секция: Реестры
    { id: 'landfills-tbo', label: t('nav.employee.landfillsTbo'), icon: icons.landfill, route: '/ministry/landfills', groupTitle: t('nav.employee.sections.registries') },
    { id: 'collection-points', label: t('nav.employee.collectionPoints'), icon: icons.landfill, route: '/ministry/collection-points' },
    { id: 'waste-types', label: t('nav.employee.wasteTypes'), icon: icons.recycle, route: '/employee/waste-types' },

    // Секция: Аналитика
    { id: 'analytics', label: t('nav.employee.analytics'), icon: icons.analytics, route: '/ministry/analytics', groupTitle: t('nav.employee.sections.analytics') },
    { id: 'reports', label: t('nav.employee.reports'), icon: icons.report, route: '/employee/reports' },
    { id: 'map', label: t('nav.employee.map'), icon: icons.map, route: '/employee/map' },

    // Секция: Система
    { id: 'audit', label: t('nav.employee.audit'), icon: icons.audit, route: '/employee/audit', groupTitle: t('nav.employee.sections.system') },

    // Нижний блок (отделён линией, без текстового заголовка)
    { id: 'notifications', label: t('notifications.title'), icon: icons.notification, route: '/employee/notifications', badge: notificationStore.getUnreadCount('employee'), groupDivider: true },
    { id: 'profile', label: t('nav.employee.profile'), icon: icons.profile, route: '/employee/profile' },
  ])
  return { roleTitle, menuItems }
}

export function useAdminMenu() {
  const { t } = useI18n()
  const roleTitle = computed(() => t('roles.admin'))
  const menuItems = computed(() => [
    { id: 'dashboard', label: t('nav.admin.dashboard'), icon: icons.dashboard, route: '/admin' },
    { id: 'users', label: t('nav.admin.users'), icon: icons.users, route: '/admin/users' },
    { id: 'roles', label: t('nav.admin.roles'), icon: icons.shield, route: '/admin/roles' },
    { id: 'references', label: t('nav.admin.references'), icon: icons.registries, route: '/admin/references' },
    { id: 'audit', label: t('nav.admin.audit'), icon: icons.audit, route: '/admin/audit' },
    { id: 'notifications', label: t('nav.admin.notifications'), icon: icons.notification, route: '/admin/notifications' },
    { id: 'settings', label: t('nav.admin.settings'), icon: icons.settings, route: '/admin/settings' },
  ])
  return { roleTitle, menuItems }
}
