export interface Chapter {
  id: number
  title: string
  description: string
  content: string[]
}

/** 题型：判断题按单选处理，使用 `single` + `answer_rule.type: "single"` */
export type QuestionType = 'single' | 'multiple'

export interface QuestionOption {
  option_code: string
  option_text: string
}

/**
 * 判题规则（单选 / 判断题）
 * - `correct`：标准答案，统一为选项代码数组（单选为 `["B"]`）
 * - `all_or_nothing`：全对 1 分，否则 0 分
 */
export interface AnswerRuleSingle {
  type: 'single'
  correct: string[]
  scoring_mode: 'all_or_nothing'
}

/**
 * 多选题判题规则
 * - `strict_match`：与标准答案集合完全一致（无漏选、无多选；比较时按选项代码规范化后比较）
 */
export interface AnswerRuleMultiple {
  type: 'multiple'
  correct: string[]
  scoring_mode: 'strict_match'
}

export type AnswerRule = AnswerRuleSingle | AnswerRuleMultiple

export interface QuestionBankItem {
  question_id: number
  /** 若填写，解析器可与章节目录 id 校验（见 `loadQuestionFromRepo`） */
  chapter_id?: number
  question_type: QuestionType
  question_title: string
  options: QuestionOption[]
  answer_rule: AnswerRule
}

/** 前端课题注册表条目：`topicId` 必须与仓库目录 `data/{topicId}/` 同名。 */
export interface RegisteredTopic {
  topicId: string
  name: string
  logo: string
}
