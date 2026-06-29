import { request } from './client'
import type { Task, TaskCreate } from '@/types'

export const tasksApi = {
  list: () => request<Task[]>('/tasks'),

  create: (payload: TaskCreate) => request<Task>('/tasks', { method: 'POST', body: payload }),

  update: (id: number, payload: TaskCreate) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: payload }),

  complete: (id: number) => request<Task>(`/tasks/${id}/complete`, { method: 'POST' }),

  remove: (id: number) => request<Task>(`/tasks/${id}`, { method: 'DELETE' }),
}
