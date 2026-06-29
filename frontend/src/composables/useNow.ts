import { onScopeDispose, ref } from 'vue'

// Единственный тикающий час на всё приложение (§1: тикает только отсчёт).
// Ref-counted: интервал живёт, пока есть хотя бы один потребитель.
const now = ref(Date.now())
let timer: number | null = null
let consumers = 0

function start() {
  if (timer !== null) return
  timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

function stop() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

/**
 * Возвращает общий реактивный `now` (мс). Тик — 1 раз в секунду.
 * Передай `live = false`, чтобы прочитать время без подписки на тик
 * (например, при prefers-reduced-motion).
 */
export function useNow(live = true) {
  if (live) {
    consumers++
    start()
    onScopeDispose(() => {
      consumers--
      if (consumers <= 0) stop()
    })
  }
  return now
}
