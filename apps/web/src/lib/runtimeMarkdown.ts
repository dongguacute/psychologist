import MarkdownIt from 'markdown-it'

/**
 * 与 `vite.config` 中 `unplugin-vue-markdown` 的 `markdownOptions` 对齐（linkify / typographer）。
 * 用于运行时渲染从 `/data/` 拉取的 Markdown 字符串；构建时 `.md` 仍由插件编译。
 */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

export function renderRuntimeMarkdown(source: string): string {
  return md.render(source)
}
