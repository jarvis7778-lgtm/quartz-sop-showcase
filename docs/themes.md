# 主题预设 (Theme Presets)

模板内置 **8 套**完整外观，现已采用 Obsidian 式运行时热切换架构：一次构建同时携带全部主题的颜色、字体 token 与结构样式；用户切换主题时只更新 `data-theme-preset`，**不需要重新构建或刷新页面**。亮/暗模式仍是独立维度。

每套主题位于独立目录：

```text
themes/presets/<id>/
├── theme.ts       # 类型化 manifest：名称、说明、亮/暗颜色、字体
└── theme.scss     # 结构样式，必须作用域到 body[data-theme-preset="<id>"]
```

`themes/index.ts` 只负责显式注册、校验、运行时 token 和字体请求生成。选择结果保存在 `localStorage.themePreset`，首屏脚本在正文解析前恢复，Quartz SPA 跳转后也会重新应用。

首页继续使用一份 Markdown 内容，但输出稳定的语义插槽：`hero`、`intro`、`section-heading`、`feature-list`、`start-links`、`notice`。主题应优先选择 `[data-theme-slot="..."]`，避免依赖易碎的 `nth-child`。

## 预设一览

| 预设         | 灵感来源                     | 字体 (标题/正文/代码)                         | 强调色                    | 一句话气质                         |
| ------------ | ---------------------------- | --------------------------------------------- | ------------------------- | ---------------------------------- |
| `current`    | 杂志编辑风（默认）           | Sora / Manrope / Space Mono                   | 红 `#e84a5f` + 橙         | 大胆撞色、强设计感                 |
| `notion`     | Notion 公开页面              | Inter / Inter / JetBrains Mono                | Notion 蓝 `#337ea9`       | 暖灰工作区+白色文档面              |
| `things`     | Things 3 (Obsidian 热门主题) | Plus Jakarta Sans / Inter / JetBrains Mono    | iOS 蓝 `#2e80f2`          | 零边框软填充，圆环 checkbox        |
| `anuppuccin` | AnuPpuccin / Catppuccin      | Nunito / Nunito Sans / Fira Code              | 木槿紫 `#8839ef`          | 粉彩色阶，h1–h6 各有彩色           |
| `bluetopaz`  | Blue Topaz (中文社区热门)    | Noto Serif SC / Noto Sans SC / JetBrains Mono | 黄玉蓝 `#2f6fa7` + 朱砂   | 纸墨书卷气，三线表、章节号         |
| `carbon`     | IBM Carbon 设计语言          | IBM Plex Sans / IBM Plex Sans / IBM Plex Mono | 电光蓝 `#0f62fe`          | 实验室操作台、8px 网格、零圆角矩形 |
| `nocturne`   | 电影感近黑档案库             | Space Grotesk / Space Grotesk / IBM Plex Mono | 珊瑚 `#ff6b57` + 电青     | 深炭黑、超紧排大标题、细线感       |
| `fieldnotes` | 田野考察/实验室手账          | Fraunces / Source Sans 3 / IBM Plex Mono      | 森绿墨 `#3d6b52` + 安全橙 | 牛皮纸、方格线、标签贴纸、批注感   |

## 切换主题

网站左侧工具区新增了 **Theme** 按钮。展开后可在 8 套主题间即时切换，不刷新、不重建；键盘支持 `Enter`/空格打开、方向键移动、`Esc` 关闭。选择会持久化，并在 SPA 页面跳转后保留。

`site.theme.ts` 仍保留，用于设置**首次访问且用户尚未选择时**的构建默认主题：

```ts
export const siteTheme = {
  preset: "carbon" as ThemePresetName,
}
```

修改默认主题后才需要重新运行 `npx quartz build`。普通访客的运行时切换不需要构建。

## 批量预览全部主题

```bash
cp site.theme.ts /tmp/site.theme.ts.bak
for p in current notion things anuppuccin bluetopaz carbon nocturne fieldnotes; do
  sed -i "s/preset: \"[a-z]*\" as ThemePresetName/preset: \"$p\" as ThemePresetName/" site.theme.ts
  npx quartz build
  rm -rf "preview/$p" && mkdir -p "preview/$p" && cp -r public/. "preview/$p/"
done
cp /tmp/site.theme.ts.bak site.theme.ts

# 一次性起全部静态服务：网关 :9000 + 各预设 9001–9009
node serve-previews.mjs
```

打开 <http://localhost:9000> 是启动页画廊（`preview/index.html`，纯 HTML/CSS，无框架），
或直接访问某个预设：current `:9001`、notion `:9003`、things `:9004`、anuppuccin `:9005`、
bluetopaz `:9006`、carbon `:9007`、nocturne `:9008`、fieldnotes `:9009`（端口 9002 保留未用）。

## 新增一个普通主题

普通用户主题坚持 **数据 + CSS、无任意 JavaScript**，避免破坏路由、登录状态和供应链安全。

1. 复制一个相近主题目录为 `themes/presets/<id>/`。
2. 编辑 `theme.ts`：填写 CSS-safe 的小写 `id`、名称、说明、亮/暗各 9 个颜色 token，以及标题/正文/代码字体。
3. 编辑 `theme.scss`：所有规则必须包在 `body[data-theme-preset="<id>"] { ... }` 下。首页优先使用：
   - `[data-theme-slot="hero"]`
   - `[data-theme-slot="intro"]`
   - `[data-theme-slot="section-heading"]`
   - `[data-theme-slot="feature-list"]`
   - `[data-theme-slot="start-links"]`
   - `[data-theme-slot="notice"]`
4. 在 `themes/index.ts` 增加 **一行 import + 一条 registry 项**；`ThemePresetName` 会从注册表自动推导，无需手改类型。
5. 在 `quartz/styles/custom.scss` 增加该主题 `theme.scss` 的一条 `@use`。显式注册/引入是为了兼容 Quartz 当前 Node 与 esbuild 双环境。
6. 运行 `npm run check && npm test && npx quartz build`。注册测试会检查重复 id、非法 id、缺失 token 和默认主题有效性。

新主题注册后会自动出现在切换器，并自动获得运行时 token、亮/暗模式及持久化能力。

## 注意事项

- `tertiary` 兼任全局链接 hover 色（base.scss `a:hover`），选色需与 `secondary` 同族协调。
- 中文字体（Noto Sans SC / Noto Serif SC）在 Google Fonts **无斜体轴**：body 字体必须用对象形式 `{ name, weights, includeItalic: false }`，否则整个 css2 请求 400、三个字体全部回退。
- 首页与 SOP 库页的内容是纯 Markdown，主题的"结构感"全部来自按 `data-slug` 作用域的 CSS——替换首页内容时保持"h1 + 首段 + h2 分节 + 链接列表"的结构即可获得最佳效果。
