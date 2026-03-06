<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getLocale, setLocale } from '../../i18n'
import { authStore } from '../../stores/auth'
import { notificationStore } from '../../stores/notifications'
import AppButton from '../ui/AppButton.vue'
import NotificationBell from './NotificationBell.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'

interface MenuItem {
  id: string
  label: string
  icon: string
  route: string
  badge?: number
  theme?: string
}

interface Props {
  role: 'admin' | 'employee' | 'business' | 'eco-operator'
  roleTitle: string
  userName: string
  menuItems: MenuItem[]
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const currentLocale = computed(() => getLocale())

const switchLocale = (locale: 'ru' | 'ky') => {
  setLocale(locale)
}

const currentRoute = computed(() => route.path)

const isActive = (itemRoute: string) => {
  if (itemRoute === '/admin' || itemRoute === '/employee' || itemRoute === '/business' || itemRoute === '/eco-operator') {
    return currentRoute.value === itemRoute
  }
  return currentRoute.value === itemRoute || currentRoute.value.startsWith(itemRoute + '/')
}

const navigateTo = (itemRoute: string) => {
  router.push(itemRoute)
  sidebarOpen.value = false
}

const showLogoutConfirm = ref(false)

const requestLogout = () => {
  showLogoutConfirm.value = true
}

const handleLogout = () => {
  showLogoutConfirm.value = false
  authStore.logout()
  router.push('/login')
}

const cancelLogout = () => {
  showLogoutConfirm.value = false
}

onMounted(() => {
  notificationStore.fetchAll()
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const basePaths: Record<string, string> = {
  admin: '/admin',
  employee: '/employee',
  business: '/business',
  'eco-operator': '/eco-operator',
}

const breadcrumbs = computed(() => {
  const basePath = basePaths[props.role] || '/'
  if (route.path === basePath) return []
  const label = route.meta.breadcrumbLabel as string | undefined
  if (!label) return []
  return [
    { label: t('breadcrumb.home'), path: basePath },
    { label },
  ]
})
</script>

<template>
  <div class="dashboard-layout">
    <!-- Skip to content link -->
    <a href="#main-content" class="skip-link">{{ t('common.skipToContent') }}</a>

    <!-- Mobile Header -->
    <header class="mobile-header" role="banner">
      <button @click="toggleSidebar" class="mobile-header__btn" :aria-label="t('common.openMenu')">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="mobile-header__title">{{ roleTitle }}</span>
      <div class="mobile-header__actions">
        <NotificationBell :role="role" />
        <button @click="requestLogout" class="mobile-header__btn" :aria-label="t('common.logoutSystem')">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Sidebar Overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" aria-hidden="true"></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'sidebar',
        sidebarOpen ? 'sidebar--open' : '',
        sidebarCollapsed ? 'sidebar--collapsed' : 'sidebar--expanded'
      ]"
      role="navigation"
      :aria-label="t('common.mainNav')"
    >
      <!-- Logo -->
      <div class="sidebar-logo">
        <router-link to="/" class="sidebar-logo__link">
          <img src="/images/logo-eco.png" :alt="t('common.companyName')" class="sidebar-logo__img" />
          <div v-if="!sidebarCollapsed" class="sidebar-logo__text">
            <span class="sidebar-logo__name">{{ t('common.companyName') }}</span>
            <span class="sidebar-logo__type">{{ t('common.companyType') }}</span>
          </div>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav" :aria-label="t('common.menu')">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="navigateTo(item.route)"
          :class="[
            'nav-item',
            sidebarCollapsed ? 'nav-item--compact' : '',
            isActive(item.route) ? 'nav-item--active' : ''
          ]"
          :aria-current="isActive(item.route) ? 'page' : undefined"
          :title="sidebarCollapsed ? item.label : undefined"
        >
          <span :class="['nav-item__icon', item.theme ? 'nav-icon--' + item.theme : '']" v-html="item.icon" aria-hidden="true"></span>
          <span v-if="!sidebarCollapsed" class="nav-item__label">{{ item.label }}</span>
          <span
            v-if="item.badge && item.badge > 0"
            :class="['nav-item__badge', sidebarCollapsed ? 'nav-item__badge--floating' : '']"
            :aria-label="t('notifications.unreadCount', { count: item.badge })"
          >{{ item.badge }}</span>
        </button>
      </nav>

