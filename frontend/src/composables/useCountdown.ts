import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useNow } from './useNow'
import { useReducedMotion } from './useReducedMotion'
import { coarseRelative, formatCountdown } from '@/lib/time'

/**
 * Живой отсчёт до момента `iso` (§1/§7).
 * - обычный режим: тикает ежесекундно «3:12:40»
 * - prefers-reduced-motion: замирает в грубой форме «через 3 ч»
 */
export function useCountdown(iso: MaybeRefOrGetter<string | null>) {
  const reduced = useReducedMotion()
  // при reduced-motion НЕ подписываемся на ежесекундный тик
  const now = useNow(!reduced.value)

  const label = computed(() => {
    const value = toValue(iso)
    if (!value) return ''
    if (reduced.value) return coarseRelative(value, Date.now())
    return formatCountdown(value, now.value)
  })

  const isLive = computed(() => !reduced.value && !!toValue(iso))

  return { label, isLive, reduced }
}
