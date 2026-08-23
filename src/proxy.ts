import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isPublicRoute } from '@/lib/supabase/proxy-routing';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
  
  // Define role-based route protection for API
  const protectedApiRoutes = [
    '/api/users/me',
    '/api/storage/upload',
    '/api/lansia',
    '/api/helper',
    '/api/helpers',
    '/api/koordinator',
    '/api/booking',
  ];

  // Define role-based route protection for Frontend
  const protectedFrontendRoutes = [
    '/admin',
    '/koordinator',
    '/helper',
    '/keluarga',
  ];
  
  // API Route Checks
  const isAdminApiRoute = pathname.startsWith('/api/admin');
  const isKoordinatorApiRoute = pathname.startsWith('/api/koordinator') || /^\/api\/helper\/[^/]+\/(approve|reject)$/.test(pathname);
  const isHelperApiRoute =
    pathname.startsWith('/api/helper/apply') ||
    pathname.startsWith('/api/helper/profile') ||
    pathname.startsWith('/api/helper/queue');
  const isKeluargaApiRoute = pathname.startsWith('/api/lansia');
  const isBookingApiRoute = pathname.startsWith('/api/booking');
  
  // Frontend Route Checks
  const isAdminFrontendRoute = pathname.startsWith('/admin');
  const isKoordinatorFrontendRoute = pathname.startsWith('/koordinator');
  const isHelperFrontendRoute = pathname.startsWith('/helper');
  const isKeluargaFrontendRoute = pathname.startsWith('/keluarga');
  
  // Check if route requires authentication
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isProtectedFrontendRoute = protectedFrontendRoutes.some(route => pathname.startsWith(route));
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
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // If user is logged in, check role-based access
  if (user) {
    // Get user role from database
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    const userRole = userProfile?.role;
    
    // API Role-based access control
    if (isAdminApiRoute && userRole !== 'admin') {
      return NextResponse.json({ error: 'forbidden', message: 'Hanya admin yang dapat mengakses resource ini' }, { status: 403 });
    }
    if (isKoordinatorApiRoute && userRole !== 'koordinator' && userRole !== 'admin') {
      return NextResponse.json({ error: 'forbidden', message: 'Hanya koordinator dan admin yang dapat mengakses resource ini' }, { status: 403 });
    }
    if (isHelperApiRoute && userRole !== 'helper' && userRole !== 'admin') {
      return NextResponse.json({ error: 'forbidden', message: 'Hanya helper dan admin yang dapat mengakses resource ini' }, { status: 403 });
    }
    if (isKeluargaApiRoute && userRole !== 'keluarga' && userRole !== 'admin') {
      return NextResponse.json({ error: 'forbidden', message: 'Hanya keluarga dan admin yang dapat mengakses resource ini' }, { status: 403 });
    }
    if (isBookingApiRoute && userRole !== 'keluarga' && userRole !== 'admin') {
      return NextResponse.json({ error: 'forbidden', message: 'Hanya keluarga dan admin yang dapat membuat pemesanan' }, { status: 403 });
    }

    // Frontend Role-based access control
    if (isAdminFrontendRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (isKoordinatorFrontendRoute && userRole !== 'koordinator' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (isHelperFrontendRoute && userRole !== 'helper' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (isKeluargaFrontendRoute && userRole !== 'keluarga' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
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

