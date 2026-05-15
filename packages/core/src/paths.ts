/**
 * 约定：仓库根下 `data/{topicFolder}/…`；前端静态资源可挂在站点 `/data/` 下，
 * 故 `topicFolder` 须与注册表里的 `topicId` 一致。
 */
export const DATA_DIRECTORY_NAME = 'data' as const

/** 只允许单层目录段作为课题文件夹名（防止路径穿越）。 */
export function assertSafeTopicFolder(topicFolder: string): void {
  const s = topicFolder.trim()
  if (!s)
    throw new TypeError('课题目录名不能为空')
  if (s !== topicFolder)
    throw new TypeError('课题目录名首尾不可含空白')
  if (s.includes('/') || s.includes('\\') || s.includes('\0'))
    throw new TypeError('课题目录名不可含路径分隔符')
  if (s === '.' || s === '..')
    throw new TypeError('课题目录名不可为 . 或 ..')
}

/**
 * 相对仓库 `data/` 根目录的 POSIX 路径（不含 `data/` 前缀）。
 * 前端 `fetch` 时可配合 {@link toPublicDataUrl}。
 */
export function chapterAssetPathsRelativeToData(
  topicFolder: string,
  chapterId: number,
): {
  topicIndex: string
  main: string
  about: string
  questionJson: string
} {
  assertSafeTopicFolder(topicFolder)
  if (!Number.isInteger(chapterId))
    throw new TypeError('chapterId 须为整数')
  if (chapterId < 0)
    throw new TypeError('chapterId 须为非负整数')

  const ch = String(chapterId)
  return {
    topicIndex: `${topicFolder}/index.html`,
    main: `${topicFolder}/${ch}/main.html`,
    about: `${topicFolder}/${ch}/about.html`,
    questionJson: `${topicFolder}/${ch}/question.json`,
  }
}

/**
 * 将「相对 `data/` 的路径」拼成可供浏览器请求的 URL（默认前缀 `/data`）。
 */
export function toPublicDataUrl(
  pathRelativeToData: string,
  publicDataBase = '/data',
): string {
  const rel = pathRelativeToData.replace(/^\/+/, '')
  const base = publicDataBase.replace(/\/+$/, '') || '/data'
  return `${base}/${rel}`
}
