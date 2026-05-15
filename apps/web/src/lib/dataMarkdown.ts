import MarkdownIt from 'markdown-it'

/**
 * 课题静态数据 Markdown → HTML（与 `vite.config` 中 unplugin-vue-markdown 的 markdownOptions 对齐：linkify / typographer）。
 * 构建阶段将仓库根目录 `data` 下的 `.md` 写入 `dist/data` 同级 `.html` 后删除 `.md`；开发服务器对 `/data/` 下 `.html` 从同名 `.md` 即时渲染。
 */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

export function renderDataMarkdown(source: string): string {
  return md.render(source)
}
