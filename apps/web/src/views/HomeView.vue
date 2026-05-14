<script setup lang="ts">
import { BookOpen } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import { TOPIC_REGISTRY } from '@/app/registry'
</script>

<template>
  <div
    class="mx-auto max-w-3xl rounded-3xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_6px_0_0_var(--app-border)] sm:p-8 lg:max-w-5xl"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <span
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-b-[5px] border-[var(--app-primary)] bg-[var(--app-primary)] text-white shadow-[0_4px_0_0_var(--app-primary-depth)]"
      >
        <BookOpen :size="28" :stroke-width="2.5" aria-hidden="true" />
      </span>
      <div class="min-w-0">
        <h1 class="text-xl font-extrabold text-[var(--app-text)] sm:text-2xl">
          学习
        </h1>
        <p class="mt-2 font-bold leading-relaxed text-[var(--app-muted)]">
          在下面选择课题，通过路由进入学习页（URL 形如
          <code class="rounded-md bg-[var(--app-subtle)] px-1.5 py-0.5 text-[0.9em]">/learn/topics/…</code>）。
        </p>
      </div>
    </div>

    <section
      class="mt-8 border-t-2 border-dashed border-[var(--app-border)] pt-8"
      aria-label="课题列表"
    >
      <h2 class="mb-5 text-[11px] font-extrabold uppercase tracking-[0.26em] text-[var(--app-muted)]">
        可选课题
      </h2>
      <div class="flex flex-wrap gap-4">
        <RouterLink
          v-for="topic in TOPIC_REGISTRY"
          :key="topic.topicId"
          class="flex max-w-[16rem] min-w-[12rem] flex-1 flex-col items-start gap-3 rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] p-5 text-left font-extrabold text-[var(--app-text)] no-underline outline-none shadow-[0_4px_0_0_var(--app-border)] ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] transition hover:border-[var(--app-primary-ring)] hover:bg-[var(--app-primary-soft)] focus-visible:ring-2 active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--app-border)]"
          :to="topic.route"
        >
          <img
            :src="topic.logo"
            :alt="`${topic.name} logo`"
            class="size-14 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] object-contain p-2"
          >
          <span class="truncate text-[15px] leading-snug">{{ topic.name }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
