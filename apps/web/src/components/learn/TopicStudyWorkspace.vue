<script setup lang="ts">
import type { QuestionBankItem, RegisteredTopic } from '@psychologist/core'
import type {
  TopicLearnProgressV1,
  TopicLearnQuizChapterState,
  TopicLearnStudySubMode,
} from '@/lib/topicLearnProgressStorage'
import { BookOpen, ClipboardList } from '@lucide/vue'
import {
  chapterAboutPublicUrl,
  chapterMainPublicUrl,
  fetchChapterQuestions,
  topicIndexPublicUrl,
} from '@psychologist/core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { useRouter } from 'vue-router'
import { topicChapterIds } from '@/app/registry'
import { ROUTE_NAMES } from '@/app/routes'
import clickSfx from '@/assets/audio/click.mp3'
import correctSfx from '@/assets/audio/correct.mp3'
import wrongSfx from '@/assets/audio/wrong.mp3'
import MarkdownProseScope from '@/components/markdown/MarkdownProseScope.vue'
import {
  loadTopicLearnProgress,
  saveTopicLearnProgress,
} from '@/lib/topicLearnProgressStorage'
import { playSoundEffect } from '@/sound/playSoundEffect'

const props = defineProps<{ topicMeta: RegisteredTopic }>()

const router = useRouter()

const phase = ref<'intro' | 'study'>('intro')

/** 「学习」阶段的正文 / 答题子界面 */
const studySubMode = ref<TopicLearnStudySubMode>('read')

const chapterIds = computed(() => topicChapterIds(props.topicMeta.topicId))

/** 学习阶段在冒泡末尾统一播点击音（捕获阶段会先执行，子按钮尚未改写 phase / studySubMode，会漏掉「进入答题」等） */
function onStudyWorkspaceUiClickForSfx(ev: MouseEvent) {
  if (phase.value !== 'study') {
    return
  }
  if (ev.button !== undefined && ev.button !== 0) {
    return
  }
  const raw = ev.target
  const start: Element | null
    = raw instanceof Element
      ? raw
      : raw instanceof Node
        ? raw.parentElement
        : null
  if (!start) {
    return
  }
  if (start.closest('[data-no-quiz-deck-click-sfx]')) {
    return
  }

  const ctrl = start.closest(
    'button, select, textarea, label, input, summary, [role="button"], a[href]',
  )
  if (!ctrl) {
    return
  }

  const fieldsetDisabled = ctrl.closest('fieldset[disabled]')
  if (fieldsetDisabled) {
    return
  }

  const button = ctrl instanceof HTMLButtonElement
    ? ctrl
    : ctrl?.closest('button')
  if (button instanceof HTMLButtonElement && button.disabled) {
    return
  }

  const inputEl = ctrl instanceof HTMLInputElement
    ? ctrl
    : ctrl?.closest('input')
  if (inputEl instanceof HTMLInputElement && inputEl.disabled) {
    return
  }

  playSoundEffect(clickSfx)
}

/** 答对后延迟自动下一题；需在换题、卸载等时机清理 */
let autoAdvanceAfterCorrectTimer: ReturnType<typeof setTimeout> | null = null

function clearAutoAdvanceAfterCorrectTimer() {
  if (autoAdvanceAfterCorrectTimer != null) {
    clearTimeout(autoAdvanceAfterCorrectTimer)
    autoAdvanceAfterCorrectTimer = null
  }
}

const activeChapterId = ref<number | null>(null)

/** 各章测验快照（与 localStorage 同步时会合并当前章 UI） */
const quizByChapterMap = ref<TopicLearnProgressV1['quizByChapter']>({})

const selectedCodes = ref<string[]>([])
const submitted = ref(false)
const resultCorrect = ref<boolean | null>(null)

const questionItems = ref<QuestionBankItem[]>([])
const activeQuizIndex = ref(0)

const currentQuestion = computed(() => {
  const items = questionItems.value
  const i = activeQuizIndex.value
  if (i < 0 || i >= items.length) {
    return null
  }
  return items[i] ?? null
})

const quizCount = computed(() => questionItems.value.length)
const hasPrevQuizQuestion = computed(() => activeQuizIndex.value > 0)
const hasNextQuizQuestion = computed(
  () => activeQuizIndex.value < questionItems.value.length - 1,
)

