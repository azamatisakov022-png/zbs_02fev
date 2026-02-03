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
    name: 'reception-points',
    component: () => import('../views/ReceptionPointsView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/RoleSelectionView.vue'),
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
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/organizations',
    name: 'admin-organizations',
    component: () => import('../views/admin/AdminOrganizations.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/declarations',
    name: 'admin-declarations',
    component: () => import('../views/admin/AdminDeclarations.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    component: () => import('../views/admin/AdminReports.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/registries',
    name: 'admin-registries',
    component: () => import('../views/admin/AdminRegistries.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/calculations',
    name: 'admin-calculations',
    component: () => import('../views/admin/AdminCalculations.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/analytics',
    name: 'admin-analytics',
    component: () => import('../views/admin/AdminAnalytics.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/audit',
    name: 'admin-audit',
    component: () => import('../views/admin/AdminAudit.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/settings',
    name: 'admin-settings',
    component: () => import('../views/admin/AdminSettings.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/support',
    name: 'admin-support',
    component: () => import('../views/admin/AdminSupport.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },

  // Employee routes
  {
    path: '/employee',
    name: 'employee-dashboard',
    component: () => import('../views/employee/EmployeeDashboard.vue'),
    meta: { requiresAuth: true, role: 'employee' },
  },
  {
    path: '/employee/applications',
    name: 'employee-applications',
    component: () => import('../views/employee/EmployeeApplications.vue'),
    meta: { requiresAuth: true, role: 'employee' },
  },
  {
    path: '/employee/organizations',
    name: 'employee-organizations',
    component: () => import('../views/employee/EmployeeOrganizations.vue'),
    meta: { requiresAuth: true, role: 'employee' },
  },
  {
    path: '/employee/licenses',
    name: 'employee-licenses',
    component: () => import('../views/employee/EmployeeLicenses.vue'),
    meta: { requiresAuth: true, role: 'employee' },
  },
  {
    path: '/employee/reports',
    name: 'employee-reports',
    component: () => import('../views/employee/EmployeeReports.vue'),
    meta: { requiresAuth: true, role: 'employee' },
  },
  {
    path: '/employee/map',
    name: 'employee-map',
    component: () => import('../views/employee/EmployeeMap.vue'),
    meta: { requiresAuth: true, role: 'employee' },
  },
  {
    path: '/employee/analytics',
    name: 'employee-analytics',
    component: () => import('../views/employee/EmployeeAnalytics.vue'),
    meta: { requiresAuth: true, role: 'employee' },
  },
  {
    path: '/employee/profile',
    name: 'employee-profile',
    component: () => import('../views/employee/EmployeeProfile.vue'),
    meta: { requiresAuth: true, role: 'employee' },
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
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/declarations',
    name: 'business-declarations',
    component: () => import('../views/business/BusinessDeclarations.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/payments',
    name: 'business-payments',
    component: () => import('../views/business/BusinessPayments.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/documents',
    name: 'business-documents',
    component: () => import('../views/business/BusinessDocuments.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/normatives',
    name: 'business-normatives',
    component: () => import('../views/business/BusinessNormatives.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/recyclers',
    name: 'business-recyclers',
    component: () => import('../views/business/BusinessRecyclers.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/profile',
    name: 'business-profile',
    component: () => import('../views/business/BusinessProfile.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/calculator',
    name: 'business-calculator',
    component: () => import('../views/business/BusinessCalculator.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/reports/new',
    name: 'business-reports-new',
    component: () => import('../views/business/BusinessStub.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/declarations/new',
    name: 'business-declarations-new',
    component: () => import('../views/business/BusinessStub.vue'),
    meta: { requiresAuth: true, role: 'business' },
  },

  // Eco Operator routes
  {
    path: '/eco-operator',
    name: 'eco-operator-dashboard',
    component: () => import('../views/eco-operator/EcoOperatorDashboard.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/incoming-declarations',
    name: 'eco-operator-incoming-declarations',
    component: () => import('../views/eco-operator/EcoOperatorIncomingDeclarations.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/incoming-reports',
    name: 'eco-operator-incoming-reports',
    component: () => import('../views/eco-operator/EcoOperatorIncomingReports.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/enterprise',
    name: 'eco-operator-enterprise',
    component: () => import('../views/eco-operator/EcoOperatorEnterprise.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/licenses',
    name: 'eco-operator-licenses',
    component: () => import('../views/eco-operator/EcoOperatorLicenses.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/waste-types',
    name: 'eco-operator-waste-types',
    component: () => import('../views/eco-operator/EcoOperatorWasteTypes.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/my-reports',
    name: 'eco-operator-my-reports',
    component: () => import('../views/eco-operator/EcoOperatorMyReports.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/payments',
    name: 'eco-operator-payments',
    component: () => import('../views/eco-operator/EcoOperatorPayments.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/analytics',
    name: 'eco-operator-analytics',
    component: () => import('../views/eco-operator/EcoOperatorAnalytics.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
  },
  {
    path: '/eco-operator/profile',
    name: 'eco-operator-profile',
    component: () => import('../views/eco-operator/EcoOperatorProfile.vue'),
    meta: { requiresAuth: true, role: 'eco-operator' },
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
