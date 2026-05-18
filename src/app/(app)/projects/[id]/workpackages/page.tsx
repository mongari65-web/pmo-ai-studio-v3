"use client"
import { NavButtons } from "@/components/ui/BackButton"
'use client'
import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Pencil, Check, X } from "lucide-react"

interface WP {
  id: string; code: string; name: string; phase: string
  description: string; deliverables: string; responsible: string
  start: string; end: string; duration: number; budget: number
  status: string; completion: number; dependencies: string; acceptance: string
}

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  "Terminé":  { color:"#22c55e", bg:"rgba(34,197,94,0.12)" },
  "En cours": { color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
  "Planifié": { color:"#3b82f6", bg:"rgba(59,130,246,0.12)" },
  "En retard":{ color:"#ef4444", bg:"rgba(239,68,68,0.12)" },
}
const PHASE_COLORS = ["var(--primary)","#7c3aed","#059669","#d97706","#dc2626"]

export default function WorkPackagesPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "workpackages")
  const [wps, setWps] = useState<WP[]>([])
  const [activeTab, setActiveTab] = useState<"cards"|"table">("cards")
  const [editId, setEditId] = useState<string|null>(null)
  const [editRow, setEditRow] = useState<WP|null>(null)
  const [filterPhase, setFilterPhase] = useState("Tous")

  useEffect(() => { if (data?.workpackages) setWps(data.workpackages) }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Work Packages...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"workpackages", projectName: project.name, projectDescription: project.description, startDate: project.start_date, endDate: project.end_date })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newWps = json.data?.workpackages ?? []
      setWps(newWps); await save({ workpackages: newWps })
      toast.success(`${newWps.length} Work Packages générés`)
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const phases = useMemo(() => ["Tous", ...Array.from(new Set(wps.map(w => w.phase)))], [wps])
  const filtered = filterPhase === "Tous" ? wps : wps.filter(w => w.phase === filterPhase)
  const phaseColor = (p: string) => PHASE_COLORS[Math.max(0, phases.indexOf(p)-1)] ?? "var(--primary)"

  const totalBudget = wps.reduce((s,w) => s+w.budget, 0)
  const avgCompletion = wps.length > 0 ? Math.round(wps.reduce((s,w)=>s+w.completion,0)/wps.length) : 0

  const toRows = () => wps.map(w => ({ Code:w.code, Nom:w.name, Phase:w.phase, Resp:w.responsible, Début:w.start, Fin:w.end, Budget:w.budget, Statut:w.status, Avancement:`${w.completion}%` }))

  const startEdit = (w:WP) => { setEditId(w.id); setEditRow({...w}) }
  const cancelEdit = () => { setEditId(null); setEditRow(null) }
  const confirmEdit = async () => {
    if (!editRow) return
    const updated = wps.map(w => w.id===editRow.id ? editRow : w)
    setWps(updated); setEditId(null); setEditRow(null)
    await save({ workpackages: updated })
  }

  return (
    <AppLayout>
      <ToolLayout title="Work Packages" icon="📦" subtitle="// WORK PACKAGES"
        history={history}
        onLoadHistory={(e)=>{ loadHistory(e); if(e.data?.workpackages) setWps(e.data.workpackages) }}
        onGenerate={generate} generateLabel="Générer Work Packages" generating={loading}
        exportRows={toRows()} exportFilename={`WP_${project?.name??""}`}
        projectName={project?.name}>

        {wps.length === 0 && !loading && (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-semibold text-foreground mb-1">Aucun Work Package</p>
            <p className="text-sm text-muted-foreground">Cliquez sur "Générer Work Packages"</p>
          </div>
        )}

        {wps.length > 0 && (
          <div className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Work Packages</p>
                <p className="text-xl font-bold text-foreground">{wps.length}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Budget total</p>
                <p className="text-xl font-bold text-blue-400">{(totalBudget/1000).toFixed(0)}k€</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Avancement moy.</p>
                <p className="text-xl font-bold text-purple-400">{avgCompletion}%</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Terminés</p>
                <p className="text-xl font-bold text-green-400">{wps.filter(w=>w.status==="Terminé").length}</p>
              </div>
            </div>

            {/* Tabs + filtre phase */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
                {(["cards","table"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab===tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {tab==="cards" ? "🃏 Cards" : "📋 Tableau"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {phases.map(p => (
                  <button key={p} onClick={() => setFilterPhase(p)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${filterPhase===p ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {p} {p!=="Tous" && `(${wps.filter(w=>w.phase===p).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards view */}
            {activeTab === "cards" && (
              <div className="grid grid-cols-2 gap-4">
                {filtered.map(wp => {
                  const cfg = STATUS_CFG[wp.status] ?? { color:"var(--text-3)", bg:"transparent" }
                  const pc = phaseColor(wp.phase)
                  return (
                    <div key={wp.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all group" style={{ borderLeft: `3px solid ${pc}` }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold text-muted-foreground">{wp.code}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: pc+"22", color: pc }}>{wp.phase}</span>
                          </div>
                          <h3 className="font-semibold text-sm text-foreground">{wp.name}</h3>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>{wp.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{wp.description}</p>
                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{color:"var(--text-2)"}}>Avancement</span>
                          <span className="font-medium text-foreground">{wp.completion}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width:`${wp.completion}%`, background: wp.completion===100?"#22c55e":pc }}/>
                        </div>
                      </div>
                      {/* Meta */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground"><span>👤</span>{wp.responsible}</div>
                        <div className="flex items-center gap-1.5 text-amber-400"><span>💰</span>{wp.budget.toLocaleString()} €</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><span>📅</span>{wp.start} → {wp.end}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><span>⏱️</span>{wp.duration} jours</div>
                      </div>
                      {wp.deliverables && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-[10px] text-muted-foreground"><span style={{fontWeight:500}}>Livrable :</span> {wp.deliverables}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Table view */}
            {activeTab === "table" && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary/20 border-b border-border">
                      {["Code","Nom","Phase","Responsable","Début","Fin","Budget","Statut","Avancement",""].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(wp => {
                      const cfg = STATUS_CFG[wp.status] ?? { color:"var(--text-3)", bg:"transparent" }
                      const pc = phaseColor(wp.phase)
                      return (
                        <tr key={wp.id} className="border-b border-border hover:bg-accent/20 group" style={{ borderLeft: `3px solid ${pc}` }}>
                          {editId===wp.id && editRow ? (
                            <>
                              <td className="px-2 py-1"><input value={editRow.code} onChange={e=>setEditRow({...editRow,code:e.target.value})} className="w-20 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                              <td className="px-2 py-1"><input value={editRow.name} onChange={e=>setEditRow({...editRow,name:e.target.value})} className="w-full bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                              <td className="px-2 py-1"><input value={editRow.phase} onChange={e=>setEditRow({...editRow,phase:e.target.value})} className="w-24 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                              <td className="px-2 py-1"><input value={editRow.responsible} onChange={e=>setEditRow({...editRow,responsible:e.target.value})} className="w-24 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                              <td className="px-2 py-1"><input type="date" value={editRow.start} onChange={e=>setEditRow({...editRow,start:e.target.value})} className="bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                              <td className="px-2 py-1"><input type="date" value={editRow.end} onChange={e=>setEditRow({...editRow,end:e.target.value})} className="bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                              <td className="px-2 py-1"><input type="number" value={editRow.budget} onChange={e=>setEditRow({...editRow,budget:+e.target.value})} className="w-20 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                              <td className="px-2 py-1">
                                <select value={editRow.status} onChange={e=>setEditRow({...editRow,status:e.target.value})} className="bg-background border border-primary/40 rounded px-1 py-0.5 text-xs">
                                  {["Planifié","En cours","Terminé","En retard"].map(s=><option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="px-2 py-1"><input type="number" min="0" max="100" value={editRow.completion} onChange={e=>setEditRow({...editRow,completion:+e.target.value})} className="w-14 bg-background border border-primary/40 rounded px-1 py-0.5 text-xs"/></td>
                              <td className="px-2 py-1">
                                <div className="flex gap-1">
                                  <button onClick={confirmEdit} className="p-1 text-green-400 hover:bg-green-500/10 rounded"><Check size={12}/></button>
                                  <button onClick={cancelEdit} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><X size={12}/></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{wp.code}</td>
                              <td className="px-3 py-2 text-xs font-medium text-foreground">{wp.name}</td>
                              <td className="px-3 py-2 text-xs" style={{color:pc}}>{wp.phase}</td>
                              <td className="px-3 py-2 text-xs text-blue-400">{wp.responsible}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{wp.start}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{wp.end}</td>
                              <td className="px-3 py-2 text-xs text-amber-400">{wp.budget.toLocaleString()} €</td>
                              <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background:cfg.bg,color:cfg.color}}>{wp.status}</span></td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{width:`${wp.completion}%`,background:wp.completion===100?"#22c55e":pc}}/>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">{wp.completion}%</span>
                                </div>
                              </td>
                              <td className="px-3 py-2"><button onClick={()=>startEdit(wp)} className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100"><Pencil size={11}/></button></td>
                            </>
                          )}
                        </tr>
                      )
                    })}
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
