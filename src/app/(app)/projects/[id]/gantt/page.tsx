'use client'
import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Pencil, Check, X } from "lucide-react"

interface GanttTask {
  id: string; wbs: string; name: string; phase: string
  start: string; end: string; duration: number
  responsible: string; progress: number; dependencies: string; critical: boolean
}

const PHASE_COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626","#0891b2"]

export default function GanttPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "gantt")
  const [tasks, setTasks] = useState<GanttTask[]>([])
  const [activeTab, setActiveTab] = useState<"visual"|"table">("visual")
  const [editId, setEditId] = useState<string|null>(null)
  const [editRow, setEditRow] = useState<GanttTask|null>(null)

  useEffect(() => { if (data?.tasks) setTasks(data.tasks) }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Gantt...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"gantt", projectName: project.name, projectDescription: project.description, startDate: project.start_date, endDate: project.end_date })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newTasks = json.data?.tasks ?? []
      setTasks(newTasks); await save({ tasks: newTasks })
      toast.success(`Gantt généré — ${newTasks.length} tâches`)
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const phases = useMemo(() => Array.from(new Set(tasks.map(t => t.phase))), [tasks])

  const { minDate, totalDays } = useMemo(() => {
    if (!tasks.length) return { minDate: new Date(), totalDays: 1 }
    const dates = tasks.flatMap(t => [new Date(t.start).getTime(), new Date(t.end).getTime()])
    const min = new Date(Math.min(...dates))
    const max = new Date(Math.max(...dates))
    return { minDate: min, totalDays: Math.ceil((max.getTime() - min.getTime()) / 86400000) + 1 }
  }, [tasks])

  const barLeft = (t: GanttTask) => ((new Date(t.start).getTime() - minDate.getTime()) / 86400000 / totalDays * 100)
  const barWidth = (t: GanttTask) => Math.max(0.5, (new Date(t.end).getTime() - new Date(t.start).getTime()) / 86400000 / totalDays * 100)
  const phaseColor = (phase: string) => PHASE_COLORS[phases.indexOf(phase) % PHASE_COLORS.length]

  const toRows = () => tasks.map(t => ({ WBS:t.wbs, Tâche:t.name, Phase:t.phase, Début:t.start, Fin:t.end, Durée:`${t.duration}j`, Resp:t.responsible, Avancement:`${t.progress}%`, Critique:t.critical?"Oui":"Non" }))

  const startEdit = (t: GanttTask) => { setEditId(t.id); setEditRow({...t}) }
  const cancelEdit = () => { setEditId(null); setEditRow(null) }
  const confirmEdit = async () => {
    if (!editRow) return
    const updated = tasks.map(t => t.id === editRow.id ? editRow : t)
    setTasks(updated); setEditId(null); setEditRow(null)
    await save({ tasks: updated })
  }

  return (
    <AppLayout>
      <ToolLayout title="Planning Gantt" icon="📅" subtitle="// PLANNING"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if(e.data?.tasks) setTasks(e.data.tasks) }}
        onGenerate={generate} generateLabel="Générer Planning Gantt" generating={loading}
        exportRows={toRows()} exportFilename={`Gantt_${project?.name??""}`}
        projectName={project?.name}>

        {tasks.length === 0 && !loading && (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">📅</div>
            <p className="font-semibold text-foreground mb-1">Aucun planning Gantt</p>
            <p className="text-sm text-muted-foreground">Cliquez sur "Générer Planning Gantt"</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Tâches</p>
                <p className="text-xl font-bold text-foreground">{tasks.length}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Critiques</p>
                <p className="text-xl font-bold text-red-400">{tasks.filter(t=>t.critical).length}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">En cours</p>
                <p className="text-xl font-bold text-amber-400">{tasks.filter(t=>t.progress>0&&t.progress<100).length}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Terminées</p>
                <p className="text-xl font-bold text-green-400">{tasks.filter(t=>t.progress===100).length}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
              {(["visual","table"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab===tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab==="visual" ? "📊 Gantt visuel" : "📋 Tableau"}
                </button>
              ))}
            </div>

            {/* Gantt visuel */}
            {activeTab === "visual" && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Legend phases */}
                <div className="flex gap-3 px-4 py-3 border-b border-border flex-wrap">
                  {phases.map((p,i) => (
                    <div key={p} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: PHASE_COLORS[i%PHASE_COLORS.length] }}/>
                      <span className="text-xs text-muted-foreground">{p}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-3 h-3 rounded-sm bg-red-500 opacity-70"/>
                    <span className="text-xs text-muted-foreground">Chemin critique</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div style={{ minWidth: 900 }}>
                    {phases.map(phase => (
                      <div key={phase}>
                        {/* Phase header */}
                        <div className="px-4 py-2 border-b border-border" style={{ background: phaseColor(phase) + "18" }}>
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: phaseColor(phase) }}>{phase}</span>
                        </div>
                        {/* Tasks */}
                        {tasks.filter(t => t.phase === phase).map(task => (
                          <div key={task.id} className="flex items-center border-b border-border hover:bg-accent/10 transition-colors group" style={{ height: 36 }}>
                            {/* Task name */}
                            <div className="w-64 flex-shrink-0 px-4 flex items-center gap-2">
                              <span className="text-[10px] font-mono text-muted-foreground w-8 flex-shrink-0">{task.wbs}</span>
                              <span className="text-xs text-foreground truncate">{task.name}</span>
                              {task.critical && <span className="text-[10px] text-red-400 flex-shrink-0">●</span>}
                            </div>
                            {/* Bar area */}
                            <div className="flex-1 relative" style={{ height: 36 }}>
                              <div
                                className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center overflow-hidden"
                                style={{
                                  left: `${barLeft(task)}%`,
                                  width: `${barWidth(task)}%`,
                                  height: 20,
                                  background: task.critical
                                    ? "linear-gradient(90deg, #dc2626, #ef4444)"
                                    : `linear-gradient(90deg, ${phaseColor(phase)}, ${phaseColor(phase)}cc)`,
                                  minWidth: 4,
                                  boxShadow: task.critical ? "0 0 8px rgba(239,68,68,0.4)" : "none"
                                }}>
                                {/* Progress */}
                                {task.progress > 0 && (
                                  <div style={{ width:`${task.progress}%`, height:"100%", background:"rgba(0,0,0,0.25)" }}/>
                                )}
                                {barWidth(task) > 8 && (
                                  <span className="absolute left-1.5 text-[9px] text-white font-medium whitespace-nowrap">{task.progress}%</span>
                                )}
                              </div>
                            </div>
                            {/* Resp */}
                            <div className="w-28 flex-shrink-0 px-3 text-[10px] text-muted-foreground text-right">{task.responsible}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tableau éditable */}
            {activeTab === "table" && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary/20 border-b border-border">
                      {["WBS","Tâche","Phase","Début","Fin","Durée","Responsable","Avancement","Critique",""].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id} className="border-b border-border hover:bg-accent/20 group" style={{ borderLeft: `3px solid ${task.critical ? "#ef4444" : phaseColor(task.phase)}` }}>
                        {editId === task.id && editRow ? (
                          <>
                            <td className="px-2 py-1"><input value={editRow.wbs} onChange={e=>setEditRow({...editRow,wbs:e.target.value})} className="w-14 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                            <td className="px-2 py-1"><input value={editRow.name} onChange={e=>setEditRow({...editRow,name:e.target.value})} className="w-full bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                            <td className="px-2 py-1"><input value={editRow.phase} onChange={e=>setEditRow({...editRow,phase:e.target.value})} className="w-28 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                            <td className="px-2 py-1"><input type="date" value={editRow.start} onChange={e=>setEditRow({...editRow,start:e.target.value})} className="bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                            <td className="px-2 py-1"><input type="date" value={editRow.end} onChange={e=>setEditRow({...editRow,end:e.target.value})} className="bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                            <td className="px-2 py-1"><input type="number" value={editRow.duration} onChange={e=>setEditRow({...editRow,duration:+e.target.value})} className="w-14 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                            <td className="px-2 py-1"><input value={editRow.responsible} onChange={e=>setEditRow({...editRow,responsible:e.target.value})} className="w-24 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                            <td className="px-2 py-1"><input type="number" min="0" max="100" value={editRow.progress} onChange={e=>setEditRow({...editRow,progress:+e.target.value})} className="w-14 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                            <td className="px-2 py-1">
                              <select value={editRow.critical?"true":"false"} onChange={e=>setEditRow({...editRow,critical:e.target.value==="true"})} className="bg-background border border-primary/40 rounded px-1 py-0.5 text-xs">
                                <option value="true">Oui</option><option value="false">Non</option>
                              </select>
                            </td>
                            <td className="px-2 py-1">
                              <div className="flex gap-1">
                                <button onClick={confirmEdit} className="p-1 text-green-400 hover:bg-green-500/10 rounded"><Check size={12}/></button>
                                <button onClick={cancelEdit} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><X size={12}/></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{task.wbs}</td>
                            <td className="px-3 py-2 text-xs text-foreground font-medium">{task.name}</td>
                            <td className="px-3 py-2 text-xs" style={{ color: phaseColor(task.phase) }}>{task.phase}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{task.start}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{task.end}</td>
                            <td className="px-3 py-2 text-xs text-foreground">{task.duration}j</td>
                            <td className="px-3 py-2 text-xs text-blue-400">{task.responsible}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden w-16">
                                  <div className="h-full rounded-full" style={{ width:`${task.progress}%`, background: task.progress===100?"#22c55e":"#3b82f6" }}/>
                                </div>
                                <span className="text-[10px] text-muted-foreground">{task.progress}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              {task.critical && <span className="text-[10px] bg-red-500/20 text-red-400 rounded px-1.5 py-0.5 font-medium">Critique</span>}
                            </td>
                            <td className="px-3 py-2">
                              <button onClick={() => startEdit(task)} className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={11}/></button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
