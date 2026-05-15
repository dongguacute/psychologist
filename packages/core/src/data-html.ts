/**
 * 构建产物：`dist/data/` 下各 `.json` 转为同级 `.html`，内嵌 `application/json`，
 * 避免在静态站暴露裸 `.json`；正文中的 `<` 会转义以免截断 `script` 标签。
 */
export const EMBEDDED_JSON_SCRIPT_ID = 'psychologist-embedded-json' as const

/**
 * 将合法 JSON 文本包装为极简 HTML（仅含一处 `application/json` 脚本节点）。
 */
export function wrapJsonAsDataHtml(jsonRaw: string): string {
  const trimmed = jsonRaw.trim()
  void JSON.parse(trimmed)
  const safe = trimmed.replace(/</g, '\\u003c')
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>data</title>
</head>
<body>
<script type="application/json" id="${EMBEDDED_JSON_SCRIPT_ID}">${safe}</script>
</body>
</html>
`
}

/**
 * 从 {@link wrapJsonAsDataHtml} 生成的文档中取出 JSON 原文（供 `JSON.parse` / {@link parseQuestionBankItem}）。
 */
export function extractEmbeddedJsonFromDataHtml(html: string): string {
  const id = EMBEDDED_JSON_SCRIPT_ID
  const reTypeFirst = new RegExp(
    `<script\\s+type="application/json"\\s+id="${id}"[^>]*>([\\s\\S]*?)</script>`,
    'i',
  )
  const reIdFirst = new RegExp(
    `<script\\s+id="${id}"\\s+type="application/json"[^>]*>([\\s\\S]*?)</script>`,
    'i',
  )
  const m = html.match(reTypeFirst) ?? html.match(reIdFirst)
  if (!m || m[1] === undefined)
    throw new Error(`无法在课题数据 HTML 中找到内嵌 JSON（#${id}）`)
  return m[1].trim()
}
