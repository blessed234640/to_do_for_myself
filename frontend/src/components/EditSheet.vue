<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from 'reka-ui'
import type { Task } from '@/types'
import { useTaskStore } from '@/stores/tasks'
import { pickerToUtc, utcToPicker } from '@/lib/time'

const props = defineProps<{ open: boolean; task: Task | null }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const store = useTaskStore()

const title = ref('')
const remindLocal = ref('')
const saving = ref(false)

const trimmed = computed(() => title.value.trim())
const valid = computed(() => trimmed.value.length >= 3)

// при открытии — заполняем поля из задачи
watch(
  () => [props.open, props.task] as const,
  ([open, task]) => {
    if (open && task) {
      title.value = task.title
      remindLocal.value = utcToPicker(task.remind_at)
    }
  },
  { immediate: true },
)

function close() {
  emit('update:open', false)
}

async function save() {
  if (!valid.value || !props.task || saving.value) return
  saving.value = true
  try {
    await store.update(props.task.id, {
      title: trimmed.value,
      remind_at: pickerToUtc(remindLocal.value),
    })
    close()
  } catch {
    /* тост показан стором */
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="overlay" />
      <DialogContent class="sheet" @open-auto-focus.prevent>
        <DialogTitle class="title">Изменить напоминание</DialogTitle>

        <form class="form" novalidate @submit.prevent="save">
          <label class="field">
            <span class="lbl label">Заголовок</span>
            <input
              v-model="title"
              type="text"
              class="input"
              autocomplete="off"
              :aria-invalid="trimmed.length > 0 && !valid"
            />
          </label>

          <label class="field">
            <span class="lbl label">Время</span>
            <input v-model="remindLocal" type="datetime-local" class="input mono" />
          </label>

          <div class="actions">
            <DialogClose as-child>
              <button type="button" class="btn ghost">Отмена</button>
            </DialogClose>
            <button type="submit" class="btn primary" :disabled="!valid || saving">
              Сохранить
            </button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--ink) 45%, transparent);
  z-index: 60;
}
.sheet {
  position: fixed;
  z-index: 61;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(100vw, var(--col-max));
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
  box-shadow: var(--shadow-float);
  padding: var(--space-5) var(--space-4) calc(var(--space-5) + env(safe-area-inset-bottom));
}
@media (min-width: 600px) {
  .sheet {
    bottom: auto;
    top: 12vh;
    border-radius: var(--radius-card);
  }
}
.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--display);
  line-height: var(--display-lh);
  color: var(--ink);
  margin-bottom: var(--space-4);
}
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.lbl {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: var(--label);
  font-weight: 500;
  color: var(--ink-soft);
}
.input {
  padding: var(--space-3);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-input);
  background: var(--paper);
  font-size: var(--body);
  transition: border-color var(--dur-1) var(--ease);
}
.input:focus {
  outline: none;
  border-color: var(--lume);
}
.input[aria-invalid='true'] {
  border-color: var(--alert);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.btn {
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-input);
  font-weight: 600;
  font-size: var(--body);
}
.btn.ghost {
  border: 1px solid var(--hairline);
  color: var(--ink);
}
.btn.ghost:hover {
  background: color-mix(in srgb, var(--ink) 5%, transparent);
}
.btn.primary {
  background: var(--lume);
  color: var(--lume-ink);
}
.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
