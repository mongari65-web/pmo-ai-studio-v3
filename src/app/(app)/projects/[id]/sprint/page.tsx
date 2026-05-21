"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Plus, Trash2, Target, Zap, BarChart2, FlaskConical, ListChecks, Kanban } from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────────────
interface UserStory {
  id:string; epic:string; title:string; description:string;
  points:number; status:"À faire"|"En cours"|"Terminé"|"Bloqué";
  assignee:string; priority:"Critique"|"Haute"|"Moyenne"|"Faible";
  sprintId:string; acceptanceCriteria:string; testType:"BDD"|"TDD"|"Manuel"|"";
}
interface SprintReview {
  id:string; num:number; goal:string; startDate:string; endDate:string;
  velocity:number; plannedPoints:number; completedPoints:number;
  stories:UserStory[]; demo:string;
  retro:{ bien:string[]; ameliorer:string[]; actions:string[] }
}

const STA_CFG: Record<string,{color:string;bg:string}> = {
  "À faire": {color:"#64748b",bg:"rgba(100,116,139,0.1)"},
  "En cours":{color:"#f59e0b",bg:"rgba(245,158,11,0.12)"},
  "Terminé": {color:"#22c55e",bg:"rgba(34,197,94,0.12)"},
  "Bloqué":  {color:"#ef4444",bg:"rgba(239,68,68,0.12)"},
}
const PRI_CFG: Record<string,{color:string}> = {
  "Critique":{color:"#ef4444"},"Haute":{color:"#f97316"},"Moyenne":{color:"#f59e0b"},"Faible":{color:"#22c55e"}
}
const TEST_CFG: Record<string,{color:string;bg:string}> = {
  "BDD":    {color:"#22c55e",bg:"rgba(34,197,94,0.12)"},
  "TDD":    {color:"#3b82f6",bg:"rgba(59,130,246,0.12)"},
  "Manuel": {color:"#f59e0b",bg:"rgba(245,158,11,0.12)"},
  "":       {color:"#64748b",bg:"rgba(100,116,139,0.08)"},
}

const emptyStory = (sprintId:string="backlog"):UserStory => ({
  id:"US"+Date.now(), epic:"", title:"", description:"", points:3,
  status:"À faire", assignee:"", priority:"Moyenne", sprintId,
  acceptanceCriteria:"", testType:""
})
const emptySprint = (num:number):SprintReview => ({
  id:"S"+Date.now(), num, goal:"", startDate:"", endDate:"",
  velocity:0, plannedPoints:0, completedPoints:0, stories:[],
  demo:"", retro:{bien:[""],ameliorer:[""],actions:[""]}
})

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"backlog",   icon:<ListChecks size={14}/>, label:"Product Backlog",   color:"#7B5EFF" },
  { id:"planning",  icon:<Target size={14}/>,     label:"Sprint Planning",   color:"#22c55e" },
  { id:"kanban",    icon:<Kanban size={14}/>,      label:"Kanban Board",      color:"#06b6d4" },
  { id:"retro",     icon:<Zap size={14}/>,         label:"Rétrospective",     color:"#ef4444" },
  { id:"velocity",  icon:<BarChart2 size={14}/>,   label:"Vélocité",          color:"#f59e0b" },
  { id:"tests",     icon:<FlaskConical size={14}/>,label:"Tests BDD/TDD",     color:"#3b82f6" },
]

