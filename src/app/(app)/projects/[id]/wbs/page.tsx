"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Pencil, Trash2, Check, X, Calendar, BookOpen, GitBranch } from "lucide-react"

interface WBSItem {
  id: string; code: string; name: string; level: number
  description: string; deliverable: string; responsible: string
  duration: string; budget: string; dependencies: string
  // Dictionnaire
  acceptanceCriteria?: string; risks?: string; notes?: string
  // Calendrier
  startDate?: string; endDate?: string; progress?: number; status?: string
}

const LEVEL_COLORS: Record<number, string> = {
  1: "#1e40af", 2: "#7c3aed", 3: "#059669", 4: "#d97706"
}
const LEVEL_BG: Record<number, string> = {
  1: "rgba(30,64,175,0.08)", 2: "rgba(124,58,237,0.06)", 3: "rgba(5,150,105,0.05)", 4: "rgba(217,119,6,0.05)"
}
const STATUS_CFG: Record<string, {color:string; bg:string}> = {
  "Non démarré": { color:"#64748b", bg:"rgba(100,116,139,0.1)" },
  "En cours":    { color:"#3b82f6", bg:"rgba(59,130,246,0.1)" },
  "Terminé":     { color:"#22c55e", bg:"rgba(34,197,94,0.1)" },
  "En retard":   { color:"#ef4444", bg:"rgba(239,68,68,0.1)" },
  "Bloqué":      { color:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
}

const empty = (): WBSItem => ({
  id: Date.now().toString(), code: "", name: "", level: 2,
  description: "", deliverable: "", responsible: "", duration: "", budget: "", dependencies: "",
  acceptanceCriteria: "", risks: "", notes: "",
  startDate: "", endDate: "", progress: 0, status: "Non démarré"
})

const inputStyle = (w?: string): React.CSSProperties => ({
  width: w ?? "100%", fontSize: 11, border: "1px solid var(--border)",
  borderRadius: 5, padding: "3px 6px", background: "var(--bg)",
  color: "var(--text-1)", outline: "none", boxSizing: "border-box"
})

export default function WBSPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory, deleteHistory } = useToolData(id, "wbs")

  const [items, setItems]     = useState<WBSItem[]>([])
  const [tab, setTab]         = useState<"wbs"|"dict"|"calendar">("wbs")
  const [editId, setEditId]   = useState<string|null>(null)
  const [editRow, setEditRow] = useState<WBSItem|null>(null)
  const [adding, setAdding]   = useState(false)
  const [newRow, setNewRow]   = useState<WBSItem>(empty())

  useEffect(() => { if (data?.items) setItems(data.items) }, [data])

  const saveItems = async (its: WBSItem[]) => { setItems(its); await save({ items: its }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération WBS en cours...")
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "wbs", projectName: project.name,
          projectDescription: project.description,
          budget: project.budget, startDate: project.start_date, endDate: project.end_date
        })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newItems = (json.data?.items ?? []).map((i: any) => ({ ...empty(), ...i, id: Date.now().toString() + Math.random() }))
      await saveItems(newItems)
      toast.success(`WBS généré — ${newItems.length} éléments`)
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const confirmEdit = async () => {
    if (!editRow) return
    await saveItems(items.map(i => i.id === editRow.id ? editRow : i))
    setEditId(null); setEditRow(null)
  }

  const toRows = () => items.map(i => ({
    Code: i.code, Élément: i.name, Niveau: i.level,
    Description: i.description, Livrable: i.deliverable,
    Responsable: i.responsible, Durée: i.duration, Budget: i.budget,
    Dépendances: i.dependencies, Début: i.startDate, Fin: i.endDate,
    Avancement: i.progress ? i.progress + "%" : "0%", Statut: i.status
  }))

  // ── Onglet WBS ───────────────────────────────────────────────
  const WBSTab = () => (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead>
          <tr style={{ background:"var(--bg)" }}>
            {["Code","Élément WBS","Niv.","Livrable","Responsable","Durée","Budget",""].map(h => (
              <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom:"1px solid var(--border)", borderLeft:`3px solid ${LEVEL_COLORS[item.level]??"#475569"}`, background: editId===item.id ? "var(--bg-glass)" : LEVEL_BG[item.level] }}>
              {editId===item.id && editRow ? (
                <>
                  <td style={{ padding:"6px 8px" }}><input value={editRow.code} onChange={e=>setEditRow({...editRow,code:e.target.value})} style={inputStyle("70px")}/></td>
                  <td style={{ padding:"6px 8px" }}><input value={editRow.name} onChange={e=>setEditRow({...editRow,name:e.target.value})} style={inputStyle()}/></td>
                  <td style={{ padding:"6px 8px" }}>
                    <select value={editRow.level} onChange={e=>setEditRow({...editRow,level:+e.target.value})} style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"3px", background:"var(--bg)", color:"var(--text-1)" }}>
                      {[1,2,3,4].map(l=><option key={l}>{l}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:"6px 8px" }}><input value={editRow.deliverable} onChange={e=>setEditRow({...editRow,deliverable:e.target.value})} style={inputStyle()}/></td>
                  <td style={{ padding:"6px 8px" }}><input value={editRow.responsible} onChange={e=>setEditRow({...editRow,responsible:e.target.value})} style={inputStyle()}/></td>
                  <td style={{ padding:"6px 8px" }}><input value={editRow.duration} onChange={e=>setEditRow({...editRow,duration:e.target.value})} style={inputStyle("70px")}/></td>
                  <td style={{ padding:"6px 8px" }}><input value={editRow.budget} onChange={e=>setEditRow({...editRow,budget:e.target.value})} style={inputStyle("80px")}/></td>
                  <td style={{ padding:"6px 8px" }}>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={confirmEdit} style={{ padding:"3px 6px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:4, cursor:"pointer" }}><Check size={11}/></button>
                      <button onClick={()=>{setEditId(null);setEditRow(null)}} style={{ padding:"3px 6px", background:"transparent", border:"1px solid var(--border)", borderRadius:4, cursor:"pointer", color:"var(--text-3)" }}><X size={11}/></button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding:"8px 12px", fontFamily:"monospace", fontSize:11, color:"var(--text-3)" }}>{item.code}</td>
                  <td style={{ padding:"8px 12px", fontWeight: item.level===1?700:500, color:"var(--text-1)", paddingLeft:`${12+(item.level-1)*16}px` }}>{item.name}</td>
                  <td style={{ padding:"8px 12px" }}>
                    <span style={{ padding:"2px 6px", borderRadius:4, fontSize:10, fontWeight:700, background:LEVEL_COLORS[item.level]+"22", color:LEVEL_COLORS[item.level] }}>N{item.level}</span>
                  </td>
                  <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-2)", maxWidth:150, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.deliverable}</td>
                  <td style={{ padding:"8px 12px", fontSize:11, color:"#60a5fa" }}>{item.responsible}</td>
                  <td style={{ padding:"8px 12px", fontSize:11, color:"#4ade80" }}>{item.duration}</td>
                  <td style={{ padding:"8px 12px", fontSize:11, color:"#fbbf24" }}>{item.budget}</td>
                  <td style={{ padding:"8px 12px" }}>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>{setEditId(item.id);setEditRow({...item})}} style={{ padding:"3px 6px", background:"transparent", border:"1px solid var(--border)", borderRadius:4, cursor:"pointer", color:"var(--text-3)" }}><Pencil size={11}/></button>
                      <button onClick={()=>saveItems(items.filter(i=>i.id!==item.id))} style={{ padding:"3px 6px", background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:4, cursor:"pointer", color:"#ef4444" }}><Trash2 size={11}/></button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
          {adding && (
            <tr style={{ borderBottom:"1px solid var(--border)", background:"rgba(123,94,255,0.05)", borderLeft:"3px solid var(--primary)" }}>
              <td style={{ padding:"6px 8px" }}><input value={newRow.code} onChange={e=>setNewRow({...newRow,code:e.target.value})} placeholder="1.1" style={inputStyle("70px")}/></td>
              <td style={{ padding:"6px 8px" }}><input value={newRow.name} onChange={e=>setNewRow({...newRow,name:e.target.value})} placeholder="Nom du livrable" style={inputStyle()}/></td>
              <td style={{ padding:"6px 8px" }}>
                <select value={newRow.level} onChange={e=>setNewRow({...newRow,level:+e.target.value})} style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"3px", background:"var(--bg)", color:"var(--text-1)" }}>
                  {[1,2,3,4].map(l=><option key={l}>{l}</option>)}
                </select>
              </td>
              <td style={{ padding:"6px 8px" }}><input value={newRow.deliverable} onChange={e=>setNewRow({...newRow,deliverable:e.target.value})} placeholder="Livrable" style={inputStyle()}/></td>
              <td style={{ padding:"6px 8px" }}><input value={newRow.responsible} onChange={e=>setNewRow({...newRow,responsible:e.target.value})} placeholder="Responsable" style={inputStyle()}/></td>
              <td style={{ padding:"6px 8px" }}><input value={newRow.duration} onChange={e=>setNewRow({...newRow,duration:e.target.value})} placeholder="2 sem." style={inputStyle("70px")}/></td>
              <td style={{ padding:"6px 8px" }}><input value={newRow.budget} onChange={e=>setNewRow({...newRow,budget:e.target.value})} placeholder="5000€" style={inputStyle("80px")}/></td>
              <td style={{ padding:"6px 8px" }}>
                <div style={{ display:"flex", gap:4 }}>
                  <button onClick={async()=>{await saveItems([...items,{...newRow,id:Date.now().toString()}]);setAdding(false);setNewRow(empty())}} style={{ padding:"3px 6px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:4, cursor:"pointer" }}><Check size={11}/></button>
                  <button onClick={()=>setAdding(false)} style={{ padding:"3px 6px", background:"transparent", border:"1px solid var(--border)", borderRadius:4, cursor:"pointer", color:"var(--text-3)" }}><X size={11}/></button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  // ── Onglet Dictionnaire ──────────────────────────────────────
  const DictTab = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {items.filter(i=>i.level<=3).map(item => (
        <div key={item.id} style={{ background:"var(--bg-card)", border:`1px solid ${LEVEL_COLORS[item.level]}33`, borderLeft:`4px solid ${LEVEL_COLORS[item.level]}`, borderRadius:10, padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:700, background:LEVEL_COLORS[item.level]+"22", color:LEVEL_COLORS[item.level] }}>N{item.level}</span>
            <span style={{ fontFamily:"monospace", fontSize:11, color:"var(--text-3)" }}>{item.code}</span>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--text-1)" }}>{item.name}</span>
            {item.responsible && <span style={{ marginLeft:"auto", fontSize:11, color:"#60a5fa" }}>👤 {item.responsible}</span>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"📋 Description",          val:item.description },
              { label:"📦 Livrable attendu",      val:item.deliverable },
              { label:"✅ Critères d'acceptation",val:item.acceptanceCriteria },
              { label:"⚠️ Risques identifiés",    val:item.risks },
              { label:"⏱️ Durée estimée",         val:item.duration },
              { label:"💰 Budget alloué",         val:item.budget },
            ].map(({label,val}) => val ? (
              <div key={label} style={{ background:"var(--bg)", borderRadius:7, padding:"8px 10px" }}>
                <div style={{ fontSize:10, fontWeight:600, color:"var(--text-3)", marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:12, color:"var(--text-1)", lineHeight:1.5 }}>{val}</div>
              </div>
            ) : null)}
          </div>
          {item.notes && (
            <div style={{ marginTop:8, background:"rgba(123,94,255,0.06)", borderRadius:7, padding:"8px 10px" }}>
              <div style={{ fontSize:10, fontWeight:600, color:"var(--text-3)", marginBottom:2 }}>📝 Notes</div>
              <div style={{ fontSize:12, color:"var(--text-2)" }}>{item.notes}</div>
            </div>
          )}
        </div>
      ))}
      {items.filter(i=>i.level<=3).length === 0 && (
        <div style={{ textAlign:"center", padding:"40px", color:"var(--text-3)", fontSize:13 }}>
          Aucun élément — générez le WBS d'abord
        </div>
      )}
    </div>
  )

  // ── Onglet Calendrier ────────────────────────────────────────
  const CalendarTab = () => {
    const [editCalId, setEditCalId] = useState<string|null>(null)
    const [editCal, setEditCal]     = useState<Partial<WBSItem>>({})
    return (
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:"var(--bg)" }}>
              {["Code","Livrable","Responsable","Début","Fin","Durée","Avancement","Statut",""].map(h => (
                <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const sc = STATUS_CFG[item.status ?? "Non démarré"] ?? STATUS_CFG["Non démarré"]
              const prog = item.progress ?? 0
              return (
                <tr key={item.id} style={{ borderBottom:"1px solid var(--border)", background:idx%2===0?"var(--bg-card)":"var(--bg)", borderLeft:`3px solid ${LEVEL_COLORS[item.level]??"#475569"}` }}>
                  {editCalId===item.id ? (
                    <>
                      <td style={{ padding:"6px 8px" }}><span style={{ fontFamily:"monospace", fontSize:11, color:"var(--text-3)" }}>{item.code}</span></td>
                      <td style={{ padding:"6px 8px", fontSize:11, fontWeight:500, color:"var(--text-1)" }}>{item.name}</td>
                      <td style={{ padding:"6px 8px" }}><input value={editCal.responsible??item.responsible} onChange={e=>setEditCal(p=>({...p,responsible:e.target.value}))} style={inputStyle()}/></td>
                      <td style={{ padding:"6px 8px" }}><input type="date" value={editCal.startDate??item.startDate??""} onChange={e=>setEditCal(p=>({...p,startDate:e.target.value}))} style={inputStyle("120px")}/></td>
                      <td style={{ padding:"6px 8px" }}><input type="date" value={editCal.endDate??item.endDate??""} onChange={e=>setEditCal(p=>({...p,endDate:e.target.value}))} style={inputStyle("120px")}/></td>
                      <td style={{ padding:"6px 8px" }}><input value={editCal.duration??item.duration} onChange={e=>setEditCal(p=>({...p,duration:e.target.value}))} style={inputStyle("70px")}/></td>
                      <td style={{ padding:"6px 8px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <input type="range" min={0} max={100} value={editCal.progress??item.progress??0} onChange={e=>setEditCal(p=>({...p,progress:+e.target.value}))} style={{ width:80 }}/>
                          <span style={{ fontSize:11, color:"var(--text-2)", minWidth:28 }}>{editCal.progress??item.progress??0}%</span>
                        </div>
                      </td>
                      <td style={{ padding:"6px 8px" }}>
                        <select value={editCal.status??item.status??"Non démarré"} onChange={e=>setEditCal(p=>({...p,status:e.target.value}))} style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"3px", background:"var(--bg)", color:"var(--text-1)" }}>
                          {Object.keys(STATUS_CFG).map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding:"6px 8px" }}>
                        <div style={{ display:"flex", gap:4 }}>
                          <button onClick={async()=>{ await saveItems(items.map(i=>i.id===item.id?{...i,...editCal}:i)); setEditCalId(null) }} style={{ padding:"3px 6px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:4, cursor:"pointer" }}><Check size={11}/></button>
                          <button onClick={()=>setEditCalId(null)} style={{ padding:"3px 6px", background:"transparent", border:"1px solid var(--border)", borderRadius:4, cursor:"pointer", color:"var(--text-3)" }}><X size={11}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding:"8px 12px", fontFamily:"monospace", fontSize:11, color:"var(--text-3)" }}>{item.code}</td>
                      <td style={{ padding:"8px 12px", fontWeight:item.level===1?700:500, color:"var(--text-1)", paddingLeft:`${12+(item.level-1)*12}px`, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</td>
                      <td style={{ padding:"8px 12px", fontSize:11, color:"#60a5fa" }}>{item.responsible||"—"}</td>
                      <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-2)" }}>{item.startDate||"—"}</td>
                      <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-2)" }}>{item.endDate||"—"}</td>
                      <td style={{ padding:"8px 12px", fontSize:11, color:"#4ade80" }}>{item.duration||"—"}</td>
                      <td style={{ padding:"8px 12px", minWidth:120 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ flex:1, height:6, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ width:`${prog}%`, height:"100%", background: prog>=100?"#22c55e":prog>0?"#3b82f6":"#e2e8f0", borderRadius:3, transition:"width 0.3s" }}/>
                          </div>
                          <span style={{ fontSize:10, color:"var(--text-2)", minWidth:28, textAlign:"right" }}>{prog}%</span>
                        </div>
                      </td>
                      <td style={{ padding:"8px 12px" }}>
                        <span style={{ padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:600, background:sc.bg, color:sc.color }}>{item.status||"Non démarré"}</span>
                      </td>
                      <td style={{ padding:"8px 12px" }}>
                        <button onClick={()=>{setEditCalId(item.id);setEditCal({responsible:item.responsible,startDate:item.startDate,endDate:item.endDate,duration:item.duration,progress:item.progress,status:item.status})}} style={{ padding:"3px 6px", background:"transparent", border:"1px solid var(--border)", borderRadius:4, cursor:"pointer", color:"var(--text-3)" }}><Pencil size={11}/></button>
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const TABS = [
    { key:"wbs",      label:"🗂️ WBS",          icon:GitBranch },
    { key:"dict",     label:"📖 Dictionnaire",  icon:BookOpen },
    { key:"calendar", label:"📅 Calendrier",    icon:Calendar },
  ] as const

  return (
    <AppLayout>
      <ToolLayout
        title="WBS" icon="🗂️" subtitle="// STRUCTURE DE DÉCOUPAGE"
        history={history}
        onLoadHistory={(e)=>{ loadHistory(e); if(e.data?.items) setItems(e.data.items) }}
        onDeleteHistory={deleteHistory}
        onGenerate={generate} generateLabel="Générer WBS" generating={loading}
        onAdd={tab==="wbs" ? ()=>setAdding(true) : undefined}
        addLabel="+ Ajouter ligne"
        exportRows={items.length>0 ? toRows() : undefined}
        exportFilename={`WBS_${project?.name??""}`}
        projectName={project?.name}
        projectId={id} toolType="wbs">

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:4, marginBottom:16, width:"fit-content" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{ padding:"7px 16px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", border:"none", background:tab===t.key?"var(--primary-bg)":"transparent", color:tab===t.key?"var(--primary-light)":"var(--text-2)", display:"flex", alignItems:"center", gap:6 }}>
              {t.label}
            </button>
          ))}
        </div>

        {items.length===0 && !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🗂️</div>
            <p style={{ color:"var(--text-2)", fontSize:14, fontWeight:600, margin:"0 0 4px" }}>Aucun élément WBS</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez automatiquement ou ajoutez manuellement</p>
          </div>
        )}

        {items.length>0 && tab==="wbs"      && <WBSTab/>}
        {items.length>0 && tab==="dict"     && <DictTab/>}
        {items.length>0 && tab==="calendar" && <CalendarTab/>}

      </ToolLayout>
    </AppLayout>
  )
}
