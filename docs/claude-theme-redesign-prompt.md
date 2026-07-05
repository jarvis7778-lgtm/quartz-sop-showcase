# Claude Code Prompt: Redesign Minimal and Notion Themes

Use this prompt from `/home/lyy/code/quartz-sop-template`.

```text
You are Claude Code working on a Quartz-based SOP knowledge-base template for research groups and small labs.

Read first:
- docs/theme-redesign-handoff.md
- site.theme.ts
- themes/index.ts
- quartz.config.ts
- quartz.layout.ts
- quartz/styles/custom.scss
- content/index.md
- content/sop/index.md
- content/sop/example-onboarding.md

Task:
Redesign the `minimal` and `notion` theme presets from scratch. The current attempted versions are visually rejected. Do not optimize them incrementally; replace their visual direction.

Constraints:
- Keep `current` as the default and do not visually change it.
- Keep Static Mode as default; do not enable Auth/comments/annotations/reservations.
- Preserve the theme plumbing unless a small cleaner equivalent is clearly better.
- Do not rewrite Quartz internals broadly.
- Focus on visual quality, hierarchy, typography, spacing, and theme-specific CSS polish.

Target visual directions:

1. Minimal:
   - calm, precise, public-docs quality
   - references: Stripe docs, Vercel docs, Linear docs
   - mostly white/near-white, restrained blue/indigo accent, crisp 1px borders
   - no heavy shadows, no rotated cards, no decorative blobs, no childish rounded-card look

2. Notion:
   - polished document workspace feel
   - references: Notion public pages, Super.so/Potion-style Notion sites
   - warm off-white, soft gray sidebar, clean document blocks, subtle homepage grouping
   - avoid generic purple SaaS cards and heavy dashboard chrome

Expected implementation:
- Modify `themes/index.ts` and `quartz/styles/custom.scss` as needed.
- Optionally add `docs/themes.md` with theme-switch instructions.
- Use `site.theme.ts` only temporarily for testing; restore it to `current` at the end.

Verification:
- Run `npm run check`.
- Run `npx quartz build` for `current`, `minimal`, and `notion`.
- Capture screenshots for `minimal` and `notion`:
  - homepage desktop
  - SOP library desktop
  - article desktop
  - mobile if feasible
- Restore `site.theme.ts` to `current` after verification.
- Clean generated `public`, `node_modules`, `.quartz-cache`, and `tsconfig.tsbuildinfo` unless screenshots need local preview files.

Report:
- Summarize what changed.
- List exact commands run and results.
- Provide screenshot paths.
- Explain the visual rationale for each theme.
```

Recommended invocation:

```bash
claude -p --model opus --max-turns 20 "$(cat docs/claude-theme-redesign-prompt.md)"
```

If using interactive Claude Code, run:

```bash
claude --model opus --dangerously-skip-permissions
```

Then paste the prompt above.
