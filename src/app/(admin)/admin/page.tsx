"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users, FolderKanban, Zap, Crown, Building2, TrendingUp, Activity } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, freeUsers: 0, proUsers: 0, teamUsers: 0,
    starterUsers: 0, premiumUsers: 0,
    totalProjects: 0, totalAICalls: 0, bannedUsers: 0,
    newUsersToday: 0, newUsersWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const today   = new Date().toISOString().split("T")[0]
      const weekAgo = new Date(Date.now() - 7*86400000).toISOString()

      const [
        { count: total }, { count: free }, { count: pro }, { count: team },
        { count: starter }, { count: premium },
        { count: projects }, { count: banned },
        { count: todayCount }, { count: weekCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count:"exact", head:true }),
        supabase.from("profiles").select("*", { count:"exact", head:true }).eq("plan","free"),
        supabase.from("profiles").select("*", { count:"exact", head:true }).eq("plan","pro"),
        supabase.from("profiles").select("*", { count:"exact", head:true }).eq("plan","team"),
        supabase.from("profiles").select("*", { count:"exact", head:true }).eq("plan","starter"),
        supabase.from("profiles").select("*", { count:"exact", head:true }).eq("plan","premium"),
        supabase.from("projects").select("*",  { count:"exact", head:true }),
        supabase.from("profiles").select("*", { count:"exact", head:true }).eq("is_banned",true),
        supabase.from("profiles").select("*", { count:"exact", head:true }).gte("created_at",today),
        supabase.from("profiles").select("*", { count:"exact", head:true }).gte("created_at",weekAgo),
      ])

      const { data: aiData } = await supabase.from("profiles").select("ai_calls_count")
      const totalAI = aiData?.reduce((s,p) => s+(p.ai_calls_count??0),0) ?? 0

      setStats({
        totalUsers: total??0, freeUsers: free??0, proUsers: pro??0, teamUsers: team??0,
        starterUsers: starter??0, premiumUsers: premium??0,
        totalProjects: projects??0, totalAICalls: totalAI, bannedUsers: banned??0,
        newUsersToday: todayCount??0, newUsersWeek: weekCount??0
      })
      setLoading(false)
    }
    load()
  }, [])

  const paidUsers = stats.starterUsers + stats.proUsers + stats.premiumUsers + stats.teamUsers
  const conversionRate = stats.totalUsers > 0 ? Math.round(paidUsers / stats.totalUsers * 100) : 0

  const KPIS = [
    { label:"Utilisateurs total", value:stats.totalUsers,  color:"#3b82f6", bg:"rgba(59,130,246,0.08)",   border:"rgba(59,130,246,0.2)",  Icon:Users },
    { label:"Plan Gratuit",       value:stats.freeUsers,   color:"#64748b", bg:"var(--bg-card)",          border:"var(--border)",         Icon:Zap },
    { label:"Plan Starter",       value:stats.starterUsers,color:"#36B37E", bg:"rgba(54,179,126,0.08)",   border:"rgba(54,179,126,0.2)",  Icon:Zap },
    { label:"Plan Pro",           value:stats.proUsers,    color:"#7B5EFF", bg:"rgba(123,94,255,0.08)",   border:"rgba(123,94,255,0.2)",  Icon:Crown },
    { label:"Plan Premium",       value:stats.premiumUsers,color:"#FF8C00", bg:"rgba(255,140,0,0.08)",    border:"rgba(255,140,0,0.2)",   Icon:Crown },
    { label:"Projets créés",      value:stats.totalProjects,color:"#22c55e",bg:"rgba(34,197,94,0.08)",   border:"rgba(34,197,94,0.2)",   Icon:FolderKanban },
    { label:"Appels IA total",    value:stats.totalAICalls, color:"#f59e0b",bg:"rgba(245,158,11,0.08)",   border:"rgba(245,158,11,0.2)",  Icon:Activity },
    { label:"Taux conversion",    value:conversionRate+"%", color:"#22c55e",bg:"rgba(34,197,94,0.08)",   border:"rgba(34,197,94,0.2)",   Icon:TrendingUp },
  ]

  return (
    <div style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Vue d'ensemble</h1>
        <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>
          {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </p>
      </div>

      {/* Nouveaux users */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[
          { label:"Nouveaux aujourd'hui", value:stats.newUsersToday, color:"#22c55e" },
          { label:"Nouveaux cette semaine", value:stats.newUsersWeek, color:"#3b82f6" },
        ].map(k => (
          <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:k.color+"22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <TrendingUp size={18} style={{ color:k.color }}/>
            </div>
            <div>
              <p style={{ fontSize:11, color:"var(--text-3)", margin:0 }}>{k.label}</p>
              <p style={{ fontSize:26, fontWeight:800, color:k.color, margin:0, lineHeight:1.2 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"40px", color:"var(--text-3)" }}>Chargement...</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {KPIS.map(k => (
            <div key={k.label} style={{ background:k.bg, border:"1px solid "+k.border, borderRadius:10, padding:"14px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", margin:0 }}>{k.label}</p>
                <k.Icon size={14} style={{ color:k.color }}/>
              </div>
              <p style={{ fontSize:24, fontWeight:800, color:k.color, margin:0 }}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Répartition plans */}
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"16px 20px" }}>
        <p style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px" }}>Répartition des plans</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { label:"Gratuit",  value:stats.freeUsers,    color:"#64748b" },
            { label:"Starter",  value:stats.starterUsers, color:"#36B37E" },
            { label:"Pro",      value:stats.proUsers,     color:"#7B5EFF" },
            { label:"Premium",  value:stats.premiumUsers, color:"#FF8C00" },
          ].map(p => (
            <div key={p.label}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:12 }}>
                <span style={{ color:"var(--text-2)" }}>{p.label}</span>
                <span style={{ color:"var(--text-1)", fontWeight:600 }}>
                  {p.value} ({stats.totalUsers>0?Math.round(p.value/stats.totalUsers*100):0}%)
                </span>
              </div>
              <div style={{ height:6, background:"var(--bg)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${stats.totalUsers>0?p.value/stats.totalUsers*100:0}%`, height:"100%", background:p.color, borderRadius:3, transition:"width 0.4s" }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertes */}
      {stats.bannedUsers > 0 && (
        <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <Users size={16} style={{ color:"#ef4444" }}/>
          <span style={{ fontSize:13, color:"#ef4444", fontWeight:600 }}>{stats.bannedUsers} compte(s) banni(s)</span>
          <a href="/admin/security" style={{ marginLeft:"auto", fontSize:12, color:"#ef4444", textDecoration:"underline" }}>Voir →</a>
        </div>
      )}
    </div>
  )
}
