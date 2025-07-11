import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * 서버 사이드 관리자 권한 검증
 * 관리자 페이지에서 사용하여 권한을 확인합니다.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  
  // 1. 사용자 인증 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/auth/login?redirectTo=/admin');
  }

  // 2. 관리자 권한 확인 (이메일 기반 임시)
  const isAdmin = user.email === 'admin@devblog.com';

  if (!isAdmin) {
    redirect('/unauthorized');
  }

  return { user, isAdmin: true };
}

/**
 * 관리자 권한이 있는지 확인만 하고 리다이렉트하지 않음
 */
export async function checkAdminPermission() {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { user: null, isAdmin: false };
    }

    const isAdmin = user.email === 'admin@devblog.com';
    
    return { user, isAdmin };
  } catch (error) {
    console.error('Admin permission check error:', error);
    return { user: null, isAdmin: false };
  }
}

/**
 * 관리자 작업 로깅
 */
export async function logAdminAction(
  action: string,
  tableName: string,
  recordId: string,
  details?: Record<string, any>
) {
  const supabase = await createClient();
  
  try {
    const { user } = await requireAdmin();
    
    await supabase.rpc('log_admin_action', {
      p_action: action,
      p_table_name: tableName,
      p_record_id: recordId,
      p_details: details || {}
    });
  } catch (error) {
    console.error('Admin action logging error:', error);
    // 로깅 실패는 주요 기능을 차단하지 않음
  }
}