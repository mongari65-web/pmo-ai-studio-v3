"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { Users, Share2, Check, Search, FolderOpen, Crown, Eye, Edit3, Send, X } from "lucide-react"
import { toast } from "sonner"

interface Member { id:string; email:string; full_name?:string; plan?:string }
interface Project { id:string; name:string; icon?:string; color?:string }

const ROLE_CFG = {
  editor: { label:"Éditeur",      color:"#3b82f6", icon:Edit3, desc:"Peut modifier les outils" },
  viewer: { label:"Lecteur",      color:"#64748b", icon:Eye,   desc:"Lecture seule" },
  owner:  { label:"Propriétaire", color:"#f59e0b", icon:Crown, desc:"Accès complet" },
}

export default function ShareProjectsPage() {
  const [members,  setMembers]  = useState<Member[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selMember,  setSelMember]  = useState<Member|null>(null)
  const [selProjects, setSelProjects] = useState<string[]>([])
  const [role, setRole]         = useState("editor")
  const [search, setSearch]     = useState("")
  const [searchP, setSearchP]   = useState("")
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      // Charger membres inscrits
      const res = await fetch("/api/share-projects")
      const data = await res.json()
      // Filtrer soi-même
      setMembers((data.members ?? []).filter((m: Member) => m.id !== user?.id))
      // Charger mes projets
      const { data: projs } = await supabase
        .from("projects")
        .select("id, name, icon, color")
        .order("name")
      setProjects(projs ?? [])
    }
    load()
  }, [])

  const toggleProject = (pid: string) => {
    setSelProjects(prev =>
      prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]
    )
  }

  const handleShare = async () => {
    if (!selMember) { toast.error("Sélectionnez un membre"); return }
    if (!selProjects.length) { toast.error("Sélectionnez au moins un projet"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/share-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: selMember.id,
          projectIds: selProjects,
          role,
          invitedBy: currentUser?.id,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      toast.success(`${selProjects.length} projet(s) partagé(s) avec ${selMember.full_name ?? selMember.email}`)
    } catch(e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setSelMember(null); setSelProjects([]); setRole("editor"); setSuccess(false)
  }

  const filteredMembers  = members.filter(m =>
    (m.full_name ?? m.email).toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchP.toLowerCase())
  )

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px 32px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// COLLABORATION</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Partager des projets</h1>
            <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>Partagez un ou plusieurs projets avec des membres inscrits</p>
          </div>
        </div>

        {success ? (
          <div style={{ background:"var(--bg-card)", border:"1px solid #22c55e44", borderRadius:16, padding:"48px 32px", textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontSize:20, fontWeight:800, color:"var(--text-1)", margin:"0 0 8px" }}>Partage effectué !</h2>
            <p style={{ fontSize:14, color:"var(--text-2)", margin:"0 0 8px" }}>
              <strong>{selProjects.length}</strong> projet(s) partagé(s) avec <strong>{selMember?.full_name ?? selMember?.email}</strong>
            </p>
            <p style={{ fontSize:12, color:"var(--text-3)", margin:"0 0 24px" }}>Un email de notification a été envoyé au membre.</p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button onClick={reset}
                style={{ padding:"10px 24px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text-1)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Nouveau partage
              </button>
              <button onClick={() => window.location.href = "/members"}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#1e40af,#3b82f6)", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Voir les membres
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

            {/* Colonne gauche — Membre */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <Users size={16} color="var(--primary-light)"/>
                  <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:0 }}>
                    1. Choisir un membre
                  </h3>
                  {selMember && <span style={{ marginLeft:"auto", fontSize:11, padding:"2px 8px", borderRadius:6, background:"#22c55e22", color:"#22c55e", fontWeight:600 }}>✓ Sélectionné</span>}
                </div>

                {/* Search membres */}
                <div style={{ position:"relative", marginBottom:12 }}>
                  <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }}/>
                  <input value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Rechercher un membre..."
                    style={{ width:"100%", padding:"8px 10px 8px 30px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg)", color:"var(--text-1)", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
                </div>

                {/* Liste membres */}
                <div style={{ maxHeight:320, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                  {filteredMembers.length === 0 && (
                    <p style={{ fontSize:12, color:"var(--text-3)", textAlign:"center", padding:"20px 0" }}>Aucun membre trouvé</p>
                  )}
                  {filteredMembers.map(m => (
                    <button key={m.id} onClick={()=>setSelMember(m)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10,
                        border:`1px solid ${selMember?.id===m.id?"var(--primary)":"var(--border)"}`,
                        background:selMember?.id===m.id?"var(--primary-bg)":"transparent",
                        cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#1e40af,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>
                          {(m.full_name??m.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {m.full_name ?? m.email}
                        </div>
                        <div style={{ fontSize:11, color:"var(--text-3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.email}</div>
                      </div>
                      {m.plan && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:5, background:"var(--primary-bg)", color:"var(--primary-light)", fontWeight:600, flexShrink:0 }}>{m.plan}</span>}
                      {selMember?.id===m.id && <Check size={14} color="var(--primary-light)" style={{ flexShrink:0 }}/>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rôle */}
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px" }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>3. Choisir le rôle</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {Object.entries(ROLE_CFG).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    return (
                      <button key={key} onClick={()=>setRole(key)}
                        style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10,
                          border:`1px solid ${role===key?cfg.color+"66":"var(--border)"}`,
                          background:role===key?cfg.color+"11":"transparent",
                          cursor:"pointer", textAlign:"left" }}>
                        <Icon size={15} color={cfg.color}/>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:role===key?cfg.color:"var(--text-1)" }}>{cfg.label}</div>
                          <div style={{ fontSize:11, color:"var(--text-3)" }}>{cfg.desc}</div>
                        </div>
                        {role===key && <Check size={13} color={cfg.color} style={{ marginLeft:"auto" }}/>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Colonne droite — Projets */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <FolderOpen size={16} color="var(--primary-light)"/>
                <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:0 }}>
                  2. Choisir les projets
                </h3>
                {selProjects.length > 0 && (
                  <span style={{ marginLeft:"auto", fontSize:11, padding:"2px 8px", borderRadius:6, background:"#3b82f622", color:"#3b82f6", fontWeight:600 }}>
                    {selProjects.length} sélectionné(s)
                  </span>
                )}
              </div>

              {/* Boutons tout sélectionner / désélectionner */}
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <button onClick={()=>setSelProjects(projects.map(p=>p.id))}
                  style={{ fontSize:11, padding:"4px 10px", borderRadius:6, border:"1px solid var(--border)", background:"transparent", color:"var(--text-2)", cursor:"pointer" }}>
                  Tout sélectionner
                </button>
                <button onClick={()=>setSelProjects([])}
                  style={{ fontSize:11, padding:"4px 10px", borderRadius:6, border:"1px solid var(--border)", background:"transparent", color:"var(--text-2)", cursor:"pointer" }}>
                  Tout désélectionner
                </button>
              </div>

              {/* Search projets */}
              <div style={{ position:"relative", marginBottom:12 }}>
                <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }}/>
                <input value={searchP} onChange={e=>setSearchP(e.target.value)}
                  placeholder="Rechercher un projet..."
                  style={{ width:"100%", padding:"8px 10px 8px 30px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg)", color:"var(--text-1)", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
              </div>

              {/* Liste projets */}
              <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                {filteredProjects.map(p => {
                  const selected = selProjects.includes(p.id)
                  return (
                    <button key={p.id} onClick={()=>toggleProject(p.id)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10,
                        border:`1px solid ${selected?"var(--primary)":"var(--border)"}`,
                        background:selected?"var(--primary-bg)":"transparent",
                        cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                      <div style={{ width:28, height:28, borderRadius:7, background:p.color??"var(--primary)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:14 }}>
                        {p.icon ?? "📁"}
                      </div>
                      <span style={{ fontSize:13, fontWeight:500, color:"var(--text-1)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {p.name}
                      </span>
                      <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${selected?"var(--primary)":"var(--border)"}`, background:selected?"var(--primary)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {selected && <Check size={11} color="#fff"/>}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Bouton partager */}
              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
                {selMember && selProjects.length > 0 && (
                  <div style={{ fontSize:12, color:"var(--text-2)", marginBottom:10, padding:"8px 12px", background:"var(--bg)", borderRadius:8 }}>
                    Partager <strong>{selProjects.length}</strong> projet(s) avec <strong>{selMember.full_name ?? selMember.email}</strong> en tant que <strong>{ROLE_CFG[role as keyof typeof ROLE_CFG]?.label}</strong>
                  </div>
                )}
                <button onClick={handleShare} disabled={loading || !selMember || !selProjects.length}
                  style={{ width:"100%", padding:"12px", borderRadius:10, border:"none",
                    background:(!selMember||!selProjects.length)?"var(--bg-card)":"linear-gradient(135deg,#1e40af,#3b82f6)",
                    color:(!selMember||!selProjects.length)?"var(--text-3)":"#fff",
                    fontSize:14, fontWeight:700, cursor:(!selMember||!selProjects.length)?"not-allowed":"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s" }}>
                  {loading ? "Partage en cours..." : <><Send size={14}/> Partager les projets</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
