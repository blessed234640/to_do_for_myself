<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'
import type { Task } from '@/types'
import { useTaskStore } from '@/stores/tasks'
import TimeChip from './TimeChip.vue'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ edit: [task: Task] }>()

const store = useTaskStore()

function onToggle(value: boolean | 'indeterminate') {
  // Бэк умеет только «выполнить» (без снятия) — реагируем только на отметку.
  if (value === true && !props.task.is_done) {
    store.complete(props.task.id)
  }
}
</script>

<template>
  <li class="row" :data-done="task.is_done || undefined">
    <CheckboxRoot
      :model-value="task.is_done"
      :disabled="task.is_done"
      class="checkbox"
      :aria-label="task.is_done ? 'Выполнено' : `Отметить «${task.title}» выполненной`"
      @update:model-value="onToggle"
    >
      <CheckboxIndicator class="check-ind">
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path
            d="M3.5 8.5l3 3 6-7"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </CheckboxIndicator>
    </CheckboxRoot>

    <div class="body">
      <p class="title">{{ task.title }}</p>
      <TimeChip :task="task" />
    </div>

    <div class="actions">
      <button
        v-if="!task.is_done"
        type="button"
        class="act"
        :aria-label="`Изменить «${task.title}»`"
        @click="emit('edit', task)"
      >
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path
            d="M13.5 3.5l3 3L7 16H4v-3z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        class="act"
        :aria-label="`Удалить «${task.title}»`"
        @click="store.remove(task.id)"
      >
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path
            d="M5 6h10M8 6V4.5h4V6m-6 0l.7 9h6.6l.7-9"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </li>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--hairline);
  transition: background var(--dur-1) var(--ease);
}
.row:hover {
  background: color-mix(in srgb, var(--ink) 3%, transparent);
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--hairline);
  border-radius: var(--radius-toggle);
  background: var(--surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--lume-ink);
  transition: border-color var(--dur-1) var(--ease), background var(--dur-1) var(--ease);
  flex: none;
}
.checkbox[data-state='checked'] {
  background: var(--lume);
  border-color: var(--lume);
}
.checkbox:disabled {
  opacity: 1;
  cursor: default;
}
.check-ind {
  display: inline-flex;
}

.body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.title {
  font-size: var(--title);
  line-height: var(--title-lh);
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row[data-done] .title {
  text-decoration: line-through;
  color: var(--settled);
  font-weight: 500;
}

.actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0.55;
  transition: opacity var(--dur-1) var(--ease);
}
.row:hover .actions,
.row:focus-within .actions {
  opacity: 1;
}
.act {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-toggle);
  color: var(--ink-soft);
  transition: color var(--dur-1) var(--ease), background var(--dur-1) var(--ease);
}
.act:hover {
  color: var(--ink);
  background: color-mix(in srgb, var(--ink) 6%, transparent);
}
</style>
