'use client'
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Check, X, Diamond } from "lucide-react"

interface GanttTask {
  id: string; wbs: string; name: string; phase: string
  start: string; end: string; duration: number
  responsible: string; progress: number
  dependencies: string; critical: boolean; type?: "task"|"milestone"
}

const PHASE_COLORS = ["var(--primary)","#7c3aed","#059669","#d97706","#dc2626","#0891b2"]
const TODAY = new Date().toISOString().split("T")[0]

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}
function addDays(date: string, days: number) {
  const d = new Date(date); d.setDate(d.getDate() + days); return d.toISOString().split("T")[0]
}

export default function GanttPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "gantt")
  const [tasks, setTasks] = useState<GanttTask[]>([])
  const [viewMode, setViewMode] = useState<"visual"|"table">("visual")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [editRow, setEditRow] = useState<GanttTask|null>(null)
  const [selectedId, setSelectedId] = useState<string|null>(null)
  const [dragging, setDragging] = useState<{ id:string; startX:number; startDate:string; endDate:string }|null>(null)
  const [resizing, setResizing] = useState<{ id:string; startX:number; endDate:string }|null>(null)
  const barAreaRef = useRef<HTMLDivElement>(null)

  const [newTask, setNewTask] = useState<Partial<GanttTask>>({
    wbs:"", name:"", phase:"", start: TODAY, end: addDays(TODAY,10),
    duration:10, responsible:"", progress:0, dependencies:"", critical:false, type:"task"
  })

  useEffect(() => { if (data?.tasks) setTasks(data.tasks) }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Gantt...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"gantt", projectName:project.name, projectDescription:project.description, startDate:project.start_date, endDate:project.end_date })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newTasks = json.data?.tasks ?? []
      setTasks(newTasks); await save({ tasks: newTasks })
      toast.success(`Gantt généré — ${newTasks.length} tâches`)
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const saveTasks = useCallback(async (updated: GanttTask[]) => {
    setTasks(updated); await save({ tasks: updated })
  }, [save])

  const addTask = async () => {
    if (!newTask.name) { toast.error("Nom requis"); return }
    const t: GanttTask = {
      id: `T${Date.now()}`, wbs: newTask.wbs||"", name: newTask.name||"",
      phase: newTask.phase||tasks[0]?.phase||"Phase 1",
      start: newTask.start||TODAY, end: newTask.end||addDays(TODAY,10),
      duration: daysBetween(newTask.start||TODAY, newTask.end||addDays(TODAY,10)),
      responsible: newTask.responsible||"", progress: 0,
      dependencies: newTask.dependencies||"", critical: false, type: newTask.type||"task"
    }
    await saveTasks([...tasks, t])
    setShowAddForm(false)
    setNewTask({ wbs:"", name:"", phase:"", start:TODAY, end:addDays(TODAY,10), duration:10, responsible:"", progress:0, dependencies:"", critical:false, type:"task" })
    toast.success("Tâche ajoutée")
  }

  const deleteTask = async (tid: string) => {
    await saveTasks(tasks.filter(t => t.id !== tid))
  }

  const updateProgress = async (tid: string, progress: number) => {
    await saveTasks(tasks.map(t => t.id===tid ? {...t, progress} : t))
  }

  // ── Calcul timeline ──────────────────────────────────────────
  const { minDate, totalDays, phases } = useMemo(() => {
    if (!tasks.length) return { minDate: TODAY, totalDays: 30, phases: [] }
    const dates = tasks.flatMap(t => [t.start, t.end]).filter(Boolean)
    const min = dates.reduce((a,b) => a<b?a:b, dates[0])
    const max = dates.reduce((a,b) => a>b?a:b, dates[0])
    const total = Math.max(30, daysBetween(min, max) + 14)
    const ph = Array.from(new Set(tasks.map(t => t.phase)))
    return { minDate: min, totalDays: total, phases: ph }
  }, [tasks])

  const pct = (date: string) => Math.max(0, Math.min(100, daysBetween(minDate, date) / totalDays * 100))
  const widthPct = (start: string, end: string) => Math.max(0.5, daysBetween(start, end) / totalDays * 100)
  const phaseColor = (phase: string) => PHASE_COLORS[phases.indexOf(phase) % PHASE_COLORS.length] ?? "var(--primary)"

  // Timeline header — mois
  const monthHeaders = useMemo(() => {
    const headers: { label: string; left: number; width: number }[] = []
    const start = new Date(minDate)
    const end = new Date(addDays(minDate, totalDays))
    let cur = new Date(start.getFullYear(), start.getMonth(), 1)
    while (cur <= end) {
      const next = new Date(cur.getFullYear(), cur.getMonth()+1, 1)
      const l = Math.max(0, daysBetween(minDate, cur.toISOString().split("T")[0]) / totalDays * 100)
      const w = Math.min(100-l, daysBetween(cur.toISOString().split("T")[0], next.toISOString().split("T")[0]) / totalDays * 100)
      headers.push({ label: cur.toLocaleDateString("fr-FR",{month:"short",year:"2-digit"}), left: l, width: w })
      cur = next
    }
    return headers
  }, [minDate, totalDays])

  // Drag handlers
  const onBarMouseDown = (e: React.MouseEvent, task: GanttTask) => {
    if (e.button !== 0) return
    e.preventDefault()
    setDragging({ id:task.id, startX:e.clientX, startDate:task.start, endDate:task.end })
    setSelectedId(task.id)
  }

  const onResizeMouseDown = (e: React.MouseEvent, task: GanttTask) => {
    e.preventDefault(); e.stopPropagation()
    setResizing({ id:task.id, startX:e.clientX, endDate:task.end })
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    const barArea = barAreaRef.current
    if (!barArea) return
    const areaWidth = barArea.clientWidth
    const dayPx = areaWidth / totalDays

    if (dragging) {
      const dx = e.clientX - dragging.startX
      const daysDelta = Math.round(dx / dayPx)
      setTasks(prev => prev.map(t => {
        if (t.id !== dragging.id) return t
        return { ...t, start: addDays(dragging.startDate, daysDelta), end: addDays(dragging.endDate, daysDelta) }
      }))
    }
    if (resizing) {
      const dx = e.clientX - resizing.startX
      const daysDelta = Math.round(dx / dayPx)
      setTasks(prev => prev.map(t => {
        if (t.id !== resizing.id) return t
        const newEnd = addDays(resizing.endDate, daysDelta)
        if (newEnd <= t.start) return t
        return { ...t, end: newEnd, duration: daysBetween(t.start, newEnd) }
      }))
    }
  }, [dragging, resizing, totalDays])

  const onMouseUp = useCallback(async () => {
    if (dragging || resizing) {
      await save({ tasks })
      toast.success("Planning mis à jour")
    }
    setDragging(null); setResizing(null)
  }, [dragging, resizing, tasks, save])

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp) }
  }, [onMouseMove, onMouseUp])

  // Stats
  const criticalCount = tasks.filter(t=>t.critical).length
  const inProgressCount = tasks.filter(t=>t.progress>0&&t.progress<100).length
  const doneCount = tasks.filter(t=>t.progress===100).length

  const toRows = () => tasks.map(t => ({ WBS:t.wbs, Tâche:t.name, Phase:t.phase, Début:t.start, Fin:t.end, Durée:`${t.duration}j`, Resp:t.responsible, Avancement:`${t.progress}%`, Critique:t.critical?"Oui":"Non" }))

  return (
    <AppLayout>
      <ToolLayout title="Planning Gantt" icon="📅" subtitle="// PLANNING"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if(e.data?.tasks) setTasks(e.data.tasks) }}
        onGenerate={generate} generateLabel="Générer Planning Gantt" generating={loading}
        onAdd={() => setShowAddForm(true)} addLabel="+ Tâche"
        exportRows={toRows()} exportFilename={`Gantt_${project?.name??""}`}
        projectName={project?.name}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
          {[
            { label:"Tâches", value:tasks.length, color:"var(--border)" },
            { label:"Critiques", value:criticalCount, color:"#ef4444" },
            { label:"En cours", value:inProgressCount, color:"#f59e0b" },
            { label:"Terminées", value:doneCount, color:"#22c55e" },
          ].map(s => (
            <div key={s.label} style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, padding:"12px 16px", textAlign:"center" }}>
              <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{s.label}</p>
              <p style={{ fontSize:24, fontWeight:700, color:s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* View tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:16 }}>
          {[["visual","📊 Gantt visuel"],["table","📋 Tableau"]].map(([k,l]) => (
            <button key={k} onClick={() => setViewMode(k as any)}
              style={{ padding:"7px 14px", borderRadius:8, border:"1px solid", fontSize:12, fontWeight:600, cursor:"pointer",
                borderColor:viewMode===k?"var(--primary)":"#1e293b", background:viewMode===k?"#1e3a5f":"#0f172a",
                color:viewMode===k?"#60a5fa":"#64748b" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Add task form */}
        {showAddForm && (
          <div style={{ background:"#0f172a", border:"1px solid #2563eb40", borderRadius:12, padding:16, marginBottom:16 }}>
            <p style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", marginBottom:12 }}>Nouvelle tâche</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {[
                { label:"WBS", key:"wbs", type:"text", ph:"1.1" },
                { label:"Nom *", key:"name", type:"text", ph:"Nom de la tâche" },
                { label:"Phase", key:"phase", type:"text", ph:"Phase 1" },
                { label:"Responsable", key:"responsible", type:"text", ph:"Chef de Projet" },
                { label:"Début", key:"start", type:"date" },
                { label:"Fin", key:"end", type:"date" },
                { label:"Dépendances", key:"dependencies", type:"text", ph:"T1,T2" },
                { label:"Avancement %", key:"progress", type:"number" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:11, color:"var(--text-3)", display:"block", marginBottom:4 }}>{f.label}</label>
                  <input type={f.type} value={(newTask as any)[f.key]??""} placeholder={f.ph}
                    onChange={e => setNewTask(prev => ({...prev, [f.key]: f.type==="number"?+e.target.value:e.target.value}))}
                    style={{ width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:6, color:"var(--border)", padding:"6px 10px", fontSize:12 }}/>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:10 }}>
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-3)", cursor:"pointer" }}>
                <input type="checkbox" checked={newTask.critical??false} onChange={e => setNewTask(p=>({...p,critical:e.target.checked}))}/>
                Chemin critique
              </label>
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-3)", cursor:"pointer", marginLeft:12 }}>
                <input type="checkbox" checked={newTask.type==="milestone"} onChange={e => setNewTask(p=>({...p,type:e.target.checked?"milestone":"task"}))}/>
                Jalon ◆
              </label>
              <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                <button onClick={addTask} style={{ padding:"6px 16px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  Ajouter
                </button>
                <button onClick={() => setShowAddForm(false)} style={{ padding:"6px 12px", background:"#1e293b", color:"var(--text-3)", border:"none", borderRadius:6, fontSize:12, cursor:"pointer" }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {tasks.length === 0 && !loading && (
          <div style={{ background:"#0f172a", border:"1px dashed #1e293b", borderRadius:12, padding:48, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
            <p style={{ fontSize:16, fontWeight:600, color:"var(--text-3)" }}>Aucun planning Gantt</p>
            <p style={{ fontSize:13, color:"var(--text-2)", marginTop:8 }}>Générez automatiquement ou ajoutez des tâches manuellement</p>
          </div>
        )}

        {/* GANTT VISUEL */}
        {viewMode === "visual" && tasks.length > 0 && (
          <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, overflow:"hidden" }}>
            {/* Phase legend */}
            <div style={{ display:"flex", gap:12, padding:"10px 16px", borderBottom:"1px solid #1e293b", flexWrap:"wrap" }}>
              {phases.map((p,i) => (
                <div key={p} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:PHASE_COLORS[i%PHASE_COLORS.length] }}/>
                  <span style={{ fontSize:11, color:"var(--text-3)" }}>{p}</span>
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto" }}>
                <div style={{ width:10, height:10, borderRadius:2, background:"#ef4444" }}/>
                <span style={{ fontSize:11, color:"var(--text-3)" }}>Chemin critique</span>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"280px 1fr" }}>
              {/* Left — task names */}
              <div style={{ borderRight:"1px solid #1e293b" }}>
                {/* Header */}
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", padding:"8px 12px", background:"linear-gradient(135deg,#1d4ed8,#2563eb)", gap:8 }}>
                  <span style={{ fontSize:10, color:"#fff", fontWeight:700 }}>TÂCHE</span>
                  <span style={{ fontSize:10, color:"#fff", fontWeight:700 }}>AVANC.</span>
                </div>

                {phases.map(phase => (
                  <div key={phase}>
                    <div style={{ padding:"6px 12px", background:"#1e293b", fontSize:10, fontWeight:700, color:phaseColor(phase), letterSpacing:1, textTransform:"uppercase" }}>
                      ▸ {phase}
                    </div>
                    {tasks.filter(t=>t.phase===phase).map(task => (
                      <div key={task.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr", padding:"5px 12px", gap:8, alignItems:"center", borderBottom:"1px solid #0f172a", height:36,
                        background: selectedId===task.id ? "rgba(37,99,235,0.1)" : "transparent", cursor:"pointer" }}
                        onClick={() => setSelectedId(selectedId===task.id?null:task.id)}>
                        <div style={{ display:"flex", alignItems:"center", gap:4, overflow:"hidden" }}>
                          <span style={{ fontSize:9, color:"var(--text-2)", fontFamily:"monospace", flexShrink:0 }}>{task.wbs}</span>
                          {task.type==="milestone" && <span style={{ color:"#f59e0b", fontSize:10 }}>◆</span>}
                          {task.critical && <span style={{ color:"#ef4444", fontSize:9 }}>●</span>}
                          <span style={{ fontSize:11, color: task.critical?"#fca5a5":"var(--border)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {task.name}
                          </span>
                        </div>
                        <div>
                          <input type="range" min="0" max="100" value={task.progress}
                            onChange={e => updateProgress(task.id, +e.target.value)}
                            style={{ width:"100%", accentColor: task.progress===100?"#22c55e":"#3b82f6", cursor:"pointer" }}
                            title={`${task.progress}%`}/>
                          <span style={{ fontSize:9, color:"var(--text-2)" }}>{task.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Right — bars */}
              <div ref={barAreaRef} style={{ overflowX:"auto", position:"relative", userSelect:"none" }}>
                {/* Month headers */}
                <div style={{ position:"relative", height:32, background:"linear-gradient(135deg,#1d4ed8,#2563eb)", borderBottom:"1px solid #1e293b" }}>
                  {monthHeaders.map((mh,i) => (
                    <div key={i} style={{ position:"absolute", left:`${mh.left}%`, width:`${mh.width}%`, height:"100%",
                      borderRight:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:10, color:"var(--text-3)", fontWeight:600 }}>{mh.label}</span>
                    </div>
                  ))}
                  {/* Today line header */}
                  <div style={{ position:"absolute", left:`${pct(TODAY)}%`, top:0, width:2, height:"100%", background:"#ef4444", zIndex:10 }}/>
                </div>

                {/* Task rows */}
                {phases.map(phase => (
                  <div key={phase}>
                    <div style={{ height:28, background:"#1e293b", position:"relative" }}>
                      {/* Today line */}
                      <div style={{ position:"absolute", left:`${pct(TODAY)}%`, top:0, width:1, height:"100%", background:"#ef444440" }}/>
                    </div>
                    {tasks.filter(t=>t.phase===phase).map(task => {
                      const left = pct(task.start)
                      const width = widthPct(task.start, task.end)
                      const isSelected = selectedId === task.id
                      const isDraggingThis = dragging?.id === task.id
                      const color = task.critical ? "#ef4444" : phaseColor(phase)
                      const isMilestone = task.type === "milestone"

                      // Dépendances
                      const deps = task.dependencies?.split(",").map(d=>d.trim()).filter(Boolean) ?? []
                      const depTasks = deps.map(d => tasks.find(t=>t.id===d||t.wbs===d)).filter(Boolean) as GanttTask[]

                      return (
                        <div key={task.id} style={{ position:"relative", height:36, borderBottom:"1px solid #0f172a",
                          background: isSelected ? "rgba(37,99,235,0.05)" : "transparent" }}>

                          {/* Dependency arrows */}
                          {isSelected && depTasks.map(dep => {
                            const depRight = pct(dep.end)
                            const taskLeft = pct(task.start)
                            if (depRight > taskLeft) return null
                            return (
                              <svg key={dep.id} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none", overflow:"visible" }}>
                                <line x1={`${depRight}%`} y1="50%" x2={`${taskLeft}%`} y2="50%"
                                  stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" markerEnd="url(#arrow)"/>
                                <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                                  <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b"/>
                                </marker></defs>
                              </svg>
                            )
                          })}

                          {/* Today line */}
                          <div style={{ position:"absolute", left:`${pct(TODAY)}%`, top:0, width:1, height:"100%", background:"#ef444440" }}/>

                          {isMilestone ? (
                            /* Milestone diamond */
                            <div style={{ position:"absolute", left:`${left}%`, top:"50%", transform:"translate(-50%,-50%)",
                              width:14, height:14, background:color, clipPath:"polygon(50% 0,100% 50%,50% 100%,0 50%)",
                              cursor:"pointer", zIndex:5 }}
                              title={task.name}/>
                          ) : (
                            /* Task bar */
                            <div
                              style={{ position:"absolute", left:`${left}%`, width:`${width}%`, top:"50%", transform:"translateY(-50%)",
                                height:20, borderRadius:4, background: isDraggingThis ? color+"cc" : color,
                                minWidth:6, overflow:"hidden", cursor:dragging?"grabbing":"grab",
                                boxShadow: isSelected ? `0 0 0 2px ${color}` : "none",
                                border: task.critical ? "1px solid #fca5a580" : "none",
                                zIndex:5, display:"flex", alignItems:"center" }}
                              onMouseDown={e => onBarMouseDown(e, task)}>
                              {/* Progress fill */}
                              {task.progress > 0 && (
                                <div style={{ position:"absolute", left:0, top:0, width:`${task.progress}%`, height:"100%", background:"rgba(0,0,0,0.3)", borderRadius:4 }}/>
                              )}
                              {width > 5 && (
                                <span style={{ fontSize:9, color:"rgba(255,255,255,0.9)", paddingLeft:4, whiteSpace:"nowrap", overflow:"hidden", position:"relative", zIndex:1 }}>
                                  {task.progress}%
                                </span>
                              )}
                              {/* Resize handle */}
                              <div style={{ position:"absolute", right:0, top:0, width:6, height:"100%", cursor:"ew-resize", background:"rgba(255,255,255,0.2)" }}
                                onMouseDown={e => onResizeMouseDown(e, task)}/>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected task details */}
            {selectedId && (() => {
              const t = tasks.find(t=>t.id===selectedId)
              if (!t) return null
              return (
                <div style={{ padding:"12px 16px", borderTop:"1px solid #1e293b", background:"#0a0f1a", display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:"#f1f5f9" }}>{t.name}</span>
                  <span style={{ fontSize:11, color:"var(--text-3)" }}>📅 {t.start} → {t.end} ({t.duration}j)</span>
                  <span style={{ fontSize:11, color:"#60a5fa" }}>👤 {t.responsible}</span>
                  <span style={{ fontSize:11, color:t.critical?"#ef4444":"#22c55e" }}>{t.critical?"⚠️ Critique":"✅ Normal"}</span>
                  {t.dependencies && <span style={{ fontSize:11, color:"#f59e0b" }}>→ Dép: {t.dependencies}</span>}
                  <button onClick={() => deleteTask(t.id)}
                    style={{ marginLeft:"auto", padding:"4px 10px", background:"#7f1d1d", color:"#fca5a5", border:"none", borderRadius:6, fontSize:11, cursor:"pointer" }}>
                    Supprimer
                  </button>
                </div>
              )
            })()}
          </div>
        )}

        {/* TABLEAU ÉDITABLE */}
        {viewMode === "table" && tasks.length > 0 && (
          <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"linear-gradient(135deg,#1d4ed8,#2563eb)" }}>
                  {["WBS","Tâche","Phase","Début","Fin","Durée","Responsable","Avanc.","Critique","Dép.",""].map(h => (
                    <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontSize:10, color:"#fff", fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task,i) => (
                  <tr key={task.id} style={{ borderBottom:"1px solid #0f172a", background:i%2===0?"#0f172a":"#0a0f1a",
                    borderLeft:`3px solid ${task.critical?"#ef4444":phaseColor(task.phase)}` }}>
                    {editId===task.id && editRow ? (
                      <>
                        {(["wbs","name","phase"] as const).map(k => (
                          <td key={k} style={{ padding:"4px 6px" }}>
                            <input value={editRow[k]} onChange={e=>setEditRow({...editRow,[k]:e.target.value})}
                              style={{ width:"100%", background:"#1e293b", border:"1px solid #2563eb", borderRadius:4, color:"var(--border)", padding:"3px 6px", fontSize:11 }}/>
                          </td>
                        ))}
                        {(["start","end"] as const).map(k => (
                          <td key={k} style={{ padding:"4px 6px" }}>
                            <input type="date" value={editRow[k]} onChange={e=>setEditRow({...editRow,[k]:e.target.value})}
                              style={{ background:"#1e293b", border:"1px solid #2563eb", borderRadius:4, color:"var(--border)", padding:"3px 6px", fontSize:11 }}/>
                          </td>
                        ))}
                        <td style={{ padding:"4px 6px", color:"var(--text-3)", fontSize:11 }}>{daysBetween(editRow.start,editRow.end)}j</td>
                        <td style={{ padding:"4px 6px" }}>
                          <input value={editRow.responsible} onChange={e=>setEditRow({...editRow,responsible:e.target.value})}
                            style={{ width:"100%", background:"#1e293b", border:"1px solid #2563eb", borderRadius:4, color:"var(--border)", padding:"3px 6px", fontSize:11 }}/>
                        </td>
                        <td style={{ padding:"4px 6px" }}>
                          <input type="number" min="0" max="100" value={editRow.progress} onChange={e=>setEditRow({...editRow,progress:+e.target.value})}
                            style={{ width:50, background:"#1e293b", border:"1px solid #2563eb", borderRadius:4, color:"var(--border)", padding:"3px 6px", fontSize:11 }}/>%
                        </td>
                        <td style={{ padding:"4px 6px" }}>
                          <input type="checkbox" checked={editRow.critical} onChange={e=>setEditRow({...editRow,critical:e.target.checked})}/>
                        </td>
                        <td style={{ padding:"4px 6px" }}>
                          <input value={editRow.dependencies} onChange={e=>setEditRow({...editRow,dependencies:e.target.value})}
                            style={{ width:"100%", background:"#1e293b", border:"1px solid #2563eb", borderRadius:4, color:"var(--border)", padding:"3px 6px", fontSize:11 }}/>
                        </td>
                        <td style={{ padding:"4px 6px" }}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button onClick={async()=>{ const u=tasks.map(t=>t.id===editRow.id?editRow:t); await saveTasks(u); setEditId(null) }}
                              style={{ padding:"3px 6px", background:"#15803d", color:"#fff", border:"none", borderRadius:4, cursor:"pointer", fontSize:10 }}>✓</button>
                            <button onClick={()=>setEditId(null)}
                              style={{ padding:"3px 6px", background:"#7f1d1d", color:"#fff", border:"none", borderRadius:4, cursor:"pointer", fontSize:10 }}>✕</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding:"7px 10px", color:"var(--text-3)", fontFamily:"monospace" }}>{task.wbs}</td>
                        <td style={{ padding:"7px 10px", color:"var(--border)", fontWeight:500 }}>
                          {task.type==="milestone"&&<span style={{ color:"#f59e0b", marginRight:4 }}>◆</span>}{task.name}
                        </td>
                        <td style={{ padding:"7px 10px", color:phaseColor(task.phase) }}>{task.phase}</td>
                        <td style={{ padding:"7px 10px", color:"var(--text-3)" }}>{task.start}</td>
                        <td style={{ padding:"7px 10px", color:"var(--text-3)" }}>{task.end}</td>
                        <td style={{ padding:"7px 10px", color:"var(--border)" }}>{task.duration}j</td>
                        <td style={{ padding:"7px 10px", color:"#60a5fa" }}>{task.responsible}</td>
                        <td style={{ padding:"7px 10px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:50, height:4, background:"#1e293b", borderRadius:2, overflow:"hidden" }}>
                              <div style={{ width:`${task.progress}%`, height:"100%", background:task.progress===100?"#22c55e":"#3b82f6", borderRadius:2 }}/>
                            </div>
                            <span style={{ fontSize:10, color:"var(--text-3)" }}>{task.progress}%</span>
                          </div>
                        </td>
                        <td style={{ padding:"7px 10px" }}>
                          {task.critical && <span style={{ fontSize:10, background:"rgba(239,68,68,0.2)", color:"#ef4444", borderRadius:4, padding:"2px 6px" }}>Critique</span>}
                        </td>
                        <td style={{ padding:"7px 10px", color:"#f59e0b", fontSize:11 }}>{task.dependencies}</td>
                        <td style={{ padding:"7px 10px" }}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button onClick={()=>{setEditId(task.id);setEditRow({...task})}}
                              style={{ padding:"3px 7px", background:"#1e293b", border:"none", borderRadius:4, color:"#60a5fa", cursor:"pointer", fontSize:10 }}>✏️</button>
                            <button onClick={()=>deleteTask(task.id)}
                              style={{ padding:"3px 7px", background:"#1e293b", border:"none", borderRadius:4, color:"#ef4444", cursor:"pointer", fontSize:10 }}>🗑️</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
