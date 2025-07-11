/* ============================================================================
   RLS 무한 재귀 문제 완전 해결
   ============================================================================ */

-- 1. 먼저 is_admin 함수를 사용하는 모든 정책들 삭제
DROP POLICY IF EXISTS posts_admin_full ON posts;
DROP POLICY IF EXISTS categories_admin_full ON categories;
DROP POLICY IF EXISTS tags_admin_full ON tags;
DROP POLICY IF EXISTS post_tags_admin_full ON post_tags;
DROP POLICY IF EXISTS security_logs_admin_only ON security_logs;
DROP POLICY IF EXISTS login_attempts_admin_only ON login_attempts;

-- 2. admins 테이블의 문제가 있는 정책들 삭제
DROP POLICY IF EXISTS admins_super_admin_only ON admins;
DROP POLICY IF EXISTS admins_self_access ON admins;
DROP POLICY IF EXISTS admins_authenticated_read ON admins;

-- 3. admins 테이블에서 RLS 완전 비활성화
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 4. is_admin 함수 재생성 (SECURITY DEFINER 사용)
DROP FUNCTION IF EXISTS is_admin();

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

-- 4. 함수 사용 권한 부여
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;

-- 5. 다른 테이블들의 정책 재생성 (is_admin 함수 사용)
-- posts 테이블
CREATE POLICY posts_admin_full
  ON posts FOR ALL
  USING (is_admin());

-- categories 테이블
CREATE POLICY categories_admin_full
  ON categories FOR ALL
  USING (is_admin());

-- tags 테이블
CREATE POLICY tags_admin_full
  ON tags FOR ALL
  USING (is_admin());

-- post_tags 테이블
CREATE POLICY post_tags_admin_full
  ON post_tags FOR ALL
  USING (is_admin());

-- security_logs 테이블 (있다면)
CREATE POLICY security_logs_admin_only
  ON security_logs FOR ALL
  USING (is_admin());

-- login_attempts 테이블 (있다면)
CREATE POLICY login_attempts_admin_only
  ON login_attempts FOR ALL
  USING (is_admin());

-- 6. 확인용 쿼리
DO $$
BEGIN
  RAISE NOTICE '✅ RLS 무한 재귀 문제 해결 완료!';
  RAISE NOTICE '📋 적용된 변경사항:';
  RAISE NOTICE '   - admins 테이블 RLS 비활성화';
  RAISE NOTICE '   - is_admin() 함수 SECURITY DEFINER로 재생성';
  RAISE NOTICE '   - 다른 테이블들의 정책 재생성';
  RAISE NOTICE '🔧 테스트 명령어:';
  RAISE NOTICE '   SELECT is_admin();';
END $$;