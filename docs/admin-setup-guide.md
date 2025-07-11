# 관리자 계정 설정 및 블로그 포스트 작성 가이드

## 🎯 완전한 시나리오: 관리자 로그인 → 포스트 작성 → 발행

### 1단계: Supabase 프로젝트 설정

1. **Supabase 계정 생성**
   - [Supabase](https://supabase.com)에서 새 프로젝트 생성
   - 프로젝트 이름: `DevBlog` (또는 원하는 이름)

2. **데이터베이스 스키마 적용**
   - Supabase 대시보드 → SQL Editor
   - `docs/database-schema.sql` 파일 내용 전체 복사 후 실행
   - 성공 메시지 확인

3. **환경 변수 설정**
   ```bash
   # .env.local 파일 생성
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3001
   ```

### 2단계: 관리자 계정 생성

1. **Supabase Auth를 통한 사용자 생성**
   - Supabase 대시보드 → Authentication → Users
   - "Add user" 버튼 클릭
   - 이메일: `admin@example.com` (또는 원하는 이메일)
   - 비밀번호: 강력한 비밀번호 설정
   - "Create user" 클릭

2. **관리자 권한 부여**
   - Supabase 대시보드 → SQL Editor
   - 생성된 사용자의 UUID 복사 (Authentication > Users에서 확인)
   - 다음 SQL 실행:
   ```sql
   INSERT INTO admins (user_id) VALUES ('사용자의-실제-UUID-여기에-붙여넣기');
   ```

3. **초기 데이터 설정**
   - `scripts/setup-admin.sql` 파일 내용 실행
   - 카테고리와 태그가 자동으로 생성됨

### 3단계: 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 확인
# http://localhost:3001
```

### 4단계: 관리자 로그인 시나리오

1. **로그인 페이지 접근**
   - 브라우저에서 `http://localhost:3001/auth/login` 접근
   - 또는 헤더의 사용자 아이콘 클릭

2. **로그인 정보 입력**
   - 이메일: 2단계에서 생성한 관리자 이메일
   - 비밀번호: 설정한 비밀번호
   - "Sign In" 버튼 클릭

3. **로그인 성공 확인**
   - 자동으로 `/admin` 대시보드로 리다이렉트
   - 관리자 대시보드에서 통계 정보 확인
   - 헤더에 "Admin Dashboard" 메뉴 표시

### 5단계: 새 포스트 작성 시나리오

1. **포스트 작성 페이지 접근**
   - 관리자 대시보드에서 "New Post" 버튼 클릭
   - 또는 직접 `/admin/posts/new` 접근

2. **포스트 내용 작성**
   - **제목**: "나의 첫 번째 블로그 포스트"
   - **슬러그**: 자동 생성됨 (`my-first-blog-post`)
   - **카테고리**: Programming 선택
   - **태그**: JavaScript, React 선택
   - **내용**: 마크다운 형식으로 작성
   ```markdown
   # 안녕하세요!
   
   이것은 저의 첫 번째 블로그 포스트입니다.
   
   ## 주요 기능
   - 마크다운 지원
   - 실시간 미리보기
   - 카테고리 및 태그 관리
   - SEO 최적화
   
   ```javascript
   console.log('Hello, World!');
   ```
   
   더 많은 내용을 작성해보세요!
   ```

3. **포스트 발행**
   - "Save Draft" 버튼으로 초안 저장 (선택사항)
   - "Publish Now" 버튼으로 즉시 발행

### 6단계: 발행된 포스트 확인

1. **공개 페이지에서 확인**
   - 홈페이지(`http://localhost:3001`)에서 포스트 확인
   - 포스트 제목 클릭하여 상세 페이지 이동
   - 카테고리 및 태그 링크 동작 확인

2. **관리자 페이지에서 관리**
   - `/admin/posts`에서 모든 포스트 목록 확인
   - 포스트 편집, 삭제 기능 사용

### 7단계: 추가 기능 활용

1. **검색 기능**
   - 헤더 검색창에서 키워드 검색
   - 실시간 검색 결과 확인

2. **다크 모드**
   - 헤더의 테마 토글 버튼 클릭
   - Light/Dark/System 모드 전환

3. **카테고리 관리**
   - `/admin/categories`에서 카테고리 추가/편집
   - 포스트 작성 시 새 카테고리 활용

## 🔧 문제 해결

### 로그인 오류
- 이메일/비밀번호 확인
- Supabase 프로젝트 URL 및 키 확인
- 관리자 권한 부여 여부 확인

### 포스트 작성 오류
- 필수 필드 (제목, 내용, 슬러그) 입력 확인
- 슬러그 중복 여부 확인
- 네트워크 연결 상태 확인

### 데이터베이스 연결 오류
- 환경 변수 설정 확인
- Supabase 프로젝트 상태 확인
- RLS 정책 설정 확인

## 🎉 완료!

이제 완전히 작동하는 블로그 시스템을 사용할 수 있습니다:
- ✅ 관리자 로그인
- ✅ 포스트 작성 및 발행
- ✅ 카테고리 및 태그 관리
- ✅ 검색 기능
- ✅ 다크 모드
- ✅ 반응형 디자인
- ✅ SEO 최적화

추가 질문이나 도움이 필요한 경우 [GitHub Issues](https://github.com/your-repo/issues)를 이용해주세요!