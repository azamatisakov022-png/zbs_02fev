import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { icons } from '../utils/menuIcons'
import { useCalculationStore } from '../stores/calculations'
import { refundStore } from '../stores/refunds'
import { reportStore } from '../stores/reports'
import { notificationStore } from '../stores/notifications'

export function useBusinessMenu() {
  const { t } = useI18n()
  const roleTitle = computed(() => t('roles.business'))
  const menuItems = computed(() => [
    { id: 'dashboard', label: t('nav.business.dashboard'), icon: icons.dashboard, route: '/business', theme: 'blue' },
    { id: 'notifications', label: t('notifications.title'), icon: icons.notification, route: '/business/notifications', badge: notificationStore.getUnreadCount('business'), theme: 'amber' },
    { id: 'account', label: t('nav.business.account'), icon: icons.money, route: '/business/account', theme: 'emerald' },
    { id: 'calculator', label: t('nav.business.calculator'), icon: icons.calculator, route: '/business/calculator', theme: 'violet' },
    { id: 'reports', label: t('nav.business.reports'), icon: icons.report, route: '/business/reports', theme: 'indigo' },
    { id: 'declarations', label: t('nav.business.declarations'), icon: icons.document, route: '/business/declarations', theme: 'cyan' },
    { id: 'documents', label: t('nav.business.documents'), icon: icons.folder, route: '/business/documents', theme: 'orange' },
    { id: 'normatives', label: t('nav.business.normatives'), icon: icons.registries, route: '/business/normatives', theme: 'slate' },
    { id: 'profile', label: t('nav.business.profile'), icon: icons.building, route: '/business/profile', theme: 'rose' },
  ])
  return { roleTitle, menuItems }
}

export function useEcoOperatorMenu() {
  const { t } = useI18n()
  const calcStore = useCalculationStore()
  const roleTitle = computed(() => t('roles.ecoOperator'))
  const menuItems = computed(() => [
    { id: 'dashboard', label: t('nav.ecoOperator.dashboard'), icon: icons.dashboard, route: '/eco-operator', theme: 'blue' },
    { id: 'notifications', label: t('notifications.title'), icon: icons.notification, route: '/eco-operator/notifications', badge: notificationStore.getUnreadCount('eco-operator'), theme: 'amber' },
    { id: 'incoming-calculations', label: t('nav.ecoOperator.calculations'), icon: icons.calculator, route: '/eco-operator/calculations', badge: calcStore.calcReviewCount, theme: 'violet' },
    { id: 'incoming-declarations', label: t('nav.ecoOperator.incomingDeclarations'), icon: icons.document, route: '/eco-operator/incoming-declarations', theme: 'cyan' },
    { id: 'incoming-reports', label: t('nav.ecoOperator.incomingReports'), icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount(), theme: 'indigo' },
    { id: 'refunds', label: t('nav.ecoOperator.refunds'), icon: icons.refund, route: '/eco-operator/refunds', badge: refundStore.getPendingRefundsCount(), theme: 'orange' },
    { id: 'accounts', label: t('nav.ecoOperator.accounts'), icon: icons.money, route: '/eco-operator/accounts', theme: 'emerald' },
    { id: 'analytics', label: t('nav.ecoOperator.analytics'), icon: icons.analytics, route: '/eco-operator/analytics', theme: 'teal' },
    { id: 'profile', label: t('nav.ecoOperator.profile'), icon: icons.profile, route: '/eco-operator/profile', theme: 'rose' },
    { id: 'payers', label: t('nav.ecoOperator.payers'), icon: icons.registries, route: '/eco-operator/payers', theme: 'slate' },
    { id: 'recyclers-registry', label: t('nav.ecoOperator.recyclers'), icon: icons.recycle, route: '/eco-operator/recyclers', theme: 'emerald' },
  ])
  return { roleTitle, menuItems }
}

export function useEmployeeMenu() {
  const { t } = useI18n()
  const roleTitle = computed(() => t('roles.employee'))
  const menuItems = computed(() => [
    { id: 'dashboard', label: t('nav.employee.dashboard'), icon: icons.dashboard, route: '/employee', theme: 'blue' },
    { id: 'notifications', label: t('notifications.title'), icon: icons.notification, route: '/employee/notifications', badge: notificationStore.getUnreadCount('employee'), theme: 'amber' },
    { id: 'analytics', label: t('nav.employee.analytics'), icon: icons.analytics, route: '/ministry/analytics', theme: 'teal' },
    { id: 'compliance', label: t('nav.employee.compliance'), icon: icons.compliance, route: '/employee/compliance', theme: 'emerald' },
    { id: 'licenses', label: t('nav.employee.licenses'), icon: icons.license, route: '/employee/licenses', theme: 'violet' },
    { id: 'waste-types', label: t('nav.employee.wasteTypes'), icon: icons.recycle, route: '/employee/waste-types', theme: 'emerald' },
    { id: 'landfills-tbo', label: t('nav.employee.landfillsTbo'), icon: icons.landfill, route: '/ministry/landfills', theme: 'orange' },
    { id: 'collection-points', label: t('nav.employee.collectionPoints'), icon: icons.landfill, route: '/ministry/collection-points', theme: 'cyan' },
    { id: 'reports', label: t('nav.employee.reports'), icon: icons.report, route: '/employee/reports', theme: 'indigo' },
    { id: 'map', label: t('nav.employee.map'), icon: icons.map, route: '/employee/map', theme: 'teal' },
    { id: 'profile', label: t('nav.employee.profile'), icon: icons.profile, route: '/employee/profile', theme: 'rose' },
  ])
  return { roleTitle, menuItems }
}

export function useAdminMenu() {
  const { t } = useI18n()
  const roleTitle = computed(() => t('roles.admin'))
  const menuItems = computed(() => [
    { id: 'dashboard', label: t('nav.admin.dashboard'), icon: icons.dashboard, route: '/admin', theme: 'blue' },
    { id: 'users', label: t('nav.admin.users'), icon: icons.users, route: '/admin/users', theme: 'indigo' },
    { id: 'roles', label: t('nav.admin.roles'), icon: icons.shield, route: '/admin/roles', theme: 'emerald' },
    { id: 'references', label: t('nav.admin.references'), icon: icons.registries, route: '/admin/references', theme: 'slate' },
    { id: 'audit', label: t('nav.admin.audit'), icon: icons.audit, route: '/admin/audit', theme: 'orange' },
    { id: 'notifications', label: t('nav.admin.notifications'), icon: icons.notification, route: '/admin/notifications', theme: 'amber' },
    { id: 'settings', label: t('nav.admin.settings'), icon: icons.settings, route: '/admin/settings', theme: 'violet' },
  ])
  return { roleTitle, menuItems }
}
