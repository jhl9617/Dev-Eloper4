'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      
      let isAdmin = false;
      if (user) {
        // admin@devblog.com 이메일로 관리자 권한 부여 (임시)
        isAdmin = user.email === 'admin@devblog.com';
        
        // Debug info for admin verification
        console.log('Admin login:', user.email === 'admin@devblog.com' ? '✅' : '❌', user.email);
      }

      setAuthState({ user, isAdmin, loading: false });
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        
        let isAdmin = false;
        if (user) {
          // admin@devblog.com 이메일로 관리자 권한 부여 (임시)
          isAdmin = user.email === 'admin@devblog.com';
          
          // Debug info for admin verification
          console.log('Auth change:', event, user.email === 'admin@devblog.com' ? '✅' : '❌', user.email);
        }

        setAuthState({ user, isAdmin, loading: false });

        if (event === 'SIGNED_IN') {
          router.refresh();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAuthState({ user: null, isAdmin: false, loading: false });
      router.push('/');
      router.refresh();
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  return {
    ...authState,
    signIn,
    signOut,
    signUp,
  };
}