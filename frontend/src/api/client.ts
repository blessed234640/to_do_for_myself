// Тонкая типизированная обёртка над fetch.
// Маппит бэковский {detail} в осмысленную ошибку (для тостов в голосе интерфейса).

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Относительные пути: same-origin в проде (static/), через Vite-proxy в деве.
const BASE = ''

async function parseError(res: Response): Promise<never> {
  let detail: unknown
  try {
    const data = await res.json()
    detail = (data as { detail?: unknown })?.detail
  } catch {
    /* тело не JSON */
  }
  // detail может быть строкой (доменная ошибка) или массивом (валидация FastAPI)
  let message: string
  if (typeof detail === 'string') {
    message = detail
  } else if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string }
    message = first?.msg ?? 'Проверьте введённые данные.'
  } else {
    message = 'Не удалось выполнить запрос. Проверьте соединение и повторите.'
  }
  throw new ApiError(message, res.status)
}

interface RequestOptions {
  method?: string
  body?: unknown
  signal?: AbortSignal
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(BASE + path, {
      method: opts.method ?? 'GET',
      headers: opts.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    })
  } catch {
    // сеть недоступна / запрос оборван
    throw new ApiError('Нет соединения. Проверьте сеть и повторите.', 0)
  }

  if (!res.ok) {
    return parseError(res)
  }

  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}
