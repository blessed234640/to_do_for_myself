<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toasts'

const store = useToastStore()
const { items } = storeToRefs(store)
</script>

<template>
  <div class="toasts" role="region" aria-label="Уведомления" aria-live="polite">
    <TransitionGroup name="toast">
      <button
        v-for="t in items"
        :key="t.id"
        type="button"
        class="toast"
        :data-kind="t.kind"
        @click="store.dismiss(t.id)"
      >
        <span class="bar" aria-hidden="true" />
        <span class="msg">{{ t.message }}</span>
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  left: 50%;
  bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: min(92vw, var(--col-max));
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  display: flex;
  align-items: stretch;
  gap: var(--space-3);
  width: 100%;
  text-align: left;
  padding: var(--space-3) var(--space-4);
  background: var(--ink);
  color: var(--surface);
  border-radius: var(--radius-input);
  box-shadow: var(--shadow-float);
  font-size: var(--body);
}
.bar {
  width: 3px;
  border-radius: 3px;
  background: var(--ink-soft);
  flex: none;
}
.toast[data-kind='success'] .bar {
  background: var(--lume);
}
.toast[data-kind='error'] .bar {
  background: var(--alert);
}
.msg {
  align-self: center;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--dur-2) var(--ease), transform var(--dur-2) var(--ease);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
