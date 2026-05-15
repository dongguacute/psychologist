import type { QuestionBankItem } from './types.js'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { fileURLToPath } from 'node:url'
import { assertSafeTopicFolder, DATA_DIRECTORY_NAME } from './paths.js'
import { parseQuestionBankItems } from './question.js'

function resolveRepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url))
  for (;;) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml')))
      return dir

    const dataDir = join(dir, DATA_DIRECTORY_NAME)
    if (existsSync(dataDir))
      return dir

    const parent = dirname(dir)
    if (parent === dir)
      throw new Error('无法定位仓库根目录（未发现 pnpm-workspace.yaml）。')
    dir = parent
  }
}

/** 章节目录段：与非负整数 `chapterId` 一一对应（禁止 `01` 等前导零）。 */
const CANONICAL_CHAPTER_DIR = /^(?:0|[1-9]\d*)$/

/**
 * 列出 `data/{topicFolder}/` 下规范整型子目录名，按数值升序。
 * （仅 Node；构建脚本或本地工具可用。）
 */
export function chapterFolderIds(topicFolder: string): number[] {
  assertSafeTopicFolder(topicFolder)

  const root = resolveRepoRoot()
  const topicPath = join(root, DATA_DIRECTORY_NAME, topicFolder)
  if (!existsSync(topicPath))
    throw new Error(`找不到课题目录: ${topicPath}`)

  const names: string[] = []
  for (const name of readdirSync(topicPath)) {
    assertSafeTopicFolder(name)
    const p = join(topicPath, name)
    try {
      if (!statSync(p).isDirectory())
        continue
    }
    catch {
      continue
    }
    if (!CANONICAL_CHAPTER_DIR.test(name))
      continue

    const num = Number(name)
    if (!Number.isSafeInteger(num))
      throw new Error(`章节目录名超出安全整数范围: ${name}`)
    names.push(name)
  }

  names.sort((a, b) => Number(a) - Number(b))
  return names.map(Number)
}

/**
 * 从仓库 `data/{topicFolder}/{chapterId}/question.json` 读取并解析题目列表（可含多题）。
 * （仅 Node；浏览器请 `fetch` + {@link parseQuestionBankItems}。）
 */
export function loadQuestionsFromRepo(
  topicFolder: string,
  chapterId: number,
): QuestionBankItem[] {
  assertSafeTopicFolder(topicFolder)
  if (!Number.isInteger(chapterId))
    throw new TypeError('chapterId 须为整数')
  if (chapterId < 0)
    throw new TypeError('chapterId 须为非负整数')

  const folder = String(chapterId)
  const path = join(
    resolveRepoRoot(),
    DATA_DIRECTORY_NAME,
    topicFolder,
    folder,
    'question.json',
  )

  if (!existsSync(path))
    throw new Error(`找不到题目文件: ${path}`)

  const raw = readFileSync(path, 'utf8')
  return parseQuestionBankItems(raw, chapterId)
}

/** 仓库根绝对路径（仅 Node，供工具链偶尔需要）。 */
export function repoRootPath(): string {
  return resolveRepoRoot()
}
