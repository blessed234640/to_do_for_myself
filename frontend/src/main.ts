import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Шрифты (Fontsource) — нужные начертания, font-display: swap по умолчанию.
import '@fontsource/bricolage-grotesque/700.css'
import '@fontsource/bricolage-grotesque/800.css'
import '@fontsource/hanken-grotesk/400.css'
import '@fontsource/hanken-grotesk/500.css'
import '@fontsource/hanken-grotesk/600.css'
import '@fontsource/jetbrains-mono/500.css'

import './assets/styles/tokens.css'
import './assets/styles/base.css'

import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
