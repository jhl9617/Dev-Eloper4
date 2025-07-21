/* ============================================================================
   Dev-Eloper4 Blog Database Schema - Complete Setup
   ============================================================================
   
   This file contains the complete database schema for the blog application,
   including all tables, functions, RLS policies, and security enhancements.
   
   Run this file in Supabase SQL Editor to set up the complete database.
   
   ============================================================================ */

/* ============================================================================
   1. Extensions and Initial Setup
   ============================================================================ */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID 생성
CREATE EXTENSION IF NOT EXISTS pgcrypto;        -- 암호화/해시 함수

/* ============================================================================
   2. ENUMS
   ============================================================================ */
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
    CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'archived');
  END IF;
END $$;

/* ============================================================================
   3. Utility Functions
   ============================================================================ */

-- Updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Posts 검색 벡터 자동 생성 함수
CREATE OR REPLACE FUNCTION set_posts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title,   '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* ============================================================================
   4. Core Tables
   ============================================================================ */

-- Admins 테이블 (관리자 권한 관리)
CREATE TABLE IF NOT EXISTS admins (
    user_id UUID PRIMARY KEY,
    added_at TIMESTAMPTZ DEFAULT now()
);

-- Categories 테이블
CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    deleted_at  TIMESTAMPTZ,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    CONSTRAINT categories_slug_chk CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT categories_slug_uniq UNIQUE (slug)
);

-- Tags 테이블
CREATE TABLE IF NOT EXISTS tags (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    deleted_at  TIMESTAMPTZ,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    CONSTRAINT tags_slug_chk CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT tags_slug_uniq UNIQUE (slug)
);

-- Posts 테이블
CREATE TABLE IF NOT EXISTS posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    status          post_status DEFAULT 'draft',
    published_at    TIMESTAMPTZ,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    slug            TEXT NOT NULL,
    cover_image_path TEXT,
    category_id     BIGINT REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    search_vector   TSVECTOR
);

-- Post-Tag 관계 테이블 (다대다)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Security Logs 테이블
CREATE TABLE IF NOT EXISTS security_logs (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ DEFAULT now(),
    user_id     UUID,
    action      TEXT NOT NULL,
    details     JSONB,
    ip_address  INET,
    user_agent  TEXT
);

-- Login Attempts 테이블
CREATE TABLE IF NOT EXISTS login_attempts (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ DEFAULT now(),
    email       TEXT NOT NULL,
    success     BOOLEAN DEFAULT false,
    ip_address  INET,
    user_agent  TEXT
);

-- Comments 테이블 (중첩 댓글 지원)
CREATE TABLE IF NOT EXISTS comments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    deleted_at  TIMESTAMPTZ,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    author_name VARCHAR(30) NOT NULL,
    ip_address  INET NOT NULL,
    
    CONSTRAINT comments_content_length CHECK (length(content) BETWEEN 5 AND 500),
    CONSTRAINT comments_name_length CHECK (length(author_name) BETWEEN 2 AND 30)
);

-- Comment Rate Limits 테이블
CREATE TABLE IF NOT EXISTS comment_rate_limits (
    ip_address      INET PRIMARY KEY,
    comment_count   INTEGER DEFAULT 0,
    last_comment_at TIMESTAMPTZ DEFAULT now(),
    reset_time      TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 hour')
);

-- Session Comments 테이블 (사용자 댓글 삭제 권한 관리)
CREATE TABLE IF NOT EXISTS session_comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ DEFAULT now(),
    session_id      VARCHAR(128) NOT NULL,
    comment_id      UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    expires_at      TIMESTAMPTZ NOT NULL,
    
    UNIQUE(session_id, comment_id)
);

-- Post Views 테이블 (조회수 추적)
CREATE TABLE IF NOT EXISTS post_views (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ DEFAULT now(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    ip_address      INET NOT NULL,
    user_agent      TEXT,
    session_id      VARCHAR(128),
    
    UNIQUE(post_id, ip_address, DATE(created_at))
);

-- Comment Reactions 테이블 (댓글 반응)
CREATE TABLE IF NOT EXISTS comment_reactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ DEFAULT now(),
    comment_id      UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    ip_address      INET NOT NULL,
    reaction_type   VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
    
    UNIQUE(comment_id, ip_address)
);

