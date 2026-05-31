"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { Users, Share2, Crown, Eye, Edit3, Search, Mail, Calendar, FolderOpen } from "lucide-react"
import Link from "next/link"

interface Member {
  id: string
  email: string
  full_name?: string
  plan?: string
  created_at: string
  project_count?: number
}

interface SharedProject {
  project_id: string
  role: string
  status: string
  project?: { name: string; icon?: string; color?: string }
}

const PLAN_CFG: Record<string, { label: string; color: string; bg: string }> = {
  free:     { label:"Gratuit",  color:"#64748b", bg:"rgba(100,116,139,0.12)" },
  starter:  { label:"Starter",  color:"#3b82f6", bg:"rgba(59,130,246,0.12)" },
  pro:      { label:"Pro",      color:"#8b5cf6", bg:"rgba(139,92,246,0.12)" },
  premium:  { label:"Premium",  color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
}

const ROLE_CFG: Record<string, { label: string; color: string; icon: any }> = {
  owner:  { label:"Propriétaire", color:"#f59e0b", icon:Crown  },
  editor: { labe  editor: { labe  editor: { labe  editor: { labe  e  v  editor: { labe  editor: { labe  editor: { labe  editor: { labe  e  v  editor: { labe  editor: { ag  editor: { labe  editor: {tMe  editor: { labe e<  editor: [])  editor: { lain  editor: { labe  eus  editor: { la const [search,   setSearch]   = useState("")
  const [selMember, setSelMember] = useState<Member|null>(null)
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch("/api/share-projects")
      const data = await res.json()
      setMembers(data.members ?? [])
      setLoading(false)
                                                                                > {
                                                                               t                                                                  , role, status")
      .eq("email", member.email)
    
    // Charger les noms des projets
    if (data?.length) {
      const projectIds = data.map((d: any) => d.project_id)
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, icon, color")
        .in("id", projectIds)
      
      setSharedProjects(data.map((d: any) => ({
        ...d,
        project: projects?.find((p: any) => p.id === d.project_id)
      })))
    } else {
      setSharedProjects([])
    }
    setLoadingProjects(false)
  }

  const removeAccess = async (projectId: string) => {
    if (!selMember) return
    await supa    await supa    await supa    await supa    await
                                  
                                                             v => prev.filter(p => p.project_id !== projectId))
  }

  const filtered = members.filter(m =>
    (m.full_name ?? m.email).toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px 32px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// GESTION</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Membres inscrits</h1>
            <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>Gérez les accès et les partages de projets</p>
          </div>
          <Link href="/share" style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, background:"linear-gradient(135deg,#1e40af,#3b82f6)", color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700 }}>
            <Share2 size={14}/> Partager des projets
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { label:"Total membres", value:members.length, color:"var(--primary)" },
            { label:"Premium", value:members.filter(m=>m.plan==="premium").length, color:"#f59e0b" },
            { label:"Pro", value:members.filter(m=>m.plan==="pro").length, color:"#8b5cf6" },
            { label:"Gratuit", value:members.filter(m=>!m.plan||m.plan==="free").length, color:"#64748b" },
          ].map((s,i) => (
            <div key={i} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {/* Liste membres */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <Users size={16} color="var(--primary-light)"/>
              <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:0 }}>
                {filtered.length} membre(s)
              </h3>
            </div>

            <div style={{ position:"relative", marginBottom:12 }}>
              <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{ width:"100%", padding:"8px 10px 8px 30px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg)", color:"var(--text-1)", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:420, overflowY:"auto" }}>
              {loading && <p style={{ fontSize:12, color:"var(--text-3)", textAlign:"center", padding:"20px 0" }}>Chargement...</p>}
              {!loading && filtered.length === 0 && <p style={{ fontSize:12, color:"var(--text-3)", textAlign:"center", padding:"20px 0" }}>Aucun membre</p>}
              {filtered.map(m => {
                const planCfg = PLAN_CFG[m.plan ?? "free"] ?? PLAN_CFG.free
                const isSelected = selMember?.id === m.id
                return (
                  <button key={m.id} onClick={()=>loadMemberProjects(m)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10,
                      border:`1px solid ${isSelected?"var(--primary)":"var(--border)"}`,
                      background:isSelected?"var(--primary-bg)":"transparent",
                      cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#1e40af,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:"#fff" }}>
                        {(m.full_name??m.email)[0].toUpperCase()}
                      </span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {m.full_name ?? m.email}
                      </div>
                      <div style={{ fontSize:11, color:"var(--text-3)", display:"flex", alignItems:"center", gap:6 }}>
                        <Mail size={10}/> {m.email}
                      </div>
                    </div>
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:5, background:planCfg.bg, color:planCfg.color, fontWeight:600, flexShrink:0 }}>
                      {planCfg.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Projets partagés */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <FolderOpen size={16} color="var(--primary-light)"/>
              <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:0 }}>
                {selMember ? `Projets de ${selMember.full_name ?? selMember.email}` : "Sélectionnez un membre"}
              </h3>
            </div>

            {!selMember && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--text-3)" }}>
                <Users size={40} style={{ marginBottom:12, opacity:0.3 }}/>
                <p style={{ fontSize:13 }}>Cliquez sur un membre pour voir ses projets partagés</p>
              </div>
            )}

            {selMember && loadingProjects && (
              <p style={{ fontSize:12, color:"var(--text-3)", textAlign:"center", padding:"20px 0" }}>Chargement...</p>
            )}

            {selMember && !loadingProjects && sharedProjects.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--text-3)" }}>
                <FolderOpen size={36} style={{ marginBottom:12, opacity:0.3 }}/>
                <p style={{ fontSize:13 }}>Aucun projet partagé avec ce membre</p>
                <Link href="/share" style={{ fontSize:12, color:"var(--primary-light)", textDecoration:"none", marginTop:8, display:"block" }}>
                  + Partager des projets →
                </Link>
              </div>
            )}

            {selMember && !loadingProjects && sharedProjects.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {sharedProjects.map(sp => {
                  const roleCfg = ROLE_CFG[sp.role] ?? ROLE_CFG.viewer
                  const RoleIcon = roleCfg.icon
                  return (
                    <div key={sp.project_id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--bg)" }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:sp.project?.color??"var(--primary)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:16 }}>
                        {sp.project?.icon ?? "📁"}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {sp.project?.name ?? sp.project_id}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                          <RoleIcon size={10} color={roleCfg.color}/>
                          <span style={{ fontSize:11, color:roleCfg.color, fontWeight:600 }}>{roleCfg.label}</span>
                          <span style={{ fontSize:10, color:"var(--text-3)" }}>• {sp.status}</span>
                        </div>
                      </div>
                      <button onClick={()=>removeAccess(sp.project_id)}
                        style={{ padding:"4px 10px", borderRadius:6, border:"1px solid #ef444444", background:"rgba(239,68,68,0.08)", color:"#ef4444", fontSize:11, cursor:"pointer", flexShrink:0 }}>
                        Révoquer
                      </button>
                    </div>
                  )
                })}
                <Link href="/share" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", borderRadius:8, border:"1px dashed var(--border)", color:"var(--text-3)", textDecoration:"none", fontSize:12, marginTop:4 }}>
                  <Share2 size={12}/> Partager plus de projets
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
