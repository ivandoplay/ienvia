import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Refresh the Supabase Auth cookie and require a verified user when the app is configured. */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Local prototype mode contains only fictitious data. Real deployments must configure Auth.
  if (!url || !anonKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  const isLogin = request.nextUrl.pathname === '/login';
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback';
  if ((!user || error) && !isLogin && !isAuthCallback) {
    const target = request.nextUrl.clone();
    target.pathname = '/login';
    target.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(target);
  }
  if (user && isLogin) {
    const target = request.nextUrl.clone();
    target.pathname = '/visao-geral';
    target.search = '';
    return NextResponse.redirect(target);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
