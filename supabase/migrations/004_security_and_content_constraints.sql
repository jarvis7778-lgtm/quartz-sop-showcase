-- 004: existing Collab installations security and content constraints
-- Safe to run after 001 + 002 + 003.

-- Views must obey the invoking Data API role's RLS policies.
DROP VIEW IF EXISTS comments_with_author;
CREATE VIEW comments_with_author
WITH (security_invoker = true) AS
SELECT
  c.*,
  u.username AS author_name,
  u.avatar_url AS author_avatar
FROM comments c
JOIN users u ON c.author_id = u.id;
REVOKE ALL ON comments_with_author FROM anon;
GRANT SELECT ON comments_with_author TO authenticated;

DROP VIEW IF EXISTS reservations_with_user;
CREATE VIEW reservations_with_user
WITH (security_invoker = true) AS
SELECT
  r.*,
  u.username,
  u.avatar_url
FROM reservations r
JOIN users u ON r.user_id = u.id;
REVOKE ALL ON reservations_with_user FROM anon;
GRANT SELECT ON reservations_with_user TO authenticated;

-- Do not expose private email values through the browser Data API.
REVOKE SELECT ON users FROM anon, authenticated;
GRANT SELECT (id, github_id, username, avatar_url, role, created_at, updated_at)
  ON users TO authenticated;

-- Bound user-controlled text at the database layer.
ALTER TABLE comments
  DROP CONSTRAINT IF EXISTS comments_content_length,
  ADD CONSTRAINT comments_content_length
    CHECK (char_length(content) BETWEEN 1 AND 5000) NOT VALID;
ALTER TABLE comments VALIDATE CONSTRAINT comments_content_length;

ALTER TABLE reservations
  DROP CONSTRAINT IF EXISTS reservations_title_length,
  ADD CONSTRAINT reservations_title_length
    CHECK (char_length(title) BETWEEN 1 AND 200) NOT VALID;
ALTER TABLE reservations VALIDATE CONSTRAINT reservations_title_length;

ALTER TABLE reservations
  DROP CONSTRAINT IF EXISTS reservations_description_length,
  ADD CONSTRAINT reservations_description_length
    CHECK (description IS NULL OR char_length(description) <= 2000) NOT VALID;
ALTER TABLE reservations VALIDATE CONSTRAINT reservations_description_length;

ALTER TABLE annotations
  DROP CONSTRAINT IF EXISTS annotations_note_length,
  ADD CONSTRAINT annotations_note_length
    CHECK (note IS NULL OR char_length(note) <= 5000) NOT VALID;
ALTER TABLE annotations VALIDATE CONSTRAINT annotations_note_length;
