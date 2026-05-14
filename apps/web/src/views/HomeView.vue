<script setup lang="ts">
import { BookOpen } from '@lucide/vue'
</script>

<template>
  <div
    class="mx-auto max-w-3xl rounded-3xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_6px_0_0_var(--app-border)] sm:p-8"
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
          从这里继续课程内容或每日练习；需要查看打卡节奏时，切换到「日历」即可。
        </p>
      </div>
    </div>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        class="rounded-2xl border-2 border-b-[5px] border-[var(--app-primary-depth)] bg-[var(--app-primary)] px-6 py-3 text-[15px] font-extrabold tracking-wide text-white shadow-[0_4px_0_0_var(--app-primary-depth)] transition active:translate-y-[2px] active:border-b-[3px] active:shadow-[0_2px_0_0_var(--app-primary-depth)]"
      >
        继续学习
      </button>
      <button
        type="button"
        class="rounded-2xl border-2 border-b-[5px] border-[var(--app-border-strong)] bg-[var(--app-surface)] px-6 py-3 text-[15px] font-extrabold tracking-wide text-[var(--app-muted)] shadow-[0_4px_0_0_var(--app-border)] transition hover:bg-[var(--app-hover)] active:translate-y-[2px] active:border-b-[3px] active:shadow-[0_2px_0_0_var(--app-border)]"
      >
        复习错题
      </button>
    </div>
  </div>
</template>
