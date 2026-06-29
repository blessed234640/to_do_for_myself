import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastKind = 'info' | 'success' | 'error'

export interface Toast {
  id: number
  message: string
  kind: ToastKind
}

let seq = 0

export const useToastStore = defineStore('toasts', () => {
  const items = ref<Toast[]>([])

  function push(message: string, kind: ToastKind = 'info', ttl = 4000) {
    const id = ++seq
    items.value.push({ id, message, kind })
    if (ttl > 0) {
      window.setTimeout(() => dismiss(id), ttl)
    }
    return id
  }

  function dismiss(id: number) {
    const i = items.value.findIndex((t) => t.id === id)
    if (i !== -1) items.value.splice(i, 1)
  }

  const success = (m: string) => push(m, 'success')
  const error = (m: string) => push(m, 'error')

  return { items, push, dismiss, success, error }
})
