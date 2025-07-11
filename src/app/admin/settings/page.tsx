'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Shield, Smartphone, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MFASetup } from '@/components/auth/mfa-setup';
import { PasswordStrength } from '@/components/auth/password-strength';

export default function AdminSettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [securityStats, setSecurityStats] = useState<any>(null);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (user && isAdmin) {
      checkMFAStatus();
      loadSecurityStats();
    }
  }, [user, isAdmin]);

  const checkMFAStatus = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      setMfaEnabled(data && data.totp && data.totp.length > 0);
    } catch (error) {
      console.error('MFA 상태 확인 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityStats = async () => {
    try {
      const { data } = await supabase
        .from('security_dashboard')
        .select('*')
        .single();
      setSecurityStats(data);
    } catch (error) {
      console.error('보안 통계 로드 오류:', error);
    }
  };

  const disableMFA = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp && factors.totp.length > 0) {
        await supabase.auth.mfa.unenroll({ factorId: factors.totp[0].id });
        setMfaEnabled(false);
        toast({
          title: 'MFA 비활성화 완료',
          description: '다단계 인증이 비활성화되었습니다.',
        });
      }
    } catch (error) {
      toast({
        title: '오류 발생',
        description: 'MFA 비활성화 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleMFASetupComplete = () => {
    setShowMFASetup(false);
    setMfaEnabled(true);
  };

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            관리자 권한이 필요합니다.
          </AlertDescription>
        </Alert>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm">디버그 정보:</p>
          <p className="text-sm">사용자: {user?.email || 'Not logged in'}</p>
          <p className="text-sm">관리자 여부: {isAdmin ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  if (showMFASetup) {
    return (
      <div className="container py-8">
        <MFASetup onComplete={handleMFASetupComplete} />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">관리자 설정</h1>
        <p className="text-muted-foreground">
          계정 보안 및 시스템 설정을 관리합니다.
        </p>
      </div>

      <div className="grid gap-6">
        {/* 보안 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              보안 설정
            </CardTitle>
            <CardDescription>
              계정 보안을 강화하기 위한 설정을 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* MFA 설정 */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="font-medium">다단계 인증 (MFA)</span>
                  {mfaEnabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      활성화
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      비활성화
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {mfaEnabled 
                    ? '계정이 다단계 인증으로 보호되고 있습니다.'
                    : '추가 보안 계층을 위해 MFA를 활성화하세요.'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                {mfaEnabled ? (
                  <Button 
                    variant="outline" 
                    onClick={disableMFA}
                    className="text-red-600 hover:text-red-700"
                  >
                    비활성화
                  </Button>
                ) : (
                  <Button onClick={() => setShowMFASetup(true)}>
                    설정하기
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* 보안 통계 */}
            {securityStats && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">최근 24시간 활동</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>로그인 시도:</span>
                      <span className="font-mono">{securityStats.login_attempts_24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>로그인 실패:</span>
                      <span className="font-mono text-red-600">{securityStats.login_failures_24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>관리자 작업:</span>
                      <span className="font-mono">{securityStats.admin_actions_24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>차단된 IP:</span>
                      <span className="font-mono">{securityStats.blocked_ips_count}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">보안 상태</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {mfaEnabled ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm">다단계 인증</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">로그인 제한 활성화</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">보안 로깅 활성화</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 계정 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              계정 정보
            </CardTitle>
            <CardDescription>
              현재 로그인된 계정의 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">이메일:</span>
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">사용자 ID:</span>
                <span className="text-sm font-mono">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">계정 생성일:</span>
                <span className="text-sm">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">최종 로그인:</span>
                <span className="text-sm">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ko-KR') : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 보안 권장사항 */}
        <Card>
          <CardHeader>
            <CardTitle>보안 권장사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">강력한 비밀번호 사용</p>
                  <p className="text-sm text-muted-foreground">
                    최소 8자 이상, 대소문자, 숫자, 특수문자를 포함하세요.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">다단계 인증 활성화</p>
                  <p className="text-sm text-muted-foreground">
                    계정 보안을 위해 MFA를 반드시 활성화하세요.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">정기적인 비밀번호 변경</p>
                  <p className="text-sm text-muted-foreground">
                    3-6개월마다 비밀번호를 변경하는 것을 권장합니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">보안 로그 모니터링</p>
                  <p className="text-sm text-muted-foreground">
                    정기적으로 보안 로그를 확인하여 의심스러운 활동을 감지하세요.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}