/**
 * Supabase Realtime 订阅模块 - 注释系统
 *
 * 监听 annotations 表的 INSERT/UPDATE/DELETE 变更，
 * 自动刷新当前页面的批注数据和视图。
 *
 * Supabase Free Plan 包含 Realtime（200 并发连接，2M 消息/月）。
 */

import type { SupabaseClient } from "./types"

/** Realtime 订阅返回的句柄 */
interface RealtimeSubscription {
  unsubscribe: () => void
}

/** 生成安全 channel 名，避免 slug 中特殊字符导致订阅异常 */
function buildChannelName(pageSlug: string): string {
  const safeSlug = encodeURIComponent(pageSlug || "index").replace(/%/g, "_")
  return `annotations-${safeSlug}`
}

function normalizePageSlug(input: string): string {
  let slug = input.replace(/^\/+|\/+$/g, "")
  slug = slug.replace(/\.html$/, "")
  return slug || "index"
}

/**
 * 初始化 Realtime 订阅
 *
 * 监听 annotations 表在指定 page_slug 上的变更，
 * 收到变更时调用 onDataChange 刷新视图。
 * 内置防抖：500ms 内多次变更只触发一次刷新。
 */
export function initAnnotationRealtime(
  client: SupabaseClient,
  pageSlug: string,
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
          console.error("[annotation] Realtime 刷新失败:", err)
        })
      }, 500)
    }

    const channel = client
      .channel(buildChannelName(pageSlug))
      .on(
        "postgres_changes" as any,
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "annotations",
        },
        (payload: any) => {
          const rawSlug =
            payload?.new?.page_slug ??
            payload?.old?.page_slug ??
            payload?.new?.page_path ??
            payload?.old?.page_path
          if (!rawSlug) return
          const changedSlug = normalizePageSlug(rawSlug)
          if (changedSlug !== pageSlug) return
          // 收到变更 → 防抖刷新
          debouncedRefresh()
        },
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          console.log("[annotation] Realtime 订阅已连接")
        } else if (status === "CHANNEL_ERROR") {
          console.warn("[annotation] Realtime 订阅出错，将回退到手动刷新")
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

    return { unsubscribe }
  } catch (err) {
    console.warn("[annotation] Realtime 初始化失败:", err)
    return null
  }
}
