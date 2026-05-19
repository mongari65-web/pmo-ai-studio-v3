"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Plus, FolderKanban, Target, DollarSign, Bell, AlertTriangle, Clock, CheckCircle2, Wand2, ArrowRight, TrendingUp, TrendingDown, Zap, Activity, Calendar, Shield } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"

interface Alert { type:string; message:string; project:string; projectId:string; href:string; severity:string }
interface EVMMetrics { pv:number; ev:number; ac:number; bac:number; cpi:number; spi:number; cv:number; sv:number; eac:number; tcpi:number; projectName:string; projectId:string }
interface JalonNext { name:string; date:string; project:string; projectId:string; daysLeft:number; status:string }
interface BudgetItem { name:string; bac:number; spent:number; pct:number; color:string }
interface HealthScore { projectId:string; name:string; score:number; cpi:number; spi:number; raidCrit:number; completion:number }

const SEV = {
  danger:  { bg:"rgba(239,68,68,0.08)",  border:"#ef4444", icon:AlertTriangle, color:"#ef4444" },
  warning: { bg:"rgba(245,158,11,0.08)", border:"#f59e0b", icon:Clock,         color:"#f59e0b" },
  info:    { bg:"rgba(59,130,246,0.08)", border:"#3b82f6", icon:CheckCircle2,  color:"#3b82f6" },
}

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

