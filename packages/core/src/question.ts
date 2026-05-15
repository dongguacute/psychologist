import type { QuestionBankItem } from './types.js'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(i => typeof i === 'string')
}

function parseJsonRoot(raw: string): unknown {
  try {
    return JSON.parse(raw)
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`题目 JSON 解析失败: ${msg}`)
  }
}

/**
 * 将单个题目对象解析为 {@link QuestionBankItem}。
 * `chapterIdForValidation` 若传入，则当题目含 `chapter_id` 时须与其一致。
 */
export function parseQuestionBankData(
  data: Record<string, unknown>,
  chapterIdForValidation?: number,
): QuestionBankItem {
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
      throw new TypeError(
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
      throw new TypeError('若提供 chapter_id，须为整数')
    }
    item.chapter_id = ch
    if (
      chapterIdForValidation !== undefined
      && ch !== chapterIdForValidation
    ) {
      throw new Error(
        `题目归属不一致: JSON chapter_id=${ch}, 章节目录 id=${chapterIdForValidation}`,
      )
    }
  }

  return item
}

function normalizeQuestionListPayload(
  data: unknown,
): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error('题目列表不能为空')
    }
    return data.map((row, i) => {
      if (!isRecord(row)) {
        throw new Error(`题目数组[${i}] 须为 JSON 对象`)
      }
      return row
    })
  }

  if (!isRecord(data)) {
    throw new Error('题目 JSON 须为对象、{ questions: [] } 或题目数组')
  }

  const wrapped = data.questions
  if (Array.isArray(wrapped)) {
    if (wrapped.length === 0) {
      throw new Error('questions 数组不能为空')
    }
    return wrapped.map((row, i) => {
      if (!isRecord(row)) {
        throw new Error(`questions[${i}] 须为 JSON 对象`)
      }
      return row
    })
  }

  if (typeof data.question_id === 'number') {
    return [data]
  }

  throw new Error(
    '题目 JSON 须为单个题目对象、题目数组，或含 questions 数组的对象',
  )
}

/**
 * 解析 `question.json` 原始文本，支持：
 * - 单题：`{ "question_id": … }`
 * - 多题：题目数组 `[{ … }, { … }]` 或 `{ "questions": [{ … }, { … }] }`
 *
 * `chapterIdForValidation` 传入时，每道题若含 `chapter_id` 会校验与章节目录一致。
 */
export function parseQuestionBankItems(
  raw: string,
  chapterIdForValidation?: number,
): QuestionBankItem[] {
  const rows = normalizeQuestionListPayload(parseJsonRoot(raw))
  const seen = new Set<number>()
  const items: QuestionBankItem[] = []
  for (const row of rows) {
    const item = parseQuestionBankData(row, chapterIdForValidation)
    if (seen.has(item.question_id)) {
      throw new Error(`题目 question_id 重复: ${item.question_id}`)
    }
    seen.add(item.question_id)
    items.push(item)
  }
  return items
}

/**
 * 解析 `question.json` 原始文本（**恰好一道题**）；可在浏览器端对 `fetch` 结果调用。
 * 同一文件含多题时请改用 {@link parseQuestionBankItems}。
 */
export function parseQuestionBankItem(raw: string): QuestionBankItem {
  const items = parseQuestionBankItems(raw)
  if (items.length !== 1) {
    throw new Error(
      `本文件含 ${items.length} 道题，请使用 parseQuestionBankItems`,
    )
  }
  return items[0]!
}
