# Theme Redesign Handoff for Claude Code

## Context

This repository is a Quartz-based SOP knowledge-base template for research groups and small labs.

Path: `/home/lyy/code/quartz-sop-template`

The project supports two feature modes:

- `Static Mode`: no backend/database; default mode.
- `Collab Mode`: optional Supabase login/comments/annotations/reservations.

This handoff is only about visual themes. Do not change the Static/Collab feature architecture unless required for visual theming.

## Important User Feedback

The first attempted `minimal` and `notion` themes are visually poor. The user explicitly rejected them.

Do **not** treat the current `minimal` and `notion` definitions as a visual direction to optimize. They should be redesigned from scratch.

## What to Keep

Keep the basic theme-selection plumbing unless you find a cleaner equally small approach:

- `site.theme.ts` selects the theme preset.
- `themes/index.ts` exports `ThemePresetName` and `createThemePreset()`.
- `quartz.config.ts` reads `siteTheme.preset` and assigns `theme` / `themePreset`.
- `quartz/cfg.ts` includes optional `themePreset` for CSS hooks.
- `quartz/components/renderPage.tsx` emits `data-theme-preset` on `<body>`.

The default should remain:

```ts
preset: "current" as ThemePresetName
```

The `current` theme should remain visually unchanged because it is the only version the user currently likes.

## What to Redo

Redesign these two presets from scratch:

1. `minimal`
2. `notion`

The existing token values and CSS overrides for those presets can be replaced.

## Product Positioning

This is not a generic corporate SOP site. It is an Obsidian-first SOP website template for:

- research groups
- small labs
- student onboarding
- shared equipment/resource docs
- lightweight internal team knowledge bases

It should feel more like a polished knowledge product than a default docs theme.

## Theme Direction Requirements

### Minimal Theme

Goal: calm, credible, public-docs quality.

Visual references:

- Stripe docs: crisp hierarchy, clean tables/cards, restrained accent.
- Vercel docs: high whitespace, simple borders, excellent typography.
- Linear docs: dense enough, not childish, neutral professional look.

Desired feeling:

- clean
- precise
- technical
- open-source friendly
- not flashy

Avoid:

- childish rounded cards
- random bright colors
- heavy box shadows
- rotated cards
- magazine layout
- default Quartz look with only color changes

Suggested style:

- mostly white or near-white background
- 1px neutral borders
- subtle blue/indigo accent
- strong typography hierarchy
- no decorative blobs
- cards should be flat and carefully spaced
- article content should be the focus

### Notion Theme

Goal: document workspace / modern knowledge-base feeling.

Visual references:

- Notion public pages
- Super.so / Potion-style Notion sites
- Arc/Notion-adjacent soft UI

Desired feeling:

- soft
- approachable
- organized
- workspace-like
- polished but not SaaS-marketing-heavy

Avoid:

- generic purple SaaS theme
- excessive drop shadows
- dashboard chrome
- making every article a heavy card
- low information density

Suggested style:

- warm off-white page background
- content appears like clean document blocks
- soft gray sidebar treatment
- subtle card grouping on homepage only
- lighter headings, calmer accents
- links/buttons should feel like Notion database/page links

## Concrete Pages to Review

Use these pages for screenshot review:

- `/index.html` homepage
- `/sop/index.html` SOP library page
- `/sop/example-onboarding.html` article page
- `/calendar.html` static placeholder page

For each theme, capture at least:

- homepage desktop
- SOP library desktop
- article desktop
- one mobile screenshot if feasible

## Files Likely to Modify

- `themes/index.ts`
- `quartz/styles/custom.scss`
- optionally `site.theme.ts` only while testing; restore default to `current`
- optionally add `docs/themes.md` explaining how to switch themes

Avoid broad rewrites of Quartz internals.

## Acceptance Criteria

1. `current` preset remains the default and visually unchanged.
2. `minimal` and `notion` look meaningfully distinct from each other and from `current`.
3. No database-backed Collab UI appears in default Static Mode.
4. `npm run check` passes.
5. `npx quartz build` passes for `current`, `minimal`, and `notion`.
6. Screenshots are captured for minimal and notion.
7. Final template is restored to `current` before handoff.
8. Generated files and dependencies are cleaned before final handoff unless explicitly needed for screenshot review.

## Suggested Process

1. Read `content/index.md`, `content/sop/index.md`, and one article to understand content structure.
2. Read current `quartz/styles/custom.scss` and identify which rules are current-theme-specific versus reusable content styling.
3. Keep `current` stable.
4. Redesign `minimal` first using restrained tokens and CSS overrides.
5. Redesign `notion` second with softer document-workspace treatment.
6. Build each preset and inspect screenshots.
7. Iterate based on actual screenshots, not just code.
8. Restore `site.theme.ts` to `current`.

## Notes on the Rejected Attempt

The rejected attempt mostly changed theme tokens and added shallow CSS overrides. It did not redesign the homepage/content hierarchy deeply enough. It also made the Notion theme look like a generic purple SaaS card theme.

Treat that as a negative example, not a starting point.
