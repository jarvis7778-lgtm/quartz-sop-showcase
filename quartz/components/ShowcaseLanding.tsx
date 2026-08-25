import { QuartzComponent, QuartzComponentProps } from "./types"
import { themeRegistry } from "../../themes"

const workflowCards = [
  {
    index: "01",
    title: "新成员入职",
    description: "把第一周需要完成的账号、环境与协作约定整理成可勾选清单。",
    href: "/sop/example-onboarding",
    meta: "8 个步骤 · 约 12 分钟",
  },
  {
    index: "02",
    title: "文档审核",
    description: "用统一的提交、复核、批准和发布门槛减少口头确认与遗漏。",
    href: "/sop/example-document-review",
    meta: "4 个阶段 · 双人复核",
  },
  {
    index: "03",
    title: "共享资源使用",
    description: "把预约、交接、异常记录与归还检查放进一条清晰的操作路径。",
    href: "/sop/example-shared-resource",
    meta: "5 个步骤 · 带检查表",
  },
]

const capabilities = [
  ["Markdown 原生", "直接使用 Markdown 或 Obsidian 写作，内容与网站代码保持解耦。"],
  ["一次静态构建", "无需数据库即可获得搜索、目录、反向链接、RSS 与站点地图。"],
  ["八套视觉语言", "主题不是简单换色，而是改变文档、任务、终端与笔记本的界面隐喻。"],
  ["自动发布", "提交内容后由持续集成完成检查、构建与上线，发布过程可追踪。"],
]

