<script setup lang="ts">
import { useCountdown } from '@/composables/useCountdown'

const props = defineProps<{ remindAt: string | null }>()
const { label, isLive } = useCountdown(() => props.remindAt)
</script>

<template>
  <span class="countdown mono" :data-live="isLive || undefined" role="timer" aria-live="off">
    {{ label }}
  </span>
</template>

<style scoped>
.countdown {
  font-size: var(--mono-lg);
  font-weight: 500;
  color: var(--lume);
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
}
</style>
