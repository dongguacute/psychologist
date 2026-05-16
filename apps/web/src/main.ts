import { appTitle } from '@psychologist/core'

import { createApp } from 'vue'

import { initSoundEffects } from '@/sound/vue-store'
import { initTheme } from '@/theme/vue-store'
import App from './App.vue'
import router from './router'
import '@/config/topic-registry'
import './assets/main.css'

document.title = appTitle()

initTheme()
initSoundEffects()

const app = createApp(App)

app.use(router)

app.mount('#app')
