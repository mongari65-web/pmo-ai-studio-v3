"use client"
import { useEffect, useState, useMemo } from "react"
import { Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { AlertTriangle, Plus, ArrowRight, TrendingUp, TrendingDown, Minus, Filter, LayoutGrid, List, RefreshCw } from "lucide-react"
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"

// ── RAG helpers ────────────────────────────────────────────────
function computeRAG(project: any, tools: any[]): { rag: "R"|"A"|"G"; score: number; cpi: number|null; spi: number|null; raidCrit: number; jalonsRetard: number; details: string[] } {
  const cp = new Date().getMonth()
  const today = new Date().toISOString().split("T")[0]
  const details: string[] = []
  let score = 100

  const budgetTool = tools.find(t => t.project_id === project.id && t.tool_type === "budget")
  const raidTool   = tools.find(t => t.project_id === project.id && t.tool_type === "raid")
  const jalonsTool = tools.find(t => t.project_id === project.id && t.tool_type === "jalons")

  let cpi: number|null = null
  let spi: number|null = null

  if (budgetTool?.data) {
    const tasks = budgetTool.data.tasks ?? (budgetTool.data.lines ? budgetTool.data.lines.map((l:any,i:number) => ({
      bac:l.bac??0, pv:Array(12).fill(0).map((_,m)=>m<=cp?Math.round((l.pv??0)/(cp+1)):0),
      ev:Array(12).fill(0).map((_,m)=>m<=cp?Math.round((l.ev??0)/(cp+1)):0),
      ac:Array(12).fill(0).map((_,m)=>m<=cp?Math.round((l.ac??0)/(cp+1)):0),
    })) : [])
    const pv = tasks.reduce((s:number,t:any)=>s+(t.pv?.[cp]??0),0)
    const ev = tasks.reduce((s:number,t:any)=>s+(t.ev?.[cp]??0),0)
    const ac = tasks.reduce((s:number,t:any)=>s+(t.ac?.[cp]??0),0)
    if (ac > 0) { cpi = Math.round(ev/ac*100)/100 }
    if (pv > 0) { spi = Math.round(ev/pv*100)/100 }
    if (cpi !== null && cpi < 0.9)  { score -= 30; details.push(`CPI=${cpi} — dépassement budget`) }
    else if (cpi !== null && cpi < 1) { score -= 15; details.push(`CPI=${cpi} — léger dépassement`) }
    if (spi !== null && spi < 0.9)  { score -= 25; details.push(`SPI=${spi} — retard planning`) }
    else if (spi !== null && spi < 1) { score -= 10; details.push(`SPI=${spi} — léger retard`) }
  }

  const raidCrit = raidTool?.data?.items?.filter((i:any) => i.priority==="Critique" && i.status==="Ouvert")?.length ?? 0
  if (raidCrit > 0) { score -= raidCrit * 10; details.push(`${raidCrit} risque(s) critique(s) RAID`) }

  const jalonsRetard = jalonsTool?.data?.jalons?.filter((j:any) => j.date < today && j.status !== "Atteint")?.length ?? 0
  if (jalonsRetard > 0) { score -= jalonsRetard * 8; details.push(`${jalonsRetard} jalon(s) en retard`) }

  score = Math.max(0, Math.min(100, score))
  const rag: "R"|"A"|"G" = score >= 75 ? "G" : score >= 50 ? "A" : "R"
  return { rag, score, cpi, spi, raidCrit, jalonsRetard, details }
}

const RAG_CFG = {
  G: { label:"Vert",     color:"#22c55e", bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.3)",   dot:"#22c55e", emoji:"🟢" },
  A: { label:"Ambre",    color:"#f59e0b", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.3)",  dot:"#f59e0b", emoji:"🟡" },
  R: { label:"Rouge",    color:"#ef4444", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   dot:"#ef4444", emoji:"🔴" },
}

const fmt = (n:number) => n>=1000000?(n/1000000).toFixed(1)+"M€":n>=1000?(n/1000).toFixed(0)+"k€":n+"€"

export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [tools,    setTools]    = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [view,     setView]     = useState<"rag"|"grid"|"list">("rag")
  const [filterRAG, setFilterRAG] = useState<"all"|"R"|"A"|"G">("all")
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: ps }, { data: ts }] = await Promise.all([
      supabase.from("projects").select("*").order("updated_at", { ascending: false }),
      supabase.from("project_tools").select("project_id,tool_type,data"),
    ])
    const projectsList = ps ?? []
    const toolsList = ts ?? []
    setProjects(projectsList)
    setTools(toolsList)
    setLoading(false)
    // Envoyer alertes ROUGE
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pmo-ai-studio-v3.vercel.app"
      projectsList.forEach(p => {
        const rag = computeRAG(p, toolsList)
        if (rag.rag === "R") {
          fetch('/api/email/alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: u.email,
              projectName: p.name,
              alertType: "ROUGE",
              message: rag.details.join(" | "),
              actionLink: appUrl + "/projects/" + p.id + "/budget"
            })
          }).catch(console.error)
        }
      })
    }
  }

  const projectsWithRAG = useMemo(() =>
    projects.map(p => ({ ...p, ...computeRAG(p, tools) }))
  , [projects, tools])

  const filtered = useMemo(() =>
    filterRAG === "all" ? projectsWithRAG : projectsWithRAG.filter(p => p.rag === filterRAG)
  , [projectsWithRAG, filterRAG])

  // Stats globales
  const stats = useMemo(() => ({
    total:     projects.length,
    green:     projectsWithRAG.filter(p=>p.rag==="G").length,
    amber:     projectsWithRAG.filter(p=>p.rag==="A").length,
    red:       projectsWithRAG.filter(p=>p.rag==="R").length,
    totalBudget: projects.reduce((s,p)=>s+(p.budget??0),0),
    avgScore:  projectsWithRAG.length ? Math.round(projectsWithRAG.reduce((s,p)=>s+p.score,0)/projectsWithRAG.length) : 0,
    avgCompletion: projects.length ? Math.round(projects.reduce((s,p)=>s+(p.completion??0),0)/projects.length) : 0,
  }), [projects, projectsWithRAG])

  // Radar data
  const radarData = useMemo(() => [
    { axis:"Budget", value: projectsWithRAG.filter(p=>p.cpi===null||p.cpi>=1).length / Math.max(1,projects.length) * 100 },
    { axis:"Planning", value: projectsWithRAG.filter(p=>p.spi===null||p.spi>=1).length / Math.max(1,projects.length) * 100 },
    { axis:"Risques", value: Math.max(0, 100 - projectsWithRAG.reduce((s,p)=>s+p.raidCrit,0) * 15) },
    { axis:"Jalons", value: Math.max(0, 100 - projectsWithRAG.reduce((s,p)=>s+p.jalonsRetard,0) * 10) },
    { axis:"Avancement", value: stats.avgCompletion },
  ], [projectsWithRAG, projects, stats])

  if (loading) return (
    <AppLayout>
      <div style={{ padding:40, textAlign:"center", color:"var(--text-3)" }}>Chargement du portfolio...</div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// PORTFOLIO</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Vue Portfolio RAG</h1>
            <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>Rouge · Ambre · Vert — Santé globale de tous vos projets</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={loadData} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
              <RefreshCw size={13}/> Actualiser
            </button>
            <Link href="/guide" style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", background:"var(--primary)", borderRadius:8, fontSize:12, fontWeight:600, color:"#fff", textDecoration:"none" }}>
              <Plus size={13}/> Nouveau projet
            </Link>
          </div>
        </div>

        {/* KPIs RAG */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10 }}>
          {[
            { label:"Total projets", value:stats.total,           color:"var(--primary)",  bg:"var(--primary-bg)" },
            { label:"🟢 Verts",      value:stats.green,           color:"#22c55e",          bg:"rgba(34,197,94,0.08)" },
            { label:"🟡 Ambre",      value:stats.amber,           color:"#f59e0b",          bg:"rgba(245,158,11,0.08)" },
            { label:"🔴 Rouges",     value:stats.red,             color:"#ef4444",          bg:"rgba(239,68,68,0.08)" },
            { label:"Score moyen",   value:stats.avgScore,         color:"#7B5EFF",          bg:"rgba(123,94,255,0.08)" },
            { label:"Avt. moyen",    value:stats.avgCompletion+"%",color:"#3b82f6",          bg:"rgba(59,130,246,0.08)" },
            { label:"Budget total",  value:fmt(stats.totalBudget), color:"#f59e0b",         bg:"rgba(245,158,11,0.08)" },
          ].map(k => (
            <div key={k.label} style={{ background:k.bg, border:"1px solid "+k.color+"30", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
              <div style={{ fontSize:9, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>{k.label}</div>
              <div style={{ fontSize:20, fontWeight:900, color:k.color, lineHeight:1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Ligne 2 : Radar + Barre RAG */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:14 }}>
          {/* Radar santé portfolio */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px" }}>🕸️ Santé portfolio</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)"/>
                <PolarAngleAxis dataKey="axis" tick={{ fontSize:10, fill:"var(--text-3)" }}/>
                <Radar name="Score" dataKey="value" stroke="#7B5EFF" fill="#7B5EFF" fillOpacity={0.2}/>
                <Tooltip contentStyle={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:11 }} formatter={(v:any) => Math.round(v)+"%"}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Barre scores projets */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px" }}>📊 Score santé par projet</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={projectsWithRAG.map(p=>({ name:p.name?.slice(0,14)+"…", score:p.score, rag:p.rag }))} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="name" tick={{ fontSize:9, fill:"var(--text-3)" }} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{ fontSize:9, fill:"var(--text-3)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:11 }} formatter={(v:any) => v+"/100"}/>
                <Bar dataKey="score" radius={[6,6,0,0]}>
                  {projectsWithRAG.map((p,i) => (
                    <Cell key={i} fill={RAG_CFG[p.rag as keyof typeof RAG_CFG].color}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filtres + toggle vue */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", gap:6 }}>
            {([["all","Tous projets"],["G","🟢 Verts"],["A","🟡 Ambre"],["R","🔴 Rouges"]] as const).map(([v,l]) => (
              <button key={v} onClick={() => setFilterRAG(v as any)}
                style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer",
                  border:"1px solid "+(filterRAG===v?(v==="G"?"#22c55e":v==="A"?"#f59e0b":v==="R"?"#ef4444":"var(--primary)"):"var(--border)"),
                  background:filterRAG===v?(v==="G"?"rgba(34,197,94,0.1)":v==="A"?"rgba(245,158,11,0.1)":v==="R"?"rgba(239,68,68,0.1)":"var(--primary-bg)"):"transparent",
                  color:filterRAG===v?(v==="G"?"#22c55e":v==="A"?"#f59e0b":v==="R"?"#ef4444":"var(--primary-light)"):"var(--text-3)" }}>
                {l} {v!=="all" && "("+projectsWithRAG.filter(p=>p.rag===v).length+")"}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:4, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, padding:3 }}>
            {([["rag","🎯 RAG"],["grid","⊞ Grille"],["list","≡ Liste"]] as const).map(([v,l]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:"5px 12px", borderRadius:6, fontSize:11, fontWeight:500, cursor:"pointer", border:"none",
                  background:view===v?"var(--primary-bg)":"transparent", color:view===v?"var(--primary-light)":"var(--text-3)" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Vue RAG — cartes grandes ── */}
        {view === "rag" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
            {filtered.map(p => {
              const cfg = RAG_CFG[p.rag as keyof typeof RAG_CFG]
              return (
                <div key={p.id} style={{ background:"var(--bg-card)", border:"2px solid "+cfg.color+"44", borderRadius:14, overflow:"hidden" }}>
                  {/* Header coloré */}
                  <div style={{ background:cfg.color+"18", borderBottom:"1px solid "+cfg.color+"33", padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:cfg.color+"22", border:"2px solid "+cfg.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                      {p.icon || "📁"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                      <div style={{ fontSize:10, color:"var(--text-3)" }}>{p.status} · Mis à jour {new Date(p.updated_at).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <div style={{ textAlign:"center", flexShrink:0 }}>
                      <div style={{ fontSize:24, lineHeight:1 }}>{cfg.emoji}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:cfg.color, marginTop:2 }}>{cfg.label}</div>
                    </div>
                  </div>

                  <div style={{ padding:"12px 16px" }}>
                    {/* Score + barre */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <div style={{ flex:1, height:8, background:"var(--bg)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ width:p.score+"%", height:"100%", background:cfg.color, borderRadius:4, transition:"width 0.4s" }}/>
                      </div>
                      <span style={{ fontSize:14, fontWeight:800, color:cfg.color, flexShrink:0 }}>{p.score}/100</span>
                    </div>

                    {/* KPIs */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:12 }}>
                      {[
                        { label:"Avancement", value:(p.completion??0)+"%", color:"#3b82f6" },
                        { label:"CPI",         value:p.cpi?p.cpi.toFixed(2):"N/A", color:p.cpi===null?"#64748b":p.cpi>=1?"#22c55e":"#ef4444" },
                        { label:"SPI",         value:p.spi?p.spi.toFixed(2):"N/A", color:p.spi===null?"#64748b":p.spi>=1?"#22c55e":"#ef4444" },
                        { label:"Budget",      value:p.budget>0?fmt(p.budget):"—", color:"#f59e0b" },
                      ].map(k => (
                        <div key={k.label} style={{ textAlign:"center", padding:"6px 4px", background:"var(--bg)", borderRadius:7, border:"1px solid "+k.color+"22" }}>
                          <div style={{ fontSize:9, color:"var(--text-3)", marginBottom:2 }}>{k.label}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:k.color }}>{k.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Alertes */}
                    {p.details.length > 0 ? (
                      <div style={{ marginBottom:10 }}>
                        {p.details.map((d:string, i:number) => (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 8px", background:cfg.bg, borderRadius:6, marginBottom:4, fontSize:11, color:cfg.color }}>
                            <span>⚠️</span> {d}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding:"6px 10px", background:"rgba(34,197,94,0.08)", borderRadius:6, marginBottom:10, fontSize:11, color:"#22c55e", fontWeight:500 }}>
                        ✅ Aucune alerte — projet sain
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display:"flex", gap:6 }}>
                      <Link href={`/projects/${p.id}`} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"7px", background:"var(--primary)", borderRadius:8, fontSize:11, fontWeight:600, color:"#fff", textDecoration:"none" }}>
                        Ouvrir le projet <ArrowRight size={11}/>
                      </Link>
                      <Link href={`/projects/${p.id}/raid`} style={{ padding:"7px 12px", border:"1px solid var(--border)", borderRadius:8, fontSize:11, color:"var(--text-2)", textDecoration:"none" }}>
                        RAID
                      </Link>
                      <Link href={`/projects/${p.id}/budget`} style={{ padding:"7px 12px", border:"1px solid var(--border)", borderRadius:8, fontSize:11, color:"var(--text-2)", textDecoration:"none" }}>
                        EVM
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Bouton ajouter */}
            <Link href="/guide" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, padding:24, border:"2px dashed var(--border)", borderRadius:14, textDecoration:"none", color:"var(--text-3)", minHeight:200 }}
              onMouseEnter={e => { (e.currentTarget as any).style.borderColor = "var(--primary)"; (e.currentTarget as any).style.color = "var(--primary-light)" }}
              onMouseLeave={e => { (e.currentTarget as any).style.borderColor = "var(--border)"; (e.currentTarget as any).style.color = "var(--text-3)" }}>
              <Plus size={28}/>
              <span style={{ fontSize:13, fontWeight:600 }}>Nouveau projet</span>
            </Link>
          </div>
        )}

        {/* ── Vue Grille ── */}
        {view === "grid" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {filtered.map(p => {
              const cfg = RAG_CFG[p.rag as keyof typeof RAG_CFG]
              return (
                <Link key={p.id} href={`/projects/${p.id}`} style={{ display:"block", textDecoration:"none", padding:"14px 16px", background:"var(--bg-card)", border:"1px solid "+cfg.color+"44", borderRadius:12, borderTop:"3px solid "+cfg.color }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <span style={{ fontSize:20 }}>{p.icon||"📁"}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                    </div>
                    <span style={{ fontSize:16 }}>{cfg.emoji}</span>
                  </div>
                  <div style={{ height:5, background:"var(--bg)", borderRadius:3, overflow:"hidden", marginBottom:8 }}>
                    <div style={{ width:p.score+"%", height:"100%", background:cfg.color, borderRadius:3 }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text-3)" }}>
                    <span>Score: <span style={{ color:cfg.color, fontWeight:700 }}>{p.score}</span></span>
                    <span>Avt: <span style={{ color:"#3b82f6", fontWeight:700 }}>{p.completion??0}%</span></span>
                    {p.budget>0 && <span>{fmt(p.budget)}</span>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Vue Liste ── */}
        {view === "list" && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"var(--bg)" }}>
                  {["Projet","RAG","Score","Avancement","CPI","SPI","Budget","Alertes",""].map(h => (
                    <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p,idx) => {
                  const cfg = RAG_CFG[p.rag as keyof typeof RAG_CFG]
                  return (
                    <tr key={p.id} style={{ borderBottom:"1px solid var(--border)", background:idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                      <td style={{ padding:"10px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:16 }}>{p.icon||"📁"}</span>
                          <span style={{ fontSize:12, fontWeight:600, color:"var(--text-1)" }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:"10px 12px" }}>
                        <span style={{ fontSize:13, padding:"2px 10px", borderRadius:20, background:cfg.bg, color:cfg.color, fontWeight:700 }}>{cfg.emoji} {cfg.label}</span>
                      </td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:cfg.color }}>{p.score}/100</td>
                      <td style={{ padding:"10px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:60, height:5, background:"var(--bg)", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ width:(p.completion??0)+"%", height:"100%", background:"#3b82f6", borderRadius:3 }}/>
                          </div>
                          <span style={{ fontSize:11, color:"#3b82f6", fontWeight:600 }}>{p.completion??0}%</span>
                        </div>
                      </td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:p.cpi===null?"#64748b":p.cpi>=1?"#22c55e":"#ef4444" }}>{p.cpi?p.cpi.toFixed(2):"—"}</td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:p.spi===null?"#64748b":p.spi>=1?"#22c55e":"#ef4444" }}>{p.spi?p.spi.toFixed(2):"—"}</td>
                      <td style={{ padding:"10px 12px", color:"#f59e0b", fontWeight:600 }}>{p.budget>0?fmt(p.budget):"—"}</td>
                      <td style={{ padding:"10px 12px" }}>
                        {p.details.length > 0
                          ? <span style={{ fontSize:10, padding:"2px 8px", borderRadius:6, background:cfg.bg, color:cfg.color, fontWeight:600 }}>{p.details.length} alerte(s)</span>
                          : <span style={{ fontSize:10, color:"#22c55e" }}>✅ OK</span>
                        }
                      </td>
                      <td style={{ padding:"10px 12px" }}>
                        <Link href={`/projects/${p.id}`} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", border:"1px solid var(--border)", borderRadius:6, fontSize:11, color:"var(--primary-light)", textDecoration:"none" }}>
                          Ouvrir <ArrowRight size={10}/>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📁</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucun projet trouvé</p>
            <Link href="/guide" style={{ fontSize:13, color:"var(--primary-light)", textDecoration:"none" }}>+ Créer un projet →</Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
