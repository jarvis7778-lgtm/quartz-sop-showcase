/**
 * 拖拽交互模块
 * 支持：
 * 1. 拖拽创建新预约（在日/周视图的空白时间格上拖动）
 * 2. 拖拽调整预约时长（拖动已有预约底部的 resize 手柄）
 * 3. 移动端触摸支持（长按 300ms 触发拖拽创建，touch resize 手柄）
 *
 * 所有操作以 15 分钟为最小单位对齐（snap to grid）。
 */

import type { CalendarState, Reservation, SupabaseClient } from "./types"
import type { CleanupManager } from "./utils"
import { formatDateTime } from "./utils"
import { saveReservation } from "./data"

const HOUR_HEIGHT = 40 // 与 renderer.ts 保持一致
const SNAP_MINUTES = 15
const MIN_DRAG_DISTANCE = 5 // 像素，区分点击和拖拽
const LONG_PRESS_MS = 300 // 移动端长按阈值

// ==================== 类型 ====================

interface DragCreateState {
  type: "create"
  column: HTMLElement
  date: string
  startMinute: number
  endMinute: number
  preview: HTMLElement
}

interface DragResizeState {
  type: "resize"
  reservation: Reservation
  column: HTMLElement
  eventEl: HTMLElement
  originalEndMinute: number
  currentEndMinute: number
}

type DragState = DragCreateState | DragResizeState | null

// ==================== 工具函数 ====================

function snapToGrid(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES
}

function getMinuteFromY(y: number, column: HTMLElement, workStart: number): number {
  const rect = column.getBoundingClientRect()
  const relativeY = y - rect.top
  const totalMinutes = (relativeY / HOUR_HEIGHT) * 60
  return snapToGrid(workStart * 60 + totalMinutes)
}

function createPreview(column: HTMLElement): HTMLElement {
  const preview = document.createElement("div")
  preview.className = "drag-preview"
  column.appendChild(preview)
  return preview
}

function updatePreviewPosition(
  preview: HTMLElement,
  startMinute: number,
  endMinute: number,
  workStart: number,
): void {
  const top = ((startMinute - workStart * 60) / 60) * HOUR_HEIGHT
  const height = ((endMinute - startMinute) / 60) * HOUR_HEIGHT
  preview.style.top = `${top}px`
  preview.style.height = `${Math.max(height, (SNAP_MINUTES / 60) * HOUR_HEIGHT)}px`
}

function timeLabel(startMinute: number, endMinute: number): string {
  const sh = Math.floor(startMinute / 60)
  const sm = startMinute % 60
  const eh = Math.floor(endMinute / 60)
  const em = endMinute % 60
  return `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")} - ${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`
}

/** 从 Mouse 或 Touch 事件获取 clientY */
function getClientY(e: MouseEvent | TouchEvent): number {
  if ("touches" in e) {
    return e.touches.length > 0 ? e.touches[0].clientY : (e as any).changedTouches[0].clientY
  }
  return e.clientY
}

// ==================== 主入口 ====================

/**
 * 初始化拖拽系统（鼠标 + 触摸）
 * 在每次视图渲染完成后调用
 */
