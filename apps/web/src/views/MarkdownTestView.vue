<script setup lang="ts">
import { FileCode2 } from '@lucide/vue'

import MarkdownProseScope from '@/components/markdown/MarkdownProseScope.vue'
import MarkdownParseSample from '@/content/markdown-parse-sample.md'
</script>

<template>
  <div
    class="mx-auto max-w-5xl rounded-3xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_6px_0_0_var(--app-border)] sm:p-8"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <span
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-b-[5px] border-[var(--app-primary)] bg-[var(--app-primary)] text-white shadow-[0_4px_0_0_var(--app-primary-depth)]"
      >
        <FileCode2 :size="28" :stroke-width="2.5" aria-hidden="true" />
      </span>
      <div class="min-w-0">
        <h1 class="text-xl font-extrabold text-[var(--app-text)] sm:text-2xl">
          Markdown 解析测试
        </h1>
        <p class="mt-2 font-bold leading-relaxed text-[var(--app-muted)]">
          下方预览由 <code class="rounded-md bg-[var(--app-subtle)] px-1.5 py-0.5 text-[0.9em] text-[var(--app-text)]">unplugin-vue-markdown</code> 在开发/构建阶段编译 <code class="rounded-md bg-[var(--app-subtle)] px-1.5 py-0.5 text-[0.9em] text-[var(--app-text)]">.md</code> 为 Vue 组件；编辑源文件即可验证解析与 HMR。
        </p>
      </div>
    </div>

    <div
      class="markdown-test-preview mt-8 rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] p-5 sm:p-7"
    >
      <div class="markdown-test-preview-inner rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-6 sm:px-8 sm:py-8">
        <MarkdownProseScope>
          <MarkdownParseSample />
        </MarkdownProseScope>
      </div>
    </div>
  </div>
</template>
