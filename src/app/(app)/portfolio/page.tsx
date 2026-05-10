"use client"
import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"
import {
  FolderKanban, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Clock, DollarSign, Users, Target,
  ArrowUpRight, Filter, LayoutGrid, List
} from "lucide-react"

interface Project {
  id: string; name: string; description: string; client: string
  status: string; completion: number; color: string; icon: string
  methodology: string; budget: number; start_date: string
  end_date: string; created_at: string; team: string[]
}

interface ToolData {
  project_id: string; tool_type: string; data: any
}

const STATUS_COLORS = {
  active: "#22c55e", completed: "#3b82f6", archived: "#64748b"
}

const CHART_COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#be185d","#7c3aed"]

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [toolData, setToolData] = useState<ToolData[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"grid"|"list">("grid")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterMethod, setFilterMethod] = useState("all")
  const [sortBy, setSortBy] = useState<"name"|"completion"|"budget"|"date">("date")
  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("project_tools").select("project_id, tool_type, data")
    ]).then(([{ data: projs }, { data: tools }]) => {
      setProjects(projs ?? [])
      setToolData(tools ?? [])
      setLoading(false)
    })
  }, [])

  // ── KPIs agrégés ──────────────────────────────────────────
  const kpis = useMemo(() => {
    const active = projects.filter(p => p.status === "active")
    const completed = projects.filter(p => p.status === "completed")
    const totalBudget = projects.reduce((s, p) => s + (p.budget ?? 0), 0)
    const avgCompletion = projects.length > 0
      ? Math.round(projects.reduce((s, p) => s + (p.completion ?? 0), 0) / projects.length) : 0

    // CPI global depuis tous les budgets
    let totalEV = 0, totalAC = 0, totalBAC = 0
    const cp = new Date().getMonth()
    toolData.filter(t => t.tool_type === "budget").forEach(t => {
      if (t.data?.tasks) {
        totalEV  += t.data.tasks.reduce((s: number, task: any) => s + (task.ev?.[cp] ?? 0), 0)
        totalAC  += t.data.tasks.reduce((s: number, task: any) => s + (task.ac?.[cp] ?? 0), 0)
        totalBAC += t.data.tasks.reduce((s: number, task: any) => s + (task.bac ?? 0), 0)
      }
    })
    const globalCPI = totalAC > 0 ? totalEV / totalAC : null

    // Risques critiques par projet
    let criticalRisks = 0
    const raidAlerts: { projectId: string; projectName: string; count: number }[] = []
    toolData.filter(t => t.tool_type === "raid").forEach(t => {
      const count = (t.data?.items ?? []).filter((i: any) => i.priority === "Critique" && i.status === "Ouvert").length
      criticalRisks += count
      if (count > 0) {
        const proj = projects.find(p => p.id === t.project_id)
        if (proj) raidAlerts.push({ projectId: proj.id, projectName: proj.name, count })
      }
    })

    // Jalons en retard par projet
    const today = new Date().toISOString().split("T")[0]
    let lateJalons = 0
    const jalonAlerts: { projectId: string; projectName: string; count: number }[] = []
    toolData.filter(t => t.tool_type === "jalons").forEach(t => {
      const count = (t.data?.jalons ?? []).filter((j: any) => j.date < today && j.status !== "Atteint").length
      lateJalons += count
      if (count > 0) {
        const proj = projects.find(p => p.id === t.project_id)
        if (proj) jalonAlerts.push({ projectId: proj.id, projectName: proj.name, count })
      }
    })

    return { active: active.length, completed: completed.length, totalBudget, avgCompletion, globalCPI, criticalRisks, lateJalons, totalBAC, raidAlerts, jalonAlerts }
  }, [projects, toolData])

  // ── Charts data ────────────────────────────────────────────
  const completionData = useMemo(() =>
    projects.slice(0, 8).map(p => ({
      name: p.name.length > 12 ? p.name.slice(0,11)+"…" : p.name,
      Avancement: p.completion ?? 0,
      color: p.color ?? "#2563eb"
    })), [projects])

  const statusData = useMemo(() => [
    { name: "Actifs", value: projects.filter(p=>p.status==="active").length, color: "#22c55e" },
    { name: "Terminés", value: projects.filter(p=>p.status==="completed").length, color: "#3b82f6" },
    { name: "Archivés", value: projects.filter(p=>p.status==="archived").length, color: "#64748b" },
  ].filter(d => d.value > 0), [projects])

  const budgetData = useMemo(() =>
    projects.filter(p => p.budget > 0).slice(0, 6).map(p => ({
      name: p.name.length > 12 ? p.name.slice(0,11)+"…" : p.name,
      Budget: Math.round(p.budget / 1000),
    })), [projects])

  const methodData = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach(p => {
      const m = p.methodology ?? "PMI"
      counts[m] = (counts[m] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: CHART_COLORS[i] }))
  }, [projects])

  // ── Filtered + sorted projects ─────────────────────────────
  const filtered = useMemo(() => {
    let list = [...projects]
    if (filterStatus !== "all") list = list.filter(p => p.status === filterStatus)
    if (filterMethod !== "all") list = list.filter(p => p.methodology === filterMethod)
    list.sort((a, b) => {
      if (sortBy === "completion") return (b.completion ?? 0) - (a.completion ?? 0)
      if (sortBy === "budget") return (b.budget ?? 0) - (a.budget ?? 0)
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return list
  }, [projects, filterStatus, filterMethod, sortBy])

  const methodologies = useMemo(() => Array.from(new Set(projects.map(p => p.methodology ?? "PMI"))), [projects])

  // ── Timeline globale ───────────────────────────────────────
  const timelineProjects = useMemo(() =>
    projects.filter(p => p.start_date && p.end_date)
      .sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  , [projects])

  const timelineMin = timelineProjects[0]?.start_date ?? new Date().toISOString().split("T")[0]
  const timelineMax = timelineProjects.reduce((m,p) => p.end_date > m ? p.end_date : m, timelineMin)
  const totalDays = Math.max(1, Math.ceil((new Date(timelineMax).getTime() - new Date(timelineMin).getTime()) / 86400000))
  const pct = (date: string) => Math.max(0, Math.min(100, (new Date(date).getTime() - new Date(timelineMin).getTime()) / 86400000 / totalDays * 100))
  const widthPct = (s: string, e: string) => Math.max(1, (new Date(e).getTime() - new Date(s).getTime()) / 86400000 / totalDays * 100)
  const todayPct = pct(new Date().toISOString().split("T")[0])

  if (loading) return (
    <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground">Chargement du portfolio...</div></AppLayout>
  )

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Portfolio Projets</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{projects.length} projet{projects.length>1?"s":""} · Vue globale</p>
          </div>
          <Link href="/guide" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            + Nouveau projet
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:"Projets actifs", value:kpis.active, icon:FolderKanban, color:"text-blue-400", bg:"bg-blue-500/10 border-blue-500/20" },
            { label:"Avancement moyen", value:`${kpis.avgCompletion}%`, icon:Target, color:"text-purple-400", bg:"bg-purple-500/10 border-purple-500/20" },
            { label:"Budget portfolio", value:kpis.totalBudget>0?`${(kpis.totalBudget/1000).toFixed(0)}k€`:"—", icon:DollarSign, color:"text-green-400", bg:"bg-green-500/10 border-green-500/20" },
            {
              label:"CPI global",
              value: kpis.globalCPI !== null ? kpis.globalCPI.toFixed(2) : "—",
              icon: kpis.globalCPI !== null && kpis.globalCPI >= 1 ? TrendingUp : TrendingDown,
              color: kpis.globalCPI !== null ? (kpis.globalCPI >= 1 ? "text-green-400" : "text-red-400") : "text-muted-foreground",
              bg: kpis.globalCPI !== null ? (kpis.globalCPI >= 1 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20") : "bg-card border-border"
            },
          ].map(k => (
            <div key={k.label} className={`border rounded-xl p-4 ${k.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{k.label}</p>
                <k.icon size={16} className={k.color}/>
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Alertes portfolio cliquables */}
        {(kpis.criticalRisks > 0 || kpis.lateJalons > 0) && (
          <div className="space-y-2">
            {/* RAID critiques — 1 ligne par projet */}
            {kpis.raidAlerts?.map(alert => (
              <Link key={alert.projectId} href={`/projects/${alert.projectId}/raid`}
                className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 hover:bg-red-500/15 hover:border-red-500/40 transition-all group">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-red-400 flex-shrink-0"/>
                  <div>
                    <p className="text-sm text-red-400 font-medium">
                      {alert.count} risque{alert.count>1?"s":""} critique{alert.count>1?"s":""} ouvert{alert.count>1?"s":""}
                    </p>
                    <p className="text-xs text-red-400/70">{alert.projectName}</p>
                  </div>
                </div>
                <span className="text-xs text-red-400 group-hover:text-red-300 flex items-center gap-1">
                  Voir le RAID <ArrowUpRight size={12}/>
                </span>
              </Link>
            ))}
            {/* Jalons en retard — 1 ligne par projet */}
            {kpis.jalonAlerts?.map(alert => (
              <Link key={alert.projectId} href={`/projects/${alert.projectId}/jalons`}
                className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all group">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-amber-400 flex-shrink-0"/>
                  <div>
                    <p className="text-sm text-amber-400 font-medium">
                      {alert.count} jalon{alert.count>1?"s":""} en retard
                    </p>
                    <p className="text-xs text-amber-400/70">{alert.projectName}</p>
                  </div>
                </div>
                <span className="text-xs text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                  Voir les jalons <ArrowUpRight size={12}/>
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Avancement par projet */}
          <div className="col-span-2 bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-4">📊 Avancement par projet</p>
            {completionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={completionData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                  <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:10 }}/>
                  <YAxis domain={[0,100]} tick={{ fill:"#64748b", fontSize:10 }} tickFormatter={v=>`${v}%`}/>
                  <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:8 }} formatter={(v:any)=>[`${v}%`,"Avancement"]}/>
                  <Bar dataKey="Avancement" radius={[4,4,0,0]}>
                    {completionData.map((d,i) => (
                      <Cell key={i} fill={d.color ?? "#2563eb"}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">Aucun projet</div>
            )}
          </div>

          {/* Répartition statuts */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-4">🍩 Statuts</p>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                    {statusData.map((d,i) => <Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:8 }}/>
                  <Legend wrapperStyle={{ fontSize:11 }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">Aucun projet</div>
            )}
          </div>
        </div>

        {/* Budget + Méthodo charts */}
        {(budgetData.length > 0 || methodData.length > 1) && (
          <div className="grid grid-cols-2 gap-4">
            {budgetData.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-4">💰 Budget par projet (k€)</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={budgetData} layout="vertical" barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis type="number" tick={{ fill:"#64748b", fontSize:10 }} tickFormatter={v=>`${v}k`}/>
                    <YAxis type="category" dataKey="name" tick={{ fill:"#64748b", fontSize:10 }} width={80}/>
                    <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:8 }} formatter={(v:any)=>[`${v}k€`,"Budget"]}/>
                    <Bar dataKey="Budget" fill="#059669" radius={[0,4,4,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {methodData.length > 1 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-4">🏷️ Méthodologies</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={methodData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {methodData.map((d,i) => <Cell key={i} fill={d.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:8 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Timeline globale */}
        {timelineProjects.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-4">📅 Timeline portfolio</p>
            <div className="space-y-2.5">
              {/* Header mois */}
              <div className="relative h-6 ml-32">
                {Array.from({ length: 12 }, (_, i) => {
                  const d = new Date(new Date(timelineMin).getFullYear(), new Date(timelineMin).getMonth() + i, 1)
                  const l = pct(d.toISOString().split("T")[0])
                  if (l > 100) return null
                  return (
                    <div key={i} style={{ position:"absolute", left:`${l}%`, transform:"translateX(-50%)" }}
                      className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {d.toLocaleDateString("fr-FR",{month:"short",year:"2-digit"})}
                    </div>
                  )
                })}
                {/* Today line */}
                <div style={{ position:"absolute", left:`${todayPct}%`, top:0, width:1, height:"100%", background:"#ef4444" }}/>
              </div>
              {/* Barres projets */}
              {timelineProjects.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <Link href={`/projects/${p.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors text-right flex-shrink-0 truncate"
                    style={{ width:120 }}>
                    {p.name.length > 16 ? p.name.slice(0,15)+"…" : p.name}
                  </Link>
                  <div className="flex-1 relative h-6">
                    {/* Today line */}
                    <div style={{ position:"absolute", left:`${todayPct}%`, top:0, width:1, height:"100%", background:"rgba(239,68,68,0.4)", zIndex:10 }}/>
                    {/* Bar */}
                    <div style={{
                      position:"absolute",
                      left:`${pct(p.start_date)}%`,
                      width:`${widthPct(p.start_date, p.end_date)}%`,
                      top:"50%", transform:"translateY(-50%)",
                      height:20, borderRadius:4, minWidth:4,
                      background: p.color ?? "#2563eb",
                    }}>
                      {/* Progress */}
                      {(p.completion ?? 0) > 0 && (
                        <div style={{ width:`${p.completion}%`, height:"100%", background:"rgba(0,0,0,0.3)", borderRadius:4 }}/>
                      )}
                    </div>
                    {/* % label */}
                    <div style={{
                      position:"absolute",
                      left:`calc(${pct(p.start_date)}% + ${widthPct(p.start_date,p.end_date)}% + 4px)`,
                      top:"50%", transform:"translateY(-50%)"
                    }} className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {p.completion ?? 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters + Sort */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-muted-foreground"/>
            <span className="text-xs text-muted-foreground">Filtrer :</span>
          </div>
          {["all","active","completed","archived"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterStatus===s?"bg-primary border-primary text-white":"bg-card border-border text-muted-foreground hover:text-foreground"}`}>
              {s==="all"?"Tous":s==="active"?"Actifs":s==="completed"?"Terminés":"Archivés"}
            </button>
          ))}
          <div className="h-4 w-px bg-border"/>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
            <option value="date">Tri : Date</option>
            <option value="completion">Tri : Avancement</option>
            <option value="budget">Tri : Budget</option>
            <option value="name">Tri : Nom</option>
          </select>
          <div className="ml-auto flex gap-1 bg-card border border-border rounded-lg p-0.5">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view==="grid"?"bg-accent text-foreground":"text-muted-foreground"}`}><LayoutGrid size={14}/></button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded ${view==="list"?"bg-accent text-foreground":"text-muted-foreground"}`}><List size={14}/></button>
          </div>
        </div>

        {/* Projects grid/list */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
            <FolderKanban size={40} className="text-muted-foreground mx-auto mb-3"/>
            <p className="text-sm text-muted-foreground">Aucun projet trouvé</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(p => {
              const projTools = toolData.filter(t => t.project_id === p.id)
              const raidCrit = projTools.find(t=>t.tool_type==="raid")?.data?.items?.filter((i:any)=>i.priority==="Critique"&&i.status==="Ouvert")?.length ?? 0
              const cp = new Date().getMonth()
              const budgetTool = projTools.find(t=>t.tool_type==="budget")?.data?.tasks
              const cpi = budgetTool ? (() => {
                const ev = budgetTool.reduce((s:number,t:any)=>s+(t.ev?.[cp]??0),0)
                const ac = budgetTool.reduce((s:number,t:any)=>s+(t.ac?.[cp]??0),0)
                return ac > 0 ? (ev/ac).toFixed(2) : null
              })() : null

              return (
                <Link key={p.id} href={`/projects/${p.id}`}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all group">
                  <div className="h-1.5" style={{ background: p.color ?? "#2563eb" }}/>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">{p.icon ?? "📋"}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.client}</p>
                        </div>
                      </div>
                      <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5"/>
                    </div>
                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Avancement</span>
                        <span className="font-medium text-foreground">{p.completion ?? 0}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${p.completion??0}%`, background:p.color??"#2563eb" }}/>
                      </div>
                    </div>
                    {/* KPIs mini */}
                    <div className="flex items-center gap-3 text-xs">
                      {p.budget > 0 && <span className="text-green-400">{(p.budget/1000).toFixed(0)}k€</span>}
                      {cpi && <span className={parseFloat(cpi)>=1?"text-green-400":"text-red-400"}>CPI:{cpi}</span>}
                      {raidCrit > 0 && <span className="text-red-400 flex items-center gap-0.5"><AlertTriangle size={10}/>{raidCrit}</span>}
                      <span className="ml-auto text-muted-foreground">{p.methodology}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* List view */
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary/10 border-b border-border">
                  {["Projet","Client","Méthodo","Avancement","Budget","CPI","Statut",""].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const cp = new Date().getMonth()
                  const budgetTool = toolData.find(t=>t.project_id===p.id&&t.tool_type==="budget")?.data?.tasks
                  const cpi = budgetTool ? (() => {
                    const ev = budgetTool.reduce((s:number,t:any)=>s+(t.ev?.[cp]??0),0)
                    const ac = budgetTool.reduce((s:number,t:any)=>s+(t.ac?.[cp]??0),0)
                    return ac > 0 ? (ev/ac).toFixed(2) : null
                  })() : null
                  const statusCfg = { active:{c:"#22c55e",l:"Actif"}, completed:{c:"#3b82f6",l:"Terminé"}, archived:{c:"#64748b",l:"Archivé"} }
                  const cfg = statusCfg[p.status as keyof typeof statusCfg] ?? statusCfg.active

                  return (
                    <tr key={p.id} className="border-b border-border hover:bg-accent/20 group">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span>{p.icon ?? "📋"}</span>
                          <Link href={`/projects/${p.id}`} className="font-medium text-foreground group-hover:text-primary transition-colors text-xs">{p.name}</Link>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.client}</td>
                      <td className="px-3 py-2.5"><span className="text-[10px] px-2 py-0.5 bg-muted rounded">{p.methodology}</span></td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width:`${p.completion??0}%`, background:p.color??"#2563eb" }}/>
                          </div>
                          <span className="text-xs text-muted-foreground">{p.completion??0}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-green-400">{p.budget>0?`${(p.budget/1000).toFixed(0)}k€`:"—"}</td>
                      <td className="px-3 py-2.5 text-xs font-bold" style={{ color:cpi?(parseFloat(cpi)>=1?"#22c55e":"#ef4444"):"#64748b" }}>{cpi??"-"}</td>
                      <td className="px-3 py-2.5"><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background:cfg.c+"22",color:cfg.c }}>{cfg.l}</span></td>
                      <td className="px-3 py-2.5">
                        <Link href={`/projects/${p.id}`} className="text-xs text-primary hover:underline">Ouvrir →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