export function initDragSystem(
  state: CalendarState,
  client: SupabaseClient,
  calContainer: HTMLElement,
  modal: HTMLElement,
  modalTitle: HTMLElement,
  cleanup: CleanupManager,
  renderCurrentView: () => Promise<void>,
): void {
  // 仅在日视图和周视图启用
  if (state.currentView === "month") return

  let dragState: DragState = null

  // 拖拽结束后抑制下一次 click 事件
  let suppressNextClick = false
  const clickSuppressor = (e: Event) => {
    if (suppressNextClick) {
      e.stopPropagation()
      e.preventDefault()
      suppressNextClick = false
    }
  }
  calContainer.addEventListener("click", clickSuppressor, true)
  cleanup.add(() => calContainer.removeEventListener("click", clickSuppressor, true))

  // ================ 拖拽创建 ================

  const dayColumns = calContainer.querySelectorAll<HTMLElement>(".day-column")

  dayColumns.forEach((column) => {
    // ---------- 鼠标拖拽创建 ----------
    let mouseDownY = 0
    let isDragging = false

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      if (target.closest(".event") || target.classList.contains("resize-handle")) return
      if (!state.currentUser) return

      mouseDownY = e.clientY
      isDragging = false

      const date = column.dataset.date!
      const minute = getMinuteFromY(e.clientY, column, state.workStart)
      const pendingStart = minute

      const onMouseMove = (e: MouseEvent) => {
        const delta = Math.abs(e.clientY - mouseDownY)
        if (!isDragging && delta > MIN_DRAG_DISTANCE) {
          isDragging = true
          document.body.classList.add("drag-active")
          const preview = createPreview(column)
          dragState = {
            type: "create",
            column,
            date,
            startMinute: pendingStart,
            endMinute: pendingStart + SNAP_MINUTES,
            preview,
          }
          e.preventDefault()
        }
        if (isDragging && dragState?.type === "create") {
          const cur = getMinuteFromY(e.clientY, column, state.workStart)
          const actualStart = Math.min(pendingStart, cur)
          const actualEnd = Math.max(pendingStart, cur)
          const finalEnd = actualEnd <= actualStart ? actualStart + SNAP_MINUTES : actualEnd
          dragState.startMinute = actualStart
          dragState.endMinute = finalEnd
          updatePreviewPosition(dragState.preview, actualStart, finalEnd, state.workStart)
          dragState.preview.textContent = timeLabel(actualStart, finalEnd)
        }
      }

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
        document.body.classList.remove("drag-active")
        if (isDragging && dragState?.type === "create") {
          suppressNextClick = true
          const ds = dragState
          ds.preview.remove()
          openModalWithTime(state, modal, modalTitle, ds.date, ds.startMinute, ds.endMinute)
          dragState = null
        }
        isDragging = false
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    }

    column.addEventListener("mousedown", onMouseDown)
    cleanup.add(() => column.removeEventListener("mousedown", onMouseDown))

    // ---------- 触摸拖拽创建（长按触发） ----------
    let longPressTimer: ReturnType<typeof setTimeout> | null = null
    let touchDragging = false
    let touchStartY = 0

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(".event") || target.classList.contains("resize-handle")) return
      if (!state.currentUser) return

      touchStartY = getClientY(e)
      touchDragging = false

      const date = column.dataset.date!
      const minute = getMinuteFromY(touchStartY, column, state.workStart)
      const pendingStart = minute

      // 长按计时器
      longPressTimer = setTimeout(() => {
        longPressTimer = null
        touchDragging = true
        document.body.classList.add("drag-active")

        const preview = createPreview(column)
        dragState = {
          type: "create",
          column,
          date,
          startMinute: pendingStart,
          endMinute: pendingStart + SNAP_MINUTES,
          preview,
        }
        updatePreviewPosition(preview, pendingStart, pendingStart + SNAP_MINUTES, state.workStart)
        preview.textContent = timeLabel(pendingStart, pendingStart + SNAP_MINUTES)

        // 触觉反馈
        if (navigator.vibrate) navigator.vibrate(50)
      }, LONG_PRESS_MS)
    }

    const onTouchMove = (e: TouchEvent) => {
      const y = getClientY(e)

      // 如果还在等长按，但移动了太多 → 取消长按（是普通滚动）
      if (longPressTimer && Math.abs(y - touchStartY) > MIN_DRAG_DISTANCE) {
        clearTimeout(longPressTimer)
        longPressTimer = null
        return
      }

      if (!touchDragging || dragState?.type !== "create") return

      e.preventDefault() // 阻止滚动

      const cur = getMinuteFromY(y, column, state.workStart)
      const pendingStart = dragState.startMinute
      // 在触摸模式下 startMinute 不变（它是长按时确定的起点）
      // 但我们需要用原始起点来计算，所以从 dragState 里取初始值
      const actualStart = Math.min(pendingStart, cur)
      const actualEnd = Math.max(pendingStart, cur)
      const finalEnd = actualEnd <= actualStart ? actualStart + SNAP_MINUTES : actualEnd
      // 注意：触摸模式下不应该改变 startMinute 的基准点
      // 用临时变量更新预览
      updatePreviewPosition(dragState.preview, actualStart, finalEnd, state.workStart)
      dragState.preview.textContent = timeLabel(actualStart, finalEnd)
      // 更新 dragState 用于 touchEnd
      dragState.startMinute = actualStart
      dragState.endMinute = finalEnd
    }

    const onTouchEnd = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
      document.body.classList.remove("drag-active")

      if (touchDragging && dragState?.type === "create") {
        const ds = dragState
        ds.preview.remove()
        dragState = null
        touchDragging = false
        openModalWithTime(state, modal, modalTitle, ds.date, ds.startMinute, ds.endMinute)
      }
      touchDragging = false
    }

    column.addEventListener("touchstart", onTouchStart, { passive: true })
    column.addEventListener("touchmove", onTouchMove, { passive: false })
    column.addEventListener("touchend", onTouchEnd)
    column.addEventListener("touchcancel", onTouchEnd)
    cleanup.add(() => {
      column.removeEventListener("touchstart", onTouchStart)
      column.removeEventListener("touchmove", onTouchMove)
      column.removeEventListener("touchend", onTouchEnd)
      column.removeEventListener("touchcancel", onTouchEnd)
    })
  })

  // ================ 拖拽调整时长 (Resize) ================

  const resizeHandles = calContainer.querySelectorAll<HTMLElement>(".resize-handle")

  resizeHandles.forEach((handle) => {
    // ---------- 通用 resize 逻辑 ----------
    function startResize(
      eventEl: HTMLElement,
      reservation: Reservation,
      column: HTMLElement,
    ): boolean {
      const canEdit =
        reservation.user_id === state.currentUser?.id || state.currentUserDbRecord?.role === "admin"
      if (!canEdit) return false

      const end = new Date(reservation.end_time)
      const originalEndMinute = end.getHours() * 60 + end.getMinutes()

      dragState = {
        type: "resize",
        reservation,
        column,
        eventEl,
        originalEndMinute,
        currentEndMinute: originalEndMinute,
      }

      eventEl.classList.add("resizing")
      document.body.classList.add("drag-active")
      return true
    }

    function moveResize(y: number): void {
      if (dragState?.type !== "resize") return
      const column = dragState.column
      const reservation = dragState.reservation
      const eventEl = dragState.eventEl

      const minute = getMinuteFromY(y, column, state.workStart)
      const start = new Date(reservation.start_time)
      const startMinute = start.getHours() * 60 + start.getMinutes()
      const newEnd = Math.max(minute, startMinute + SNAP_MINUTES)
      dragState.currentEndMinute = newEnd

      const startHour = startMinute / 60
      const endHour = newEnd / 60
      const displayStart = Math.max(startHour, state.workStart)
      const height = Math.max(
        (endHour - displayStart) * HOUR_HEIGHT,
        (SNAP_MINUTES / 60) * HOUR_HEIGHT,
      )
      eventEl.style.height = `${height}px`

      let label = eventEl.querySelector(".resize-time-label") as HTMLElement
      if (!label) {
        label = document.createElement("div")
        label.className = "resize-time-label"
        eventEl.appendChild(label)
      }
      label.textContent = timeLabel(startMinute, newEnd)
    }

    async function endResize(): Promise<void> {
      document.body.classList.remove("drag-active")
      if (dragState?.type !== "resize") return

      const ds = dragState
      dragState = null
      ds.eventEl.classList.remove("resizing")

      if (ds.currentEndMinute === ds.originalEndMinute) return

      const endDate = new Date(ds.reservation.start_time)
      endDate.setHours(Math.floor(ds.currentEndMinute / 60))
      endDate.setMinutes(ds.currentEndMinute % 60)
      endDate.setSeconds(0, 0)

      try {
        await saveReservation(client, {
          id: ds.reservation.id,
          title: ds.reservation.title,
          equipment: ds.reservation.equipment || null,
          description: ds.reservation.description || null,
          start_time: ds.reservation.start_time,
          end_time: endDate.toISOString(),
          color: ds.reservation.color,
          user_id: ds.reservation.user_id,
        })
        await renderCurrentView()
      } catch (err: any) {
        console.error("调整时间失败:", err)
        alert("调整失败: " + (err.message || "请重试"))
        await renderCurrentView()
      }
    }

    // ---------- 鼠标 resize ----------
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (!state.currentUser) return
      e.preventDefault()
      e.stopPropagation()

      const eventEl = handle.closest(".event") as HTMLElement
      if (!eventEl) return
      const id = eventEl.dataset.id
      const reservation = state.reservations.find((r) => r.id === id)
      if (!reservation) return
      const column = eventEl.closest(".day-column") as HTMLElement
      if (!column) return

      if (!startResize(eventEl, reservation, column)) return

      const onMouseMove = (e: MouseEvent) => moveResize(e.clientY)
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
        endResize()
      }
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    }

    handle.addEventListener("mousedown", onMouseDown)
    cleanup.add(() => handle.removeEventListener("mousedown", onMouseDown))

    // ---------- 触摸 resize ----------
    const onTouchStart = (e: TouchEvent) => {
      if (!state.currentUser) return
      e.preventDefault()
      e.stopPropagation()

      const eventEl = handle.closest(".event") as HTMLElement
      if (!eventEl) return
      const id = eventEl.dataset.id
      const reservation = state.reservations.find((r) => r.id === id)
      if (!reservation) return
      const column = eventEl.closest(".day-column") as HTMLElement
      if (!column) return

      if (!startResize(eventEl, reservation, column)) return

      if (navigator.vibrate) navigator.vibrate(30)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (dragState?.type !== "resize") return
      e.preventDefault()
      moveResize(getClientY(e))
    }

    const onTouchEnd = () => {
      if (dragState?.type !== "resize") return
      endResize()
    }

    handle.addEventListener("touchstart", onTouchStart, { passive: false })
    handle.addEventListener("touchmove", onTouchMove, { passive: false })
    handle.addEventListener("touchend", onTouchEnd)
    handle.addEventListener("touchcancel", onTouchEnd)
    cleanup.add(() => {
      handle.removeEventListener("touchstart", onTouchStart)
      handle.removeEventListener("touchmove", onTouchMove)
      handle.removeEventListener("touchend", onTouchEnd)
      handle.removeEventListener("touchcancel", onTouchEnd)
    })
  })
}

