/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

// precache-манифест инъектируется vite-plugin-pwa (injectManifest)
precacheAndRoute(self.__WB_MANIFEST)

// Формат payload {title, body} ДОЛЖЕН совпадать с WebPushNotifier на бэке.
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Напоминание', body: '' }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow('/')
    }),
  )
})
