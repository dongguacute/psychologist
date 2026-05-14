<script setup lang="ts">
import type { ThemePreference } from '@/theme/constants'
import { useThemePreference } from '@/composables/useThemePreference'
import { MonitorSmartphone, Moon, Sun } from '@lucide/vue'

const { preference, resolvedScheme, setPreference } = useThemePreference()

const options = [
  {
    value: 'system' as const,
    title: '跟随系统',
    description: '与设备浅色 / 深色外观保持一致',
    icon: MonitorSmartphone,
  },
  {
    value: 'light' as const,
    title: '浅色',
    description: '始终使用浅色界面',
    icon: Sun,
  },
  {
    value: 'dark' as const,
    title: '深色',
    description: '始终使用深色界面',
    icon: Moon,
  },
]

function hint(scheme: 'light' | 'dark') {
  return scheme === 'dark' ? '深色' : '浅色'
}

function select(pref: ThemePreference) {
  setPreference(pref)
}
</script>

<template>
  <div class="mx-auto max-w-lg space-y-6">
    <div>
      <h1 class="text-xl font-extrabold text-(--app-text) sm:text-2xl">
        设置
      </h1>
      <p class="mt-1 font-bold text-(--app-muted)">
        外观 · 当前界面为「{{ hint(resolvedScheme) }}」
      </p>
    </div>

    <div
      class="rounded-3xl border-2 border-(--app-border) bg-(--app-surface) p-5 shadow-[0_6px_0_0_var(--app-border)] sm:p-6"
      role="radiogroup"
      aria-label="界面深浅色"
    >
      <h2 class="mb-4 text-[13px] font-extrabold uppercase tracking-wider text-(--app-muted)">
        界面深浅色
      </h2>

      <ul class="flex flex-col gap-2">
        <li v-for="opt in options" :key="opt.value">
          <button
            type="button"
            role="radio"
            class="flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left outline-none transition-colors ring-(--app-primary) ring-offset-2 ring-offset-(--app-surface) focus-visible:ring-2"
            :class="
              preference === opt.value
                ? 'border-(--app-primary-ring) bg-(--app-primary-soft) text-(--app-primary-strong)'
                : 'border-(--app-border) bg-(--app-subtle) text-(--app-text) hover:bg-(--app-hover)'
            "
            :aria-checked="preference === opt.value"
            @click="select(opt.value)"
          >
            <span
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-colors"
              :class="
                preference === opt.value
                  ? 'border-(--app-primary) bg-(--app-surface) text-(--app-primary)'
                  : 'border-(--app-border) bg-(--app-surface) text-(--app-muted)'
              "
            >
              <component
                :is="opt.icon"
                :size="22"
                :stroke-width="2.5"
                aria-hidden="true"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[15px] font-extrabold tracking-wide">
                {{ opt.title }}
              </span>
              <span class="mt-0.5 block text-sm font-bold text-(--app-muted)">
                {{ opt.description }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
