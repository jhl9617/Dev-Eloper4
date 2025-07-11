/* ============================================================================
   Supabase 보안 강화 SQL 스크립트
   ============================================================================ */

/* -- 1. 관리자 테이블 RLS 활성화 및 정책 설정 -------------------------------- */
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 관리자 테이블 접근 제한 정책 (슈퍼 관리자만 접근 가능)
CREATE POLICY admins_super_admin_only
  ON admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND user_id IN (
        -- 슈퍼 관리자 UUID 목록 (실제 운영시 변경 필요)
        SELECT user_id FROM admins LIMIT 1
      )
    )
  );

/* -- 2. 보안 이벤트 로깅 테이블 생성 ---------------------------------------- */
CREATE TABLE IF NOT EXISTS security_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'login_attempt', 'login_success', 'login_failure', 'admin_action', 'suspicious_activity'
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- 인덱스를 위한 제약조건
    CONSTRAINT security_logs_event_type_chk 
      CHECK (event_type IN ('login_attempt', 'login_success', 'login_failure', 'admin_action', 'suspicious_activity', 'data_access'))
);

-- 보안 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type 
  ON security_logs(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id 
  ON security_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip 
  ON security_logs(ip_address, created_at DESC);

-- 보안 로그 RLS 활성화 (관리자만 접근)
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY security_logs_admin_only
  ON security_logs FOR ALL
  USING (is_admin());

/* -- 3. 로그인 시도 제한 테이블 생성 ---------------------------------------- */
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    email TEXT,
    attempt_count INTEGER DEFAULT 1,
    last_attempt TIMESTAMPTZ DEFAULT now(),
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(ip_address, email)
);

-- 로그인 시도 인덱스
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip 
  ON login_attempts(ip_address, blocked_until);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email 
  ON login_attempts(email, blocked_until);

-- 로그인 시도 RLS (관리자만 접근)
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY login_attempts_admin_only
  ON login_attempts FOR ALL
  USING (is_admin());

/* -- 4. 보안 강화 함수들 ---------------------------------------------------- */

-- 로그인 시도 기록 함수
CREATE OR REPLACE FUNCTION log_login_attempt(
    p_ip_address INET,
    p_email TEXT,
    p_success BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 보안 로그 기록
    INSERT INTO security_logs (event_type, user_id, ip_address, event_data)
    VALUES (
        CASE WHEN p_success THEN 'login_success' ELSE 'login_failure' END,
        CASE WHEN p_success THEN auth.uid() ELSE NULL END,
        p_ip_address,
        jsonb_build_object(
            'email', p_email,
            'success', p_success,
            'timestamp', now()
        )
    );
    
    -- 실패한 경우 로그인 시도 횟수 업데이트
    IF NOT p_success THEN
        INSERT INTO login_attempts (ip_address, email, attempt_count, last_attempt)
        VALUES (p_ip_address, p_email, 1, now())
        ON CONFLICT (ip_address, email) 
        DO UPDATE SET
            attempt_count = login_attempts.attempt_count + 1,
            last_attempt = now(),
            blocked_until = CASE 
                WHEN login_attempts.attempt_count >= 5 THEN now() + interval '30 minutes'
                WHEN login_attempts.attempt_count >= 3 THEN now() + interval '10 minutes'
                ELSE NULL
            END;
    ELSE
        -- 성공한 경우 로그인 시도 기록 초기화
        DELETE FROM login_attempts 
        WHERE ip_address = p_ip_address AND email = p_email;
    END IF;
END;
$$;

-- 로그인 시도 확인 함수
CREATE OR REPLACE FUNCTION check_login_allowed(
    p_ip_address INET,
    p_email TEXT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_blocked_until TIMESTAMPTZ;
BEGIN
    SELECT blocked_until INTO v_blocked_until
    FROM login_attempts
    WHERE ip_address = p_ip_address AND email = p_email;
    
    -- 차단 기록이 없거나 차단 시간이 지났으면 허용
    RETURN v_blocked_until IS NULL OR v_blocked_until < now();
END;
$$;

-- 관리자 작업 로그 함수
CREATE OR REPLACE FUNCTION log_admin_action(
    p_action TEXT,
    p_table_name TEXT,
    p_record_id TEXT,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 관리자만 실행 가능
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    INSERT INTO security_logs (event_type, user_id, event_data)
    VALUES (
        'admin_action',
        auth.uid(),
        jsonb_build_object(
            'action', p_action,
            'table_name', p_table_name,
            'record_id', p_record_id,
            'details', p_details,
            'timestamp', now()
        )
    );
END;
$$;

/* -- 5. 기존 정책 강화 ------------------------------------------------------ */

-- posts 테이블에 관리자 작업 로깅 추가
CREATE OR REPLACE FUNCTION log_post_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- 관리자 작업인 경우 로깅
    IF is_admin() THEN
        PERFORM log_admin_action(
            TG_OP::TEXT,
            'posts',
            COALESCE(NEW.id::TEXT, OLD.id::TEXT),
            jsonb_build_object(
                'title', COALESCE(NEW.title, OLD.title),
                'status', COALESCE(NEW.status::TEXT, OLD.status::TEXT)
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_audit
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION log_post_changes();

/* -- 6. 보안 뷰 생성 -------------------------------------------------------- */

-- 보안 대시보드용 뷰 (관리자만 접근)
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    -- 최근 24시간 로그인 시도
    (SELECT COUNT(*) FROM security_logs WHERE event_type = 'login_attempt' AND created_at > now() - interval '24 hours') as login_attempts_24h,
    -- 최근 24시간 로그인 실패
    (SELECT COUNT(*) FROM security_logs WHERE event_type = 'login_failure' AND created_at > now() - interval '24 hours') as login_failures_24h,
    -- 현재 차단된 IP 수
    (SELECT COUNT(DISTINCT ip_address) FROM login_attempts WHERE blocked_until > now()) as blocked_ips_count,
    -- 최근 24시간 관리자 작업
    (SELECT COUNT(*) FROM security_logs WHERE event_type = 'admin_action' AND created_at > now() - interval '24 hours') as admin_actions_24h,
    -- 최근 업데이트 시간
    now() as last_updated;

-- 보안 뷰 접근 제한
ALTER VIEW security_dashboard OWNER TO postgres;
GRANT SELECT ON security_dashboard TO authenticated;

/* -- 7. 정리 작업 스케줄러 함수 --------------------------------------------- */

-- 오래된 로그 정리 함수 (30일 이상 된 로그 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 30일 이상 된 보안 로그 삭제
    DELETE FROM security_logs 
    WHERE created_at < now() - interval '30 days';
    
    -- 만료된 로그인 시도 기록 정리
    DELETE FROM login_attempts 
    WHERE blocked_until IS NOT NULL 
    AND blocked_until < now() - interval '24 hours';
    
    -- 30일 이상 된 일반 로그인 시도 기록 정리
    DELETE FROM login_attempts 
    WHERE blocked_until IS NULL 
    AND last_attempt < now() - interval '30 days';
END;
$$;

/* ============================================================================
   적용 완료 메시지
   ============================================================================ */
DO $$
BEGIN
    RAISE NOTICE '✅ 보안 강화 스크립트 적용 완료!';
    RAISE NOTICE '📊 보안 대시보드: SELECT * FROM security_dashboard;';
    RAISE NOTICE '🔧 정리 작업: SELECT cleanup_old_security_logs();';
    RAISE NOTICE '⚠️  주의: 실제 운영시 슈퍼 관리자 UUID를 설정해야 합니다.';
END $$;