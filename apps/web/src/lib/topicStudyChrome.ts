import { ref } from 'vue'

/**
 * 进入「课题详情」路由时自动收为图标条；
 * 用户可手动固定展开或收起；
 * 处于收起状态时，指针在侧栏内会临时展开看清标签（离开侧栏恢复原状）。
 */

/** 在课题详情页是否为「收起条」模式（可被悬停透视） */
export const sidebarTopicRailCollapsed = ref(false)

/** 收起条模式下，指针在侧栏内时为 true → 视觉上临时展开 */
export const sidebarAsideHoverPeek = ref(false)

/** 收起 / 展开侧栏（仅课题页有意义的形态；其余路由下由路由 watch 校正） */
export function toggleSidebarTopicRailCollapsed(): void {
  sidebarTopicRailCollapsed.value = !sidebarTopicRailCollapsed.value
  sidebarAsideHoverPeek.value = false
}
