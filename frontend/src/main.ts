import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

const app = createApp(App)

app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue Error]', err, info)
}

app.use(router)
app.use(i18n)
app.mount('#app')
