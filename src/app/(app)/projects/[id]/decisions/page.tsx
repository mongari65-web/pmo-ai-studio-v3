"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"

interface Decision {
  id: string; num: string; date: string; title: string; description: string
  context: string; decision: string; owner: string; deadline: string
  status: "Ouverte"|"En cours"|"Appliquée"|"Annulée"; impact: "Faible"|"Moyen"|"Élevé"|"Critique"
  tags: string; notes: string
}

const STA: Record<string, { color:string; bg:string }> = {
  "Ouverte":   { color:"#3b82f6", bg:"rgba(59,130,246,0.1)" },
  "En cours":  { color:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
  "Appliquée": { color:"#22c55e", bg:"rgba(34,197,94,0.1)" },
  "Annulée":   { color:"#64748b", bg:"rgba(100,116,139,0.1)" },
}
const IMP: Record<string, { color:string; bg:string }> = {
  "Critique": { color:"#ef4444", bg:"rgba(239,68,68,0.12)" },
  "Élevé":    { color:"#f97316", bg:"rgba(249,115,22,0.12)" },
  "Moyen":    { color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
  "Faible":   { color:"#22c55e", bg:"rgba(34,197,94,0.12)" },
}

const empty = (): Decision => ({
  id: Date.now().toString(), num: "", date: new Date().toISOString().split("T")[0],
  title: "", description: "", context: "", decision: "",
  owner: "", deadline: "", status: "Ouverte", impact: "Moyen", tags: "", notes: ""
})

export default function DecisionsPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory, deleteHistory } = useToolData(id, "decisions")

  const [items, setItems] = useState<Decision[]>([])
  const [newItem, setNewItem] = useState<Decision>(empty())
  const [editId, setEditId] = useState<string|null>(null)
  const [editBuf, setEditBuf] = useState<Partial<Decision>>({})
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterImpact, setFilterImpact] = useState("all")

  useState(() => { if (data?.items?.length) setItems(data.items) })

  const saveItems = async (its: Decision[]) => { setItems(its); await save({ items: its }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"decisions", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const raw = json.data?.items ?? json.data?.decisions ?? []
      const enriched: Decision[] = raw.map((d:any, i:number) => ({
        id: Date.now().toString()+i, num: "DEC-"+(i+1).toString().padStart(3,"0"),
        date: d.date ?? new Date().toISOString().split("T")[0],
        title: d.title ?? d.name ?? "Décision "+(i+1),
        description: d.description ?? "", context: d.context ?? "",
        decision: d.decision ?? d.resolution ?? "",
        owner: d.owner ?? d.responsable ?? "",
        deadline: d.deadline ?? d.due_date ?? "",
        status: d.status ?? "Ouverte", impact: d.impact ?? "Moyen",
        tags: d.tags ?? "", notes: d.notes ?? ""
      }))
      await saveItems(enriched)
      toast.success("Registre généré — "+enriched.length+" décisions")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const addItem = () => {
    if (!newItem.title) { toast.error("Titre obligatoire"); return }
    const num = "DEC-"+(items.length+1).toString().padStart(3,"0")
    saveItems([...items, { ...newItem, id:Date.now().toString(), num }])
    setNewItem(empty())
    toast.success("Décision ajoutée")
  }

  const filtered = items.filter(i =>
    (filterStatus==="all"||i.status===filterStatus) &&
    (filterImpact==="all"||i.impact===filterImpact)
  )

  const toRows = () => items.map(i => ({ Num:i.num, Date:i.date, Titre:i.title, Impact:i.impact, Statut:i.status, Responsable:i.owner, Echéance:i.deadline, Décision:i.decision }))

  return (
    <AppLayout>
      <ToolLayout title="Registre Décisions" icon="📌" subtitle="// SUIVI CODIR"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.items) setItems(e.data.items) }}
        onGenerate={generate} generateLabel="Générer Décisions" generating={loading}
        exportRows={toRows()} exportFilename={"Decisions_"+(project?.name??"")} projectName={project?.name}
        gammaType="codir" gammaData={data}>

        {/* KPIs */}
        {items.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:16 }}>
            {[
              { label:"Total",      value:items.length,                                        color:"var(--primary)" },
              { label:"Ouvertes",   value:items.filter(i=>i.status==="Ouverte").length,        color:"#3b82f6" },
              { label:"En cours",   value:items.filter(i=>i.status==="En cours").length,       color:"#f59e0b" },
              { label:"Appliquées", value:items.filter(i=>i.status==="Appliquée").length,      color:"#22c55e" },
              { label:"Critiques",  value:items.filter(i=>i.impact==="Critique").length,       color:"#ef4444" },
            ].map(k => (
              <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filtres */}
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:4 }}>
            {["all","Ouverte","En cours","Appliquée","Annulée"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterStatus===s?"var(--primary)":"var(--border)"), background:filterStatus===s?"var(--primary-bg)":"transparent", color:filterStatus===s?"var(--primary-light)":"var(--text-3)" }}>
                {s==="all"?"Tous statuts":s}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {["all","Critique","Élevé","Moyen","Faible"].map(i => (
              <button key={i} onClick={() => setFilterImpact(i)}
                style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterImpact===i?"var(--primary)":"var(--border)"), background:filterImpact===i?"var(--primary-bg)":"transparent", color:filterImpact===i?"var(--primary-light)":"var(--text-3)" }}>
                {i==="all"?"Tous impacts":i}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau */}
        {filtered.length > 0 && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", marginBottom:16 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"var(--bg)" }}>
                  {["Num","Date","Titre + Décision","Impact","Responsable","Échéance","Statut","Actions"].map(h => (
                    <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const sta = STA[item.status] ?? STA["Ouverte"]
                  const imp = IMP[item.impact] ?? IMP["Moyen"]
                  const isEditing = editId === item.id
                  return (
                    <tr key={item.id} style={{ borderBottom:"1px solid var(--border)", background:idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                      {isEditing ? (
                        <>
                          <td style={{ padding:"8px 10px" }}>
                            <span style={{ fontSize:10, fontWeight:700, color:"var(--primary-light)" }}>{item.num}</span>
                          </td>
                          <td style={{ padding:"8px 10px" }}>
                            <input type="date" value={editBuf.date??""} onChange={e=>setEditBuf(p=>({...p,date:e.target.value}))} style={{ width:110, fontSize:11, border:"1px solid var(--primary)", borderRadius:5, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/>
                          </td>
                          <td style={{ padding:"8px 10px" }}>
                            <input value={editBuf.title??""} onChange={e=>setEditBuf(p=>({...p,title:e.target.value}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--primary)", borderRadius:5, padding:"3px 6px", background:"var(--bg)", color:"var(--text-1)", marginBottom:4 }}/>
                            <textarea value={editBuf.decision??""} onChange={e=>setEditBuf(p=>({...p,decision:e.target.value}))} rows={2} style={{ width:"100%", fontSize:10, border:"1px solid var(--border)", borderRadius:5, padding:"3px 6px", background:"var(--bg)", color:"var(--text-2)", resize:"none" }}/>
                          </td>
                          <td style={{ padding:"8px 10px" }}>
                            <select value={editBuf.impact??""} onChange={e=>setEditBuf(p=>({...p,impact:e.target.value as any}))} style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}>
                              {["Critique","Élevé","Moyen","Faible"].map(v=><option key={v}>{v}</option>)}
                            </select>
                          </td>
                          <td style={{ padding:"8px 10px" }}>
                            <input value={editBuf.owner??""} onChange={e=>setEditBuf(p=>({...p,owner:e.target.value}))} style={{ width:100, fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/>
                          </td>
                          <td style={{ padding:"8px 10px" }}>
                            <input type="date" value={editBuf.deadline??""} onChange={e=>setEditBuf(p=>({...p,deadline:e.target.value}))} style={{ width:110, fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/>
                          </td>
                          <td style={{ padding:"8px 10px" }}>
                            <select value={editBuf.status??""} onChange={e=>setEditBuf(p=>({...p,status:e.target.value as any}))} style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}>
                              {["Ouverte","En cours","Appliquée","Annulée"].map(v=><option key={v}>{v}</option>)}
                            </select>
                          </td>
                          <td style={{ padding:"8px 10px" }}>
                            <div style={{ display:"flex", gap:4 }}>
                              <button onClick={() => { saveItems(items.map(i=>i.id===item.id?{...i,...editBuf}:i)); setEditId(null) }} style={{ padding:"3px 7px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:5, cursor:"pointer" }}><Check size={11}/></button>
                              <button onClick={() => setEditId(null)} style={{ padding:"3px 7px", background:"transparent", border:"1px solid var(--border)", borderRadius:5, cursor:"pointer", color:"var(--text-3)" }}><X size={11}/></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding:"8px 12px" }}>
                            <span style={{ fontSize:10, fontWeight:700, color:"var(--primary-light)", fontFamily:"monospace" }}>{item.num}</span>
                          </td>
                          <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-3)", whiteSpace:"nowrap" }}>{item.date}</td>
                          <td style={{ padding:"8px 12px", maxWidth:320 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", marginBottom:3 }}>{item.title}</div>
                            {item.decision && <div style={{ fontSize:11, color:"var(--text-2)", lineHeight:1.4 }}>{item.decision.slice(0,120)}{item.decision.length>120?"…":""}</div>}
                          </td>
                          <td style={{ padding:"8px 12px" }}>
                            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:6, background:imp.bg, color:imp.color, fontWeight:600 }}>{item.impact}</span>
                          </td>
                          <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-2)" }}>{item.owner||"—"}</td>
                          <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-3)", whiteSpace:"nowrap" }}>{item.deadline||"—"}</td>
                          <td style={{ padding:"8px 12px" }}>
                            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:6, background:sta.bg, color:sta.color, fontWeight:600 }}>{item.status}</span>
                          </td>
                          <td style={{ padding:"8px 12px" }}>
                            <div style={{ display:"flex", gap:4 }}>
                              <button onClick={() => { setEditId(item.id); setEditBuf({...item}) }} style={{ padding:"3px 6px", background:"transparent", border:"1px solid var(--border)", borderRadius:5, cursor:"pointer", color:"var(--text-3)" }}><Pencil size={11}/></button>
                              <button onClick={() => saveItems(items.filter(i=>i.id!==item.id))} style={{ padding:"3px 6px", background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:5, cursor:"pointer", color:"#ef4444" }}><Trash2 size={11}/></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📌</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucune décision enregistrée</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez ou ajoutez votre première décision</p>
          </div>
        )}

        {/* Formulaire ajout */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
          <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>+ Ajouter une décision</h4>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 2fr 1fr 1fr 120px 120px", gap:8, alignItems:"flex-end" }}>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Date</div>
              <input type="date" value={newItem.date} onChange={e=>setNewItem(p=>({...p,date:e.target.value}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Titre *</div>
              <input value={newItem.title} onChange={e=>setNewItem(p=>({...p,title:e.target.value}))} placeholder="Titre de la décision" style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Décision prise</div>
              <input value={newItem.decision} onChange={e=>setNewItem(p=>({...p,decision:e.target.value}))} placeholder="Description de la décision" style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Impact</div>
              <select value={newItem.impact} onChange={e=>setNewItem(p=>({...p,impact:e.target.value as any}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)" }}>
                {["Critique","Élevé","Moyen","Faible"].map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Responsable</div>
              <input value={newItem.owner} onChange={e=>setNewItem(p=>({...p,owner:e.target.value}))} placeholder="Nom" style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Échéance</div>
              <input type="date" value={newItem.deadline} onChange={e=>setNewItem(p=>({...p,deadline:e.target.value}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <button onClick={addItem} style={{ padding:"7px 14px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
              <Plus size={13}/> Ajouter
            </button>
          </div>
        </div>
      </ToolLayout>
    </AppLayout>
  )
}
