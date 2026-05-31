"use client"
import { useEffect, useState, useMemo } from "react"
import { Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Plus, FolderKanban, Target, DollarSign, Bell, AlertTriangle, Clock, CheckCircle2, Wand2, ArrowRight, TrendingUp, Activity, Calendar, ChevronDown } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

function getEVMTasks(data: any, cp: number) {
  if (!data) return []
  if (data.tasks?.length) return data.tasks
  if (data.lines?.length) {
    return data.lines.map((l: any, i: number) => ({
      id: l.id ?? "T"+i, wbs: (i+1)+".0", name: l.workpackage ?? l.phase ?? "WP"+(i+1),
      bac: l.bac ?? 0,
      pv: Array(12).fill(0).map((_,m) => m <= cp ? Math.round((l.pv??0)/(cp+1)) : 0),
      ev: Array(12).fill(0).map((_,m) => m <= cp ? Math.round((l.ev??0)/(cp+1)) : 0),
      ac: Array(12).fill(0).map((_,m) => m <= cp ? Math.round((l.ac??0)/(cp+1)) : 0),
    }))
  }
  return []
}

export default function DashboardPage() {
  const [projects, setProjects]     = useState<any[]>([])
  const [user, setUser]             = useState<any>(null)
  const [selectedId, setSelectedId] = useState<string>("all")
  const [tools, setTools]           = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [showProjectMenu, setShowProjectMenu] = useState(false)
  const supabase = createClient()
  const cp = new Date().getMonth()
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    supabase.auth.getUser().then(({data}) => setUser(data.user))
    loadData()
  }, [])

  const loadData = async () => {
    const { data: projs } = await supabase.from("projects").select("*").order("updated_at", { ascending: false })
    const { data: ts }    = await supabase.from("project_tools").select("project_id,tool_type,data,updated_at")
    setProjects(projs ?? [])
    setTools(ts ?? [])
    if (projs?.length) setSelectedId(projs[0].id)
    setLoading(false)
  }

  const selectedProject = projects.find(p => p.id === selectedId)

  // Outils du projet sélectionné
  const projectTools = useMemo(() => {
    if (selectedId === "all") return {}
    const pts = tools.filter(t => t.project_id === selectedId)
    const map: Record<string, any> = {}
    pts.forEach(t => { map[t.tool_type] = t.data })
    return map
  }, [selectedId, tools])

  // EVM
  const evmTasks = useMemo(() => getEVMTasks(projectTools.budget, cp), [projectTools.budget, cp])
  const bac  = evmTasks.reduce((s:number,t:any) => s+(t.bac??0), 0)
  const pv   = evmTasks.reduce((s:number,t:any) => s+(t.pv?.[cp]??0), 0)
  const ev   = evmTasks.reduce((s:number,t:any) => s+(t.ev?.[cp]??0), 0)
  const ac   = evmTasks.reduce((s:number,t:any) => s+(t.ac?.[cp]??0), 0)
  const cpi  = ac > 0 ? Math.round(ev/ac*100)/100 : null
  const spi  = pv > 0 ? Math.round(ev/pv*100)/100 : null
  const cv   = ev - ac
  const sv   = ev - pv
  const eac  = cpi && cpi > 0 ? Math.round(bac/cpi) : bac
  const tcpi = (bac - ev) > 0 && (bac - ac) > 0 ? Math.round((bac-ev)/(bac-ac)*100)/100 : null
  const vac  = bac - eac

  // Courbe S cumulée
  const evmCurve = useMemo(() => {
    if (!evmTasks.length) return []
    return MONTHS.map((month, mi) => {
      let pvC = 0, evC = 0, acC = 0
      evmTasks.forEach((t:any) => {
        for (let m = 0; m <= mi; m++) {
          pvC += t.pv?.[m] ?? 0
          evC += t.ev?.[m] ?? 0
          acC += t.ac?.[m] ?? 0
        }
      })
      return { month, PV:pvC, EV:evC, AC:acC }
    })
  }, [evmTasks])

  // RAID
  const raidItems   = projectTools.raid?.items ?? []
  const raidCrit    = raidItems.filter((i:any) => i.priority==="Critique" && i.status==="Ouvert")
  const raidOpen    = raidItems.filter((i:any) => i.status==="Ouvert")

  // Jalons
  const jalonsAll   = projectTools.jalons?.jalons ?? []
  const jalonsNext  = jalonsAll.filter((j:any) => j.date >= today && j.status !== "Atteint")
    .map((j:any) => ({ ...j, daysLeft: Math.round((new Date(j.date).getTime()-Date.now())/86400000) }))
    .sort((a:any,b:any) => a.daysLeft - b.daysLeft).slice(0,5)
  const jalonsRetard = jalonsAll.filter((j:any) => j.date < today && j.status !== "Atteint")

  // Score santé
  const healthScore = useMemo(() => {
    let score = 0
    if (cpi !== null) score += cpi >= 1 ? 30 : Math.max(0, cpi * 30)
    else score += 15
    if (spi !== null) score += spi >= 1 ? 25 : Math.max(0, spi * 25)
    else score += 12
    score += Math.max(0, 25 - raidCrit.length * 5)
    score += Math.min(20, (selectedProject?.completion ?? 0) * 0.2)
    return Math.round(Math.min(100, Math.max(0, score)))
  }, [cpi, spi, raidCrit.length, selectedProject])

  const healthColor = (s:number) => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444"
  const healthLabel = (s:number) => s >= 80 ? "🟢 Sain" : s >= 60 ? "🟡 Attention" : "🔴 Critique"

  // Alertes globales tous projets
  const alerts = useMemo(() => {
    const a: any[] = []
    tools.forEach(t => {
      const proj = projects.find(p => p.id === t.project_id)
      if (!proj) return
      if (t.tool_type === "raid" && t.data?.items) {
        const crit = t.data.items.filter((i:any) => i.priority==="Critique" && i.status==="Ouvert")
        if (crit.length > 0) a.push({ message:crit.length+" risque(s) critique(s)", project:proj.name, href:`/projects/${proj.id}/raid`, color:"#ef4444", bg:"rgba(239,68,68,0.08)" })
      }
      if (t.tool_type === "jalons" && t.data?.jalons) {
        const ret = t.data.jalons.filter((j:any) => j.date < today && j.status !== "Atteint")
        if (ret.length > 0) a.push({ message:ret.length+" jalon(s) en retard", project:proj.name, href:`/projects/${proj.id}/jalons`, color:"#f59e0b", bg:"rgba(245,158,11,0.08)" })
      }
    })
    return a
  }, [tools, projects])

  const fmt = (n:number) => n >= 1000000 ? (n/1000000).toFixed(1)+"M€" : n >= 1000 ? (n/1000).toFixed(0)+"k€" : n+"€"
  const fmtSign = (n:number) => (n >= 0 ? "+" : "") + fmt(n)

  const Metric = ({ label, value, color, sub }: any) => (
    <div style={{ background:"var(--bg)", border:"1px solid "+color+"30", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
      <div style={{ fontSize:9, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:900, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:9, color:"var(--text-3)", marginTop:3 }}>{sub}</div>}
    </div>
  )

  return (
    <AppLayout>
      <div style={{ padding:"18px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"var(--text-1)", margin:"0 0 3px" }}>
              Bonjour{user?.user_metadata?.full_name ? ", "+user.user_metadata.full_name.split(" ")[0] : ""} 👋
            </h1>
            <p style={{ fontSize:11, color:"var(--text-3)", margin:0 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Link href="/guide" style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12, fontWeight:500, color:"var(--text-2)", textDecoration:"none" }}>
              <Wand2 size={13}/> Guide CP
            </Link>
            <Link href="/guide" style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", background:"var(--primary)", borderRadius:8, fontSize:12, fontWeight:600, color:"#fff", textDecoration:"none" }}>
              <Plus size={13}/> Nouveau projet
            </Link>
          </div>
        </div>

        {/* Sélecteur projet */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"12px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", flexShrink:0 }}>📊 Projet analysé :</span>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", flex:1 }}>
              {projects.map(p => (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer", border:"1px solid "+(selectedId===p.id?"var(--primary)":"var(--border)"), background:selectedId===p.id?"var(--primary-bg)":"transparent", color:selectedId===p.id?"var(--primary-light)":"var(--text-2)", transition:"all 0.15s" }}>
                  <span style={{ fontSize:14 }}>{p.icon || "📁"}</span>
                  <span>{p.name.length > 20 ? p.name.slice(0,19)+"…" : p.name}</span>
                  {selectedId===p.id && <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--primary)", flexShrink:0 }}/>}
                </button>
              ))}
            </div>
            {selectedProject && (
              <Link href={`/projects/${selectedProject.id}`} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", border:"1px solid var(--border)", borderRadius:8, fontSize:11, color:"var(--text-2)", textDecoration:"none", flexShrink:0 }}>
                Ouvrir <ArrowRight size={11}/>
              </Link>
            )}
          </div>
        </div>

        {selectedProject && (
          <>
            {/* KPIs projet */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8 }}>
              <Metric label="Avancement" value={(selectedProject.completion??0)+"%"} color="#7B5EFF" sub="du projet"/>
              <Metric label="Budget BAC"  value={fmt(selectedProject.budget??0)}      color="#f59e0b" sub="alloué"/>
              <Metric label="CPI"         value={cpi??"-"}   color={cpi===null?"#64748b":cpi>=1?"#22c55e":"#ef4444"} sub={cpi===null?"N/A":cpi>=1?"✅ OK":"⚠️ Dépassement"}/>
              <Metric label="SPI"         value={spi??"-"}   color={spi===null?"#64748b":spi>=1?"#22c55e":"#ef4444"} sub={spi===null?"N/A":spi>=1?"✅ Avance":"⚠️ Retard"}/>
              <Metric label="EAC"         value={bac>0?fmt(eac):"-"}  color="#f97316" sub={bac>0?"Prévision finale":"N/A"}/>
              <Metric label="VAC"         value={bac>0?fmtSign(vac):"-"} color={vac>=0?"#22c55e":"#ef4444"} sub="Écart à fin"/>
              <Metric label="Score santé" value={healthScore} color={healthColor(healthScore)} sub={healthLabel(healthScore)}/>
            </div>

            {/* Ligne 2 : Courbe S + EVM détail */}
            <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:14 }}>
              {/* Courbe S */}
              <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, padding:"14px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>📈 Courbe S EVM — {selectedProject.name}</h3>
                  <div style={{ display:"flex", gap:10, fontSize:10 }}>
                    {[{c:"#3b82f6",l:"PV"},{c:"#a78bfa",l:"EV"},{c:"#f59e0b",l:"AC"}].map(x=>(
                      <span key={x.l} style={{ display:"flex", alignItems:"center", gap:4, color:"#94a3b8" }}>
                        <span style={{ width:16, height:2, background:x.c, display:"inline-block", borderRadius:1 }}/>{x.l}
                      </span>
                    ))}
                  </div>
                </div>
                {evmCurve.some(c => c.PV > 0) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={evmCurve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                      <XAxis dataKey="month" tick={{ fontSize:9, fill:"#64748b" }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize:9, fill:"#64748b" }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?(v/1000).toFixed(0)+"k":v}/>
                      <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155", borderRadius:8, fontSize:11 }} formatter={(v:any)=>fmt(v)}/>
                      <ReferenceLine x={MONTHS[cp]} stroke="#7B5EFF" strokeDasharray="4 2"/>
                      <Line type="monotone" dataKey="PV" stroke="#3b82f6" strokeWidth={2.5} dot={false}/>
                      <Line type="monotone" dataKey="EV" stroke="#a78bfa" strokeWidth={2.5} dot={false}/>
                      <Line type="monotone" dataKey="AC" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 2"/>
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height:180, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <span style={{ fontSize:28 }}>💰</span>
                    <p style={{ fontSize:12, color:"#475569", margin:0 }}>Aucune donnée EVM</p>
                    <Link href={`/projects/${selectedProject.id}/budget`} style={{ fontSize:11, color:"#7B5EFF", textDecoration:"none", padding:"4px 12px", border:"1px solid rgba(123,94,255,0.3)", borderRadius:6 }}>
                      Générer Budget EVM →
                    </Link>
                  </div>
                )}
              </div>

              {/* Indicateurs EVM + TCPI */}
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
                <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>📊 Indicateurs période {MONTHS[cp]}</h3>
                {evmTasks.length > 0 ? (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                      {[
                        { label:"PV — Valeur Planifiée",  value:fmt(pv),  color:"#3b82f6", desc:"Budget prévu à ce jour" },
                        { label:"EV — Valeur Acquise",    value:fmt(ev),  color:"#a78bfa", desc:"Travail réellement fait" },
                        { label:"AC — Coût Réel",         value:fmt(ac),  color:"#f59e0b", desc:"Dépenses engagées" },
                        { label:"BAC — Budget Total",     value:fmt(bac), color:"#64748b", desc:"Budget à complétion" },
                        { label:"CV — Écart Coût",        value:fmtSign(cv), color:cv>=0?"#22c55e":"#ef4444", desc:cv>=0?"Sous budget":"Sur budget" },
                        { label:"SV — Écart Délai",       value:fmtSign(sv), color:sv>=0?"#22c55e":"#ef4444", desc:sv>=0?"En avance":"En retard" },
                        { label:"EAC — Prévision finale", value:fmt(eac), color:"#f97316", desc:"Coût estimé à fin" },
                        { label:"TCPI",                   value:tcpi?tcpi.toFixed(2):"-", color:tcpi&&tcpi<=1?"#22c55e":"#f59e0b", desc:"Performance requise" },
                      ].map(m => (
                        <div key={m.label} style={{ background:"var(--bg)", borderRadius:7, padding:"7px 10px", border:"1px solid "+m.color+"22" }}>
                          <div style={{ fontSize:9, color:"var(--text-3)", marginBottom:2, fontWeight:600 }}>{m.label}</div>
                          <div style={{ fontSize:15, fontWeight:800, color:m.color }}>{m.value}</div>
                          <div style={{ fontSize:9, color:"var(--text-3)", marginTop:1 }}>{m.desc}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign:"center", padding:"30px 0", color:"var(--text-3)", fontSize:12 }}>
                    Générez un Budget EVM pour voir les indicateurs
                  </div>
                )}
              </div>
            </div>

            {/* Ligne 3 : RAID + Jalons */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {/* RAID résumé */}
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>⚠️ RAID — Résumé</h3>
                  <Link href={`/projects/${selectedProject.id}/raid`} style={{ fontSize:11, color:"var(--primary-light)", textDecoration:"none" }}>Voir tout →</Link>
                </div>
                {raidItems.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:"var(--text-3)", fontSize:12 }}>
                    Aucun élément RAID — <Link href={`/projects/${selectedProject.id}/raid`} style={{ color:"var(--primary-light)" }}>Générer →</Link>
                  </div>
                ) : (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:12 }}>
                      {[
                        { label:"Total",    value:raidItems.length,   color:"var(--primary)" },
                        { label:"Critiques",value:raidCrit.length,    color:"#ef4444" },
                        { label:"Ouverts",  value:raidOpen.length,    color:"#f59e0b" },
                        { label:"Résolus",  value:raidItems.filter((i:any)=>i.status==="Résolu"||i.status==="Fermé").length, color:"#22c55e" },
                      ].map(k => (
                        <div key={k.label} style={{ textAlign:"center", padding:"8px", background:k.color+"11", borderRadius:8, border:"1px solid "+k.color+"22" }}>
                          <div style={{ fontSize:18, fontWeight:800, color:k.color }}>{k.value}</div>
                          <div style={{ fontSize:10, color:"var(--text-3)" }}>{k.label}</div>
                        </div>
                      ))}
                    </div>
                    {raidCrit.slice(0,3).map((r:any, i:number) => (
                      <div key={i} style={{ padding:"7px 10px", background:"rgba(239,68,68,0.06)", borderRadius:7, borderLeft:"3px solid #ef4444", marginBottom:6 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:"#ef4444" }}>{r.title}</div>
                        <div style={{ fontSize:10, color:"var(--text-3)" }}>👤 {r.owner} · 📅 {r.due_date}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Jalons */}
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>⏱️ Jalons à venir</h3>
                  <Link href={`/projects/${selectedProject.id}/jalons`} style={{ fontSize:11, color:"var(--primary-light)", textDecoration:"none" }}>Voir tout →</Link>
                </div>
                {jalonsRetard.length > 0 && (
                  <div style={{ padding:"6px 10px", background:"rgba(239,68,68,0.08)", borderRadius:7, borderLeft:"3px solid #ef4444", marginBottom:10, fontSize:11, color:"#ef4444", fontWeight:600 }}>
                    ⚠️ {jalonsRetard.length} jalon(s) en retard
                  </div>
                )}
                {jalonsNext.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:"var(--text-3)", fontSize:12 }}>
                    Aucun jalon dans les 30 prochains jours
                  </div>
                ) : jalonsNext.map((j:any, i:number) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", background:"var(--bg)", borderRadius:8, border:"1px solid var(--border)", marginBottom:7 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:"var(--text-1)" }}>{j.name}</div>
                      <div style={{ fontSize:10, color:"var(--text-3)" }}>📅 {j.date} · {j.status}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:j.daysLeft<=3?"#ef4444":j.daysLeft<=7?"#f59e0b":"#3b82f6" }}>{j.daysLeft}j</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Alertes globales + Projets récents */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:14 }}>
          {/* Alertes tous projets */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>🔔 Alertes globales</h3>
              <span style={{ fontSize:11, padding:"1px 8px", borderRadius:8, background:alerts.length>0?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)", color:alerts.length>0?"#ef4444":"#22c55e", fontWeight:600 }}>{alerts.length}</span>
            </div>
            {alerts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"16px 0" }}>
                <CheckCircle2 size={24} style={{ color:"#22c55e", margin:"0 auto 6px", display:"block" }}/>
                <p style={{ fontSize:12, color:"var(--text-2)", margin:0 }}>Tous les projets sont sains</p>
              </div>
            ) : alerts.map((a,i) => (
              <Link key={i} href={a.href} style={{ display:"block", textDecoration:"none", padding:"7px 10px", borderRadius:7, background:a.bg, borderLeft:"3px solid "+a.color, marginBottom:6 }}>
                <div style={{ fontSize:11, fontWeight:600, color:a.color }}>{a.project}</div>
                <div style={{ fontSize:10, color:"var(--text-2)" }}>{a.message}</div>
              </Link>
            ))}
          </div>

          {/* Projets récents */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>📁 Tous les projets</h3>
              <Link href="/projects" style={{ fontSize:11, color:"var(--primary-light)", textDecoration:"none" }}>Voir tous →</Link>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {projects.map(p => (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  style={{ display:"block", textAlign:"left", padding:"10px 12px", border:"1px solid "+(selectedId===p.id?"var(--primary)":"var(--border)"), borderRadius:9, background:selectedId===p.id?"var(--primary-bg)":"var(--bg)", cursor:"pointer", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                    <span style={{ fontSize:16 }}>{p.icon || "📁"}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{p.name}</span>
                  </div>
                  <div style={{ height:4, background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ width:(p.completion??0)+"%", height:"100%", background:p.color??"var(--primary)", borderRadius:2 }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"var(--text-3)", marginTop:4 }}>
                    <span>{p.completion??0}%</span>
                    {p.budget>0 && <span>💰{fmt(p.budget)}</span>}
                  </div>
                </button>
              ))}
              <Link href="/guide" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"10px", border:"1px dashed var(--border)", borderRadius:9, textDecoration:"none", color:"var(--text-3)", fontSize:12 }}>
                <Plus size={20} style={{ marginBottom:4 }}/> Nouveau
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
