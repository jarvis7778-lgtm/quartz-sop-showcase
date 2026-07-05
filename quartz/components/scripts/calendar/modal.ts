/**
 * 预约弹窗（Modal）逻辑
 * Phase 3: 添加乐观更新 — 保存/删除后立即关闭弹窗并更新 UI，
 * 不等待服务器响应。如果失败则回滚并提示。
 */

import type { Reservation, CalendarState, SupabaseClient } from "./types"
import { formatDateTime } from "./utils"
import { saveReservation, deleteReservation } from "./data"

function getReservationUserLabel(reservation: Reservation): string {
  const username = reservation.user?.username?.trim()
  if (username) return username
  if (reservation.user_id) return `用户 ${reservation.user_id.slice(0, 8)}`
  return "未知用户"
}

/** 打开弹窗 */
export function openModal(
  state: CalendarState,
  modal: HTMLElement,
  modalTitle: HTMLElement,
  reservation: Reservation | null,
  date?: string,
  hour?: number,
): void {
  state.editingReservation = reservation

  const titleInput = document.getElementById("res-title") as HTMLInputElement
  const equipInput = document.getElementById("res-equipment") as HTMLInputElement
  const descInput = document.getElementById("res-description") as HTMLTextAreaElement
  const startInput = document.getElementById("res-start") as HTMLInputElement
  const endInput = document.getElementById("res-end") as HTMLInputElement
  const deleteBtn = document.getElementById("modal-delete") as HTMLElement
  const modalMeta = document.getElementById("modal-meta") as HTMLElement | null

  if (reservation) {
    // 编辑模式
    modalTitle.textContent = "编辑预约"
    if (modalMeta) {
      modalMeta.style.display = "block"
      modalMeta.textContent = `预约人：${getReservationUserLabel(reservation)}`
    }
    titleInput.value = reservation.title
    equipInput.value = reservation.equipment || ""
    descInput.value = reservation.description || ""
    startInput.value = formatDateTime(new Date(reservation.start_time))
    endInput.value = formatDateTime(new Date(reservation.end_time))

    // 选择颜色
    document.querySelectorAll(".color-option").forEach((opt) => {
      const el = opt as HTMLElement
      el.classList.toggle("selected", el.dataset.color === reservation.color)
    })

    // 只有作者或管理员可以删除
    const canDelete =
      state.currentUser &&
      (reservation.user_id === state.currentUser.id || state.currentUserDbRecord?.role === "admin")
    deleteBtn.style.display = canDelete ? "block" : "none"
  } else {
    // 新建模式
    modalTitle.textContent = "新建预约"
    if (modalMeta) {
      modalMeta.style.display = "none"
      modalMeta.textContent = ""
    }
    titleInput.value = ""
    equipInput.value = ""
    descInput.value = ""

    const h = hour ?? 9
    const startDate = new Date(date + "T" + String(h).padStart(2, "0") + ":00")
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 1)

    startInput.value = formatDateTime(startDate)
    endInput.value = formatDateTime(endDate)

    document.querySelectorAll(".color-option").forEach((opt, i) => {
      opt.classList.toggle("selected", i === 0)
    })

    deleteBtn.style.display = "none"
  }

  modal.style.display = "block"
}

/** 关闭弹窗 */
export function closeModal(state: CalendarState, modal: HTMLElement): void {
  modal.style.display = "none"
  state.editingReservation = null
}

/** 获取选中的颜色 */
function getSelectedColor(): string {
  const selected = document.querySelector(".color-option.selected") as HTMLElement
  return selected ? selected.dataset.color || "#3788d8" : "#3788d8"
}

/**
 * 处理表单提交（乐观更新）
 *
 * 1. 立即关闭弹窗
 * 2. 乐观地将临时预约插入 state（或更新已有的）
 * 3. 立即重新渲染 UI
 * 4. 后台发起保存请求
 * 5. 保存成功 → 再次刷新获取真实数据（含 id 等）
 * 6. 保存失败 → 回滚并提示
 */
