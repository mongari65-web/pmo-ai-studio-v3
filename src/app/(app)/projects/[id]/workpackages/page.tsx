"use client"
import { NavButtons } from "@/components/ui/BackButton"
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
          <div>
            <div>📦</div>
            <p>Aucun Work Package</p>
            <p>Cliquez sur "Générer Work Packages"</p>
          </div>
        )}

        {wps.length > 0 && (
          <div>
            {/* KPIs */}
            <div>
              <div>
                <p>Work Packages</p>
                <p>{wps.length}</p>
              </div>
              <div>
                <p>Budget total</p>
                <p>{(totalBudget/1000).toFixed(0)}k€</p>
              </div>
              <div>
                <p>Avancement moy.</p>
                <p>{avgCompletion}%</p>
              </div>
              <div>
                <p>Terminés</p>
                <p>{wps.filter(w=>w.status==="Terminé").length}</p>
              </div>
            </div>

            {/* Tabs + filtre phase */}
            <div>
              <div>
                {(["cards","table"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{padding:"6px 14px",borderRadius:"var(--r8)",fontSize:12,fontWeight:500,cursor:"pointer",border:"none",background:activeTab===tab?"var(--primary-bg)":"transparent",color:activeTab===tab?"var(--primary-light)":"var(--text-2)"}}>
                    {tab==="cards" ? "🃏 Cards" : "📋 Tableau"}
                  </button>
                ))}
              </div>
              <div>
                {phases.map(p => (
                  <button key={p} onClick={() => setFilterPhase(p)}
                    style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,cursor:"pointer",border:`1px solid ${filterPhase===p?"var(--primary)":"var(--border)"}`,background:filterPhase===p?"var(--primary-bg)":"transparent",color:filterPhase===p?"var(--primary-light)":"var(--text-3)"}}>
                    {p} {p!=="Tous" && `(${wps.filter(w=>w.phase===p).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards view */}
            {activeTab === "cards" && (
              <div>
                {filtered.map(wp => {
                  const cfg = STATUS_CFG[wp.status] ?? { color:"var(--text-3)", bg:"transparent" }
                  const pc = phaseColor(wp.phase)
                  return (
                    <div key={wp.id} style={{ borderLeft: `3px solid ${pc}` }}>
                      <div>
                        <div>
                          <div>
                            <span>{wp.code}</span>
                            <span style={{ background: pc+"22", color: pc }}>{wp.phase}</span>
                          </div>
                          <h3>{wp.name}</h3>
                        </div>
                        <span style={{ background: cfg.bg, color: cfg.color }}>{wp.status}</span>
                      </div>
                      <p>{wp.description}</p>
                      {/* Progress */}
                      <div>
                        <div>
                          <span style={{color:"var(--text-2)"}}>Avancement</span>
                          <span>{wp.completion}%</span>
                        </div>
                        <div>
                          <div style={{ width:`${wp.completion}%`, background: wp.completion===100?"#22c55e":pc }}/>
                        </div>
                      </div>
                      {/* Meta */}
                      <div>
                        <div><span>👤</span>{wp.responsible}</div>
                        <div><span>💰</span>{wp.budget.toLocaleString()} €</div>
                        <div><span>📅</span>{wp.start} → {wp.end}</div>
                        <div><span>⏱️</span>{wp.duration} jours</div>
                      </div>
                      {wp.deliverables && (
                        <div>
                          <p><span style={{fontWeight:500}}>Livrable :</span> {wp.deliverables}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Table view */}
            {activeTab === "table" && (
              <div>
                <table>
                  <thead>
                    <tr>
                      {["Code","Nom","Phase","Responsable","Début","Fin","Budget","Statut","Avancement",""].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(wp => {
                      const cfg = STATUS_CFG[wp.status] ?? { color:"var(--text-3)", bg:"transparent" }
                      const pc = phaseColor(wp.phase)
                      return (
                        <tr key={wp.id} style={{ borderLeft: `3px solid ${pc}` }}>
                          {editId===wp.id && editRow ? (
                            <>
                              <td><input value={editRow.code} onChange={e=>setEditRow({...editRow,code:e.target.value})}/></td>
                              <td><input value={editRow.name} onChange={e=>setEditRow({...editRow,name:e.target.value})}/></td>
                              <td><input value={editRow.phase} onChange={e=>setEditRow({...editRow,phase:e.target.value})}/></td>
                              <td><input value={editRow.responsible} onChange={e=>setEditRow({...editRow,responsible:e.target.value})}/></td>
                              <td><input type="date" value={editRow.start} onChange={e=>setEditRow({...editRow,start:e.target.value})}/></td>
                              <td><input type="date" value={editRow.end} onChange={e=>setEditRow({...editRow,end:e.target.value})}/></td>
                              <td><input type="number" value={editRow.budget} onChange={e=>setEditRow({...editRow,budget:+e.target.value})}/></td>
                              <td>
                                <select value={editRow.status} onChange={e=>setEditRow({...editRow,status:e.target.value})}>
                                  {["Planifié","En cours","Terminé","En retard"].map(s=><option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td><input type="number" min="0" max="100" value={editRow.completion} onChange={e=>setEditRow({...editRow,completion:+e.target.value})}/></td>
                              <td>
                                <div>
                                  <button onClick={confirmEdit}><Check size={12}/></button>
                                  <button onClick={cancelEdit}><X size={12}/></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td>{wp.code}</td>
                              <td>{wp.name}</td>
                              <td style={{color:pc}}>{wp.phase}</td>
                              <td>{wp.responsible}</td>
                              <td>{wp.start}</td>
                              <td>{wp.end}</td>
                              <td>{wp.budget.toLocaleString()} €</td>
                              <td><span style={{background:cfg.bg,color:cfg.color}}>{wp.status}</span></td>
                              <td>
                                <div>
                                  <div>
                                    <div style={{width:`${wp.completion}%`,background:wp.completion===100?"#22c55e":pc}}/>
                                  </div>
                                  <span>{wp.completion}%</span>
                                </div>
                              </td>
                              <td><button onClick={()=>startEdit(wp)}><Pencil size={11}/></button></td>
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
