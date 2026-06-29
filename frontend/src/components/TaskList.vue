<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { Task } from '@/types'
import { useTaskStore } from '@/stores/tasks'
import TaskRow from './TaskRow.vue'
import EmptyState from './EmptyState.vue'
import Skeleton from './Skeleton.vue'

const emit = defineEmits<{ edit: [task: Task] }>()

const store = useTaskStore()
const { status, loadError, active, done, tasks } = storeToRefs(store)

type Filter = 'all' | 'active' | 'done'
const filter = ref<Filter>('all')

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'done', label: 'Выполненные' },
]

const visible = computed<Task[]>(() => {
  if (filter.value === 'active') return active.value
  if (filter.value === 'done') return done.value
  return [...active.value, ...done.value]
})

const counts = computed(() => ({
  all: tasks.value.length,
  active: active.value.length,
  done: done.value.length,
}))
</script>

<template>
  <section class="list" aria-label="Список напоминаний">
    <div class="filters" role="tablist" aria-label="Фильтр">
      <button
        v-for="f in filters"
        :key="f.key"
        type="button"
        role="tab"
        class="filter"
        :data-active="filter === f.key || undefined"
        :aria-selected="filter === f.key"
        @click="filter = f.key"
      >
        {{ f.label }}
        <span class="count mono">{{ counts[f.key] }}</span>
      </button>
    </div>

    <!-- loading -->
    <ul v-if="status === 'loading'" class="rows">
      <li v-for="n in 4" :key="n" class="sk-row">
        <Skeleton width="22px" />
        <div class="sk-body">
          <Skeleton width="60%" />
          <Skeleton width="32%" />
        </div>
      </li>
    </ul>

    <!-- error -->
    <div v-else-if="status === 'error'" class="state">
      <EmptyState
        :title="'Не удалось загрузить'"
        :hint="loadError ?? 'Проверьте соединение и повторите.'"
      />
      <button type="button" class="retry" @click="store.fetchAll()">Повторить</button>
    </div>

    <!-- empty -->
    <EmptyState
      v-else-if="visible.length === 0 && filter === 'all'"
      title="Пока ничего не запланировано"
      hint="Добавьте первое напоминание."
    />
    <EmptyState
      v-else-if="visible.length === 0"
      :title="filter === 'done' ? 'Ничего не выполнено' : 'Нет активных'"
    />

    <!-- list -->
    <ul v-else class="rows">
      <TaskRow v-for="t in visible" :key="t.id" :task="t" @edit="emit('edit', $event)" />
    </ul>
  </section>
</template>

<style scoped>
.list {
  padding-top: var(--space-5);
}
.filters {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}
.filter {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-input);
  font-size: var(--label);
  font-weight: 500;
  color: var(--ink-soft);
  transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease);
}
.filter:hover {
  color: var(--ink);
}
.filter[data-active] {
  background: var(--ink);
  color: var(--surface);
}
.count {
  font-size: 0.75rem;
  opacity: 0.7;
}
.rows {
  border-top: 1px solid var(--hairline);
}
.sk-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-4) var(--space-2);
  border-bottom: 1px solid var(--hairline);
}
.sk-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.state {
  text-align: center;
}
.retry {
  margin-top: calc(-1 * var(--space-6));
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-input);
  border: 1px solid var(--hairline);
  font-size: var(--body);
  font-weight: 500;
  color: var(--ink);
  transition: background var(--dur-1) var(--ease);
}
.retry:hover {
  background: color-mix(in srgb, var(--ink) 5%, transparent);
}
</style>
