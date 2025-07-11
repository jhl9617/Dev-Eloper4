/* ============================================================================
   Supabase Storage Bucket 설정
   ============================================================================ */

-- 1. Storage bucket 생성
-- 참고: bucket 생성은 Supabase 대시보드에서 수동으로 해야 합니다.
-- 이 스크립트는 정책(Policy) 설정만 담당합니다.

-- 2. Storage 정책 설정
-- images bucket에 대한 정책들

-- 2.1 공개 읽기 정책 (모든 사용자가 이미지 볼 수 있음)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 2.2 인증된 사용자 업로드 정책 (로그인한 사용자만 업로드)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- 2.3 업로드한 사용자만 삭제 가능
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' 
  AND auth.uid() = owner
);

-- 2.4 업로드한 사용자만 업데이트 가능
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images' 
  AND auth.uid() = owner
);

-- 3. 관리자 전용 정책 (관리자는 모든 이미지 관리 가능)
CREATE POLICY "Admins can manage all images"
ON storage.objects FOR ALL
USING (
  bucket_id = 'images' 
  AND auth.jwt() ->> 'email' = 'admin@devblog.com'
);

-- 4. 테스트 쿼리
DO $$
BEGIN
  RAISE NOTICE '✅ Storage 정책 설정 완료!';
  RAISE NOTICE '🔧 다음 단계: Supabase 대시보드에서 "images" bucket을 수동으로 생성하세요.';
  RAISE NOTICE '📋 Bucket 설정:';
  RAISE NOTICE '   - 이름: images';  
  RAISE NOTICE '   - 공개 접근: 활성화';
  RAISE NOTICE '   - 파일 크기 제한: 5MB';
END $$;