      <!-- Collapse toggle button (desktop only) -->
      <button
        class="sidebar-toggle"
        @click="toggleCollapse"
        :title="sidebarCollapsed ? t('common.expandMenu') : t('common.collapseMenu')"
      >
        <svg class="sidebar-toggle__icon" :class="sidebarCollapsed ? 'sidebar-toggle__icon--flipped' : ''" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <!-- User section -->
      <div class="sidebar-user">
        <div class="sidebar-user__inner" :class="sidebarCollapsed ? 'sidebar-user__inner--compact' : ''">
          <div class="sidebar-user__avatar">
            <svg class="sidebar-user__avatar-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div v-if="!sidebarCollapsed" class="sidebar-user__info">
            <p class="sidebar-user__name">{{ userName }}</p>
            <p class="sidebar-user__role">{{ roleTitle }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main :class="['main-content', sidebarCollapsed ? 'main-content--narrow' : '']">
      <!-- Desktop Header -->
      <header class="desktop-header" role="banner">
        <h1 class="desktop-header__title">{{ roleTitle }}</h1>
        <div class="desktop-header__actions">
          <div class="locale-switch">
            <button
              @click="switchLocale('ru')"
              :class="['locale-switch__btn', currentLocale === 'ru' ? 'locale-switch__btn--active' : '']"
            >RU</button>
            <span class="locale-switch__divider">|</span>
            <button
              @click="switchLocale('ky')"
              :class="['locale-switch__btn', currentLocale === 'ky' ? 'locale-switch__btn--active' : '']"
            >KY</button>
          </div>
          <span class="desktop-header__user">{{ userName }}</span>
          <NotificationBell :role="role" />
          <AppButton
            variant="outline"
            :label="t('common.logout')"
            :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot; aria-hidden=&quot;true&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1&quot; /></svg>'"
            @click="requestLogout"
          />
        </div>
      </header>

      <!-- Page Content -->
      <div id="main-content" class="page-content" role="main">
        <BreadcrumbNav :items="breadcrumbs" />
        <slot></slot>
      </div>
    </main>

    <ConfirmDialog
      :visible="showLogoutConfirm"
      :title="t('common.logoutConfirmTitle')"
      :message="t('common.logoutConfirmMessage')"
      icon="warning"
      :confirmText="t('common.logout')"
      confirmColor="red"
      @confirm="handleLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>

<style scoped>
/* ── Layout ── */
.dashboard-layout {
  min-height: 100vh;
  background: #f1f5f9;
}
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}

/* ── Mobile header ── */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  z-index: 50;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  border-bottom: 1px solid #e2e8f0;
}
@media (min-width: 1024px) {
  .mobile-header { display: none; }
}
.mobile-header__btn {
  padding: 10px;
  color: #1e293b;
  border-radius: 10px;
  transition: background 0.15s;
  border: none;
  background: none;
  cursor: pointer;
}
.mobile-header__btn:hover {
  background: #f1f5f9;
}
.mobile-header__title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}
.mobile-header__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── Sidebar overlay ── */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  z-index: 40;
}
@media (min-width: 1024px) {
  .sidebar-overlay { display: none; }
}

/* ── Sidebar ── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  z-index: 50;
  transform: translateX(-100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 16px rgba(0,0,0,0.06);
  border-right: 1px solid #e2e8f0;
}
@media (min-width: 1024px) {
  .sidebar { transform: translateX(0); }
}
.sidebar--open {
  transform: translateX(0);
}
.sidebar--expanded {
  width: 300px;
}
.sidebar--collapsed {
  width: 76px;
}
@media (max-width: 1023px) {
  .sidebar--collapsed,
  .sidebar--expanded {
    width: 300px;
  }
}

/* ── Sidebar logo ── */
.sidebar-logo {
  height: 88px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}
