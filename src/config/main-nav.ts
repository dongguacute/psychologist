import { BookOpen, CalendarDays, Settings } from '@lucide/vue'

export const mainNavItems = [
  { to: '/', name: 'learn', label: '学习', icon: BookOpen },
  { to: '/calendar', name: 'calendar', label: '日历', icon: CalendarDays },
  { to: '/settings', name: 'settings', label: '设置', icon: Settings },
] as const
