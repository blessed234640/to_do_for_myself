<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Task } from '@/types'
import { useTaskStore } from '@/stores/tasks'
import NextUp from '@/components/NextUp.vue'
import TaskList from '@/components/TaskList.vue'
import TaskComposer from '@/components/TaskComposer.vue'
import NotificationToggle from '@/components/NotificationToggle.vue'
import EditSheet from '@/components/EditSheet.vue'
import AppToast from '@/components/AppToast.vue'

const store = useTaskStore()

const editing = ref<Task | null>(null)
const editOpen = ref(false)

function openEdit(task: Task) {
  editing.value = task
  editOpen.value = true
}

onMounted(() => store.fetchAll())
</script>

<template>
  <div class="shell">
    <header class="header">
      <span class="wordmark">Срок</span>
      <NotificationToggle />
    </header>

    <main class="main">
      <NextUp />
      <TaskList @edit="openEdit" />
    </main>

    <div class="dock">
      <div class="dock-inner">
        <TaskComposer />
      </div>
    </div>
  </div>

  <EditSheet v-model:open="editOpen" :task="editing" />
  <AppToast />
</template>

<style scoped>
.shell {
  max-width: var(--col-max);
  margin: 0 auto;
  padding: 0 var(--space-4);
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: saturate(1.4) blur(8px);
  z-index: 20;
}
.wordmark {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.main {
  flex: 1 0 auto;
  padding-bottom: var(--space-8);
}
.dock {
  position: sticky;
  bottom: 0;
  padding: var(--space-3) 0 calc(var(--space-4) + env(safe-area-inset-bottom));
  background: linear-gradient(to top, var(--paper) 70%, transparent);
  z-index: 10;
}
.dock-inner {
  /* выравнивание ширины с колонкой */
}
</style>
