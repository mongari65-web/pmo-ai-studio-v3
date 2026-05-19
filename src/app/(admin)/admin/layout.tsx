"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BarChart3, Shield, LogOut, ChevronRight, CreditCard, Bell, Settings, TrendingUp, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const NAV = [
  { href: "/admin",               icon: LayoutDashboard, label: "Vue d'ensemble",   group: "principal" },
  { href: "/admin/users",         icon: Users,           label: "Utilisateurs",     group: "principal" },
  { href: "/admin/subscriptions", icon: CreditCard,      label: "Abonnements",      group: "revenue" },
  { href: "/admin/revenue",       icon: TrendingUp,      label: "Revenue",          group: "revenue" },
  { href: "/admin/notifications", icon: Bell,            label: "Notifications",    group: "outils" },
  { href: "/admin/config",        icon: Settings,        label: "Configuration",    group: "outils" },
  { href: "/admin/stats",         icon: BarChart3,       label: "Statistiques",     group: "outils" },
  { href: "/admin/security",      icon: Lock,            label: "Sécurité",         group: "securite" },
]

const GROUPS = [
  { id: "principal", label: "Principal" },
  { id: "revenue",   label: "Revenue" },
  { id: "outils",    label: "Outils" },
  { id: "securite",  label: "Sécurité" },
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
      <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Shield size={16} className="text-red-400"/>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Admin Panel</p>
            <p className="text-[10px] text-red-400">Accès restreint</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          {GROUPS.map(group => {
            const items = NAV.filter(n => n.group === group.id)
            return (
              <div key={group.id} className="mb-4">
                <p className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider px-3 mb-1">{group.label}</p>
                {items.map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href}
                    className={"flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all mb-0.5 " +
                      (pathname === href ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                    <Icon size={14} className="flex-shrink-0"/>
                    <span className="truncate text-xs">{label}</span>
                  </Link>
                ))}
              </div>
            )
          })}
        </nav>

        <div className="px-2 py-3 border-t border-border space-y-0.5">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
            <ChevronRight size={15} className="rotate-180 flex-shrink-0"/>
            <span className="text-xs">Retour app</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
            <LogOut size={15} className="flex-shrink-0"/>
            <span className="text-xs">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
