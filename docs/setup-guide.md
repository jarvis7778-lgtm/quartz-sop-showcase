# Setup Guide

This guide explains how to turn this template into your own SOP or team knowledge-base website.

The project defaults to **Static Mode**, which does not require Supabase or any database. Complete the Supabase and GitHub OAuth sections only if you want **Collab Mode** with login, comments, annotations, and reservations. See `docs/modes.md` for the mode switch.

## Checklist

- [ ] Choose a repository name and site title
- [ ] Create a GitHub repository or organization
- [ ] Create a Supabase project
- [ ] Run the database migration
- [ ] Configure GitHub OAuth in Supabase
- [ ] Deploy the static site
- [ ] Optional: protect the full site with Cloudflare Access

---

## 1. GitHub Repository or Organization

You can use a personal repository or a GitHub organization.

Suggested placeholders to replace:

```text
GitHub organization: <your-github-org>
Repository name:     <your-repo-name>
Site URL:            https://<your-site>.pages.dev
```

If you use GitHub organization membership as an access-control rule, invite all allowed users to that organization or to a specific team.

---

## 2. Supabase Project

1. Open <https://supabase.com>.
2. Sign in and create a new project.
3. Choose the Free plan if it is enough for your team.
4. After the project is ready, open **Project Settings → API**.
5. Record only the public frontend values:

```text
SUPABASE_URL=        https://xxxxxx.supabase.co
SUPABASE_ANON_KEY=   eyJ...
```

Never commit or share these sensitive values:

- Database password
- `service_role` key
- GitHub OAuth Client Secret

### Run the database schema

Open the Supabase SQL editor and run:

```text
supabase/migrations/001_initial_schema.sql
```

This creates:

- `users`
- `annotations`
- `comments`
- `comment_likes`
- `reservations`
- RLS policies
- an `auth.users` trigger that syncs OAuth users into `public.users`

---

## 3. GitHub OAuth

### Create the OAuth App

1. Open <https://github.com/settings/developers>.
2. Choose **OAuth Apps → New OAuth App**.
3. Fill in:
   - **Application name**: `SOP Knowledge Base`
   - **Homepage URL**: `https://<your-site>.pages.dev`
   - **Authorization callback URL**: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Register the app.
5. Copy the Client ID and generate a Client Secret.

### Enable the GitHub provider in Supabase

1. Open Supabase Dashboard.
2. Go to **Authentication → Providers → GitHub**.
3. Enable GitHub.
4. Paste the GitHub OAuth Client ID and Client Secret.
5. Save.

---

## 4. Local Development

```bash
npm install
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
npm run dev
```

Open <http://localhost:8081>.

Without the two Supabase variables, the site still builds but login, comments, annotations, and reservations are inactive.

---

## 5. Cloudflare Pages Deployment

1. Push this repository to GitHub.
2. Create a Cloudflare Pages project from the repository.
3. Use:

```text
Build command:   npx quartz build
Output folder:   public
Node version:    22 or newer
```

4. Add environment variables:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
```

5. Deploy.

---

## 6. Optional Full-Site Access Control

Quartz is a static site. Frontend-only code cannot truly hide private pages. If the whole website must be private, put access control in front of the site.

A simple option is Cloudflare Zero Trust Access:

1. Open Cloudflare Zero Trust.
2. Go to **Access → Applications → Add an application**.
3. Choose **Self-hosted**.
4. Set the application domain, for example `https://<your-site>.pages.dev` or your custom domain.
5. Enable GitHub as an identity provider.
6. Add an **Allow** policy:
   - Include: GitHub Organization or GitHub Team = `<your-github-org>`
   - Action: Allow
7. Optional deny fallback:
   - Include: Everyone
   - Action: Deny

After this, unauthorized visitors are blocked before the static pages load.

---

## 7. Privacy Checklist

Before publishing your fork or template:

- Remove real SOP content.
- Remove private screenshots and generated build output.
- Search for organization names, personal names, private domains, emails, and tokens.
- Do not commit `.env`, `node_modules/`, `public/`, `.obsidian/`, vector databases, or tool caches.
