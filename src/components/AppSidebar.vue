<script setup lang="ts">
import { mainNavItems } from '@/config/main-nav'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <aside
    class="hidden w-[clamp(11rem,22vw,15rem)] shrink-0 flex-col border-r-2 border-[var(--app-border)] bg-[var(--app-surface)] px-3 pb-6 pt-6 shadow-[4px_0_0_0_rgba(67,56,202,0.04)] md:flex lg:w-[15rem]"
    aria-label="主导航"
  >
    <RouterLink
      to="/"
      class="mb-8 block truncate rounded-2xl px-2 py-1 text-lg font-extrabold tracking-tight text-[var(--app-text)] no-underline outline-none ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] focus-visible:ring-2"
    >
      Psychologist
    </RouterLink>

    <nav class="flex flex-1 flex-col gap-1.5" aria-label="页面">
      <RouterLink
        v-for="item in mainNavItems"
        :key="item.name"
        :to="item.to"
        class="group flex items-center gap-3 rounded-2xl border-2 border-transparent px-3 py-2.5 no-underline outline-none transition-colors duration-150 ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] focus-visible:ring-2"
        :class="
          route.name === item.name
            ? 'border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]'
            : 'text-[var(--app-muted)] hover:bg-[var(--app-hover)]'
        "
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors"
          :class="
            route.name === item.name
              ? 'border-[var(--app-primary)] bg-[var(--app-surface)] text-[var(--app-primary)]'
              : 'border-[var(--app-border)] bg-[var(--app-subtle)] text-[var(--app-muted)] group-hover:border-[var(--app-border-strong)]'
          "
        >
          <component
            :is="item.icon"
            :size="22"
            :stroke-width="2.5"
            aria-hidden="true"
          />
        </span>
        <span class="min-w-0 truncate text-[15px] font-extrabold tracking-wide">
          {{ item.label }}
        </span>
      </RouterLink>
    </nav>
  </aside>
</template>
