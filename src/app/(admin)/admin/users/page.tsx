"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, Crown, Zap, Building2, Ban, CheckCircle2, Mail, Trash2, Shield } from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string; user_id: string; full_name: string; email: string
  plan: string; ai_calls_count: number; storage_used_mb: number
  is_banned: boolean; created_at: string; last_seen_at: string
  project_count?: number
}

const PLAN_CFG = {
  free:  { icon: Zap,      color: "#64748b", label: "Gratuit" },
  pro:   { icon: Crown,    color: "#2563eb", label: "Pro" },
  team:  { icon: Building2,color: "#7c3aed", label: "Équipe" },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState("")
  const [filterPlan, setFilterPlan] = useState("all")
  const [loading, setLoading] = useState(true)
  const [actionUser, setActionUser] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    // Compter les projets par user
    const { data: projects } = await supabase.from("projects").select("user_id")
    const projectCounts: Record<string, number> = {}
    projects?.forEach(p => { projectCounts[p.user_id] = (projectCounts[p.user_id] ?? 0) + 1 })

    setUsers((data ?? []).map(u => ({ ...u, project_count: projectCounts[u.user_id] ?? 0 })))
    setLoading(false)
  }

  const updatePlan = async (userId: string, plan: string) => {
    setActionUser(userId)
    await supabase.from("profiles").update({ plan }).eq("user_id", userId)
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, plan } : u))
    toast.success(`Plan mis à jour : ${plan}`)
    setActionUser(null)
  }

  const toggleBan = async (userId: string, banned: boolean) => {
    setActionUser(userId)
    await supabase.from("profiles").update({ is_banned: !banned }).eq("user_id", userId)
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_banned: !banned } : u))
    toast.success(!banned ? "Compte banni" : "Compte réactivé")
    setActionUser(null)
  }

  const resetAICalls = async (userId: string) => {
    await supabase.from("profiles").update({ ai_calls_count: 0, ai_calls_reset_at: new Date().toISOString() }).eq("user_id", userId)
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, ai_calls_count: 0 } : u))
    toast.success("Compteur IA réinitialisé")
  }

  const filtered = users.filter(u => {
    const matchSearch = (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === "all" || u.plan === filterPlan
    return matchSearch && matchPlan
  })

  const AI_LIMITS = { free: 20, pro: 150, team: 500 }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{users.length} comptes enregistrés</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
        <div className="flex gap-2">
          {["all","free","pro","team"].map(p => (
            <button key={p} onClick={() => setFilterPlan(p)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${filterPlan===p?"bg-primary border-primary text-white":"bg-card border-border text-muted-foreground hover:text-foreground"}`}>
              {p==="all"?"Tous":p==="free"?"Gratuit":p==="pro"?"Pro":"Équipe"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary/10 border-b border-border">
                {["Utilisateur","Plan","IA utilisée","Projets","Inscription","Statut","Actions"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const planCfg = PLAN_CFG[user.plan as keyof typeof PLAN_CFG] ?? PLAN_CFG.free
                const PlanIcon = planCfg.icon
                const aiLimit = AI_LIMITS[user.plan as keyof typeof AI_LIMITS] ?? 20
                const aiPct = Math.min(100, Math.round((user.ai_calls_count ?? 0) / aiLimit * 100))
                return (
                  <tr key={user.user_id} className={`border-b border-border hover:bg-accent/10 ${user.is_banned ? "opacity-50" : ""}`}>
                    {/* Utilisateur */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {(user.full_name ?? user.email ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{user.full_name ?? "—"}</p>
                          <p className="text-[10px] text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Plan */}
                    <td className="px-3 py-2.5">
                      <select value={user.plan} onChange={e => updatePlan(user.user_id, e.target.value)}
                        disabled={actionUser === user.user_id}
                        className="text-xs px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary/40"
                        style={{ background: planCfg.color+"22", borderColor: planCfg.color+"44", color: planCfg.color }}>
                        <option value="free">Gratuit</option>
                        <option value="pro">Pro</option>
                        <option value="team">Équipe</option>
                      </select>
                    </td>
                    {/* IA */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${aiPct}%`, background: aiPct>80?"#ef4444":aiPct>50?"#f59e0b":"#22c55e" }}/>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{user.ai_calls_count ?? 0}/{aiLimit}</span>
                        <button onClick={() => resetAICalls(user.user_id)} className="text-[10px] text-primary hover:underline ml-1">reset</button>
                      </div>
                    </td>
                    {/* Projets */}
                    <td className="px-3 py-2.5 text-xs text-foreground">{user.project_count ?? 0}</td>
                    {/* Date */}
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" })}
                    </td>
                    {/* Statut */}
                    <td className="px-3 py-2.5">
                      {user.is_banned
                        ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">Banni</span>
                        : <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">Actif</span>}
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleBan(user.user_id, user.is_banned)}
                          disabled={actionUser === user.user_id}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${user.is_banned ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                          title={user.is_banned ? "Débannir" : "Bannir"}>
                          {user.is_banned ? <CheckCircle2 size={13}/> : <Ban size={13}/>}
                        </button>
                        <a href={`mailto:${user.email}`}
                          className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          title="Envoyer un email">
                          <Mail size={13}/>
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">Aucun utilisateur trouvé</div>
          )}
        </div>
      )}
    </div>
  )
}
