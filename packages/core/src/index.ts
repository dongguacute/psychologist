export function appTitle(): string {
  return 'Psychologist'
}

export {
  assertSafeTopicFolder,
  chapterAssetPathsRelativeToData,
  DATA_DIRECTORY_NAME,
  toPublicDataUrl,
} from './paths.js'

export { parseQuestionBankItem } from './question.js'

export {
  chapterAboutPublicUrl,
  chapterMainPublicUrl,
  fetchChapterQuestion,
  topicIndexPublicUrl,
} from './topic-public.js'

export {
  chapterFolderIds,
  loadQuestionFromRepo,
  repoRootPath,
} from './repo.js'

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
