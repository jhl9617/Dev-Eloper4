/* ============================================================================
   임시 관리자 테이블 접근 수정
   ============================================================================ */

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS admins_self_access ON admins;
DROP POLICY IF EXISTS admins_super_admin_only ON admins;

-- 2. 간단한 정책 생성 (임시)
CREATE POLICY admins_authenticated_read ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

-- 3. 기존 is_admin 함수 삭제 후 재생성
DROP FUNCTION IF EXISTS is_admin();

-- 4. 새로운 is_admin 함수 (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid()
  );
$$;

-- 5. 함수 권한 부여
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;

-- 6. 테스트 쿼리
DO $$
BEGIN
  RAISE NOTICE '✅ 관리자 테이블 접근 수정 완료!';
  RAISE NOTICE '🔧 테스트: SELECT is_admin();';
END $$;