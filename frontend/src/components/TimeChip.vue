<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import { useNow } from '@/composables/useNow'
import { useTimeState } from '@/composables/useTimeState'
import { formatChip } from '@/lib/time'

const props = defineProps<{ task: Task }>()

const now = useNow()
const { state } = useTimeState(() => props.task)

const label = computed(() => {
  if (!props.task.remind_at) return 'без срока'
  return formatChip(props.task.remind_at, now.value)
})
</script>

<template>
  <span class="chip mono" :data-state="state" :data-noremind="!task.remind_at || undefined">
    <span v-if="state === 'overdue'" class="mark" aria-hidden="true">▲</span>
    <span v-else-if="state === 'soon'" class="dot" aria-hidden="true" />
    <time v-if="task.remind_at" :datetime="task.remind_at">{{ label }}</time>
    <span v-else>{{ label }}</span>
  </span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--mono);
  line-height: 1;
  white-space: nowrap;
  color: var(--ink-soft); /* future / по умолчанию */
}
.chip[data-state='soon'] {
  color: var(--lume);
}
.chip[data-state='overdue'] {
  color: var(--alert);
  font-weight: 600;
}
.chip[data-state='done'] {
  color: var(--settled);
  text-decoration: line-through;
}
.chip[data-noremind] {
  color: var(--ink-soft);
  font-style: normal;
  opacity: 0.7;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--lume);
  flex: none;
}
.mark {
  font-size: 0.6875rem;
  line-height: 1;
}
</style>