function emptyQuestionUi() {
  selectedCodes.value = []
  submitted.value = false
  resultCorrect.value = null
}

function persistCurrentQuestionIntoChapterMap(ch: number) {
  const items = questionItems.value
  const idx = activeQuizIndex.value
  const q = items[idx]
  if (!q || items.length === 0) {
    return
  }

  if (items.length === 1) {
    quizByChapterMap.value = {
      ...quizByChapterMap.value,
      [String(ch)]: {
        selectedCodes: [...selectedCodes.value],
        submitted: submitted.value,
        resultCorrect: resultCorrect.value,
      },
    }
    return
  }

  const cur = quizByChapterMap.value[String(ch)] ?? {
    selectedCodes: [],
    submitted: false,
    resultCorrect: null,
  }
  const byQuestionId = { ...cur.byQuestionId }
  byQuestionId[String(q.question_id)] = {
    selectedCodes: [...selectedCodes.value],
    submitted: submitted.value,
    resultCorrect: resultCorrect.value,
  }
  quizByChapterMap.value = {
    ...quizByChapterMap.value,
    [String(ch)]: {
      selectedCodes: [],
      submitted: false,
      resultCorrect: null,
      byQuestionId,
    },
  }
}

function applyQuizStateForChapter(ch: number) {
  const items = questionItems.value
  if (items.length === 0) {
    emptyQuestionUi()
    return
  }

  if (items.length === 1) {
    const saved = quizByChapterMap.value[String(ch)]
    selectedCodes.value = saved ? [...saved.selectedCodes] : []
    submitted.value = saved?.submitted ?? false
    resultCorrect.value = saved?.resultCorrect ?? null
    activeQuizIndex.value = 0
    return
  }

  let bucket = quizByChapterMap.value[String(ch)]
  if (
    bucket
    && !bucket.byQuestionId
    && (bucket.selectedCodes.length > 0 || bucket.submitted)
  ) {
    const firstId = items[0]?.question_id
    if (firstId !== undefined) {
      const migrated: TopicLearnQuizChapterState = {
        selectedCodes: [],
        submitted: false,
        resultCorrect: null,
        byQuestionId: {
          [String(firstId)]: {
            selectedCodes: [...bucket.selectedCodes],
            submitted: bucket.submitted,
            resultCorrect: bucket.resultCorrect,
          },
        },
      }
      quizByChapterMap.value = {
        ...quizByChapterMap.value,
        [String(ch)]: migrated,
      }
      bucket = migrated
    }
  }

  activeQuizIndex.value = Math.min(
    activeQuizIndex.value,
    items.length - 1,
  )
  const q = items[activeQuizIndex.value]
  if (!q) {
    emptyQuestionUi()
    return
  }
  const st = bucket?.byQuestionId?.[String(q.question_id)]
  if (st) {
    selectedCodes.value = [...st.selectedCodes]
    submitted.value = st.submitted
    resultCorrect.value = st.resultCorrect
  }
  else {
    emptyQuestionUi()
  }
}

function setActiveQuizIndex(next: number) {
  const items = questionItems.value
  if (next < 0 || next >= items.length) {
    return
  }
  if (next === activeQuizIndex.value) {
    return
  }
  const ch = activeChapterId.value
  if (ch == null) {
    return
  }
  persistCurrentQuestionIntoChapterMap(ch)
  activeQuizIndex.value = next
  const q = items[next]
  if (!q) {
    return
  }
  const bucket = quizByChapterMap.value[String(ch)]
  const st = bucket?.byQuestionId?.[String(q.question_id)]
  if (st) {
    selectedCodes.value = [...st.selectedCodes]
    submitted.value = st.submitted
    resultCorrect.value = st.resultCorrect
  }
  else {
    emptyQuestionUi()
  }
  saveProgress()
}

function goAdjacentQuizQuestion(delta: 1 | -1) {
  setActiveQuizIndex(activeQuizIndex.value + delta)
}

