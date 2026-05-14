import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import type { Connect, Plugin, ViteDevServer } from 'vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const webRoot = fileURLToPath(new URL('.', import.meta.url))
const repoDataRoot = path.resolve(webRoot, '../../data')
const publicDataRoot = path.resolve(webRoot, 'public/data')

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
      const watchRoots = [repoDataRoot, publicDataRoot].filter((p) =>
        fs.existsSync(p),
      )

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

        if (!fs.existsSync(repoDataRoot)) {
          next()
          return
        }

        const rel = pathname.slice('/data/'.length)
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
  plugins: [
    psychologistRepoDataDevPlugin(),
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
