"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { exportPDF } from "@/lib/exportAll"
import EmailCaptureButton from "@/components/ui/EmailCaptureButton"
import { Download, RefreshCw, AlertTriangle, Clock, Target, Users, TrendingUp, TrendingDown, CheckCircle, Zap, MessageSquare } from "lucide-react"

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

export default function RainbowPage() {
  const { id } = useParams<{ id:string }>()
  const [project, setProject] = useState<any>(null)
  const [tools,   setTools]   = useState<any>({})
  const [members, setMembers] = useState<any[]>([])
  const [comment, setComment] = useState("")
  const [editComment, setEditComment] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const today = new Date().toISOString().slice(0,10)

  const load = async () => {
    setLoading(true)
    const { data: proj } = await supabase.from("projects").select("*").eq("id", id).single()
    const { data: ts }   = await supabase.from("project_tools").select("tool_type,data").eq("project_id", id)
    const { data: mb }   = await supabase.from("project_members").select("*").eq("project_id", id)
    const map: any = {}
    ts?.forEach((t:any) => { map[t.tool_type] = t.data })
    setProject(proj)
    setTools(map)
    setMembers(mb ?? [])
    setComment(map.rainbow_comment ?? "")
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  if (loading) return <AppLayout><div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--text-3)" }}>Chargement...</div></AppLayout>
  if (!project) return <AppLayout><div style={{ padding:40,color:"var(--text-3)" }}>Projet non trouvé</div></AppLayout>

  // EVM
  const evmTasks = tools.budget?.tasks ?? []
  const cp = tools.budget?.currentPeriod ?? new Date().getMonth()
  const bac = evmTasks.reduce((s:number,t:any)=>s+(t.bac??0),0)
  const pv  = evmTasks.reduce((s:number,t:any)=>s+(t.pv?.[cp]??0),0)
  const ev  = evmTasks.reduce((s:number,t:any)=>s+(t.ev?.[cp]??0),0)
  const ac  = evmTasks.reduce((s:number,t:any)=>s+(t.ac?.[cp]??0),0)
  const cpi = ac>0?Math.round(ev/ac*100)/100:null
  const spi = pv>0?Math.round(ev/pv*100)/100:null
  const eac = (cpi&&cpi>0)?Math.round(bac/cpi):bac
  const pctBudget = bac>0?Math.round(ac/bac*100):0
  const fmt  = (n:number) => n>=1000000?(n/1000000).toFixed(1)+"M€":n>=1000?(n/1000).toFixed(0)+"k€":n+"€"

  // RAID
  const raidItems  = tools.raid?.items ?? []
  const raidCrit   = raidItems.filter((i:any)=>i.priority==="Critique"&&i.status==="Ouvert")
  const raidOpen   = raidItems.filter((i:any)=>i.status==="Ouvert")
  const raidResolu = raidItems.filter((i:any)=>i.status==="Résolu"||i.status==="Fermé")

  // Jalons
  const jalons     = tools.jalons?.jalons ?? []
  const jalonsNext = jalons.filter((j:any)=>j.date>=today&&j.status!=="Atteint").sort((a:any,b:any)=>a.date.localeCompare(b.date)).slice(0,4)
  const jalonsLate = jalons.filter((j:any)=>j.date<today&&j.status!=="Atteint")
  const jalonsDone = jalons.filter((j:any)=>j.status==="Atteint")

  // OKR
  const objectives = tools.okr?.objectives ?? []
  const objProg = (obj:any) => {
    const krs=obj.keyResults??[]; const tw=krs.reduce((s:number,kr:any)=>s+(kr.weight??1),0)
    return tw>0?Math.round(krs.reduce((s:number,kr:any)=>{const p=kr.target>0?Math.min(100,Math.round(kr.current/kr.target*100)):0;return s+p*(kr.weight??1)},0)/tw):0
  }
  const avgOKR = objectives.length>0?Math.round(objectives.reduce((s:number,o:any)=>s+objProg(o),0)/objectives.length):0

  // Décisions
  const decisions = (tools.decisions?.items ?? []).slice(-4).reverse()

  // WBS tâches
  const wbsTasks = tools.wbs?.tasks ?? []
  const wbsDone  = wbsTasks.filter((t:any)=>t.status==="Terminé"||t.progress===100).length

  // Score santé
  let score = 100
  if (cpi!==null&&cpi<0.9) score-=30; else if (cpi!==null&&cpi<1) score-=15
  if (spi!==null&&spi<0.9) score-=25; else if (spi!==null&&spi<1) score-=10
  score -= raidCrit.length*10; score -= jalonsLate.length*8
  score = Math.max(0,Math.min(100,score))
  const rag = score>=75?"Vert":score>=50?"Ambre":"Rouge"
  const ragColor = score>=75?"#22c55e":score>=50?"#f59e0b":"#ef4444"
  const meteo = score>=75?"☀️ Favorable":score>=50?"⛅ Mitigé":"🌧️ Critique"

  // Courbe S SVG
  const pvC:number[]=[],evC:number[]=[],acC:number[]=[]
  let p2=0,e2=0,a2=0
  MONTHS.forEach((_,i)=>{
    p2+=evmTasks.reduce((s:number,t:any)=>s+(t.pv?.[i]??0),0)
    e2+=evmTasks.reduce((s:number,t:any)=>s+(t.ev?.[i]??0),0)
    a2+=evmTasks.reduce((s:number,t:any)=>s+(t.ac?.[i]??0),0)
    pvC.push(p2);evC.push(e2);acC.push(a2)
  })
  const mV=Math.max(...pvC,...evC,...acC,1)
  const W=440,H=130,pL=8,pR=8,pT=8,pB=22
  const cW=W-pL-pR,cH=H-pT-pB
  const xSt=cW/(MONTHS.length-1)
  const yF=(v:number)=>pT+cH-(v/mV)*cH
  const polyPts=(arr:number[])=>arr.map((v,i)=>`${pL+i*xSt},${yF(v)}`).join(" ")

  const saveComment = async () => {
    const existing = tools.rainbow ?? {}
    await supabase.from("project_tools").upsert({ project_id:id, tool_type:"rainbow", data:{ ...existing, comment } }, { onConflict:"project_id,tool_type" })
    setEditComment(false)
  }

  const pc = (v:number) => v>=80?"#22c55e":v>=60?"#3b82f6":v>=40?"#f59e0b":"#ef4444"

  return (
    <AppLayout>
      <div style={{ padding:"16px 20px 32px", background:"var(--bg)", minHeight:"100%" }}>

        {/* Toolbar */}
        <div className="no-print" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
          <div>
            <p style={{ fontSize:10,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 2px" }}>// RAPPORT GOUVERNANCE</p>
            <h2 style={{ fontSize:16,fontWeight:800,color:"var(--text-1)",margin:0 }}>🌈 Page RAINBOW — {project.name}</h2>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <EmailCaptureButton captureId="rainbow-content" title="RAINBOW" projectName={project.name}/>
            <button onClick={()=>exportPDF("rainbow-content",`RAINBOW — ${project.name}`)} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:8,fontSize:12,color:"var(--primary-light)",cursor:"pointer" }}>
              <Download size={13}/> PDF
            </button>
            <button onClick={load} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 10px",background:"transparent",border:"1px solid var(--border)",borderRadius:8,fontSize:12,color:"var(--text-2)",cursor:"pointer" }}>
              <RefreshCw size={13}/>
            </button>
          </div>
        </div>

        {/* RAINBOW CONTENT */}
        <div id="rainbow-content" style={{ background:"linear-gradient(160deg,#0f172a 0%,#1e1b4b 40%,#1a0a2e 70%,#0f172a 100%)",borderRadius:16,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.6)" }}>

          {/* ── HEADER ── */}
          <div style={{ background:"linear-gradient(90deg,rgba(30,64,175,0.95) 0%,rgba(109,40,217,0.85) 50%,rgba(220,38,38,0.7) 100%)",padding:"28px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8 }}>Rapport de Gouvernance — PMO AI Studio</div>
              <h1 style={{ fontSize:30,fontWeight:900,color:"#fff",margin:"0 0 8px",lineHeight:1.1 }}>{project.icon??""} {project.name}</h1>
              <div style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
                {[
                  ["👤",project.chef_de_projet??"Chef de Projet non défini"],
                  ["🏢",project.client??"Client non défini"],
                  ["📅",`${project.start_date??"—"} → ${project.end_date??"—"}`],
                  ["💰",fmt(project.budget??bac)],
                  ["🔖",project.status??"Actif"],
                ].map(([icon,val],i)=>(
                  <span key={i} style={{ fontSize:12,color:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",gap:4 }}>
                    <span>{icon}</span><span>{val}</span>
                  </span>
                ))}
              </div>
            </div>
            {/* Score + Météo */}
            <div style={{ display:"flex",flexDirection:"column",gap:10,alignItems:"center" }}>
              <div style={{ textAlign:"center",background:"rgba(0,0,0,0.3)",borderRadius:16,padding:"16px 24px",backdropFilter:"blur(10px)",border:`2px solid ${ragColor}44` }}>
                <div style={{ fontSize:52,fontWeight:900,color:ragColor,lineHeight:1 }}>{score}</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:4 }}>Score Santé</div>
                <div style={{ fontSize:18,fontWeight:800,color:ragColor,marginTop:6 }}>{rag==="Vert"?"🟢":rag==="Ambre"?"🟡":"🔴"} {rag}</div>
              </div>
              <div style={{ textAlign:"center",background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"8px 16px",fontSize:14,color:"rgba(255,255,255,0.8)",fontWeight:600 }}>
                {meteo}
              </div>
            </div>
          </div>

          <div style={{ padding:"24px 32px",display:"flex",flexDirection:"column",gap:18 }}>

            {/* ── AVANCEMENT GLOBAL + BUDGET ── */}
            <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:16 }}>

              {/* Avancement */}
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"18px 20px" }}>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12 }}>📋 Avancement du projet</div>
                <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:16 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                      <span style={{ fontSize:13,color:"rgba(255,255,255,0.7)" }}>Progression globale</span>
                      <span style={{ fontSize:16,fontWeight:900,color:pc(project.completion??0) }}>{project.completion??0}%</span>
                    </div>
                    <div style={{ height:14,background:"rgba(255,255,255,0.08)",borderRadius:7,overflow:"hidden" }}>
                      <div style={{ width:(project.completion??0)+"%",height:"100%",background:`linear-gradient(90deg,#1e40af,${ragColor})`,borderRadius:7,transition:"width 0.8s" }}/>
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10 }}>
                  {[
                    ["📦",wbsTasks.length,"Tâches WBS","#3b82f6"],
                    ["✅",wbsDone,"Terminées","#22c55e"],
                    ["🏁",jalonsDone.length,"Jalons atteints","#22c55e"],
                    ["⏳",jalonsNext.length,"Jalons à venir","#3b82f6"],
                  ].map(([icon,val,lbl,color]:any,i)=>(
                    <div key={i} style={{ textAlign:"center",background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"10px 8px" }}>
                      <div style={{ fontSize:18 }}>{icon}</div>
                      <div style={{ fontSize:20,fontWeight:900,color,marginTop:2 }}>{val}</div>
                      <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)" }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget jauge */}
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"18px 20px" }}>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12 }}>💰 Budget</div>
                {bac>0 ? (
                  <>
                    <div style={{ display:"flex",justifyContent:"center",marginBottom:12 }}>
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12"/>
                        <circle cx="60" cy="60" r="50" fill="none"
                          stroke={pctBudget>90?"#ef4444":pctBudget>70?"#f59e0b":"#22c55e"}
                          strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${pctBudget*3.14} 314`}
                          transform="rotate(-90 60 60)"/>
                        <text x="60" y="56" fill="#fff" fontSize="18" fontWeight="900" textAnchor="middle">{pctBudget}%</text>
                        <text x="60" y="72" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle">consommé</text>
                      </svg>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                      {[["BAC",fmt(bac),"rgba(255,255,255,0.4)"],["AC",fmt(ac),"#f59e0b"],["EAC",fmt(eac),pctBudget>100?"#ef4444":"#22c55e"]].map(([l,v,c]:any,i)=>(
                        <div key={i} style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
                          <span style={{ color:"rgba(255,255,255,0.4)" }}>{l}</span>
                          <span style={{ fontWeight:700,color:c }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"20px 0" }}>Budget non défini</p>}
              </div>
            </div>

            {/* ── EVM KPIs ── */}
            {bac>0 && (
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 20px" }}>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12 }}>📊 Indicateurs EVM — {MONTHS[cp]}</div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10 }}>
                  {[
                    ["BAC",fmt(bac),"Budget total","rgba(255,255,255,0.7)"],
                    ["EV",fmt(ev),"Valeur acquise","#3b82f6"],
                    ["AC",fmt(ac),"Coût réel","#f59e0b"],
                    ["CPI",cpi?.toFixed(2)??"-","Perf. coût",cpi!==null?(cpi>=1?"#22c55e":cpi>=0.9?"#f59e0b":"#ef4444"):"rgba(255,255,255,0.4)"],
                    ["SPI",spi?.toFixed(2)??"-","Perf. délai",spi!==null?(spi>=1?"#22c55e":spi>=0.9?"#f59e0b":"#ef4444"):"rgba(255,255,255,0.4)"],
                    ["EAC",fmt(eac),"Estimation finale",eac>bac?"#ef4444":"#22c55e"],
                    ["CV",ev-ac>=0?"+"+fmt(ev-ac):"-"+fmt(Math.abs(ev-ac)),"Écart coût",ev-ac>=0?"#22c55e":"#ef4444"],
                  ].map(([l,v,s,c]:any,i)=>(
                    <div key={i} style={{ textAlign:"center",background:"rgba(255,255,255,0.05)",borderRadius:10,padding:"12px 8px",border:`1px solid ${c}22` }}>
                      <div style={{ fontSize:9,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4 }}>{l}</div>
                      <div style={{ fontSize:16,fontWeight:900,color:c,lineHeight:1 }}>{v}</div>
                      <div style={{ fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:3 }}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── COURBE S + RAID ── */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              {/* Courbe S */}
              {bac>0 && (
                <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 20px" }}>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10 }}>📈 Courbe S EVM</div>
                  <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
                    {[0,0.25,0.5,0.75,1].map(r=>(
                      <line key={r} x1={pL} y1={pT+cH*(1-r)} x2={W-pR} y2={pT+cH*(1-r)} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                    ))}
                    <line x1={pL+cp*xSt} y1={pT} x2={pL+cp*xSt} y2={pT+cH} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3"/>
                    <polyline points={polyPts(pvC)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round"/>
                    <polyline points={polyPts(evC)} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round"/>
                    <polyline points={polyPts(acC)} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round"/>
                    {pvC.map((v,i)=><circle key={i} cx={pL+i*xSt} cy={yF(v)} r="2.5" fill="#3b82f6"/>)}
                    {evC.map((v,i)=><circle key={i} cx={pL+i*xSt} cy={yF(v)} r="2.5" fill="#22c55e"/>)}
                    {acC.map((v,i)=><circle key={i} cx={pL+i*xSt} cy={yF(v)} r="2.5" fill="#f59e0b"/>)}
                    {MONTHS.map((m,i)=>(
                      <text key={m} x={pL+i*xSt} y={H-5} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle">{m}</text>
                    ))}
                  </svg>
                  <div style={{ display:"flex",gap:14,marginTop:6 }}>
                    {[["#3b82f6","PV Planifié"],["#22c55e","EV Acquis"],["#f59e0b","AC Réel"]].map(([c,l])=>(
                      <div key={l} style={{ display:"flex",alignItems:"center",gap:4 }}>
                        <div style={{ width:20,height:3,background:c,borderRadius:2 }}/>
                        <span style={{ fontSize:10,color:"rgba(255,255,255,0.4)" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RAID */}
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 20px" }}>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12 }}>⚠️ RAID — Résumé</div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12 }}>
                  {[[raidItems.length,"Total","rgba(255,255,255,0.6)"],[raidCrit.length,"Critiques","#ef4444"],[raidOpen.length,"Ouverts","#f59e0b"],[raidResolu.length,"Résolus","#22c55e"]].map(([v,l,c]:any,i)=>(
                    <div key={i} style={{ textAlign:"center",background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"10px 6px" }}>
                      <div style={{ fontSize:22,fontWeight:900,color:c }}>{v}</div>
                      <div style={{ fontSize:10,color:"rgba(255,255,255,0.35)" }}>{l}</div>
                    </div>
                  ))}
                </div>
                {raidCrit.slice(0,4).map((r:any,i:number)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",marginBottom:6 }}>
                    <AlertTriangle size={12} color="#ef4444" style={{ flexShrink:0 }}/>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12,color:"rgba(255,255,255,0.8)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.title}</div>
                      <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)" }}>{r.category} · {r.owner??"-"}</div>
                    </div>
                  </div>
                ))}
                {raidCrit.length===0 && raidOpen.length>0 && raidOpen.slice(0,3).map((r:any,i:number)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:"rgba(245,158,11,0.08)",marginBottom:6 }}>
                    <AlertTriangle size={12} color="#f59e0b" style={{ flexShrink:0 }}/>
                    <span style={{ fontSize:12,color:"rgba(255,255,255,0.7)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.title}</span>
                  </div>
                ))}
                {raidItems.length===0 && <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"16px 0" }}>Aucun élément RAID</p>}
              </div>
            </div>

            {/* ── JALONS + OKR ── */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              {/* Jalons */}
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 20px" }}>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12 }}>🏁 Jalons clés</div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12 }}>
                  {[[jalonsDone.length,"Atteints","#22c55e"],[jalonsNext.length,"À venir","#3b82f6"],[jalonsLate.length,"En retard","#ef4444"]].map(([v,l,c]:any,i)=>(
                    <div key={i} style={{ textAlign:"center",background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"10px" }}>
                      <div style={{ fontSize:22,fontWeight:900,color:c }}>{v}</div>
                      <div style={{ fontSize:10,color:"rgba(255,255,255,0.35)" }}>{l}</div>
                    </div>
                  ))}
                </div>
                {jalonsLate.slice(0,2).map((j:any,i:number)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:"rgba(239,68,68,0.08)",marginBottom:5 }}>
                    <AlertTriangle size={11} color="#ef4444" style={{ flexShrink:0 }}/>
                    <span style={{ fontSize:12,color:"rgba(255,255,255,0.7)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{j.name}</span>
                    <span style={{ fontSize:10,color:"#ef4444",fontWeight:700,flexShrink:0 }}>Retard</span>
                  </div>
                ))}
                {jalonsNext.slice(0,4).map((j:any,i:number)=>{
                  const days=Math.round((new Date(j.date).getTime()-new Date().getTime())/86400000)
                  return (
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:"rgba(59,130,246,0.08)",marginBottom:5 }}>
                      <Clock size={11} color="#3b82f6" style={{ flexShrink:0 }}/>
                      <span style={{ fontSize:12,color:"rgba(255,255,255,0.7)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{j.name}</span>
                      <span style={{ fontSize:10,color:"#3b82f6",fontWeight:700,flexShrink:0 }}>{days}j</span>
                    </div>
                  )
                })}
                {jalons.length===0 && <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"16px 0" }}>Aucun jalon défini</p>}
              </div>

              {/* OKR */}
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 20px" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px" }}>🎯 OKR — Progression</div>
                  {objectives.length>0 && <span style={{ fontSize:14,fontWeight:900,color:pc(avgOKR) }}>{avgOKR}% moy.</span>}
                </div>
                {objectives.length===0 && <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"16px 0" }}>Aucun OKR défini</p>}
                {objectives.slice(0,5).map((obj:any,i:number)=>{
                  const prog=objProg(obj); const pColor=pc(prog)
                  return (
                    <div key={i} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                        <span style={{ fontSize:11,color:"rgba(255,255,255,0.75)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%",fontWeight:500 }}>{obj.title}</span>
                        <span style={{ fontSize:12,fontWeight:900,color:pColor,flexShrink:0 }}>{prog}%</span>
                      </div>
                      <div style={{ height:8,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden" }}>
                        <div style={{ width:prog+"%",height:"100%",background:`linear-gradient(90deg,${pColor}88,${pColor})`,borderRadius:4,transition:"width 0.8s" }}/>
                      </div>
                      <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:2 }}>{obj.category} · {obj.quarter}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── DÉCISIONS + ÉQUIPE ── */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>

              {/* Décisions récentes */}
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 20px" }}>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12 }}>📌 Décisions récentes</div>
                {decisions.length===0 && <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"16px 0" }}>Aucune décision enregistrée</p>}
                {decisions.map((d:any,i:number)=>(
                  <div key={i} style={{ display:"flex",gap:10,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",marginBottom:6,border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ width:28,height:28,borderRadius:6,background:"rgba(124,58,237,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <MessageSquare size={12} color="#a78bfa"/>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12,color:"rgba(255,255,255,0.8)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500 }}>{d.title??d.decision??d.description??"Décision"}</div>
                      <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:2 }}>
                        {d.date??""} {d.owner??"·"} {d.status??""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Équipe projet */}
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 20px" }}>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12 }}>👥 Équipe projet</div>
                {members.length===0 && (
                  <div style={{ textAlign:"center",padding:"16px 0" }}>
                    <Users size={28} color="rgba(255,255,255,0.2)" style={{ marginBottom:8 }}/>
                    <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)" }}>Aucun membre ajouté</p>
                  </div>
                )}
                {/* Chef de projet */}
                {project.chef_de_projet && (
                  <div style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.15)",marginBottom:8 }}>
                    <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <span style={{ fontSize:13,fontWeight:900,color:"#fff" }}>{project.chef_de_projet[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <div style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.9)" }}>{project.chef_de_projet}</div>
                      <div style={{ fontSize:10,color:"#f59e0b" }}>👑 Chef de Projet</div>
                    </div>
                  </div>
                )}
                {members.slice(0,5).map((m:any,i:number)=>{
                  const roleColors: Record<string,string> = { owner:"#f59e0b", editor:"#3b82f6", viewer:"#64748b" }
                  const c = roleColors[m.role]??"#64748b"
                  return (
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",marginBottom:5 }}>
                      <div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${c}88,${c})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <span style={{ fontSize:11,fontWeight:700,color:"#fff" }}>{(m.email?.[0]??"?").toUpperCase()}</span>
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,color:"rgba(255,255,255,0.8)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.email}</div>
                        <div style={{ fontSize:10,color:c,fontWeight:600 }}>{m.role}</div>
                      </div>
                      <span style={{ fontSize:10,padding:"2px 6px",borderRadius:4,background:c+"22",color:c,fontWeight:600,flexShrink:0 }}>{m.status}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── COMMENTAIRE GOUVERNANCE ── */}
            <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 20px" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px" }}>💬 Commentaire de gouvernance</div>
                <button className="no-print" onClick={()=>editComment?saveComment():setEditComment(true)}
                  style={{ fontSize:11,padding:"4px 12px",borderRadius:6,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)",cursor:"pointer" }}>
                  {editComment?"💾 Sauvegarder":"✏️ Modifier"}
                </button>
              </div>
              {editComment ? (
                <textarea value={comment} onChange={e=>setComment(e.target.value)}
                  style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"12px",color:"rgba(255,255,255,0.9)",fontSize:13,lineHeight:1.6,resize:"vertical",minHeight:80,outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}
                  placeholder="Saisissez un commentaire pour la gouvernance (points d'attention, décisions, orientations)..."/>
              ) : (
                <p style={{ fontSize:13,color:comment?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.25)",lineHeight:1.6,margin:0,fontStyle:comment?"normal":"italic" }}>
                  {comment || "Aucun commentaire — cliquez sur Modifier pour ajouter un commentaire de gouvernance"}
                </p>
              )}
            </div>

            {/* Footer */}
            <div style={{ textAlign:"center",paddingTop:8,borderTop:"1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize:11,color:"rgba(255,255,255,0.2)" }}>
                PMO AI Studio · Rapport RAINBOW · {project.name} · {new Date().toLocaleDateString("fr-FR")} {new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
