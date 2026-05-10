"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BarChart3, Shield, Settings, LogOut, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const NAV = [
  { href: "/admin",        icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: "/admin/users",  icon: Users,            label: "Utilisateurs" },
  { href: "/admin/stats",  icon: BarChart3,        label: "Statistiques" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar admin */}
      <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col">
        {/* Logo admin */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Shield size={16} className="text-red-400"/>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Admin Panel</p>
            <p className="text-[10px] text-red-400">Accès restreint</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                pathname === href ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}>
              <Icon size={15} className="flex-shrink-0"/>
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Back + Logout */}
        <div className="px-2 py-3 border-t border-border space-y-0.5">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
            <ChevronRight size={15} className="rotate-180 flex-shrink-0"/>
            Retour app
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
            <LogOut size={15} className="flex-shrink-0"/>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
