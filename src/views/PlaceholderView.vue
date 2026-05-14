<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : '页面',
)
</script>

<template>
  <div
    class="mx-auto max-w-3xl rounded-3xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_6px_0_0_var(--app-border)] sm:p-8"
  >
    <h1 class="text-xl font-extrabold text-[var(--app-text)] sm:text-2xl">
      {{ title }}
    </h1>
    <p class="mt-2 font-bold text-[var(--app-muted)]">
      内容稍后接入。
    </p>
  </div>
</template>
