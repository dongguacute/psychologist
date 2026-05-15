<script setup lang="ts">
import type { QuestionBankItem, RegisteredTopic } from '@psychologist/core'
import {
  chapterMainPublicUrl,
  fetchChapterQuestion,
  topicIndexPublicUrl,
} from '@psychologist/core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { topicChapterIds } from '@/app/registry'
import { ROUTE_NAMES } from '@/app/routes'
import MarkdownProseScope from '@/components/markdown/MarkdownProseScope.vue'
import {
  loadTopicLearnProgress,
  saveTopicLearnProgress,
  type TopicLearnProgressV1,
} from '@/lib/topicLearnProgressStorage'

const props = defineProps<{ topicMeta: RegisteredTopic }>()

const router = useRouter()

const phase = ref<'intro' | 'study'>('intro')

const chapterIds = computed(() => topicChapterIds(props.topicMeta.topicId))

const activeChapterId = ref<number | null>(null)

/** 各章测验快照（与 localStorage 同步时会合并当前章 UI） */
const quizByChapterMap = ref<TopicLearnProgressV1['quizByChapter']>({})

function buildSnapshot(): TopicLearnProgressV1 {
  const map = { ...quizByChapterMap.value }
  const ch = activeChapterId.value
  if (ch != null && phase.value === 'study') {
    map[String(ch)] = {
      selectedCodes: [...selectedCodes.value],
      submitted: submitted.value,
      resultCorrect: resultCorrect.value,
    }
  }
  return {
    v: 1,
    phase: phase.value,
    activeChapterId: activeChapterId.value,
    quizByChapter: map,
  }
}

function saveProgress() {
  const snap = buildSnapshot()
  saveTopicLearnProgress(props.topicMeta.topicId, snap)
  quizByChapterMap.value = { ...snap.quizByChapter }
}

function hydrateTopic(tid: string) {
  const stored = loadTopicLearnProgress(tid)
  const ids = chapterIds.value
  if (!stored) {
    phase.value = 'intro'
    quizByChapterMap.value = {}
    activeChapterId.value = ids.at(0) ?? null
    return
  }
  phase.value = stored.phase === 'study' ? 'study' : 'intro'
  quizByChapterMap.value = { ...stored.quizByChapter }
  if (stored.activeChapterId != null && ids.includes(stored.activeChapterId)) {
    activeChapterId.value = stored.activeChapterId
  }
  else {
    activeChapterId.value = ids.at(0) ?? null
  }
}

watch(
  () => props.topicMeta.topicId,
  (tid, oldTid) => {
    if (oldTid != null) {
      saveTopicLearnProgress(oldTid, buildSnapshot())
    }
    hydrateTopic(tid)
  },
  { immediate: true },
)

watch(chapterIds, (ids) => {
  if (
    activeChapterId.value != null
    && !ids.includes(activeChapterId.value)
  ) {
    activeChapterId.value = ids.at(0) ?? null
    saveProgress()
  }
})

const indexBodyHtml = ref('')
const indexLoading = ref(false)
const indexError = ref<string | null>(null)

watch(
  [() => props.topicMeta.topicId, phase],
  async ([tid, ph]) => {
    if (ph !== 'intro') {
      return
    }
    indexError.value = null
    indexBodyHtml.value = ''
    indexLoading.value = true
    try {
      const url = topicIndexPublicUrl(tid)
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} — ${url}`)
      }
      indexBodyHtml.value = await res.text()
    }
    catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      indexError.value = msg
    }
    finally {
      indexLoading.value = false
    }
  },
  { immediate: true },
)

function confirmIntro() {
  phase.value = 'study'
  saveProgress()
}

function selectChapter(cid: number) {
  if (activeChapterId.value === cid) {
    return
  }
  const prev = activeChapterId.value
  if (prev != null && phase.value === 'study') {
    quizByChapterMap.value = {
      ...quizByChapterMap.value,
      [String(prev)]: {
        selectedCodes: [...selectedCodes.value],
        submitted: submitted.value,
        resultCorrect: resultCorrect.value,
      },
    }
  }
  activeChapterId.value = cid
}

const mainBodyHtml = ref('')
const loadError = ref<string | null>(null)
const loading = ref(false)

watch(
  [activeChapterId, () => props.topicMeta.topicId, phase],
  async ([ch, tid, ph]) => {
    loadError.value = null
    mainBodyHtml.value = ''
    if (ph !== 'study' || ch === null || ch === undefined) {
      return
    }

    loading.value = true
    try {
      const url = chapterMainPublicUrl(tid, ch)
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} — ${url}`)
      }
      mainBodyHtml.value = await res.text()
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

const questionItem = ref<QuestionBankItem | null>(null)
const quizLoadState = ref<'idle' | 'loading' | 'ready' | 'missing' | 'error'>(
  'idle',
)
const quizErr = ref<string | null>(null)
const selectedCodes = ref<string[]>([])
const submitted = ref(false)
const resultCorrect = ref<boolean | null>(null)

