"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users, FolderKanban, Zap, Crown, Building2, TrendingUp, Activity } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, freeUsers: 0, proUsers: 0, teamUsers: 0,
    totalProjects: 0, totalAICalls: 0, bannedUsers: 0,
    newUsersToday: 0, newUsersWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0]
      const weekAgo = new Date(Date.now() - 7*86400000).toISOString()

      const [
        { count: total },
        { count: free },
        { count: pro },
        { count: team },
        { count: projects },
        { count: banned },
        { count: todayCount },
        { count: weekCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "free"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "pro"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "team"),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
      ])

      // Total AI calls
      const { data: aiData } = await supabase.from("profiles").select("ai_calls_count")
      const totalAI = aiData?.reduce((s, p) => s + (p.ai_calls_count ?? 0), 0) ?? 0

      setStats({
        totalUsers: total ?? 0, freeUsers: free ?? 0, proUsers: pro ?? 0, teamUsers: team ?? 0,
        totalProjects: projects ?? 0, totalAICalls: totalAI, bannedUsers: banned ?? 0,
        newUsersToday: todayCount ?? 0, newUsersWeek: weekCount ?? 0
      })
      setLoading(false)
    }
    load()
  }, [])

  const conversionRate = stats.totalUsers > 0
    ? Math.round((stats.proUsers + stats.teamUsers) / stats.totalUsers * 100) : 0

  const KPIS = [
    { label: "Utilisateurs total", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Plan Gratuit", value: stats.freeUsers, icon: Zap, color: "text-gray-400", bg: "bg-card border-border" },
    { label: "Plan Pro", value: stats.proUsers, icon: Crown, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Plan Équipe", value: stats.teamUsers, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Projets créés", value: stats.totalProjects, icon: FolderKanban, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: "Appels IA total", value: stats.totalAICalls, icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Taux conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: "Comptes bannis", value: stats.bannedUsers, icon: Users, color: stats.bannedUsers > 0 ? "text-red-400" : "text-muted-foreground", bg: stats.bannedUsers > 0 ? "bg-red-500/10 border-red-500/20" : "bg-card border-border" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vue d'ensemble</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </p>
      </div>

      {/* Nouveaux utilisateurs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <TrendingUp size={18} className="text-green-400"/>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nouveaux aujourd'hui</p>
            <p className="text-2xl font-bold text-green-400">{stats.newUsersToday}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <TrendingUp size={18} className="text-blue-400"/>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nouveaux cette semaine</p>
            <p className="text-2xl font-bold text-blue-400">{stats.newUsersWeek}</p>
          </div>
        </div>
      </div>

      {/* KPIs grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {KPIS.map(k => (
            <div key={k.label} className={`border rounded-xl p-4 ${k.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{k.label}</p>
                <k.icon size={15} className={k.color}/>
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Répartition plans */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm font-semibold text-foreground mb-4">Répartition des plans</p>
        <div className="space-y-3">
          {[
            { label:"Gratuit", value:stats.freeUsers, total:stats.totalUsers, color:"#64748b" },
            { label:"Pro",     value:stats.proUsers,  total:stats.totalUsers, color:"#2563eb" },
            { label:"Équipe",  value:stats.teamUsers, total:stats.totalUsers, color:"#7c3aed" },
          ].map(p => (
            <div key={p.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{p.label}</span>
                <span className="text-foreground font-medium">{p.value} ({p.total>0?Math.round(p.value/p.total*100):0}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width:`${p.total>0?p.value/p.total*100:0}%`, background:p.color }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
