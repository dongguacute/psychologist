<script setup lang="ts">
import type { ThemePreference } from '@/theme/constants'
import { MonitorSmartphone, Moon, Sun, Trash2 } from '@lucide/vue'
import { useThemePreference } from '@/composables/useThemePreference'

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

function clearAllLocalData() {
  // eslint-disable-next-line no-alert -- destructive action needs a native confirm
  const ok = window.confirm(
    '确定要清除所有本地数据吗？\n\n将清空本应用在本浏览器中保存的全部内容（含打卡记录、主题设置等），且无法恢复。',
  )
  if (!ok)
    return
  try {
    localStorage.clear()
  }
  catch {
    /* 隐私设置或配额等 */
  }
  window.location.reload()
}
</script>

<template>
  <div class="settings-page mx-auto max-w-lg">
    <header class="flex flex-col gap-2.5">
      <h1 class="text-xl font-extrabold text-(--app-text) sm:text-2xl">
        设置
      </h1>
      <p class="font-bold text-(--app-muted)">
        外观 · 当前界面为「{{ hint(resolvedScheme) }}」
      </p>
    </header>

    <div
      class="rounded-3xl border-2 border-(--app-border) bg-(--app-surface) p-5 shadow-[0_6px_0_0_var(--app-border)] sm:p-6"
      role="radiogroup"
      aria-label="界面深浅色"
    >
      <h2 class="mb-5 text-[13px] font-extrabold uppercase tracking-wider text-(--app-muted) sm:mb-6">
        界面深浅色
      </h2>

      <ul class="flex flex-col gap-3 sm:gap-3.5">
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

    <div
      class="rounded-3xl border-2 border-(--app-border) bg-(--app-surface) p-5 shadow-[0_6px_0_0_var(--app-border)] sm:p-6"
    >
      <h2 class="mb-5 text-[13px] font-extrabold uppercase tracking-wider text-(--app-muted) sm:mb-6">
        数据与隐私
      </h2>
      <p class="text-sm font-bold leading-relaxed text-(--app-muted) sm:leading-loose">
        清除后，本应用在本浏览器中的全部本地数据都会被删除（含打卡记录、外观偏好等），且无法恢复。页面将自动刷新。
      </p>
      <button
        type="button"
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-[5px] border-(--app-border-strong) bg-(--app-subtle) px-4 py-3 text-[15px] font-extrabold tracking-wide text-(--app-text) shadow-[0_4px_0_0_var(--app-border)] transition hover:bg-(--app-hover) active:translate-y-[2px] active:border-b-[3px] active:shadow-[0_2px_0_0_var(--app-border)] sm:mt-7"
        @click="clearAllLocalData"
      >
        <Trash2 :size="20" :stroke-width="2.5" aria-hidden="true" />
        清除所有数据
      </button>
    </div>

    <div
      class="settings-notice-card rounded-3xl border-2 border-(--app-border) bg-(--app-surface) p-6 shadow-[0_6px_0_0_var(--app-border)] sm:p-8"
    >
      <h2 class="text-[13px] font-extrabold uppercase tracking-wider text-(--app-muted)">
        注意事项
      </h2>
      <p
        class="text-[15px] font-bold text-pretty text-(--app-muted) sm:text-base"
      >
        本站所有内容仅为精神心理科普、家属相处方式学习参考，不构成医疗诊断、诊疗、用药及治疗建议。
      </p>
      <p
        class="settings-notice-follow text-[15px] font-bold text-pretty text-(--app-muted) sm:text-base"
      >
        无法替代精神科医生、心理治疗师专业意见，如有情绪困扰、精神健康问题，请务必前往正规精神卫生医疗机构就诊。
      </p>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  row-gap: 2.75rem;
  padding-bottom: 3rem;
}

@media (width >= 640px) {
  .settings-page {
    row-gap: 3.5rem;
    padding-bottom: 4rem;
  }
}

.settings-notice-card {
  display: flex;
  flex-direction: column;
  gap: 1.375rem;
}

@media (width >= 640px) {
  .settings-notice-card {
    gap: 1.75rem;
  }
}

.settings-notice-card p {
  margin: 0;
  line-height: 2.1;
}

@media (width >= 640px) {
  .settings-notice-card p {
    line-height: 2.15;
  }
}

.settings-notice-follow {
  padding-top: 1.25rem;
  border-top: 1px solid var(--app-border);
}

@media (width >= 640px) {
  .settings-notice-follow {
    padding-top: 1.5rem;
  }
}
</style>
