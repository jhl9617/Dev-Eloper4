import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Environment variable validation
function validateEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Missing required Supabase environment variables');
  }
  
  return { url, key };
}

// Service role environment variable validation
function validateServiceRoleEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    throw new Error('Missing required Supabase service role environment variables');
  }
  
  return { url, serviceKey };
}

export async function createClient() {
  const { url, key } = validateEnvVars();
  const cookieStore = await cookies()

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn('Cookie setting failed in server component:', error)
          }
        },
      },
    }
  )
}

// Create a simplified client for public read-only operations
export function createPublicClient() {
  const { url, key } = validateEnvVars();
  
  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for public client
        },
      },
    }
  )
}

// Create a service role client that bypasses RLS
export function createServiceRoleClient() {
  const { url, serviceKey } = validateServiceRoleEnvVars();
  
  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}