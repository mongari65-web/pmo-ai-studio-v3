import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
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

  // ── Redirect unauthenticated users ──────────────────────────
  const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/callback"]
  const isPublic = publicPaths.some(p => path === p) || path.startsWith("/api/")

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // ── Protect /admin routes ────────────────────────────────────
  if (path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    // Vérifier si l'utilisateur est admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (!adminUser) {
      // Pas admin → rediriger vers dashboard avec message
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      url.searchParams.set("error", "unauthorized")
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
