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
      console.log('🔄 Getting initial session...');
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      console.log('🔄 Initial session result:', { hasUser: !!user, email: user?.email });
      
      let isAdmin = false;
      if (user) {
        // Check if user is admin by querying admins table
        console.log('🔍 Checking admin status for user ID:', user.id);
        
        try {
          const { data: adminData, error } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', user.id)
            .single();
          
          if (!error && adminData) {
            isAdmin = true;
            console.log('🔍 User found in admins table');
          } else {
            console.log('🔍 User not found in admins table:', error?.message);
            isAdmin = false;
          }
        } catch (error) {
          console.error('🔍 Error checking admin table:', error);
          isAdmin = false;
        }
      }

      console.log('🔄 Setting auth state:', { hasUser: !!user, isAdmin });
      setAuthState({ user, isAdmin, loading: false });
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        
        let isAdmin = false;
        if (user) {
          // Check if user is admin by querying admins table
          console.log('🔍 Auth change - checking admin status for user ID:', user.id);
          
          try {
            const { data: adminData, error } = await supabase
              .from('admins')
              .select('user_id')
              .eq('user_id', user.id)
              .single();
            
            if (!error && adminData) {
              isAdmin = true;
              console.log('🔍 Auth change - user found in admins table');
            } else {
              console.log('🔍 Auth change - user not found in admins table:', error?.message);
              isAdmin = false;
            }
          } catch (error) {
            console.error('🔍 Auth change - error checking admin table:', error);
            isAdmin = false;
          }
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
    console.log('🔐 Starting signIn process for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('🔐 Supabase signIn response:', { 
        hasUser: !!data?.user, 
        hasSession: !!data?.session, 
        error: error?.message 
      });
      
      return { data, error };
    } catch (error) {
      console.error('🔐 SignIn error caught:', error);
      return { data: null, error };
    }
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