/* ============================================================================
   5. Indexes
   ============================================================================ */

-- Posts 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS uniq_posts_slug_live
  ON posts(slug) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_status_pubat
  ON posts(status, coalesce(published_at, created_at) DESC);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_search_vector
  ON posts USING gin(search_vector);

-- Security logs 인덱스
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id
  ON security_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_security_logs_created_at
  ON security_logs(created_at DESC);

-- Login attempts 인덱스
CREATE INDEX IF NOT EXISTS idx_login_attempts_email
  ON login_attempts(email);

CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at
  ON login_attempts(created_at DESC);

-- Comments 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_post_id
  ON comments(post_id);

CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_comments_created_at
  ON comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_ip_address
  ON comments(ip_address);

-- Comment rate limits 인덱스
CREATE INDEX IF NOT EXISTS idx_comment_rate_limits_reset_time
  ON comment_rate_limits(reset_time);

-- Session comments 인덱스
CREATE INDEX IF NOT EXISTS idx_session_comments_session_id
  ON session_comments(session_id);

CREATE INDEX IF NOT EXISTS idx_session_comments_expires_at
  ON session_comments(expires_at);

-- Post views 인덱스
CREATE INDEX IF NOT EXISTS idx_post_views_post_id
  ON post_views(post_id);

CREATE INDEX IF NOT EXISTS idx_post_views_created_at
  ON post_views(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_views_ip_address
  ON post_views(ip_address);

-- Comment reactions 인덱스
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id
  ON comment_reactions(comment_id);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_ip_address
  ON comment_reactions(ip_address);

/* ============================================================================
   6. Triggers
   ============================================================================ */

-- Updated_at 자동 갱신 트리거
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Posts 검색 벡터 자동 생성 트리거
CREATE TRIGGER trg_posts_tsv
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_posts_search_vector();

-- Comments updated_at 트리거
CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/* ============================================================================
   7. Security Functions
   ============================================================================ */

-- 관리자 권한 확인 함수 (무한 재귀 방지)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER -- 함수 소유자 권한으로 실행
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid()
  );
$$;

-- 보안 로그 기록 함수
CREATE OR REPLACE FUNCTION log_security_event(
  p_action TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO security_logs (user_id, action, details, ip_address, user_agent)
  VALUES (auth.uid(), p_action, p_details, p_ip_address, p_user_agent);
END;
$$;

-- 로그인 시도 기록 함수
CREATE OR REPLACE FUNCTION log_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO login_attempts (email, success, ip_address, user_agent)
  VALUES (p_email, p_success, p_ip_address, p_user_agent);
END;
$$;

/* ============================================================================
   8. Row Level Security (RLS) Setup
   ============================================================================ */

-- Admins 테이블: RLS 활성화 및 보안 정책 설정
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 다른 모든 테이블에 RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

/* ============================================================================
   9. RLS Policies
   ============================================================================ */

-- Admins 정책 (is_admin() 함수를 사용하여 순환 참조 방지)
CREATE POLICY admins_admin_read
  ON admins FOR SELECT
  USING (is_admin());

CREATE POLICY admins_admin_full
  ON admins FOR ALL
  USING (is_admin());

-- Categories 정책
CREATE POLICY categories_public_read
  ON categories FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY categories_admin_full
  ON categories FOR ALL
  USING (is_admin());

-- Tags 정책
CREATE POLICY tags_public_read
  ON tags FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY tags_admin_full
  ON tags FOR ALL
  USING (is_admin());

-- Posts 정책
CREATE POLICY posts_public_read
  ON posts FOR SELECT
  USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY posts_admin_full
  ON posts FOR ALL
  USING (is_admin());

-- Post_tags 정책
CREATE POLICY post_tags_public_read
  ON post_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_tags.post_id 
    AND posts.deleted_at IS NULL 
    AND posts.status = 'published'
  ));

CREATE POLICY post_tags_admin_full
  ON post_tags FOR ALL
  USING (is_admin());

