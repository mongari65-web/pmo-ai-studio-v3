"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Trash2, Pencil, Check, X, Target } from "lucide-react"

interface KeyResult { id:string; text:string; unit:string; target:number; current:number; weight:number }
interface Objective { id:string; title:string; description:string; owner:string; quarter:string; category:string; keyResults:KeyResult[] }

const CATEGORIES = ["Stratégique","Opérationnel","Client","Qualité","RH","Finance","Innovation"]
const QUARTERS   = ["Q1 2026","Q2 2026","Q3 2026","Q4 2026","Q1 2027"]

const progress = (kr:KeyResult) => kr.target>0?Math.min(100,Math.round(kr.current/kr.target*100)):0
const objProgress = (obj:Objective) => {
  if (!obj.keyResults.length) return 0
  const totalW = obj.keyResults.reduce((s,kr)=>s+kr.weight,0)
  if (totalW===0) return 0
  return Math.round(obj.keyResults.reduce((s,kr)=>s+(progress(kr)*kr.weight),0)/totalW)
}
const progressColor = (p:number) => p>=80?"#22c55e":p>=60?"#3b82f6":p>=40?"#f59e0b":"#ef4444"

const emptyKR = ():KeyResult => ({ id:Date.now().toString(), text:"", unit:"%", target:100, current:0, weight:1 })
const emptyObj = ():Objective => ({ id:Date.now().toString(), title:"", description:"", owner:"", quarter:"Q2 2026", category:"Stratégique", keyResults:[emptyKR()] })