// ==================== 辅助：打开弹窗并预填拖拽选中的时间 ====================

function openModalWithTime(
  state: CalendarState,
  modal: HTMLElement,
  modalTitle: HTMLElement,
  date: string,
  startMinute: number,
  endMinute: number,
): void {
  state.editingReservation = null

  const titleInput = document.getElementById("res-title") as HTMLInputElement
  const equipInput = document.getElementById("res-equipment") as HTMLInputElement
  const descInput = document.getElementById("res-description") as HTMLTextAreaElement
  const startInput = document.getElementById("res-start") as HTMLInputElement
  const endInput = document.getElementById("res-end") as HTMLInputElement
  const deleteBtn = document.getElementById("modal-delete") as HTMLElement

  modalTitle.textContent = "新建预约"
  titleInput.value = ""
  equipInput.value = ""
  descInput.value = ""

  const startDate = new Date(date + "T00:00:00")
  startDate.setHours(Math.floor(startMinute / 60))
  startDate.setMinutes(startMinute % 60)

  const endDate = new Date(date + "T00:00:00")
  endDate.setHours(Math.floor(endMinute / 60))
  endDate.setMinutes(endMinute % 60)

  startInput.value = formatDateTime(startDate)
  endInput.value = formatDateTime(endDate)

  document.querySelectorAll(".color-option").forEach((opt, i) => {
    opt.classList.toggle("selected", i === 0)
  })

  deleteBtn.style.display = "none"
  modal.style.display = "block"
}
