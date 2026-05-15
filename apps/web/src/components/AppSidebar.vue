<script setup lang="ts">
import { BookOpen, CalendarDays, ChevronsLeft, ChevronsRight, Settings } from '@lucide/vue'
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { isLearnSectionRoute, ROUTE_NAMES } from '@/app/routes'
import {
  sidebarAsideHoverPeek,
  sidebarTopicRailCollapsed,
  toggleSidebarTopicRailCollapsed,
} from '@/lib/topicStudyChrome'

const primaryNavItems = [
  { to: '/', name: ROUTE_NAMES.learn, label: '学习', icon: BookOpen },
  { to: '/calendar', name: ROUTE_NAMES.calendar, label: '日历', icon: CalendarDays },
] as const

const settingsNavItem = {
  to: '/settings',
  name: ROUTE_NAMES.settings,
  label: '设置',
  icon: Settings,
} as const

const route = useRoute()

const isLearnTopicRoute = computed(
  () => route.name === ROUTE_NAMES.learnTopic,
)

/** 视觉上是否为窄图标条（非课题页或未收起时永远不窄） */
const railVisual = computed(
  () =>
    isLearnTopicRoute.value
    && sidebarTopicRailCollapsed.value
    && !sidebarAsideHoverPeek.value,
)

/** 收起条且未悬停时标签隐藏；悬停透视或已展开 → 始终显示文案 */
const hideLabels = computed(() => railVisual.value)

function onNavOptionPointerEnter() {
  if (isLearnTopicRoute.value && sidebarTopicRailCollapsed.value) {
    sidebarAsideHoverPeek.value = true
  }
}

function onNavOptionPointerLeave() {
  sidebarAsideHoverPeek.value = false
}

watch(
  () => route.name,
  (name, oldName) => {
    if (name === ROUTE_NAMES.learnTopic) {
      sidebarTopicRailCollapsed.value = true
    }
    else if (
      oldName === ROUTE_NAMES.learnTopic
      && name !== ROUTE_NAMES.learnTopic
    ) {
      sidebarTopicRailCollapsed.value = false
    }
    sidebarAsideHoverPeek.value = false
  },
  { immediate: true },
)

function itemActive(name: string) {
  if (name === ROUTE_NAMES.learn)
    return isLearnSectionRoute(route.name)

  return route.name === name
}
</script>

<template>
  <aside
    class="app-shell-aside hidden h-[100dvh] max-h-[100dvh] shrink-0 flex-col overflow-y-hidden overflow-x-hidden border-r-2 border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-aside-edge-shadow)] md:flex md:transition-[width,padding,min-width] md:duration-[620ms] md:ease-out motion-reduce:md:transition-none motion-reduce:md:duration-0"
    :class="
      railVisual
        ? 'md:w-[4.75rem] md:items-stretch md:px-2 md:pb-6 md:pt-6'
        : 'w-[280px] px-4 pb-6 pt-6 lg:w-[304px]'
    "
    aria-label="主导航"
  >
    <RouterLink
      to="/"
      class="mb-8 block truncate rounded-2xl py-1 font-bold leading-tight tracking-tight font-[Fredoka,Nunito,sans-serif] text-[var(--app-text)] no-underline outline-none ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] transition-[font-size,padding,text-align,width] md:duration-[620ms] md:ease-out motion-reduce:md:transition-none motion-reduce:md:duration-0 focus-visible:ring-2"
      :class="hideLabels ? 'px-0 text-center text-xl' : 'px-2 text-2xl'"
    >
      {{ hideLabels ? 'P' : 'Psychologist' }}
    </RouterLink>

    <div
      class="flex min-h-0 flex-1 flex-col"
      role="presentation"
      @pointerenter="onNavOptionPointerEnter"
      @pointerleave="onNavOptionPointerLeave"
    >
      <nav class="flex flex-1 flex-col gap-1.5" aria-label="主要功能">
        <RouterLink
          v-for="item in primaryNavItems"
          :key="item.name"
          :to="item.to"
          class="group flex rounded-2xl border-2 border-transparent no-underline outline-none transition-[color,background-color,border-color,transform,padding,gap] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] hover:translate-x-0.5 focus-visible:ring-2 active:scale-[0.98]"
          :class="[
            hideLabels
              ? 'flex-col items-center gap-1 px-1 py-2'
              : 'items-center gap-3 px-3 py-2.5',
            itemActive(item.name)
              ? 'border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]'
              : 'text-[var(--app-muted)] hover:bg-[var(--app-hover)]',
          ]"
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
          <span
            class="min-w-0 truncate text-[15px] font-extrabold tracking-wide"
            :class="hideLabels ? 'sr-only' : ''"
          >
            {{ item.label }}
          </span>
        </RouterLink>
      </nav>

      <nav
        class="mt-4 shrink-0 border-t-2 border-[var(--app-border)] pt-4"
        aria-label="设置"
      >
        <RouterLink
          :to="settingsNavItem.to"
          class="group flex rounded-2xl border-2 border-transparent no-underline outline-none transition-[color,background-color,border-color,transform,padding,gap] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] hover:translate-x-0.5 focus-visible:ring-2 active:scale-[0.98]"
          :class="[
            hideLabels
              ? 'flex-col items-center gap-1 px-1 py-2'
              : 'items-center gap-3 px-3 py-2.5',
            itemActive(settingsNavItem.name)
              ? 'border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]'
              : 'text-[var(--app-muted)] hover:bg-[var(--app-hover)]',
          ]"
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
          <span
            class="min-w-0 truncate text-[15px] font-extrabold tracking-wide"
            :class="hideLabels ? 'sr-only' : ''"
          >
            {{ settingsNavItem.label }}
          </span>
        </RouterLink>
      </nav>
    </div>

    <div
      v-if="isLearnTopicRoute"
      class="mt-4 shrink-0 border-t-2 border-[var(--app-border)] pt-4"
    >
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--app-border-strong)] bg-[var(--app-subtle)] px-3 py-2.5 text-sm font-extrabold tracking-wide text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] active:translate-y-[1px]"
        @click="toggleSidebarTopicRailCollapsed"
      >
        <ChevronsRight
          v-if="sidebarTopicRailCollapsed"
          class="size-5 shrink-0 text-[var(--app-primary-strong)]"
          aria-hidden="true"
        />
        <ChevronsLeft
          v-else
          class="size-5 shrink-0 text-[var(--app-primary-strong)]"
          aria-hidden="true"
        />
        <span :class="hideLabels ? 'sr-only' : 'truncate'">{{
          sidebarTopicRailCollapsed ? '固定展开侧栏' : '收为侧边条'
        }}</span>
      </button>
    </div>
  </aside>
</template>
