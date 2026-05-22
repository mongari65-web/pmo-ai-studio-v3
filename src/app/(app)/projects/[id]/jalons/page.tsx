"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Pencil, Check, X } from "lucide-react"

interface Jalon {
  id?: string; code: string; name: string; date: string
  status: string; deliverables: string; responsible: string; description: string
}

const STATUS_CFG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  "Atteint":    { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "#22c55e", icon: "✅" },
  "En cours":   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "#f59e0b", icon: "🔄" },
  "À venir":    { color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "#3b82f6", icon: "🔵" },
  "En retard":  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "#ef4444", icon: "🔴" },
  "Annulé":     { color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "#64748b", icon: "⛔" },
}
const STATUS_OPTS = ["Atteint", "En cours", "À venir", "En retard", "Annulé"]

export default function JalonsPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory, deleteHistory } = useToolData(id, "jalons")
  const [items, setItems] = useState<Jalon[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<Jalon | null>(null)
  const [view, setView] = useState<"timeline" | "table">("timeline")

  useEffect(() => {
    if (data?.jalons) setItems(data.jalons)
    else {
      const key = Object.keys(data ?? {})[0]
      if (key && Array.isArray(data?.[key])) setItems(data[key])
    }
  }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Jalons en cours...")
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "jalons", projectName: project.name, projectDescription: project.description, budget: project.budget, startDate: project.start_date, endDate: project.end_date })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newItems = json.data?.jalons ?? (Object.values(json.data ?? {})[0] as any[]) ?? []
      setItems(newItems); await save({ jalons: newItems })
      toast.success("Jalons générés — " + newItems.length + " jalons")
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const startEdit = (item: Jalon) => { setEditId(item.code); setEditRow({ ...item }) }
  const cancelEdit = () => { setEditId(null); setEditRow(null) }
  const saveEdit = async () => {
    if (!editRow) return
    const updated = items.map(i => i.code === editRow.code ? editRow : i)
    setItems(updated); await save({ jalons: updated })
    setEditId(null); setEditRow(null); toast.success("Jalon mis à jour")
  }

  const atteints = items.filter(i => i.status === "Atteint").length
  const enRetard = items.filter(i => i.status === "En retard").length
  const aVenir   = items.filter(i => i.status === "À venir").length

  return (
    <AppLayout>
      <ToolLayout title="Jalons" icon="🏁" subtitle="// JALONS CLÉS"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); const k = e.data?.jalons ? "jalons" : Object.keys(e.data??{})[0]; if(k) setItems(e.data[k]) }}
        onGenerate={generate} generateLabel="Générer Jalons" generating={loading}
        projectName={project?.name}
        exportRows={items.map(i => ({ Code:i.code, Nom:i.name, Date:i.date, Statut:i.status, Responsable:i.responsible, Livrables:i.deliverables }))}
        exportFilename={"jalons_" + (project?.name ?? "")}>

        {items.length === 0 && !loading && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🏁</div>
            <p style={{ color:"var(--text-2)", fontSize:15 }}>Aucun jalon</p>
            <p style={{ color:"var(--text-3)", fontSize:13 }}>Cliquez sur "Générer Jalons"</p>
          </div>
        )}

        {items.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {[
                { label:"Total jalons",  value:items.length,  color:"var(--primary)" },
                { label:"Atteints",      value:atteints,      color:"#22c55e" },
                { label:"En retard",     value:enRetard,      color:"#ef4444" },
                { label:"À venir",       value:aVenir,        color:"#3b82f6" },
              ].map(k => (
                <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:22, fontWeight:800, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Toggle vue */}
            <div style={{ display:"flex", gap:4, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:4, width:"fit-content" }}>
              {([["timeline","🗓️ Timeline"],["table","📊 Tableau"]] as const).map(([v,l]) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding:"5px 14px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", border:"none", background:view===v?"var(--primary-bg)":"transparent", color:view===v?"var(--primary-light)":"var(--text-2)" }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Timeline */}
            {view === "timeline" && (
              <div style={{ position:"relative", paddingLeft:32 }}>
                {/* Ligne verticale */}
                <div style={{ position:"absolute", left:15, top:0, bottom:0, width:2, background:"linear-gradient(to bottom, var(--primary), #7c3aed, #059669, #d97706, #dc2626)", borderRadius:2 }}/>

                {items.map((item, idx) => {
                  const cfg = STATUS_CFG[item.status] ?? STATUS_CFG["À venir"]
                  const isEditing = editId === item.code && editRow
                  const colors = ["#6366f1","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#db2777"]
                  const lineColor = colors[idx % colors.length]

                  return (
                    <div key={item.code} style={{ position:"relative", marginBottom:16 }}>
                      {/* Point sur la ligne */}
                      <div style={{ position:"absolute", left:-24, top:18, width:14, height:14, borderRadius:"50%", background:lineColor, border:"2px solid var(--bg)", boxShadow:"0 0 0 3px "+lineColor+"44", zIndex:2 }}/>

                      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderLeft:"3px solid "+lineColor, borderRadius:10, overflow:"hidden" }}>
                        {isEditing ? (
                          <div style={{ padding:14 }}>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                              <div>
                                <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Code</div>
                                <input value={editRow.code} onChange={e=>setEditRow({...editRow,code:e.target.value})} style={{ width:"100%", fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 6px", background:"var(--bg)", color:"var(--text-1)" }}/>
                              </div>
                              <div>
                                <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Date</div>
                                <input type="date" value={editRow.date} onChange={e=>setEditRow({...editRow,date:e.target.value})} style={{ width:"100%", fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 6px", background:"var(--bg)", color:"var(--text-1)" }}/>
                              </div>
                              <div>
                                <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Statut</div>
                                <select value={editRow.status} onChange={e=>setEditRow({...editRow,status:e.target.value})} style={{ width:"100%", fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}>
                                  {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
                                </select>
                              </div>
                              <div>
                                <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Responsable</div>
                                <input value={editRow.responsible} onChange={e=>setEditRow({...editRow,responsible:e.target.value})} style={{ width:"100%", fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 6px", background:"var(--bg)", color:"var(--text-1)" }}/>
                              </div>
                            </div>
                            <div style={{ marginBottom:8 }}>
                              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Nom du jalon</div>
                              <input value={editRow.name} onChange={e=>setEditRow({...editRow,name:e.target.value})} style={{ width:"100%", fontSize:12, fontWeight:600, border:"1px solid var(--primary)", borderRadius:4, padding:"4px 8px", background:"var(--bg)", color:"var(--text-1)" }}/>
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                              <div>
                                <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Livrables</div>
                                <textarea value={editRow.deliverables} onChange={e=>setEditRow({...editRow,deliverables:e.target.value})} rows={2} style={{ width:"100%", fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"3px 6px", background:"var(--bg)", color:"var(--text-1)", resize:"vertical" }}/>
                              </div>
                              <div>
                                <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Description</div>
                                <textarea value={editRow.description} onChange={e=>setEditRow({...editRow,description:e.target.value})} rows={2} style={{ width:"100%", fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"3px 6px", background:"var(--bg)", color:"var(--text-1)", resize:"vertical" }}/>
                              </div>
                            </div>
                            <div style={{ display:"flex", gap:6 }}>
                              <button onClick={saveEdit} style={{ padding:"5px 14px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}><Check size={12}/> Sauvegarder</button>
                              <button onClick={cancelEdit} style={{ padding:"5px 12px", background:"transparent", border:"1px solid var(--border)", borderRadius:6, fontSize:12, color:"var(--text-2)", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}><X size={12}/> Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding:"12px 16px" }}>
                            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
                                {/* Badge code */}
                                <div style={{ background:lineColor, borderRadius:6, padding:"3px 10px", minWidth:40, textAlign:"center", flexShrink:0 }}>
                                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.7)", fontWeight:700, textTransform:"uppercase" }}>CODE</div>
                                  <div style={{ fontSize:13, fontWeight:900, color:"#fff" }}>{item.code}</div>
                                </div>
                                <div style={{ flex:1 }}>
                                  <div style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", marginBottom:3 }}>{item.name}</div>
                                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                                    <span style={{ fontSize:11, padding:"2px 8px", borderRadius:8, background:cfg.bg, color:cfg.color, fontWeight:600 }}>{cfg.icon} {item.status}</span>
                                    <span style={{ fontSize:11, color:"var(--text-3)" }}>📅 {item.date}</span>
                                    <span style={{ fontSize:11, color:"var(--text-3)" }}>👤 {item.responsible}</span>
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => startEdit(item)} style={{ padding:"4px 8px", background:"transparent", border:"1px solid var(--border)", borderRadius:6, cursor:"pointer", color:"var(--text-3)", flexShrink:0, marginLeft:8 }}>
                                <Pencil size={12}/>
                              </button>
                            </div>
                            {item.description && (
                              <p style={{ fontSize:11, color:"var(--text-2)", lineHeight:1.5, margin:"0 0 8px" }}>{item.description}</p>
                            )}
                            {item.deliverables && (
                              <div style={{ fontSize:11, color:"var(--text-2)", padding:"5px 10px", background:lineColor+"12", borderRadius:6, borderLeft:"2px solid "+lineColor }}>
                                📄 {item.deliverables}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tableau */}
            {view === "table" && (
              <div style={{ overflowX:"auto", borderRadius:12, border:"1px solid var(--border)" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ background:"var(--bg)" }}>
                      {["Code","Nom","Date","Statut","Responsable","Livrables",""].map(h => (
                        <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const cfg = STATUS_CFG[item.status] ?? STATUS_CFG["À venir"]
                      const colors = ["#6366f1","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#db2777"]
                      const lc = colors[idx % colors.length]
                      return (
                        <tr key={item.code} style={{ borderBottom:"1px solid var(--border)", background:idx%2===0?"var(--bg-card)":"var(--bg)", borderLeft:"3px solid "+lc }}>
                          <td style={{ padding:"10px 12px", fontWeight:700, color:lc }}>{item.code}</td>
                          <td style={{ padding:"10px 12px", fontWeight:600, color:"var(--text-1)", maxWidth:200 }}>{item.name}</td>
                          <td style={{ padding:"10px 12px", color:"var(--text-3)", whiteSpace:"nowrap" }}>📅 {item.date}</td>
                          <td style={{ padding:"10px 12px" }}>
                            <span style={{ fontSize:11, padding:"2px 10px", borderRadius:20, background:cfg.bg, color:cfg.color, fontWeight:600 }}>{cfg.icon} {item.status}</span>
                          </td>
                          <td style={{ padding:"10px 12px", color:"var(--text-2)" }}>👤 {item.responsible}</td>
                          <td style={{ padding:"10px 12px", color:"var(--text-2)", maxWidth:260, fontSize:11 }}>{item.deliverables}</td>
                          <td style={{ padding:"10px 10px" }}>
                            <button onClick={() => startEdit(item)} style={{ padding:"3px 8px", background:"transparent", border:"1px solid var(--border)", borderRadius:5, cursor:"pointer", color:"var(--text-3)" }}><Pencil size={11}/></button>
                          </td>
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