const ShowcaseLanding: QuartzComponent = (_props: QuartzComponentProps) => {
  const repositoryUrl =
    process.env.TEMPLATE_REPOSITORY_URL ?? "https://github.com/jarvis7778-lgtm/quartz-sop-template"

  return (
    <article class="showcase-home" aria-label="Cfour SOP Gallery 首页">
      <header class="showcase-nav">
        <a class="showcase-brand" href="/" aria-label="Cfour SOP Gallery 首页">
          <span class="showcase-brand-mark" aria-hidden="true">
            C4
          </span>
          <span>
            <strong>Cfour SOP</strong>
            <small>Gallery</small>
          </span>
        </a>
        <nav aria-label="首页导航">
          <a href="#themes">主题</a>
          <a href="#workflows">示例</a>
          <a href="#publish">发布</a>
          {repositoryUrl ? (
            <a class="showcase-nav-cta" href={repositoryUrl} target="_blank" rel="noreferrer">
              GitHub 模板 ↗
            </a>
          ) : (
            <a class="showcase-nav-cta" href="#github-template">
              GitHub 模板
            </a>
          )}
        </nav>
      </header>

      <main>
        <section class="showcase-hero" aria-labelledby="showcase-title">
          <div class="showcase-hero-copy">
            <p class="showcase-eyebrow">
              <span aria-hidden="true" />
              为真实流程而做的静态知识站
            </p>
            <h1 id="showcase-title">
              把流程写成
              <em>任何人都能执行</em>
              的页面。
            </h1>
            <p class="showcase-lede">
              一个基于 Quartz 的 SOP 展示馆。用 Markdown 管理内容，用八套完整主题表达不同团队气质，
              再把同一份知识可靠地发布到任何静态托管平台。
            </p>
            <div class="showcase-actions">
              <a class="showcase-button primary" href="/sop/">
                浏览 SOP 示例 <span aria-hidden="true">→</span>
              </a>
              <a class="showcase-button secondary" href="#themes">
                体验八套主题
              </a>
            </div>
            <dl class="showcase-stats" aria-label="项目摘要">
              <div>
                <dt>8</dt>
                <dd>完整主题</dd>
              </div>
              <div>
                <dt>0</dt>
                <dd>数据库依赖</dd>
              </div>
              <div>
                <dt>1</dt>
                <dd>份内容源</dd>
              </div>
            </dl>
          </div>

          <div class="showcase-product" aria-label="SOP 页面界面示意">
            <div class="showcase-window-bar">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <p>docs / onboarding / first-week.md</p>
            </div>
            <div class="showcase-window-body">
              <aside>
                <p class="showcase-window-label">WORKSPACE</p>
                <strong>Team Handbook</strong>
                <ul>
                  <li class="active">入职流程</li>
                  <li>研发规范</li>
                  <li>发布检查</li>
                  <li>共享资源</li>
                </ul>
              </aside>
              <div class="showcase-document">
                <div class="showcase-doc-kicker">ONBOARDING · UPDATED TODAY</div>
                <h2>新成员第一周</h2>
                <p>完成下面的步骤后，你就具备独立参与协作的全部条件。</p>
                <ol>
                  <li class="done">
                    <span aria-hidden="true">✓</span>
                    <div>
                      <strong>确认账号与访问范围</strong>
                      <small>只申请当前角色真正需要的权限</small>
                    </div>
                  </li>
                  <li class="done">
                    <span aria-hidden="true">✓</span>
                    <div>
                      <strong>运行本地环境检查</strong>
                      <small>记录版本与验证结果</small>
                    </div>
                  </li>
                  <li>
                    <span aria-hidden="true">3</span>
                    <div>
                      <strong>完成第一次小提交</strong>
                      <small>由协作伙伴进行复核</small>
                    </div>
                  </li>
                </ol>
                <div class="showcase-doc-note">
                  <span aria-hidden="true">↳</span>
                  每一步都有负责人、完成条件与下一步动作。
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          class="showcase-section showcase-themes"
          id="themes"
          aria-labelledby="themes-title"
        >
          <div class="showcase-section-heading">
            <div>
              <p>THEME LAB</p>
              <h2 id="themes-title">同一份内容，八种表达方式</h2>
            </div>
            <p>点击任意主题即可立即切换整个站点。选择会保留到下一次访问，不需要重新构建。</p>
          </div>
          <div class="showcase-theme-grid">
            {themeRegistry.map((manifest, index) => {
              const colors = manifest.theme.colors.lightMode
              return (
                <button
                  type="button"
                  class="showcase-theme-card"
                  data-showcase-theme={manifest.id}
                  aria-pressed="false"
                  style={`--theme-card-bg:${colors.light};--theme-card-ink:${colors.dark};--theme-card-accent:${colors.secondary};--theme-card-muted:${colors.lightgray}`}
                >
                  <span class="showcase-theme-number">{String(index + 1).padStart(2, "0")}</span>
                  <span class="showcase-theme-preview" aria-hidden="true">
                    <i />
                    <b />
                    <em />
                  </span>
                  <strong>{manifest.label}</strong>
                  <small>{manifest.description}</small>
                  <span class="showcase-theme-state">应用主题</span>
                </button>
              )
            })}
          </div>
        </section>

        <section class="showcase-section" id="workflows" aria-labelledby="workflows-title">
          <div class="showcase-section-heading">
            <div>
              <p>REAL WORKFLOWS</p>
              <h2 id="workflows-title">先从能直接照做的示例开始</h2>
            </div>
            <p>示例内容全部脱敏，并刻意保留负责人、完成条件、异常路径和交付物。</p>
          </div>
          <div class="showcase-workflow-grid">
            {workflowCards.map((card) => (
              <a class="showcase-workflow-card" href={card.href}>
                <span class="showcase-workflow-index">{card.index}</span>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <footer>
                  <small>{card.meta}</small>
                  <span aria-hidden="true">↗</span>
                </footer>
              </a>
            ))}
          </div>
        </section>

        <section
          class="showcase-section showcase-capabilities"
          aria-labelledby="capabilities-title"
        >
          <div class="showcase-section-heading compact">
            <div>
              <p>BUILT FOR HANDOFF</p>
              <h2 id="capabilities-title">内容简单，基础设施可靠</h2>
            </div>
          </div>
          <div class="showcase-capability-list">
            {capabilities.map(([title, description], index) => (
              <article>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section class="showcase-publish" id="publish" aria-labelledby="publish-title">
          <div class="showcase-publish-copy">
            <p>SHIP THE KNOWLEDGE</p>
            <h2 id="publish-title">从 Markdown 到线上站点，只保留一条清晰路径。</h2>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>Write</strong>
                  <small>在 content/ 中编写或同步 Markdown</small>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Review</strong>
                  <small>检查内容、链接、格式与隐私边界</small>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Publish</strong>
                  <small>自动生成纯静态文件并部署</small>
                </div>
              </li>
            </ol>
          </div>
          <div class="showcase-terminal" aria-label="构建命令示例">
            <div>
              <span />
              <span />
              <span />
              <small>release.sh</small>
            </div>
            <pre>
              <code>
                <i>$</i> npm run check{"\n"}
                <b>✓</b> types and formatting{"\n"}
                <i>$</i> npm test{"\n"}
                <b>✓</b> 102 tests passed{"\n"}
                <i>$</i> npm run build{"\n"}
                <b>✓</b> static site ready
              </code>
            </pre>
          </div>
        </section>

        <section class="showcase-github" id="github-template" aria-labelledby="github-title">
          <div>
            <p>OPEN TEMPLATE</p>
            <h2 id="github-title">展示站之外，还有一份干净、可复制的 GitHub 模板。</h2>
            <span>
              展示站负责品牌与体验；模板仓库只保留通用能力、示例内容、文档和自动化发布流程。
            </span>
          </div>
          {repositoryUrl ? (
            <a href={repositoryUrl} target="_blank" rel="noreferrer">
              打开 GitHub 模板 <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span class="showcase-repo-pending">公开仓库正在连接</span>
          )}
        </section>
      </main>
    </article>
  )
}

export default ShowcaseLanding