-- Security logs 정책
CREATE POLICY security_logs_admin_only
  ON security_logs FOR ALL
  USING (is_admin());

-- Login attempts 정책
CREATE POLICY login_attempts_admin_only
  ON login_attempts FOR ALL
  USING (is_admin());

-- Comments 정책
CREATE POLICY comments_public_read
  ON comments FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY comments_public_insert
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY comments_admin_full
  ON comments FOR ALL
  USING (is_admin());

-- Comment rate limits 정책
CREATE POLICY comment_rate_limits_public_read
  ON comment_rate_limits FOR SELECT
  USING (true);

CREATE POLICY comment_rate_limits_public_upsert
  ON comment_rate_limits FOR INSERT
  WITH CHECK (true);

CREATE POLICY comment_rate_limits_public_update
  ON comment_rate_limits FOR UPDATE
  USING (true);

-- Session comments 정책
CREATE POLICY session_comments_public_read
  ON session_comments FOR SELECT
  USING (true);

CREATE POLICY session_comments_public_insert
  ON session_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY session_comments_admin_full
  ON session_comments FOR ALL
  USING (is_admin());

-- Post views 정책
CREATE POLICY post_views_admin_read
  ON post_views FOR SELECT
  USING (is_admin());

CREATE POLICY post_views_public_insert
  ON post_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY post_views_admin_full
  ON post_views FOR ALL
  USING (is_admin());

-- Comment reactions 정책
CREATE POLICY comment_reactions_public_read
  ON comment_reactions FOR SELECT
  USING (true);

CREATE POLICY comment_reactions_public_insert
  ON comment_reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY comment_reactions_public_update
  ON comment_reactions FOR UPDATE
  USING (true);

CREATE POLICY comment_reactions_admin_full
  ON comment_reactions FOR ALL
  USING (is_admin());

/* ============================================================================
   10. Function Permissions
   ============================================================================ */

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
GRANT EXECUTE ON FUNCTION log_security_event(TEXT, JSONB, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_login_attempt(TEXT, BOOLEAN, INET, TEXT) TO authenticated;

/* ============================================================================
   11. Initial Data Setup
   ============================================================================ */

-- 기본 카테고리 생성
INSERT INTO categories (name, slug) VALUES 
  ('Technology', 'technology'),
  ('Web Development', 'web-development'),
  ('Programming', 'programming'),
  ('Tutorial', 'tutorial')
ON CONFLICT (slug) DO NOTHING;

-- 기본 태그 생성
INSERT INTO tags (name, slug) VALUES 
  ('JavaScript', 'javascript'),
  ('React', 'react'),
  ('TypeScript', 'typescript'),
  ('Next.js', 'nextjs'),
  ('Node.js', 'nodejs'),
  ('CSS', 'css'),
  ('HTML', 'html'),
  ('Database', 'database'),
  ('API', 'api'),
  ('Frontend', 'frontend'),
  ('Backend', 'backend'),
  ('Full Stack', 'full-stack')
ON CONFLICT (slug) DO NOTHING;

/* ============================================================================
   12. Completion Notice
   ============================================================================ */

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '📋 Created tables: admins, categories, tags, posts, post_tags, security_logs, login_attempts, comments, comment_rate_limits, session_comments, post_views, comment_reactions';
  RAISE NOTICE '🔧 Functions: is_admin(), log_security_event(), log_login_attempt()';
  RAISE NOTICE '🛡️ RLS policies applied to all tables';
  RAISE NOTICE '📊 Initial data inserted for categories and tags';
  RAISE NOTICE '💬 Comments system ready with nested comments, reactions, and rate limiting';
  RAISE NOTICE '📈 Post views tracking system ready';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Next steps:';
  RAISE NOTICE '   1. Add your admin user: INSERT INTO admins (user_id) VALUES (''your-uuid-here'');';
  RAISE NOTICE '   2. Test admin function: SELECT is_admin();';
  RAISE NOTICE '   3. Configure storage policies if needed';
  RAISE NOTICE '   4. Test enhanced comments system with nested replies and reactions';
  RAISE NOTICE '   5. Test post views tracking system';
END $$;