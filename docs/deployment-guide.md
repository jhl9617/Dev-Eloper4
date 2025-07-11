# 배포 가이드 (Deployment Guide)

## 📋 배포 전 체크리스트

### 1. 환경 변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Supabase 프로젝트 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `docs/database-schema.sql` 파일 실행
3. Row Level Security (RLS) 정책 활성화
4. 관리자 계정 생성 (수동으로 role을 'admin'으로 설정)

---

## 🚀 배포 옵션

### Option 1: Vercel (추천)

#### 장점
- Next.js 최적화
- 자동 배포
- 무료 플랜 제공
- 도메인 및 SSL 자동 설정

#### 배포 단계
1. **GitHub 저장소 생성**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/your-blog.git
   git push -u origin main
   ```

2. **Vercel 배포**
   - [Vercel](https://vercel.com)에서 GitHub 연결
   - 저장소 선택 후 배포
   - 환경 변수 설정 (Settings > Environment Variables)

3. **환경 변수 설정**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ```

### Option 2: Netlify

#### 배포 단계
1. **빌드 설정**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **환경 변수 설정**
   - Site settings > Environment variables에서 설정

### Option 3: 자체 서버 (VPS/Docker)

#### Docker 배포
```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 배포 명령어
docker build -t devblog .
docker run -p 3000:3000 --env-file .env.local devblog
```

---

## 🔧 배포 후 설정

### 1. 관리자 계정 생성
```sql
-- Supabase SQL Editor에서 실행
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';
```

### 2. 도메인 설정
- DNS 설정에서 A 레코드 또는 CNAME 설정
- SSL 인증서 자동 발급 확인

### 3. 성능 최적화
- Vercel Analytics 활성화
- Core Web Vitals 모니터링
- CDN 최적화 확인

### 4. SEO 설정
- Google Search Console 등록
- 사이트맵 제출 (자동 생성됨)
- robots.txt 확인

---

## 📊 모니터링 및 유지보수

### 1. 성능 모니터링
- **Web Vitals**: 개발자 도구 콘솔에서 확인
- **Lighthouse**: 성능 점수 정기 확인
- **Vercel Analytics**: 트래픽 및 성능 분석

### 2. 데이터베이스 관리
- **정기 백업**: Supabase 대시보드에서 설정
- **RLS 정책**: 보안 규칙 정기 점검
- **인덱스 최적화**: 검색 성능 향상

### 3. 콘텐츠 관리
- **정기 포스팅**: SEO 및 사용자 유지
- **이미지 최적화**: 로딩 속도 향상
- **카테고리 정리**: 콘텐츠 구조화

---

## 🛠️ 문제 해결

### 일반적인 문제들

#### 1. 빌드 오류
```bash
# TypeScript 오류 확인
npm run build
npx tsc --noEmit

# 의존성 문제 해결
npm install
npm audit fix

# 빌드 캐시 정리 (Turbopack 오류 시)
rm -rf .next
npm run dev
```

#### 2. Supabase 연결 오류
- 환경 변수 확인
- RLS 정책 검토
- 네트워크 설정 확인

#### 3. 이미지 로딩 문제
- Next.js Image 컴포넌트 사용
- 이미지 최적화 설정
- CDN 설정 확인

#### 4. 검색 기능 오류
- PostgreSQL 전문 검색 설정
- 인덱스 생성 확인
- 검색 벡터 업데이트

---

## 📈 성능 최적화 팁

### 1. 이미지 최적화
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['your-supabase-url.supabase.co'],
  },
}
```

### 2. 캐싱 전략
- Static Generation (SSG) 활용
- Incremental Static Regeneration (ISR)
- CDN 캐싱 설정

### 3. 번들 크기 최적화
```bash
# 번들 분석
npm run build
npx @next/bundle-analyzer
```

---

## 🔒 보안 고려사항

### 1. 환경 변수 보안
- 민감한 정보는 서버사이드에서만 사용
- `.env.local`을 `.gitignore`에 추가
- 프로덕션 환경변수 별도 관리

### 2. Supabase 보안
- RLS 정책 엄격히 설정
- API 키 정기 갱신
- 접근 로그 모니터링

### 3. 콘텐츠 보안
- XSS 방지 (react-markdown 사용)
- CSRF 토큰 활용
- 입력 데이터 검증

---

## 📞 지원 및 문의

### 문서 참고
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)

### 추가 개발 및 커스터마이징
- 이미지 업로드 기능 추가
- 댓글 시스템 구현
- 뉴스레터 구독 기능
- 고급 SEO 최적화

---

## 🎯 마무리

이 가이드를 따라 성공적으로 배포하면 완전히 기능하는 모던 블로그 플랫폼을 얻을 수 있습니다. 추가 기능이나 커스터마이징이 필요하면 CLAUDE.md 파일을 참고하여 개발을 계속할 수 있습니다.

**🚀 Happy Blogging!**