import MarkdownIt from 'markdown-it'

/**
 * 课题静态数据 Markdown → HTML（与 `vite.config` 中 unplugin-vue-markdown 的 markdownOptions 对齐：linkify / typographer）。
 * 支持可选的 YAML 文件头（`---` … `---`），解析后从正文中剥离，仅渲染正文。
 *
 * 识别的元数据（均为可选，显示在正文 HTML 末尾，顺序：参考资料 → 最后更新 → 撰稿）：
 * - `references` / `参考资料`：可写一行，或在 `key:` 下一行起用 `- 条目` 列表
 * - `updated` / `last_updated` / `最后更新`：人类可读的日期或版本说明
 * - `author`：撰稿人
 *
 * 构建阶段将仓库根目录 `data` 下的 `.md` 写入 `dist/data` 同级 `.html` 后删除 `.md`；开发服务器对 `/data/` 下 `.html` 从同名 `.md` 即时渲染。
 */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

function stripQuotes(v: string): string {
  const t = v.trim()
  if (
    (t.startsWith('"') && t.endsWith('"'))
    || (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1)
  }
  return t
}

/**
 * 简单 YAML：单行 `key: value`，或 `key:` 后接仅含 `- 条目` 的列表（可多行）。
 * key 支持英文、数字、中文等；value 可含冒号（如 URL），整段取自首个 `:` 之后。
 */
function parseFrontmatterBlock(block: string): Record<string, string> {
  const data: Record<string, string> = {}
  const lines = block.split(/\r?\n/)
  let i = 0

  while (i < lines.length) {
    const trimmed = (lines[i] ?? '').trim()
    if (!trimmed || trimmed.startsWith('#')) {
      i++
      continue
    }

    const colon = trimmed.indexOf(':')
    if (colon <= 0) {
      i++
      continue
    }

    const key = trimmed.slice(0, colon).trim()
    if (!/^[\p{L}\p{N}_-]+$/u.test(key)) {
      i++
      continue
    }

    const rest = trimmed.slice(colon + 1)
    const valTrim = rest.trim()

    if (valTrim !== '') {
      data[key] = stripQuotes(valTrim)
      i++
      continue
    }

    const items: string[] = []
    i++
    while (i < lines.length) {
      const L = lines[i] ?? ''
      const lm = /^\s*-\s+(.*)$/.exec(L)
      if (lm) {
        items.push(stripQuotes(lm[1] ?? ''))
        i++
        continue
      }
      const t = L.trim()
      if (t === '' || t.startsWith('#')) {
        i++
        continue
      }
      break
    }
    if (items.length > 0) {
      data[key] = items.join('\n')
    }
  }

  return data
}

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pickReferences(data: Record<string, string>): string {
  return (data.references ?? data['参考资料'] ?? '').trim()
}

function pickUpdated(data: Record<string, string>): string {
  return (
    data.updated
    ?? data.last_updated
    ?? data['最后更新']
    ?? ''
  ).trim()
}

function renderMetaFooter(data: Record<string, string>): string {
  const refsRaw = pickReferences(data)
  const updatedRaw = pickUpdated(data)
  const author = (data.author ?? '').trim()

  if (!refsRaw && !updatedRaw && !author)
    return ''

  let out = '<hr class="data-md-meta-hr" />\n'

  if (refsRaw) {
    const items = refsRaw.split('\n').map(s => s.trim()).filter(Boolean)
    out += '<div class="data-md-meta">\n'
    out += '<p class="data-md-meta-title"><strong>参考资料</strong></p>\n'
    out += '<ul class="data-md-references">\n'
    for (const item of items) {
      out += `<li>${escapeHtmlText(item)}</li>\n`
    }
    out += '</ul>\n'
    out += '</div>\n'
  }

  if (updatedRaw) {
    out += `<p class="data-md-updated"><strong>最后更新：</strong>${escapeHtmlText(updatedRaw)}</p>\n`
  }

  if (author) {
    out += `<p class="data-md-byline"><strong>撰稿：</strong>${escapeHtmlText(author)}</p>\n`
  }

  return out
}

function stripFrontmatter(source: string): {
  body: string
  data: Record<string, string>
} {
  const normalized = source.replace(/^\uFEFF/, '')
  const lines = normalized.split(/\r?\n/)
  if (lines[0]?.trim() !== '---') {
    return { body: source, data: {} }
  }

  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') {
      end = i
      break
    }
  }
  if (end === -1) {
    return { body: source, data: {} }
  }

  const rawFm = lines.slice(1, end).join('\n')
  const body = lines.slice(end + 1).join('\n').replace(/^\n+/, '')
  return { body, data: parseFrontmatterBlock(rawFm) }
}

export function renderDataMarkdown(source: string): string {
  const { body, data } = stripFrontmatter(source)
  let html = md.render(body)
  html += renderMetaFooter(data)
  return html
}