.sidebar-logo__link {
  display: flex;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  text-decoration: none;
}
.sidebar-logo__img {
  flex-shrink: 0;
  height: 48px;
  width: 48px;
  object-fit: cover;
  object-position: left;
  border-radius: 12px;
}
.sidebar-logo__text {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  gap: 2px;
}
.sidebar-logo__name {
  font-size: 16px;
  font-weight: 800;
  color: #065f46;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}
.sidebar-logo__type {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  line-height: 1.2;
}

/* ── Sidebar navigation ── */
.sidebar-nav {
  padding: 16px 14px;
  overflow-y: auto;
  height: calc(100% - 88px - 90px);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 12px;
  border-left: 3px solid transparent;
  color: #334155;
  transition: all 0.2s ease;
}
.nav-item--compact {
  justify-content: center;
  padding: 14px 10px;
}
.nav-item:hover {
  background: rgba(45, 139, 78, 0.07);
  color: #15803d;
}
.nav-item:hover .nav-item__icon {
  transform: scale(1.12);
}
.nav-item:not(.nav-item--active):hover {
  transform: translateX(3px);
}
.sidebar--collapsed .nav-item:not(.nav-item--active):hover {
  transform: none;
}
.nav-item--active {
  background: linear-gradient(135deg, rgba(45, 139, 78, 0.12), rgba(45, 139, 78, 0.06));
  color: #15803d;
  border-left-color: #16a34a;
  box-shadow: 0 1px 3px rgba(45, 139, 78, 0.1);
}
.nav-item__icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.nav-icon--blue { background: #eff6ff; color: #2563eb; }
.nav-icon--indigo { background: #eef2ff; color: #4f46e5; }
.nav-icon--violet { background: #f5f3ff; color: #7c3aed; }
.nav-icon--emerald { background: #ecfdf5; color: #059669; }
.nav-icon--teal { background: #f0fdfa; color: #0d9488; }
.nav-icon--cyan { background: #ecfeff; color: #0891b2; }
.nav-icon--amber { background: #fffbeb; color: #d97706; }
.nav-icon--orange { background: #fff7ed; color: #ea580c; }
.nav-icon--rose { background: #fff1f2; color: #e11d48; }
.nav-icon--slate { background: #f1f5f9; color: #475569; }
.nav-item--active .nav-item__icon {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.nav-item__label {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.nav-item--active .nav-item__label {
  font-weight: 800;
}
.nav-item__badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  min-width: 22px;
  text-align: center;
}
.nav-item__badge--floating {
  position: absolute;
  top: 4px;
  right: 4px;
  margin-left: 0;
}
.sidebar--collapsed .nav-item {
  position: relative;
}

/* ── Sidebar toggle ── */
.sidebar-toggle {
  display: none;
  position: absolute;
  top: 50%;
  right: -15px;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  color: #94a3b8;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.25s ease;
  z-index: 10;
  opacity: 0;
}
@media (min-width: 1024px) {
  .sidebar-toggle { display: flex; }
}
.sidebar:hover .sidebar-toggle {
  opacity: 1;
}
.sidebar-toggle:hover {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
  box-shadow: 0 3px 12px rgba(22, 163, 74, 0.35);
  transform: translateY(-50%) scale(1.1);
}
.sidebar-toggle__icon {
  transition: transform 0.3s ease;
}
.sidebar-toggle__icon--flipped {
  transform: rotate(180deg);
}

/* ── Sidebar user ── */
.sidebar-user {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 22px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
}
.sidebar-user__inner {
  display: flex;
  align-items: center;
  gap: 14px;
}
.sidebar-user__inner--compact {
  justify-content: center;
}
.sidebar-user__avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.12);
}
.sidebar-user__avatar-icon {
  width: 24px;
  height: 24px;
  color: #16a34a;
}
.sidebar-user__info {
  flex: 1;
  min-width: 0;
}
.sidebar-user__name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-user__role {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin: 3px 0 0;
}

/* ── Main content ── */
.main-content {
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}
@media (min-width: 1024px) {
  .main-content { margin-left: 300px; }
  .main-content--narrow { margin-left: 76px; }
}

/* ── Desktop header ── */
.desktop-header {
  display: none;
  height: 80px;
  background: #fff;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border-bottom: 1px solid #e2e8f0;
}
@media (min-width: 1024px) {
  .desktop-header { display: flex; }
}
.desktop-header__title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.desktop-header__actions {
  display: flex;
  align-items: center;
  gap: 18px;
}
.desktop-header__user {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}
/* ── Locale switch ── */
.locale-switch {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
}
.locale-switch__btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  transition: all 0.2s;
}
.locale-switch__btn:hover {
  color: #475569;
}
.locale-switch__btn--active {
  font-weight: 800;
  color: #fff;
  background: #16a34a;
  box-shadow: 0 1px 3px rgba(22, 163, 74, 0.3);
}
.locale-switch__divider {
  display: none;
}

/* ── Page content ── */
.page-content {
  padding: 80px 16px 16px;
}
@media (min-width: 1024px) {
  .page-content { padding: 32px; }
}
</style>
