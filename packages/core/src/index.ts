export function appTitle(): string {
  return 'Psychologist'
}

export {
  assertSafeTopicFolder,
  chapterAssetPathsRelativeToData,
  DATA_DIRECTORY_NAME,
  toPublicDataUrl,
} from './paths.js'

export {
  EMBEDDED_JSON_SCRIPT_ID,
  extractEmbeddedJsonFromDataHtml,
  wrapJsonAsDataHtml,
} from './data-html.js'

export {
  parseQuestionBankData,
  parseQuestionBankItem,
  parseQuestionBankItems,
} from './question.js'

export {
  chapterAboutPublicUrl,
  chapterMainPublicUrl,
  fetchChapterQuestions,
  topicIndexPublicUrl,
} from './topic-public.js'

/** Node（`fs`）专用：请使用 `@psychologist/core/repo`，勿从主入口引用，以免打入浏览器包。 */

export type {
  AnswerRule,
  AnswerRuleMultiple,
  AnswerRuleSingle,
  Chapter,
  QuestionBankItem,
  QuestionOption,
  QuestionType,
  RegisteredTopic,
} from './types.js'
