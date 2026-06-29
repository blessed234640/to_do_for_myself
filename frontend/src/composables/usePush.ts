import { ref } from 'vue'
import { pushApi } from '@/api/push'
import { useToastStore } from '@/stores/toasts'

export type PushStatus = 'unsupported' | 'default' | 'granted' | 'denied'

function isSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

function initialStatus(): PushStatus {
  if (!isSupported()) return 'unsupported'
  return Notification.permission as PushStatus
}

export function usePush() {
  const toasts = useToastStore()
  const status = ref<PushStatus>(initialStatus())
  const busy = ref(false)

  /** Включить уведомления. Только по жесту пользователя (клик). */
  async function enable() {
    if (status.value === 'unsupported') {
      toasts.error('Браузер не поддерживает уведомления')
      return
    }
    busy.value = true
    try {
      const reg = await navigator.serviceWorker.ready

      const perm = await Notification.requestPermission()
      status.value = perm as PushStatus
      if (perm !== 'granted') {
        if (perm === 'denied') toasts.error('Уведомления заблокированы в настройках браузера')
        return
      }

      // переиспользуем существующую подписку, если она уже есть
      const existing = await reg.pushManager.getSubscription()
      const { key } = await pushApi.getVapidPublicKey()
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true, // обязательно
          applicationServerKey: urlBase64ToUint8Array(key),
        }))

      // sub.toJSON() => { endpoint, keys: { p256dh, auth } } == SubscriptionCreate
      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error('bad subscription')
      }
      await pushApi.saveSubscription({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      })
      toasts.success('Уведомления включены')
    } catch {
      toasts.error('Не удалось включить уведомления. Повторите.')
    } finally {
      busy.value = false
    }
  }

  return { status, busy, enable }
}
