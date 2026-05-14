import { BookOpen, CalendarDays, Settings } from '@lucide/vue'

/** 侧栏上半：学习 + 日历 */
export const primaryNavItems = [
  { to: '/', name: 'learn', label: '学习', icon: BookOpen },
  { to: '/calendar', name: 'calendar', label: '日历', icon: CalendarDays },
] as const

/** 侧栏底部固定 */
export const settingsNavItem = {
  to: '/settings',
  name: 'settings',
  label: '设置',
  icon: Settings,
} as const

/** 移动端底部 Tab：三项并列 */
export const mobileNavItems = [
  ...primaryNavItems,
  settingsNavItem,
] as const