// ── Composant principal ───────────────────────────────────────────────────────
export default function SprintPage() {
  const { id } = useParams<{id:string}>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "sprint")

  const [activeTab, setActiveTab]     = useState("backlog")
  const [sprints, setSprints]         = useState<SprintReview[]>([])
  const [backlog, setBacklog]         = useState<UserStory[]>([])
  const [activeSprint, setActive]     = useState<string|null>(null)
  const [showNew, setShowNew]         = useState(false)
  const [newSprint, setNewSprint]     = useState<SprintReview>(emptySprint(1))
  const [editStory, setEditStory]     = useState<string|null>(null)

  useEffect(() => {
    if (data?.sprints?.length) { setSprints(data.sprints); setActive(data.sprints[0]?.id??null) }
    if (data?.backlog?.length) setBacklog(data.backlog)
  }, [data])

  const saveAll = async (sp:SprintReview[], bl:UserStory[]) => {
    setSprints(sp); setBacklog(bl)
    await save({ sprints:sp, backlog:bl })
  }
  const saveSprints = async (sp:SprintReview[]) => saveAll(sp, backlog)
  const saveBacklog = async (bl:UserStory[]) => saveAll(sprints, bl)

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération en cours...")
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
        velocity:s.velocity??0, plannedPoints:s.plannedPoints??s.planned??0,
        completedPoints:s.completedPoints??s.completed??0,
        stories:(s.stories??s.userStories??[]).map((us:any,j:number) => ({
          id:"US"+Date.now()+i+j, epic:us.epic??"", title:us.title??us.name??"US "+(j+1),
          description:us.description??"", points:us.points??3, status:us.status??"À faire",
          assignee:us.assignee??us.responsable??"", priority:us.priority??"Moyenne",
          sprintId:"S"+Date.now()+i,
          acceptanceCriteria:us.acceptanceCriteria??us.criteria??"",
          testType:us.testType??""
        })),
        demo:s.demo??"", retro:s.retro??{bien:[""],ameliorer:[""],actions:[""]}
      }))
      // Générer aussi le backlog
      const bl:UserStory[] = (json.data?.backlog??[]).map((us:any,j:number) => ({
        id:"BL"+Date.now()+j, epic:us.epic??"", title:us.title??us.name??"US "+(j+1),
        description:us.description??"", points:us.points??3, status:"À faire",
        assignee:"", priority:us.priority??"Moyenne", sprintId:"backlog",
        acceptanceCriteria:us.acceptanceCriteria??"", testType:""
      }))
      await saveAll(enriched, bl)
      if (enriched.length) setActive(enriched[0].id)
      toast.success(enriched.length+" sprint(s) + "+bl.length+" stories backlog générés")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const current = sprints.find(s=>s.id===activeSprint)
  const allStories = sprints.flatMap(s=>s.stories)
  const totalPts   = sprints.reduce((s,sp)=>s+sp.completedPoints,0)
  const avgVel     = sprints.length ? Math.round(totalPts/sprints.length) : 0

  const toRows = () => sprints.flatMap(sp=>sp.stories.map(s=>({
    Sprint:"S"+sp.num, Story:s.title, Epic:s.epic, Points:s.points,
    Statut:s.status, Priorité:s.priority, Assigné:s.assignee, Test:s.testType
  })))

  // ── KPIs globaux ───────────────────────────────────────────────────────────
  const KPIs = [
    {label:"Sprints",       value:sprints.length,                                                           color:"var(--primary)"},
    {label:"Backlog",       value:backlog.length,                                                           color:"#7B5EFF"},
    {label:"Stories total", value:allStories.length,                                                        color:"#3b82f6"},
    {label:"Terminées",     value:allStories.filter(s=>s.status==="Terminé").length,                       color:"#22c55e"},
    {label:"Bloquées",      value:allStories.filter(s=>s.status==="Bloqué").length,                        color:"#ef4444"},
    {label:"Vélocité moy.", value:avgVel,                                                                   color:"#f59e0b"},
  ]

  return (
    <AppLayout>
      <ToolLayout title="Agile / Scrum" icon="🔄" subtitle="// SPRINT · BACKLOG · KANBAN · RETRO · VÉLOCITÉ · TESTS"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if(e.data?.sprints){setSprints(e.data.sprints);setActive(e.data.sprints[0]?.id??null)} if(e.data?.backlog)setBacklog(e.data.backlog) }}
        onGenerate={generate} generateLabel="Générer IA" generating={loading}
        exportRows={toRows()} exportFilename={"Sprint_"+(project?.name??"")}
        projectName={project?.name} gammaType="scrum" gammaData={data}>

        {/* KPIs */}
        {(sprints.length > 0 || backlog.length > 0) && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:16}}>
            {KPIs.map(k => (
              <div key={k.label} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:k.color}}>{k.value}</div>
                <div style={{fontSize:10,color:"var(--text-3)",marginTop:2}}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Onglets */}
        <div style={{display:"flex",gap:4,marginBottom:16,borderBottom:"1px solid var(--border)",paddingBottom:0,overflowX:"auto"}}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",border:"none",borderBottom:activeTab===tab.id?`2px solid ${tab.color}`:"2px solid transparent",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:activeTab===tab.id?700:400,color:activeTab===tab.id?tab.color:"var(--text-3)",whiteSpace:"nowrap",transition:"all 0.15s",marginBottom:-1}}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1 : PRODUCT BACKLOG ── */}
        {activeTab==="backlog" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text-1)"}}>📋 Product Backlog — {backlog.length} items</div>
              <button onClick={()=>saveBacklog([...backlog,emptyStory()])}
                style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",background:"var(--primary)",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                <Plus size={12}/> Ajouter Story
              </button>
            </div>
            {backlog.length===0 && (
              <div style={{textAlign:"center",padding:"40px",color:"var(--text-3)",fontSize:13}}>
                <div style={{fontSize:40,marginBottom:12}}>📋</div>
                Backlog vide — Générez avec l'IA ou ajoutez manuellement
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {backlog.map((story,i) => (
                <div key={story.id} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1}}>
                    {editStory===story.id ? (
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <input value={story.epic} onChange={e=>{const bl=[...backlog];bl[i]={...bl[i],epic:e.target.value};saveBacklog(bl)}}
                          placeholder="Epic" style={{fontSize:11,border:"1px solid var(--border)",borderRadius:5,padding:"3px 8px",background:"var(--bg)",color:"var(--text-1)"}}/>
                        <input value={story.title} onChange={e=>{const bl=[...backlog];bl[i]={...bl[i],title:e.target.value};saveBacklog(bl)}}
                          placeholder="En tant que... je veux... afin de..." style={{fontSize:12,border:"1px solid var(--primary)",borderRadius:5,padding:"5px 8px",background:"var(--bg)",color:"var(--text-1)",width:"100%",boxSizing:"border-box"}}/>
                        <textarea value={story.acceptanceCriteria} onChange={e=>{const bl=[...backlog];bl[i]={...bl[i],acceptanceCriteria:e.target.value};saveBacklog(bl)}}
                          placeholder="Critères d'acceptation / Scénarios BDD (Given/When/Then)" rows={3}
                          style={{fontSize:11,border:"1px solid var(--border)",borderRadius:5,padding:"5px 8px",background:"var(--bg)",color:"var(--text-1)",resize:"vertical",width:"100%",boxSizing:"border-box"}}/>
                        <div style={{display:"flex",gap:6}}>
                          <select value={story.priority} onChange={e=>{const bl=[...backlog];bl[i]={...bl[i],priority:e.target.value as any};saveBacklog(bl)}}
                            style={{fontSize:11,border:"1px solid var(--border)",borderRadius:5,padding:"3px 6px",background:"var(--bg)",color:"var(--text-1)"}}>
                            {["Critique","Haute","Moyenne","Faible"].map(p=><option key={p}>{p}</option>)}
                          </select>
                          <input type="number" value={story.points} onChange={e=>{const bl=[...backlog];bl[i]={...bl[i],points:+e.target.value};saveBacklog(bl)}}
                            style={{width:60,fontSize:11,border:"1px solid var(--border)",borderRadius:5,padding:"3px 6px",background:"var(--bg)",color:"var(--text-1)"}}/>
                          <select value={story.testType} onChange={e=>{const bl=[...backlog];bl[i]={...bl[i],testType:e.target.value as any};saveBacklog(bl)}}
                            style={{fontSize:11,border:"1px solid var(--border)",borderRadius:5,padding:"3px 6px",background:"var(--bg)",color:"var(--text-1)"}}>
                            <option value="">Test</option>
                            {["BDD","TDD","Manuel"].map(t=><option key={t}>{t}</option>)}
                          </select>
                          <button onClick={()=>setEditStory(null)} style={{padding:"3px 10px",background:"#22c55e",color:"#fff",border:"none",borderRadius:5,fontSize:11,cursor:"pointer"}}>✓</button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={()=>setEditStory(story.id)} style={{cursor:"pointer"}}>
                        {story.epic && <div style={{fontSize:9,fontWeight:700,color:"var(--primary-light)",marginBottom:2}}>📌 {story.epic}</div>}
                        <div style={{fontSize:12,fontWeight:600,color:"var(--text-1)",marginBottom:4}}>{story.title||"(Cliquez pour éditer)"}</div>
                        {story.acceptanceCriteria && <div style={{fontSize:10,color:"var(--text-3)",fontStyle:"italic",marginBottom:4}}>{story.acceptanceCriteria.slice(0,80)}...</div>}
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:PRI_CFG[story.priority]?.color+"22",color:PRI_CFG[story.priority]?.color,fontWeight:700}}>{story.priority}</span>
                          <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:"rgba(123,94,255,0.1)",color:"var(--primary-light)"}}>{story.points} pts</span>
                          {story.testType && <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:TEST_CFG[story.testType]?.bg,color:TEST_CFG[story.testType]?.color,fontWeight:700}}>{story.testType}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={()=>saveBacklog(backlog.filter((_,j)=>j!==i))}
                    style={{background:"transparent",border:"none",cursor:"pointer",color:"#ef4444",padding:4,flexShrink:0}}>
                    <Trash2 size={12}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2 : SPRINT PLANNING ── */}
        {activeTab==="planning" && (
          <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {sprints.map(sp => {
                const pct = Math.round(sp.stories.filter(s=>s.status==="Terminé").length/Math.max(1,sp.stories.length)*100)
                const isA = activeSprint===sp.id
                return (
                  <button key={sp.id} onClick={()=>setActive(sp.id)}
                    style={{textAlign:"left",padding:"10px 12px",border:"1px solid "+(isA?"var(--primary)":"var(--border)"),borderRadius:9,background:isA?"var(--primary-bg)":"var(--bg-card)",cursor:"pointer"}}>
                    <div style={{fontSize:12,fontWeight:700,color:isA?"var(--primary-light)":"var(--text-1)",marginBottom:2}}>Sprint {sp.num}</div>
                    <div style={{fontSize:10,color:"var(--text-3)",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sp.goal||"—"}</div>
                    <div style={{height:3,background:"var(--bg)",borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:pct+"%",height:"100%",background:"#22c55e",borderRadius:2}}/>
                    </div>
                    <div style={{fontSize:9,color:"var(--text-3)",marginTop:2}}>{pct}% · {sp.stories.length} stories · {sp.plannedPoints}pts</div>
                  </button>
                )
              })}
              <button onClick={()=>setShowNew(!showNew)}
                style={{padding:"8px 12px",border:"1px dashed var(--border)",borderRadius:9,background:"transparent",cursor:"pointer",color:"var(--text-3)",fontSize:12,display:"flex",alignItems:"center",gap:5}}>
                <Plus size={12}/> Nouveau sprint
              </button>
            </div>
            <div>
              {showNew && (
                <div style={{background:"var(--bg-card)",border:"1px solid rgba(123,94,255,0.3)",borderRadius:12,padding:"14px 16px",marginBottom:14}}>
                  <h4 style={{fontSize:13,fontWeight:700,color:"var(--text-1)",margin:"0 0 10px"}}>Nouveau Sprint</h4>
                  <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    <div>
                      <div style={{fontSize:10,color:"var(--text-3)",marginBottom:3}}>Sprint Goal *</div>
                      <input value={newSprint.goal} onChange={e=>setNewSprint(p=>({...p,goal:e.target.value}))}
                        placeholder="Objectif du sprint" style={{width:"100%",fontSize:11,border:"1px solid var(--border)",borderRadius:6,padding:"5px 8px",background:"var(--bg)",color:"var(--text-1)",boxSizing:"border-box"}}/>
                    </div>
                    <div><div style={{fontSize:10,color:"var(--text-3)",marginBottom:3}}>Début</div>
                      <input type="date" value={newSprint.startDate} onChange={e=>setNewSprint(p=>({...p,startDate:e.target.value}))} style={{width:"100%",fontSize:11,border:"1px solid var(--border)",borderRadius:6,padding:"5px 8px",background:"var(--bg)",color:"var(--text-1)",boxSizing:"border-box"}}/>
                    </div>
                    <div><div style={{fontSize:10,color:"var(--text-3)",marginBottom:3}}>Fin</div>
                      <input type="date" value={newSprint.endDate} onChange={e=>setNewSprint(p=>({...p,endDate:e.target.value}))} style={{width:"100%",fontSize:11,border:"1px solid var(--border)",borderRadius:6,padding:"5px 8px",background:"var(--bg)",color:"var(--text-1)",boxSizing:"border-box"}}/>
                    </div>
                    <div><div style={{fontSize:10,color:"var(--text-3)",marginBottom:3}}>Points</div>
                      <input type="number" value={newSprint.plannedPoints} onChange={e=>setNewSprint(p=>({...p,plannedPoints:+e.target.value}))} style={{width:"100%",fontSize:11,border:"1px solid var(--border)",borderRadius:6,padding:"5px 8px",background:"var(--bg)",color:"var(--text-1)",boxSizing:"border-box"}}/>
                    </div>
                    <div style={{display:"flex",alignItems:"flex-end"}}>
                      <button onClick={()=>{
                        if(!newSprint.goal){toast.error("Sprint Goal obligatoire");return}
                        const sp={...newSprint,id:"S"+Date.now(),num:sprints.length+1}
                        saveSprints([...sprints,sp]); setActive(sp.id); setShowNew(false)
                        setNewSprint(emptySprint(sprints.length+2)); toast.success("Sprint "+sp.num+" créé")
                      }} style={{width:"100%",padding:"6px",background:"var(--primary)",color:"#fff",border:"none",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer"}}>Créer</button>
                    </div>
                  </div>
                </div>
              )}
              {current && (
                <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,paddingBottom:10,borderBottom:"1px solid var(--border)"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:800,color:"var(--primary-light)"}}>Sprint {current.num} — {current.goal}</div>
                      <div style={{fontSize:11,color:"var(--text-3)",marginTop:2}}>{current.startDate} → {current.endDate}</div>
                    </div>
                    <div style={{display:"flex",gap:14}}>
                      {[{l:"Points planifiés",v:current.plannedPoints,c:"#3b82f6"},{l:"Points livrés",v:current.completedPoints,c:"#22c55e"},{l:"Stories",v:current.stories.length,c:"var(--primary)"}].map(k=>(
                        <div key={k.l} style={{textAlign:"center"}}>
                          <div style={{fontSize:18,fontWeight:800,color:k.c}}>{k.v}</div>
                          <div style={{fontSize:9,color:"var(--text-3)"}}>{k.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Stories du sprint */}
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {current.stories.map((s,i) => (
                      <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"var(--bg)",borderRadius:7,border:"1px solid var(--border)"}}>
                        <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:PRI_CFG[s.priority]?.color+"22",color:PRI_CFG[s.priority]?.color,fontWeight:700,flexShrink:0}}>{s.priority}</span>
                        <span style={{fontSize:12,color:"var(--text-1)",flex:1}}>{s.title}</span>
                        {s.testType && <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:TEST_CFG[s.testType]?.bg,color:TEST_CFG[s.testType]?.color,fontWeight:700}}>{s.testType}</span>}
                        <span style={{fontSize:10,color:"var(--text-3)",flexShrink:0}}>{s.points}pts</span>
                        <select value={s.status} onChange={e=>saveSprints(sprints.map(sp=>sp.id!==current.id?sp:{...sp,stories:sp.stories.map((st,j)=>j===i?{...st,status:e.target.value as any}:st)}))}
                          style={{fontSize:10,border:"1px solid var(--border)",borderRadius:5,padding:"2px 4px",background:`${STA_CFG[s.status]?.bg}`,color:STA_CFG[s.status]?.color,fontWeight:600}}>
                          {["À faire","En cours","Terminé","Bloqué"].map(v=><option key={v}>{v}</option>)}
                        </select>
                      </div>
                    ))}
                    <button onClick={()=>saveSprints(sprints.map(sp=>sp.id!==current.id?sp:{...sp,stories:[...sp.stories,emptyStory(current.id)]}))}
                      style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",border:"1px dashed var(--border)",borderRadius:7,background:"transparent",cursor:"pointer",color:"var(--text-3)",fontSize:11}}>
                      <Plus size={11}/> Ajouter une User Story
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3 : KANBAN ── */}
        {activeTab==="kanban" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{fontSize:13,fontWeight:700,color:"var(--text-1)"}}>🗂️ Kanban Board</span>
              <select value={activeSprint??""} onChange={e=>setActive(e.target.value)}
                style={{fontSize:11,border:"1px solid var(--border)",borderRadius:6,padding:"4px 8px",background:"var(--bg)",color:"var(--text-1)"}}>
                {sprints.map(sp=><option key={sp.id} value={sp.id}>Sprint {sp.num} — {sp.goal}</option>)}
              </select>
            </div>
            {current ? (
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {(["À faire","En cours","Terminé","Bloqué"] as const).map(col => {
                  const colS = current.stories.filter(s=>s.status===col)
                  const cfg = STA_CFG[col]
                  return (
                    <div key={col} style={{background:cfg.bg,borderRadius:10,padding:"10px 10px",minHeight:200}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <span style={{fontSize:12,fontWeight:700,color:cfg.color}}>{col}</span>
                        <span style={{fontSize:11,fontWeight:700,color:cfg.color,background:cfg.color+"22",padding:"2px 8px",borderRadius:10}}>{colS.length}</span>
                      </div>
                      {colS.map(s => (
                        <div key={s.id} style={{padding:"8px 10px",background:"var(--bg-card)",borderRadius:8,marginBottom:7,border:"1px solid var(--border)",boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}}>
                          {s.epic && <div style={{fontSize:8,fontWeight:700,color:"var(--primary-light)",marginBottom:2}}>{s.epic}</div>}
                          <div style={{fontSize:11,fontWeight:600,color:"var(--text-1)",marginBottom:5,lineHeight:1.4}}>{s.title}</div>
                          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                            <span style={{fontSize:8,padding:"1px 5px",borderRadius:4,background:PRI_CFG[s.priority]?.color+"22",color:PRI_CFG[s.priority]?.color,fontWeight:700}}>{s.priority}</span>
                            <span style={{fontSize:8,padding:"1px 5px",borderRadius:4,background:"rgba(123,94,255,0.1)",color:"var(--primary-light)"}}>{s.points}pts</span>
                            {s.testType && <span style={{fontSize:8,padding:"1px 5px",borderRadius:4,background:TEST_CFG[s.testType]?.bg,color:TEST_CFG[s.testType]?.color,fontWeight:700}}>{s.testType}</span>}
                          </div>
                          {s.assignee && <div style={{fontSize:9,color:"var(--text-3)",marginTop:4}}>👤 {s.assignee}</div>}
                          <select value={s.status} onChange={e=>saveSprints(sprints.map(sp=>sp.id!==current.id?sp:{...sp,stories:sp.stories.map(st=>st.id!==s.id?st:{...st,status:e.target.value as any})}))}
                            style={{width:"100%",fontSize:9,marginTop:6,border:"1px solid var(--border)",borderRadius:4,padding:"2px 4px",background:"var(--bg)",color:cfg.color,fontWeight:600}}>
                            {["À faire","En cours","Terminé","Bloqué"].map(v=><option key={v}>{v}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ) : <div style={{textAlign:"center",padding:40,color:"var(--text-3)"}}>Créez d'abord un sprint</div>}
          </div>
        )}

        {/* ── TAB 4 : RÉTROSPECTIVE ── */}
        {activeTab==="retro" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span style={{fontSize:13,fontWeight:700,color:"var(--text-1)"}}>🔄 Rétrospective</span>
              <select value={activeSprint??""} onChange={e=>setActive(e.target.value)}
                style={{fontSize:11,border:"1px solid var(--border)",borderRadius:6,padding:"4px 8px",background:"var(--bg)",color:"var(--text-1)"}}>
                {sprints.map(sp=><option key={sp.id} value={sp.id}>Sprint {sp.num} — {sp.goal}</option>)}
              </select>
            </div>
            {current ? (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                {[
                  {key:"bien",      label:"✅ Ce qui a bien marché",      color:"#22c55e", placeholder:"Ex: bonne communication équipe"},
                  {key:"ameliorer", label:"⚠️ À améliorer",               color:"#f59e0b", placeholder:"Ex: estimations trop optimistes"},
                  {key:"actions",   label:"🎯 Actions sprint suivant",     color:"#3b82f6", placeholder:"Ex: faire du mob programming"},
                ].map(col => (
                  <div key={col.key} style={{background:"var(--bg-card)",border:`1px solid ${col.color}33`,borderRadius:12,padding:"14px 16px"}}>
                    <div style={{fontSize:13,fontWeight:700,color:col.color,marginBottom:12}}>{col.label}</div>
                    {(current.retro[col.key as keyof typeof current.retro] as string[]).map((item,i) => (
                      <div key={i} style={{display:"flex",gap:5,marginBottom:6}}>
                        <input value={item}
                          onChange={e=>{
                            const arr=[...(current.retro[col.key as keyof typeof current.retro] as string[])]
                            arr[i]=e.target.value
                            saveSprints(sprints.map(sp=>sp.id!==current.id?sp:{...sp,retro:{...sp.retro,[col.key]:arr}}))
                          }}
                          placeholder={col.placeholder}
                          style={{flex:1,fontSize:11,border:"1px solid var(--border)",borderRadius:6,padding:"5px 8px",background:"var(--bg)",color:"var(--text-1)"}}/>
                        <button onClick={()=>{
                          const arr=(current.retro[col.key as keyof typeof current.retro] as string[]).filter((_,j)=>j!==i)
                          saveSprints(sprints.map(sp=>sp.id!==current.id?sp:{...sp,retro:{...sp.retro,[col.key]:arr.length?arr:[""]}}))
                        }} style={{background:"transparent",border:"none",cursor:"pointer",color:"#ef4444",padding:"0 2px"}}><Trash2 size={11}/></button>
                      </div>
                    ))}
                    <button onClick={()=>{
                      const arr=[...(current.retro[col.key as keyof typeof current.retro] as string[]),""]
                      saveSprints(sprints.map(sp=>sp.id!==current.id?sp:{...sp,retro:{...sp.retro,[col.key]:arr}}))
                    }} style={{fontSize:11,color:col.color,background:"transparent",border:`1px dashed ${col.color}44`,borderRadius:6,padding:"4px 10px",cursor:"pointer",width:"100%",marginTop:4}}>+ Ajouter</button>
                  </div>
                ))}
              </div>
            ) : <div style={{textAlign:"center",padding:40,color:"var(--text-3)"}}>Créez d'abord un sprint</div>}
          </div>
        )}

        {/* ── TAB 5 : VÉLOCITÉ ── */}
        {activeTab==="velocity" && (
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text-1)",marginBottom:14}}>📈 Vélocité & Burndown</div>
            {sprints.length===0 ? (
              <div style={{textAlign:"center",padding:40,color:"var(--text-3)"}}>Aucun sprint disponible</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {/* Graphe vélocité */}
                <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"16px 20px"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--text-2)",marginBottom:12}}>Story Points par sprint</div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:12,height:120}}>
                    {sprints.map(sp => {
                      const maxPts = Math.max(...sprints.map(s=>Math.max(s.plannedPoints,s.completedPoints)),1)
                      const hP = Math.round((sp.plannedPoints/maxPts)*100)
                      const hC = Math.round((sp.completedPoints/maxPts)*100)
                      return (
                        <div key={sp.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                          <div style={{display:"flex",gap:3,alignItems:"flex-end",height:100}}>
                            <div style={{width:16,height:Math.max(4,hP)+"%",background:"rgba(59,130,246,0.4)",borderRadius:"3px 3px 0 0",border:"1px solid #3b82f6"}} title={`Planifiés: ${sp.plannedPoints}pts`}/>
                            <div style={{width:16,height:Math.max(4,hC)+"%",background:sp.completedPoints>=sp.plannedPoints?"rgba(34,197,94,0.6)":"rgba(245,158,11,0.6)",borderRadius:"3px 3px 0 0",border:`1px solid ${sp.completedPoints>=sp.plannedPoints?"#22c55e":"#f59e0b"}`}} title={`Livrés: ${sp.completedPoints}pts`}/>
                          </div>
                          <div style={{fontSize:9,color:"var(--text-3)"}}>S{sp.num}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{display:"flex",gap:12,marginTop:8,justifyContent:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"var(--text-3)"}}>
                      <div style={{width:12,height:12,background:"rgba(59,130,246,0.4)",border:"1px solid #3b82f6",borderRadius:2}}/> Planifiés
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"var(--text-3)"}}>
                      <div style={{width:12,height:12,background:"rgba(34,197,94,0.6)",border:"1px solid #22c55e",borderRadius:2}}/> Livrés
                    </div>
                  </div>
                </div>
                {/* Tableau vélocité */}
                <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"var(--bg)"}}>
                        {["Sprint","Objectif","Planifiés","Livrés","Vélocité","Stories","Terminées"].map(h=>(
                          <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",borderBottom:"1px solid var(--border)"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sprints.map((sp,i) => {
                        const done = sp.stories.filter(s=>s.status==="Terminé").length
                        const ratio = sp.plannedPoints>0?Math.round(sp.completedPoints/sp.plannedPoints*100):0
                        return (
                          <tr key={sp.id} style={{background:i%2===0?"var(--bg-card)":"var(--bg)",borderBottom:"1px solid var(--border)"}}>
                            <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:"var(--primary-light)"}}>Sprint {sp.num}</td>
                            <td style={{padding:"8px 12px",fontSize:11,color:"var(--text-2)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sp.goal}</td>
                            <td style={{padding:"8px 12px",fontSize:12,color:"#3b82f6",fontWeight:600}}>{sp.plannedPoints}</td>
                            <td style={{padding:"8px 12px",fontSize:12,color:sp.completedPoints>=sp.plannedPoints?"#22c55e":"#f59e0b",fontWeight:600}}>{sp.completedPoints}</td>
                            <td style={{padding:"8px 12px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <div style={{flex:1,height:5,background:"var(--bg)",borderRadius:3,overflow:"hidden"}}>
                                  <div style={{width:Math.min(100,ratio)+"%",height:"100%",background:ratio>=80?"#22c55e":ratio>=50?"#f59e0b":"#ef4444",borderRadius:3}}/>
                                </div>
                                <span style={{fontSize:10,color:"var(--text-3)",flexShrink:0}}>{ratio}%</span>
                              </div>
                            </td>
                            <td style={{padding:"8px 12px",fontSize:12,color:"var(--text-2)"}}>{sp.stories.length}</td>
                            <td style={{padding:"8px 12px",fontSize:12,color:"#22c55e",fontWeight:600}}>{done}</td>
                          </tr>
                        )
                      })}
                      <tr style={{background:"rgba(123,94,255,0.06)",borderTop:"2px solid var(--primary)"}}>
                        <td style={{padding:"8px 12px",fontSize:11,fontWeight:800,color:"var(--primary-light)"}} colSpan={2}>TOTAL / MOYENNE</td>
                        <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:"#3b82f6"}}>{sprints.reduce((s,sp)=>s+sp.plannedPoints,0)}</td>
                        <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:"#22c55e"}}>{totalPts}</td>
                        <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:"var(--primary-light)"}}>{avgVel} pts/sprint</td>
                        <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:"var(--text-1)"}}>{allStories.length}</td>
                        <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:"#22c55e"}}>{allStories.filter(s=>s.status==="Terminé").length}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6 : TESTS BDD/TDD ── */}
        {activeTab==="tests" && (
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text-1)",marginBottom:14}}>🧪 Plan de Tests — BDD / TDD / Manuel</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {["BDD","TDD","Manuel"].map(type => {
                const stories = [...backlog,...allStories].filter(s=>s.testType===type)
                const cfg = TEST_CFG[type]
                return (
                  <div key={type} style={{background:cfg.bg,border:`1px solid ${cfg.color}33`,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                    <div style={{fontSize:24,fontWeight:800,color:cfg.color}}>{stories.length}</div>
                    <div style={{fontSize:12,fontWeight:700,color:cfg.color}}>{type}</div>
                    <div style={{fontSize:10,color:"var(--text-3)",marginTop:2}}>
                      {type==="BDD"?"Given/When/Then":type==="TDD"?"Red→Green→Refactor":"Tests manuels"}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Liste stories avec critères d'acceptation */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[...backlog,...allStories].filter(s=>s.acceptanceCriteria||s.testType).map(s => (
                <div key={s.id} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    {s.testType && <span style={{fontSize:10,padding:"2px 8px",borderRadius:6,background:TEST_CFG[s.testType]?.bg,color:TEST_CFG[s.testType]?.color,fontWeight:700}}>{s.testType}</span>}
                    <span style={{fontSize:9,padding:"2px 7px",borderRadius:6,background:PRI_CFG[s.priority]?.color+"22",color:PRI_CFG[s.priority]?.color,fontWeight:700}}>{s.priority}</span>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--text-1)",flex:1}}>{s.title}</span>
                    <span style={{fontSize:10,color:"var(--text-3)"}}>{s.points}pts</span>
                  </div>
                  {s.acceptanceCriteria && (
                    <div style={{background:"rgba(59,130,246,0.06)",borderRadius:7,padding:"8px 10px",fontSize:11,color:"var(--text-2)",lineHeight:1.6,fontFamily:"monospace",whiteSpace:"pre-wrap"}}>
                      {s.acceptanceCriteria}
                    </div>
                  )}
                </div>
              ))}
              {[...backlog,...allStories].filter(s=>s.acceptanceCriteria||s.testType).length===0 && (
                <div style={{textAlign:"center",padding:40,color:"var(--text-3)"}}>
                  <div style={{fontSize:36,marginBottom:10}}>🧪</div>
                  Ajoutez des critères d'acceptation dans le Backlog pour les voir ici
                </div>
              )}
            </div>
          </div>
        )}

      </ToolLayout>
    </AppLayout>
  )
}
