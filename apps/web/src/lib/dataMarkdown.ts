import MarkdownIt from 'markdown-it'

/**
 * 课题静态数据 Markdown → HTML（与 `vite.config` 中 unplugin-vue-markdown 的 markdownOptions 对齐：linkify / typographer）。
 * 构建阶段将仓库根目录 `data` 下的 `.md` 复制到 `dist/data` 并写成同级 `.html`；开发服务器对 `/data/` 下 `.html` 请求从同名 `.md` 即时渲染。
 */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

export function renderDataMarkdown(source: string): string {
  return md.render(source)
}
