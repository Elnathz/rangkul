import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database';

export async function middleware(request: NextRequest) {
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
  
  // Define role-based route protection
  const protectedRoutes = [
    '/api/users/me',
    '/api/storage/upload',
    // Add more protected routes here as they're created
  ];
  
  const isAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');
  const isKoordinatorRoute = request.nextUrl.pathname.startsWith('/api/koordinator');
  const isHelperRoute = request.nextUrl.pathname.startsWith('/api/helper');
  const isKeluargaRoute = request.nextUrl.pathname.startsWith('/api/lansia');
  const isBookingRoute = request.nextUrl.pathname.startsWith('/api/booking');
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // If route requires authentication but user is not logged in
  if (isProtectedRoute && !user) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Anda harus login untuk mengakses resource ini' },
      { status: 401 }
    );
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
    
    // Role-based access control
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Hanya admin yang dapat mengakses resource ini' },
        { status: 403 }
      );
    }
    
    if (isKoordinatorRoute && userRole !== 'koordinator' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Hanya koordinator dan admin yang dapat mengakses resource ini' },
        { status: 403 }
      );
    }
    
    if (isHelperRoute && userRole !== 'helper' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Hanya helper dan admin yang dapat mengakses resource ini' },
        { status: 403 }
      );
    }
    
    if (isKeluargaRoute && userRole !== 'keluarga' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Hanya keluarga dan admin yang dapat mengakses resource ini' },
        { status: 403 }
      );
    }
    
    if (isBookingRoute && userRole !== 'keluarga' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Hanya keluarga dan admin yang dapat membuat pemesanan' },
        { status: 403 }
      );
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

export default middleware;

