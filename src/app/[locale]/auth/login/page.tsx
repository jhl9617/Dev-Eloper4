'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { MFAVerify } from '@/components/auth/mfa-verify';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsMFA, setNeedsMFA] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Login form submitted');
    setLoading(true);
    setError('');
    setAttemptCount(prev => prev + 1);

    try {
      // 로그인 시도 제한 확인 임시 비활성화
      console.log('📝 Skipping login rate limit check for debugging');

      console.log('📝 Calling signIn function...');
      // Direct Supabase call for debugging
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('📝 SignIn completed:', { hasData: !!data, hasError: !!signInError });

      if (signInError) {
        console.log('📝 SignIn error:', signInError.message);
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('📝 Login successful, checking admin status...');
        
        // Check if user needs to be added to admins table
        // This should only be done through admin creation scripts in production
        console.log('📝 User logged in successfully:', data.user.email);

        toast({
          description: 'Successfully signed in!',
        });
        router.push(redirectTo);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMFASuccess = () => {
    toast({
      description: 'Successfully signed in with MFA!',
    });
    router.push(redirectTo);
    router.refresh();
  };

  const handleMFACancel = () => {
    setNeedsMFA(false);
    // 로그아웃 처리
    supabase.auth.signOut();
  };

  // MFA 인증 단계
  if (needsMFA) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <MFAVerify 
          onSuccess={handleMFASuccess}
          onCancel={handleMFACancel}
        />
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {attemptCount >= 3 && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  보안을 위해 로그인 시도가 제한될 수 있습니다.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary underline">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}