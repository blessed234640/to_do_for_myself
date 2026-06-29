import { onScopeDispose, ref } from 'vue'

// Реактивно отслеживает prefers-reduced-motion (§7).
export function useReducedMotion() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const reduced = ref(mq.matches)
  const onChange = (e: MediaQueryListEvent) => (reduced.value = e.matches)
  mq.addEventListener('change', onChange)
  onScopeDispose(() => mq.removeEventListener('change', onChange))
  return reduced
}