function applyQuizStateFromMap(ch: number) {
  const savedQuiz = quizByChapterMap.value[String(ch)]
  if (savedQuiz) {
    selectedCodes.value = [...savedQuiz.selectedCodes]
    submitted.value = savedQuiz.submitted
    resultCorrect.value = savedQuiz.resultCorrect
  }
  else {
    selectedCodes.value = []
    submitted.value = false
    resultCorrect.value = null
  }
}

watch(
  [activeChapterId, () => props.topicMeta.topicId, phase],
  async ([ch, tid, ph]) => {
    questionItem.value = null
    quizErr.value = null
    selectedCodes.value = []
    submitted.value = false
    resultCorrect.value = null

    if (ph !== 'study' || ch === null || ch === undefined) {
      quizLoadState.value = 'idle'
      return
    }

    quizLoadState.value = 'loading'
    try {
      questionItem.value = await fetchChapterQuestion(tid, ch)
      quizLoadState.value = 'ready'
      applyQuizStateFromMap(ch)
      saveProgress()
    }
    catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (/\b404\b/.test(msg)) {
        quizLoadState.value = 'missing'
      }
      else {
        quizLoadState.value = 'error'
        quizErr.value = msg
      }
      selectedCodes.value = []
      submitted.value = false
      resultCorrect.value = null
      saveProgress()
    }
  },
  { immediate: true },
)

function isOptionSelected(code: string): boolean {
  return selectedCodes.value.includes(code)
}

function onPickOption(code: string) {
  const q = questionItem.value
  if (!q) {
    return
  }

  if (q.question_type === 'single') {
    selectedCodes.value = [code]
  }
  else {
    const next = new Set(selectedCodes.value)
    if (next.has(code)) {
      next.delete(code)
    }
    else {
      next.add(code)
    }
    selectedCodes.value = [...next]
  }
  submitted.value = false
  resultCorrect.value = null
  saveProgress()
}

function submitAnswer() {
  const q = questionItem.value
  if (!q) {
    return
  }

  const rule = q.answer_rule
  if (rule.type === 'single') {
    if (selectedCodes.value.length !== 1) {
      return
    }
    resultCorrect.value = selectedCodes.value[0] === rule.correct[0]
  }
  else {
    const picked = [...selectedCodes.value].sort()
    const correct = [...rule.correct].sort()
    resultCorrect.value
      = picked.length === correct.length
        && picked.every((v, i) => v === correct[i])
  }
  submitted.value = true
  saveProgress()
}

const canSubmit = computed(() => {
  const q = questionItem.value
  if (!q || submitted.value) {
    return false
  }
  if (q.question_type === 'single') {
    return selectedCodes.value.length === 1
  }
  return selectedCodes.value.length > 0
})

onBeforeUnmount(() => {
  saveTopicLearnProgress(props.topicMeta.topicId, buildSnapshot())
})

