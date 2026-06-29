<script setup lang="ts">
defineProps<{ title: string; hint?: string }>()
</script>

<template>
  <div class="empty">
    <p class="title">{{ title }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.empty {
  padding: var(--space-12) var(--space-4);
  text-align: center;
}
.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--display);
  line-height: var(--display-lh);
  color: var(--ink);
}
.hint {
  margin-top: var(--space-2);
  color: var(--ink-soft);
  font-size: var(--body);
}
</style>
