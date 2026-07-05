/**
 * 日历工具函数
 */

/** HTML 转义 */
export function escapeHtml(text: string | undefined | null): string {
  const div = document.createElement("div")
  div.textContent = text || ""
  return div.innerHTML
}

/** 格式化为 YYYY-MM-DD */
export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** 格式化为 datetime-local 格式 YYYY-MM-DDTHH:mm */
export function formatDateTime(date: Date): string {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const h = String(date.getHours()).padStart(2, "0")
  const mi = String(date.getMinutes()).padStart(2, "0")
  return `${y}-${mo}-${d}T${h}:${mi}`
}

/** 获取周的第一天 (周一) */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** 获取月的第一天 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/** 清理函数管理器 */
export class CleanupManager {
  private fns: Array<() => void> = []
  public stopped = false

  add(fn: () => void): void {
    this.fns.push(fn)
    if ((window as any).addCleanup) {
      ;(window as any).addCleanup(fn)
    }
  }

  /** 添加事件监听器并自动注册清理 */
  listen<K extends keyof HTMLElementEventMap>(
    el: HTMLElement | Document,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    el.addEventListener(event, handler as EventListener, options)
    this.add(() => el.removeEventListener(event, handler as EventListener, options))
  }

  destroy(): void {
    this.stopped = true
    this.fns.length = 0
  }
}
