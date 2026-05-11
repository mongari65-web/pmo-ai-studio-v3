"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { LayoutDashboard, FolderKanban, Wand2, BarChart3, Bell, CreditCard, Settings, LogOut, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"

const TOP = [
  { href:"/dashboard", icon:LayoutDashboard, label:"Dashboard" },
  { href:"/projects",  icon:FolderKanban,    label:"Mes projets" },
  { href:"/guide",     icon:Wand2,            label:"Guide CP", hl:true },
  { href:"/portfolio", icon:BarChart3,        label:"Portfolio" },
  { href:"/pmp-simulator",  icon:GraduationCap,  label:"Simulateur PMP", hl:true },
  { href:"/pmp-conseils",   icon:GraduationCap,  label:"Conseils PMP" },
  { href:"/nouveau-pm",      icon:GraduationCap,  label:"Guide Nouveau PM" },
]
const BOT = [
  { href:"/notifications", icon:Bell,       label:"Notifications", badge:true },
  { href:"/pricing",       icon:CreditCard, label:"Abonnement" },
  { href:"/settings",      icon:Settings,   label:"Paramètres" },
]

const LI = ({ href, icon:Icon, label, active, collapsed, extra }: any) => (
  <Link href={href} title={collapsed?label:""} style={{
    display:"flex", alignItems:"center", gap:10,
    padding: collapsed ? "9px 0" : "8px 10px",
    justifyContent: collapsed ? "center" : "flex-start",
    borderRadius:"var(--r8)", textDecoration:"none", fontSize:13,
    fontWeight: active ? 600 : 400,
    color: active ? "var(--primary)" : "var(--text-2)",
    background: active ? "var(--primary-bg)" : "transparent",
    borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
    transition:"all 0.12s", position:"relative"
  }}
  onMouseEnter={e=>{if(!active)(e.currentTarget as any).style.background="#f1f5f9"}}
  onMouseLeave={e=>{if(!active)(e.currentTarget as any).style.background="transparent"}}>
    <Icon size={15} style={{ flexShrink:0 }}/>
    {!collapsed && <span>{label}</span>}
    {extra}
  </Link>
)

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [col, setCol] = useState(false)
  const [unread, setUnread] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    supabase.from("notifications").select("id",{count:"exact",head:true}).eq("read",false)
      .then(({count})=>setUnread(count??0))
  }, [pathname])

  const isActive = (href: string) => pathname===href||(href!=="/dashboard"&&pathname.startsWith(href+"/"))
  const logout = async () => { await supabase.auth.signOut(); router.push("/auth/login") }

  return (
    <aside style={{ width:col?60:220, flexShrink:0, background:"var(--sidebar)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, transition:"width 0.2s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 14px 12px", borderBottom:"1px solid var(--border)" }}>
        <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#185FA5,#3C3489)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", flexShrink:0 }}>P</div>
        {!col && <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700, color:"var(--text-1)" }}>PMO AI</div><div style={{ fontSize:10, color:"var(--text-3)" }}>Studio</div></div>}
        <button onClick={()=>setCol(!col)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", padding:4, marginLeft:col?"auto":0, display:"flex", alignItems:"center" }}>
          {col ? <ChevronRight size={13}/> : <ChevronLeft size={13}/>}
        </button>
      </div>

      <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:1 }}>
        {TOP.map(({href,icon,label,hl})=>(
          <LI key={href} href={href} icon={icon} label={label} active={isActive(href)} collapsed={col}
            extra={!col && hl ? <span style={{ marginLeft:"auto", fontSize:9, padding:"1px 6px", background:"var(--warning-bg)", color:"var(--warning)", borderRadius:10, fontWeight:700 }}>IA</span> : null}/>
        ))}
      </nav>

      <div style={{ height:1, background:"var(--border)", margin:"0 8px" }}/>

      <div style={{ padding:"10px 8px", display:"flex", flexDirection:"column", gap:1 }}>
        {BOT.map(({href,icon,label,badge})=>(
          <LI key={href} href={href} icon={icon} label={label} active={isActive(href)} collapsed={col}
            extra={badge && unread>0 && !col ? <span style={{ marginLeft:"auto", background:"var(--danger-b)", color:"#fff", borderRadius:10, fontSize:9, padding:"1px 5px", fontWeight:700 }}>{unread>9?"9+":unread}</span> : null}/>
        ))}
        <button onClick={logout} style={{ display:"flex", alignItems:"center", gap:10, padding:col?"9px 0":"8px 10px", justifyContent:col?"center":"flex-start", borderRadius:"var(--r8)", border:"none", background:"transparent", cursor:"pointer", fontSize:13, color:"var(--danger)", width:"100%", marginTop:2, transition:"all 0.12s" }}
          title={col?"Déconnexion":""}
          onMouseEnter={e=>(e.currentTarget as any).style.background="var(--danger-bg)"}
          onMouseLeave={e=>(e.currentTarget as any).style.background="transparent"}>
          <LogOut size={15} style={{ flexShrink:0 }}/>{!col&&"Déconnexion"}
        </button>
      </div>
    </aside>
  )
}
