-- ============================================
-- 003: 注释系统 Schema 升级
-- ============================================
-- 将 annotations 表从简单的段落标注方式 升级为
-- 基于 Range 锚点的精准文本高亮注释系统。
--
-- 原 schema (001):
--   page_path, paragraph_id, text_selection, content, author_id
-- 新 schema:
--   page_slug, anchor (jsonb), quote, note, user_id
--
-- 策略：
-- - 添加新列（anchor, quote, note, page_slug, user_id）
-- - 迁移数据（如果有的话）
-- - 删除旧列（paragraph_id, text_selection, content, page_path, author_id）
-- - 更新 RLS 策略以使用 user_id 替代 author_id

-- ============================================
-- 1) 添加新列
-- ============================================
ALTER TABLE annotations
  ADD COLUMN IF NOT EXISTS page_slug TEXT,
  ADD COLUMN IF NOT EXISTS anchor JSONB,
  ADD COLUMN IF NOT EXISTS quote TEXT,
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- 2) 迁移已有数据（如果有的话）
-- ============================================
-- page_slug 统一规范：
--   - 去掉开头/结尾的 /
--   - 去掉可选 .html 后缀
--   - 空值回退为 index
UPDATE annotations SET
  page_slug = COALESCE(
    NULLIF(
      regexp_replace(
        regexp_replace(COALESCE(page_path, ''), '^/+|/+$', '', 'g'),
        E'\\.html$',
        ''
      ),
      ''
    ),
    'index'
  ),
  quote = text_selection,
  note = content,
  user_id = author_id,
  anchor = jsonb_build_object(
    'startContainer', 'article > *:nth-child(1)',
    'startOffset', 0,
    'endContainer', 'article > *:nth-child(1)',
    'endOffset', 0,
    'text', COALESCE(text_selection, '')
  )
WHERE user_id IS NULL AND author_id IS NOT NULL;

-- 兜底：若存在未迁移的空 page_slug，也按统一规则补齐
UPDATE annotations
SET page_slug = COALESCE(
  NULLIF(
    regexp_replace(
      regexp_replace(COALESCE(page_path, ''), '^/+|/+$', '', 'g'),
      E'\\.html$',
      ''
    ),
    ''
  ),
  'index'
)
WHERE page_slug IS NULL;

-- ============================================
-- 3) 设置 NOT NULL 约束（新列）
-- ============================================
ALTER TABLE annotations
  ALTER COLUMN page_slug SET NOT NULL;

-- user_id 在没有旧数据时需要 NOT NULL
-- 但如果有旧数据且 author_id 为空，需先人工补齐再迁移
DO $$
DECLARE
  missing_user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_user_count FROM annotations WHERE user_id IS NULL;
  IF missing_user_count > 0 THEN
    RAISE EXCEPTION
      '迁移中发现 % 条 annotations.user_id 为空，请先补全旧数据 author_id 再重试迁移',
      missing_user_count;
  END IF;
END $$;

ALTER TABLE annotations
  ALTER COLUMN user_id SET NOT NULL;

-- ============================================
-- 4) 删除旧列
-- ============================================
ALTER TABLE annotations
  DROP COLUMN IF EXISTS page_path,
  DROP COLUMN IF EXISTS paragraph_id,
  DROP COLUMN IF EXISTS text_selection,
  DROP COLUMN IF EXISTS content,
  DROP COLUMN IF EXISTS author_id;

-- ============================================
-- 5) 创建新索引
-- ============================================
DROP INDEX IF EXISTS idx_annotations_page;
DROP INDEX IF EXISTS idx_annotations_author;

CREATE INDEX idx_annotations_page_slug ON annotations(page_slug);
CREATE INDEX idx_annotations_user ON annotations(user_id);

-- ============================================
-- 6) 更新 RLS 策略（author_id -> user_id）
-- ============================================
DROP POLICY IF EXISTS "成员可查看注释" ON annotations;
DROP POLICY IF EXISTS "成员可创建注释" ON annotations;
DROP POLICY IF EXISTS "作者可更新注释" ON annotations;
DROP POLICY IF EXISTS "作者或管理员可删除注释" ON annotations;

-- 已登录用户可查看所有注释
CREATE POLICY "成员可查看注释" ON annotations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 已登录用户可创建注释
CREATE POLICY "成员可创建注释" ON annotations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 作者可更新自己的注释
CREATE POLICY "作者可更新注释" ON annotations
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 作者或管理员可删除注释
CREATE POLICY "作者或管理员可删除注释" ON annotations
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 7) 启用 Realtime（用于后续 Phase B）
-- ============================================
-- 注意: 如果 supabase_realtime publication 尚未包含此表，
-- 需要手动在 Supabase Dashboard 中开启，或者使用以下命令：
-- ALTER PUBLICATION supabase_realtime ADD TABLE annotations;
-- （某些 Supabase 版本可能不支持此语法，需在 Dashboard 中操作）
DO $$
BEGIN
  -- 尝试添加到 realtime publication（忽略已存在的错误）
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE annotations';
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
