<script setup lang="ts">
import type { RegisteredTopic } from '@psychologist/core'
import { chapterMainPublicUrl } from '@psychologist/core'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { topicChapterIds } from '@/app/registry'
import { ROUTE_NAMES } from '@/app/routes'

const props = defineProps<{ topicMeta: RegisteredTopic }>()

const router = useRouter()

const chapterIds = computed(() => topicChapterIds(props.topicMeta.topicId))

const activeChapterId = ref<number | null>(null)

watch(
  () => [chapterIds.value, props.topicMeta.topicId] as const,
  ([ids]) => {
    activeChapterId.value = ids.at(0) ?? null
  },
  { immediate: true },
)

const mainMarkdown = ref<string>('')
const loadError = ref<string | null>(null)
const loading = ref(false)

watch(
  [activeChapterId, () => props.topicMeta.topicId],
  async ([ch, tid]) => {
    loadError.value = null
    mainMarkdown.value = ''
    if (ch === null || ch === undefined) {
      return
    }

    loading.value = true
    try {
      const url = chapterMainPublicUrl(tid, ch)
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} — ${url}`)
      }
      mainMarkdown.value = await res.text()
    }
    catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      loadError.value = msg
    }
    finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="learn-topic-studio flex flex-col gap-6">
    <header class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="rounded-2xl border-2 border-b-[5px] border-[var(--app-border-strong)] bg-[var(--app-surface)] px-4 py-2 text-sm font-extrabold tracking-wide text-[var(--app-muted)] shadow-[0_4px_0_0_var(--app-border)] transition hover:bg-[var(--app-hover)] active:translate-y-[2px] active:border-b-[3px] active:shadow-[0_2px_0_0_var(--app-border)]"
        @click="router.push({ name: ROUTE_NAMES.learn })"
      >
        ← 课题列表
      </button>
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-4">
        <img
          class="size-12 shrink-0 rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] object-contain p-2"
          :src="topicMeta.logo"
          :alt="`${topicMeta.name} logo`"
        >
        <div class="min-w-0">
          <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--app-muted)]">
            当前课题
          </p>
          <h2 class="mt-1 text-xl font-extrabold text-[var(--app-text)] sm:text-2xl">
            {{ topicMeta.name }}
          </h2>
        </div>
      </div>
    </header>

    <p
      v-if="chapterIds.length === 0"
      class="rounded-2xl border-2 border-dashed border-[var(--app-border)] bg-[var(--app-subtle)] px-5 py-4 text-sm font-bold text-[var(--app-muted)]"
    >
      尚未为「{{ topicMeta.topicId }}」配置章节列表。请在
      <code class="rounded-md bg-[var(--app-hover)] px-1.5 py-0.5 text-[var(--app-text)]">topic-registry.ts</code>
      里增加一行
      <code class="rounded-md bg-[var(--app-hover)] px-1.5 py-0.5 text-[var(--app-text)]">app.route({ … chapterIds … })</code>
      ，并把正文放到
      <code class="rounded-md bg-[var(--app-hover)] px-1.5 py-0.5 text-[var(--app-text)]">public/data/</code>。
    </p>

    <div
      v-else
      class="flex flex-col gap-6 lg:flex-row lg:gap-8"
    >
      <aside
        class="shrink-0 lg:w-44 xl:w-52"
        aria-label="章节目录"
      >
        <p class="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--app-muted)]">
          章节
        </p>
        <nav class="flex flex-row flex-wrap gap-2 lg:flex-col lg:flex-nowrap">
          <button
            v-for="cid in chapterIds"
            :key="cid"
            type="button"
            class="min-w-[2.75rem] rounded-xl border-2 px-3 py-2 text-sm font-extrabold outline-none ring-[var(--app-primary)] ring-offset-2 ring-offset-[var(--app-surface)] transition focus-visible:ring-2"
            :class="
              activeChapterId === cid
                ? 'border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]'
                : 'border-[var(--app-border)] bg-[var(--app-subtle)] text-[var(--app-muted)] hover:bg-[var(--app-hover)]'
            "
            @click="activeChapterId = cid"
          >
            第 {{ cid }} 章
          </button>
        </nav>
      </aside>

      <section
        class="min-h-[12rem] min-w-0 flex-1"
        aria-live="polite"
      >
        <div
          v-if="loading"
          class="rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-6 py-10 text-center text-sm font-bold text-[var(--app-muted)]"
        >
          正在加载正文…
        </div>
        <div
          v-else-if="loadError"
          class="rounded-2xl border-2 border-[var(--app-border-strong)] bg-[var(--app-subtle)] px-5 py-4 text-sm font-bold leading-relaxed text-[var(--app-text)]"
          role="alert"
        >
          无法读取正文：<span class="font-mono text-[13px] opacity-95">{{ loadError }}</span>
        </div>
        <article
          v-else
          class="topic-studio-pre max-w-none whitespace-pre-wrap rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-5 py-5 font-bold leading-relaxed text-[var(--app-text)] sm:px-7 sm:py-7"
          :aria-label="`第 ${activeChapterId} 章正文`"
        >
          {{ mainMarkdown }}
        </article>
      </section>
    </div>
  </div>
</template>
