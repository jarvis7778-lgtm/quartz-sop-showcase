/**
 * Supabase 客户端配置
 *
 * 使用前需要在环境变量中设置：
 * - SUPABASE_URL: Supabase 项目 URL
 * - SUPABASE_ANON_KEY: Supabase 匿名公钥
 */

// 这些值在构建时会被替换，或者在运行时从 window 读取
export const SUPABASE_URL = "__SUPABASE_URL__"
export const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__"

// 用于前端的 Supabase 配置
export interface SupabaseConfig {
  url: string
  anonKey: string
}

// 获取 Supabase 配置（客户端使用）
export function getSupabaseConfig(): SupabaseConfig | null {
  // 检查是否已配置
  if (SUPABASE_URL === "__SUPABASE_URL__" || SUPABASE_ANON_KEY === "__SUPABASE_ANON_KEY__") {
    console.warn("Supabase 尚未配置，请设置环境变量")
    return null
  }

  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  }
}

// 数据库表类型定义
export interface User {
  id: string
  github_id: string
  username: string
  email?: string
  avatar_url?: string
  role: "admin" | "member"
  created_at: string
}

export interface Annotation {
  id: string
  page_path: string
  paragraph_id: string
  text_selection?: string
  content: string
  author_id: string
  created_at: string
  // 联表查询时包含
  author?: User
}

export interface Comment {
  id: string
  page_path: string
  content: string
  author_id: string
  parent_id?: string
  likes: number
  created_at: string
  // 联表查询时包含
  author?: User
  replies?: Comment[]
}

export interface Reservation {
  id: string
  title: string
  description?: string
  equipment?: string
  user_id: string
  start_time: string
  end_time: string
  color: string
  created_at: string
  // 联表查询时包含
  user?: User
}
