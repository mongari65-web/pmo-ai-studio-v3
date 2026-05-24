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
  { href: "/admin/emails",        icon: Bell,            label: "Emails",           group: "outils" },
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
    <div style={{ display:"flex", height:"100vh", background:"var(--bg)", overflow:"hidden" }}>
      <aside style={{ width:200, flexShrink:0, background:"var(--bg-card)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Shield size={15} style={{ color:"#ef4444" }}/>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>Admin Panel</p>
            <p style={{ fontSize:10, color:"#ef4444", margin:0 }}>Accès restreint</p>
          </div>
        </div>

        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          {GROUPS.map(group => {
            const items = NAV.filter(n => n.group === group.id)
            return (
              <div key={group.id} style={{ marginBottom:16 }}>
                <p style={{ fontSize:10, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.05em", padding:"0 8px", marginBottom:4, margin:"0 0 4px" }}>{group.label}</p>
                {items.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href
                  return (
                    <Link key={href} href={href} style={{
                      display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
                      borderRadius:8, fontSize:12, marginBottom:2, textDecoration:"none",
                      background: active ? "var(--primary-bg)" : "transparent",
                      color: active ? "var(--primary-light)" : "var(--text-2)",
                      fontWeight: active ? 600 : 400,
                    }}>
                      <Icon size={13} style={{ flexShrink:0 }}/>
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <div style={{ padding:"8px", borderTop:"1px solid var(--border)" }}>
          <Link href="/dashboard" style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8, fontSize:12, color:"var(--text-2)", textDecoration:"none", marginBottom:2 }}>
            <ChevronRight size={13} style={{ transform:"rotate(180deg)" }}/>
            Retour app
          </Link>
          <button onClick={logout} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8, fontSize:12, color:"var(--text-2)", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
            <LogOut size={13}/>
            Déconnexion
          </button>
        </div>
      </aside>

      <main style={{ flex:1, overflowY:"auto" }}>{children}</main>
    </div>
  )
}
