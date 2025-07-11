# 🔒 DevBlog 보안 설정 가이드

## 개요

이 가이드는 DevBlog 플랫폼의 보안을 강화하기 위한 단계별 설정 방법을 제공합니다.

## 🚨 중요 사항

> ⚠️ **운영 환경 배포 전 필수 설정**
> 
> 아래 모든 보안 설정을 완료한 후 운영 환경에 배포하세요.

## 1. 데이터베이스 보안 설정

### 1.1 보안 강화 스크립트 실행

```bash
# Supabase SQL 편집기에서 실행
psql -f docs/security-enhancements.sql
```

### 1.2 RLS 정책 확인

```sql
-- 모든 테이블의 RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- 정책 목록 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 2. 환경 변수 보안 설정

### 2.1 환경 변수 파일 권한 설정

```bash
# .env.local 파일 권한 제한
chmod 600 .env.local

# 환경 변수 파일 백업
cp .env.local .env.local.backup
chmod 600 .env.local.backup
```

### 2.2 민감한 정보 분리

```bash
# 개발 환경과 운영 환경 분리
# .env.development
# .env.production
```

## 3. 관리자 계정 보안 설정

### 3.1 초기 관리자 설정

```sql
-- 관리자 계정 추가 (실제 UUID로 변경)
INSERT INTO admins (user_id) 
VALUES ('your-actual-admin-uuid');
```

### 3.2 MFA 설정

1. **관리자 로그인**
   - `/admin/settings` 페이지 접근
   - "다단계 인증" 섹션에서 "설정하기" 클릭

2. **인증 앱 설정**
   - Google Authenticator, Authy, Microsoft Authenticator 등 사용
   - QR 코드 스캔 또는 시크릿 키 수동 입력

3. **인증 완료**
   - 6자리 인증 코드 입력
   - 설정 완료 확인

## 4. 비밀번호 정책 설정

### 4.1 강력한 비밀번호 요구사항

- **최소 8자 이상**
- **대문자 포함**
- **소문자 포함**
- **숫자 포함**
- **특수문자 포함**

### 4.2 비밀번호 변경 주기

```javascript
// 비밀번호 변경 알림 (3개월)
const PASSWORD_EXPIRY_DAYS = 90;
```

## 5. 네트워크 보안 설정

### 5.1 HTTPS 강제 설정

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
```

### 5.2 CSP 헤더 설정

```javascript
// Content Security Policy
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
}
```

## 6. 모니터링 및 로깅

### 6.1 보안 대시보드 확인

```sql
-- 보안 통계 조회
SELECT * FROM security_dashboard;
```

### 6.2 로그 모니터링

```sql
-- 최근 로그인 시도 확인
SELECT * FROM security_logs 
WHERE event_type = 'login_attempt' 
AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

-- 의심스러운 활동 확인
SELECT * FROM security_logs 
WHERE event_type = 'suspicious_activity'
ORDER BY created_at DESC;
```

## 7. 정기적인 보안 점검

### 7.1 주간 점검 항목

- [ ] 보안 로그 검토
- [ ] 비정상적인 로그인 시도 확인
- [ ] 차단된 IP 주소 검토
- [ ] 관리자 계정 활동 확인

### 7.2 월간 점검 항목

- [ ] 비밀번호 변경 권장
- [ ] MFA 설정 상태 확인
- [ ] 보안 업데이트 적용
- [ ] 백업 데이터 확인

## 8. 사고 대응 절차

### 8.1 보안 사고 발생 시

1. **즉시 조치**
   ```sql
   -- 의심스러운 계정 비활성화
   UPDATE auth.users SET email_confirmed_at = NULL WHERE email = 'suspicious@email.com';
   
   -- IP 차단 (임시)
   INSERT INTO login_attempts (ip_address, blocked_until) 
   VALUES ('suspicious.ip.address', now() + interval '24 hours');
   ```

2. **로그 수집**
   ```sql
   -- 관련 로그 수집
   SELECT * FROM security_logs 
   WHERE created_at > now() - interval '7 days'
   AND (ip_address = 'suspicious.ip' OR user_id = 'suspicious.user.id');
   ```

3. **복구 절차**
   - 비밀번호 강제 변경
   - MFA 재설정
   - 시스템 무결성 확인

## 9. 보안 체크리스트

### 9.1 배포 전 필수 확인사항

- [ ] RLS 정책 활성화 확인
- [ ] 관리자 계정 MFA 설정 완료
- [ ] 강력한 비밀번호 정책 적용
- [ ] 보안 로깅 시스템 활성화
- [ ] 환경 변수 보안 설정 완료
- [ ] HTTPS 강제 설정 완료
- [ ] 보안 헤더 설정 완료

### 9.2 운영 중 정기 확인사항

- [ ] 보안 대시보드 모니터링
- [ ] 로그인 시도 패턴 분석
- [ ] 비정상 접근 시도 감지
- [ ] 시스템 업데이트 적용

## 10. 추가 보안 권장사항

### 10.1 인프라 보안

- **WAF (Web Application Firewall) 설정**
- **DDoS 보호 서비스 활용**
- **정기적인 보안 스캔 실행**

### 10.2 코드 보안

- **정기적인 의존성 업데이트**
- **보안 취약점 스캔**
- **코드 리뷰 강화**

## 11. 연락처 및 지원

### 11.1 보안 사고 신고

```
보안 사고 발생시 즉시 연락:
- 시스템 관리자: admin@devblog.com
- 긴급 연락처: [전화번호]
```

### 11.2 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase 보안 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js 보안 가이드](https://nextjs.org/docs/authentication)

---

## 📝 변경 이력

| 날짜 | 버전 | 변경사항 |
|------|------|----------|
| 2024-01-XX | 1.0.0 | 초기 보안 가이드 작성 |
| 2024-01-XX | 1.1.0 | MFA 설정 가이드 추가 |
| 2024-01-XX | 1.2.0 | 로깅 시스템 가이드 추가 |

**⚠️ 이 문서는 정기적으로 업데이트되며, 최신 보안 표준을 반영합니다.**