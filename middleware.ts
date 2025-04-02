import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si le chemin commence par /admin
  if (pathname.startsWith('/admin')) {
    const session = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Rediriger vers la page de connexion si non authentifié
    if (!session) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // Vérifier le rôle admin
    if (session.role !== 'ADMIN') {
      return new NextResponse('Accès refusé', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
