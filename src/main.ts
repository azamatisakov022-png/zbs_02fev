import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import './assets/styles/main.css'
import './style.css'
import UIComponents from '@/components/ui/index'

const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .use(i18n)
  .use(UIComponents)
  .mount('#app')
