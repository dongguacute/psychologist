/**
 * 学习与课题：`router/index.ts` 中的 name / path 与这里保持一致，
 * `RouterLink`、`router.push({ name })` 时优先从这里引用常量。
 */

export const ROUTE_NAMES = {
  learn: 'learn',
  /** 正文工作台：`/learn/topics/:topicId` */
  learnTopic: 'learn-topic',
  calendar: 'calendar',
  settings: 'settings',
  markdownTest: 'markdown-test',
} as const

export type AppRouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]

/** 当前路由是否属于「学习」板块（含课题子路由）。 */
export function isLearnSectionRoute(
  routeName: string | symbol | undefined | null,
): boolean {
  return (
    routeName === ROUTE_NAMES.learn
    || routeName === ROUTE_NAMES.learnTopic
  )
}

/** `{ name, params }` — 跳转某课题的学习页 */
export function learnTopicLocation(topicId: string): {
  name: typeof ROUTE_NAMES.learnTopic
  params: { topicId: string }
} {
  return {
    name: ROUTE_NAMES.learnTopic,
    params: { topicId },
  }
}

/**
 * 与应用路由相关的集中入口（课题跳转等），便于按 `AppRoute.xxx(...)` 方式书写。
 *
 * ```ts
 * import { AppRoute } from '@/app/routes'
 * router.push(AppRoute.learnTopic('demo'))
 * ```
 */
export const AppRoute = {
  names: ROUTE_NAMES,
  learnTopic: learnTopicLocation,
  isLearnSectionRoute,
}