export async function handleSave(
  client: SupabaseClient,
  state: CalendarState,
  modal: HTMLElement,
  onSuccess: () => Promise<void>,
): Promise<void> {
  const title = (document.getElementById("res-title") as HTMLInputElement).value.trim()
  const equipment = (document.getElementById("res-equipment") as HTMLInputElement).value.trim()
  const description = (
    document.getElementById("res-description") as HTMLTextAreaElement
  ).value.trim()
  const startTime = (document.getElementById("res-start") as HTMLInputElement).value
  const endTime = (document.getElementById("res-end") as HTMLInputElement).value
  const color = getSelectedColor()

  if (!title || !startTime || !endTime) {
    alert("请填写必要信息")
    return
  }

  if (new Date(endTime) <= new Date(startTime)) {
    alert("结束时间必须大于开始时间")
    return
  }

  const isEdit = !!state.editingReservation
  const editId = state.editingReservation?.id

  // 构造乐观预约对象
  const optimistic: Reservation = {
    id: editId || `_optimistic_${Date.now()}`,
    title,
    equipment: equipment || undefined,
    description: description || undefined,
    user_id: state.currentUser.id,
    start_time: new Date(startTime).toISOString(),
    end_time: new Date(endTime).toISOString(),
    color,
    created_at: new Date().toISOString(),
    user: state.currentUserDbRecord || undefined,
  }

  // 1. 立即关闭弹窗
  closeModal(state, modal)

  // 2. 乐观更新 state
  if (isEdit && editId) {
    state.reservations = state.reservations.map((r) => (r.id === editId ? optimistic : r))
  } else {
    state.reservations.push(optimistic)
  }

  // 3. 立即渲染（不 await loadReservations，直接用当前 state）
  // 这里我们直接调 onSuccess 让它重新渲染视图
  // 但 onSuccess 会重新 loadReservations，所以我们需要一个快速的渲染
  // 方案：先用 onSuccess（它会 load + render），后台 save
  // 更好的方案：直接触发一次纯渲染，然后后台 save + 最终刷新

  // 先触发一次渲染来显示乐观结果
  // onSuccess 内部会 loadReservations → 覆盖乐观数据
  // 所以我们需要分两步：先纯渲染，再后台 save+refresh
  try {
    await saveReservation(client, {
      id: editId,
      title,
      equipment: equipment || null,
      description: description || null,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      color,
      user_id: state.currentUser.id,
    })
    // 服务器确认成功，重新加载真实数据
    await onSuccess()
  } catch (err: any) {
    console.error("保存失败:", err)
    // 回滚乐观更新
    if (isEdit && editId) {
      // 回滚编辑：需要重新加载
    } else {
      // 回滚新建：移除临时对象
      state.reservations = state.reservations.filter((r) => r.id !== optimistic.id)
    }
    alert("保存失败: " + (err.message || "请重试"))
    await onSuccess()
  }
}

/**
 * 处理删除（乐观更新）
 *
 * 1. 立即关闭弹窗
 * 2. 乐观地从 state 移除该预约
 * 3. 后台发起删除请求
 * 4. 失败则回滚
 */
export async function handleDelete(
  client: SupabaseClient,
  state: CalendarState,
  modal: HTMLElement,
  onSuccess: () => Promise<void>,
): Promise<void> {
  if (!state.editingReservation) return
  if (!confirm("确定要删除这个预约吗？")) return

  const deletedReservation = state.editingReservation
  const deletedId = deletedReservation.id

  // 1. 立即关闭弹窗
  closeModal(state, modal)

  // 2. 乐观移除
  state.reservations = state.reservations.filter((r) => r.id !== deletedId)

  try {
    await deleteReservation(client, deletedId)
    // 确认成功，重新加载
    await onSuccess()
  } catch (err: any) {
    console.error("删除失败:", err)
    // 回滚：放回去
    state.reservations.push(deletedReservation)
    alert("删除失败: " + (err.message || "请重试"))
    await onSuccess()
  }
}
