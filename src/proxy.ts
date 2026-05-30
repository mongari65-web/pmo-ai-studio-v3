import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Routes réservées aux plans payants (starter / pro / premium)
const PRO_ROUTES = ["/portfolio", "/ressources", "/templates", "/propale"]

export async function proxy(request: NextRequest) {
  // ── MODE MAINTENANCE (lu depuis Supabase app_config) ────
  const { pathname } = request.nextUrl
  const isMaintenancePage = pathname === '/maintenance'
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname === '/sitemap.xml' || pathname === '/robots.txt'
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiRoute = pathname.startsWith('/api')

  // Maintenance : MAINTENANCE_MODE=true dans Vercel env vars
  const maintenanceActive = process.env.MAINTENANCE_MODE === 'true'
  const isAuthRoute = pathname.startsWith('/auth')
  if (maintenanceActive && !isMaintenancePage && !isStaticAsset && !isAdminRoute && !isApiRoute && !isAuthRoute) {
    // Temporairement stocker pour check admin plus bas
    // La redirection maintenance se fait après vérification admin
  }
  // ─────────────────────────────────────────────────────────

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // ── Check maintenance avec bypass admin ─────────────────────
  if (maintenanceActive && !isMaintenancePage && !isStaticAsset && !isAdminRoute && !isApiRoute && !isAuthRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin, plan")
      .eq("id", user.id)
      .single()
    const isAdminUser = adminProfile?.is_admin === true || ['premium','pro'].includes(adminProfile?.plan ?? '')
    if (!isAdminUser) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  // ── Redirect unauthenticated users ──────────────────────────
  const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/callback", "/auth/connexion", "/auth/inscription", "/auth/forgot-password", "/auth/reset-password"]
  const isPublic = publicPaths.some(p => path === p) || path.startsWith("/api/") || path.startsWith("/embed/") || path.startsWith("/legal/") || path === "/changelog" || path === "/about" || path.startsWith("/blog") || path.endsWith(".html") || path.startsWith("/landing") || path === "/pricing" || path === "/demo" || path.startsWith("/demo") || path === "/contact" || path === "/auth/forgot-password" || path === "/auth/reset-password"
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    const response = NextResponse.redirect(url)
    request.cookies.getAll().forEach(cookie => {
      if (cookie.name.includes("supabase") || cookie.name.includes("sb-")) {
        response.cookies.delete(cookie.name)
      }
    })
    return response
  }
  // Redirect to dashboard if already logged in
  if (user && (path === "/auth/login" || path === "/auth/register" || path === "/")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // ── Protect /admin routes ────────────────────────────────────
  if (path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
    // Vérifier admin_users OU profiles.is_admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single()
    const { data: profileAdmin } = await supabase
      .from("profiles")
      .select("is_admin, plan")
      .eq("id", user.id)
      .single()
    const isAdminUser = !!adminUser || profileAdmin?.is_admin === true || ['premium','pro'].includes(profileAdmin?.plan ?? '')
    if (!isAdminUser) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      url.searchParams.set("error", "unauthorized")
      return NextResponse.redirect(url)
    }
  }

  // ── ProGate : routes réservées aux plans payants ─────────────
  if (user && PRO_ROUTES.some(r => path.startsWith(r))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_id")
      .eq("id", user.id)
      .single()
    const plan = profile?.plan_id ?? "free"
    const hasPaidPlan = ["starter", "pro", "premium"].includes(plan)

    if (!hasPaidPlan) {
      const url = request.nextUrl.clone()
      url.pathname = "/pricing"
      url.searchParams.set("locked", "true")
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
