# 主题预设 (Theme Presets)

模板内置 6 套完整外观。每套 = 调色板/字体（`themes/index.ts`）+ 结构样式（`quartz/styles/custom.scss` 中 `body[data-theme-preset="..."]` 作用域块），覆盖首页、SOP 库页、文章排版，均含亮/暗双模式。

## 预设一览

| 预设         | 灵感来源                      | 字体 (标题/正文/代码)                         | 强调色                  | 一句话气质                  |
| ------------ | ----------------------------- | --------------------------------------------- | ----------------------- | --------------------------- |
| `current`    | 杂志编辑风（默认）            | Sora / Manrope / Space Mono                   | 红 `#e84a5f` + 橙       | 大胆撞色、强设计感          |
| `minimal`    | Stripe / Vercel / Linear 文档 | Inter / Inter / JetBrains Mono                | 靛蓝 `#4f46e5`          | 白底发丝线，克制精准        |
| `notion`     | Notion 公开页面               | Inter / Inter / JetBrains Mono                | Notion 蓝 `#337ea9`     | 暖灰工作区+白色文档面       |
| `things`     | Things 3 (Obsidian 热门主题)  | Plus Jakarta Sans / Inter / JetBrains Mono    | iOS 蓝 `#2e80f2`        | 零边框软填充，圆环 checkbox |
| `anuppuccin` | AnuPpuccin / Catppuccin       | Nunito / Nunito Sans / Fira Code              | 木槿紫 `#8839ef`        | 粉彩色阶，h1–h6 各有彩色    |
| `bluetopaz`  | Blue Topaz (中文社区热门)     | Noto Serif SC / Noto Sans SC / JetBrains Mono | 黄玉蓝 `#2f6fa7` + 朱砂 | 纸墨书卷气，三线表、章节号  |

## 切换主题

编辑 `site.theme.ts`，改一行：

```ts
export const siteTheme = {
  preset: "things" as ThemePresetName, // current | minimal | notion | things | anuppuccin | bluetopaz
}
```

然后 `npx quartz build`（或 `npm run dev`）。

## 批量预览全部主题

```bash
cp site.theme.ts /tmp/site.theme.ts.bak
for p in current minimal notion things anuppuccin bluetopaz; do
  sed -i "s/preset: \"[a-z]*\" as ThemePresetName/preset: \"$p\" as ThemePresetName/" site.theme.ts
  npx quartz build
  rm -rf "preview/$p" && mkdir -p "preview/$p" && cp -r public/. "preview/$p/"
done
cp /tmp/site.theme.ts.bak site.theme.ts

# 每个 preview 目录起一个静态服务 (9001-9006) 即可横向对比
```

## 新增一个预设

1. `themes/index.ts`：往 `ThemePresetName` 联合类型加名字，新增 `Theme` 对象（9 个颜色 token × 亮/暗 + 3 个字体），加入 `presets` 记录。`Record<ThemePresetName, Theme>` 会让 tsc 强制完整性。
2. `quartz/styles/custom.scss`：追加 `body[data-theme-preset="<name>"] { ... }` 块。骨架约定：
   - 块顶部集中定义局部变量（十六进制只出现在这里），暗色用 `:root[saved-theme="dark"] & { ... }` 写变量双胞胎；
   - 依次覆盖：侧栏/壳 → 首页（`&[data-slug="index"]`，纯 markdown DOM；链接列表用 `ul:has(> li > a.internal)` 升级成卡片网格）→ SOP 库页（`&[data-slug="sop/index"]`，`ul.section-ul` 列表）→ 文章排版（标题/链接/代码/表格/引用/callout/公式/图片）。
3. `npm run check` + 构建验证。

## 注意事项

- `tertiary` 兼任全局链接 hover 色（base.scss `a:hover`），选色需与 `secondary` 同族协调。
- 中文字体（Noto Sans SC / Noto Serif SC）在 Google Fonts **无斜体轴**：body 字体必须用对象形式 `{ name, weights, includeItalic: false }`，否则整个 css2 请求 400、三个字体全部回退。
- 首页与 SOP 库页的内容是纯 Markdown，主题的"结构感"全部来自按 `data-slug` 作用域的 CSS——替换首页内容时保持"h1 + 首段 + h2 分节 + 链接列表"的结构即可获得最佳效果。