function buildSnapshot(): TopicLearnProgressV1 {
  const ch = activeChapterId.value
  if (ch != null && phase.value === 'study') {
    persistCurrentQuestionIntoChapterMap(ch)
  }
  return {
    v: 1,
    phase: phase.value,
    activeChapterId: activeChapterId.value,
    studySubMode: phase.value === 'study' ? studySubMode.value : undefined,
    quizByChapter: { ...quizByChapterMap.value },
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
    studySubMode.value = 'read'
    activeChapterId.value = ids.at(0) ?? null
    return
  }
  phase.value = stored.phase === 'study' ? 'study' : 'intro'
  quizByChapterMap.value = { ...stored.quizByChapter }
  studySubMode.value
    = stored.phase === 'study' && stored.studySubMode === 'quiz'
      ? 'quiz'
      : 'read'
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
    studySubMode.value = 'read'
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
  studySubMode.value = 'read'
  saveProgress()
}

function setStudySubMode(mode: TopicLearnStudySubMode) {
  if (studySubMode.value === mode) {
    return
  }
  studySubMode.value = mode
  saveProgress()
}

const chapterIndex = computed(() => {
  const id = activeChapterId.value
  if (id == null) {
    return -1
  }
  return chapterIds.value.indexOf(id)
})

const hasPrevChapter = computed(() => chapterIndex.value > 0)
const hasNextChapter = computed(
  () =>
    chapterIndex.value >= 0 && chapterIndex.value < chapterIds.value.length - 1,
)

function goPrevChapter() {
  const i = chapterIndex.value
  if (i <= 0) {
    return
  }
  const prev = chapterIds.value[i - 1]
  if (prev !== undefined) {
    selectChapter(prev)
  }
}

function goNextChapter() {
  const i = chapterIndex.value
  if (i < 0 || i >= chapterIds.value.length - 1) {
    return
  }
  const next = chapterIds.value[i + 1]
  if (next !== undefined) {
    selectChapter(next)
  }
}

function continueToNextChapterFromSummary() {
  goNextChapter()
}

function selectChapter(cid: number) {
  if (activeChapterId.value === cid) {
    return
  }
  clearAutoAdvanceAfterCorrectTimer()
  const prev = activeChapterId.value
  if (prev != null && phase.value === 'study') {
    persistCurrentQuestionIntoChapterMap(prev)
  }
  activeChapterId.value = cid
  studySubMode.value = 'read'
  activeQuizIndex.value = 0
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

const quizLoadState = ref<'idle' | 'loading' | 'ready' | 'missing' | 'error'>(
  'idle',
)
const quizErr = ref<string | null>(null)

watch(
  [activeChapterId, () => props.topicMeta.topicId, phase],
  async ([ch, tid, ph]) => {
    questionItems.value = []
    activeQuizIndex.value = 0
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
      questionItems.value = await fetchChapterQuestions(tid, ch)
      quizLoadState.value = 'ready'
      applyQuizStateForChapter(ch)
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
      questionItems.value = []
      selectedCodes.value = []
      submitted.value = false
      resultCorrect.value = null
      saveProgress()
    }
  },
  { immediate: true },
)

const aboutBodyHtml = ref('')
const aboutLoading = ref(false)
const aboutError = ref<string | null>(null)

/** 本章所有题目均已提交且判对时，视为测验完成，可展示 about 小结 */
function isChapterQuizAllCorrect(
  items: QuestionBankItem[],
  ch: number,
  map: TopicLearnProgressV1['quizByChapter'],
): boolean {
  if (items.length === 0) {
    return false
  }
  const bucket = map[String(ch)]
  if (!bucket) {
    return false
  }
  if (items.length === 1) {
    return bucket.submitted === true && bucket.resultCorrect === true
  }
  const byId = bucket.byQuestionId
  if (!byId) {
    return false
  }
  for (const q of items) {
    const st = byId[String(q.question_id)]
    if (!st || st.submitted !== true || st.resultCorrect !== true) {
      return false
    }
  }
  return true
}

const quizChapterFullyCorrect = computed(() => {
  if (quizLoadState.value !== 'ready') {
    return false
  }
  const ch = activeChapterId.value
  if (ch == null) {
    return false
  }
  return isChapterQuizAllCorrect(
    questionItems.value,
    ch,
    quizByChapterMap.value,
  )
})

