import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── MODE MAINTENANCE ─────────────────────────────────────
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  const isMaintenancePage = pathname === '/maintenance'
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon')
  // Bypass pour l'admin (via cookie ou IP — ici on bypass sur /admin)
  const isAdmin = pathname.startsWith('/admin') || req.cookies.get('bypass_maintenance')?.value === process.env.MAINTENANCE_BYPASS_KEY

  if (maintenanceMode && !isMaintenancePage && !isStaticAsset && !isAdmin) {
    return NextResponse.redirect(new URL('/maintenance', req.url))
  }

  // Si maintenance désactivée et on est sur /maintenance → rediriger vers home
  if (!maintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL('/', req.url))
  }


  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
