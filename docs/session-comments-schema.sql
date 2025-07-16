-- Session Comments 테이블 (사용자 댓글 삭제 권한 관리)
-- 댓글 작성 후 30분 내에 본인이 삭제할 수 있는 기능을 위한 테이블

CREATE TABLE IF NOT EXISTS session_comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ DEFAULT now(),
    session_id      VARCHAR(128) NOT NULL,
    comment_id      UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    expires_at      TIMESTAMPTZ NOT NULL,
    
    UNIQUE(session_id, comment_id)
);

-- Session comments 인덱스
CREATE INDEX IF NOT EXISTS idx_session_comments_session_id
  ON session_comments(session_id);

CREATE INDEX IF NOT EXISTS idx_session_comments_expires_at
  ON session_comments(expires_at);

-- 정리용 함수 (선택사항 - 만료된 세션 정리)
CREATE OR REPLACE FUNCTION cleanup_expired_session_comments()
RETURNS void AS $$
BEGIN
  DELETE FROM session_comments 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- 주기적으로 만료된 세션 정리 (예: 매일 자정)
-- SELECT cron.schedule('cleanup-expired-sessions', '0 0 * * *', 'SELECT cleanup_expired_session_comments();');