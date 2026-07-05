-- ============================================
-- 002: 补丁 - 用户同步触发器 + 更严格的 RLS
-- ============================================
-- 适用场景：
-- - 如果你已经在 Supabase 上运行过 001_initial_schema.sql
-- - 但 public.users 没有跟 auth.users 自动同步
-- - 或者需要修正 INSERT/UPDATE 的 RLS 检查（防止伪造 author_id / role 提权）

-- ============================================
-- 1) auth.users -> public.users 同步
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_github_id TEXT;
  v_username TEXT;
  v_avatar_url TEXT;
BEGIN
  v_username := COALESCE(
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'preferred_username',
    new.raw_user_meta_data->>'name',
    CASE WHEN new.email IS NOT NULL THEN split_part(new.email, '@', 1) END,
    'user'
  );

  v_github_id := COALESCE(
    new.raw_user_meta_data->>'provider_id',
    new.raw_user_meta_data->>'sub',
    new.raw_user_meta_data->>'id',
    new.id::text
  );

  v_avatar_url := NULLIF(new.raw_user_meta_data->>'avatar_url', '');

  INSERT INTO public.users (id, github_id, username, email, avatar_url)
  VALUES (new.id, v_github_id, v_username, new.email, v_avatar_url)
  ON CONFLICT (id) DO UPDATE
  SET
    github_id = EXCLUDED.github_id,
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================
-- 2) RLS 策略修正
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- users
DROP POLICY IF EXISTS "用户可查看所有成员" ON users;
DROP POLICY IF EXISTS "用户可更新自己" ON users;
DROP POLICY IF EXISTS "用户可创建自己" ON users;
DROP POLICY IF EXISTS "成员可更新自己" ON users;
DROP POLICY IF EXISTS "管理员可更新自己" ON users;

CREATE POLICY "用户可查看所有成员" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "用户可创建自己" ON users
  FOR INSERT WITH CHECK (id = auth.uid() AND role = 'member');

CREATE POLICY "成员可更新自己" ON users
  FOR UPDATE
  USING (id = auth.uid() AND role = 'member')
  WITH CHECK (id = auth.uid() AND role = 'member');

CREATE POLICY "管理员可更新自己" ON users
  FOR UPDATE
  USING (id = auth.uid() AND role = 'admin')
  WITH CHECK (id = auth.uid() AND role = 'admin');

-- annotations
DROP POLICY IF EXISTS "成员可创建注释" ON annotations;
DROP POLICY IF EXISTS "作者可更新注释" ON annotations;

CREATE POLICY "成员可创建注释" ON annotations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "作者可更新注释" ON annotations
  FOR UPDATE USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- comments
DROP POLICY IF EXISTS "成员可创建评论" ON comments;
DROP POLICY IF EXISTS "作者可更新评论" ON comments;

CREATE POLICY "成员可创建评论" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "作者可更新评论" ON comments
  FOR UPDATE USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- reservations
DROP POLICY IF EXISTS "成员可创建预约" ON reservations;
DROP POLICY IF EXISTS "预约者可更新" ON reservations;

CREATE POLICY "成员可创建预约" ON reservations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "预约者可更新" ON reservations
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

