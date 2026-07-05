/**
 * 并行预约重叠计算算法
 *
 * 同一时段有多个预约时，计算每个预约应该占据的列和总列数，
 * 实现类似 Google Calendar 的横向并排显示。
 *
 * 算法：贪心列分配
 * 1. 按 start_time 排序
 * 2. 维护活跃列数组，将每个预约分配到第一个空闲列
 * 3. 同一重叠组共享 totalColumns 值
 */

import type { Reservation, LayoutReservation } from "./types"

interface TimeSlot {
  start: number // 分钟时间戳（当天内）
  end: number
  reservation: Reservation
}

/** 将预约转换为当天内的分钟时间戳 */
function toMinuteSlot(r: Reservation, dateStr: string): TimeSlot | null {
  const start = new Date(r.start_time)
  const end = new Date(r.end_time)

  // 预约可能跨天，需要裁剪到当天范围
  const dayStart = new Date(dateStr + "T00:00:00")
  const dayEnd = new Date(dateStr + "T23:59:59")

  const clampedStart = start < dayStart ? dayStart : start
  const clampedEnd = end > dayEnd ? dayEnd : end

  if (clampedStart >= clampedEnd) return null

  return {
    start: clampedStart.getHours() * 60 + clampedStart.getMinutes(),
    end: clampedEnd.getHours() * 60 + clampedEnd.getMinutes(),
    reservation: r,
  }
}

/**
 * 为一天的预约计算布局位置
 * @param reservations 该天的所有预约
 * @param dateStr 日期字符串 YYYY-MM-DD
 * @returns 带布局信息的预约数组
 */
export function calculateOverlapLayout(
  reservations: Reservation[],
  dateStr: string,
): LayoutReservation[] {
  if (reservations.length === 0) return []

  // 转换为分钟时间戳并过滤无效的
  const slots: TimeSlot[] = reservations
    .map((r) => toMinuteSlot(r, dateStr))
    .filter((s): s is TimeSlot => s !== null)

  // 按开始时间排序，开始时间相同则按结束时间排序
  slots.sort((a, b) => a.start - b.start || a.end - b.end)

  // 贪心分配列：columns[i] 存储第 i 列的最晚结束时间
  const columnEnds: number[] = []
  const assignments: Map<string, number> = new Map() // reservation.id -> column

  for (const slot of slots) {
    // 找到第一个空闲的列（该列的上一个预约已经结束）
    let assignedCol = -1
    for (let c = 0; c < columnEnds.length; c++) {
      if (columnEnds[c] <= slot.start) {
        assignedCol = c
        break
      }
    }

    if (assignedCol === -1) {
      // 没有空闲列，新增一列
      assignedCol = columnEnds.length
      columnEnds.push(0)
    }

    columnEnds[assignedCol] = slot.end
    assignments.set(slot.reservation.id, assignedCol)
  }

  // 计算每个重叠组的 totalColumns
  // 通过 DFS/union-find 方式：相互重叠的预约属于同一组
  const groups: TimeSlot[][] = []
  const visited = new Set<number>()

  for (let i = 0; i < slots.length; i++) {
    if (visited.has(i)) continue

    const group: TimeSlot[] = [slots[i]]
    visited.add(i)

    // 收集所有与当前组有重叠的预约
    let j = i + 1
    let groupEnd = slots[i].end
    while (j < slots.length) {
      if (slots[j].start < groupEnd) {
        group.push(slots[j])
        visited.add(j)
        groupEnd = Math.max(groupEnd, slots[j].end)
      }
      j++
    }

    groups.push(group)
  }

  // 为每个组计算 totalColumns（该组使用的最大列数）
  const totalColumnsMap: Map<string, number> = new Map()
  for (const group of groups) {
    let maxCol = 0
    for (const slot of group) {
      const col = assignments.get(slot.reservation.id) || 0
      maxCol = Math.max(maxCol, col)
    }
    const totalCols = maxCol + 1
    for (const slot of group) {
      totalColumnsMap.set(slot.reservation.id, totalCols)
    }
  }

  // 组装结果
  return reservations.map((r) => ({
    ...r,
    column: assignments.get(r.id) || 0,
    totalColumns: totalColumnsMap.get(r.id) || 1,
  }))
}
