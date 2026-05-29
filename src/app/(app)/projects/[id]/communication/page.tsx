"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"

interface CommLine {
  id: string; stakeholder: string; role: string; influence: "Élevée"|"Moyenne"|"Faible"
  interest: "Élevé"|"Moyen"|"Faible"; message: string
  channel: string; frequency: string; format: string
  owner: string; status: "Actif"|"Suspendu"|"Planifié"
}

const FREQ_COLORS: Record<string, string> = {
  "Quotidien":"#ef4444","Hebdomadaire":"#f59e0b","Bimensuel":"#f97316",
  "Mensuel":"#3b82f6","Trimestriel":"#22c55e","Ponctuel":"#64748b","Ad hoc":"#64748b"
}
const CHAN_ICONS: Record<string, string> = {
  "Email":"📧","Réunion":"🤝","Teams/Slack":"💬","Dashboard":"📊",
  "Rapport":"📋","Téléphone":"📞","Comité":"🏛️","Newsletter":"📰"
}

const empty = (): CommLine => ({
  id:Date.now().toString(), stakeholder:"", role:"", influence:"Moyenne",
  interest:"Moyen", message:"", channel:"Email", frequency:"Hebdomadaire",
  format:"Email", owner:"", status:"Actif"
})

export default function CommunicationPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory, deleteHistory } = useToolData(id, "communication")

  const [items, setItems]     = useState<CommLine[]>([])
  const [newItem, setNewItem] = useState<CommLine>(empty())
  const [editId, setEditId]   = useState<string|null>(null)
  const [editBuf, setEditBuf] = useState<Partial<CommLine>>({})
  const [tab, setTab]         = useState<"matrix"|"list">("matrix")

  useState(() => { if (data?.items?.length) setItems(data.items) })

  const saveItems = async (its: CommLine[]) => { setItems(its); await save({ items: its }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"communication", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const raw = json.data?.items ?? json.data?.stakeholders ?? []
      const enriched: CommLine[] = raw.map((s:any, i:number) => ({
        id:Date.now().toString()+i, stakeholder:s.stakeholder??s.name??"Partie prenante "+(i+1),
        role:s.role??"", influence:s.influence??"Moyenne", interest:s.interest??"Moyen",
        message:s.message??s.key_message??"", channel:s.channel??s.canal??"Email",
        frequency:s.frequency??s.frequence??"Mensuel", format:s.format??"Email",
        owner:s.owner??s.responsable??"", status:s.status??"Actif"
      }))
      await saveItems(enriched)
      toast.success("Plan comm généré — "+enriched.length+" parties prenantes")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const addItem = () => {
    if (!newItem.stakeholder) { toast.error("Partie prenante obligatoire"); return }
    saveItems([...items, { ...newItem, id:Date.now().toString() }])
    setNewItem(empty()); toast.success("Partie prenante ajoutée")
  }

  const toRows = () => items.map(i => ({ "Partie prenante":i.stakeholder, Rôle:i.role, Influence:i.influence, Intérêt:i.interest, Canal:i.channel, Fréquence:i.frequency, Responsable:i.owner, Statut:i.status }))

  // Matrice Influence × Intérêt
  const matrixQuadrants = [
    { key:"HH", inf:"Élevée", int:"Élevé",  label:"Gérer activement",   color:"#ef4444", bg:"rgba(239,68,68,0.08)",  desc:"Impliquer fortement" },
    { key:"HL", inf:"Élevée", int:"Moyen",  label:"Garder satisfaits",  color:"#f59e0b", bg:"rgba(245,158,11,0.08)", desc:"Informer régulièrement" },
    { key:"LH", inf:"Moyenne",int:"Élevé",  label:"Garder informés",    color:"#3b82f6", bg:"rgba(59,130,246,0.08)", desc:"Consulter souvent" },
    { key:"LL", inf:"Moyenne",int:"Moyen",  label:"Surveiller",         color:"#22c55e", bg:"rgba(34,197,94,0.08)",  desc:"Communication minimale" },
    { key:"FL", inf:"Faible", int:"Faible", label:"Surveiller",         color:"#64748b", bg:"rgba(100,116,139,0.08)",desc:"Informer ponctuellement" },
  ]

  return (
    <AppLayout>
      <ToolLayout
        title="Plan de Communication" icon="📣" subtitle="// PARTIES PRENANTES"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.items) setItems(e.data.items) }}
        onGenerate={generate} generateLabel="Générer Plan Comm" generating={loading}
        exportRows={toRows()} exportFilename={"Communication_"+(project?.name??"")} projectName={project?.name}
        gammaType="codir" gammaData={data}>

        {/* KPIs */}
        {items.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:16 }}>
            {[
              { label:"Parties prenantes", value:items.length,                                   color:"var(--primary)" },
              { label:"Influence Élevée",  value:items.filter(i=>i.influence==="Élevée").length, color:"#ef4444" },
              { label:"Canaux actifs",     value:new Set(items.map(i=>i.channel)).size,           color:"#3b82f6" },
              { label:"Actifs",            value:items.filter(i=>i.status==="Actif").length,      color:"#22c55e" },
              { label:"Propriétaires",     value:new Set(items.map(i=>i.owner).filter(Boolean)).size, color:"#f59e0b" },
            ].map(k => (
              <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:4, marginBottom:16, width:"fit-content" }}>
          {([["matrix","🗺️ Matrice Influence/Intérêt"],["list","📋 Plan détaillé"]] as const).map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              style={{ padding:"6px 16px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", border:"none", background:tab===v?"var(--primary-bg)":"transparent", color:tab===v?"var(--primary-light)":"var(--text-2)" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Vue Matrice */}
        {tab === "matrix" && items.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            {matrixQuadrants.map(q => {
              const qItems = items.filter(i => i.influence===q.inf && i.interest===q.int)
              if (qItems.length === 0) return null
              return (
                <div key={q.key} style={{ background:q.bg, border:"1px solid "+q.color+"33", borderRadius:12, padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:q.color, flexShrink:0 }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:q.color }}>{q.label}</span>
                    <span style={{ fontSize:10, color:"var(--text-3)", marginLeft:"auto" }}>Inf. {q.inf} × Int. {q.int}</span>
                  </div>
                  <p style={{ fontSize:10, color:"var(--text-3)", margin:"0 0 8px", fontStyle:"italic" }}>{q.desc}</p>
                  {qItems.map(item => (
                    <div key={item.id} style={{ padding:"6px 10px", background:"var(--bg-card)", borderRadius:7, marginBottom:5, border:"1px solid var(--border)" }}>
                      <div style={{ fontSize:11, fontWeight:600, color:"var(--text-1)" }}>{item.stakeholder}</div>
                      <div style={{ display:"flex", gap:8, marginTop:3, fontSize:10, color:"var(--text-3)" }}>
                        <span>{CHAN_ICONS[item.channel]||"📧"} {item.channel}</span>
                        <span style={{ color:FREQ_COLORS[item.frequency]||"#64748b" }}>🔄 {item.frequency}</span>
                        {item.owner && <span>👤 {item.owner}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* Vue Liste */}
        {tab === "list" && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", marginBottom:16 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"var(--bg)" }}>
                  {["Partie prenante","Rôle","Influence","Intérêt","Message clé","Canal","Fréquence","Responsable","Statut",""].map(h => (
                    <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const freqColor = FREQ_COLORS[item.frequency] || "#64748b"
                  const isEditing = editId === item.id
                  return (
                    <tr key={item.id} style={{ borderBottom:"1px solid var(--border)", background:idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                      {isEditing ? (
                        <>
                          <td style={{ padding:"6px 10px" }}><input value={editBuf.stakeholder??""} onChange={e=>setEditBuf(p=>({...p,stakeholder:e.target.value}))} style={{ width:120, fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                          <td style={{ padding:"6px 10px" }}><input value={editBuf.role??""} onChange={e=>setEditBuf(p=>({...p,role:e.target.value}))} style={{ width:100, fontSize:11, border:"1px solid var(--border)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                          <td style={{ padding:"6px 10px" }}><select value={editBuf.influence??""} onChange={e=>setEditBuf(p=>({...p,influence:e.target.value as any}))} style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:4, padding:"2px 4px", background:"var(--bg)", color:"var(--text-1)" }}>{["Élevée","Moyenne","Faible"].map(v=><option key={v}>{v}</option>)}</select></td>
                          <td style={{ padding:"6px 10px" }}><select value={editBuf.interest??""} onChange={e=>setEditBuf(p=>({...p,interest:e.target.value as any}))} style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:4, padding:"2px 4px", background:"var(--bg)", color:"var(--text-1)" }}>{["Élevé","Moyen","Faible"].map(v=><option key={v}>{v}</option>)}</select></td>
                          <td style={{ padding:"6px 10px" }}><input value={editBuf.message??""} onChange={e=>setEditBuf(p=>({...p,message:e.target.value}))} style={{ width:140, fontSize:11, border:"1px solid var(--border)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                          <td style={{ padding:"6px 10px" }}><input value={editBuf.channel??""} onChange={e=>setEditBuf(p=>({...p,channel:e.target.value}))} style={{ width:80, fontSize:11, border:"1px solid var(--border)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                          <td style={{ padding:"6px 10px" }}><input value={editBuf.frequency??""} onChange={e=>setEditBuf(p=>({...p,frequency:e.target.value}))} style={{ width:90, fontSize:11, border:"1px solid var(--border)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                          <td style={{ padding:"6px 10px" }}><input value={editBuf.owner??""} onChange={e=>setEditBuf(p=>({...p,owner:e.target.value}))} style={{ width:90, fontSize:11, border:"1px solid var(--border)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/></td>
                          <td style={{ padding:"6px 10px" }}><select value={editBuf.status??""} onChange={e=>setEditBuf(p=>({...p,status:e.target.value as any}))} style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:4, padding:"2px 4px", background:"var(--bg)", color:"var(--text-1)" }}>{["Actif","Suspendu","Planifié"].map(v=><option key={v}>{v}</option>)}</select></td>
                          <td style={{ padding:"6px 10px" }}>
                            <div style={{ display:"flex", gap:4 }}>
                              <button onClick={() => { saveItems(items.map(i=>i.id===item.id?{...i,...editBuf}:i)); setEditId(null) }} style={{ padding:"3px 7px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:5, cursor:"pointer" }}><Check size={11}/></button>
                              <button onClick={() => setEditId(null)} style={{ padding:"3px 7px", background:"transparent", border:"1px solid var(--border)", borderRadius:5, cursor:"pointer", color:"var(--text-3)" }}><X size={11}/></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding:"8px 12px", fontWeight:600, color:"var(--text-1)" }}>{item.stakeholder}</td>
                          <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-2)" }}>{item.role||"—"}</td>
                          <td style={{ padding:"8px 12px" }}>
                            <span style={{ fontSize:10, padding:"1px 7px", borderRadius:6, background:item.influence==="Élevée"?"rgba(239,68,68,0.1)":item.influence==="Moyenne"?"rgba(245,158,11,0.1)":"rgba(34,197,94,0.1)", color:item.influence==="Élevée"?"#ef4444":item.influence==="Moyenne"?"#f59e0b":"#22c55e", fontWeight:600 }}>{item.influence}</span>
                          </td>
                          <td style={{ padding:"8px 12px" }}>
                            <span style={{ fontSize:10, padding:"1px 7px", borderRadius:6, background:"rgba(59,130,246,0.1)", color:"#3b82f6", fontWeight:600 }}>{item.interest}</span>
                          </td>
                          <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-2)", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.message||"—"}</td>
                          <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-2)" }}>{CHAN_ICONS[item.channel]||"📧"} {item.channel}</td>
                          <td style={{ padding:"8px 12px" }}>
                            <span style={{ fontSize:10, padding:"1px 7px", borderRadius:6, background:freqColor+"15", color:freqColor, fontWeight:600 }}>{item.frequency}</span>
                          </td>
                          <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-2)" }}>{item.owner||"—"}</td>
                          <td style={{ padding:"8px 12px" }}>
                            <span style={{ fontSize:10, padding:"1px 7px", borderRadius:6, background:item.status==="Actif"?"rgba(34,197,94,0.1)":"rgba(100,116,139,0.1)", color:item.status==="Actif"?"#22c55e":"#64748b", fontWeight:600 }}>{item.status}</span>
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
            <div style={{ fontSize:40, marginBottom:12 }}>📣</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucune partie prenante</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez ou ajoutez votre plan de communication</p>
          </div>
        )}

        {/* Formulaire ajout */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
          <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>+ Ajouter une partie prenante</h4>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 100px 100px 1fr 1fr 1fr 100px auto", gap:8, alignItems:"flex-end" }}>
            {[
              { label:"Partie prenante *", field:"stakeholder", type:"text", placeholder:"Nom" },
              { label:"Rôle", field:"role", type:"text", placeholder:"Rôle/Titre" },
            ].map(f => (
              <div key={f.field}>
                <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>{f.label}</div>
                <input value={(newItem as any)[f.field]} onChange={e=>setNewItem(p=>({...p,[f.field]:e.target.value}))} placeholder={f.placeholder} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
              </div>
            ))}
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Influence</div>
              <select value={newItem.influence} onChange={e=>setNewItem(p=>({...p,influence:e.target.value as any}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)" }}>
                {["Élevée","Moyenne","Faible"].map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Intérêt</div>
              <select value={newItem.interest} onChange={e=>setNewItem(p=>({...p,interest:e.target.value as any}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)" }}>
                {["Élevé","Moyen","Faible"].map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Message clé</div>
              <input value={newItem.message} onChange={e=>setNewItem(p=>({...p,message:e.target.value}))} placeholder="Message principal" style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Canal</div>
              <input value={newItem.channel} onChange={e=>setNewItem(p=>({...p,channel:e.target.value}))} placeholder="Email, Réunion..." style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Fréquence</div>
              <select value={newItem.frequency} onChange={e=>setNewItem(p=>({...p,frequency:e.target.value}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)" }}>
                {["Quotidien","Hebdomadaire","Bimensuel","Mensuel","Trimestriel","Ponctuel"].map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Responsable</div>
              <input value={newItem.owner} onChange={e=>setNewItem(p=>({...p,owner:e.target.value}))} placeholder="Nom" style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
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
