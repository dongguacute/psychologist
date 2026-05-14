<script setup lang="ts">
import AppMobileNav from '@/components/AppMobileNav.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div
    class="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[var(--app-bg)] font-[Nunito,system-ui,sans-serif] md:flex-row"
  >
    <AppSidebar />

    <!-- 小屏顶栏：仅英文品牌 -->
    <header
      class="app-shell-header sticky top-0 z-30 flex items-center justify-between gap-3 border-b-2 border-[var(--app-border)] bg-[var(--app-surface)]/90 px-4 py-3 backdrop-blur-md md:hidden"
    >
      <RouterLink
        to="/"
        class="min-w-0 truncate py-1 text-xl font-bold leading-tight tracking-tight font-[Fredoka,Nunito,sans-serif] text-[var(--app-text)] no-underline outline-none ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] focus-visible:ring-2"
      >
        Psychologist
      </RouterLink>
    </header>

    <main
      class="app-shell-main relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:min-h-0 md:pb-0"
    >
      <div
        class="app-shell-bg-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,var(--app-glow),transparent)]"
        aria-hidden="true"
      />
      <div class="relative px-4 py-5 sm:px-6 sm:py-7 md:p-8">
        <RouterView v-slot="{ Component, route: r }">
          <Transition name="app-page" mode="out-in">
            <component :is="Component" :key="r.name?.toString() ?? r.path" />
          </Transition>
        </RouterView>
      </div>
    </main>

    <AppMobileNav />
  </div>
</template>
