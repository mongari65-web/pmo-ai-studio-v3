"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Wand2, FolderKanban, LogOut, Settings, Bell, ChevronLeft, ChevronRight, CreditCard, HelpCircle, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

const NAV = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects",   icon: FolderKanban,    label: "Mes projets" },
  { href: "/guide",      icon: Wand2,            label: "Guide CP ✨", highlight: true },
  { href: "/portfolio",  icon: BarChart3,        label: "Portfolio" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-card border-r border-border transition-all duration-300 sticky top-0",
      collapsed ? "w-16" : "w-56"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">P</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-foreground leading-none">PMO AI</p>
            <p className="text-[10px] text-muted-foreground">Studio</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
          {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label, highlight }) => (
          <Link key={href} href={href} className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
            pathname === href || pathname.startsWith(href + "/")
              ? "bg-primary text-white font-medium"
              : highlight
                ? "text-amber-400 hover:bg-amber-400/10"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}>
            <Icon size={16} className="flex-shrink-0"/>
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-border space-y-0.5">
        <Link href="/notifications" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell size={16}/>{!collapsed && "Notifications"}
        </Link>
        <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <Settings size={16}/>{!collapsed && "Paramètres"}
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <LogOut size={16}/>{!collapsed && "Déconnexion"}
        </button>
      </div>
    </aside>
  )
}
