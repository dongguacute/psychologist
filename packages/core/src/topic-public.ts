import { chapterAssetPathsRelativeToData, toPublicDataUrl } from './paths.js'
import { parseQuestionBankItem } from './question.js'
import type { QuestionBankItem } from './types.js'

export function topicIndexPublicUrl(topicId: string, base = '/data'): string {
  const rel = `${topicId}/index.md`.replace(/^\/+/, '')
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

export async function fetchChapterQuestion(
  topicId: string,
  chapterId: number,
  base = '/data',
): Promise<QuestionBankItem> {
  const { questionJson } = chapterAssetPathsRelativeToData(topicId, chapterId)
  const url = toPublicDataUrl(questionJson, base)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(
      `加载题目失败 ${res.status}: ${url}`,
    )
  }
  return parseQuestionBankItem(await res.text())
}
