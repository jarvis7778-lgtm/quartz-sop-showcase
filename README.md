# Quartz SOP Template

A reusable SOP and team knowledge-base template built on [Quartz 4](https://quartz.jzhao.xyz), Markdown/Obsidian, and Cloudflare Pages. It defaults to a pure static frontend and can optionally enable Supabase-powered collaboration features.

## Modes

| Mode            | Requires Supabase | Features                                                                                             |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| **Static Mode** | No                | Obsidian/Markdown content, Quartz static site, search, backlinks, navigation, dark mode, reader mode |
| **Collab Mode** | Yes               | Static Mode plus GitHub login, page comments, annotations, and reservation calendar                  |

The default is **Static Mode**. Change `site.features.ts` to enable Collab Mode.

## Features

- Publish Markdown notes as a searchable static website
- Keep an Obsidian-friendly `content/` authoring workflow
- Run without any database or backend by default
- Optionally enable GitHub OAuth through Supabase
- Optionally enable page comments, annotations, and shared-resource reservations
- Deploy to Cloudflare Pages, GitHub Pages, or any static host

## Tech Stack

- **Static site**: Quartz 4.x
- **Content**: Markdown files under `content/`
- **Optional auth/data**: Supabase Auth + PostgreSQL + Realtime
- **Hosting**: Cloudflare Pages, GitHub Pages, or any static host

## Quick Start

```bash
npm install
npm run dev
```

Open <http://localhost:8081>.

## Choose a Mode

### Static Mode

No setup needed. The default `site.features.ts` disables all database-backed features:

```ts
export const siteFeatureConfig = {
  mode: "static",
  features: presets.static,
}
```

### Collab Mode

Change `site.features.ts`:

```ts
export const siteFeatureConfig = {
  mode: "collab",
  features: presets.collab,
}
```

Then create a Supabase project, run `supabase/migrations/001_initial_schema.sql`, and expose the public frontend variables during build:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
npm run dev
```

## Themes

Six complete visual presets ship with the template — `current` (default), `minimal` (Stripe/Vercel docs), `notion` (Notion workspace), `things` (Things 3), `anuppuccin` (Catppuccin pastels), and `bluetopaz` (scholarly paper-and-ink, CJK-friendly serif). Switch with one line in `site.theme.ts`:

```ts
export const siteTheme = {
  preset: "things" as ThemePresetName,
}
```

Each preset covers the homepage, SOP library, article typography, and both light/dark modes. See [docs/themes.md](./docs/themes.md) for the full gallery, preview workflow, and how to add your own preset.

## Content Workflow

Edit Markdown under `content/`:

```text
content/
├── index.md
├── calendar.md
└── sop/
    ├── index.md
    ├── example-onboarding.md
    ├── example-shared-resource.md
    └── example-document-review.md
```

Disable comments on any page with frontmatter when Collab Mode is enabled:

```yaml
---
comments: false
---
```

## Project Structure

```text
quartz-sop-template/
├── content/                    # Example Markdown content
├── site.features.ts            # Static/Collab feature preset
├── quartz/                     # Quartz core plus custom components
│   └── components/
│       ├── Auth.tsx
│       ├── SupaComments.tsx
│       ├── Annotation.tsx
│       └── ReservationCalendar.tsx
├── supabase/migrations/        # Optional database schema and RLS policies
├── docs/                       # Architecture and setup guides
├── quartz.config.ts
├── quartz.layout.ts
└── package.json
```

## Deployment

1. Push this repository to GitHub.
2. Create a Cloudflare Pages project.
3. Set build command: `npx quartz build`.
4. Set output directory: `public`.
5. Only add `SUPABASE_URL` and `SUPABASE_ANON_KEY` if using Collab Mode.

See `docs/setup-guide.md` for the full setup checklist.

## Privacy Checklist Before Publishing

- Replace all example pages with your own content.
- Do not commit real credentials, private URLs, or screenshots with sensitive data.
- Keep `.env`, `node_modules/`, `public/`, Obsidian caches, and generated files out of Git.
- If the site must be private, use Cloudflare Access or another edge access-control layer.

## License

This template follows the Quartz upstream MIT license. See `LICENSE.txt`.
