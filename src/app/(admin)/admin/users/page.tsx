"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, Crown, Zap, Building2, Ban, CheckCircle2, Mail, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string; user_id: string; full_name: string; email: string
  plan: string; ai_calls_count: number; is_banned: boolean
  created_at: string; last_seen_at: string; project_count?: number
}

const PLAN_CFG: Record<string, { color: string; bg: string; label: string }> = {
  free:    { color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "Gratuit" },
  starter: { color: "#36B37E", bg: "rgba(54,179,126,0.1)",  label: "Starter" },
  pro:     { color: "#7B5EFF", bg: "rgba(123,94,255,0.12)", label: "Pro" },
  premium: { color: "#FF8C00", bg: "rgba(255,140,0,0.1)",   label: "Premium" },
  team:    { color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  label: "Équipe" },
}

const AI_LIMITS: Record<string, number> = { free: 5, starter: 20, pro: 200, premium: 300, team: 500 }

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<UserProfile[]>([])
  const [search, setSearch]       = useState("")
  const [filterPlan, setFilterPlan] = useState("all")
  const [loading, setLoading]     = useState(true)
  const [actionUser, setActionUser] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/users")
    const json = await res.json()
    setUsers(json.users ?? [])
    setLoading(false)
  }

  const updatePlan = async (userId: string, plan: string) => {
    setActionUser(userId)
    await supabase.from("profiles").update({ plan }).eq("id", userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u))
    toast.success("Plan mis à jour : " + plan)
    setActionUser(null)
  }

  const toggleBan = async (userId: string, banned: boolean) => {
    setActionUser(userId)
    await supabase.from("profiles").update({ is_banned: !banned }).eq("id", userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !banned } : u))
    toast.success(!banned ? "Compte banni" : "Compte réactivé")
    setActionUser(null)
  }

  const resetAI = async (userId: string) => {
    await supabase.from("profiles").update({ ai_calls_count: 0 }).eq("id", userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ai_calls_count: 0 } : u))
    toast.success("Quota IA réinitialisé")
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) || (u.email ?? "").toLowerCase().includes(search.toLowerCase())
    const matchPlan   = filterPlan === "all" || u.plan === filterPlan
    return matchSearch && matchPlan
  })

  const FILTERS = [
    { id:"all",     label:"Tous" },
    { id:"free",    label:"Gratuit" },
    { id:"starter", label:"Starter" },
    { id:"pro",     label:"Pro" },
    { id:"premium", label:"Premium" },
    { id:"team",    label:"Équipe" },
  ]

  return (
    <div style={{ padding:24, display:"flex", flexDirection:"column", gap:18 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>👥 Utilisateurs</h1>
          <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>{users.length} comptes enregistrés</p>
        </div>
        <button onClick={loadUsers} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
          <RefreshCw size={13}/> Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, maxWidth:320 }}>
          <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            style={{ width:"100%", paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8, border:"1px solid var(--border)", borderRadius:8, background:"var(--bg)", color:"var(--text-1)", fontSize:12, boxSizing:"border-box", outline:"none" }}/>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilterPlan(f.id)}
              style={{ padding:"6px 14px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterPlan===f.id?"var(--primary)":"var(--border)"), background:filterPlan===f.id?"var(--primary-bg)":"transparent", color:filterPlan===f.id?"var(--primary-light)":"var(--text-3)", userSelect:"none" }}>
              {f.label} {f.id !== "all" ? "("+users.filter(u=>u.plan===f.id).length+")" : "("+users.length+")"}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:"var(--bg)" }}>
              {["Utilisateur","Plan","IA utilisée","Projets","Inscription","Statut","Actions"].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding:"40px", textAlign:"center", color:"var(--text-3)" }}>Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding:"40px", textAlign:"center", color:"var(--text-3)" }}>Aucun utilisateur trouvé</td></tr>
            ) : filtered.map((user, idx) => {
              const planCfg = PLAN_CFG[user.plan] ?? PLAN_CFG.free
              const aiLimit = AI_LIMITS[user.plan] ?? 20
              const aiUsed  = user.ai_calls_count ?? 0
              const aiPct   = Math.min(100, Math.round(aiUsed / aiLimit * 100))
              const initials = ((user.full_name || user.email || "?").charAt(0)).toUpperCase()

              return (
                <tr key={user.id ?? user.user_id} style={{ borderBottom:"1px solid var(--border)", background:user.is_banned?"rgba(239,68,68,0.04)":(idx%2===0?"var(--bg-card)":"var(--bg)"), opacity:user.is_banned?0.7:1 }}>
                  {/* Utilisateur */}
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:"var(--primary-bg)", border:"1px solid rgba(123,94,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"var(--primary-light)", flexShrink:0 }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:"var(--text-1)" }}>{user.full_name || "—"}</div>
                        <div style={{ fontSize:10, color:"var(--text-3)" }}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td style={{ padding:"10px 14px" }}>
                    <select value={user.plan} onChange={e => updatePlan(user.user_id, e.target.value)}
                      disabled={actionUser === user.user_id}
                      style={{ padding:"4px 8px", borderRadius:8, border:"1px solid "+planCfg.color+"44", background:planCfg.bg, color:planCfg.color, fontSize:11, fontWeight:600, cursor:"pointer", outline:"none" }}>
                      {Object.entries(PLAN_CFG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </td>

                  {/* IA utilisée */}
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, height:5, background:"var(--bg)", borderRadius:3, overflow:"hidden", minWidth:60 }}>
                        <div style={{ width:aiPct+"%", height:"100%", background:aiPct>80?"#ef4444":aiPct>50?"#f59e0b":"#22c55e", borderRadius:3 }}/>
                      </div>
                      <span style={{ fontSize:10, fontWeight:600, color:"var(--text-2)", whiteSpace:"nowrap" }}>{aiUsed}/{aiLimit}</span>
                      <button onClick={() => resetAI(user.user_id)} style={{ fontSize:10, padding:"2px 7px", border:"1px solid var(--border)", borderRadius:5, background:"transparent", color:"var(--text-3)", cursor:"pointer" }}>reset</button>
                    </div>
                  </td>

                  {/* Projets */}
                  <td style={{ padding:"10px 14px", color:"var(--text-2)", fontWeight:600, textAlign:"center" }}>{user.project_count ?? 0}</td>

                  {/* Inscription */}
                  <td style={{ padding:"10px 14px", color:"var(--text-3)", fontSize:11, whiteSpace:"nowrap" }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                  </td>

                  {/* Statut */}
                  <td style={{ padding:"10px 14px" }}>
                    <span style={{ fontSize:10, padding:"2px 10px", borderRadius:20, background:user.is_banned?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)", color:user.is_banned?"#ef4444":"#22c55e", fontWeight:600 }}>
                      {user.is_banned ? "Banni" : "Actif"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", gap:5 }}>
                      <button onClick={() => toggleBan(user.user_id, user.is_banned)}
                        title={user.is_banned ? "Réactiver" : "Bannir"}
                        style={{ padding:"4px 8px", border:"1px solid "+(user.is_banned?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"), borderRadius:6, background:"transparent", color:user.is_banned?"#22c55e":"#ef4444", cursor:"pointer" }}>
                        {user.is_banned ? <CheckCircle2 size={12}/> : <Ban size={12}/>}
                      </button>
                      <a href={"mailto:"+user.email}
                        style={{ padding:"4px 8px", border:"1px solid var(--border)", borderRadius:6, background:"transparent", color:"var(--text-3)", display:"flex", alignItems:"center" }}>
                        <Mail size={12}/>
                      </a>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
