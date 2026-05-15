import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import type { Connect, Plugin, ViteDevServer } from 'vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import { renderDataMarkdown } from './src/lib/dataMarkdown'

const webRoot = fileURLToPath(new URL('.', import.meta.url))
/** 仓库根目录下的课题数据（禁止放在 `apps/web/public/data`）。 */
const repoDataRoot = path.resolve(webRoot, '../../data')

const DATA_MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

function resolveSafeFileUnderRoot(root: string, urlRel: string): string | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(urlRel)
  }
  catch {
    return null
  }
  const abs = path.resolve(root, path.normalize(decoded))
  const rootResolved = path.resolve(root)
  if (abs !== rootResolved && !abs.startsWith(`${rootResolved}${path.sep}`)) {
    return null
  }
  return abs
}

function walkMarkdownFiles(dir: string, onFile: (abs: string) => void): void {
  if (!fs.existsSync(dir))
    return
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      walkMarkdownFiles(abs, onFile)
    }
    else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) {
      onFile(abs)
    }
  }
}

/** 构建：用仓库根 `data/` 覆盖写入 `dist/data/`，再把其中 `.md` 编译为同级 `.html`。 */
function psychologistRepoDataBuildPlugin(): Plugin {
  let outDir = ''
  return {
    name: 'psychologist-repo-data-build',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const dataOut = path.join(outDir, 'data')
      if (fs.existsSync(repoDataRoot)) {
        fs.rmSync(dataOut, { recursive: true, force: true })
        fs.cpSync(repoDataRoot, dataOut, { recursive: true })
      }
      walkMarkdownFiles(dataOut, (absMd) => {
        const mdSource = fs.readFileSync(absMd, 'utf8')
        const htmlPath = absMd.replace(/\.md$/i, '.html')
        fs.writeFileSync(htmlPath, renderDataMarkdown(mdSource), 'utf8')
      })
    },
  }
}

/** History 路由：将入口页复制为 `404.html`（如 GitHub Pages 等对未知路径返回 404 页面时的兜底）。 */
function spaHistoryFallbackExportPlugin(): Plugin {
  let outDir = ''
  return {
    name: 'psychologist-spa-history-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const indexHtml = path.join(outDir, 'index.html')
      if (!fs.existsSync(indexHtml))
        return
      fs.copyFileSync(indexHtml, path.join(outDir, '404.html'))
    },
  }
}

function prependDevMiddleware(
  server: ViteDevServer,
  handler: Connect.NextHandleFunction,
) {
  type Layer = { route: string; handle: Connect.HandleFunction }
  const stack = (server.middlewares as Connect.Server & { stack?: Layer[] }).stack
  if (!stack) {
    server.middlewares.use(handler)
    return
  }
  stack.unshift({ route: '', handle: handler })
}

function psychologistRepoDataDevPlugin(): Plugin {
  return {
    name: 'psychologist-repo-data-dev',
    apply: 'serve',
    configureServer(server) {
      const watchRoots = fs.existsSync(repoDataRoot) ? [repoDataRoot] : []

      for (const r of watchRoots) {
        server.watcher.add(r)
      }

      const notifyDataRoots = (file: string) => {
        const norm = path.normalize(file)
        for (const r of watchRoots) {
          const base = path.normalize(r)
          if (norm === base || norm.startsWith(`${base}${path.sep}`)) {
            server.ws.send({ type: 'full-reload', path: '*' })
            return
          }
        }
      }

      server.watcher.on('change', notifyDataRoots)
      server.watcher.on('add', notifyDataRoots)
      server.watcher.on('unlink', notifyDataRoots)

      prependDevMiddleware(server, (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }

        const pathname = req.url?.split('?')[0]
        if (!pathname?.startsWith('/data/')) {
          next()
          return
        }

        const rel = pathname.slice('/data/'.length)

        // 开发：/data/**/*.html 由同名 .md 即时渲染（与构建写入 dist 的 HTML 一致）
        if (rel.toLowerCase().endsWith('.html')) {
          const mdRel = rel.replace(/\.html$/i, '.md')
          if (!fs.existsSync(repoDataRoot)) {
            next()
            return
          }
          const absMd = resolveSafeFileUnderRoot(repoDataRoot, mdRel)
          if (!absMd || !fs.existsSync(absMd)) {
            next()
            return
          }
          fs.readFile(absMd, { encoding: 'utf8' }, (err, mdSource) => {
            if (err) {
              next()
              return
            }
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            if (req.method === 'HEAD') {
              res.end()
              return
            }
            res.end(renderDataMarkdown(mdSource))
          })
          return
        }

        if (!fs.existsSync(repoDataRoot)) {
          next()
          return
        }

        const abs = resolveSafeFileUnderRoot(repoDataRoot, rel)
        if (!abs) {
          next()
          return
        }

        fs.stat(abs, (err, st) => {
          if (err || !st.isFile()) {
            next()
            return
          }

          const ext = path.extname(abs).toLowerCase()
          res.setHeader(
            'Content-Type',
            DATA_MIME[ext] ?? 'application/octet-stream',
          )

          if (req.method === 'HEAD') {
            res.end()
            return
          }

          fs.createReadStream(abs).pipe(res)
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  /** 单页应用：开发/预览服务器对无前缀路径回退到 `index.html`，供 Vue Router History 解析。 */
  appType: 'spa',
  /** 默认 `/`；若部署在子路径（如 GitHub Pages 项目站），改为 `/仓库名/`。 */
  base: '/',
  /**
   * 纯静态产物：`pnpm build` 输出可直接静态托管，无需 Node。
   * 深层路由刷新依赖宿主回退（`public/_redirects`、`.htaccess`、或 CDN 的 SPA 规则）；仅用 `python -m http.server` 无法重写路径。
   */
  build: {
    emptyOutDir: true,
  },
  plugins: [
    psychologistRepoDataDevPlugin(),
    psychologistRepoDataBuildPlugin(),
    spaHistoryFallbackExportPlugin(),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      wrapperClasses: 'markdown-test-prose',
      markdownOptions: {
        linkify: true,
        typographer: true,
      },
    }),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
