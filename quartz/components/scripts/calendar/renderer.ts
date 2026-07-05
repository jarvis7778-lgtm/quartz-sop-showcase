/**
 * 日历视图渲染器
 * 支持：周视图、月视图、日视图
 * 并行预约横向并排显示
 */

import type { Reservation, CalendarView, LayoutReservation } from "./types"
import { escapeHtml, formatDate, getWeekStart, getMonthStart } from "./utils"
import { calculateOverlapLayout } from "./overlap"

const HOUR_HEIGHT = 40 // 每小时格子的像素高度
const DAYS_ZH = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
const MONTH_DAYS_ZH = ["一", "二", "三", "四", "五", "六", "日"]

function getReservationUserLabel(r: Reservation): string {
  const username = r.user?.username?.trim()
  if (username) return username
  if (r.user_id) return `用户 ${r.user_id.slice(0, 8)}`
  return "未知用户"
}

/** 获取今天 0 点的时间 */
function getToday(): Date {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

/** 过滤某天的预约 */
function getReservationsForDate(reservations: Reservation[], dateStr: string): Reservation[] {
  return reservations.filter((r) => {
    const start = new Date(r.start_time)
    const end = new Date(r.end_time)
    // 预约可能跨天，只要和这天有交集就算
    const dayStart = new Date(dateStr + "T00:00:00")
    const dayEnd = new Date(dateStr + "T23:59:59.999")
    return start <= dayEnd && end > dayStart
  })
}

/** 渲染单个事件块的 HTML（用于周视图和日视图） */
function renderEventBlock(
  r: LayoutReservation,
  dateStr: string,
  workStart: number,
  workEnd: number,
): string {
  const start = new Date(r.start_time)
  const end = new Date(r.end_time)

  // 按当前列日期裁剪跨天预约，避免在错误时间轴位置渲染
  const dayStart = new Date(dateStr + "T00:00:00")
  const nextDayStart = new Date(dayStart)
  nextDayStart.setDate(nextDayStart.getDate() + 1)

  const clampedStart = start < dayStart ? dayStart : start
  const clampedEnd = end > nextDayStart ? nextDayStart : end
  if (clampedStart >= clampedEnd) return ""

  const startHour = (clampedStart.getTime() - dayStart.getTime()) / (60 * 60 * 1000)
  const endHour = (clampedEnd.getTime() - dayStart.getTime()) / (60 * 60 * 1000)

  // 裁剪到工作时间范围内显示
  const displayStart = Math.max(startHour, workStart)
  const displayEnd = Math.min(endHour, workEnd)
  if (displayEnd <= displayStart) return ""

  const top = (displayStart - workStart) * HOUR_HEIGHT
  const height = Math.max((displayEnd - displayStart) * HOUR_HEIGHT, 20)

  // 并排布局：根据 column 和 totalColumns 计算水平位置
  const widthPercent = 100 / r.totalColumns
  const leftPercent = r.column * widthPercent

  return (
    `<div class="event" data-id="${r.id}" style="` +
    `top: ${top}px;` +
    `height: ${height}px;` +
    `left: ${leftPercent}%;` +
    `width: ${widthPercent}%;` +
    `background: ${r.color || "#3788d8"};` +
    `">` +
    `<div class="event-title">${escapeHtml(r.title)}</div>` +
    `<div class="event-user">${escapeHtml(getReservationUserLabel(r))}</div>` +
    (r.equipment ? `<div class="event-equip">${escapeHtml(r.equipment)}</div>` : "") +
    `<div class="resize-handle" title="拖拽调整时长"></div>` +
    `</div>`
  )
}

/**
 * 渲染一天的时间列内容（hour slots + events）
 * 在周视图和日视图中复用
 */
function renderDayColumn(
  dateStr: string,
  reservations: Reservation[],
  workStart: number,
  workEnd: number,
): string {
  let html = `<div class="day-column" data-date="${dateStr}">`

  // 小时格子
  for (let h = workStart; h < workEnd; h++) {
    html += `<div class="hour-slot" data-hour="${h}"></div>`
  }

  // 该天的预约 - 使用重叠布局算法
  const dayReservations = getReservationsForDate(reservations, dateStr)
  const layoutReservations = calculateOverlapLayout(dayReservations, dateStr)

  for (const r of layoutReservations) {
    html += renderEventBlock(r, dateStr, workStart, workEnd)
  }

  html += "</div>"
  return html
}

// ==================== 周视图 ====================

export function renderWeekView(
  reservations: Reservation[],
  currentDate: Date,
  workStart: number,
  workEnd: number,
): string {
  const weekStart = getWeekStart(currentDate)
  const today = getToday()

  let html = '<div class="week-view">'

  // 头部
  html += '<div class="week-header">'
  html += '<div class="week-header-cell"></div>'
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const isToday = date.getTime() === today.getTime()
    html += `<div class="week-header-cell ${isToday ? "today" : ""}">`
    html += `${DAYS_ZH[i]}<br>${date.getDate()}`
    html += "</div>"
  }
  html += "</div>"

  // 时间列
  html += '<div class="time-column">'
  for (let h = workStart; h < workEnd; h++) {
    html += `<div class="time-slot">${h}:00</div>`
  }
  html += "</div>"

  // 每天的列
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    html += renderDayColumn(formatDate(date), reservations, workStart, workEnd)
  }

  html += "</div>"
  return html
}

