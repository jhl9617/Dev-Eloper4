'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { QrCode, Shield, Smartphone, Copy, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MFASetupProps {
  onComplete?: () => void;
}

export function MFASetup({ onComplete }: MFASetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const supabase = createClient();

  const setupMFA = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ 
        factorType: 'totp',
        friendlyName: 'Dev-eloper Admin App'
      });
      
      if (error) throw error;
      
      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setStep('verify');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: secret,
        challengeId: secret,
        code: verificationCode
      });
      
      if (error) throw error;
      
      setStep('complete');
      toast({
        title: '다단계 인증 설정 완료',
        description: '이제 로그인할 때 인증 코드가 필요합니다.',
      });
      
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: '복사 완료',
      description: '시크릿 키가 클립보드에 복사되었습니다.',
    });
  };

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>다단계 인증 설정</CardTitle>
          <CardDescription>
            계정 보안을 강화하기 위해 MFA를 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">필요한 앱:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Google Authenticator</Badge>
              <Badge variant="outline">Authy</Badge>
              <Badge variant="outline">Microsoft Authenticator</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">설정 과정:</h4>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. 인증 앱에서 QR 코드 스캔</li>
              <li>2. 생성된 6자리 코드 입력</li>
              <li>3. MFA 설정 완료</li>
            </ol>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={setupMFA} 
            disabled={loading}
            className="w-full"
          >
            <Smartphone className="mr-2 h-4 w-4" />
            {loading ? 'MFA 설정 중...' : 'MFA 설정 시작'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle>QR 코드 스캔</CardTitle>
          <CardDescription>
            인증 앱에서 QR 코드를 스캔하고 생성된 코드를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="flex justify-center">
              <div 
                className="p-4 bg-white rounded-lg border"
                dangerouslySetInnerHTML={{ __html: qrCode }}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">수동 입력용 시크릿 키</Label>
            <div className="flex gap-2">
              <Input 
                value={secret} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={copySecret}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification-code">인증 코드 (6자리)</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg font-mono"
              maxLength={6}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setStep('setup')}
              disabled={loading}
            >
              이전
            </Button>
            <Button 
              onClick={verifyMFA}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1"
            >
              {loading ? '확인 중...' : '인증 완료'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle>MFA 설정 완료</CardTitle>
        <CardDescription>
          다단계 인증이 성공적으로 설정되었습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            이제 로그인할 때 인증 앱에서 생성된 6자리 코드를 입력해야 합니다.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">중요 사항:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 인증 앱을 삭제하지 마세요</li>
            <li>• 시크릿 키를 안전한 곳에 보관하세요</li>
            <li>• 새 기기에서 앱을 다시 설정할 때 필요합니다</li>
          </ul>
        </div>

        <Button 
          onClick={onComplete}
          className="w-full"
        >
          완료
        </Button>
      </CardContent>
    </Card>
  );
}