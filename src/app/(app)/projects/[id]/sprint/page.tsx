"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"

interface UserStory { id:string; title:string; points:number; status:"À faire"|"En cours"|"Terminé"|"Bloqué"; assignee:string; priority:"Critique"|"Haute"|"Moyenne"|"Faible" }
interface SprintReview { id:string; num:number; goal:string; startDate:string; endDate:string; velocity:number; plannedPoints:number; completedPoints:number; stories:UserStory[]; demo:string; retro:{ bien:string[]; ameliorer:string[]; actions:string[] } }

const STA_CFG: Record<string, { color:string; bg:string }> = {
  "À faire":  { color:"#64748b", bg:"rgba(100,116,139,0.1)" },
  "En cours": { color:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
  "Terminé":  { color:"#22c55e", bg:"rgba(34,197,94,0.1)" },
  "Bloqué":   { color:"#ef4444", bg:"rgba(239,68,68,0.1)" },
}
const PRI_CFG: Record<string, { color:string }> = {
  "Critique":{ color:"#ef4444" }, "Haute":{ color:"#f97316" }, "Moyenne":{ color:"#f59e0b" }, "Faible":{ color:"#22c55e" }
}

const emptyStory = ():UserStory => ({ id:Date.now().toString(), title:"", points:3, status:"À faire", assignee:"", priority:"Moyenne" })
const emptySprint = (num:number):SprintReview => ({
  id:"S"+Date.now(), num, goal:"", startDate:"", endDate:"",
  velocity:0, plannedPoints:0, completedPoints:0, stories:[],
  demo:"", retro:{ bien:[""], ameliorer:[""], actions:[""] }
})

export default function SprintPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "sprint")

  const [sprints, setSprints]     = useState<SprintReview[]>([])
  const [activeSprint, setActive] = useState<string|null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newSprint, setNewSprint] = useState<SprintReview>(emptySprint(1))

  useState(() => {
    if (data?.sprints?.length) {
      setSprints(data.sprints)
      setActive(data.sprints[0]?.id ?? null)
    }
  })

  const saveSprints = async (sp:SprintReview[]) => { setSprints(sp); await save({ sprints:sp }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Sprint en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"sprint", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const raw = json.data?.sprints ?? [json.data]
      const enriched:SprintReview[] = raw.map((s:any,i:number) => ({
        id:"S"+Date.now()+i, num:s.num??i+1,
        goal:s.goal??s.objectif??"", startDate:s.startDate??s.start??"", endDate:s.endDate??s.end??"",
        velocity:s.velocity??0, plannedPoints:s.plannedPoints??s.planned??0, completedPoints:s.completedPoints??s.completed??0,
        stories:(s.stories??s.userStories??[]).map((us:any,j:number) => ({
          id:"US"+Date.now()+i+j, title:us.title??us.name??"US "+(j+1), points:us.points??3,
          status:us.status??"À faire", assignee:us.assignee??us.responsable??"", priority:us.priority??"Moyenne"
        })),
        demo:s.demo??"", retro:s.retro??{ bien:[""], ameliorer:[""], actions:[""] }
      }))
      await saveSprints(enriched)
      if (enriched.length) setActive(enriched[0].id)
      toast.success(enriched.length+" sprint(s) généré(s)")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const addSprint = () => {
    if (!newSprint.goal) { toast.error("Objectif du sprint obligatoire"); return }
    const sp = { ...newSprint, id:"S"+Date.now(), num:sprints.length+1 }
    saveSprints([...sprints, sp])
    setActive(sp.id); setShowNew(false); setNewSprint(emptySprint(sprints.length+2))
    toast.success("Sprint "+sp.num+" créé")
  }

  const updateStoryStatus = (spId:string, stId:string, status:UserStory["status"]) => {
    saveSprints(sprints.map(sp => sp.id!==spId?sp:{ ...sp, stories:sp.stories.map(s=>s.id!==stId?s:{ ...s, status }) }))
  }

  const addStory = (spId:string) => {
    saveSprints(sprints.map(sp => sp.id!==spId?sp:{ ...sp, stories:[...sp.stories, emptyStory()] }))
  }

  const current = sprints.find(s=>s.id===activeSprint)
  const burndown = current ? Math.round((current.completedPoints/Math.max(1,current.plannedPoints))*100) : 0

  const toRows = () => sprints.flatMap(sp => sp.stories.map(s => ({ Sprint:"S"+sp.num, Story:s.title, Points:s.points, Statut:s.status, Priorité:s.priority, Assigné:s.assignee })))

  return (
    <AppLayout>
      <ToolLayout title="Revue de Sprint" icon="🔄" subtitle="// AGILE / SAFe"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.sprints) { setSprints(e.data.sprints); setActive(e.data.sprints[0]?.id??null) } }}
        onGenerate={generate} generateLabel="Générer Sprint" generating={loading}
        exportRows={toRows()} exportFilename={"Sprint_"+(project?.name??"")} projectName={project?.name}>

        {/* KPIs globaux */}
        {sprints.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:16 }}>
            {[
              { label:"Sprints",      value:sprints.length,                                                              color:"var(--primary)" },
              { label:"Stories total",value:sprints.reduce((s,sp)=>s+sp.stories.length,0),                              color:"#3b82f6" },
              { label:"Terminées",    value:sprints.reduce((s,sp)=>s+sp.stories.filter(st=>st.status==="Terminé").length,0), color:"#22c55e" },
              { label:"Bloquées",     value:sprints.reduce((s,sp)=>s+sp.stories.filter(st=>st.status==="Bloqué").length,0),  color:"#ef4444" },
              { label:"Points livrés",value:sprints.reduce((s,sp)=>s+sp.completedPoints,0),                             color:"#f59e0b" },
              { label:"Vélocité moy.",value:sprints.length?Math.round(sprints.reduce((s,sp)=>s+sp.completedPoints,0)/sprints.length):0, color:"#22c55e" },
            ].map(k => (
              <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:14 }}>
          {/* Liste sprints */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {sprints.map(sp => {
              const pct = Math.round(sp.stories.filter(s=>s.status==="Terminé").length/Math.max(1,sp.stories.length)*100)
              const isActive = activeSprint===sp.id
              return (
                <button key={sp.id} onClick={() => setActive(sp.id)}
                  style={{ textAlign:"left", padding:"10px 12px", border:"1px solid "+(isActive?"var(--primary)":"var(--border)"), borderRadius:9, background:isActive?"var(--primary-bg)":"var(--bg-card)", cursor:"pointer" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:isActive?"var(--primary-light)":"var(--text-1)", marginBottom:4 }}>Sprint {sp.num}</div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sp.goal||"—"}</div>
                  <div style={{ height:4, background:"var(--bg)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ width:pct+"%", height:"100%", background:"#22c55e", borderRadius:2 }}/>
                  </div>
                  <div style={{ fontSize:9, color:"var(--text-3)", marginTop:2 }}>{pct}% terminé · {sp.stories.length} stories</div>
                </button>
              )
            })}
            <button onClick={() => setShowNew(!showNew)} style={{ padding:"8px 12px", border:"1px dashed var(--border)", borderRadius:9, background:"transparent", cursor:"pointer", color:"var(--text-3)", fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
              <Plus size={12}/> Nouveau sprint
            </button>
          </div>

          {/* Détail sprint actif */}
          <div>
            {showNew && (
              <div style={{ background:"var(--bg-card)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:12, padding:"14px 16px", marginBottom:14 }}>
                <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 10px" }}>Nouveau sprint</h4>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Objectif *</div>
                    <input value={newSprint.goal} onChange={e=>setNewSprint(p=>({...p,goal:e.target.value}))} placeholder="Objectif du sprint" style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Début</div>
                    <input type="date" value={newSprint.startDate} onChange={e=>setNewSprint(p=>({...p,startDate:e.target.value}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Fin</div>
                    <input type="date" value={newSprint.endDate} onChange={e=>setNewSprint(p=>({...p,endDate:e.target.value}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Points planifiés</div>
                    <input type="number" value={newSprint.plannedPoints} onChange={e=>setNewSprint(p=>({...p,plannedPoints:+e.target.value}))} style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ display:"flex", alignItems:"flex-end" }}>
                    <button onClick={addSprint} style={{ width:"100%", padding:"6px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer" }}>Créer</button>
                  </div>
                </div>
              </div>
            )}

            {current && (
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
                {/* Sprint header */}
                <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", background:"rgba(123,94,255,0.06)", display:"flex", alignItems:"center", gap:12 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:"var(--primary-light)" }}>Sprint {current.num}</div>
                    <div style={{ fontSize:11, color:"var(--text-2)", marginTop:2 }}>{current.goal}</div>
                    {(current.startDate||current.endDate) && <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{current.startDate} → {current.endDate}</div>}
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", gap:12 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:16, fontWeight:800, color:"#22c55e" }}>{current.completedPoints}<span style={{ fontSize:10, color:"var(--text-3)" }}>/{current.plannedPoints}</span></div>
                      <div style={{ fontSize:9, color:"var(--text-3)" }}>points livrés</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:16, fontWeight:800, color:burndown>=80?"#22c55e":burndown>=50?"#f59e0b":"#ef4444" }}>{burndown}%</div>
                      <div style={{ fontSize:9, color:"var(--text-3)" }}>burndown</div>
                    </div>
                  </div>
                </div>

                {/* Board Kanban */}
                <div style={{ padding:"12px 16px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
                    {(["À faire","En cours","Terminé","Bloqué"] as const).map(col => {
                      const colStories = current.stories.filter(s=>s.status===col)
                      const cfg = STA_CFG[col]
                      return (
                        <div key={col} style={{ background:cfg.bg, borderRadius:9, padding:"8px 10px", minHeight:80 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:cfg.color }}>{col}</span>
                            <span style={{ fontSize:10, fontWeight:700, color:cfg.color, background:cfg.color+"22", padding:"1px 6px", borderRadius:8 }}>{colStories.length}</span>
                          </div>
                          {colStories.map(s => (
                            <div key={s.id} style={{ padding:"6px 8px", background:"var(--bg-card)", borderRadius:6, marginBottom:5, border:"1px solid var(--border)", cursor:"pointer" }}>
                              <div style={{ fontSize:10, fontWeight:600, color:"var(--text-1)", marginBottom:3, lineHeight:1.3 }}>{s.title}</div>
                              <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                                <span style={{ fontSize:9, padding:"1px 5px", borderRadius:4, background:PRI_CFG[s.priority]?.color+"22", color:PRI_CFG[s.priority]?.color, fontWeight:600 }}>{s.priority}</span>
                                <span style={{ fontSize:9, color:"var(--text-3)", marginLeft:"auto" }}>{s.points}pts</span>
                              </div>
                              {s.assignee && <div style={{ fontSize:9, color:"var(--text-3)", marginTop:2 }}>👤 {s.assignee}</div>}
                              {/* Quick status change */}
                              <select value={s.status} onChange={e=>updateStoryStatus(current.id,s.id,e.target.value as any)}
                                style={{ width:"100%", fontSize:9, marginTop:4, border:"1px solid var(--border)", borderRadius:4, padding:"1px 3px", background:"var(--bg)", color:"var(--text-2)" }}>
                                {["À faire","En cours","Terminé","Bloqué"].map(v=><option key={v}>{v}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>

                  {/* Ajouter story */}
                  <button onClick={() => addStory(current.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", border:"1px dashed var(--border)", borderRadius:7, background:"transparent", cursor:"pointer", color:"var(--text-3)", fontSize:11, marginBottom:12 }}>
                    <Plus size={11}/> Ajouter une user story
                  </button>

                  {/* Rétrospective */}
                  <div style={{ background:"rgba(123,94,255,0.06)", border:"1px solid rgba(123,94,255,0.2)", borderRadius:9, padding:"10px 12px" }}>
                    <h4 style={{ fontSize:12, fontWeight:700, color:"var(--primary-light)", margin:"0 0 8px" }}>🔄 Rétrospective Sprint {current.num}</h4>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                      {[
                        { key:"bien",      label:"✅ Ce qui a bien marché",  color:"#22c55e" },
                        { key:"ameliorer", label:"⚠️ À améliorer",           color:"#f59e0b" },
                        { key:"actions",   label:"🎯 Actions pour le prochain",color:"#3b82f6" },
                      ].map(col => (
                        <div key={col.key}>
                          <div style={{ fontSize:10, fontWeight:600, color:col.color, marginBottom:5 }}>{col.label}</div>
                          {(current.retro[col.key as keyof typeof current.retro] as string[]).map((item,i) => (
                            <input key={i} value={item}
                              onChange={e => {
                                const arr = [...(current.retro[col.key as keyof typeof current.retro] as string[])]
                                arr[i] = e.target.value
                                saveSprints(sprints.map(sp=>sp.id!==current.id?sp:{ ...sp, retro:{ ...sp.retro, [col.key]:arr } }))
                              }}
                              placeholder={"Point "+(i+1)}
                              style={{ width:"100%", fontSize:10, border:"1px solid var(--border)", borderRadius:5, padding:"4px 7px", background:"var(--bg)", color:"var(--text-1)", marginBottom:4, boxSizing:"border-box" }}/>
                          ))}
                          <button onClick={() => {
                            const arr = [...(current.retro[col.key as keyof typeof current.retro] as string[]), ""]
                            saveSprints(sprints.map(sp=>sp.id!==current.id?sp:{ ...sp, retro:{ ...sp.retro, [col.key]:arr } }))
                          }} style={{ fontSize:10, color:col.color, background:"transparent", border:"none", cursor:"pointer", padding:"2px 0" }}>+ Ajouter</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!current && !showNew && (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔄</div>
                <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucun sprint sélectionné</p>
                <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez ou créez votre premier sprint</p>
              </div>
            )}
          </div>
        </div>
      </ToolLayout>
    </AppLayout>
  )
}
