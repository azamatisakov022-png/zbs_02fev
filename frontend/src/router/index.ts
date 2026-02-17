import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/glossary',
    name: 'glossary',
    component: () => import('../views/GlossaryView.vue'),
  },
  {
    path: '/legislation',
    name: 'legislation',
    component: () => import('../views/LegislationView.vue'),
  },
  {
    path: '/licenses',
    name: 'licenses',
    component: () => import('../views/LicensesView.vue'),
  },
  {
    path: '/publications',
    name: 'publications',
    component: () => import('../views/PublicationsView.vue'),
  },
  {
    path: '/registries',
    name: 'registries',
    component: () => import('../views/RegistriesView.vue'),
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: () => import('../views/CalculatorView.vue'),
  },
  {
    path: '/contests',
    name: 'contests',
    component: () => import('../views/ContestsView.vue'),
  },
  {
    path: '/reception-points',
    redirect: '/registries',
  },
  {
    path: '/recyclers',
    redirect: '/registries',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/RoleSelectionView.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
  },
  {
    path: '/login/business',
    name: 'login-business',
    component: () => import('../views/LoginBusinessView.vue'),
  },
  {
    path: '/auth/esi/callback',
    name: 'esi-callback',
    redirect: '/business',
  },

  // Admin routes
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../views/admin/AdminUsers.vue'),
    meta: { requiresAuth: true, role: 'admin', breadcrumbLabel: 'Пользователи' },
  },
  {
    path: '/admin/roles',
    name: 'admin-roles',
    component: () => import('../views/admin/AdminRoles.vue'),
    meta: { requiresAuth: true, role: 'admin', breadcrumbLabel: 'Роли и права' },
  },
  {
    path: '/admin/references',
    name: 'admin-references',
    component: () => import('../views/admin/AdminReferences.vue'),
    meta: { requiresAuth: true, role: 'admin', breadcrumbLabel: 'Справочники' },
  },
  {
    path: '/admin/audit',
    name: 'admin-audit',
    component: () => import('../views/admin/AdminAudit.vue'),
    meta: { requiresAuth: true, role: 'admin', breadcrumbLabel: 'Журнал аудита' },
  },
  {
    path: '/admin/notifications',
    name: 'admin-notifications',
    component: () => import('../views/admin/AdminNotifications.vue'),
    meta: { requiresAuth: true, role: 'admin', breadcrumbLabel: 'Уведомления' },
  },
  {
    path: '/admin/settings',
    name: 'admin-settings',
    component: () => import('../views/admin/AdminSettings.vue'),
    meta: { requiresAuth: true, role: 'admin', breadcrumbLabel: 'Настройки системы' },
  },
  // Redirects for removed admin pages
  {
    path: '/admin/organizations',
    redirect: '/admin',
  },
  {
    path: '/admin/declarations',
    redirect: '/admin',
  },
  {
    path: '/admin/reports',
    redirect: '/admin',
  },
  {
    path: '/admin/registries',
    redirect: '/admin/references',
  },
  {
    path: '/admin/calculations',
    redirect: '/admin',
  },
  {
    path: '/admin/analytics',
    redirect: '/admin',
  },
  {
    path: '/admin/support',
    redirect: '/admin',
  },

  // Employee routes
  {
    path: '/employee',
    name: 'employee-dashboard',
    component: () => import('../views/employee/EmployeeDashboard.vue'),
    meta: { requiresAuth: true, role: 'employee' },
  },
  {
    path: '/employee/compliance',
    name: 'employee-compliance',
    component: () => import('../views/employee/EmployeeCompliance.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Контроль исполнения' },
  },
  {
    path: '/employee/organizations',
    redirect: '/ministry/payers',
  },
  {
    path: '/employee/licenses',
    name: 'employee-licenses',
    component: () => import('../views/employee/EmployeeLicenses.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Лицензии' },
  },
  {
    path: '/employee/recyclers-registry',
    redirect: '/eco-operator/recyclers',
  },
  {
    path: '/employee/waste-types',
    name: 'employee-waste-types',
    component: () => import('../views/employee/EmployeeWasteTypes.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Виды отходов' },
  },
  {
    path: '/employee/reports',
    name: 'employee-reports',
    component: () => import('../views/employee/EmployeeReports.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Отчётность' },
  },
  {
    path: '/employee/map',
    name: 'employee-map',
    component: () => import('../views/employee/EmployeeMap.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'ГИС-карта' },
  },
  {
    path: '/employee/landfills',
    redirect: '/ministry/landfills',
  },
  {
    path: '/employee/profile',
    name: 'employee-profile',
    component: () => import('../views/employee/EmployeeProfile.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Мой профиль' },
  },
  {
    path: '/employee/notifications',
    name: 'employee-notifications',
    component: () => import('../views/employee/EmployeeNotifications.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Уведомления' },
  },

  // Business routes
  {
    path: '/business',
    name: 'business-dashboard',
    component: () => import('../views/business/BusinessDashboard.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/reports',
    name: 'business-reports',
    component: () => import('../views/business/BusinessReports.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Отчёты о переработке' },
  },
  {
    path: '/business/declarations',
    name: 'business-declarations',
    component: () => import('../views/business/BusinessDeclarations.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Декларации' },
  },
  {
    path: '/business/payments',
    name: 'business-payments',
    component: () => import('../views/business/BusinessPayments.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Платежи' },
  },
  {
    path: '/business/documents',
    name: 'business-documents',
    component: () => import('../views/business/BusinessDocuments.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Документы' },
  },
  {
    path: '/business/normatives',
    name: 'business-normatives',
    component: () => import('../views/business/BusinessNormatives.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Нормативы и ставки' },
  },
  {
    path: '/business/profile',
    name: 'business-profile',
    component: () => import('../views/business/BusinessProfile.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Профиль компании' },
  },
  {
    path: '/business/calculator',
    name: 'business-calculator',
    component: () => import('../views/business/BusinessCalculator.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Расчёт утильсбора' },
  },
  {
    path: '/business/calculations/:id',
    name: 'calculation-detail',
    component: () => import('../views/business/CalculationDetailView.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Просмотр расчёта' },
  },
  {
    path: '/business/reports/:id',
    name: 'business-report-detail',
    component: () => import('../views/business/BusinessReportDetailView.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Просмотр отчёта' },
  },
  {
    path: '/business/reports/new',
    name: 'business-reports-new',
    redirect: '/business/reports',
  },
  {
    path: '/business/declarations/new',
    name: 'business-declarations-new',
    redirect: '/business/declarations',
  },
  {
    path: '/business/account',
    name: 'business-account',
    component: () => import('../views/business/BusinessAccount.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Лицевой счёт' },
  },
  {
    path: '/business/account/correction',
    name: 'business-account-correction',
    component: () => import('../views/business/BusinessAccountCorrection.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Подача корректировки' },
  },
  {
    path: '/business/refunds',
    name: 'business-refunds',
    component: () => import('../views/business/BusinessRefunds.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Возврат утильсбора' },
  },
  {
    path: '/business/refunds/new',
    name: 'business-refunds-new',
    component: () => import('../views/business/BusinessRefundNew.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Заявка на возврат' },
  },
  {
    path: '/business/recyclers',
    name: 'business-recyclers',
    component: () => import('../views/business/BusinessRecyclers.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Переработчики' },
  },
  {
    path: '/business/notifications',
    name: 'business-notifications',
    component: () => import('../views/business/BusinessNotifications.vue'),
    meta: { requiresAuth: true, role: 'business', breadcrumbLabel: 'Уведомления' },
  },

  // Eco Operator routes
  {
    path: '/eco-operator',
    name: 'eco-operator-dashboard',
    component: () => import('../views/eco-operator/EcoOperatorDashboard.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/organizations',
    name: 'eco-operator-organizations',
    component: () => import('../views/eco-operator/EcoOperatorOrganizations.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Организации' },
  },
  {
    path: '/eco-operator/incoming-declarations',
    name: 'eco-operator-incoming-declarations',
    component: () => import('../views/eco-operator/EcoOperatorIncomingDeclarations.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Входящие декларации' },
  },
  {
    path: '/eco-operator/declarations/:id',
    name: 'eco-operator-declaration-detail',
    component: () => import('../views/eco-operator/EcoOperatorDeclarationDetail.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Рассмотрение декларации' },
  },
  {
    path: '/eco-operator/incoming-reports',
    name: 'eco-operator-incoming-reports',
    component: () => import('../views/eco-operator/EcoOperatorIncomingReports.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Отчёты о переработке' },
  },
  {
    path: '/eco-operator/calculations',
    name: 'eco-operator-calculations',
    component: () => import('../views/eco-operator/EcoOperatorIncomingCalculations.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Входящие расчёты' },
  },
  {
    path: '/eco-operator/calculations/:id',
    name: 'eco-operator-calculation-detail',
    component: () => import('../views/eco-operator/EcoOperatorCalculationDetail.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Просмотр расчёта' },
  },
  {
    path: '/eco-operator/incoming-calculations',
    redirect: '/eco-operator/calculations',
  },
  {
    path: '/eco-operator/recyclers',
    name: 'eco-operator-recyclers',
    component: () => import('../views/eco-operator/EcoOperatorRecyclersRegistry.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Реестр переработчиков' },
  },
  {
    path: '/eco-operator/recyclers/:id',
    name: 'eco-operator-recycler-detail',
    component: () => import('../views/eco-operator/EcoOperatorRecyclerDetail.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Карточка переработчика' },
  },
  {
    path: '/eco-operator/landfills',
    redirect: '/ministry/landfills',
  },
  {
    path: '/eco-operator/landfills/:id',
    redirect: to => '/ministry/landfills/' + to.params.id,
  },
  {
    path: '/eco-operator/licenses',
    redirect: '/eco-operator',
  },
  {
    path: '/eco-operator/waste-types',
    redirect: '/employee/waste-types',
  },
  {
    path: '/eco-operator/my-reports',
    redirect: '/eco-operator/analytics',
  },
  {
    path: '/eco-operator/payments',
    redirect: '/eco-operator/analytics',
  },
  {
    path: '/eco-operator/analytics',
    name: 'eco-operator-analytics',
    component: () => import('../views/eco-operator/EcoOperatorAnalytics.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Аналитика и отчёты' },
  },
  {
    path: '/eco-operator/profile',
    name: 'eco-operator-profile',
    component: () => import('../views/eco-operator/EcoOperatorProfile.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Профили компаний' },
  },
  {
    path: '/eco-operator/accounts',
    name: 'eco-operator-accounts',
    component: () => import('../views/eco-operator/EcoOperatorAccounts.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Лицевые счета' },
  },
  {
    path: '/eco-operator/accounts/:id',
    name: 'eco-operator-account-detail',
    component: () => import('../views/eco-operator/EcoOperatorAccountDetail.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Детализация счёта' },
  },
  {
    path: '/eco-operator/reports/:id',
    name: 'eco-operator-report-detail',
    component: () => import('../views/eco-operator/EcoOperatorReportDetail.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Просмотр отчёта' },
  },
  {
    path: '/eco-operator/refunds',
    name: 'eco-operator-refunds',
    component: () => import('../views/eco-operator/EcoOperatorRefunds.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Заявки на возврат' },
  },
  {
    path: '/eco-operator/refunds/:id',
    name: 'eco-operator-refund-detail',
    component: () => import('../views/eco-operator/EcoOperatorRefundDetail.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Просмотр заявки' },
  },
  {
    path: '/eco-operator/notifications',
    name: 'eco-operator-notifications',
    component: () => import('../views/eco-operator/EcoOperatorNotifications.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Уведомления' },
  },

  // Ministry (МПРЭТН) routes
  {
    path: '/ministry/landfills',
    name: 'ministry-landfills',
    component: () => import('../views/ministry/MinistryLandfills.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Полигоны ТБО' },
  },
  {
    path: '/ministry/landfills/:id',
    name: 'ministry-landfill-detail',
    component: () => import('../views/ministry/MinistryLandfillDetail.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Карточка полигона' },
  },

  {
    path: '/ministry/analytics',
    name: 'ministry-analytics',
    component: () => import('../views/ministry/MinistryAnalytics.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Аналитика' },
  },
  {
    path: '/ministry/payers',
    name: 'ministry-payers',
    component: () => import('../views/ministry/MinistryPayers.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Реестр плательщиков' },
  },
  {
    path: '/ministry/payers/:id',
    name: 'ministry-payer-detail',
    component: () => import('../views/ministry/MinistryPayerDetail.vue'),
    meta: { requiresAuth: true, role: 'employee', breadcrumbLabel: 'Карточка плательщика' },
  },

  // Eco-operator payers
  {
    path: '/eco-operator/payers',
    name: 'eco-operator-payers',
    component: () => import('../views/eco-operator/EcoOperatorPayers.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Реестр плательщиков' },
  },
  {
    path: '/eco-operator/payers/:id',
    name: 'eco-operator-payer-detail',
    component: () => import('../views/eco-operator/EcoOperatorPayerDetail.vue'),
    meta: { requiresAuth: true, role: 'eco-operator', breadcrumbLabel: 'Карточка плательщика' },
  },

  // 404 catch-all
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Simple auth guard (in real app, check actual auth state)
router.beforeEach((to, _from, next) => {
  // For now, allow all navigation (auth would be implemented with real backend)
  // In production, check if user is authenticated and has the correct role
  if (to.meta.requiresAuth) {
    // Placeholder for auth check
    // const isAuthenticated = checkAuth()
    // const userRole = getUserRole()
    // if (!isAuthenticated) return next('/login')
    // if (to.meta.role && to.meta.role !== userRole) return next('/login')
  }
  next()
})

export default router
