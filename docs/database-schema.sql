/* ============================================================================
   확장 설정
   ============================================================================ */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID 생성
CREATE EXTENSION IF NOT EXISTS pgcrypto;        -- (선택) 암호화/해시 함수
-- CREATE EXTENSION IF NOT EXISTS citext;      -- 대소문자 무시 텍스트(원하면 사용)

/* ============================================================================
   ENUM - 글 상태
   ============================================================================ */
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
    CREATE TYPE post_status AS ENUM ('draft',     -- 작성 중
                                     'scheduled', -- 예약 발행
                                     'published', -- 공개
                                     'archived'); -- 숨김/보관
  END IF;
END $$;

/* ============================================================================
   관리자 식별용 테이블
   (JWT 의 auth.uid() 와 매핑하여 RLS 에서 확인)
   ============================================================================ */
CREATE TABLE IF NOT EXISTS admins (
    user_id UUID PRIMARY KEY,      -- Supabase / PostgREST 의 유저 UUID
    added_at TIMESTAMPTZ DEFAULT now()
);
/* 실제 서비스 시 관리자 계정을 여기 등록 */
-- INSERT INTO admins (user_id) VALUES ('00000000-0000-0000-0000-000000000000');

/* ============================================================================
   공통 트리거 함수 ─ updated_at 자동 갱신
   ============================================================================ */
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* ============================================================================
   공통 트리거 함수 ─ posts.search_vector 자동 생성
   ============================================================================ */
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
   카테고리
   ============================================================================ */
CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    deleted_at  TIMESTAMPTZ,                       -- 소프트 삭제용
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    CONSTRAINT categories_slug_chk
      CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT categories_slug_uniq UNIQUE (slug)
);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/* ============================================================================
   태그
   ============================================================================ */
CREATE TABLE IF NOT EXISTS tags (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    deleted_at  TIMESTAMPTZ,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    CONSTRAINT tags_slug_chk
      CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT tags_slug_uniq UNIQUE (slug)
);

CREATE TRIGGER trg_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/* ============================================================================
   게시글
   ============================================================================ */
CREATE TABLE IF NOT EXISTS posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    deleted_at      TIMESTAMPTZ,

    status          post_status  DEFAULT 'draft',   -- ENUM
    published_at    TIMESTAMPTZ,                    -- 공개 시각 (예약 포함)

    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    slug            TEXT NOT NULL,
    cover_image_path TEXT,
    category_id     BIGINT REFERENCES categories(id)
                    ON DELETE SET NULL ON UPDATE CASCADE,

    search_vector   TSVECTOR                        -- 전체 텍스트 검색

    /* 복합 유니크:
       - slug 는 논리적으로 고유(URL 용)
       - deleted_at IS NULL 조건부 부분 UNIQUE 로 “같은 슬러그 재사용” 허용 */
);
-- 조건부 고유(slug 재사용 허용)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_posts_slug_live
  ON posts(slug) WHERE deleted_at IS NULL;

/* 인덱스들 */
CREATE INDEX IF NOT EXISTS idx_posts_status_pubat
  ON posts(status, coalesce(published_at, created_at) DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON posts(created_at DESC);

/* 트리거 */
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_posts_tsv
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_posts_search_vector();

/* ============================================================================
   글-태그 다대다
   ============================================================================ */
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID   REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  BIGINT REFERENCES tags(id)  ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (post_id, tag_id)
);

/* ============================================================================
   (선택) 글 수정 이력
   ============================================================================ */
CREATE TABLE IF NOT EXISTS post_revisions (
    id         BIGSERIAL PRIMARY KEY,
    post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
    title      TEXT,
    content    TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID                               -- auth.uid() 기록(옵션)
);

/* ============================================================================
   RLS(행 수준 보안) 설정
   ============================================================================ */
ALTER TABLE posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags   ENABLE ROW LEVEL SECURITY;

/* -- Helper: 관리자 여부 ---------------------------------------------------- */
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1
                 FROM admins a
                 WHERE a.user_id = auth.uid())
$$;

/* -- posts ------------------------------------------------------------------ */
-- ① 일반 사용자: 공개 글만 조회
CREATE POLICY posts_public_select
  ON posts FOR SELECT
  USING (status = 'published'
         AND deleted_at IS NULL);

-- ② 관리자: 모든 작업 가능
CREATE POLICY posts_admin_full
  ON posts FOR ALL
  USING (is_admin());      -- 조건 절 + WITH CHECK 생략 시 동일 로직 적용

/* -- categories ------------------------------------------------------------- */
CREATE POLICY categories_public_select
  ON categories FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY categories_admin_full
  ON categories FOR ALL
  USING (is_admin());

/* -- tags ------------------------------------------------------------------- */
CREATE POLICY tags_public_select
  ON tags FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY tags_admin_full
  ON tags FOR ALL
  USING (is_admin());

/* -- post_tags -------------------------------------------------------------- */
CREATE POLICY post_tags_public_select
  ON post_tags FOR SELECT USING (true);

CREATE POLICY post_tags_admin_full
  ON post_tags FOR ALL
  USING (is_admin());

/* ============================================================================
   샘플 데이터
   ============================================================================ */
INSERT INTO categories (name, slug)
VALUES ('Technology','technology'),
       ('Web Development','web-development'),
       ('Tutorial','tutorial'),
       ('Personal','personal')
ON CONFLICT DO NOTHING;

INSERT INTO tags (name, slug)
VALUES ('JavaScript','javascript'),
       ('TypeScript','typescript'),
       ('React','react'),
       ('Next.js','nextjs'),
       ('CSS','css'),
       ('HTML','html'),
       ('Programming','programming'),
       ('Frontend','frontend'),
       ('Backend','backend'),
       ('Database','database')
ON CONFLICT DO NOTHING;

/* ============================================================================
   ✅  끝!  이 스키마를 적용한 뒤
      1) admins 테이블에 관리자 user_id 추가
      2) Supabase 등에서 “scheduled → published” 전환 Job 설정
      3) 필요 시 RSS/검색 API 뷰 작성
   ============================================================================ */
