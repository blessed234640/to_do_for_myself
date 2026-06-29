// §6 — контракт времени. Хранение/сравнение в UTC; конверсия только на краях.

const LOCALE = 'ru-RU'
const SOON_MS = 60 * 60 * 1000 // «скоро» = < 60 минут

const absoluteFmt = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const timeOnlyFmt = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })
const relFmt = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

export { SOON_MS }

/** Локальное значение <input type="datetime-local"> → UTC ISO с зоной ("...Z"). */
export function pickerToUtc(local: string | null | undefined): string | null {
  if (!local) return null
  const d = new Date(local) // трактуется как локальное время
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

/** UTC ISO из бэка → значение для <input type="datetime-local"> (локальное, без зоны). */
export function utcToPicker(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  // сдвигаем на локальный offset и режем до минут: YYYY-MM-DDTHH:mm
  const off = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - off).toISOString().slice(0, 16)
}

/** Полная дата-время в локали пользователя. */
export function formatAbsolute(iso: string): string {
  return absoluteFmt.format(new Date(iso))
}

/** Только время суток «14:30» — для крупного показания героя. */
export function formatTimeOnly(iso: string): string {
  return timeOnlyFmt.format(new Date(iso))
}

/** Метка дня: «Сегодня» / «Завтра» / дата — без времени. */
export function formatDayLabel(iso: string, nowMs: number): string {
  const target = new Date(iso)
  const now = new Date(nowMs)
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  if (isSameDay(target, now)) return 'Сегодня'
  if (isSameDay(target, tomorrow)) return 'Завтра'
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(target)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Короткая метка для чипа: «Сегодня 14:30», «Завтра 09:00»,
 * «через 3 ч», «просрочено на 2 ч» (§8).
 */
export function formatChip(iso: string, nowMs: number): string {
  const target = new Date(iso)
  const now = new Date(nowMs)
  const diff = target.getTime() - nowMs

  // в пределах суток — относительная форма читается лучше
  if (diff < 0) return `просрочено ${overdueBy(-diff)}`

  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)

  if (isSameDay(target, now)) return `сегодня ${timeOnlyFmt.format(target)}`
  if (isSameDay(target, tomorrow)) return `завтра ${timeOnlyFmt.format(target)}`
  return formatAbsolute(iso)
}

/** Относительная форма «через N …» для далёкого будущего (Intl.RelativeTimeFormat). */
export function formatRelative(iso: string, nowMs: number): string {
  const diff = new Date(iso).getTime() - nowMs
  const abs = Math.abs(diff)
  const min = Math.round(diff / 60000)
  const hr = Math.round(diff / 3600000)
  const day = Math.round(diff / 86400000)
  if (abs < 60 * 60000) return relFmt.format(min, 'minute')
  if (abs < 24 * 3600000) return relFmt.format(hr, 'hour')
  return relFmt.format(day, 'day')
}

function overdueBy(ms: number): string {
  const min = Math.floor(ms / 60000)
  if (min < 60) return `на ${min} мин`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `на ${hr} ч`
  const day = Math.floor(hr / 24)
  return `на ${day} дн`
}

/**
 * Живой отсчёт «3:12:40» / «12:40» до момента (только будущее).
 * Возвращает '' если уже наступило.
 */
export function formatCountdown(iso: string, nowMs: number): string {
  let s = Math.floor((new Date(iso).getTime() - nowMs) / 1000)
  if (s <= 0) return ''
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/** Грубая относительная форма для reduced-motion: «через 3 ч». */
export function coarseRelative(iso: string, nowMs: number): string {
  const diff = new Date(iso).getTime() - nowMs
  if (diff <= 0) return 'сейчас'
  return formatRelative(iso, nowMs)
}