const introBtnClass
  = 'rounded-2xl border-2 border-b-[5px] border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] px-6 py-3 text-sm font-extrabold tracking-wide text-[var(--app-primary-strong)] shadow-[0_4px_0_0_var(--app-border)] transition hover:opacity-95 active:translate-y-[2px] active:border-b-[3px] active:shadow-[0_2px_0_0_var(--app-border)] disabled:pointer-events-none disabled:opacity-45'
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
          <p
            v-if="phase === 'intro'"
            class="mt-1 text-xs font-bold text-[var(--app-muted)]"
          >
            请先阅读课题说明，确认后再开始学习。
          </p>
          <p
            v-else
            class="mt-1 text-xs font-bold text-[var(--app-muted)]"
          >
            阅读章节正文后，可在下方完成本章测验。
          </p>
        </div>
      </div>
    </header>

    <!-- 引导：index.html（构建阶段由 index.md 生成） -->
    <template v-if="phase === 'intro'">
      <div
        v-if="indexLoading"
        class="rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-6 py-10 text-center text-sm font-bold text-[var(--app-muted)]"
      >
        正在加载课题说明…
      </div>
      <div
        v-else-if="indexError"
        class="rounded-2xl border-2 border-[var(--app-border-strong)] bg-[var(--app-subtle)] px-5 py-4 text-sm font-bold leading-relaxed text-[var(--app-text)]"
        role="alert"
      >
        无法读取课题说明：<span class="font-mono text-[13px] opacity-95">{{ indexError }}</span>
      </div>
      <template v-else>
        <MarkdownProseScope>
          <article
            class="markdown-test-prose max-w-none rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-5 py-5 sm:px-7 sm:py-7"
            aria-label="课题说明"
            v-html="indexBodyHtml"
          />
        </MarkdownProseScope>
        <div class="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            :class="introBtnClass"
            @click="confirmIntro"
          >
            我已阅读，开始学习
          </button>
        </div>
      </template>
    </template>

    <!-- 学习 + 测验 -->
    <template v-else>
      <p
        v-if="chapterIds.length === 0"
        class="rounded-2xl border-2 border-dashed border-[var(--app-border)] bg-[var(--app-subtle)] px-5 py-4 text-sm font-bold text-[var(--app-muted)]"
      >
        尚未为「{{ topicMeta.topicId }}」配置章节列表。请在
        <code class="rounded-md bg-[var(--app-hover)] px-1.5 py-0.5 text-[var(--app-text)]">topic-registry.ts</code>
        里配置
        <code class="rounded-md bg-[var(--app-hover)] px-1.5 py-0.5 text-[var(--app-text)]">chapterIds</code>
        ，并在仓库根目录
        <code class="rounded-md bg-[var(--app-hover)] px-1.5 py-0.5 text-[var(--app-text)]">data/{{ topicMeta.topicId }}/</code>
        下放置章节资源（勿放在 <code class="rounded-md bg-[var(--app-hover)] px-1.5 py-0.5 text-[var(--app-text)]">apps/web/public</code>）。
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
              @click="selectChapter(cid)"
            >
              第 {{ cid }} 章
            </button>
          </nav>
        </aside>

        <section
          class="min-h-[12rem] min-w-0 flex-1 space-y-6"
          aria-live="polite"
        >
          <div>
            <p class="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--app-muted)]">
              正文
            </p>
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
            <MarkdownProseScope v-else>
              <article
                class="markdown-test-prose max-w-none rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-5 py-5 sm:px-7 sm:py-7"
                :aria-label="`第 ${activeChapterId} 章正文`"
                v-html="mainBodyHtml"
              />
            </MarkdownProseScope>
          </div>

          <!-- 本章测验 -->
          <div class="rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-5 sm:px-7 sm:py-6">
            <p class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--app-muted)]">
              本章测验
            </p>

            <div
              v-if="quizLoadState === 'loading'"
              class="mt-4 text-sm font-bold text-[var(--app-muted)]"
            >
              正在加载题目…
            </div>
            <div
              v-else-if="quizLoadState === 'missing'"
              class="mt-4 text-sm font-bold text-[var(--app-muted)]"
            >
              本章暂无测验题。
            </div>
            <div
              v-else-if="quizLoadState === 'error'"
              class="mt-4 text-sm font-bold text-[var(--app-text)]"
              role="alert"
            >
              加载题目失败：<span class="font-mono text-[13px]">{{ quizErr }}</span>
            </div>
            <template v-else-if="quizLoadState === 'ready' && questionItem">
              <p class="mt-3 text-sm font-extrabold text-[var(--app-text)]">
                {{ questionItem.question_title }}
              </p>
              <p class="mt-1 text-xs font-bold text-[var(--app-muted)]">
                {{
                  questionItem.question_type === 'single'
                    ? '单选题（请选一项）'
                    : '多选题（可多选）'
                }}
              </p>
              <ul class="mt-4 space-y-2">
                <li
                  v-for="opt in questionItem.options"
                  :key="opt.option_code"
                >
                  <label
                    class="flex cursor-pointer gap-3 rounded-xl border-2 px-3 py-2.5 transition"
                    :class="
                      isOptionSelected(opt.option_code)
                        ? 'border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)]'
                        : 'border-[var(--app-border)] bg-[var(--app-subtle)] hover:bg-[var(--app-hover)]'
                    "
                  >
                    <input
                      class="mt-1 size-4 shrink-0 accent-[var(--app-primary-strong)]"
                      :type="questionItem.question_type === 'single' ? 'radio' : 'checkbox'"
                      :name="`q-${questionItem.question_id}`"
                      :checked="isOptionSelected(opt.option_code)"
                      @click.prevent="onPickOption(opt.option_code)"
                    >
                    <span class="text-sm font-bold leading-relaxed text-[var(--app-text)]">
                      <span class="mr-2 font-mono text-[var(--app-primary-strong)]">{{ opt.option_code }}.</span>
                      {{ opt.option_text }}
                    </span>
                  </label>
                </li>
              </ul>
              <div class="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  :disabled="!canSubmit"
                  :class="introBtnClass"
                  @click="submitAnswer"
                >
                  提交答案
                </button>
                <p
                  v-if="submitted && resultCorrect === true"
                  class="text-sm font-extrabold text-emerald-700 dark:text-emerald-400"
                >
                  回答正确。
                </p>
                <p
                  v-else-if="submitted && resultCorrect === false"
                  class="text-sm font-extrabold text-red-700 dark:text-red-400"
                >
                  回答有误，可修改选项后再次提交。
                </p>
              </div>
            </template>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
