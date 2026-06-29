import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Task, TaskCreate } from '@/types'
import { tasksApi } from '@/api/tasks'
import { ApiError } from '@/api/client'
import { useToastStore } from './toasts'

type Status = 'idle' | 'loading' | 'ready' | 'error'

export const useTaskStore = defineStore('tasks', () => {
  const toasts = useToastStore()

  const tasks = ref<Task[]>([])
  const status = ref<Status>('idle')
  const loadError = ref<string | null>(null)

  // --- Производные данные ---

  // активные (не выполненные) с заданным напоминанием в будущем, по возрастанию времени
  const upcoming = computed(() =>
    tasks.value
      .filter((t) => !t.is_done && t.remind_at)
      .sort((a, b) => Date.parse(a.remind_at!) - Date.parse(b.remind_at!)),
  )

  // герой «next up»: ближайшее ЕЩЁ НЕ наступившее напоминание
  const nextUp = computed<Task | null>(() => {
    const now = Date.now()
    return upcoming.value.find((t) => Date.parse(t.remind_at!) > now) ?? null
  })

  // активные задачи: по близости напоминания, затем без напоминания, затем по дате создания
  const active = computed(() =>
    tasks.value
      .filter((t) => !t.is_done)
      .sort((a, b) => {
        const ta = a.remind_at ? Date.parse(a.remind_at) : Infinity
        const tb = b.remind_at ? Date.parse(b.remind_at) : Infinity
        if (ta !== tb) return ta - tb
        return Date.parse(b.created_at) - Date.parse(a.created_at)
      }),
  )

  const done = computed(() =>
    tasks.value
      .filter((t) => t.is_done)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
  )

  // --- Хелперы ---

  function indexOf(id: number) {
    return tasks.value.findIndex((t) => t.id === id)
  }

  function reportError(e: unknown, fallback: string) {
    const msg = e instanceof ApiError ? e.message : fallback
    toasts.error(msg)
  }

  // --- Действия ---

  async function fetchAll() {
    status.value = 'loading'
    loadError.value = null
    try {
      tasks.value = await tasksApi.list()
      status.value = 'ready'
    } catch (e) {
      status.value = 'error'
      loadError.value =
        e instanceof ApiError ? e.message : 'Не удалось загрузить. Проверьте соединение.'
    }
  }

  // Оптимистичное создание: показываем временную задачу, заменяем реальной.
  async function create(payload: TaskCreate) {
    const tempId = -Date.now()
    const optimistic: Task = {
      id: tempId,
      title: payload.title,
      remind_at: payload.remind_at,
      is_done: false,
      reminder_sent: false,
      created_at: new Date().toISOString(),
    }
    tasks.value.push(optimistic)
    try {
      const real = await tasksApi.create(payload)
      const i = indexOf(tempId)
      if (i !== -1) tasks.value[i] = real
      toasts.success(payload.remind_at ? 'Напоминание создано' : 'Задача добавлена')
      return real
    } catch (e) {
      const i = indexOf(tempId)
      if (i !== -1) tasks.value.splice(i, 1) // откат
      reportError(e, 'Не удалось сохранить. Проверьте соединение и повторите.')
      throw e
    }
  }

  async function update(id: number, payload: TaskCreate) {
    const i = indexOf(id)
    if (i === -1) return
    const snapshot = { ...tasks.value[i] }
    tasks.value[i] = { ...snapshot, title: payload.title, remind_at: payload.remind_at }
    try {
      tasks.value[i] = await tasksApi.update(id, payload)
      toasts.success('Изменения сохранены')
    } catch (e) {
      const j = indexOf(id)
      if (j !== -1) tasks.value[j] = snapshot // откат
      reportError(e, 'Не удалось сохранить изменения.')
      throw e
    }
  }

  async function complete(id: number) {
    const i = indexOf(id)
    if (i === -1) return
    const snapshot = { ...tasks.value[i] }
    tasks.value[i] = { ...snapshot, is_done: true, reminder_sent: true }
    try {
      tasks.value[i] = await tasksApi.complete(id)
    } catch (e) {
      const j = indexOf(id)
      if (j !== -1) tasks.value[j] = snapshot // откат
      reportError(e, 'Не удалось отметить выполненной.')
    }
  }

  async function remove(id: number) {
    const i = indexOf(id)
    if (i === -1) return
    const snapshot = tasks.value[i]
    tasks.value.splice(i, 1) // оптимистично убираем
    try {
      await tasksApi.remove(id)
    } catch (e) {
      tasks.value.splice(i, 0, snapshot) // откат на прежнюю позицию
      reportError(e, 'Не удалось удалить.')
    }
  }

  return {
    tasks,
    status,
    loadError,
    upcoming,
    nextUp,
    active,
    done,
    fetchAll,
    create,
    update,
    complete,
    remove,
  }
})
