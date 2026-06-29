import { request } from './client'
import type { PushSubscriptionPayload } from '@/types'

export const pushApi = {
  getVapidPublicKey: () => request<{ key: string }>('/vapid-public-key'),

  saveSubscription: (sub: PushSubscriptionPayload) =>
    request<{ status: string }>('/subscriptions', { method: 'POST', body: sub }),
}
