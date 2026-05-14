---
title: Markdown 解析示例
---

# {{ frontmatter.title }}

本站使用 **unplugin-vue-markdown**：构建时把本 `.md` 文件编译成 Vue 组件，不是浏览器里再用独立解析库跑一遍。

普通段落混排 *斜体*、`行内代码` 与 [**Vite 官网链接**](https://vitejs.dev)。

## 二级标题

- 无序列表
- 支持 **Markdown** 常见语法
  - 嵌套无序项
  - 再嵌套一层
- 最后一项

1. 有序一
2. 有序二
   1. 嵌套有序
   2. 继续

## 代码块

```ts
export function greet(name: string): string {
  return `Hello, ${name}`
}
```

> 引用：前端内容开发可参考 [Vue 文档](https://vuejs.org)。

---

`src/content/markdown-parse-sample.md` · 修改后需保存并等待 HMR 刷新。
