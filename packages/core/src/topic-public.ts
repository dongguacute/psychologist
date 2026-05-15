import { extractEmbeddedJsonFromDataHtml } from './data-html.js'
import { chapterAssetPathsRelativeToData, toPublicDataUrl } from './paths.js'
import { parseQuestionBankItems } from './question.js'
import type { QuestionBankItem } from './types.js'

export function topicIndexPublicUrl(topicId: string, base = '/data'): string {
  const rel = `${topicId}/index.html`.replace(/^\/+/, '')
  return toPublicDataUrl(rel, base)
}

export function chapterMainPublicUrl(
  topicId: string,
  chapterId: number,
  base = '/data',
): string {
  const { main } = chapterAssetPathsRelativeToData(topicId, chapterId)
  return toPublicDataUrl(main, base)
}

export function chapterAboutPublicUrl(
  topicId: string,
  chapterId: number,
  base = '/data',
): string {
  const { about } = chapterAssetPathsRelativeToData(topicId, chapterId)
  return toPublicDataUrl(about, base)
}

export async function fetchChapterQuestions(
  topicId: string,
  chapterId: number,
  base = '/data',
): Promise<QuestionBankItem[]> {
  const { questionHtml } = chapterAssetPathsRelativeToData(topicId, chapterId)
  const url = toPublicDataUrl(questionHtml, base)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(
      `加载题目失败 ${res.status}: ${url}`,
    )
  }
  const html = await res.text()
  return parseQuestionBankItems(
    extractEmbeddedJsonFromDataHtml(html),
    chapterId,
  )
}
