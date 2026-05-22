"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Trash2, Pencil, Check, X, Download } from "lucide-react"

interface RACIRow {
  id:string; activity:string; phase:string
  responsible:string; accountable:string; consulted:string; informed:string
  driver?:string; approver?:string
  notes:string
}

const ROLES = ["R","A","C","I","D","—"]
const ROLE_CFG: Record<string,{ color:string; bg:string; label:string }> = {
  R: { color:"#ef4444", bg:"rgba(239,68,68,0.15)",  label:"Réalise" },
  A: { color:"#7B5EFF", bg:"rgba(123,94,255,0.15)", label:"Approuve" },
  C: { color:"#f59e0b", bg:"rgba(245,158,11,0.15)", label:"Consulté" },
  I: { color:"#3b82f6", bg:"rgba(59,130,246,0.15)", label:"Informé" },
  D: { color:"#22c55e", bg:"rgba(34,197,94,0.15)",  label:"Décide (DACI)" },
  "—": { color:"#64748b", bg:"rgba(100,116,139,0.08)", label:"—" },
}

const empty = ():RACIRow => ({
  id:Date.now().toString(), activity:"", phase:"", responsible:"", accountable:"",
  consulted:"", informed:"", driver:"", approver:"", notes:""
})

export default function RACIPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory, deleteHistory } = useToolData(id, "raci")

  const [rows, setRows]       = useState<RACIRow[]>([])
  const [actors, setActors]   = useState<string[]>(["Chef de Projet","Sponsor","Équipe","Client","MOE"])
  const [newActor, setNewActor] = useState("")
  const [mode, setMode]       = useState<"raci"|"daci">("raci")
  const [newRow, setNewRow]   = useState<RACIRow>(empty())
  const [editId, setEditId]   = useState<string|null>(null)
  const [showLegend, setShowLegend] = useState(true)

  useState(() => {
    if (data?.rows?.length)  setRows(data.rows)
    if (data?.actors?.length) setActors(data.actors)
    if (data?.mode) setMode(data.mode)
  })

  const saveAll = async (r:RACIRow[], a:string[], m:string) => {
    setRows(r); setActors(a); await save({ rows:r, actors:a, mode:m })
  }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération RACI en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"raci", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const d = json.data
      const newActors = d.actors ?? d.stakeholders ?? actors
      const newRows: RACIRow[] = (d.rows ?? d.activities ?? []).map((r:any,i:number) => ({
        id:"R"+Date.now()+i, activity:r.activity??r.name??"Activité "+(i+1),
        phase:r.phase??"", responsible:r.responsible??r.R??"",
        accountable:r.accountable??r.A??"", consulted:r.consulted??r.C??"",
        informed:r.informed??r.I??"", driver:r.driver??r.D??"",
        approver:r.approver??"", notes:r.notes??""
      }))
      await saveAll(newRows, newActors, mode)
      toast.success("RACI généré — "+newRows.length+" activités")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const addRow = () => {
    if (!newRow.activity) { toast.error("Activité obligatoire"); return }
    saveAll([...rows, { ...newRow, id:Date.now().toString() }], actors, mode)
    setNewRow(empty()); toast.success("Activité ajoutée")
  }

  const addActor = () => {
    if (!newActor.trim()||actors.includes(newActor.trim())) return
    const a = [...actors, newActor.trim()]
    saveAll(rows, a, mode)
    setNewActor("")
  }

  // Matrice RACI — pour chaque activité et acteur, quelle est la lettre ?
  const getCell = (row:RACIRow, actor:string):string => {
    const r = row.responsible?.split(",").map(s=>s.trim())
    const a = row.accountable?.split(",").map(s=>s.trim())
    const c = row.consulted?.split(",").map(s=>s.trim())
    const i = row.informed?.split(",").map(s=>s.trim())
    const d = row.driver?.split(",").map(s=>s.trim())
    if (d?.includes(actor)) return mode==="daci"?"D":"A"
    if (a?.includes(actor)) return "A"
    if (r?.includes(actor)) return "R"
    if (c?.includes(actor)) return "C"
    if (i?.includes(actor)) return "I"
    return "—"
  }

  const setCell = (rowId:string, actor:string, val:string) => {
    const updated = rows.map(row => {
      if (row.id !== rowId) return row
      const clearActor = (field:string) => (row as any)[field]?.split(",").map((s:string)=>s.trim()).filter((s:string)=>s!==actor).join(", ")||""
      let r = { ...row, responsible:clearActor("responsible"), accountable:clearActor("accountable"), consulted:clearActor("consulted"), informed:clearActor("informed"), driver:clearActor("driver") }
      if (val==="R") r.responsible = [r.responsible,actor].filter(Boolean).join(", ")
      if (val==="A") r.accountable = [r.accountable,actor].filter(Boolean).join(", ")
      if (val==="C") r.consulted   = [r.consulted,actor].filter(Boolean).join(", ")
      if (val==="I") r.informed    = [r.informed,actor].filter(Boolean).join(", ")
      if (val==="D") r.driver      = [r.driver||"",actor].filter(Boolean).join(", ")
      return r
    })
    saveAll(updated, actors, mode)
  }

  const exportCSV = () => {
    const headers = ["Phase","Activité",...actors,"Notes"]
    const lines = rows.map(row => [row.phase,row.activity,...actors.map(a=>getCell(row,a)),row.notes].map(v=>`"${v}"`).join(","))
    const csv = [headers.join(","),...lines].join("\n")
    const blob = new Blob([csv],{type:"text/csv"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href=url; a.download=`RACI_${project?.name||"projet"}.csv`; a.click()
    toast.success("Export CSV téléchargé")
  }

  const toRows = () => rows.map(r => ({ Phase:r.phase, Activité:r.activity, Responsable:r.responsible, Approbateur:r.accountable, Consulté:r.consulted, Informé:r.informed, Notes:r.notes }))

  return (
    <AppLayout>
      <ToolLayout title="RACI Matrix Pro" icon="👥" subtitle="// RESPONSABILITÉS"
        history={history} onLoadHistory={(e)=>{ loadHistory(e); if(e.data?.rows) { setRows(e.data.rows); if(e.data.actors) setActors(e.data.actors) } }}
        onGenerate={generate} generateLabel="Générer RACI" generating={loading}
        exportRows={toRows()} exportFilename={"RACI_"+(project?.name||"")} projectName={project?.name}
        gammaType="codir" gammaData={data}>

        {/* Controls */}
        <div style={{ display:"flex", gap:10, marginBottom:14, alignItems:"center", flexWrap:"wrap" }}>
          {/* Mode RACI/DACI */}
          <div style={{ display:"flex", gap:3, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, padding:3 }}>
            {(["raci","daci"] as const).map(m => (
              <button key={m} onClick={()=>{ setMode(m); saveAll(rows,actors,m) }}
                style={{ padding:"5px 14px", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", border:"none", background:mode===m?"var(--primary-bg)":"transparent", color:mode===m?"var(--primary-light)":"var(--text-3)", textTransform:"uppercase" }}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowLegend(!showLegend)} style={{ padding:"5px 12px", border:"1px solid var(--border)", borderRadius:8, fontSize:11, background:"transparent", color:"var(--text-3)", cursor:"pointer" }}>
            {showLegend?"Masquer":"Afficher"} légende
          </button>
          {rows.length > 0 && (
            <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", border:"1px solid var(--border)", borderRadius:8, fontSize:11, background:"transparent", color:"var(--text-2)", cursor:"pointer" }}>
              <Download size={12}/> Export CSV
            </button>
          )}
        </div>

        {/* Légende */}
        {showLegend && (
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            {Object.entries(ROLE_CFG).filter(([k])=>k!=="—"&&(mode==="daci"||k!=="D")).map(([k,v]) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", background:v.bg, borderRadius:8, border:"1px solid "+v.color+"44" }}>
                <span style={{ fontSize:12, fontWeight:800, color:v.color }}>{k}</span>
                <span style={{ fontSize:11, color:"var(--text-2)" }}>{v.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Gestion acteurs */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, fontWeight:600, color:"var(--text-2)" }}>👥 Acteurs :</span>
            {actors.map((a,i) => (
              <div key={a} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 10px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:20, fontSize:11, color:"var(--text-1)" }}>
                {a}
                <button onClick={()=>saveAll(rows,actors.filter((_,j)=>j!==i),mode)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-3)", padding:0, marginLeft:2, lineHeight:1 }}>✕</button>
              </div>
            ))}
            <div style={{ display:"flex", gap:5 }}>
              <input value={newActor} onChange={e=>setNewActor(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addActor()} placeholder="+ Ajouter acteur"
                style={{ width:140, fontSize:11, border:"1px solid var(--border)", borderRadius:20, padding:"3px 10px", background:"var(--bg)", color:"var(--text-1)", outline:"none" }}/>
              <button onClick={addActor} style={{ padding:"3px 10px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:20, fontSize:11, cursor:"pointer" }}>+</button>
            </div>
          </div>
        </div>

        {/* Matrice */}
        {rows.length > 0 && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"auto", marginBottom:14 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
              <thead>
                <tr style={{ background:"var(--bg)" }}>
                  <th style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", whiteSpace:"nowrap", minWidth:80 }}>PHASE</th>
                  <th style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", minWidth:200 }}>ACTIVITÉ</th>
                  {actors.map(a => (
                    <th key={a} style={{ padding:"10px 8px", textAlign:"center", fontSize:9, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", whiteSpace:"nowrap", minWidth:80 }}>{a}</th>
                  ))}
                  <th style={{ padding:"10px 8px", fontSize:10, fontWeight:700, color:"var(--text-3)", borderBottom:"2px solid var(--border)", minWidth:40 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} style={{ borderBottom:"1px solid var(--border)", background:idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                    <td style={{ padding:"8px 12px", fontSize:11, color:"var(--text-3)" }}>
                      {editId===row.id
                        ? <input value={row.phase} onChange={e=>setRows(prev=>prev.map(r=>r.id===row.id?{...r,phase:e.target.value}:r))} style={{ width:70, fontSize:10, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/>
                        : row.phase||"—"
                      }
                    </td>
                    <td style={{ padding:"8px 12px", fontWeight:500, color:"var(--text-1)" }}>
                      {editId===row.id
                        ? <input value={row.activity} onChange={e=>setRows(prev=>prev.map(r=>r.id===row.id?{...r,activity:e.target.value}:r))} style={{ width:"100%", fontSize:11, border:"1px solid var(--primary)", borderRadius:4, padding:"2px 5px", background:"var(--bg)", color:"var(--text-1)" }}/>
                        : row.activity
                      }
                    </td>
                    {actors.map(actor => {
                      const cell = getCell(row, actor)
                      const cfg  = ROLE_CFG[cell] ?? ROLE_CFG["—"]
                      return (
                        <td key={actor} style={{ padding:"6px 4px", textAlign:"center" }}>
                          <select value={cell} onChange={e=>setCell(row.id,actor,e.target.value)}
                            style={{ width:52, fontSize:12, fontWeight:800, border:"none", borderRadius:6, padding:"4px 2px", background:cfg.bg, color:cfg.color, textAlign:"center", cursor:"pointer", outline:"none" }}>
                            {ROLES.filter(r=>mode==="daci"||r!=="D").map(r=><option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                      )
                    })}
                    <td style={{ padding:"6px 8px" }}>
                      {editId===row.id ? (
                        <div style={{ display:"flex", gap:3 }}>
                          <button onClick={()=>{ saveAll(rows,actors,mode); setEditId(null) }} style={{ padding:"2px 5px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:4, cursor:"pointer" }}><Check size={10}/></button>
                          <button onClick={()=>setEditId(null)} style={{ padding:"2px 5px", background:"transparent", border:"1px solid var(--border)", borderRadius:4, cursor:"pointer", color:"var(--text-3)" }}><X size={10}/></button>
                        </div>
                      ) : (
                        <div style={{ display:"flex", gap:3 }}>
                          <button onClick={()=>setEditId(row.id)} style={{ padding:"2px 5px", background:"transparent", border:"1px solid var(--border)", borderRadius:4, cursor:"pointer", color:"var(--text-3)" }}><Pencil size={10}/></button>
                          <button onClick={()=>saveAll(rows.filter(r=>r.id!==row.id),actors,mode)} style={{ padding:"2px 5px", background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:4, cursor:"pointer", color:"#ef4444" }}><Trash2 size={10}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length === 0 && !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Matrice RACI vide</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez ou ajoutez vos activités</p>
          </div>
        )}

        {/* Formulaire ajout */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"12px 16px" }}>
          <h4 style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", margin:"0 0 10px" }}>+ Ajouter une activité</h4>
          <div style={{ display:"grid", gridTemplateColumns:"100px 1fr 1fr 1fr 1fr 1fr auto", gap:8, alignItems:"flex-end" }}>
            <div>
              <div style={{ fontSize:9, color:"var(--text-3)", marginBottom:2 }}>Phase</div>
              <input value={newRow.phase} onChange={e=>setNewRow(p=>({...p,phase:e.target.value}))} placeholder="Phase 1"
                style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:9, color:"var(--text-3)", marginBottom:2 }}>Activité *</div>
              <input value={newRow.activity} onChange={e=>setNewRow(p=>({...p,activity:e.target.value}))} placeholder="Nom de l'activité"
                style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:9, color:"#ef4444", marginBottom:2 }}>R — Réalise</div>
              <input value={newRow.responsible} onChange={e=>setNewRow(p=>({...p,responsible:e.target.value}))} placeholder="Acteur(s)"
                style={{ width:"100%", fontSize:11, border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:9, color:"#7B5EFF", marginBottom:2 }}>A — Approuve</div>
              <input value={newRow.accountable} onChange={e=>setNewRow(p=>({...p,accountable:e.target.value}))} placeholder="Acteur"
                style={{ width:"100%", fontSize:11, border:"1px solid rgba(123,94,255,0.3)", borderRadius:6, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:9, color:"#f59e0b", marginBottom:2 }}>C — Consulté</div>
              <input value={newRow.consulted} onChange={e=>setNewRow(p=>({...p,consulted:e.target.value}))} placeholder="Acteur(s)"
                style={{ width:"100%", fontSize:11, border:"1px solid rgba(245,158,11,0.3)", borderRadius:6, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:9, color:"#3b82f6", marginBottom:2 }}>I — Informé</div>
              <input value={newRow.informed} onChange={e=>setNewRow(p=>({...p,informed:e.target.value}))} placeholder="Acteur(s)"
                style={{ width:"100%", fontSize:11, border:"1px solid rgba(59,130,246,0.3)", borderRadius:6, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
            </div>
            <button onClick={addRow} style={{ padding:"6px 14px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
              <Plus size={12}/> Add
            </button>
          </div>
        </div>
      </ToolLayout>
    </AppLayout>
  )
}
