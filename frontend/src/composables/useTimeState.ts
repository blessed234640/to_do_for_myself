import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { Task, TimeState } from '@/types'
import { useNow } from './useNow'
import { SOON_MS } from '@/lib/time'

/**
 * Выводит состояние срочности задачи (§2): future | soon | overdue | done
 * из remind_at относительно «сейчас». Реактивно обновляется по тику.
 */
export function useTimeState(task: MaybeRefOrGetter<Task>) {
  const now = useNow()

  const state = computed<TimeState>(() => {
    const t = toValue(task)
    if (t.is_done) return 'done'
    if (!t.remind_at) return 'future'
    const diff = Date.parse(t.remind_at) - now.value
    if (diff < 0) return 'overdue'
    if (diff <= SOON_MS) return 'soon'
    return 'future'
  })

  return { state }
}
