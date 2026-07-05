/**
 * Supabase 客户端初始化脚本
 * 在浏览器端运行，初始化 Supabase 客户端
 */

import { createClient, SupabaseClient, User } from "@supabase/supabase-js"

declare global {
  interface Window {
    __SUPABASE_URL__: string
    __SUPABASE_ANON_KEY__: string
    supabase: SupabaseClient | null
    supabaseUser: User | null
  }
}

let supabaseClient: SupabaseClient | null = null

export function initSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient

  const url = window.__SUPABASE_URL__
  const key = window.__SUPABASE_ANON_KEY__

  if (!url || !key || url === "__SUPABASE_URL__" || key === "__SUPABASE_ANON_KEY__") {
    console.warn("Supabase 未配置")
    return null
  }

  supabaseClient = createClient(url, key)
  window.supabase = supabaseClient

  // 监听认证状态变化
  supabaseClient.auth.onAuthStateChange((event, session) => {
    window.supabaseUser = session?.user ?? null
    // 触发自定义事件，让组件可以响应
    document.dispatchEvent(
      new CustomEvent("supabase-auth-change", {
        detail: { event, user: session?.user },
      }),
    )
  })

  return supabaseClient
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient || initSupabase()
}

// 登录
export async function signInWithGitHub() {
  const supabase = getSupabase()
  if (!supabase) return

  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  })
}

// 登出
export async function signOut() {
  const supabase = getSupabase()
  if (!supabase) return

  await supabase.auth.signOut()
  window.supabaseUser = null
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  window.supabaseUser = user
  return user
}
