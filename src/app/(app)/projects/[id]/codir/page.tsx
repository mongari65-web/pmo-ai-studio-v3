"use client"
import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Printer, RefreshCw, Eye, EyeOff } from "lucide-react"

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

function ragColor(score: number) { return score>=75?"#22c55e":score>=50?"#f59e0b":"#ef4444" }
function ragLabel(score: number) { return score>=75?"🟢 VERT":score>=50?"🟡 AMBRE":"🔴 ROUGE" }
function fmt(n:number) { return n>=1000000?(n/1000000).toFixed(1)+"M€":n>=1000?(n/1000).toFixed(0)+"k€":n+"€" }

export default function CODIRPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data: budgetData } = useToolData(id, "budget")
  const { data: raidData }   = useToolData(id, "raid")
  const { data: jalonsData } = useToolData(id, "jalons")
  const { data: wbsData }    = useToolData(id, "wbs")
  const { data: ganttData }  = useToolData(id, "gantt")

  const [commentary, setCommentary] = useState("")
  const [decisions, setDecisions]   = useState("")
  const [nextSteps, setNextSteps]   = useState("")
  const [preview, setPreview]       = useState(true)
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0])
  const [reportNum, setReportNum]   = useState("001")
  const [generating, setGenerating] = useState(false)

  const cp = new Date().getMonth()
  const today = new Date().toISOString().split("T")[0]

  // Calcul EVM
  const evmTasks = useMemo(() => {
    if (!budgetData) return []
    if (budgetData.tasks?.length) return budgetData.tasks
    if (budgetData.lines?.length) return budgetData.lines.map((l:any,i:number) => ({
      id:i, bac:l.bac??0,
      pv:Array(12).fill(0).map((_,m)=>m<=cp?Math.round((l.pv??0)/(cp+1)):0),
      ev:Array(12).fill(0).map((_,m)=>m<=cp?Math.round((l.ev??0)/(cp+1)):0),
      ac:Array(12).fill(0).map((_,m)=>m<=cp?Math.round((l.ac??0)/(cp+1)):0),
    }))
    return []
  }, [budgetData, cp])

  const bac = evmTasks.reduce((s:number,t:any)=>s+(t.bac??0),0)
  const pv  = evmTasks.reduce((s:number,t:any)=>s+(t.pv?.[cp]??0),0)
  const ev  = evmTasks.reduce((s:number,t:any)=>s+(t.ev?.[cp]??0),0)
  const ac  = evmTasks.reduce((s:number,t:any)=>s+(t.ac?.[cp]??0),0)
  const cpi = ac>0?Math.round(ev/ac*100)/100:null
  const spi = pv>0?Math.round(ev/pv*100)/100:null
  const cv  = ev-ac; const sv = ev-pv
  const eac = cpi&&cpi>0?Math.round(bac/cpi):bac
  const vac = bac-eac

  // RAID
  const raidItems   = raidData?.items ?? []
  const raidCrit    = raidItems.filter((i:any)=>i.priority==="Critique"&&i.status==="Ouvert")
  const raidOpen    = raidItems.filter((i:any)=>i.status==="Ouvert")

  // Jalons
  const jalonsAll    = jalonsData?.jalons ?? []
  const jalonsNext   = jalonsAll.filter((j:any)=>j.date>=today&&j.status!=="Atteint").slice(0,3)
  const jalonsRetard = jalonsAll.filter((j:any)=>j.date<today&&j.status!=="Atteint")

  // Score RAG
  let ragScore = 100
  if (cpi!==null&&cpi<0.9) ragScore-=30; else if (cpi!==null&&cpi<1) ragScore-=15
  if (spi!==null&&spi<0.9) ragScore-=25; else if (spi!==null&&spi<1) ragScore-=10
  ragScore -= raidCrit.length*10
  ragScore -= jalonsRetard.length*8
  ragScore += Math.min(20,(project?.completion??0)*0.2)
  ragScore = Math.max(0,Math.min(100,Math.round(ragScore)))

  const generateAI = async () => {
    if (!project) return
    setGenerating(true); toast.info("Génération du commentaire IA...")
    try {
      const context = `Projet: ${project.name}. Avancement: ${project.completion??0}%. CPI: ${cpi??'N/A'}. SPI: ${spi??'N/A'}. Risques critiques: ${raidCrit.length}. Jalons en retard: ${jalonsRetard.length}.`
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"codir-commentary", projectName:project.name, projectDescription:context })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const d = json.data
      setCommentary(d.commentary??d.commentaire??"")
      setDecisions(d.decisions?.join("\n")??d.decisions??"")
      setNextSteps(d.nextSteps?.join("\n")??d.prochaines_etapes??"")
      toast.success("Commentaires générés")
    } catch(e:any) { toast.error(e.message) }
    finally { setGenerating(false) }
  }

  const print = () => window.print()

  const fmtSign = (n:number) => (n>=0?"+":"")+fmt(n)

  const RAGc = ragColor(ragScore)
  const RAGl = ragLabel(ragScore)

  return (
    <AppLayout>
      <ToolLayout title="Rapport CODIR" icon="📊" subtitle="// COMITÉ DE PILOTAGE"
        history={[]} onLoadHistory={()=>{}} onGenerate={generateAI} generateLabel="Générer commentaires IA" generating={generating}
        projectName={project?.name}>

        {/* Contrôles */}
        <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ fontSize:11, color:"var(--text-3)" }}>N° rapport :</div>
            <input value={reportNum} onChange={e=>setReportNum(e.target.value)} style={{ width:60, fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)" }}/>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ fontSize:11, color:"var(--text-3)" }}>Date :</div>
            <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 8px", background:"var(--bg)", color:"var(--text-1)" }}/>
          </div>
          <button onClick={() => setPreview(!preview)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8, background:preview?"var(--primary-bg)":"transparent", color:preview?"var(--primary-light)":"var(--text-2)", fontSize:12, cursor:"pointer" }}>
            {preview?<><EyeOff size={12}/> Éditer</>:<><Eye size={12}/> Aperçu</>}
          </button>
          <button onClick={print} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer", marginLeft:"auto" }}>
            <Printer size={13}/> Imprimer / PDF
          </button>
        </div>

        {/* Édition commentaires */}
        {!preview && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", marginBottom:16, display:"flex", flexDirection:"column", gap:10 }}>
            <h4 style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", margin:0 }}>✏️ Commentaires manuels</h4>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3, textTransform:"uppercase", fontWeight:600 }}>Synthèse / Faits marquants</div>
              <textarea value={commentary} onChange={e=>setCommentary(e.target.value)} rows={4} placeholder="Résumé de la période, faits marquants..."
                style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:7, padding:"8px 10px", background:"var(--bg)", color:"var(--text-1)", resize:"vertical", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3, textTransform:"uppercase", fontWeight:600 }}>Décisions demandées</div>
              <textarea value={decisions} onChange={e=>setDecisions(e.target.value)} rows={3} placeholder="Une décision par ligne..."
                style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:7, padding:"8px 10px", background:"var(--bg)", color:"var(--text-1)", resize:"vertical", boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3, textTransform:"uppercase", fontWeight:600 }}>Prochaines étapes</div>
              <textarea value={nextSteps} onChange={e=>setNextSteps(e.target.value)} rows={3} placeholder="Une action par ligne..."
                style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:7, padding:"8px 10px", background:"var(--bg)", color:"var(--text-1)", resize:"vertical", boxSizing:"border-box" }}/>
            </div>
          </div>
        )}

        {/* ── RAPPORT IMPRIMABLE ── */}
        <div id="codir-report" style={{ background:"#fff", color:"#111", fontFamily:"Arial, sans-serif", borderRadius:12, border:"1px solid var(--border)", overflow:"hidden" }}>

          {/* PAGE 1 */}
          <div style={{ padding:"28px 32px", pageBreakAfter:"always" }}>
            {/* En-tête */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, paddingBottom:14, borderBottom:"2px solid #1e3a5f" }}>
              <div>
                <div style={{ fontSize:9, fontWeight:700, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:"2px", marginBottom:4 }}>Rapport de Comité de Pilotage</div>
                <h1 style={{ fontSize:18, fontWeight:900, color:"#111", margin:"0 0 4px" }}>{project?.name || "Projet"}</h1>
                <div style={{ fontSize:11, color:"#64748b" }}>{project?.description?.slice(0,100)}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:28, fontWeight:900, color:RAGc, lineHeight:1 }}>{RAGl}</div>
                <div style={{ fontSize:10, color:"#64748b", marginTop:4 }}>Score : {ragScore}/100</div>
                <div style={{ fontSize:10, color:"#64748b" }}>Rapport N°{reportNum} · {new Date(reportDate).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
              </div>
            </div>

            {/* Bandeau KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:20 }}>
              {[
                { label:"Avancement",  value:(project?.completion??0)+"%",     color:"#7B5EFF" },
                { label:"Budget BAC",  value:bac>0?fmt(bac):"—",              color:"#f59e0b" },
                { label:"CPI",         value:cpi?cpi.toFixed(2):"—",           color:cpi===null?"#64748b":cpi>=1?"#22c55e":"#ef4444" },
                { label:"SPI",         value:spi?spi.toFixed(2):"—",           color:spi===null?"#64748b":spi>=1?"#22c55e":"#ef4444" },
                { label:"EAC",         value:bac>0?fmt(eac):"—",              color:"#f97316" },
                { label:"Risques crit",value:raidCrit.length,                  color:raidCrit.length>0?"#ef4444":"#22c55e" },
              ].map(k => (
                <div key={k.label} style={{ background:"#f8fafc", borderRadius:7, padding:"8px 10px", textAlign:"center", border:"1px solid #e2e8f0" }}>
                  <div style={{ fontSize:9, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>{k.label}</div>
                  <div style={{ fontSize:16, fontWeight:900, color:k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Grille principale */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              {/* EVM détail */}
              <div style={{ border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden" }}>
                <div style={{ background:"#1e3a5f", color:"#fff", padding:"7px 12px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>📊 Indicateurs EVM — {MONTHS[cp]}</div>
                <div style={{ padding:"10px 12px" }}>
                  {evmTasks.length > 0 ? (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {[
                        { label:"PV — Valeur planifiée", value:fmt(pv),       color:"#3b82f6" },
                        { label:"EV — Valeur acquise",   value:fmt(ev),       color:"#7B5EFF" },
                        { label:"AC — Coût réel",        value:fmt(ac),       color:"#f59e0b" },
                        { label:"CV — Écart coût",       value:fmtSign(cv),   color:cv>=0?"#22c55e":"#ef4444" },
                        { label:"SV — Écart délai",      value:fmtSign(sv),   color:sv>=0?"#22c55e":"#ef4444" },
                        { label:"VAC — Écart à fin",     value:fmtSign(vac),  color:vac>=0?"#22c55e":"#ef4444" },
                      ].map(m => (
                        <div key={m.label} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:"1px solid #f1f5f9", fontSize:11 }}>
                          <span style={{ color:"#64748b" }}>{m.label}</span>
                          <span style={{ fontWeight:700, color:m.color }}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize:11, color:"#94a3b8", textAlign:"center", padding:"10px 0", margin:0 }}>Aucune donnée EVM — générez un Budget EVM</p>
                  )}
                </div>
              </div>

              {/* RAID résumé */}
              <div style={{ border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden" }}>
                <div style={{ background:"#7f1d1d", color:"#fff", padding:"7px 12px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>⚠️ RAID — Risques & Actions</div>
                <div style={{ padding:"10px 12px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
                    {[
                      { label:"Total",     value:raidItems.length,  color:"#374151" },
                      { label:"Critiques", value:raidCrit.length,   color:"#ef4444" },
                      { label:"Ouverts",   value:raidOpen.length,   color:"#f59e0b" },
                    ].map(k => (
                      <div key={k.label} style={{ textAlign:"center", background:"#f8fafc", borderRadius:5, padding:"5px" }}>
                        <div style={{ fontSize:16, fontWeight:800, color:k.color }}>{k.value}</div>
                        <div style={{ fontSize:9, color:"#64748b" }}>{k.label}</div>
                      </div>
                    ))}
                  </div>
                  {raidCrit.slice(0,3).map((r:any,i:number) => (
                    <div key={i} style={{ padding:"4px 8px", background:"#fef2f2", borderRadius:5, borderLeft:"3px solid #ef4444", marginBottom:4, fontSize:10 }}>
                      <span style={{ fontWeight:700, color:"#ef4444" }}>{r.title}</span>
                      {r.owner && <span style={{ color:"#64748b" }}> — {r.owner}</span>}
                    </div>
                  ))}
                  {raidCrit.length===0 && <p style={{ fontSize:11, color:"#22c55e", textAlign:"center", margin:0 }}>✅ Aucun risque critique</p>}
                </div>
              </div>
            </div>

            {/* Jalons */}
            <div style={{ border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden", marginBottom:16 }}>
              <div style={{ background:"#065f46", color:"#fff", padding:"7px 12px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>🏁 Jalons — Prochaines échéances</div>
              <div style={{ padding:"10px 12px" }}>
                {jalonsRetard.length>0 && (
                  <div style={{ padding:"5px 10px", background:"#fef2f2", borderRadius:5, borderLeft:"3px solid #ef4444", marginBottom:8, fontSize:10, color:"#ef4444", fontWeight:700 }}>
                    ⚠️ {jalonsRetard.length} jalon(s) en retard
                  </div>
                )}
                {jalonsNext.length>0 ? (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {jalonsNext.map((j:any,i:number) => {
                      const daysLeft = Math.round((new Date(j.date).getTime()-Date.now())/86400000)
                      return (
                        <div key={i} style={{ padding:"6px 10px", background:"#f0fdf4", borderRadius:5, border:"1px solid #bbf7d0" }}>
                          <div style={{ fontSize:10, fontWeight:700, color:"#065f46" }}>{j.name}</div>
                          <div style={{ fontSize:9, color:"#64748b" }}>{j.date} · <span style={{ color:daysLeft<=7?"#ef4444":"#065f46", fontWeight:700 }}>{daysLeft}j</span></div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize:11, color:"#94a3b8", textAlign:"center", margin:0 }}>Aucun jalon dans les 30 prochains jours</p>
                )}
              </div>
            </div>

            {/* Commentaires */}
            {commentary && (
              <div style={{ border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden", marginBottom:16 }}>
                <div style={{ background:"#312e81", color:"#fff", padding:"7px 12px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>💬 Synthèse — Faits marquants</div>
                <div style={{ padding:"10px 12px", fontSize:11, lineHeight:1.6, color:"#374151", whiteSpace:"pre-line" }}>{commentary}</div>
              </div>
            )}
          </div>

          {/* PAGE 2 */}
          <div style={{ padding:"28px 32px", borderTop:"2px dashed #e2e8f0" }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:"2px", marginBottom:16 }}>Rapport CODIR · {project?.name} · Page 2</div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {/* Décisions demandées */}
              <div style={{ border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden" }}>
                <div style={{ background:"#1e3a5f", color:"#fff", padding:"7px 12px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>📌 Décisions demandées</div>
                <div style={{ padding:"12px" }}>
                  {decisions ? decisions.split("\n").filter(Boolean).map((d,i) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:6, padding:"5px 8px", background:"#eff6ff", borderRadius:5, borderLeft:"3px solid #3b82f6", fontSize:11 }}>
                      <span style={{ fontWeight:700, color:"#1e40af", flexShrink:0 }}>{i+1}.</span>
                      <span style={{ color:"#374151" }}>{d}</span>
                    </div>
                  )) : (
                    <div style={{ padding:"16px 0", textAlign:"center" }}>
                      {[1,2,3].map(i => <div key={i} style={{ height:20, background:"#f8fafc", borderRadius:3, marginBottom:6 }}/>)}
                    </div>
                  )}
                </div>
              </div>

              {/* Prochaines étapes */}
              <div style={{ border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden" }}>
                <div style={{ background:"#065f46", color:"#fff", padding:"7px 12px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>🎯 Prochaines étapes</div>
                <div style={{ padding:"12px" }}>
                  {nextSteps ? nextSteps.split("\n").filter(Boolean).map((s,i) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:6, padding:"5px 8px", background:"#f0fdf4", borderRadius:5, borderLeft:"3px solid #22c55e", fontSize:11 }}>
                      <span style={{ fontWeight:700, color:"#065f46", flexShrink:0 }}>{i+1}.</span>
                      <span style={{ color:"#374151" }}>{s}</span>
                    </div>
                  )) : (
                    <div style={{ padding:"16px 0", textAlign:"center" }}>
                      {[1,2,3].map(i => <div key={i} style={{ height:20, background:"#f8fafc", borderRadius:3, marginBottom:6 }}/>)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tableau de bord visuel */}
            <div style={{ marginTop:16, border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden" }}>
              <div style={{ background:"#374151", color:"#fff", padding:"7px 12px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>📈 Tableau de bord synthétique</div>
              <div style={{ padding:"12px", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                {[
                  { label:"Avancement projet",     value:(project?.completion??0)+"%",        bar:project?.completion??0,         color:"#7B5EFF" },
                  { label:"Performance budget",     value:cpi?cpi.toFixed(2):"N/A",            bar:cpi?Math.min(100,cpi*100):50,  color:cpi===null?"#64748b":cpi>=1?"#22c55e":"#ef4444" },
                  { label:"Performance délais",     value:spi?spi.toFixed(2):"N/A",            bar:spi?Math.min(100,spi*100):50,  color:spi===null?"#64748b":spi>=1?"#22c55e":"#ef4444" },
                  { label:"Score santé global",     value:ragScore+"/100",                     bar:ragScore,                       color:RAGc },
                ].map(k => (
                  <div key={k.label} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:9, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{k.label}</div>
                    <div style={{ fontSize:18, fontWeight:900, color:k.color, marginBottom:4 }}>{k.value}</div>
                    <div style={{ height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ width:k.bar+"%", height:"100%", background:k.color, borderRadius:3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pied de page */}
            <div style={{ marginTop:20, paddingTop:12, borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", fontSize:9, color:"#94a3b8" }}>
              <span>Document confidentiel — {project?.name}</span>
              <span>Rapport N°{reportNum} · Généré par PMO AI Studio · {new Date(reportDate).toLocaleDateString("fr-FR")}</span>
              <span>Page 2/2</span>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            #codir-report, #codir-report * { visibility: visible; }
            #codir-report { position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}</style>
      </ToolLayout>
    </AppLayout>
  )
}
