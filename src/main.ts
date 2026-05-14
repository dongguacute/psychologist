import './assets/main.css'

import { initTheme } from '@/theme/vue-store'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

initTheme()

const app = createApp(App)

app.use(router)

app.mount('#app')
