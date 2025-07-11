'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MFAVerifyProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MFAVerify({ onSuccess, onCancel }: MFAVerifyProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const supabase = createClient();

  const verifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: 'totp',
        challengeId: 'totp',
        code: verificationCode
      });
      
      if (error) throw error;
      
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyMFA();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle>다단계 인증</CardTitle>
        <CardDescription>
          인증 앱에서 생성된 6자리 코드를 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">인증 코드</Label>
          <Input
            id="mfa-code"
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={handleKeyDown}
            className="text-center text-lg font-mono"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button 
            onClick={verifyMFA}
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
          >
            <Smartphone className="mr-2 h-4 w-4" />
            {loading ? '확인 중...' : '인증 확인'}
          </Button>
          
          {onCancel && (
            <Button 
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full"
            >
              취소
            </Button>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            인증 앱에서 생성된 코드는 30초마다 변경됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}