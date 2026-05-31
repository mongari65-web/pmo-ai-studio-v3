"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { LayoutDashboard, FolderKanban, Wand2, BarChart3, Bell, CreditCard, Settings, LogOut, ChevronLeft, ChevronRight, ArrowLeft, GraduationCap, Package, Lock, Brain, Users, FileText, Briefcase, Building2, Settings2, CalendarRange, Target, Map, Zap, BookOpen, Share2} from "lucide-react"

// Groupes sidebar avec séparateurs
const NAV_GROUPS = [
  {
    label: null, // Pas de titre pour le groupe principal
    items: [
      { href:"/dashboard",    icon:LayoutDashboard, label:"Dashboard" },
      { href:"/projects",     icon:FolderKanban,    label:"Mes projets" },
      { href:"/guide",        icon:Wand2,           label:"Guide CP",    hl:true },
    ]
  },
  {
    label: "Vue Portfolio",
    items: [
      { href:"/portfolio",    icon:BarChart3,    label:"Portfolio RAG" },
      { href:"/timeline",     icon:CalendarRange, label:"Timeline" },
      { href:"/okr-global",   icon:Target,        label:"OKR Global" },
      { href:"/roadmap",      icon:Map,           label:"Roadmap" },
    ]
  },
  {
    label: "Outils CP",
    items: [

      { href:"/propale",      icon:Briefcase,   label:"Propale / Contrat", hl:true },
      { href:"/templates",    icon:Package,     label:"Templates Pro",     pro:true },
    ]
  },
  {
    label: "Gestion",
    items: [
      { href:"/ressources",   icon:Users,     label:"Ressources" },
      { href:"/clients",      icon:Building2, label:"Clients" },
      { href:"/members",       icon:Users,     label:"Membres" },
      { href:"/share",         icon:Share2,    label:"Partager projets" },
    ]
  },
  {
    label: "Formation Gestion de Projet",
    items: [
      { href:"/simulateur-certif",icon:GraduationCap, label:"Simulateur Certif.",    hl:true, pro:true },
      { href:"/quiz-certif",     icon:Zap,            label:"Quiz Certifications",  hl:true },
      { href:"/conseils-management", icon:GraduationCap,  label:"Conseils Management" },
      { href:"/blog",         icon:BookOpen,       label:"Blog PMO" },
      { href:"/nouveau-pm",   icon:GraduationCap,  label:"Guide Nouveau PM" },
      { href:"/scrum-guide",  icon:Zap,            label:"Guide Scrum" },
      { href:"/disc",         icon:Brain,          label:"Analyse DISC",     hl:true },
    ]
  },
  {
    label: null,
    items: [
      { href:"/configuration",icon:Settings2, label:"Configuration" },
    ]
  },
]
const TOP = NAV_GROUPS.flatMap(g => g.items)
const BOT = [
  { href:"/notifications", icon:Bell,       label:"Notifications", badge:true },
  { href:"/pricing",       icon:CreditCard, label:"Abonnement" },
  { href:"/settings",      icon:Settings,   label:"Paramètres" },
]

const LI = ({ href, icon:Icon, label, active, collapsed, extra, pro }: any) => (
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
  const goBack = () => router.back()

  return (
    <aside style={{ width:col?60:220, flexShrink:0, background:"var(--sidebar)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, transition:"width 0.2s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 14px 12px", borderBottom:"1px solid var(--border)" }}>
        <div style={{ width:32, height:32, borderRadius:8, background:"#0F172A", border:"1px solid rgba(123,94,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="13" r="6" fill="#7B5EFF"/>
            <text x="16" y="15.5" textAnchor="middle" fontFamily="Arial" fontSize="5" fontWeight="900" fill="#fff">PMO</text>
            <circle cx="7" cy="6" r="3" fill="#1e40af"/>
            <circle cx="25" cy="6" r="3" fill="#166534"/>
            <circle cx="6" cy="20" r="3" fill="#92400e"/>
            <circle cx="26" cy="20" r="3" fill="#991b1b"/>
            <circle cx="16" cy="26" r="3" fill="#5b21b6"/>
            <line x1="11" y1="9" x2="9" y2="8" stroke="#3b82f6" strokeWidth="1"/>
            <line x1="21" y1="9" x2="23" y2="8" stroke="#22c55e" strokeWidth="1"/>
            <line x1="11" y1="17" x2="8" y2="19" stroke="#f59e0b" strokeWidth="1"/>
            <line x1="21" y1="17" x2="24" y2="19" stroke="#ef4444" strokeWidth="1"/>
            <line x1="16" y1="19" x2="16" y2="23" stroke="#8b5cf6" strokeWidth="1"/>
          </svg>
        </div>
        {!col && <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700, color:"var(--text-1)" }}>PMO AI</div><div style={{ fontSize:10, color:"var(--text-3)" }}>Studio</div></div>}
        <button onClick={()=>setCol(!col)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", padding:4, marginLeft:col?"auto":0, display:"flex", alignItems:"center" }}>
          {col ? <ChevronRight size={13}/> : <ChevronLeft size={13}/>}
        </button>
      </div>

      <nav style={{ flex:1, padding:"8px 8px", display:"flex", flexDirection:"column", gap:0, overflowY:"auto", overflowX:"hidden", minHeight:0, scrollbarWidth:"thin" }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginBottom:4 }}>
            {group.label && !col && (
              <div style={{ fontSize:9, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", padding:"8px 10px 4px", marginTop:gi>0?4:0 }}>
                {group.label}
              </div>
            )}
            {group.label && !col && <div style={{ height:1, background:"var(--border)", margin:"0 4px 4px" }}/>}
            {group.items.map(({href,icon,label,hl,pro}:any)=>(
              <LI key={href} href={href} icon={icon} label={label} active={isActive(href)} collapsed={col}
                extra={!col ? (hl ? <span style={{ marginLeft:"auto", fontSize:9, padding:"1px 6px", background:"var(--warning-bg)", color:"var(--warning)", borderRadius:10, fontWeight:700 }}>IA</span> : pro ? <Lock size={11} style={{ marginLeft:"auto", color:"var(--text-3)", flexShrink:0 }}/> : null) : null}/>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ height:1, background:"var(--border)", margin:"0 8px" }}/>

      <div style={{ padding:"10px 8px", display:"flex", flexDirection:"column", gap:1 }}>
        {BOT.map(({href,icon,label,badge})=>(
          <LI key={href} href={href} icon={icon} label={label} active={isActive(href)} collapsed={col}
            extra={badge && unread>0 && !col ? <span style={{ marginLeft:"auto", background:"var(--danger-b)", color:"#fff", borderRadius:10, fontSize:9, padding:"1px 5px", fontWeight:700 }}>{unread>9?"9+":unread}</span> : null}/>
        ))}
        <button onClick={goBack} style={{ display:"flex", alignItems:"center", gap:10, padding:col?"9px 0":"8px 10px", justifyContent:col?"center":"flex-start", borderRadius:"var(--r8)", border:"1px solid var(--border)", background:"transparent", cursor:"pointer", fontSize:13, color:"var(--primary-light)", width:"100%", marginBottom:4 }} title="Page précédente">
          <ArrowLeft size={16}/>
          {!col && <span>Retour</span>}
        </button>
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