export default function DashboardPage() {
  const [projects, setProjects]   = useState<any[]>([])
  const [user, setUser]           = useState<any>(null)
  const [alerts, setAlerts]       = useState<Alert[]>([])
  const [evmMetrics, setEvmMetrics] = useState<EVMMetrics[]>([])
  const [evmCurve, setEvmCurve]   = useState<any[]>([])
  const [jalons, setJalons]       = useState<JalonNext[]>([])
  const [budgets, setBudgets]     = useState<BudgetItem[]>([])
  const [health, setHealth]       = useState<HealthScore[]>([])
  const [aiHistory, setAiHistory] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({data}) => setUser(data.user))
    loadData()
  }, [])

  const loadData = async () => {
    const { data: projs } = await supabase.from("projects").select("*").order("created_at", { ascending: false })
    const { data: tools } = await supabase.from("project_tools").select("project_id,tool_type,data,created_at")
    const { data: cache } = await supabase.from("ia_cache").select("tool_type,created_at").order("created_at", { ascending: false }).limit(20)

    if (!projs) { setLoading(false); return }
    setProjects(projs)

    const newAlerts: Alert[] = []
    const newEVM: EVMMetrics[] = []
    const newJalons: JalonNext[] = []
    const newBudgets: BudgetItem[] = []
    const newHealth: HealthScore[] = []
    const cp = new Date().getMonth()
    const today = new Date().toISOString().split("T")[0]
    const in30 = new Date(Date.now() + 30*86400000).toISOString().split("T")[0]

    tools?.forEach(t => {
      const proj = projs.find(p => p.id === t.project_id)
      if (!proj) return

      // RAID alertes
      if (t.tool_type === "raid" && t.data?.items) {
        const crit = t.data.items.filter((i:any) => i.priority === "Critique" && i.status === "Ouvert")
        if (crit.length > 0) newAlerts.push({ type:"raid", message:crit.length+" risque(s) critique(s) ouvert(s)", project:proj.name, projectId:proj.id, href:`/projects/${proj.id}/raid`, severity:"danger" })
      }

      // EVM
      if (t.tool_type === "budget" && t.data?.tasks) {
        const tasks = t.data.tasks
        const bac  = tasks.reduce((s:number, t:any) => s + (t.bac ?? 0), 0)
        const pv   = tasks.reduce((s:number, t:any) => s + (t.pv?.[cp] ?? 0), 0)
        const ev   = tasks.reduce((s:number, t:any) => s + (t.ev?.[cp] ?? 0), 0)
        const ac   = tasks.reduce((s:number, t:any) => s + (t.ac?.[cp] ?? 0), 0)
        const cpi  = ac > 0 ? Math.round(ev/ac*100)/100 : 1
        const spi  = pv > 0 ? Math.round(ev/pv*100)/100 : 1
        const cv   = ev - ac
        const sv   = ev - pv
        const eac  = cpi > 0 ? Math.round(bac/cpi) : bac
        const tcpi = (bac - ev) > 0 ? Math.round((bac - ev)/(bac - ac)*100)/100 : 1
        if (cpi < 0.9) newAlerts.push({ type:"budget", message:"CPI = "+cpi.toFixed(2)+" — dépassement", project:proj.name, projectId:proj.id, href:`/projects/${proj.id}/budget`, severity:"warning" })
        newEVM.push({ pv, ev, ac, bac, cpi, spi, cv, sv, eac, tcpi, projectName:proj.name, projectId:proj.id })

        // Courbe S cumulée
        const pvCum = tasks.reduce((s:number,t:any) => s + tasks.reduce((ss:number,tt:any,mi:number) => mi <= cp ? ss+(tt.pv?.[mi]??0) : ss, 0), 0)
      }

      // Jalons
      if (t.tool_type === "jalons" && t.data?.jalons) {
        t.data.jalons.forEach((j:any) => {
          if (j.date >= today && j.date <= in30 && j.status !== "Atteint") {
            const daysLeft = Math.round((new Date(j.date).getTime() - Date.now()) / 86400000)
            newJalons.push({ name:j.name, date:j.date, project:proj.name, projectId:proj.id, daysLeft, status:j.status })
          }
        })
      }

      // Budget synthèse
      if (t.tool_type === "budget" && t.data?.tasks) {
        const bac   = t.data.tasks.reduce((s:number,t:any) => s+(t.bac??0), 0)
        const spent = t.data.tasks.reduce((s:number,t:any) => {
          let sum = 0; for (let m=0; m<=cp; m++) sum += t.ac?.[m]??0; return s+sum
        }, 0)
        newBudgets.push({ name:proj.name.slice(0,18), bac, spent, pct:bac>0?Math.round(spent/bac*100):0, color:proj.color??"var(--primary)" })
      }

      // Health score
      if (tools) {
        const raidTool = tools.find(tt => tt.project_id === proj.id && tt.tool_type === "raid")
        const budgetTool = tools.find(tt => tt.project_id === proj.id && tt.tool_type === "budget")
        const raidCrit = raidTool?.data?.items?.filter((i:any) => i.priority==="Critique" && i.status==="Ouvert")?.length ?? 0
        const bac2  = budgetTool?.data?.tasks?.reduce((s:number,t:any)=>s+(t.bac??0),0) ?? 0
        const pv2   = budgetTool?.data?.tasks?.reduce((s:number,t:any)=>s+(t.pv?.[cp]??0),0) ?? 0
        const ev2   = budgetTool?.data?.tasks?.reduce((s:number,t:any)=>s+(t.ev?.[cp]??0),0) ?? 0
        const ac2   = budgetTool?.data?.tasks?.reduce((s:number,t:any)=>s+(t.ac?.[cp]??0),0) ?? 0
        const cpi2  = ac2>0?Math.round(ev2/ac2*100)/100:1
        const spi2  = pv2>0?Math.round(ev2/pv2*100)/100:1
        const score = Math.round(Math.min(100, Math.max(0,
          (cpi2 >= 1 ? 30 : cpi2 * 30) +
          (spi2 >= 1 ? 25 : spi2 * 25) +
          Math.max(0, 25 - raidCrit * 5) +
          Math.min(20, (proj.completion??0) * 0.2)
        )))
        if (!newHealth.find(h => h.projectId === proj.id)) {
          newHealth.push({ projectId:proj.id, name:proj.name, score, cpi:cpi2, spi:spi2, raidCrit, completion:proj.completion??0 })
        }
      }
    })

    // Jalon retard
    tools?.forEach(t => {
      const proj = projs.find(p => p.id === t.project_id)
      if (!proj) return
      if (t.tool_type === "jalons" && t.data?.jalons) {
        const retard = t.data.jalons.filter((j:any) => j.date < today && j.status !== "Atteint")
        if (retard.length > 0) newAlerts.push({ type:"jalon", message:retard.length+" jalon(s) en retard", project:proj.name, projectId:proj.id, href:`/projects/${proj.id}/jalons`, severity:"warning" })
      }
    })

    // Courbe S cumulée globale
    const allBudgetTools = tools?.filter(t => t.tool_type === "budget" && t.data?.tasks) ?? []
    const curve = MONTHS.map((month, mi) => {
      let pv = 0, ev = 0, ac = 0
      allBudgetTools.forEach(t => {
        t.data.tasks.forEach((task:any) => {
          for (let m = 0; m <= mi; m++) {
            pv += task.pv?.[m] ?? 0
            ev += task.ev?.[m] ?? 0
            ac += task.ac?.[m] ?? 0
          }
        })
      })
      return { month, PV:pv, EV:ev, AC:ac, current: mi === cp }
    })
    setEvmCurve(curve)

    // IA history
    const grouped: Record<string, number> = {}
    cache?.forEach(c => {
      const d = c.created_at?.split("T")[0]
      if (d) grouped[d] = (grouped[d] ?? 0) + 1
    })
    const aiH = Object.entries(grouped).slice(-7).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("fr-FR", { day:"2-digit", month:"short" }),
      Générations: count
    }))
    setAiHistory(aiH)

    setAlerts(newAlerts)
    setEvmMetrics(newEVM)
    setJalons(newJalons.sort((a,b) => a.daysLeft - b.daysLeft))
    setBudgets(newBudgets)
    setHealth(newHealth.sort((a,b) => a.score - b.score))
    setLoading(false)
  }

  const active     = projects.filter(p => p.status === "active")
  const avg        = projects.length > 0 ? Math.round(projects.reduce((s,p) => s+(p.completion??0), 0) / projects.length) : 0
  const totalBudget = projects.reduce((s,p) => s+(p.budget??0), 0)
  const globalCPI  = evmMetrics.length > 0 ? Math.round(evmMetrics.reduce((s,e) => s+e.cpi, 0) / evmMetrics.length * 100) / 100 : null
  const globalSPI  = evmMetrics.length > 0 ? Math.round(evmMetrics.reduce((s,e) => s+e.spi, 0) / evmMetrics.length * 100) / 100 : null

  const healthColor = (score: number) => score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444"
  const healthLabel = (score: number) => score >= 80 ? "Sain" : score >= 60 ? "Attention" : "Critique"

  const fmt = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+"M€" : n >= 1000 ? (n/1000).toFixed(0)+"k€" : n+"€"

  return (
    <AppLayout>
      {/* Banner upgrade */}
      {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("upgrade") === "success" && (
        <div style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderLeft:"4px solid #22c55e", borderRadius:10, padding:"12px 16px", margin:"0 28px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🎉</span>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:"#22c55e", margin:0 }}>Bienvenue dans le plan Pro !</p>
            <p style={{ fontSize:12, color:"#22c55e", opacity:0.8, margin:0 }}>Votre abonnement est actif. Profitez de tous vos avantages.</p>
          </div>
        </div>
      )}

      <div style={{ padding:"20px 28px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:"0 0 4px" }}>
              Bonjour{user?.user_metadata?.full_name ? ", "+user.user_metadata.full_name.split(" ")[0] : ""} 👋
            </h1>
            <p style={{ fontSize:12, color:"var(--text-3)", margin:0 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Link href="/guide" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12, fontWeight:500, color:"var(--text-2)", textDecoration:"none" }}>
              <Wand2 size={14}/> Guide CP
            </Link>
            <Link href="/guide" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"var(--primary)", borderRadius:8, fontSize:12, fontWeight:600, color:"#fff", textDecoration:"none" }}>
              <Plus size={14}/> Nouveau projet
            </Link>
          </div>
        </div>

        {/* KPIs Row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
          {[
            { label:"Projets actifs",  value:active.length,            sub:projects.length+" au total",  color:"#7B5EFF", bg:"rgba(123,94,255,0.08)",  Icon:FolderKanban },
            { label:"Avancement moy.", value:avg+"%",                  sub:"tous projets",                color:"#22c55e", bg:"rgba(34,197,94,0.08)",   Icon:Target },
            { label:"Budget total",    value:totalBudget>0?fmt(totalBudget):"—", sub:"engagé",           color:"#f59e0b", bg:"rgba(245,158,11,0.08)",  Icon:DollarSign },
            { label:"CPI moyen",       value:globalCPI??"-",           sub:globalCPI?globalCPI>=1?"✅ OK":"⚠️ Dépassement":"N/A", color:globalCPI&&globalCPI<1?"#ef4444":"#22c55e", bg:globalCPI&&globalCPI<1?"rgba(239,68,68,0.08)":"rgba(34,197,94,0.08)", Icon:TrendingUp },
            { label:"SPI moyen",       value:globalSPI??"-",           sub:globalSPI?globalSPI>=1?"✅ En avance":"⚠️ Retard":"N/A", color:globalSPI&&globalSPI<1?"#ef4444":"#3b82f6", bg:globalSPI&&globalSPI<1?"rgba(239,68,68,0.08)":"rgba(59,130,246,0.08)", Icon:Activity },
            { label:"Alertes actives", value:alerts.length,            sub:alerts.length>0?"à traiter":"tout va bien", color:alerts.length>0?"#ef4444":"#22c55e", bg:alerts.length>0?"rgba(239,68,68,0.08)":"rgba(34,197,94,0.08)", Icon:Bell },
          ].map(k => (
            <div key={k.label} style={{ background:k.bg, border:"1px solid "+k.color+"30", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:9, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px" }}>{k.label}</span>
                <k.Icon size={13} style={{ color:k.color }}/>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>{k.value}</div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginTop:4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Ligne 2 : Courbe S + Alertes */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
          {/* Courbe S EVM */}
          <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, padding:"14px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <h2 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>📈 Courbe S EVM — Vue globale</h2>
              <div style={{ display:"flex", gap:12, fontSize:10 }}>
                {[{c:"#3b82f6",l:"PV Planifié"},{c:"#a78bfa",l:"EV Acquis"},{c:"#f59e0b",l:"AC Réel"}].map(x=>(
                  <span key={x.l} style={{ display:"flex", alignItems:"center", gap:4, color:"#94a3b8" }}>
                    <span style={{ width:20, height:2, background:x.c, display:"inline-block", borderRadius:1 }}/>
                    {x.l}
                  </span>
                ))}
              </div>
            </div>
            {evmCurve.some(c => c.PV > 0 || c.EV > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={evmCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                  <XAxis dataKey="month" tick={{ fontSize:9, fill:"#64748b" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:9, fill:"#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => v>=1000?(v/1000).toFixed(0)+"k":v}/>
                  <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155", borderRadius:8, fontSize:11 }} formatter={(v:any) => fmt(v)}/>
                  <ReferenceLine x={MONTHS[new Date().getMonth()]} stroke="#7B5EFF" strokeDasharray="4 2" label={{ value:"Aujourd'hui", fill:"#7B5EFF", fontSize:9 }}/>
                  <Line type="monotone" dataKey="PV" stroke="#3b82f6" strokeWidth={2} dot={false}/>
                  <Line type="monotone" dataKey="EV" stroke="#a78bfa" strokeWidth={2} dot={false}/>
                  <Line type="monotone" dataKey="AC" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2"/>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height:180, display:"flex", alignItems:"center", justifyContent:"center", color:"#475569", fontSize:12 }}>
                Générez un Budget EVM sur vos projets pour voir la courbe S
              </div>
            )}
          </div>

          {/* Alertes */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <h2 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>🔔 Alertes</h2>
              <Link href="/notifications" style={{ fontSize:11, color:"var(--primary-light)", textDecoration:"none" }}>Tout voir →</Link>
            </div>
            {alerts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <CheckCircle2 size={28} style={{ color:"#22c55e", margin:"0 auto 8px", display:"block" }}/>
                <p style={{ fontSize:12, color:"var(--text-2)", margin:0 }}>Aucune alerte</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {alerts.slice(0,5).map((a,i) => {
                  const cfg = SEV[a.severity as keyof typeof SEV] ?? SEV.info
                  const Icon = cfg.icon
                  return (
                    <Link key={i} href={a.href} style={{ display:"block", textDecoration:"none", padding:"8px 10px", borderRadius:8, background:cfg.bg, borderLeft:"3px solid "+cfg.border }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <Icon size={12} style={{ color:cfg.color, flexShrink:0 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:11, fontWeight:600, color:cfg.color, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.project}</p>
                          <p style={{ fontSize:10, color:"var(--text-2)", margin:0 }}>{a.message}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Ligne 3 : EVM métriques + Santé projets */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {/* EVM métriques détaillées */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>📊 Indicateurs EVM par projet</h2>
            {evmMetrics.length === 0 ? (
              <p style={{ fontSize:12, color:"var(--text-3)", textAlign:"center", padding:"20px 0" }}>Aucune donnée EVM — générez un Budget EVM</p>
            ) : evmMetrics.map(e => (
              <div key={e.projectId} style={{ marginBottom:12, padding:"10px 12px", background:"var(--bg)", borderRadius:8, border:"1px solid var(--border)" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", marginBottom:8 }}>{e.projectName}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
                  {[
                    { label:"CPI",  value:e.cpi.toFixed(2),  color:e.cpi>=1?"#22c55e":"#ef4444",  good:e.cpi>=1 },
                    { label:"SPI",  value:e.spi.toFixed(2),  color:e.spi>=1?"#22c55e":"#ef4444",  good:e.spi>=1 },
                    { label:"CV",   value:fmt(e.cv),         color:e.cv>=0?"#22c55e":"#ef4444",   good:e.cv>=0 },
                    { label:"SV",   value:fmt(e.sv),         color:e.sv>=0?"#22c55e":"#ef4444",   good:e.sv>=0 },
                    { label:"EAC",  value:fmt(e.eac),        color:"#f59e0b",                      good:null },
                    { label:"TCPI", value:e.tcpi.toFixed(2), color:e.tcpi<=1?"#22c55e":"#f59e0b", good:e.tcpi<=1 },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign:"center", padding:"5px 4px", background:m.color+"11", borderRadius:6, border:"1px solid "+m.color+"22" }}>
                      <div style={{ fontSize:9, color:"var(--text-3)", marginBottom:2 }}>{m.label}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Score santé projets */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>🏆 Score santé projets</h2>
            {health.length === 0 ? (
              <p style={{ fontSize:12, color:"var(--text-3)", textAlign:"center", padding:"20px 0" }}>Aucune donnée — générez des outils PMO</p>
            ) : health.map(h => (
              <div key={h.projectId} style={{ marginBottom:10, padding:"10px 12px", background:"var(--bg)", borderRadius:8, border:"1px solid "+healthColor(h.score)+"33" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                  <div>
                    <span style={{ fontSize:12, fontWeight:700, color:"var(--text-1)" }}>{h.name}</span>
                    <span style={{ marginLeft:8, fontSize:10, padding:"1px 7px", borderRadius:8, background:healthColor(h.score)+"22", color:healthColor(h.score), fontWeight:600 }}>{healthLabel(h.score)}</span>
                  </div>
                  <span style={{ fontSize:18, fontWeight:900, color:healthColor(h.score) }}>{h.score}</span>
                </div>
                <div style={{ height:6, background:"var(--bg-card)", borderRadius:3, overflow:"hidden", marginBottom:7 }}>
                  <div style={{ width:h.score+"%", height:"100%", background:healthColor(h.score), borderRadius:3, transition:"width 0.4s" }}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5, fontSize:10 }}>
                  <div style={{ color:"var(--text-3)" }}>CPI: <span style={{ color:h.cpi>=1?"#22c55e":"#ef4444", fontWeight:600 }}>{h.cpi.toFixed(2)}</span></div>
                  <div style={{ color:"var(--text-3)" }}>SPI: <span style={{ color:h.spi>=1?"#22c55e":"#ef4444", fontWeight:600 }}>{h.spi.toFixed(2)}</span></div>
                  <div style={{ color:"var(--text-3)" }}>RAID crit: <span style={{ color:h.raidCrit>0?"#ef4444":"#22c55e", fontWeight:600 }}>{h.raidCrit}</span></div>
                  <div style={{ color:"var(--text-3)" }}>Avt: <span style={{ color:"var(--text-1)", fontWeight:600 }}>{h.completion}%</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ligne 4 : Budget + Jalons + IA activity */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          {/* Budget synthèse */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>💰 Budget BAC vs Dépensé</h2>
            {budgets.length === 0 ? (
              <p style={{ fontSize:12, color:"var(--text-3)", textAlign:"center", padding:"20px 0" }}>Aucune donnée budget</p>
            ) : budgets.map(b => (
              <div key={b.name} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:4 }}>
                  <span style={{ color:"var(--text-1)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120 }}>{b.name}</span>
                  <span style={{ color:b.pct>90?"#ef4444":b.pct>70?"#f59e0b":"#22c55e", fontWeight:700 }}>{b.pct}%</span>
                </div>
                <div style={{ height:7, background:"var(--bg)", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ width:b.pct+"%", height:"100%", background:b.pct>90?"#ef4444":b.pct>70?"#f59e0b":"#22c55e", borderRadius:4, transition:"width 0.4s" }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"var(--text-3)", marginTop:2 }}>
                  <span>Dépensé: {fmt(b.spent)}</span>
                  <span>BAC: {fmt(b.bac)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Jalons à venir */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>⏱️ Jalons — 30 prochains jours</h2>
            {jalons.length === 0 ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <Calendar size={28} style={{ color:"var(--text-3)", margin:"0 auto 8px", display:"block" }}/>
                <p style={{ fontSize:12, color:"var(--text-3)" }}>Aucun jalon à venir</p>
              </div>
            ) : jalons.slice(0,5).map((j,i) => (
              <Link key={i} href={`/projects/${j.projectId}/jalons`} style={{ display:"block", textDecoration:"none", padding:"8px 10px", borderRadius:8, background:"var(--bg)", border:"1px solid var(--border)", marginBottom:7 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:140 }}>{j.name}</div>
                    <div style={{ fontSize:10, color:"var(--text-3)" }}>{j.project}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:800, color:j.daysLeft<=3?"#ef4444":j.daysLeft<=7?"#f59e0b":"#3b82f6" }}>{j.daysLeft}j</div>
                    <div style={{ fontSize:9, color:"var(--text-3)" }}>{j.date}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* IA activité */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>🤖 Activité IA — 7 derniers jours</h2>
            {aiHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={aiHistory} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="date" tick={{ fontSize:9, fill:"var(--text-3)" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:9, fill:"var(--text-3)" }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip contentStyle={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:11 }}/>
                  <Bar dataKey="Générations" radius={[4,4,0,0]} fill="var(--primary)"/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height:120, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-3)", fontSize:12 }}>Aucune génération récente</div>
            )}
            {/* Projets récents mini */}
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:5 }}>
              {projects.slice(0,3).map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", borderRadius:6, background:"var(--bg)", textDecoration:"none" }}>
                  <span style={{ fontSize:14 }}>{p.icon || "📁"}</span>
                  <span style={{ fontSize:11, color:"var(--text-1)", fontWeight:500, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</span>
                  <span style={{ fontSize:10, color:"var(--text-3)" }}>{p.completion??0}%</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Projets récents */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>📁 Projets récents</h2>
            <Link href="/projects" style={{ fontSize:11, color:"var(--primary-light)", textDecoration:"none" }}>Voir tous →</Link>
          </div>
          {projects.length === 0 ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <FolderKanban size={36} style={{ color:"var(--text-3)", margin:"0 auto 12px", display:"block" }}/>
              <p style={{ fontSize:13, color:"var(--text-2)", margin:"0 0 16px" }}>Aucun projet. Créez-en un avec le Guide CP.</p>
              <Link href="/guide" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", background:"var(--primary-bg)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:8, fontSize:12, color:"var(--primary-light)", textDecoration:"none", fontWeight:500 }}>
                ✨ Guide CP
              </Link>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {projects.slice(0,7).map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} style={{ display:"block", textDecoration:"none", padding:"12px 14px", border:"1px solid var(--border)", borderRadius:10, background:"var(--bg)", transition:"all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as any).style.borderColor = "var(--primary)"; (e.currentTarget as any).style.background = "var(--primary-bg)" }}
                  onMouseLeave={e => { (e.currentTarget as any).style.borderColor = "var(--border)"; (e.currentTarget as any).style.background = "var(--bg)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <span style={{ fontSize:18 }}>{p.icon || "📁"}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12, fontWeight:600, color:"var(--text-1)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                      <p style={{ fontSize:10, color:"var(--text-3)", margin:0 }}>{p.status}</p>
                    </div>
                    <ArrowRight size={12} style={{ color:"var(--text-3)", flexShrink:0 }}/>
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text-3)", marginBottom:3 }}>
                      <span>Avancement</span>
                      <span style={{ fontWeight:600, color:"var(--text-1)" }}>{p.completion??0}%</span>
                    </div>
                    <div style={{ height:4, background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:2, width:(p.completion??0)+"%", background:p.color??"var(--primary)" }}/>
                    </div>
                  </div>
                  {p.budget > 0 && <p style={{ fontSize:10, color:"#f59e0b", marginTop:6, fontWeight:500 }}>💰 {fmt(p.budget)}</p>}
                </Link>
              ))}
              <Link href="/guide" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px", border:"1px dashed var(--border)", borderRadius:10, textDecoration:"none", color:"var(--text-3)", fontSize:12 }}
                onMouseEnter={e => { (e.currentTarget as any).style.borderColor = "var(--primary)"; (e.currentTarget as any).style.color = "var(--primary-light)" }}
                onMouseLeave={e => { (e.currentTarget as any).style.borderColor = "var(--border)"; (e.currentTarget as any).style.color = "var(--text-3)" }}>
                <Plus size={22} style={{ marginBottom:6 }}/> Nouveau projet
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
