import { appTitle } from '@psychologist/core'

import { createApp } from 'vue'
import { initTheme } from '@/theme/vue-store'
import App from './App.vue'
import router from './router'
import './assets/main.css'

document.title = appTitle()

initTheme()

const app = createApp(App)

app.use(router)

app.mount('#app')
