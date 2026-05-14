<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { primaryNavItems, settingsNavItem } from '@/config/main-nav'

const route = useRoute()

function itemActive(name: string) {
  return route.name === name
}
</script>

<template>
  <aside
    class="app-shell-aside hidden h-[100dvh] max-h-[100dvh] w-[280px] shrink-0 flex-col overflow-y-hidden overflow-x-hidden border-r-2 border-[var(--app-border)] bg-[var(--app-surface)] px-4 pb-6 pt-6 shadow-[var(--app-aside-edge-shadow)] lg:w-[304px] md:flex"
    aria-label="主导航"
  >
    <RouterLink
      to="/"
      class="mb-8 block truncate rounded-2xl px-2 py-1 text-2xl font-bold leading-tight tracking-tight font-[Fredoka,Nunito,sans-serif] text-[var(--app-text)] no-underline outline-none ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] focus-visible:ring-2"
    >
      Psychologist
    </RouterLink>

    <nav class="flex flex-1 flex-col gap-1.5" aria-label="主要功能">
      <RouterLink
        v-for="item in primaryNavItems"
        :key="item.name"
        :to="item.to"
        class="group flex items-center gap-3 rounded-2xl border-2 border-transparent px-3 py-2.5 no-underline outline-none transition-[color,background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] hover:translate-x-0.5 focus-visible:ring-2 active:scale-[0.98]"
        :class="
          itemActive(item.name)
            ? 'border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]'
            : 'text-[var(--app-muted)] hover:bg-[var(--app-hover)]'
        "
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-[border-color,background-color,color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
          :class="
            itemActive(item.name)
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

    <nav
      class="mt-4 border-t-2 border-[var(--app-border)] pt-4"
      aria-label="设置"
    >
      <RouterLink
        :to="settingsNavItem.to"
        class="group flex items-center gap-3 rounded-2xl border-2 border-transparent px-3 py-2.5 no-underline outline-none transition-[color,background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] hover:translate-x-0.5 focus-visible:ring-2 active:scale-[0.98]"
        :class="
          itemActive(settingsNavItem.name)
            ? 'border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]'
            : 'text-[var(--app-muted)] hover:bg-[var(--app-hover)]'
        "
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-[border-color,background-color,color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
          :class="
            itemActive(settingsNavItem.name)
              ? 'border-[var(--app-primary)] bg-[var(--app-surface)] text-[var(--app-primary)]'
              : 'border-[var(--app-border)] bg-[var(--app-subtle)] text-[var(--app-muted)] group-hover:border-[var(--app-border-strong)]'
          "
        >
          <component
            :is="settingsNavItem.icon"
            :size="22"
            :stroke-width="2.5"
            aria-hidden="true"
          />
        </span>
        <span class="min-w-0 truncate text-[15px] font-extrabold tracking-wide">
          {{ settingsNavItem.label }}
        </span>
      </RouterLink>
    </nav>
  </aside>
</template>
