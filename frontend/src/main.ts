import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// В dev-режиме принудительно сносим оставшийся от прод-сборок service worker
// и его кэши — иначе он отдаёт старый bundle и dev-правки не видны.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister())
  })
  if ('caches' in window) {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k)))
  }
}

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
