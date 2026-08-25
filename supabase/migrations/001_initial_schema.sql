-- ============================================
-- SOP 网站数据库初始化脚本
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户表索引
CREATE INDEX idx_users_github_id ON users(github_id);

-- ============================================
-- 2. 注释表 (侧边栏注释)
-- ============================================
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,           -- 页面路径 "/sop/xxx"
  paragraph_id TEXT NOT NULL,        -- 段落标识符
  text_selection TEXT,               -- 选中的文本内容
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000), -- 注释内容
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 注释表索引
CREATE INDEX idx_annotations_page ON annotations(page_path);
CREATE INDEX idx_annotations_author ON annotations(author_id);

-- ============================================
-- 3. 评论表
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,           -- 页面路径
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000), -- 评论内容
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,  -- 回复的父评论
  likes INTEGER DEFAULT 0,           -- 点赞数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论表索引
CREATE INDEX idx_comments_page ON comments(page_path);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- ============================================
-- 4. 评论点赞记录表 (防止重复点赞)
-- ============================================
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- ============================================
-- 5. 实验预约表
-- ============================================
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200), -- 预约标题/实验名称
  description TEXT CHECK (description IS NULL OR char_length(description) <= 2000), -- 详细描述
  equipment TEXT,                    -- 设备分类 (可选)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  color TEXT DEFAULT '#3788d8',      -- 日历显示颜色
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保结束时间大于开始时间
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- 预约表索引
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_time ON reservations(start_time, end_time);
CREATE INDEX idx_reservations_equipment ON reservations(equipment);

-- ============================================
-- 6. 自动更新 updated_at 的触发器函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为各表添加触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_annotations_updated_at
  BEFORE UPDATE ON annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6.1 auth.users -> public.users 同步
-- ============================================
-- 说明：
-- - 前端评论/预约会用到 public.users 的外键，因此需要保证用户首次登录时自动写入 public.users
-- - 该触发器会在用户通过 OAuth 首次创建 auth.users 记录时执行
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
-- 7. Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- === users 表策略 ===
-- 已登录用户可查看所有用户
CREATE POLICY "用户可查看所有成员" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS 只控制行，不控制列；禁止浏览器角色读取所有成员邮箱。
REVOKE SELECT ON users FROM anon, authenticated;
GRANT SELECT (id, github_id, username, avatar_url, role, created_at, updated_at)
  ON users TO authenticated;

-- 用户可创建自己的记录（禁止伪造 admin）
CREATE POLICY "用户可创建自己" ON users
  FOR INSERT WITH CHECK (id = auth.uid() AND role = 'member');

-- 普通成员可更新自己的信息（禁止把 role 改成 admin）
CREATE POLICY "成员可更新自己" ON users
  FOR UPDATE
  USING (id = auth.uid() AND role = 'member')
  WITH CHECK (id = auth.uid() AND role = 'member');

-- 管理员可更新自己的信息
CREATE POLICY "管理员可更新自己" ON users
  FOR UPDATE
  USING (id = auth.uid() AND role = 'admin')
  WITH CHECK (id = auth.uid() AND role = 'admin');

-- === annotations 表策略 ===
-- 已登录用户可查看所有注释
CREATE POLICY "成员可查看注释" ON annotations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 已登录用户可创建注释
CREATE POLICY "成员可创建注释" ON annotations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- 作者可更新自己的注释
CREATE POLICY "作者可更新注释" ON annotations
  FOR UPDATE USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- 作者或管理员可删除注释
CREATE POLICY "作者或管理员可删除注释" ON annotations
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- === comments 表策略 ===
-- 已登录用户可查看所有评论
CREATE POLICY "成员可查看评论" ON comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 已登录用户可创建评论
CREATE POLICY "成员可创建评论" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- 作者可更新自己的评论
CREATE POLICY "作者可更新评论" ON comments
  FOR UPDATE USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- 作者或管理员可删除评论
CREATE POLICY "作者或管理员可删除评论" ON comments
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- === comment_likes 表策略 ===
CREATE POLICY "成员可查看点赞" ON comment_likes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "成员可点赞" ON comment_likes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "用户可取消自己的点赞" ON comment_likes
  FOR DELETE USING (user_id = auth.uid());

-- === reservations 表策略 ===
-- 已登录用户可查看所有预约
CREATE POLICY "成员可查看预约" ON reservations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 已登录用户可创建预约
CREATE POLICY "成员可创建预约" ON reservations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 预约者可更新自己的预约
CREATE POLICY "预约者可更新" ON reservations
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 预约者或管理员可删除预约
CREATE POLICY "预约者或管理员可删除" ON reservations
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 8. 视图: 带用户信息的评论
-- ============================================
CREATE VIEW comments_with_author
WITH (security_invoker = true) AS
SELECT 
  c.*,
  u.username as author_name,
  u.avatar_url as author_avatar
FROM comments c
JOIN users u ON c.author_id = u.id;

REVOKE ALL ON comments_with_author FROM anon;
GRANT SELECT ON comments_with_author TO authenticated;

-- ============================================
-- 9. 视图: 带用户信息的预约
-- ============================================
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
