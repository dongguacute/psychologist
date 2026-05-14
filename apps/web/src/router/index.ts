import { createRouter, createWebHistory } from 'vue-router'

import { ROUTE_NAMES } from '@/app/routes'
import AppShell from '@/layouts/AppShell.vue'
import CalendarView from '@/views/CalendarView.vue'
import HomeView from '@/views/HomeView.vue'
import MarkdownTestView from '@/views/MarkdownTestView.vue'
import SettingsView from '@/views/SettingsView.vue'

import TopicLearnView from '@/views/TopicLearnView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
