<script setup lang="ts">
/**
 * 为 `.markdown-test-prose` 提供与 `MarkdownTestView` 相同的排版样式（供运行时 `v-html` 或构建时 `.md` 组件共用）。
 */
</script>

<template>
  <div class="markdown-prose-scope">
    <slot />
  </div>
</template>

<style scoped>
.markdown-prose-scope :deep(.markdown-test-prose) {
  max-width: 42rem;
  color: var(--app-text);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.75;
}

.markdown-prose-scope :deep(.markdown-test-prose h1) {
  margin: 0 0 0.75em;
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.markdown-prose-scope :deep(.markdown-test-prose h2) {
  margin: 1.5em 0 0.6em;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.markdown-prose-scope :deep(.markdown-test-prose h2:first-child) {
  margin-top: 0;
}

.markdown-prose-scope :deep(.markdown-test-prose p) {
  margin: 0.75em 0;
}

.markdown-prose-scope :deep(.markdown-test-prose a) {
  color: var(--app-primary-strong);
  font-weight: 800;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.markdown-prose-scope :deep(.markdown-test-prose a:hover) {
  color: var(--app-primary);
}

.markdown-prose-scope :deep(.markdown-test-prose ul),
.markdown-prose-scope :deep(.markdown-test-prose ol) {
  margin: 0.75em 0;
  padding-left: 1.5em;
  list-style-position: outside;
}

.markdown-prose-scope :deep(.markdown-test-prose ul) {
  list-style-type: disc;
}

.markdown-prose-scope :deep(.markdown-test-prose ol) {
  list-style-type: decimal;
}

.markdown-prose-scope :deep(.markdown-test-prose ul ul) {
  list-style-type: circle;
  margin: 0.35em 0;
}

.markdown-prose-scope :deep(.markdown-test-prose ul ul ul) {
  list-style-type: square;
}

.markdown-prose-scope :deep(.markdown-test-prose ol ol) {
  list-style-type: lower-alpha;
}

.markdown-prose-scope :deep(.markdown-test-prose li) {
  margin: 0.35em 0;
  display: list-item;
}

.markdown-prose-scope :deep(.markdown-test-prose li > p) {
  margin: 0.35em 0;
}

.markdown-prose-scope :deep(.markdown-test-prose li > p:first-child) {
  margin-top: 0;
}

.markdown-prose-scope :deep(.markdown-test-prose li > p:last-child) {
  margin-bottom: 0;
}

.markdown-prose-scope :deep(.markdown-test-prose blockquote) {
  margin: 1em 0;
  padding: 0.75em 1em;
  border-left: 4px solid var(--app-primary-ring);
  background: var(--app-subtle);
  color: var(--app-muted);
  border-radius: 0 0.75rem 0.75rem 0;
}

.markdown-prose-scope :deep(.markdown-test-prose hr) {
  margin: 1.5em 0;
  border: 0;
  border-top: 2px solid var(--app-border);
}

.markdown-prose-scope :deep(.markdown-test-prose code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9em;
  font-weight: 700;
}

.markdown-prose-scope :deep(.markdown-test-prose p code),
.markdown-prose-scope :deep(.markdown-test-prose li code) {
  padding: 0.15em 0.45em;
  border-radius: 0.375rem;
  background: var(--app-subtle);
  border: 1px solid var(--app-border);
}

.markdown-prose-scope :deep(.markdown-test-prose pre) {
  margin: 1em 0;
  padding: 1rem 1.1rem;
  overflow-x: auto;
  border-radius: 0.875rem;
  border: 2px solid var(--app-border);
  background: var(--app-bg);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 6%);
}

.markdown-prose-scope :deep(.markdown-test-prose pre code) {
  padding: 0;
  border: 0;
  background: none;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.6;
}

.markdown-prose-scope :deep(.markdown-test-prose strong) {
  font-weight: 800;
  color: var(--app-text);
}
</style>
