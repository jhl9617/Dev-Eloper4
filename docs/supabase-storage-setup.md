# Supabase Storage 설정 가이드

## 1. Storage Bucket 생성

### 1.1 Supabase 대시보드 접속
1. [Supabase 대시보드](https://app.supabase.com)에 로그인
2. 프로젝트 선택 (`yluknwkjgzoplkymozgf`)
3. 왼쪽 메뉴에서 **Storage** 클릭

### 1.2 Bucket 생성
1. **"Create bucket"** 버튼 클릭
2. 다음 정보로 bucket 생성:
   ```
   Bucket name: images
   Public bucket: ✅ (체크 활성화)
   File size limit: 5MB
   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
   ```
3. **"Create bucket"** 클릭

## 2. Storage 정책 설정

### 2.1 SQL 스크립트 실행
1. Supabase 대시보드에서 **SQL Editor** 메뉴 클릭
2. `docs/setup-storage.sql` 파일의 내용을 복사
3. SQL 에디터에 붙여넣기
4. **"Run"** 버튼 클릭

### 2.2 정책 확인
생성될 정책들:
- **Public Access**: 모든 사용자가 이미지 조회 가능
- **Authenticated users can upload**: 로그인한 사용자만 업로드 가능
- **Users can delete own images**: 업로드한 사용자만 삭제 가능
- **Users can update own images**: 업로드한 사용자만 수정 가능
- **Admins can manage all images**: 관리자는 모든 이미지 관리 가능

## 3. 테스트 방법

### 3.1 이미지 업로드 테스트
1. 관리자로 로그인 (`admin@devblog.com`)
2. `/admin/posts/new`에서 새 포스트 작성
3. "Cover Image" 섹션에서 이미지 업로드 테스트
4. 드래그 앤 드롭 또는 파일 선택으로 이미지 업로드

### 3.2 확인 사항
- ✅ 이미지 업로드 성공
- ✅ 업로드된 이미지 미리보기 표시
- ✅ 업로드된 이미지 URL 생성
- ✅ 에러 메시지 없음

## 4. 문제 해결

### 4.1 일반적인 오류들

#### "Bucket not found" 에러
- **원인**: `images` bucket이 생성되지 않음
- **해결**: 위의 1.2 단계에 따라 bucket 생성

#### "Permission denied" 에러
- **원인**: Storage 정책이 설정되지 않음
- **해결**: 위의 2.1 단계에 따라 SQL 스크립트 실행

#### "File too large" 에러
- **원인**: 5MB 이상의 파일 업로드 시도
- **해결**: 파일 크기 확인 후 압축 또는 다른 파일 사용

### 4.2 디버깅 방법
1. **브라우저 개발자 도구** 콘솔에서 에러 메시지 확인
2. **Supabase 대시보드** > **Storage** > **images** bucket에서 파일 확인
3. **Network** 탭에서 업로드 요청 상태 확인

## 5. 운영 환경 고려사항

### 5.1 보안 설정
- 파일 크기 제한 (현재 5MB)
- MIME 타입 검증 (이미지 파일만 허용)
- 인증된 사용자만 업로드 허용

### 5.2 성능 최적화
- CDN 설정 (Supabase는 자동으로 CDN 제공)
- 이미지 압축 (클라이언트 측에서 처리)
- 캐시 설정 (현재 1시간)

### 5.3 백업 및 관리
- 정기적인 Storage 사용량 모니터링
- 불필요한 이미지 파일 정리
- 백업 정책 수립

## 6. 추가 개선사항

### 6.1 이미지 최적화
- 이미지 리사이징 (자동 썸네일 생성)
- WebP 변환 (브라우저 지원 시)
- 압축 품질 설정

### 6.2 기능 확장
- 이미지 편집 기능 (크롭, 회전)
- 다중 이미지 업로드
- 이미지 갤러리 관리

이 가이드에 따라 설정하면 블로그 포스트에서 이미지 업로드가 정상적으로 작동할 것입니다.