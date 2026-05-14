import { createRouter, createWebHistory } from 'vue-router'

import AppShell from '@/layouts/AppShell.vue'
import CalendarView from '@/views/CalendarView.vue'
import HomeView from '@/views/HomeView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppShell,
      children: [
        {
          path: '',
          name: 'learn',
          component: HomeView,
          meta: { title: '学习' },
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: CalendarView,
          meta: { title: '打卡日历' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView,
          meta: { title: '设置' },
        },
      ],
    },
  ],
})

export default router
