"use client"
import { useEffect, useState, useMemo, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { RefreshCw, ZoomIn, ZoomOut, RotateCcw, Filter, ChevronDown, ChevronRight } from "lucide-react"

interface Task { id:string; name:string; phase:string; start:string; end:string; progress:number; critical:boolean; responsible:string; dependencies:string }
interface ProjectData { id:string; name:string; icon:string; color:string; completion:number; tasks:Task[] }

const TODAY = new Date().toISOString().split("T")[0]

function daysBetween(a:string, b:string) { return Math.round((new Date(b).getTime()-new Date(a).getTime())/86400000) }
function addDays(date:string, days:number) { const d=new Date(date); d.setDate(d.getDate()+days); return d.toISOString().split("T")[0] }

const PROJECT_COLORS = ["#7B5EFF","#3b82f6","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316"]

export default function TimelinePage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading,  setLoading]  = useState(true)
  const [zoom,     setZoom]     = useState(3) // pixels per day
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [filterProject, setFilterProject] = useState<string[]>([])
  const [showCritical, setShowCritical] = useState(false)
  const [viewStart, setViewStart] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: projs } = await supabase.from("projects").select("*").order("created_at", { ascending:false })
    const { data: tools } = await supabase.from("project_tools").select("project_id,tool_type,data").eq("tool_type","gantt")

    if (!projs) { setLoading(false); return }

    const result: ProjectData[] = projs.map((p,i) => {
      const gantt = tools?.find(t=>t.project_id===p.id)
      const tasks: Task[] = gantt?.data?.tasks ?? []
      return { id:p.id, name:p.name, icon:p.icon||"📁", color:PROJECT_COLORS[i%PROJECT_COLORS.length], completion:p.completion??0, tasks }
    }).filter(p => p.tasks.length > 0)

    setProjects(result)
    setFilterProject(result.map(p=>p.id))

    // Calculer la date de début de vue (min de toutes les tâches)
    const allStarts = result.flatMap(p=>p.tasks.map(t=>t.start)).filter(Boolean).sort()
    if (allStarts.length) {
      const minStart = allStarts[0]
      setViewStart(addDays(minStart, -7))
    } else {
      setViewStart(addDays(TODAY, -30))
    }
    setLoading(false)
  }

  const viewEnd = useMemo(() => {
    const allEnds = projects.flatMap(p=>p.tasks.map(t=>t.end)).filter(Boolean).sort()
    return allEnds.length ? addDays(allEnds[allEnds.length-1], 14) : addDays(TODAY, 180)
  }, [projects])

  const totalDays = useMemo(() => viewStart ? daysBetween(viewStart, viewEnd) : 0, [viewStart, viewEnd])
  const totalWidth = totalDays * zoom

  // Colonnes mois
  const monthCols = useMemo(() => {
    if (!viewStart) return []
    const cols: { label:string; left:number; width:number }[] = []
    let cur = new Date(viewStart)
    const end = new Date(viewEnd)
    while (cur <= end) {
      const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1)
      const monthEnd   = new Date(cur.getFullYear(), cur.getMonth()+1, 0)
      const left = Math.max(0, daysBetween(viewStart, monthStart.toISOString().split("T")[0])) * zoom
      const right = Math.min(totalDays, daysBetween(viewStart, monthEnd.toISOString().split("T")[0])+1) * zoom
      cols.push({
        label: cur.toLocaleDateString("fr-FR", { month:"short", year:"2-digit" }),
        left, width: right-left
      })
      cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1)
    }
    return cols
  }, [viewStart, viewEnd, zoom, totalDays])

  const todayLeft = viewStart ? daysBetween(viewStart, TODAY) * zoom : 0

  const filtered = projects.filter(p => filterProject.includes(p.id))

  const taskBar = (task:Task, projColor:string) => {
    if (!viewStart || !task.start || !task.end) return null
    const left = daysBetween(viewStart, task.start) * zoom
    const width = Math.max(4, daysBetween(task.start, task.end) * zoom)
    if (left < -width || left > totalWidth) return null

    const color = task.critical ? "#ef4444" : projColor
    const isLate = task.end < TODAY && task.progress < 100

    return (
      <div key={task.id} style={{ position:"absolute", left, top:4, width, height:16, borderRadius:3, background:color+"33", border:"1px solid "+color, overflow:"hidden", cursor:"pointer" }}
        title={`${task.name}\n${task.start} → ${task.end}\n${task.progress}%${task.responsible?" · "+task.responsible:""}`}>
        <div style={{ width:task.progress+"%", height:"100%", background:color, opacity:0.8 }}/>
        {isLate && <div style={{ position:"absolute", right:2, top:0, fontSize:8, color:"#fff" }}>!</div>}
      </div>
    )
  }

  const ROW_H = 26
  const LABEL_W = 280
  const HEADER_H = 52

  return (
    <AppLayout>
      <div style={{ padding:"18px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// TIMELINE</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Timeline Multi-Projets</h1>
            <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>Vue Gantt globale — tous projets sur une seule timeline</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={loadData} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
              <RefreshCw size={13}/> Actualiser
            </button>
          </div>
        </div>

        {/* KPIs */}
        {projects.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
            {[
              { label:"Projets",         value:projects.length,                                                              color:"var(--primary)" },
              { label:"Tâches total",    value:projects.reduce((s,p)=>s+p.tasks.length,0),                                  color:"#3b82f6" },
              { label:"Critiques",       value:projects.reduce((s,p)=>s+p.tasks.filter(t=>t.critical).length,0),            color:"#ef4444" },
              { label:"En retard",       value:projects.reduce((s,p)=>s+p.tasks.filter(t=>t.end<TODAY&&t.progress<100).length,0), color:"#f59e0b" },
              { label:"Avt. moyen",      value:Math.round(projects.reduce((s,p)=>s+p.completion,0)/projects.length)+"%",    color:"#22c55e" },
            ].map(k => (
              <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Contrôles */}
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {/* Filtres projets */}
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {projects.map(p => (
              <button key={p.id} onClick={() => setFilterProject(fp => fp.includes(p.id) ? fp.filter(x=>x!==p.id) : [...fp,p.id])}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer",
                  border:"1px solid "+(filterProject.includes(p.id)?p.color:"var(--border)"),
                  background:filterProject.includes(p.id)?p.color+"22":"transparent",
                  color:filterProject.includes(p.id)?p.color:"var(--text-3)" }}>
                <span>{p.icon}</span> {p.name.slice(0,18)}{p.name.length>18?"…":""}
              </button>
            ))}
          </div>

          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            <button onClick={() => setShowCritical(!showCritical)}
              style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(showCritical?"#ef4444":"var(--border)"), background:showCritical?"rgba(239,68,68,0.1)":"transparent", color:showCritical?"#ef4444":"var(--text-3)" }}>
              🔴 Critiques seulement
            </button>
            <div style={{ display:"flex", gap:3, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:7, padding:2 }}>
              <button onClick={() => setZoom(z=>Math.min(10,z+1))} style={{ padding:"3px 8px", borderRadius:5, border:"none", background:"transparent", cursor:"pointer", color:"var(--text-2)" }}><ZoomIn size={13}/></button>
              <span style={{ fontSize:10, color:"var(--text-3)", padding:"3px 4px", alignSelf:"center" }}>{zoom}px/j</span>
              <button onClick={() => setZoom(z=>Math.max(1,z-1))} style={{ padding:"3px 8px", borderRadius:5, border:"none", background:"transparent", cursor:"pointer", color:"var(--text-2)" }}><ZoomOut size={13}/></button>
            </div>
            <button onClick={() => { setZoom(3); scrollRef.current?.scrollTo({ left: Math.max(0,todayLeft-200), behavior:"smooth" }) }}
              style={{ padding:"5px 10px", borderRadius:7, fontSize:11, border:"1px solid var(--border)", background:"transparent", cursor:"pointer", color:"var(--text-2)", display:"flex", alignItems:"center", gap:4 }}>
              <RotateCcw size={11}/> Aujourd'hui
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text-3)" }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucun projet avec un Gantt généré</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez un Gantt sur vos projets pour voir la timeline globale</p>
          </div>
        ) : (
          /* ── GANTT ── */
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
            <div style={{ display:"flex" }}>

              {/* Labels colonne gauche */}
              <div style={{ width:LABEL_W, flexShrink:0, borderRight:"2px solid var(--border)", zIndex:10 }}>
                {/* Header */}
                <div style={{ height:HEADER_H, background:"var(--bg)", borderBottom:"2px solid var(--border)", display:"flex", alignItems:"flex-end", padding:"0 12px 8px" }}>
                  <span style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Projet / Tâche</span>
                </div>

                {/* Lignes projets et tâches */}
                {filtered.map(proj => {
                  const isCollapsed = collapsed.has(proj.id)
                  const tasks = showCritical ? proj.tasks.filter(t=>t.critical) : proj.tasks
                  return (
                    <div key={proj.id}>
                      {/* Ligne projet */}
                      <div onClick={() => setCollapsed(c => { const n=new Set(c); n.has(proj.id)?n.delete(proj.id):n.add(proj.id); return n })}
                        style={{ height:ROW_H+4, display:"flex", alignItems:"center", gap:8, padding:"0 12px", background:proj.color+"18", borderBottom:"1px solid var(--border)", cursor:"pointer" }}>
                        {isCollapsed ? <ChevronRight size={12} style={{ color:proj.color, flexShrink:0 }}/> : <ChevronDown size={12} style={{ color:proj.color, flexShrink:0 }}/>}
                        <span style={{ fontSize:14 }}>{proj.icon}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:proj.color, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{proj.name}</span>
                        <span style={{ fontSize:10, color:proj.color, flexShrink:0 }}>{proj.completion}%</span>
                      </div>
                      {/* Lignes tâches */}
                      {!isCollapsed && tasks.map(task => (
                        <div key={task.id} style={{ height:ROW_H, display:"flex", alignItems:"center", gap:6, padding:"0 12px 0 28px", borderBottom:"1px solid var(--border)", background:"var(--bg-card)" }}>
                          {task.critical && <span style={{ fontSize:8, color:"#ef4444", flexShrink:0 }}>●</span>}
                          <span style={{ fontSize:11, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }} title={task.name}>{task.name}</span>
                          <span style={{ fontSize:9, color:"var(--text-3)", flexShrink:0 }}>{task.progress}%</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>

              {/* Zone Gantt scrollable */}
              <div ref={scrollRef} style={{ flex:1, overflowX:"auto", overflowY:"hidden" }}>
                <div style={{ width:totalWidth, minWidth:"100%", position:"relative" }}>

                  {/* Header mois */}
                  <div style={{ height:HEADER_H, position:"relative", background:"var(--bg)", borderBottom:"2px solid var(--border)" }}>
                    {monthCols.map((m,i) => (
                      <div key={i} style={{ position:"absolute", left:m.left, width:m.width, height:"100%", borderRight:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:10, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase" }}>{m.label}</span>
                      </div>
                    ))}
                    {/* Ligne aujourd'hui */}
                    {todayLeft >= 0 && todayLeft <= totalWidth && (
                      <div style={{ position:"absolute", left:todayLeft, top:0, width:2, height:"100%", background:"#ef4444", opacity:0.8 }}/>
                    )}
                  </div>

                  {/* Lignes grille + barres */}
                  {filtered.map(proj => {
                    const isCollapsed = collapsed.has(proj.id)
                    const tasks = showCritical ? proj.tasks.filter(t=>t.critical) : proj.tasks
                    return (
                      <div key={proj.id}>
                        {/* Ligne projet */}
                        <div style={{ height:ROW_H+4, position:"relative", background:proj.color+"08", borderBottom:"1px solid var(--border)" }}>
                          {/* Barre projet globale */}
                          {proj.tasks.length > 0 && (() => {
                            const starts = proj.tasks.map(t=>t.start).filter(Boolean).sort()
                            const ends   = proj.tasks.map(t=>t.end).filter(Boolean).sort()
                            if (!starts.length||!starts[0]||!ends[ends.length-1]) return null
                            const left  = daysBetween(viewStart, starts[0]) * zoom
                            const width = Math.max(4, daysBetween(starts[0], ends[ends.length-1]) * zoom)
                            return (
                              <div style={{ position:"absolute", left, top:8, width, height:14, borderRadius:4, background:proj.color+"44", border:"2px solid "+proj.color }}>
                                <div style={{ width:proj.completion+"%", height:"100%", background:proj.color, borderRadius:2 }}/>
                              </div>
                            )
                          })()}
                          {/* Ligne aujourd'hui */}
                          {todayLeft >= 0 && <div style={{ position:"absolute", left:todayLeft, top:0, width:1, height:"100%", background:"#ef4444", opacity:0.5 }}/>}
                          {/* Grille mois */}
                          {monthCols.map((m,i) => <div key={i} style={{ position:"absolute", left:m.left, top:0, width:1, height:"100%", background:"var(--border)" }}/>)}
                        </div>

                        {/* Lignes tâches */}
                        {!isCollapsed && tasks.map(task => (
                          <div key={task.id} style={{ height:ROW_H, position:"relative", background:"var(--bg-card)", borderBottom:"1px solid var(--border)" }}>
                            {taskBar(task, proj.color)}
                            {/* Ligne aujourd'hui */}
                            {todayLeft >= 0 && <div style={{ position:"absolute", left:todayLeft, top:0, width:1, height:"100%", background:"#ef4444", opacity:0.4 }}/>}
                            {/* Grille mois */}
                            {monthCols.map((m,i) => <div key={i} style={{ position:"absolute", left:m.left, top:0, width:1, height:"100%", background:"var(--border)", opacity:0.4 }}/>)}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Légende */}
            <div style={{ padding:"8px 16px", borderTop:"1px solid var(--border)", background:"var(--bg)", display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:10, fontWeight:600, color:"var(--text-3)" }}>Légende :</span>
              {[
                { color:"#ef4444", label:"Chemin critique" },
                { color:"#22c55e", label:"Tâche normale" },
                { color:"#f59e0b", label:"En retard" },
              ].map(l => (
                <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"var(--text-2)" }}>
                  <div style={{ width:20, height:8, borderRadius:2, background:l.color+"44", border:"1px solid "+l.color }}/>
                  {l.label}
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"var(--text-2)" }}>
                <div style={{ width:2, height:14, background:"#ef4444" }}/>
                Aujourd'hui
              </div>
              <span style={{ fontSize:10, color:"var(--text-3)", marginLeft:"auto" }}>Survol = détail · Scroll horizontal = navigation · Zoom +/-</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
