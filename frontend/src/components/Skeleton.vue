<script setup lang="ts">
defineProps<{ width?: string }>()
</script>

<template>
  <span class="skeleton" :style="{ width: width ?? '100%' }" aria-hidden="true" />
</template>

<style scoped>
.skeleton {
  display: block;
  height: 0.85em;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--ink) 6%, transparent) 25%,
    color-mix(in srgb, var(--ink) 10%, transparent) 37%,
    color-mix(in srgb, var(--ink) 6%, transparent) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>
