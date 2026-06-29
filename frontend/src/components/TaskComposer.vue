<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { pickerToUtc } from '@/lib/time'

const store = useTaskStore()

const title = ref('')
const remindLocal = ref('') // значение <input type="datetime-local">
const submitting = ref(false)
const touched = ref(false)

const trimmed = computed(() => title.value.trim())
const valid = computed(() => trimmed.value.length >= 3)
const showError = computed(() => touched.value && !valid.value)

const buttonLabel = computed(() => (remindLocal.value ? 'Запланировать' : 'Добавить'))

async function submit() {
  touched.value = true
  if (!valid.value || submitting.value) return
  submitting.value = true
  try {
    // §6: НИКОГДА не слать сырую строку пикера — только UTC ISO с зоной.
    await store.create({ title: trimmed.value, remind_at: pickerToUtc(remindLocal.value) })
    title.value = ''
    remindLocal.value = ''
    touched.value = false
  } catch {
    /* тост уже показан стором; поле не очищаем, чтобы не потерять ввод */
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="composer" novalidate @submit.prevent="submit">
    <div class="fields">
      <input
        v-model="title"
        type="text"
        class="title-input"
        placeholder="Что напомнить?"
        autocomplete="off"
        :aria-invalid="showError"
        aria-label="Заголовок напоминания"
        @blur="touched = true"
      />
      <input
        v-model="remindLocal"
        type="datetime-local"
        class="time-input mono"
        aria-label="Время напоминания"
      />
    </div>

    <div class="bar">
      <p class="hint" :data-error="showError || undefined">
        <span v-if="showError">Минимум 3 символа</span>
        <span v-else-if="remindLocal">Сработает в выбранное время</span>
        <span v-else>Без времени — просто задача</span>
      </p>
      <button type="submit" class="submit" :disabled="!valid || submitting">
        {{ buttonLabel }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.composer {
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-float);
  padding: var(--space-3);
}
.fields {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.title-input {
  flex: 1 1 200px;
  min-width: 0;
  padding: var(--space-3);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-input);
  background: var(--paper);
  font-size: var(--body);
  transition: border-color var(--dur-1) var(--ease);
}
.title-input:focus {
  outline: none;
  border-color: var(--lume);
}
.title-input[aria-invalid='true'] {
  border-color: var(--alert);
}
.time-input {
  flex: 0 1 auto;
  padding: var(--space-3);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-input);
  background: var(--paper);
  font-size: var(--mono);
  color: var(--ink);
}
.time-input:focus {
  outline: none;
  border-color: var(--lume);
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-3);
}
.hint {
  font-size: var(--label);
  color: var(--ink-soft);
}
.hint[data-error] {
  color: var(--alert);
}
.submit {
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-input);
  background: var(--lume);
  color: var(--lume-ink);
  font-weight: 600;
  font-size: var(--body);
  transition: filter var(--dur-1) var(--ease), opacity var(--dur-1) var(--ease);
}
.submit:hover:not(:disabled) {
  filter: brightness(1.04);
}
.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
