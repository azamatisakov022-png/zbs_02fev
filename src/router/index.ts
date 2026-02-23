import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/legislation',
    name: 'legislation',
    component: () => import('@/views/LegislationView.vue')
  },
  {
    path: '/licenses',
    name: 'licenses',
    component: () => import('@/views/LicensesView.vue')
  },
  {
    path: '/publications',
    name: 'publications',
    component: () => import('@/views/PublicationsView.vue')
  },
  {
    path: '/registries',
    name: 'registries',
    component: () => import('@/views/RegistriesView.vue')
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: () => import('@/views/CalculatorView.vue')
  },
  {
    path: '/contests',
    name: 'contests',
    component: () => import('@/views/ContestsView.vue')
  },
  {
    path: '/reception-points',
    name: 'reception-points',
    component: () => import('@/views/ReceptionPointsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
