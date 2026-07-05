# Static and Collab Modes

This template supports two deployment modes from one codebase.

## Static Mode

Static Mode is the default. It needs only Node.js for building and any static host for deployment.

Enabled features:

- Markdown/Obsidian content
- Quartz navigation
- Search
- Backlinks
- Table of contents
- Dark mode
- Reader mode

Disabled features:

- GitHub login
- Supabase comments
- Page annotations
- Reservation calendar

Configuration:

```ts
export const siteFeatureConfig = {
  mode: "static",
  features: presets.static,
}
```

## Collab Mode

Collab Mode enables database-backed collaboration features.

Enabled features:

- Everything in Static Mode
- GitHub OAuth login
- Page comments
- Page annotations
- Reservation calendar

Requirements:

- Supabase project
- GitHub OAuth app
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `supabase/migrations/001_initial_schema.sql` applied to the database

Configuration:

```ts
export const siteFeatureConfig = {
  mode: "collab",
  features: presets.collab,
}
```

## Custom Feature Mix

You can also enable only some features:

```ts
export const siteFeatureConfig = {
  mode: "static",
  features: {
    auth: false,
    comments: false,
    annotations: false,
    reservations: false,
  },
}
```

For example, keep `comments` disabled while enabling `reservations` if you only need shared-resource booking.
