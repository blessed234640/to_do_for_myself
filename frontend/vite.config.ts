import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// Backend (FastAPI) origin during dev — прод-сборка отдаётся same-origin из static/.
const BACKEND = 'http://127.0.0.1:8000'
const proxy = {
  target: BACKEND,
  changeOrigin: true,
}

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      injectManifest: {
        // index.html + ассеты прекэшируются; иконки тоже
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'Срок',
        short_name: 'Срок',
        description: 'Точные напоминания. Видно, что вот-вот сработает.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F4F5F7',
        theme_color: '#15181D',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // отдаём собранный фронт тем же FastAPI: app.mount("/", StaticFiles("static"))
    outDir: '../static',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/tasks': proxy,
      '/subscriptions': proxy,
      '/vapid-public-key': proxy,
    },
  },
})
