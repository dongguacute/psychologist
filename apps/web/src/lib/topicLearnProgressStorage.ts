/** localStorage：课题学习进度（阶段、当前章、各章测验选项与结果） */

export const TOPIC_LEARN_STORAGE_KEY_PREFIX = 'psychologist.topicLearn.v1:' as const

export type TopicLearnPhase = 'intro' | 'study'

/** 学习阶段的界面：先看正文还是先答题面板 */
export type TopicLearnStudySubMode = 'read' | 'quiz'

/** 单道题的作答快照（单题章节存于 {@link TopicLearnQuizChapterState} 顶层；多题时存于 byQuestionId） */
export interface TopicLearnQuizQuestionState {
  selectedCodes: string[]
  submitted: boolean
  resultCorrect: boolean | null
}

export interface TopicLearnQuizChapterState {
  selectedCodes: string[]
  submitted: boolean
  resultCorrect: boolean | null
  /** 多题时按 question_id 存各题；与顶层字段并存时，多题优先读本字段 */
  byQuestionId?: Record<string, TopicLearnQuizQuestionState>
}

export interface TopicLearnProgressV1 {
  v: 1
  phase: TopicLearnPhase
  activeChapterId: number | null
  /** 未写入的旧数据默认为「正文」模式 */
  studySubMode?: TopicLearnStudySubMode
  quizByChapter: Record<string, TopicLearnQuizChapterState>
}

function storageKey(topicId: string): string {
  return `${TOPIC_LEARN_STORAGE_KEY_PREFIX}${topicId}`
}

function isQuizQuestionState(x: unknown): x is TopicLearnQuizQuestionState {
  if (typeof x !== 'object' || x === null) {
    return false
  }
  const o = x as Record<string, unknown>
  if (!Array.isArray(o.selectedCodes) || !o.selectedCodes.every(i => typeof i === 'string')) {
    return false
  }
  if (typeof o.submitted !== 'boolean') {
    return false
  }
  if (o.resultCorrect !== null && typeof o.resultCorrect !== 'boolean') {
    return false
  }
  return true
}

function isQuizState(x: unknown): x is TopicLearnQuizChapterState {
  if (typeof x !== 'object' || x === null) {
    return false
  }
  const o = x as Record<string, unknown>
  if (!Array.isArray(o.selectedCodes) || !o.selectedCodes.every(i => typeof i === 'string')) {
    return false
  }
  if (typeof o.submitted !== 'boolean') {
    return false
  }
  if (o.resultCorrect !== null && typeof o.resultCorrect !== 'boolean') {
    return false
  }
  if (o.byQuestionId !== undefined) {
    if (typeof o.byQuestionId !== 'object' || o.byQuestionId === null) {
      return false
    }
    for (const v of Object.values(o.byQuestionId)) {
      if (!isQuizQuestionState(v)) {
        return false
      }
    }
  }
  return true
}

function isProgressV1(x: unknown): x is TopicLearnProgressV1 {
  if (typeof x !== 'object' || x === null) {
    return false
  }
  const o = x as Record<string, unknown>
  if (o.v !== 1) {
    return false
  }
  if (o.phase !== 'intro' && o.phase !== 'study') {
    return false
  }
  if (o.activeChapterId !== null && typeof o.activeChapterId !== 'number') {
    return false
  }
  if (
    o.studySubMode !== undefined
    && o.studySubMode !== 'read'
    && o.studySubMode !== 'quiz'
  ) {
    return false
  }
  if (typeof o.quizByChapter !== 'object' || o.quizByChapter === null) {
    return false
  }
  for (const st of Object.values(o.quizByChapter)) {
    if (!isQuizState(st)) {
      return false
    }
  }
  return true
}

export function loadTopicLearnProgress(
  topicId: string,
): TopicLearnProgressV1 | null {
  if (typeof localStorage === 'undefined') {
    return null
  }
  try {
    const raw = localStorage.getItem(storageKey(topicId))
    if (raw == null) {
      return null
    }
    const data: unknown = JSON.parse(raw)
    return isProgressV1(data) ? data : null
  }
  catch {
    return null
  }
}

export function saveTopicLearnProgress(
  topicId: string,
  data: TopicLearnProgressV1,
): void {
  if (typeof localStorage === 'undefined') {
    return
  }
  try {
    localStorage.setItem(storageKey(topicId), JSON.stringify(data))
  }
  catch {
    /* 配额或隐私模式 */
  }
}