export default function OKRPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "okr")

  const [objectives, setObjectives] = useState<Objective[]>([])
  const [showForm, setShowForm]     = useState(false)
  const [newObj, setNewObj]         = useState<Objective>(emptyObj())
  const [filterQ, setFilterQ]       = useState("all")
  const [editingKR, setEditingKR]   = useState<{objId:string;krId:string}|null>(null)
  const [editingObj, setEditingObj] = useState<string|null>(null)

  useState(() => { if (data?.objectives?.length) setObjectives(data.objectives) })

  const saveObjs = async (objs:Objective[]) => { setObjectives(objs); await save({ objectives:objs }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération OKR en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"okr", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const raw = json.data?.objectives ?? json.data ?? []
      const enriched:Objective[] = raw.map((o:any,i:number) => ({
        id:"O"+Date.now()+i, title:o.title??o.objective??"Objectif "+(i+1),
        description:o.description??"", owner:o.owner??"", quarter:o.quarter??"Q2 2026",
        category:o.category??"Stratégique",
        keyResults:(o.keyResults??o.key_results??[]).map((kr:any,j:number) => ({
          id:"KR"+Date.now()+i+j, text:kr.text??kr.description??"KR "+(j+1),
          unit:kr.unit??"%", target:kr.target??100, current:kr.current??0, weight:kr.weight??1
        }))
      }))
      await saveObjs(enriched)
      toast.success("OKR générés — "+enriched.length+" objectifs")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const addObjective = () => {
    if (!newObj.title) { toast.error("Titre obligatoire"); return }
    saveObjs([...objectives, { ...newObj, id:"O"+Date.now() }])
    setNewObj(emptyObj()); setShowForm(false)
    toast.success("Objectif ajouté")
  }

  const updateKRCurrent = (objId:string, krId:string, val:number) => {
    saveObjs(objectives.map(o => o.id!==objId?o:{ ...o, keyResults:o.keyResults.map(kr=>kr.id!==krId?kr:{ ...kr, current:val }) }))
  }

  const filtered = filterQ==="all"?objectives:objectives.filter(o=>o.quarter===filterQ)

  // Stats
  const avgProgress = objectives.length ? Math.round(objectives.reduce((s,o)=>s+objProgress(o),0)/objectives.length) : 0
  const onTrack = objectives.filter(o=>objProgress(o)>=70).length
  const atRisk  = objectives.filter(o=>objProgress(o)<40&&objProgress(o)>0).length

  const toRows = () => objectives.flatMap(o => o.keyResults.map(kr => ({ Objectif:o.title, KR:kr.text, Cible:kr.target+" "+kr.unit, Actuel:kr.current+" "+kr.unit, Progression:progress(kr)+"%" })))

  return (
    <AppLayout>
      <ToolLayout title="OKR Tracker" icon="🎯" subtitle="// OBJECTIFS & RÉSULTATS CLÉS"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.objectives) setObjectives(e.data.objectives) }}
        onGenerate={generate} generateLabel="Générer OKR" generating={loading}
        exportRows={toRows()} exportFilename={"OKR_"+(project?.name??"")} projectName={project?.name}>

        {/* KPIs */}
        {objectives.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:16 }}>
            {[
              { label:"Objectifs",     value:objectives.length,                                  color:"var(--primary)" },
              { label:"KRs total",     value:objectives.reduce((s,o)=>s+o.keyResults.length,0),  color:"#3b82f6" },
              { label:"Progression",   value:avgProgress+"%",                                    color:progressColor(avgProgress) },
              { label:"On Track ✅",   value:onTrack,                                            color:"#22c55e" },
              { label:"À risque ⚠️",   value:atRisk,                                             color:"#ef4444" },
            ].map(k => (
              <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filtres + bouton */}
        <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:4 }}>
            {["all",...QUARTERS].map(q => (
              <button key={q} onClick={() => setFilterQ(q)}
                style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterQ===q?"var(--primary)":"var(--border)"), background:filterQ===q?"var(--primary-bg)":"transparent", color:filterQ===q?"var(--primary-light)":"var(--text-3)" }}>
                {q==="all"?"Tous":q}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, padding:"7px 14px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            <Plus size={13}/> Ajouter un objectif
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:12, padding:"16px", marginBottom:16 }}>
            <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>Nouvel objectif</h4>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:8, marginBottom:10 }}>
              {[
                { label:"Titre *", field:"title", placeholder:"Titre de l'objectif" },
                { label:"Responsable", field:"owner", placeholder:"Nom" },
              ].map(f => (
                <div key={f.field}>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>{f.label}</div>
                  <input value={(newObj as any)[f.field]} onChange={e=>setNewObj(p=>({...p,[f.field]:e.target.value}))} placeholder={f.placeholder}
                    style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
                </div>
              ))}
              <div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Trimestre</div>
                <select value={newObj.quarter} onChange={e=>setNewObj(p=>({...p,quarter:e.target.value}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)" }}>
                  {QUARTERS.map(q=><option key={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Catégorie</div>
                <select value={newObj.category} onChange={e=>setNewObj(p=>({...p,category:e.target.value}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)" }}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {/* KRs */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text-2)", marginBottom:6 }}>Key Results</div>
              {newObj.keyResults.map((kr,i) => (
                <div key={kr.id} style={{ display:"grid", gridTemplateColumns:"2fr 60px 80px 80px 60px auto", gap:6, marginBottom:6, alignItems:"center" }}>
                  <input value={kr.text} onChange={e=>setNewObj(p=>({...p,keyResults:p.keyResults.map(k=>k.id===kr.id?{...k,text:e.target.value}:k)}))} placeholder={"KR "+(i+1)+" — Résultat mesurable"}
                    style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)" }}/>
                  <input value={kr.unit} onChange={e=>setNewObj(p=>({...p,keyResults:p.keyResults.map(k=>k.id===kr.id?{...k,unit:e.target.value}:k)}))} placeholder="Unité"
                    style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", textAlign:"center" }}/>
                  <input type="number" value={kr.target} onChange={e=>setNewObj(p=>({...p,keyResults:p.keyResults.map(k=>k.id===kr.id?{...k,target:+e.target.value}:k)}))} placeholder="Cible"
                    style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", textAlign:"center" }}/>
                  <input type="number" value={kr.current} onChange={e=>setNewObj(p=>({...p,keyResults:p.keyResults.map(k=>k.id===kr.id?{...k,current:+e.target.value}:k)}))} placeholder="Actuel"
                    style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", textAlign:"center" }}/>
                  <input type="number" value={kr.weight} onChange={e=>setNewObj(p=>({...p,keyResults:p.keyResults.map(k=>k.id===kr.id?{...k,weight:+e.target.value}:k)}))} min={1} max={5} placeholder="Poids"
                    style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", textAlign:"center" }}/>
                  <button onClick={()=>setNewObj(p=>({...p,keyResults:p.keyResults.filter(k=>k.id!==kr.id)}))} style={{ background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:5, padding:"4px 6px", cursor:"pointer", color:"#ef4444" }}><Trash2 size={10}/></button>
                </div>
              ))}
              <button onClick={()=>setNewObj(p=>({...p,keyResults:[...p.keyResults,emptyKR()]}))} style={{ fontSize:11, color:"var(--primary-light)", background:"transparent", border:"1px dashed rgba(123,94,255,0.3)", borderRadius:6, padding:"4px 12px", cursor:"pointer" }}>
                + Ajouter un KR
              </button>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={addObjective} style={{ padding:"7px 18px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>✓ Créer l'objectif</button>
              <button onClick={() => { setShowForm(false); setNewObj(emptyObj()) }} style={{ padding:"7px 14px", background:"transparent", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>Annuler</button>
            </div>
          </div>
        )}

        {/* Objectifs */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(obj => {
            const pct = objProgress(obj)
            const pColor = progressColor(pct)
            return (
              <div key={obj.id} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
                {/* Obj header */}
                <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:pColor+"22", border:"2px solid "+pColor, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Target size={18} style={{ color:pColor }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    {editingObj===obj.id ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <input value={obj.title} onChange={e=>saveObjs(objectives.map(o=>o.id===obj.id?{...o,title:e.target.value}:o))}
                          style={{ fontSize:12, border:"1px solid var(--primary)", borderRadius:5, padding:"4px 8px", background:"var(--bg)", color:"var(--text-1)", width:"100%" }}/>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5 }}>
                          <input value={obj.owner} onChange={e=>saveObjs(objectives.map(o=>o.id===obj.id?{...o,owner:e.target.value}:o))} placeholder="Responsable"
                            style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"3px 7px", background:"var(--bg)", color:"var(--text-1)" }}/>
                          <select value={obj.quarter} onChange={e=>saveObjs(objectives.map(o=>o.id===obj.id?{...o,quarter:e.target.value}:o))}
                            style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"3px 5px", background:"var(--bg)", color:"var(--text-1)" }}>
                            {QUARTERS.map(q=><option key={q}>{q}</option>)}
                          </select>
                          <select value={obj.category} onChange={e=>saveObjs(objectives.map(o=>o.id===obj.id?{...o,category:e.target.value}:o))}
                            style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"3px 5px", background:"var(--bg)", color:"var(--text-1)" }}>
                            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize:13, fontWeight:800, color:"var(--text-1)", marginBottom:2 }}>{obj.title}</div>
                        <div style={{ display:"flex", gap:8, fontSize:10, color:"var(--text-3)" }}>
                          <span>📅 {obj.quarter}</span>
                          <span>🏷️ {obj.category}</span>
                          {obj.owner && <span>👤 {obj.owner}</span>}
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ textAlign:"center", flexShrink:0 }}>
                    <div style={{ fontSize:22, fontWeight:900, color:pColor }}>{pct}%</div>
                    <div style={{ fontSize:9, color:"var(--text-3)" }}>progression</div>
                  </div>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    {editingObj===obj.id ? (
                      <button onClick={()=>setEditingObj(null)} style={{ padding:"4px 7px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:6, cursor:"pointer" }}><Check size={11}/></button>
                    ) : (
                      <button onClick={()=>setEditingObj(obj.id)} style={{ padding:"4px 6px", background:"transparent", border:"1px solid var(--border)", borderRadius:6, cursor:"pointer", color:"var(--text-3)" }}><Pencil size={11}/></button>
                    )}
                    <button onClick={() => saveObjs(objectives.filter(o=>o.id!==obj.id))} style={{ padding:"4px 6px", background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, cursor:"pointer", color:"#ef4444" }}><Trash2 size={11}/></button>
                  </div>
                </div>
                {/* Barre globale */}
                <div style={{ height:4, background:"var(--bg)", overflow:"hidden" }}>
                  <div style={{ width:pct+"%", height:"100%", background:pColor, transition:"width 0.4s" }}/>
                </div>
                {/* KRs */}
                <div style={{ padding:"10px 16px" }}>
                  {obj.keyResults.map((kr, ki) => {
                    const kPct = progress(kr)
                    const kColor = progressColor(kPct)
                    return (
                      <div key={kr.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:ki<obj.keyResults.length-1?"1px solid var(--border)":"none" }}>
                        <span style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", flexShrink:0, minWidth:28 }}>KR{ki+1}</span>
                        {editingObj===obj.id ? (
                          <input value={kr.text} onChange={e=>saveObjs(objectives.map(o=>o.id!==obj.id?o:{...o,keyResults:o.keyResults.map(k=>k.id===kr.id?{...k,text:e.target.value}:k)}))}
                            style={{ flex:1, fontSize:11, border:"1px solid var(--border)", borderRadius:5, padding:"2px 6px", background:"var(--bg)", color:"var(--text-1)" }}/>
                        ) : (
                          <span style={{ flex:1, fontSize:11, color:"var(--text-1)" }}>{kr.text}</span>
                        )}
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                          <input type="number" value={kr.current} min={0} max={kr.target}
                            onChange={e => updateKRCurrent(obj.id, kr.id, +e.target.value)}
                            style={{ width:60, fontSize:11, fontWeight:700, border:"1px solid "+kColor+"44", borderRadius:5, padding:"2px 6px", background:"var(--bg)", color:kColor, textAlign:"center" }}/>
                          <span style={{ fontSize:10, color:"var(--text-3)" }}>/ {kr.target} {kr.unit}</span>
                          <div style={{ width:60, height:5, background:"var(--bg-card)", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ width:kPct+"%", height:"100%", background:kColor, borderRadius:3 }}/>
                          </div>
                          <span style={{ fontSize:10, fontWeight:700, color:kColor, minWidth:30 }}>{kPct}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {objectives.length === 0 && !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucun OKR défini</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez ou créez vos objectifs et résultats clés</p>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
