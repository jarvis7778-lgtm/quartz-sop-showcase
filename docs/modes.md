# Static and Collab Modes

The same source tree can be built in two validated modes through `SITE_MODE`.

## Static Mode

```bash
SITE_MODE=static SITE_URL=docs.example.com npx quartz build
```

This is the default and requires no database. Auth, comments, annotations and reservations are absent from the generated site.

## Collab Mode

```bash
SITE_MODE=collab \
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_ANON_KEY=your-public-anon-key \
SITE_URL=docs.example.com \
npx quartz build
```

Collab Mode adds GitHub OAuth, comments, text annotations and reservations. Apply all SQL migrations in numeric order for a new database. Existing databases apply only newer migration numbers after taking a backup.

The Supabase client is a global locally bundled prescript, independent of the visible Auth component. The shipped presets nevertheless keep the collaboration features together because each feature needs a signed-in user and shared authorization policy.

## Custom feature mixes

Feature dependencies are validated at build time. Database-backed features currently require `auth: true`:

```ts
validateSiteFeatureConfig({
  mode: "collab",
  features: {
    auth: true,
    comments: false,
    annotations: false,
    reservations: true,
  },
})
```

A configuration such as `auth: false, reservations: true` fails the build instead of waiting in the browser and silently showing “not configured”.

## Production boundary

The default GitHub OAuth flow does not implement an application-level GitHub organization allowlist. For a private team site, use Cloudflare Access or another edge identity allowlist and test RLS with anonymous, member and administrator identities before launch.
