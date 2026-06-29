<script setup lang="ts">
import { computed } from 'vue'
import { usePush } from '@/composables/usePush'

const { status, busy, enable } = usePush()

const text = computed(() => {
  switch (status.value) {
    case 'granted':
      return 'Уведомления включены'
    case 'denied':
      return 'Заблокированы'
    case 'unsupported':
      return 'Не поддерживается'
    default:
      return 'Включить уведомления'
  }
})

const interactive = computed(() => status.value === 'default')

const tooltip = computed(() => {
  switch (status.value) {
    case 'denied':
      return 'Уведомления заблокированы в настройках браузера'
    case 'unsupported':
      return 'Браузер не поддерживает уведомления'
    default:
      return undefined
  }
})
</script>

<template>
  <button
    type="button"
    class="toggle"
    :data-status="status"
    :disabled="!interactive || busy"
    :title="tooltip"
    @click="enable"
  >
    <span class="dot" aria-hidden="true" />
    <span class="text">{{ text }}</span>
  </button>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-input);
  border: 1px solid var(--hairline);
  font-size: var(--label);
  font-weight: 500;
  color: var(--ink);
  background: var(--surface);
  transition: border-color var(--dur-1) var(--ease), background var(--dur-1) var(--ease);
}
.toggle:hover:not(:disabled) {
  border-color: var(--lume);
}
.toggle:disabled {
  cursor: default;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ink-soft);
  flex: none;
}
.toggle[data-status='granted'] .dot {
  background: var(--lume);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--lume) 25%, transparent);
}
.toggle[data-status='denied'] .dot {
  background: var(--alert);
}
.toggle[data-status='granted'],
.toggle[data-status='denied'],
.toggle[data-status='unsupported'] {
  color: var(--ink-soft);
}
</style>
