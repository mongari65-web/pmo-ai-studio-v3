"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { useProject } from "@/hooks/useProject"
import { toast } from "sonner"
import { UserPlus, Trash2, Crown, Eye, Edit3, Copy, Link2, Shield, Users, Check } from "lucide-react"

interface Member {
  id:string; email:string; role:string; status:string; created_at:string; full_name?:string
}

const ROLE_CFG = {
  owner:  { label:"Propriétaire", color:"#f59e0b", bg:"rgba(245,158,11,0.12)", icon:Crown,  desc:"Accès complet + gestion membres" },
  editor: { label:"Éditeur",      color:"#3b82f6", bg:"rgba(59,130,246,0.12)", icon:Edit3, desc:"Peut modifier tous les outils" },
  viewer: { label:"Lecteur",      color:"#64748b", bg:"rgba(100,116,139,0.12)",icon:Eye,   desc:"Lecture seule — ne peut pas modifier" },
}

const PERMISSIONS = [
  { tool:"WBS",           editor:true,  viewer:true  },
  { tool:"Gantt",         editor:true,  viewer:true  },
  { tool:"RAID",          editor:true,  viewer:true  },
  { tool:"Budget EVM",    editor:true,  viewer:true  },
  { tool:"Jalons",        editor:true,  viewer:true  },
  { tool:"Work Packages", editor:true,  viewer:true  },
  { tool:"PERT",          editor:true,  viewer:true  },
  { tool:"Membres",       editor:false, viewer:false },
  { tool:"Paramètres",    editor:false, viewer:false },
]

