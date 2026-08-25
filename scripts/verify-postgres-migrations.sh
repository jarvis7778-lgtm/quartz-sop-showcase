#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
name="cfour-pg-audit-$RANDOM"

cleanup() {
  docker rm -f "$name" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --name "$name" -e POSTGRES_PASSWORD=postgres -d postgres:17-alpine >/dev/null
for _ in $(seq 1 30); do
  docker exec "$name" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U postgres postgres <<'SQL'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA auth;
CREATE TABLE auth.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  raw_app_meta_data jsonb DEFAULT '{}'::jsonb
);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT null::uuid $$;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
SQL

for migration in "$root"/supabase/migrations/*.sql; do
  printf 'Applying %s\n' "$(basename "$migration")"
  docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U postgres postgres < "$migration" >/dev/null
done

docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U postgres postgres <<'SQL'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('comments_with_author', 'reservations_with_user')
      AND NOT ('security_invoker=true' = ANY(c.reloptions))
  ) THEN
    RAISE EXCEPTION 'Collaboration views must use security_invoker';
  END IF;

  IF has_table_privilege('anon', 'public.comments_with_author', 'SELECT') OR
     has_table_privilege('anon', 'public.reservations_with_user', 'SELECT') THEN
    RAISE EXCEPTION 'anon must not read collaboration views';
  END IF;

  IF has_column_privilege('authenticated', 'public.users', 'email', 'SELECT') OR
     NOT has_column_privilege('authenticated', 'public.users', 'username', 'SELECT') THEN
    RAISE EXCEPTION 'users column grants are incorrect';
  END IF;

  IF (SELECT count(*) FROM pg_constraint WHERE conname IN (
    'comments_content_length',
    'reservations_title_length',
    'reservations_description_length',
    'annotations_note_length'
  ) AND convalidated) <> 4 THEN
    RAISE EXCEPTION 'content constraints are incomplete';
  END IF;
END $$;
SQL

echo "PostgreSQL migration verification passed."