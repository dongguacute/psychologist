import { createRouter, createWebHistory } from 'vue-router'
import type { RouterScrollBehavior } from 'vue-router'

import { ROUTE_NAMES } from '@/app/routes'
import AppShell from '@/layouts/AppShell.vue'
import CalendarView from '@/views/CalendarView.vue'
import HomeView from '@/views/HomeView.vue'
import MarkdownTestView from '@/views/MarkdownTestView.vue'
import SettingsView from '@/views/SettingsView.vue'

import TopicLearnView from '@/views/TopicLearnView.vue'

/** 典型 SPA 滚动：前进到新页置顶；浏览器后退时恢复上次滚动位置。 */
const scrollBehavior: RouterScrollBehavior = (_to, _from, savedPosition) => {
  if (savedPosition)
    return savedPosition
  return { top: 0 }
}

const router = createRouter({
  /**
   * Vue Router 客户端 SPA：`createWebHistory` + 嵌套路由，整站单入口 `index.html`。
   * 静态部署时需宿主将「无前缀路径」回退到该入口（见 `public/_redirects`、`.htaccess`、`404.html`）。
   */
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior,
  routes: [
    {
      path: '/',
      component: AppShell,
      children: [
        {
          path: '',
          name: ROUTE_NAMES.learn,
          component: HomeView,
          meta: { title: '学习' },
        },
        {
          path: 'learn/topics/:topicId',
          name: ROUTE_NAMES.learnTopic,
          component: TopicLearnView,
          meta: { title: '课题' },
        },
        {
          path: 'calendar',
          name: ROUTE_NAMES.calendar,
          component: CalendarView,
          meta: { title: '打卡日历' },
        },
        {
          path: 'markdown-test',
          name: ROUTE_NAMES.markdownTest,
          component: MarkdownTestView,
          meta: { title: 'Markdown 测试' },
        },
        {
          path: 'settings',
          name: ROUTE_NAMES.settings,
          component: SettingsView,
          meta: { title: '设置' },
        },
      ],
    },
  ],
})

export default router
