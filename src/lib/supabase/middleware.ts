import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response?: NextResponse) {
  let supabaseResponse = response || NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Extract locale from pathname
  const pathSegments = request.nextUrl.pathname.split('/')
  const localeFromPath = pathSegments[1]
  const isLocaleRoute = ['en', 'ko'].includes(localeFromPath)
  const actualPath = isLocaleRoute ? '/' + pathSegments.slice(2).join('/') : request.nextUrl.pathname
  
  // Protect admin routes
  if (actualPath.startsWith('/admin')) {
    if (!user) {
      // No user, redirect to login
      const url = request.nextUrl.clone()
      const locale = isLocaleRoute ? localeFromPath : 'en'
      url.pathname = `/${locale}/auth/login`
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Check if user is admin by querying admins table
    console.log('🚦 Middleware - checking admin for user ID:', user.id);
    let isAdmin = false;
    
    try {
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (!error && adminData) {
        isAdmin = true;
        console.log('🚦 Middleware - user found in admins table');
      } else {
        console.log('🚦 Middleware - user not found in admins table:', error?.message);
        isAdmin = false;
      }
    } catch (error) {
      console.error('🚦 Middleware - error checking admin table:', error);
      isAdmin = false;
    }

    if (!isAdmin) {
      // User exists but is not admin
      const url = request.nextUrl.clone()
      const locale = isLocaleRoute ? localeFromPath : 'en'
      url.pathname = `/${locale}/unauthorized`
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}