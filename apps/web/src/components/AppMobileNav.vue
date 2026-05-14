<script setup lang="ts">
import { mobileNavItems } from '@/config/main-nav'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <nav
    class="app-shell-mobile-nav fixed inset-x-0 bottom-0 z-40 border-t-2 border-[var(--app-border)] bg-[var(--app-surface)]/95 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[var(--app-nav-shadow)] backdrop-blur-md md:hidden"
    aria-label="主导航"
  >
    <ul class="flex items-stretch justify-around px-2">
      <li v-for="item in mobileNavItems" :key="item.name" class="min-w-0 flex-1">
        <RouterLink
          :to="item.to"
          class="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center no-underline outline-none ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] transition-[color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 active:scale-95"
          :class="
            route.name === item.name
              ? 'text-[var(--app-primary-strong)]'
              : 'text-[var(--app-muted)] hover:text-[var(--app-primary)]'
          "
        >
          <span
            class="flex h-11 w-14 items-center justify-center rounded-2xl border-2 transition-[border-color,background-color,color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
            :class="
              route.name === item.name
                ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                : 'border-transparent bg-transparent'
            "
          >
            <component
              :is="item.icon"
              :size="24"
              :stroke-width="2.25"
              aria-hidden="true"
            />
          </span>
          <span class="truncate text-[11px] font-extrabold tracking-wide">
            {{ item.label }}
          </span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