export default function MembersPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const [members, setMembers]   = useState<Member[]>([])
  const [email, setEmail]       = useState("")
  const [role, setRole]         = useState("editor")
  const [inviting, setInviting] = useState(false)
  const [tab, setTab]           = useState<"members"|"permissions"|"link">("members")
  const [copied, setCopied]     = useState(false)
  const supabase = createClient()

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/projects/${id}` : ""

  useEffect(() => {
    supabase.from("project_members").select("*").eq("project_id", id).order("created_at")
      .then(({ data }) => setMembers(data ?? []))
  }, [id])

  const invite = async () => {
    if (!email.trim()) { toast.error("Email requis"); return }
    setInviting(true)
    const { data, error } = await supabase.from("project_members").insert({
      project_id:id, email:email.trim(), role, status:"pending"
    }).select().single()
    if (error) { toast.error(error.message); setInviting(false); return }
    setMembers(prev => [...prev, data])
    setEmail(""); toast.success("Invitation envoyée à "+email.trim())
    setInviting(false)
  }

  const updateRole = async (memberId:string, newRole:string) => {
    await supabase.from("project_members").update({ role:newRole }).eq("id", memberId)
    setMembers(prev => prev.map(m => m.id===memberId?{...m,role:newRole}:m))
    toast.success("Rôle mis à jour")
  }

  const removeMember = async (memberId:string) => {
    await supabase.from("project_members").delete().eq("id", memberId)
    setMembers(prev => prev.filter(m => m.id!==memberId))
    toast.success("Membre retiré")
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success("Lien copié !")
  }

  const pending  = members.filter(m=>m.status==="pending")
  const accepted = members.filter(m=>m.status!=="pending")

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Header */}
        <div>
          <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// COLLABORATION</p>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Membres & Accès</h1>
          <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>{project?.name} — Gestion des collaborateurs</p>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label:"Membres total",  value:members.length+1,           color:"var(--primary)" },
            { label:"Acceptés",       value:accepted.length+1,          color:"#22c55e" },
            { label:"En attente",     value:pending.length,             color:"#f59e0b" },
            { label:"Éditeurs",       value:members.filter(m=>m.role==="editor").length, color:"#3b82f6" },
          ].map(k => (
            <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:4, width:"fit-content" }}>
          {([["members","👥 Membres"],["permissions","🔐 Permissions"],["link","🔗 Lien de partage"]] as const).map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              style={{ padding:"6px 16px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", border:"none", background:tab===v?"var(--primary-bg)":"transparent", color:tab===v?"var(--primary-light)":"var(--text-2)" }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── Onglet Membres ── */}
        {tab === "members" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Formulaire invitation */}
            <div style={{ background:"var(--bg-card)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:12, padding:"16px" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--primary-light)", margin:"0 0 12px", display:"flex", alignItems:"center", gap:6 }}>
                <UserPlus size={14}/> Inviter un collaborateur
              </h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 160px auto", gap:8, alignItems:"flex-end" }}>
                <div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3, textTransform:"uppercase", fontWeight:600 }}>Email *</div>
                  <input value={email} onChange={e=>setEmail(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&invite()}
                    placeholder="collaborateur@example.com"
                    style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:7, padding:"8px 10px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box", outline:"none" }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3, textTransform:"uppercase", fontWeight:600 }}>Rôle</div>
                  <select value={role} onChange={e=>setRole(e.target.value)}
                    style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:7, padding:"8px 10px", background:"var(--bg)", color:"var(--text-1)" }}>
                    <option value="editor">Éditeur</option>
                    <option value="viewer">Lecteur</option>
                  </select>
                </div>
                <button onClick={invite} disabled={inviting||!email.trim()}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:inviting?"wait":"pointer", opacity:inviting?0.7:1, whiteSpace:"nowrap" }}>
                  <UserPlus size={13}/> {inviting?"Envoi...":"Inviter"}
                </button>
              </div>
              {/* Description rôles */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:12 }}>
                {Object.entries(ROLE_CFG).map(([key,cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <div key={key} style={{ padding:"8px 10px", background:cfg.bg, borderRadius:7, border:"1px solid "+cfg.color+"33" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
                        <Icon size={11} style={{ color:cfg.color }}/>
                        <span style={{ fontSize:11, fontWeight:700, color:cfg.color }}>{cfg.label}</span>
                      </div>
                      <span style={{ fontSize:10, color:"var(--text-3)" }}>{cfg.desc}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Liste membres */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8 }}>
                <Users size={14} style={{ color:"var(--text-3)" }}/>
                <span style={{ fontSize:13, fontWeight:700, color:"var(--text-1)" }}>{members.length+1} membre{members.length>0?"s":""}</span>
              </div>

              {/* Owner (toi) */}
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:"1px solid var(--border)", background:"rgba(245,158,11,0.04)" }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(245,158,11,0.2)", border:"2px solid #f59e0b", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#f59e0b", flexShrink:0 }}>
                  {(project?.name||"P").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)" }}>Vous (propriétaire)</div>
                  <div style={{ fontSize:10, color:"var(--text-3)" }}>Accès complet</div>
                </div>
                <span style={{ fontSize:10, padding:"2px 10px", borderRadius:20, background:"rgba(245,158,11,0.12)", color:"#f59e0b", fontWeight:700 }}>
                  <Crown size={10} style={{ display:"inline", marginRight:3 }}/>Propriétaire
                </span>
              </div>

              {/* Autres membres */}
              {members.length === 0 ? (
                <div style={{ padding:"32px", textAlign:"center" }}>
                  <UserPlus size={28} style={{ color:"var(--text-3)", margin:"0 auto 8px", display:"block", opacity:0.4 }}/>
                  <p style={{ fontSize:12, color:"var(--text-3)", margin:0 }}>Aucun membre invité</p>
                </div>
              ) : members.map((member, idx) => {
                const cfg = ROLE_CFG[member.role as keyof typeof ROLE_CFG] ?? ROLE_CFG.viewer
                const Icon = cfg.icon
                const isPending = member.status === "pending"
                return (
                  <div key={member.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:idx<members.length-1?"1px solid var(--border)":"none", background:idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:cfg.bg, border:"1px solid "+cfg.color+"44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:cfg.color, flexShrink:0 }}>
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{member.email}</div>
                      <div style={{ display:"flex", gap:6, marginTop:2 }}>
                        <span style={{ fontSize:10, padding:"1px 7px", borderRadius:8, background:isPending?"rgba(245,158,11,0.1)":"rgba(34,197,94,0.1)", color:isPending?"#f59e0b":"#22c55e", fontWeight:600 }}>
                          {isPending?"⏳ En attente":"✅ Accepté"}
                        </span>
                        <span style={{ fontSize:10, color:"var(--text-3)" }}>Invité le {new Date(member.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <select value={member.role} onChange={e=>updateRole(member.id,e.target.value)}
                      style={{ fontSize:11, fontWeight:600, border:"1px solid "+cfg.color+"44", borderRadius:8, padding:"5px 10px", background:cfg.bg, color:cfg.color, cursor:"pointer" }}>
                      <option value="editor">Éditeur</option>
                      <option value="viewer">Lecteur</option>
                    </select>
                    <button onClick={() => removeMember(member.id)}
                      style={{ padding:"5px 8px", background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:7, cursor:"pointer", color:"#ef4444" }}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Onglet Permissions ── */}
        {tab === "permissions" && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:6 }}>
              <Shield size={14} style={{ color:"var(--primary-light)" }}/>
              <span style={{ fontSize:13, fontWeight:700, color:"var(--text-1)" }}>Matrice des permissions par rôle</span>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"var(--bg)" }}>
                  <th style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", textTransform:"uppercase" }}>Outil PMO</th>
                  {Object.entries(ROLE_CFG).map(([key,cfg]) => (
                    <th key={key} style={{ padding:"10px 16px", textAlign:"center", fontSize:10, fontWeight:700, color:cfg.color, borderBottom:"2px solid var(--border)", textTransform:"uppercase" }}>
                      {cfg.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((p,idx) => (
                  <tr key={p.tool} style={{ borderBottom:"1px solid var(--border)", background:idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                    <td style={{ padding:"10px 16px", fontWeight:500, color:"var(--text-1)" }}>{p.tool}</td>
                    <td style={{ padding:"10px 16px", textAlign:"center" }}>
                      <span style={{ color:"#22c55e", fontSize:16 }}>✅</span>
                    </td>
                    <td style={{ padding:"10px 16px", textAlign:"center" }}>
                      <span style={{ color:p.editor?"#22c55e":"#ef4444", fontSize:16 }}>{p.editor?"✅":"❌"}</span>
                    </td>
                    <td style={{ padding:"10px 16px", textAlign:"center" }}>
                      <span style={{ color:p.viewer?"#3b82f6":"#ef4444", fontSize:16 }}>{p.viewer?"👁️":"❌"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding:"10px 16px", background:"var(--bg)", fontSize:11, color:"var(--text-3)", display:"flex", gap:16 }}>
              <span>✅ Modifier</span><span>👁️ Lecture seule</span><span>❌ Accès refusé</span>
            </div>
          </div>
        )}

        {/* ── Onglet Lien de partage ── */}
        {tab === "link" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"20px" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px", display:"flex", alignItems:"center", gap:6 }}>
                <Link2 size={14}/> Lien de partage du projet
              </h3>
              <p style={{ fontSize:12, color:"var(--text-3)", margin:"0 0 14px", lineHeight:1.5 }}>
                Partagez ce lien avec vos collaborateurs. Ils devront avoir un compte PMO AI Studio pour accéder au projet.
              </p>
              <div style={{ display:"flex", gap:8 }}>
                <div style={{ flex:1, padding:"10px 14px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--text-2)", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {shareLink}
                </div>
                <button onClick={copyLink} style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", background:copied?"#22c55e":"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", transition:"background 0.2s", whiteSpace:"nowrap" }}>
                  {copied ? <><Check size={13}/> Copié !</> : <><Copy size={13}/> Copier le lien</>}
                </button>
              </div>
            </div>

            <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:10, padding:"12px 16px" }}>
              <p style={{ fontSize:12, fontWeight:600, color:"#f59e0b", margin:"0 0 4px" }}>⚠️ Note importante</p>
              <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.5 }}>
                Le lien seul ne donne pas accès au projet. Les collaborateurs doivent être <strong>invités explicitement</strong> via l'onglet Membres avec leur email.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
