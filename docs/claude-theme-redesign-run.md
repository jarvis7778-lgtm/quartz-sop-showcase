You are Claude Code working in `/home/lyy/code/quartz-sop-template`.

Important: The user rejected the current attempted `minimal` and `notion` themes as visually poor. Redesign them from scratch. Do not optimize the rejected implementation incrementally.

Read first:

- docs/theme-redesign-handoff.md
- docs/claude-theme-redesign-prompt.md
- site.theme.ts
- themes/index.ts
- quartz.config.ts
- quartz.layout.ts
- quartz/styles/custom.scss
- content/index.md
- content/sop/index.md

Primary task:

1. Redesign `minimal` and `notion` theme presets to be genuinely attractive and clearly different.
2. Keep `current` as default and visually unchanged.
3. Add a visual stress-test Markdown page under `content/sop/theme-showcase.md` containing:
   - h1-h6 headings
   - paragraph text with bold/italic/inline code
   - internal links
   - blockquote/callout if supported
   - ordered and unordered lists
   - code block
   - math: inline and display formula
   - table
   - image placeholder or figure-style section if appropriate
   - checklist/task list if supported
4. Make the homepage/SOP library/article/showcase pages demonstrate the theme quality at a glance.

Visual direction:

- `minimal`: Stripe/Vercel/Linear docs quality. Crisp, restrained, technical, calm. White or near-white, strong typography, clean borders, no decorative blobs, no heavy shadows, no childish cards.
- `notion`: Notion public page / Super.so / Potion quality. Warm document workspace, soft sidebar, clean document blocks, subtle homepage grouping. Avoid generic purple SaaS card look.

Implementation guidance:

- Keep theme plumbing unless a small cleaner equivalent is clearly better.
- Prefer CSS variables/tokens and scoped `body[data-theme-preset="..."]` overrides.
- Do not broadly rewrite Quartz internals.
- Do not enable Supabase/collab UI in default Static Mode.
- Restore `site.theme.ts` to `current` at the end.

Verification required:

- `npm run check`
- `npx quartz build` for `current`, `minimal`, and `notion`
- If you create preview output dirs, document where they are.
- Leave enough instructions for Hermes to capture screenshots of:
  - minimal homepage
  - minimal SOP library
  - minimal showcase/article
  - notion homepage
  - notion SOP library
  - notion showcase/article

Report at the end:

- Files changed
- Visual rationale for minimal and notion
- Exact commands run and results
- Any remaining caveats

Use high effort. Be ambitious visually, but keep the implementation maintainable.
