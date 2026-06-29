// Контракт с бэком. Время — всегда UTC ISO с зоной ("...Z").

export interface Task {
  id: number
  title: string
  is_done: boolean
  created_at: string // UTC ISO
  remind_at: string | null // UTC ISO | null
  reminder_sent: boolean
}

export interface TaskCreate {
  title: string
  remind_at: string | null // UTC ISO с зоной или null
}

export type TimeState = 'future' | 'soon' | 'overdue' | 'done'

// Браузерный PushSubscription.toJSON() => ровно SubscriptionCreate на бэке
export interface PushSubscriptionPayload {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}
