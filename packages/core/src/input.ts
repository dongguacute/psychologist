import type { QuestionBankItem } from './types'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function resolveRepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url))
  for (;;) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml')))
      return dir

    const dataDir = join(dir, 'data')
    if (existsSync(dataDir))
      return dir

    const parent = dirname(dir)
    if (parent === dir)
      throw new Error('无法定位仓库根目录（未发现 pnpm-workspace.yaml）。')
    dir = parent
  }
}

function readDataFile(
  relativeSegments: readonly string[],
  ext: '.md' | '.json',
): string {
  const root = resolveRepoRoot()
  const dataRoot = join(root, 'data')
  const base = join(dataRoot, ...relativeSegments.slice(0, -1))
  const name = relativeSegments[relativeSegments.length - 1]

  if (!relativeSegments.length)
    throw new Error('readDataFile: empty path.')

  if (!existsSync(dataRoot))
    throw new Error(`数据目录不存在: ${dataRoot}`)

  const filepath = join(base, `${name}${ext}`)
  if (!existsSync(filepath))
    throw new Error(`找不到内容文件: ${filepath}`)

  return readFileSync(filepath, 'utf8')
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(i => typeof i === 'string')
}

function parseQuestionBankItem(raw: string): QuestionBankItem {
  let data: unknown
  try {
    data = JSON.parse(raw)
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`题目 JSON 解析失败: ${msg}`)
  }

  if (!isRecord(data))
    throw new Error('题目 JSON 须为 JSON 对象')

  const question_id = data.question_id
  if (typeof question_id !== 'number' || !Number.isInteger(question_id))
    throw new Error('题目 JSON 缺少合法字段 question_id（整数）')

  const question_type = data.question_type
  if (question_type !== 'single' && question_type !== 'multiple') {
    throw new Error(
      '题目 JSON 字段 question_type 须为 "single" 或 "multiple"',
    )
  }

  const question_title = data.question_title
  if (typeof question_title !== 'string')
    throw new Error('题目 JSON 缺少字段 question_title（字符串）')

  const optionsRaw = data.options
  if (!Array.isArray(optionsRaw) || !optionsRaw.every(isRecord))
    throw new Error('题目 JSON 字段 options 须为对象数组')

  const options = optionsRaw.map((row, idx) => {
    const oc = row.option_code
    const ot = row.option_text
    if (typeof oc !== 'string' || typeof ot !== 'string') {
      throw new Error(
        `题目 options[${idx}] 须包含字符串字段 option_code、option_text`,
      )
    }
    return { option_code: oc, option_text: ot }
  })

  const ar = data.answer_rule
  if (!isRecord(ar))
    throw new Error('题目 JSON 缺少对象字段 answer_rule')

  const arType = ar.type
  if (arType !== 'single' && arType !== 'multiple') {
    throw new Error('answer_rule.type 须为 "single" 或 "multiple"')
  }

  if (arType !== question_type) {
    throw new Error(
      `question_type (${question_type}) 与 answer_rule.type (${arType}) 不一致`,
    )
  }

  const correct = ar.correct
  if (!isStringArray(correct) || correct.length === 0) {
    throw new Error('answer_rule.correct 须为非空字符串数组')
  }

  const scoring_mode = ar.scoring_mode

  let answer_rule: QuestionBankItem['answer_rule']
  if (arType === 'single') {
    if (scoring_mode !== 'all_or_nothing') {
      throw new Error(
        '单选题 / 判断题 answer_rule.scoring_mode 须为 "all_or_nothing"',
      )
    }
    answer_rule = { type: 'single', correct: [...correct], scoring_mode }
  }
  else {
    if (scoring_mode !== 'strict_match') {
      throw new Error('多选题 answer_rule.scoring_mode 须为 "strict_match"')
    }
    answer_rule = { type: 'multiple', correct: [...correct], scoring_mode }
  }

  const item: QuestionBankItem = {
    question_id,
    question_type,
    question_title,
    options,
    answer_rule,
  }

  const ch = data.chapter_id
  if (ch !== undefined) {
    if (typeof ch !== 'number' || !Number.isInteger(ch)) {
      throw new Error('若提供 chapter_id，须为整数')
    }
    item.chapter_id = ch
  }

  return item
}

/**
 * 按课时 / 单元的目录 id，从仓库根目录 `data/{id}/` 读取文稿与题目并拼成提示用文本：
 * - `data/{id}/about.md`
 * - `data/{id}/question.json` — 结构见 {@link QuestionBankItem}
 *
 * 若 `question.json` 含可选字段 `chapter_id`，则必须与 `id`（目录名）一致。
 */
export function input(id: number): string {
  const folder = String(id)

  const chapterBody = readDataFile([folder, 'about'], '.md').trimEnd()

  const rawQuestion = readDataFile([folder, 'question'], '.json')
  const question = parseQuestionBankItem(rawQuestion)

  if (
    question.chapter_id !== undefined
    && question.chapter_id !== id
  ) {
    throw new Error(
      `题目归属不一致: JSON chapter_id=${question.chapter_id}, 目录 id=${id}`,
    )
  }

  const questionBody = JSON.stringify(question, null, 2)

  return [
    `## 课时内容 (${id})`,
    '',
    chapterBody,
    '',
    `## 题目 (${question.question_id})`,
    '',
    questionBody,
  ].join('\n')
}
