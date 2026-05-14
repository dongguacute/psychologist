<script setup lang="ts">
import { FileCode2 } from '@lucide/vue'

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
        <MarkdownParseSample />
      </div>
    </div>
  </div>
</template>

<style scoped>
.markdown-test-preview :deep(.markdown-test-prose) {
  max-width: 42rem;
  color: var(--app-text);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.75;
}

.markdown-test-preview :deep(.markdown-test-prose h1) {
  margin: 0 0 0.75em;
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.markdown-test-preview :deep(.markdown-test-prose h2) {
  margin: 1.5em 0 0.6em;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.markdown-test-preview :deep(.markdown-test-prose h2:first-child) {
  margin-top: 0;
}

.markdown-test-preview :deep(.markdown-test-prose p) {
  margin: 0.75em 0;
}

.markdown-test-preview :deep(.markdown-test-prose a) {
  color: var(--app-primary-strong);
  font-weight: 800;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.markdown-test-preview :deep(.markdown-test-prose a:hover) {
  color: var(--app-primary);
}

/* Tailwind Preflight 会去掉 ul/ol 的 list-style，这里为正文预览恢复列表外观 */
.markdown-test-preview :deep(.markdown-test-prose ul),
.markdown-test-preview :deep(.markdown-test-prose ol) {
  margin: 0.75em 0;
  padding-left: 1.5em;
  list-style-position: outside;
}

.markdown-test-preview :deep(.markdown-test-prose ul) {
  list-style-type: disc;
}

.markdown-test-preview :deep(.markdown-test-prose ol) {
  list-style-type: decimal;
}

.markdown-test-preview :deep(.markdown-test-prose ul ul) {
  list-style-type: circle;
  margin: 0.35em 0;
}

.markdown-test-preview :deep(.markdown-test-prose ul ul ul) {
  list-style-type: square;
}

.markdown-test-preview :deep(.markdown-test-prose ol ol) {
  list-style-type: lower-alpha;
}

.markdown-test-preview :deep(.markdown-test-prose li) {
  margin: 0.35em 0;
  display: list-item;
}

.markdown-test-preview :deep(.markdown-test-prose li > p) {
  margin: 0.35em 0;
}

.markdown-test-preview :deep(.markdown-test-prose li > p:first-child) {
  margin-top: 0;
}

.markdown-test-preview :deep(.markdown-test-prose li > p:last-child) {
  margin-bottom: 0;
}

.markdown-test-preview :deep(.markdown-test-prose blockquote) {
  margin: 1em 0;
  padding: 0.75em 1em;
  border-left: 4px solid var(--app-primary-ring);
  background: var(--app-subtle);
  color: var(--app-muted);
  border-radius: 0 0.75rem 0.75rem 0;
}

.markdown-test-preview :deep(.markdown-test-prose hr) {
  margin: 1.5em 0;
  border: 0;
  border-top: 2px solid var(--app-border);
}

.markdown-test-preview :deep(.markdown-test-prose code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9em;
  font-weight: 700;
}

.markdown-test-preview :deep(.markdown-test-prose p code),
.markdown-test-preview :deep(.markdown-test-prose li code) {
  padding: 0.15em 0.45em;
  border-radius: 0.375rem;
  background: var(--app-subtle);
  border: 1px solid var(--app-border);
}

.markdown-test-preview :deep(.markdown-test-prose pre) {
  margin: 1em 0;
  padding: 1rem 1.1rem;
  overflow-x: auto;
  border-radius: 0.875rem;
  border: 2px solid var(--app-border);
  background: var(--app-bg);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 6%);
}

.markdown-test-preview :deep(.markdown-test-prose pre code) {
  padding: 0;
  border: 0;
  background: none;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.6;
}

.markdown-test-preview :deep(.markdown-test-prose strong) {
  font-weight: 800;
  color: var(--app-text);
}
</style>
