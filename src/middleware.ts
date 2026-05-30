import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── MAINTENANCE MODE ─────────────────────────────────────────
  const maintenance = process.env.MAINTENANCE_MODE === "true"
  if (maintenance) {
    // Laisser passer : page maintenance, assets, api health
    const bypass =
      pathname.startsWith("/maintenance") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/health") ||
      pathname.startsWith("/favicon") ||
      pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
    if (!bypass) {
      return NextResponse.redirect(new URL("/maintenance", request.url))
    }
    return NextResponse.next()
  }

  // ── AUTH ──────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cs) {
          cs.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse = NextResponse.next({ request })
            supabaseResponse.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Routes publiques — pas de redirect
  const publicPaths = ["/", "/pricing", "/demo", "/blog", "/contact", "/changelog", "/auth"]
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/changelog") ||
    pathname.startsWith("/maintenance") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/) !== null

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/auth/connexion", request.url))
  }

  if (user && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
}
