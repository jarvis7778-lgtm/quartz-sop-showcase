/**
 * Supabase Realtime 订阅模块
 *
 * 监听 reservations 表的 INSERT/UPDATE/DELETE 变更，
 * 自动刷新当前日历视图。
 *
 * Supabase Free Plan 包含 Realtime（200 并发连接，2M 消息/月）。
 */

import type { SupabaseClient } from "./types"
import type { CleanupManager } from "./utils"

/** Realtime 订阅返回的句柄 */
interface RealtimeSubscription {
  unsubscribe: () => void
}

/**
 * 初始化 Realtime 订阅
 *
 * 监听 reservations 表的所有变更，收到变更时调用 onDataChange 刷新视图。
 * 内置防抖：短时间内多次变更只触发一次刷新。
 */
export function initRealtime(
  client: SupabaseClient,
  cleanup: CleanupManager,
  onDataChange: () => Promise<void>,
): RealtimeSubscription | null {
  try {
    // 防抖：500ms 内多次事件只触发一次刷新
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const debouncedRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        onDataChange().catch((err) => {
          console.error("Realtime 刷新失败:", err)
        })
      }, 500)
    }

    const channel = client
      .channel("reservations-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "reservations",
        },
        (_payload: any) => {
          // 收到变更 → 防抖刷新
          debouncedRefresh()
        },
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          console.log("[Calendar] Realtime 订阅已连接")
        } else if (status === "CHANNEL_ERROR") {
          console.warn("[Calendar] Realtime 订阅出错，将回退到手动刷新")
        }
      })

    const unsubscribe = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      try {
        channel.unsubscribe()
      } catch {
        // 忽略取消订阅时的错误
      }
    }

    cleanup.add(unsubscribe)

    return { unsubscribe }
  } catch (err) {
    console.warn("[Calendar] Realtime 初始化失败，将使用手动刷新模式:", err)
    return null
  }
}
