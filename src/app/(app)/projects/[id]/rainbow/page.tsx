"use client"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { exportPDF } from "@/lib/exportAll"
import EmailCaptureButton from "@/components/ui/EmailCaptureButton"
import { Download, RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock, Target } from "lucide-react"

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

function KPI({ label, value, sub, color }: any) {
  return (
    <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 16px", textAlign:"center", flex:1 }}>
      <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:900, color: color ?? "#fff", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:3 }}>{sub}</div>}
    </div>
  )
}

export default function RainbowPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<any>(null)
  const [tools,   setTools]   = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const today = new Date().toISOString().slice(0,10)

  const load = async () => {
    setLoading(true)
    const { data: proj } = await supabase.from("projects").select("*").eq("id", id).single()
    const { data: ts }   = await supabase.from("project_tools").select("tool_type,data").eq("project_id", id)
    const map: any = {}
    ts?.forEach((t:any) => { map[t.tool_type] = t.data })
    setProject(proj)
    setTools(map)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  if (loading) return <AppLayout><div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", color:"var(--text-3)" }}>Chargement...</div></AppLayout>
  if (!project) return <AppLayout><div style={{ padding:40, color:"var(--text-3)" }}>Projet non trouvé</div></AppLayout>

  // ── Données EVM ─────────────────────────────────────────
  const evmTasks = tools.budget?.tasks ?? []
  const cp = tools.budget?.currentPeriod ?? new Date().getMonth()
  const bac = evmTasks.reduce((s:number,t:any) => s+(t.bac??0), 0)
  const pv  = evmTasks.reduce((s:number,t:any) => s+(t.pv?.[cp]??0), 0)
  const ev  = evmTasks.reduce((s:number,t:any) => s+(t.ev?.[cp]??0), 0)
  const ac  = evmTasks.reduce((s:number,t:any) => s+(t.ac?.[cp]??0), 0)
  const cpi = ac > 0 ? Math.round(ev/ac*100)/100 : null
  const spi = pv > 0 ? Math.round(ev/pv*100)/100 : null
  const eac = cpi && cpi > 0 ? Math.round(bac/cpi) : bac
  const cv  = ev - ac
  const sv  = ev - pv
  const fmt = (n:number) => n>=1000000?(n/1000000).toFixed(1)+"M€":n>=1000?(n/1000).toFixed(0)+"k€":n+"€"
  const fmtSign = (n:number) => (n>=0?"+":"")+fmt(n)

  // ── RAID ────────────────────────────────────────────────
  const raidItems  = tools.raid?.items ?? []
  const raidCrit   = raidItems.filter((i:any) => i.priority==="Critique" && i.status==="Ouvert")
  const raidOpen   = raidItems.filter((i:any) => i.status==="Ouvert")
  const raidResolu = raidItems.filter((i:any) => i.status==="Résolu"||i.status==="Fermé")

  // ── Jalons ──────────────────────────────────────────────
  const jalons     = tools.jalons?.jalons ?? []
  const jalonsNext = jalons.filter((j:any) => j.date >= today && j.status !== "Atteint").slice(0,4)
  const jalonsLate = jalons.filter((j:any) => j.date < today && j.status !== "Atteint")
  const jalonsDone = jalons.filter((j:any) => j.status==="Atteint")

  // ── OKR ─────────────────────────────────────────────────
  const objectives = tools.okr?.objectives ?? []
  const objProg = (obj:any) => {
    const krs = obj.keyResults??[]
    const tw = krs.reduce((s:number,kr:any)=>s+(kr.weight??1),0)
    return tw>0?Math.round(krs.reduce((s:number,kr:any)=>{
      const p=kr.target>0?Math.min(100,Math.round(kr.current/kr.target*100)):0
      return s+p*(kr.weight??1)
    },0)/tw):0
  }

  // ── Score santé ─────────────────────────────────────────
  let score = 100
  if (cpi !== null && cpi < 0.9) score -= 30
  else if (cpi !== null && cpi < 1) score -= 15
  if (spi !== null && spi < 0.9) score -= 25
  else if (spi !== null && spi < 1) score -= 10
  score -= raidCrit.length * 10
  score -= jalonsLate.length * 8
  score = Math.max(0, Math.min(100, score))
  const rag = score>=75?"Vert":score>=50?"Ambre":"Rouge"
  const ragColor = score>=75?"#22c55e":score>=50?"#f59e0b":"#ef4444"
  const ragEmoji = score>=75?"🟢":score>=50?"🟡":"🔴"

  // ── Courbe S mini (SVG inline) ───────────────────────────
  const pvCum:number[]=[], evCum:number[]=[], acCum:number[]=[]
  let pvc=0,evc=0,acc2=0
  MONTHS.forEach((_,i)=>{
    pvc+=evmTasks.reduce((s:number,t:any)=>s+(t.pv?.[i]??0),0)
    evc+=evmTasks.reduce((s:number,t:any)=>s+(t.ev?.[i]??0),0)
    acc2+=evmTasks.reduce((s:number,t:any)=>s+(t.ac?.[i]??0),0)
    pvCum.push(pvc); evCum.push(evc); acCum.push(acc2)
  })
  const maxV = Math.max(...pvCum,...evCum,...acCum,1)
  const W=400,H=120,pL=10,pR=10,pT=10,pB=20
  const cW=W-pL-pR, cH=H-pT-pB
  const xS=cW/(MONTHS.length-1)
  const yS=(v:number)=>pT+cH-(v/maxV)*cH
  const pts=(arr:number[])=>arr.map((v,i)=>`${pL+i*xS},${yS(v)}`).join(" ")

  const exportPDFPage = () => exportPDF("rainbow-content", `RAINBOW — ${project.name}`)

  return (
    <AppLayout>
      <div style={{ padding:"16px 20px 32px", background:"var(--bg)", minHeight:"100%" }}>

        {/* Toolbar */}
        <div className="no-print" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 2px" }}>// RAPPORT GOUVERNANCE</p>
            <h2 style={{ fontSize:16, fontWeight:800, color:"var(--text-1)", margin:0 }}>Page RAINBOW — {project.name}</h2>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <EmailCaptureButton captureId="rainbow-content" title="RAINBOW" projectName={project.name}/>
            <button onClick={exportPDFPage} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--primary-light)", cursor:"pointer" }}>
              <Download size={13}/> Exporter PDF
            </button>
            <button onClick={load} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", background:"transparent", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>
              <RefreshCw size={13}/>
            </button>
          </div>
        </div>

        {/* ══════ RAINBOW CONTENT ══════ */}
        <div id="rainbow-content" style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", borderRadius:16, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.5)" }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(90deg,rgba(30,64,175,0.9),rgba(124,58,237,0.7),rgba(239,68,68,0.5))", padding:"24px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:6 }}>Rapport de Gouvernance — PMO AI Studio</div>
              <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", margin:"0 0 4px" }}>{project.icon??""} {project.name}</h1>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                Chef de Projet : {project.chef_de_projet ?? "—"} · Période : {MONTHS[cp]} {new Date().getFullYear()} · Généré le {new Date().toLocaleDateString("fr-FR")}
              </div>
            </div>
            <div style={{ textAlign:"center", background:"rgba(255,255,255,0.1)", borderRadius:16, padding:"16px 24px", backdropFilter:"blur(10px)" }}>
              <div style={{ fontSize:48, fontWeight:900, color:ragColor, lineHeight:1 }}>{score}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:4 }}>Score Santé</div>
              <div style={{ fontSize:16, fontWeight:800, color:ragColor, marginTop:4 }}>{ragEmoji} {rag}</div>
            </div>
          </div>

          <div style={{ padding:"24px 32px", display:"flex", flexDirection:"column", gap:20 }}>

            {/* KPIs EVM */}
            {bac > 0 && (
              <div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>📊 Indicateurs EVM — {MONTHS[cp]}</div>
                <div style={{ display:"flex", gap:10 }}>
                  <KPI label="BAC" value={fmt(bac)} sub="Budget total"/>
                  <KPI label="EV" value={fmt(ev)} sub="Valeur acquise"/>
                  <KPI label="AC" value={fmt(ac)} sub="Coût réel"/>
                  <KPI label="CPI" value={cpi?.toFixed(2)??"-"} color={cpi?.(cpi>=1?"#22c55e":cpi>=0.9?"#f59e0b":"#ef4444"):undefined} sub="Perf. coût"/>
                  <KPI label="SPI" value={spi?.toFixed(2)??"-"} color={spi?.(spi>=1?"#22c55e":spi>=0.9?"#f59e0b":"#ef4444"):undefined} sub="Perf. délai"/>
                  <KPI label="EAC" value={fmt(eac)} sub="Estimation finale"/>
                  <KPI label="CV" value={fmtSign(cv)} color={cv>=0?"#22c55e":"#ef4444"} sub="Écart coût"/>
                </div>
              </div>
            )}

            {/* Courbe S + RAID */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

              {/* Courbe S mini */}
              {bac > 0 && (
                <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"16px" }}>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>📈 Courbe S EVM</div>
                  <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
                    {[0,0.25,0.5,0.75,1].map(r=>(
                      <line key={r} x1={pL} y1={pT+cH*(1-r)} x2={W-pR} y2={pT+cH*(1-r)} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                    ))}
                    <line x1={pL+cp*xS} y1={pT} x2={pL+cp*xS} y2={pT+cH} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2"/>
                    <polyline points={pts(pvCum)} fill="none" stroke="#3b82f6" strokeWidth="2"/>
                    <polyline points={pts(evCum)} fill="none" stroke="#22c55e" strokeWidth="2"/>
                    <polyline points={pts(acCum)} fill="none" stroke="#f59e0b" strokeWidth="2"/>
                    {MONTHS.map((m,i)=>(
                      <text key={m} x={pL+i*xS} y={H-4} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle">{m}</text>
                    ))}
                  </svg>
                  <div style={{ display:"flex", gap:12, marginTop:6 }}>
                    {[["#3b82f6","PV"],["#22c55e","EV"],["#f59e0b","AC"]].map(([c,l])=>(
                      <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <div style={{ width:16, height:3, background:c, borderRadius:2 }}/>
                        <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RAID */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"16px" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>⚠️ RAID — Résumé</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
                  {[[raidItems.length,"Total","#64748b"],[raidCrit.length,"Critiques","#ef4444"],[raidOpen.length,"Ouverts","#f59e0b"],[raidResolu.length,"Résolus","#22c55e"]].map(([v,l,c]:any,i)=>(
                    <div key={i} style={{ textAlign:"center", background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"8px" }}>
                      <div style={{ fontSize:20, fontWeight:900, color:c }}>{v}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{l}</div>
                    </div>
                  ))}
                </div>
                {raidCrit.slice(0,3).map((r:any,i:number)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:6, background:"rgba(239,68,68,0.08)", marginBottom:4 }}>
                    <AlertTriangle size={11} color="#ef4444" style={{ flexShrink:0 }}/>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jalons + OKR */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

              {/* Jalons */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"16px" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>🏁 Jalons clés</div>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  {[[jalonsDone.length,"Atteints","#22c55e"],[jalonsNext.length,"À venir","#3b82f6"],[jalonsLate.length,"En retard","#ef4444"]].map(([v,l,c]:any,i)=>(
                    <div key={i} style={{ flex:1, textAlign:"center", background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"8px" }}>
                      <div style={{ fontSize:18, fontWeight:900, color:c }}>{v}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{l}</div>
                    </div>
                  ))}
                </div>
                {jalonsNext.slice(0,4).map((j:any,i:number)=>{
                  const days = Math.round((new Date(j.date).getTime()-new Date().getTime())/86400000)
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:6, background:"rgba(59,130,246,0.08)", marginBottom:4 }}>
                      <Clock size={11} color="#3b82f6" style={{ flexShrink:0 }}/>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{j.name}</span>
                      <span style={{ fontSize:10, color:"#3b82f6", fontWeight:600, flexShrink:0 }}>{days}j</span>
                    </div>
                  )
                })}
                {jalonsLate.slice(0,2).map((j:any,i:number)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:6, background:"rgba(239,68,68,0.08)", marginBottom:4 }}>
                    <AlertTriangle size={11} color="#ef4444" style={{ flexShrink:0 }}/>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{j.name}</span>
                    <span style={{ fontSize:10, color:"#ef4444", fontWeight:600, flexShrink:0 }}>Retard</span>
                  </div>
                ))}
              </div>

              {/* OKR */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"16px" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>🎯 OKR — Progression</div>
                {objectives.length === 0 && <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"20px 0" }}>Aucun OKR défini</p>}
                {objectives.slice(0,4).map((obj:any,i:number)=>{
                  const prog = objProg(obj)
                  const pc = prog>=80?"#22c55e":prog>=60?"#3b82f6":prog>=40?"#f59e0b":"#ef4444"
                  return (
                    <div key={i} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"80%" }}>{obj.title}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:pc, flexShrink:0 }}>{prog}%</span>
                      </div>
                      <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ width:prog+"%", height:"100%", background:pc, borderRadius:3, transition:"width 0.5s" }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Avancement général */}
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"16px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1px" }}>📋 Avancement global du projet</div>
                <span style={{ fontSize:16, fontWeight:900, color:ragColor }}>{project.completion??0}%</span>
              </div>
              <div style={{ height:12, background:"rgba(255,255,255,0.08)", borderRadius:6, overflow:"hidden" }}>
                <div style={{ width:(project.completion??0)+"%", height:"100%", background:`linear-gradient(90deg,#1e40af,${ragColor})`, borderRadius:6, transition:"width 0.5s" }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10, color:"rgba(255,255,255,0.3)" }}>
                <span>Début : {project.start_date ?? "—"}</span>
                <span>Fin prévue : {project.end_date ?? "—"}</span>
                <span>Statut : {project.status ?? "Actif"}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign:"center", paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>
                PMO AI Studio — Rapport généré le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })}
              </span>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  )
}
