/* ============================================================================
   보안 정책 수정 - 무한 재귀 문제 해결
   ============================================================================ */

-- 1. 기존 is_admin 함수 삭제
DROP FUNCTION IF EXISTS is_admin();

-- 2. 새로운 is_admin 함수 생성 (SECURITY DEFINER로 권한 상승)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER -- 함수 소유자(postgres) 권한으로 실행
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid()
  );
$$;

-- 3. 함수 사용 권한 부여
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;

-- 4. 기존 admins 테이블 정책 삭제
DROP POLICY IF EXISTS admins_super_admin_only ON admins;

-- 5. 새로운 admins 테이블 정책 생성 (함수 의존성 제거)
CREATE POLICY admins_self_access ON admins
  FOR ALL USING (
    user_id = auth.uid() OR 
    user_id IN (
      SELECT user_id FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- 6. 관리자 확인용 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW admin_check AS
SELECT 
  auth.uid() as current_user_id,
  EXISTS(SELECT 1 FROM admins WHERE user_id = auth.uid()) as is_admin,
  now() as checked_at;

-- 뷰 접근 권한 설정
GRANT SELECT ON admin_check TO authenticated;

-- 7. 확인용 쿼리
DO $$
BEGIN
  RAISE NOTICE '✅ 보안 정책 수정 완료!';
  RAISE NOTICE '🔧 다음 명령어로 테스트하세요:';
  RAISE NOTICE '   SELECT is_admin();';
  RAISE NOTICE '   SELECT * FROM admin_check;';
END $$;