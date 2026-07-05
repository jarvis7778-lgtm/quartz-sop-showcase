import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

interface AuthOptions {
  /** 登录按钮文字 */
  loginText?: string
  /** 登出按钮文字 */
  logoutText?: string
}

const defaultOptions: AuthOptions = {
  loginText: "GitHub 登录",
  logoutText: "登出",
}

export default ((userOpts?: AuthOptions) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Auth: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "auth-container")} id="auth-container">
        {/* 未登录状态 */}
        <button id="auth-login-btn" class="auth-btn auth-login" style={{ display: "none" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span>{opts.loginText}</span>
        </button>

        {/* 已登录状态 */}
        <div id="auth-user-info" class="auth-user-info" style={{ display: "none" }}>
          <img id="auth-avatar" class="auth-avatar" src="" alt="avatar" />
          <span id="auth-username" class="auth-username"></span>
          <button id="auth-logout-btn" class="auth-btn auth-logout">
            {opts.logoutText}
          </button>
        </div>

        {/* 加载状态 */}
        <div id="auth-loading" class="auth-loading">
          <span>加载中...</span>
        </div>
      </div>
    )
  }

  Auth.css = `
    .auth-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .auth-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      border: 1px solid var(--gray);
      border-radius: 4px;
      background: var(--light);
      color: var(--dark);
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }
    
    .auth-btn:hover {
      background: var(--lightgray);
      border-color: var(--secondary);
    }
    
    .auth-login svg {
      width: 16px;
      height: 16px;
    }
    
    .auth-user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .auth-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid var(--lightgray);
    }
    
    .auth-username {
      font-size: 0.85rem;
      color: var(--dark);
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .auth-logout {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
    
    .auth-loading {
      font-size: 0.85rem;
      color: var(--gray);
    }
  `

  Auth.afterDOMLoaded = `
    (async function() {
      const container = document.getElementById('auth-container')
      const loginBtn = document.getElementById('auth-login-btn')
      const userInfo = document.getElementById('auth-user-info')
      const avatar = document.getElementById('auth-avatar')
      const username = document.getElementById('auth-username')
      const logoutBtn = document.getElementById('auth-logout-btn')
      const loading = document.getElementById('auth-loading')
      
      if (!container) return
      
      // 检查 Supabase 是否可用
      const supabaseUrl = window.__SUPABASE_URL__
      const supabaseKey = window.__SUPABASE_ANON_KEY__
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === '__SUPABASE_URL__' || 
          supabaseKey === '__SUPABASE_ANON_KEY__') {
        loading.style.display = 'none'
        loginBtn.style.display = 'none'
        console.log('Supabase 未配置')
        return
      }
      
      async function ensureSupabaseClient() {
        if (window.supabaseClient) {
          return window.supabaseClient
        }

        if (!window.__supabaseScriptPromise) {
          window.__supabaseScriptPromise = new Promise((resolve, reject) => {
            if (window.supabase?.createClient) {
              resolve(window.supabase)
              return
            }

            const existingScript = document.querySelector('script[data-supabase-cdn="true"]')
            if (existingScript) {
              existingScript.addEventListener('load', () => resolve(window.supabase), { once: true })
              existingScript.addEventListener('error', reject, { once: true })
              return
            }

            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
            script.async = true
            script.dataset.supabaseCdn = 'true'
            script.onload = () => resolve(window.supabase)
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        if (!window.__supabaseClientPromise) {
          window.__supabaseClientPromise = window.__supabaseScriptPromise
            .then((supabaseLib) => {
              const createClient = supabaseLib?.createClient
              if (!createClient) {
                throw new Error('Supabase SDK 加载失败')
              }

              if (!window.supabaseClient) {
                window.supabaseClient = createClient(supabaseUrl, supabaseKey)
              }

              return window.supabaseClient
            })
            .catch((err) => {
              window.__supabaseClientPromise = null
              throw err
            })
        }

        return window.__supabaseClientPromise
      }

      async function getCurrentUser(client) {
        try {
          const { data: { session } } = await client.auth.getSession()
          if (session?.user) {
            return session.user
          }

          const { data: { user } } = await client.auth.getUser()
          return user || null
        } catch (err) {
          console.error('获取登录状态失败:', err)
          return null
        }
      }
      
      // 更新 UI 函数
      function updateUI(user) {
        loading.style.display = 'none'
        if (user) {
          loginBtn.style.display = 'none'
          userInfo.style.display = 'flex'
          avatar.src = user.user_metadata?.avatar_url || ''
          username.textContent = user.user_metadata?.user_name || user.email || '用户'
        } else {
          loginBtn.style.display = 'flex'
          userInfo.style.display = 'none'
        }
      }
      
      let client = null

      try {
        client = await ensureSupabaseClient()
      } catch (err) {
        console.error('初始化 Supabase 失败:', err)
        loading.textContent = '登录加载失败，请刷新重试'
        return
      }

      // 检查当前登录状态
      updateUI(await getCurrentUser(client))
      
      // 监听认证状态变化
      client.auth.onAuthStateChange((event, session) => {
        updateUI(session?.user || null)
      })
      
      // 登录按钮点击
      loginBtn.addEventListener('click', async () => {
        await client.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: window.location.origin,
          },
        })
      })
      
      // 登出按钮点击
      logoutBtn.addEventListener('click', async () => {
        await client.auth.signOut()
      })
    })()
  `

  return Auth
}) satisfies QuartzComponentConstructor<AuthOptions>
