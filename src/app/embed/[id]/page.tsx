import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

function fmt(n:number) { return n>=1000000?(n/1000000).toFixed(1)+"M€":n>=1000?(n/1000).toFixed(0)+"k€":n+"€" }

export default async function EmbedPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: project } = await supabase.from("projects").select("*").eq("id", params.id).single()
  if (!project) notFound()

  const { data: tools } = await supabase.from("project_tools").select("tool_type,data").eq("project_id", params.id)

  const cp = new Date().getMonth()
  const today = new Date().toISOString().split("T")[0]

  // EVM
  const budgetTool = tools?.find(t=>t.tool_type==="budget")
  let cpi:number|null=null, spi:number|null=null, bac=0, ev=0, ac=0
  if (budgetTool?.data) {
    const tasks = budgetTool.data.tasks ?? (budgetTool.data.lines??[]).map((l:any,i:number)=>({
      bac:l.bac??0,
      pv:Array(12).fill(0).map((_:any,m:number)=>m<=cp?Math.round((l.pv??0)/(cp+1)):0),
      ev:Array(12).fill(0).map((_:any,m:number)=>m<=cp?Math.round((l.ev??0)/(cp+1)):0),
      ac:Array(12).fill(0).map((_:any,m:number)=>m<=cp?Math.round((l.ac??0)/(cp+1)):0),
    }))
    bac = tasks.reduce((s:number,t:any)=>s+(t.bac??0),0)
    const pv = tasks.reduce((s:number,t:any)=>s+(t.pv?.[cp]??0),0)
    ev  = tasks.reduce((s:number,t:any)=>s+(t.ev?.[cp]??0),0)
    ac  = tasks.reduce((s:number,t:any)=>s+(t.ac?.[cp]??0),0)
    if (ac>0) cpi = Math.round(ev/ac*100)/100
    if (pv>0) spi = Math.round(ev/pv*100)/100
  }

  // RAID
  const raidTool = tools?.find(t=>t.tool_type==="raid")
  const raidCrit = raidTool?.data?.items?.filter((i:any)=>i.priority==="Critique"&&i.status==="Ouvert")?.length ?? 0

  // Jalons
  const jalonsTool = tools?.find(t=>t.tool_type==="jalons")
  const jalonsNext = (jalonsTool?.data?.jalons??[]).filter((j:any)=>j.date>=today&&j.status!=="Atteint")
    .map((j:any)=>({ name:j.name, date:j.date, daysLeft:Math.round((new Date(j.date).getTime()-Date.now())/86400000) }))
    .sort((a:any,b:any)=>a.daysLeft-b.daysLeft).slice(0,3)

  // RAG
  let ragScore = 100
  if (cpi!==null&&cpi<0.9) ragScore-=30; else if (cpi!==null&&cpi<1) ragScore-=15
  if (spi!==null&&spi<0.9) ragScore-=25; else if (spi!==null&&spi<1) ragScore-=10
  ragScore -= raidCrit*10
  ragScore = Math.max(0,Math.min(100,ragScore))
  const rag = ragScore>=75?"G":ragScore>=50?"A":"R"
  const ragColor = rag==="G"?"#22c55e":rag==="A"?"#f59e0b":"#ef4444"
  const ragLabel = rag==="G"?"🟢 VERT":rag==="A"?"🟡 AMBRE":"🔴 ROUGE"

  const kpis = [
    { label:"Avancement",  value:(project.completion??0)+"%",       color:"#7B5EFF" },
    { label:"CPI",          value:cpi?cpi.toFixed(2):"N/A",          color:cpi===null?"#64748b":cpi>=1?"#22c55e":"#ef4444" },
    { label:"SPI",          value:spi?spi.toFixed(2):"N/A",          color:spi===null?"#64748b":spi>=1?"#22c55e":"#ef4444" },
    { label:"Budget BAC",   value:bac>0?fmt(bac):"N/A",              color:"#f59e0b" },
    { label:"Risques crit.",value:raidCrit,                           color:raidCrit>0?"#ef4444":"#22c55e" },
    { label:"Santé",        value:ragScore+"/100",                    color:ragColor },
  ]

  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>{project.name} — PMO AI Studio</title>
        <style>{`
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: Arial, sans-serif; background: #0f172a; color: #f1f5f9; padding: 12px; }
          .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #1e293b; }
          .project-name { font-size:14px; font-weight:800; color:#f1f5f9; }
          .rag { font-size:13px; font-weight:700; color:${ragColor}; }
          .kpis { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
          .kpi { background:#1e293b; border-radius:8px; padding:8px 10px; text-align:center; }
          .kpi-value { font-size:18px; font-weight:900; }
          .kpi-label { font-size:9px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }
          .section-title { font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
          .progress-bar { height:6px; background:#1e293b; border-radius:3px; overflow:hidden; margin-bottom:12px; }
          .progress-fill { height:100%; border-radius:3px; background:#7B5EFF; transition:width 0.4s; }
          .jalon { display:flex; align-items:center; justify-content:space-between; padding:5px 8px; background:#1e293b; border-radius:5px; margin-bottom:4px; font-size:11px; }
          .footer { margin-top:10px; padding-top:8px; border-top:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; }
          .footer-text { font-size:9px; color:#475569; }
          .badge { font-size:9px; padding:2px 6px; border-radius:4px; font-weight:600; }
        `}</style>
      </head>
      <body>
        {/* Header */}
        <div className="header">
          <div>
            <div style={{ fontSize:9, color:"#475569", marginBottom:2 }}>PMO AI STUDIO</div>
            <div className="project-name">{project.icon||"📁"} {project.name}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div className="rag">{ragLabel}</div>
            <div style={{ fontSize:9, color:"#64748b" }}>{new Date().toLocaleDateString("fr-FR")}</div>
          </div>
        </div>

        {/* Barre avancement */}
        <div className="section-title">Avancement projet</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width:(project.completion??0)+"%", background:"#7B5EFF" }}/>
        </div>

        {/* KPIs */}
        <div className="section-title">Indicateurs clés</div>
        <div className="kpis">
          {kpis.map(k => (
            <div key={k.label} className="kpi" style={{ borderTop:"2px solid "+k.color }}>
              <div className="kpi-value" style={{ color:k.color }}>{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Jalons */}
        {jalonsNext.length > 0 && (
          <>
            <div className="section-title">Jalons à venir</div>
            {jalonsNext.map((j:any,i:number) => (
              <div key={i} className="jalon">
                <span style={{ color:"#f1f5f9" }}>{j.name.slice(0,30)}{j.name.length>30?"…":""}</span>
                <span style={{ color:j.daysLeft<=7?"#ef4444":j.daysLeft<=14?"#f59e0b":"#3b82f6", fontWeight:700 }}>{j.daysLeft}j</span>
              </div>
            ))}
          </>
        )}

        {/* Footer */}
        <div className="footer">
          <span className="footer-text">Généré par PMO AI Studio</span>
          <span className="footer-text" style={{ color:"#475569" }}>Mis à jour : {new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>
        </div>
      </body>
    </html>
  )
}
