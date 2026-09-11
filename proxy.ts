import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve auth status and user details from cookies using the request object
  const hasToken = request.cookies.has('access_token');
  const userCookie = request.cookies.get('user')?.value;

  let isAdmin = false;
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      if (user.role === 'admin') {
        isAdmin = true;
      }
    } catch {}
  }

  const isPublicRoute = pathname === '/login';

  // Redirect unauthorized users to the login page
  if (!isPublicRoute && (!hasToken || !isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    if (pathname !== '/' && pathname !== '/login') {
      url.searchParams.set('redirectTo', pathname);
    }
    return NextResponse.redirect(url);
  }

  // Redirect authenticated admins away from the login page
  if (isPublicRoute && hasToken && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
