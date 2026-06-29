<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTaskStore } from '@/stores/tasks'
import { useNow } from '@/composables/useNow'
import { formatDayLabel, formatTimeOnly } from '@/lib/time'
import Countdown from './Countdown.vue'

const store = useTaskStore()
const { nextUp } = storeToRefs(store)
const now = useNow()

const bigTime = computed(() => (nextUp.value?.remind_at ? formatTimeOnly(nextUp.value.remind_at) : ''))
const dayLabel = computed(() =>
  nextUp.value?.remind_at ? formatDayLabel(nextUp.value.remind_at, now.value) : '',
)
</script>

<template>
  <section class="nextup" aria-label="Ближайшее напоминание">
    <p class="eyebrow label">Ближайшее</p>

    <template v-if="nextUp">
      <p class="time">{{ bigTime }}</p>
      <p class="meta">
        <span class="day">{{ dayLabel }}</span>
        <span class="sep" aria-hidden="true">·</span>
        <span class="lead">через</span>
        <Countdown :remind-at="nextUp.remind_at" />
      </p>
      <p class="task-title">{{ nextUp.title }}</p>
    </template>

    <template v-else>
      <p class="empty">Ничего не запланировано</p>
    </template>
  </section>
</template>

<style scoped>
.nextup {
  padding: var(--space-6) 0 var(--space-8);
  border-bottom: 1px solid var(--hairline);
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: var(--label);
  font-weight: 500;
  color: var(--ink-soft);
  margin-bottom: var(--space-3);
}
.time {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--display-xl);
  line-height: var(--display-xl-lh);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.meta {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-top: var(--space-2);
  color: var(--ink-soft);
  font-size: var(--body);
}
.day {
  color: var(--ink);
  font-weight: 500;
}
.sep {
  color: var(--hairline);
}
.lead {
  color: var(--ink-soft);
}
.task-title {
  margin-top: var(--space-4);
  font-size: var(--title);
  line-height: var(--title-lh);
  font-weight: 600;
  color: var(--ink);
}
.empty {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--display);
  line-height: var(--display-lh);
  color: var(--ink-soft);
}
</style>