// ==================== 月视图 ====================

export function renderMonthView(reservations: Reservation[], currentDate: Date): string {
  const today = getToday()

  let html = '<div class="month-view">'

  // 头部
  for (const d of MONTH_DAYS_ZH) {
    html += `<div class="month-header-cell">${d}</div>`
  }

  // 计算第一个显示的日期
  const monthStart = getMonthStart(currentDate)
  const firstDay = new Date(monthStart)
  const dayOfWeek = firstDay.getDay()
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  firstDay.setDate(firstDay.getDate() - offset)

  // 渲染 6 周
  for (let i = 0; i < 42; i++) {
    const date = new Date(firstDay)
    date.setDate(date.getDate() + i)
    const dateStr = formatDate(date)
    const isOtherMonth = date.getMonth() !== currentDate.getMonth()
    const isToday = date.getTime() === today.getTime()

    const classes = ["month-day", isOtherMonth ? "other-month" : "", isToday ? "today" : ""]
      .filter(Boolean)
      .join(" ")

    html += `<div class="${classes}" data-date="${dateStr}">`
    html += `<div class="day-number">${date.getDate()}</div>`

    // 该天的预约
    const dayReservations = getReservationsForDate(reservations, dateStr)

    const isMobile =
      typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
    const maxShow = isMobile ? 2 : 3
    dayReservations.slice(0, maxShow).forEach((r) => {
      html += `<div class="month-event" data-id="${r.id}" style="background: ${r.color || "#3788d8"};">`
      html += `<span class="month-event-title">${escapeHtml(r.title)}</span>`
      html += `<span class="month-event-user">${escapeHtml(getReservationUserLabel(r))}</span>`
      html += "</div>"
    })

    if (dayReservations.length > maxShow) {
      html += `<div class="month-event month-event-more" style="background: var(--gray);">+${dayReservations.length - maxShow}</div>`
    }

    html += "</div>"
  }

  html += "</div>"
  return html
}

// ==================== 日视图 ====================

export function renderDayView(
  reservations: Reservation[],
  currentDate: Date,
  workStart: number,
  workEnd: number,
): string {
  const dateStr = formatDate(currentDate)
  const today = getToday()

  let html = '<div class="week-view day-view-grid">'

  // 头部
  html += '<div class="week-header">'
  html += '<div class="week-header-cell"></div>'
  const isToday = currentDate.toDateString() === today.toDateString()
  html += `<div class="week-header-cell ${isToday ? "today" : ""}">`
  html += currentDate.toLocaleDateString("zh-CN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  html += "</div>"
  html += "</div>"

  // 时间列
  html += '<div class="time-column">'
  for (let h = workStart; h < workEnd; h++) {
    html += `<div class="time-slot">${h}:00</div>`
  }
  html += "</div>"

  // 日程列
  html += renderDayColumn(dateStr, reservations, workStart, workEnd)

  html += "</div>"
  return html
}

// ==================== 范围显示文本 ====================

export function getRangeText(view: CalendarView, currentDate: Date): string {
  if (view === "week") {
    const weekStart = getWeekStart(currentDate)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return (
      weekStart.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) +
      " - " +
      weekEnd.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
    )
  } else if (view === "month") {
    return currentDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })
  } else {
    return currentDate.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
}
