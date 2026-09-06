import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import {
  getApiRouteAccess,
  getFrontendRouteAccess,
  getRoleHome,
  isPublicRoute,
  type AppRole,
} from '@/lib/supabase/proxy-routing';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const frontendAccess = getFrontendRouteAccess(pathname);
  const apiAccess = getApiRouteAccess(pathname);

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Update session first
  const supabaseResponse = await updateSession(request);
  
  // Create Supabase client to check user role
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get user and their role
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if route requires authentication
  const isProtectedApiRoute = apiAccess !== null && apiAccess !== 'public';
  const isProtectedFrontendRoute = frontendAccess !== null && frontendAccess !== 'public';
  const isProtectedRoute = isProtectedApiRoute || isProtectedFrontendRoute;
  
  // If route requires authentication but user is not logged in
  if (isProtectedRoute && !user) {
    if (isProtectedApiRoute) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Anda harus login untuk mengakses resource ini' },
        { status: 401 }
      );
    } else {
      // Redirect to login page for frontend routes
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // If user is logged in, check role-based access
  if (user) {
    // Get user role from database
    const { data: userProfileById } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    let userProfile = userProfileById;
    if (!userProfile && user.email) {
      const { data: userProfileByEmail } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email.toLowerCase())
        .maybeSingle();
      userProfile = userProfileByEmail;
    }
      
    const metadataRole = user.user_metadata?.role;
    const userRole = (userProfile?.role ?? (
      metadataRole === 'keluarga' || metadataRole === 'helper' || metadataRole === 'koordinator' || metadataRole === 'admin'
        ? metadataRole
        : undefined
    )) as AppRole | undefined;
    
    const isLansiaDetailApi = pathname.startsWith('/api/lansia/');
    const isAllowedLansiaRole = isLansiaDetailApi && (userRole === 'admin' || userRole === 'koordinator');

    if (Array.isArray(apiAccess) && (!userRole || (!apiAccess.includes(userRole) && !isAllowedLansiaRole))) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Role Anda tidak memiliki akses ke resource ini' },
        { status: 403 },
      );
    }

    // Frontend role boundaries are exact. Admin does not impersonate product roles.
    if (
      frontendAccess !== null &&
      frontendAccess !== 'public' &&
      frontendAccess !== 'authenticated' &&
      userRole !== frontendAccess
    ) {
      return NextResponse.redirect(new URL(userRole ? getRoleHome(userRole) : '/login', request.url));
    }
  }
  
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export default proxy;