watch(
  [
    activeChapterId,
    () => props.topicMeta.topicId,
    phase,
    studySubMode,
    quizChapterFullyCorrect,
    quizLoadState,
  ],
  async ([ch, tid, ph, sub, cleared, qLoad]) => {
    aboutBodyHtml.value = ''
    aboutError.value = null
    if (
      ph !== 'study'
      || sub !== 'quiz'
      || ch == null
      || !cleared
      || qLoad !== 'ready'
    ) {
      aboutLoading.value = false
      return
    }

    aboutLoading.value = true
    try {
      const url = chapterAboutPublicUrl(tid, ch)
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} — ${url}`)
      }
      aboutBodyHtml.value = await res.text()
    }
    catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      aboutError.value = msg
    }
    finally {
      aboutLoading.value = false
    }
  },
  { immediate: true },
)

function isOptionSelected(code: string): boolean {
  return selectedCodes.value.includes(code)
}

function onPickOption(code: string) {
  const q = currentQuestion.value
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
  const q = currentQuestion.value
  if (!q) {
    return
  }

  clearAutoAdvanceAfterCorrectTimer()

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
  if (resultCorrect.value === true) {
    playSoundEffect(correctSfx)
  }
  else if (resultCorrect.value === false) {
    playSoundEffect(wrongSfx)
  }
  saveProgress()

  if (
    resultCorrect.value === true
    && activeQuizIndex.value < questionItems.value.length - 1
  ) {
    const advanceFromId = q.question_id
    autoAdvanceAfterCorrectTimer = window.setTimeout(() => {
      autoAdvanceAfterCorrectTimer = null
      if (currentQuestion.value?.question_id !== advanceFromId) {
        return
      }
      if (!submitted.value || resultCorrect.value !== true) {
        return
      }
      if (activeQuizIndex.value >= questionItems.value.length - 1) {
        return
      }
      setActiveQuizIndex(activeQuizIndex.value + 1)
    }, 650)
  }
}

const canSubmit = computed(() => {
  const q = currentQuestion.value
  if (!q || submitted.value) {
    return false
  }
  if (q.question_type === 'single') {
    return selectedCodes.value.length === 1
  }
  return selectedCodes.value.length > 0
})

onBeforeUnmount(() => {
  clearAutoAdvanceAfterCorrectTimer()
  saveTopicLearnProgress(props.topicMeta.topicId, buildSnapshot())
})

const introBtnClass
  = 'rounded-2xl border-2 border-b-[5px] border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] px-6 py-3 text-sm font-extrabold tracking-wide text-[var(--app-primary-strong)] shadow-[0_4px_0_0_var(--app-border)] transition hover:opacity-95 active:translate-y-[2px] active:border-b-[3px] active:shadow-[0_2px_0_0_var(--app-border)] disabled:pointer-events-none disabled:opacity-45'

const chapterNavBtnClass
  = 'rounded-2xl border-2 border-b-[5px] border-[var(--app-border-strong)] bg-[var(--app-surface)] px-4 py-2 text-sm font-extrabold tracking-wide text-[var(--app-muted)] shadow-[0_4px_0_0_var(--app-border)] transition hover:bg-[var(--app-hover)] active:translate-y-[2px] active:border-b-[3px] active:shadow-[0_2px_0_0_var(--app-border)] disabled:pointer-events-none disabled:opacity-45'

const studyTabInactiveClass
  = 'flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-transparent bg-[var(--app-surface)] px-4 py-2.5 text-sm font-extrabold tracking-wide text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] active:scale-[0.98]'

const studyTabActiveClass
  = 'flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] px-4 py-2.5 text-sm font-extrabold tracking-wide text-[var(--app-primary-strong)] shadow-[0_4px_0_0_var(--app-primary-ring)] ring-2 ring-[var(--app-primary-soft)] ring-offset-2 ring-offset-[var(--app-subtle)]'
</script>

<template>
  <div
    class="learn-topic-studio flex flex-col gap-6"
    @click="onStudyWorkspaceUiClickForSfx"
  >
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
            <template v-if="studySubMode === 'read'">
              先阅读本节正文，准备好后切换到「答题」完成巩固。
            </template>
            <template v-else>
              专注当前题目；需要回顾可切回「学习」。
            </template>
          </p>
        </div>
      </div>

      <div
        v-if="phase === 'study' && chapterIds.length > 0"
        class="flex w-full shrink-0 flex-wrap items-center justify-center gap-2 sm:ml-auto sm:w-auto sm:justify-end"
      >
        <button
          type="button"
          :class="chapterNavBtnClass"
          :disabled="!hasPrevChapter"
          @click="goPrevChapter"
        >
          上一章
        </button>
        <span class="tabular-nums text-sm font-extrabold text-[var(--app-text)]">
          第 {{ activeChapterId }} 章
        </span>
        <button
          type="button"
          :class="chapterNavBtnClass"
          :disabled="!hasNextChapter"
          @click="goNextChapter"
        >
          下一章
        </button>
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
        class="flex flex-col gap-6"
      >
        <div
          class="flex flex-col gap-4 rounded-3xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] p-2 sm:flex-row sm:p-1.5"
          role="tablist"
          aria-label="学习步骤"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="studySubMode === 'read'"
            :tabindex="studySubMode === 'read' ? 0 : -1"
            :class="studySubMode === 'read' ? studyTabActiveClass : studyTabInactiveClass"
            @click="setStudySubMode('read')"
          >
            <BookOpen
              :size="20"
              :stroke-width="2.5"
              aria-hidden="true"
              class="shrink-0 opacity-90"
            />
            <span>学习正文</span>
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="studySubMode === 'quiz'"
            :tabindex="studySubMode === 'quiz' ? 0 : -1"
            :class="studySubMode === 'quiz' ? studyTabActiveClass : studyTabInactiveClass"
            @click="setStudySubMode('quiz')"
          >
            <ClipboardList
              :size="20"
              :stroke-width="2.5"
              aria-hidden="true"
              class="shrink-0 opacity-90"
            />
            <span>答题巩固</span>
          </button>
        </div>

        <!-- 正文：先学 -->
        <section
          v-if="studySubMode === 'read'"
          class="min-h-[12rem] min-w-0"
          aria-live="polite"
        >
          <div>
            <p class="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--app-muted)]">
              本节正文
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

          <div
            class="mt-8 flex flex-col gap-4 rounded-3xl border-2 border-[var(--app-border)] border-dashed bg-[var(--app-surface)] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7"
          >
            <div class="space-y-1">
              <p class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--app-muted)]">
                下一步
              </p>
              <p class="text-sm font-extrabold text-[var(--app-text)]">
                理解后进入答题，检验本节要点。
              </p>
            </div>
            <button
              type="button"
              :class="introBtnClass"
              class="sm:shrink-0"
              @click="setStudySubMode('quiz')"
            >
              去答题巩固
            </button>
          </div>
        </section>

        <!-- 答题：后答，独立沉浸布局 -->
        <section
          v-else
          class="min-w-0"
          aria-live="polite"
        >
          <div
            class="relative isolate overflow-hidden rounded-3xl border-2 border-[var(--app-primary-ring)] bg-[var(--app-surface)] shadow-[0_8px_0_0_var(--app-primary-ring),0_22px_44px_rgba(143,61,44,0.12)] dark:shadow-[0_8px_0_0_var(--app-primary-ring),0_22px_52px_rgba(0,0,0,0.45)]"
          >
            <div
              class="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-[var(--app-primary-soft)] opacity-80 blur-3xl dark:opacity-50"
              aria-hidden="true"
            />
            <div
              class="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-[var(--app-glow)] opacity-70 blur-3xl"
              aria-hidden="true"
            />

            <div class="relative px-5 py-6 sm:px-10 sm:py-9">
              <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <button
                  type="button"
                  :class="chapterNavBtnClass"
                  class="max-w-max self-start border-[var(--app-border)] shadow-none"
                  @click="setStudySubMode('read')"
                >
                  ← 返回正文
                </button>
                <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span
                    class="inline-flex items-center rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--app-muted)]"
                  >
                    第 {{ activeChapterId }} 章
                  </span>
                  <span
                    v-if="quizLoadState === 'ready' && quizChapterFullyCorrect"
                    class="inline-flex items-center rounded-xl border-2 border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-[var(--app-primary-strong)]"
                  >
                    本节小结
                  </span>
                  <span
                    v-else-if="quizLoadState === 'ready' && currentQuestion"
                    class="inline-flex items-center rounded-xl border-2 border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-[var(--app-primary-strong)]"
                  >
                    {{ currentQuestion.question_type === 'single' ? '单选题' : '多选题' }}
                  </span>
                </div>
              </div>

              <div
                v-if="quizLoadState === 'loading'"
                class="mt-10 flex flex-col items-center justify-center gap-3 py-16 text-center"
              >
                <div class="size-10 animate-pulse rounded-2xl bg-[var(--app-primary-soft)]" />
                <p class="text-sm font-extrabold text-[var(--app-muted)]">
                  正在载入题目…
                </p>
              </div>

              <div
                v-else-if="quizLoadState === 'missing'"
                class="mt-10 rounded-2xl border-2 border-dashed border-[var(--app-border)] bg-[var(--app-subtle)] px-6 py-12 text-center text-sm font-extrabold text-[var(--app-muted)]"
              >
                本节暂无练习题。
              </div>

              <div
                v-else-if="quizLoadState === 'error'"
                class="mt-10 rounded-2xl border-2 border-[var(--app-border-strong)] bg-[var(--app-subtle)] px-5 py-4 text-sm font-bold text-[var(--app-text)]"
                role="alert"
              >
                加载题目失败：<span class="font-mono text-[13px]">{{ quizErr }}</span>
              </div>

              <template v-else-if="quizLoadState === 'ready' && quizChapterFullyCorrect">
                <div class="mt-8 space-y-3">
                  <p class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--app-primary-strong)]">
                    本节巩固
                  </p>
                  <h3 class="text-pretty text-xl font-black leading-snug text-[var(--app-text)] sm:text-2xl">
                    全部答对，本节练习已完成
                  </h3>
                  <p class="text-sm font-bold text-[var(--app-muted)]">
                    下方为本节小结（about），读完可按指引继续学习。
                  </p>
                </div>

                <div class="mt-8 min-h-[8rem] min-w-0">
                  <div
                    v-if="aboutLoading"
                    class="rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-6 py-10 text-center text-sm font-bold text-[var(--app-muted)]"
                  >
                    正在加载小结…
                  </div>
                  <div
                    v-else-if="aboutError"
                    class="rounded-2xl border-2 border-[var(--app-border-strong)] bg-[var(--app-subtle)] px-5 py-4 text-sm font-bold text-[var(--app-text)]"
                    role="alert"
                  >
                    <p>暂时无法加载本节小结，可稍后再试。</p>
                    <p class="mt-2 font-mono text-[13px] opacity-90">
                      {{ aboutError }}
                    </p>
                  </div>
                  <MarkdownProseScope v-else>
                    <article
                      class="markdown-test-prose max-w-none rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-5 py-5 sm:px-7 sm:py-7"
                      aria-label="本节小结"
                      v-html="aboutBodyHtml"
                    />
                  </MarkdownProseScope>
                </div>

                <div
                  class="mt-10 flex flex-col gap-4 border-t-2 border-[var(--app-border)] pt-8 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-between"
                >
                  <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <button
                      v-if="hasNextChapter"
                      type="button"
                      :class="introBtnClass"
                      class="px-6 py-3.5"
                      @click="continueToNextChapterFromSummary"
                    >
                      进入下一章学习（第 {{ chapterIds[chapterIndex + 1] }} 章）
                    </button>
                    <p
                      v-else
                      class="max-w-xl rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-5 py-4 text-sm font-extrabold leading-relaxed text-[var(--app-text)]"
                    >
                      当前已是最后一章；若之后增加新章节，可从课题列表再次进入学习。
                    </p>
                  </div>
                  <button
                    type="button"
                    :class="chapterNavBtnClass"
                    class="self-start border-[var(--app-border)] shadow-none sm:self-center"
                    @click="setStudySubMode('read')"
                  >
                    返回本节正文
                  </button>
                </div>
              </template>

              <template v-else-if="quizLoadState === 'ready' && currentQuestion">
                <div
                  v-if="quizCount > 1"
                  class="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] px-4 py-3 sm:px-5"
                >
                  <span class="text-sm font-extrabold text-[var(--app-text)]">
                    第 {{ activeQuizIndex + 1 }} / {{ quizCount }} 题
                  </span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      :class="chapterNavBtnClass"
                      class="border-[var(--app-border)] shadow-none"
                      :disabled="!hasPrevQuizQuestion"
                      @click="goAdjacentQuizQuestion(-1)"
                    >
                      上一题
                    </button>
                    <button
                      type="button"
                      :class="chapterNavBtnClass"
                      class="border-[var(--app-border)] shadow-none"
                      :disabled="!hasNextQuizQuestion"
                      @click="goAdjacentQuizQuestion(1)"
                    >
                      下一题
                    </button>
                  </div>
                </div>

                <div class="mt-8 space-y-3">
                  <p class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--app-primary-strong)]">
                    巩固练习
                  </p>
                  <h3 class="text-pretty text-xl font-black leading-snug text-[var(--app-text)] sm:text-2xl">
                    {{ currentQuestion.question_title }}
                  </h3>
                  <p class="text-xs font-bold text-[var(--app-muted)]">
                    {{ currentQuestion.question_type === 'single' ? '请选择最符合的一项。' : '可选择多项。' }}
                  </p>
                </div>

                <ul class="relative mt-8 space-y-3">
                  <li
                    v-for="opt in currentQuestion.options"
                    :key="`${currentQuestion.question_id}-${opt.option_code}`"
                  >
                    <label
                      class="flex cursor-pointer items-start gap-4 rounded-2xl border-2 px-4 py-4 transition-[border-color,background-color,box-shadow,transform] duration-200 sm:gap-5 sm:px-5 sm:py-[1.125rem]"
                      :class="
                        isOptionSelected(opt.option_code)
                          ? 'border-[var(--app-primary-ring)] bg-[var(--app-primary-soft)] shadow-[inset_0_0_0_1px_var(--app-primary-ring)]'
                          : 'border-[var(--app-border)] bg-[var(--app-subtle)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-hover)]'
                      "
                    >
                      <span
                        class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border-2 font-mono text-sm font-black text-[var(--app-primary-strong)]"
                        :class="
                          isOptionSelected(opt.option_code)
                            ? 'border-[var(--app-primary-ring)] bg-[var(--app-surface)]'
                            : 'border-[var(--app-border)] bg-[var(--app-surface)]'
                        "
                      >
                        {{ opt.option_code }}
                      </span>
                      <input
                        class="sr-only"
                        :type="currentQuestion.question_type === 'single' ? 'radio' : 'checkbox'"
                        :name="`q-${currentQuestion.question_id}`"
                        :checked="isOptionSelected(opt.option_code)"
                        @click.prevent="onPickOption(opt.option_code)"
                      >
                      <span class="min-w-0 pt-1 text-base font-bold leading-relaxed text-[var(--app-text)] sm:text-[17px]">
                        {{ opt.option_text }}
                      </span>
                    </label>
                  </li>
                </ul>

                <div
                  class="mt-10 flex flex-col gap-4 border-t-2 border-[var(--app-border)] pt-8 sm:flex-row sm:flex-wrap sm:items-center"
                >
                  <button
                    type="button"
                    data-no-quiz-deck-click-sfx
                    :disabled="!canSubmit"
                    :class="introBtnClass"
                    class="min-w-[10rem] px-8 py-3.5 text-base"
                    @click="submitAnswer"
                  >
                    提交答案
                  </button>
                  <div class="flex min-h-[3rem] flex-1 flex-col justify-center gap-1">
                    <p
                      v-if="submitted && resultCorrect === true"
                      class="text-base font-black text-emerald-700 dark:text-emerald-400"
                    >
                      回答正确，掌握得不错。
                    </p>
                    <p
                      v-else-if="submitted && resultCorrect === false"
                      class="text-base font-extrabold text-red-700 dark:text-red-400"
                    >
                      再想想看，修改选项后可以再次提交。
                    </p>
                    <p
                      v-else
                      class="text-xs font-bold text-[var(--app-muted)]"
                    >
                      提交前可随时更改选项。
                    </p>
                  </div>
                </div>
              </template>

              <div
                v-else-if="quizLoadState === 'ready'"
                class="mt-10 rounded-2xl border-2 border-dashed border-[var(--app-border)] bg-[var(--app-subtle)] px-6 py-12 text-center text-sm font-extrabold text-[var(--app-muted)]"
              >
                本节暂无练习题。
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
