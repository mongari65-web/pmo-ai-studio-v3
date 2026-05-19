import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const { id } = await params
    const { data: project } = await supabase.from("projects").select("*").eq("id", id).single()
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })

    const { data: tools } = await supabase.from("project_tools").select("tool_type,data").eq("project_id", id)

    const cp = new Date().getMonth()
    const today = new Date().toISOString().split("T")[0]
    const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

    // EVM
    const budgetTool = tools?.find(t=>t.tool_type==="budget")
    let cpi:number|null=null, spi:number|null=null, bac=0, pv=0, ev=0, ac=0
    if (budgetTool?.data) {
      const tasks = budgetTool.data.tasks ?? []
      bac = tasks.reduce((s:number,t:any)=>s+(t.bac??0),0)
      pv  = tasks.reduce((s:number,t:any)=>s+(t.pv?.[cp]??0),0)
      ev  = tasks.reduce((s:number,t:any)=>s+(t.ev?.[cp]??0),0)
      ac  = tasks.reduce((s:number,t:any)=>s+(t.ac?.[cp]??0),0)
      if (ac>0) cpi = Math.round(ev/ac*100)/100
      if (pv>0) spi = Math.round(ev/pv*100)/100
    }

    const raidTool  = tools?.find(t=>t.tool_type==="raid")
    const raidItems = raidTool?.data?.items ?? []
    const raidCrit  = raidItems.filter((i:any)=>i.priority==="Critique"&&i.status==="Ouvert")

    const jalonsTool = tools?.find(t=>t.tool_type==="jalons")
    const jalonsNext = (jalonsTool?.data?.jalons??[])
      .filter((j:any)=>j.date>=today&&j.status!=="Atteint")
      .map((j:any)=>({ name:j.name, date:j.date, daysLeft:Math.round((new Date(j.date).getTime()-Date.now())/86400000) }))
      .sort((a:any,b:any)=>a.daysLeft-b.daysLeft).slice(0,5)

    let ragScore = 100
    if (cpi!==null&&cpi<0.9) ragScore-=30; else if (cpi!==null&&cpi<1) ragScore-=15
    if (spi!==null&&spi<0.9) ragScore-=25; else if (spi!==null&&spi<1) ragScore-=10
    ragScore -= raidCrit.length*10
    ragScore = Math.max(0,Math.min(100,ragScore))
    const rag = ragScore>=75?"VERT":ragScore>=50?"AMBRE":"ROUGE"
    const ragColor = ragScore>=75?"00C875":ragScore>=50?"F59E0B":"EF4444"

    const fmt = (n:number) => n>=1000000?(n/1000000).toFixed(1)+"M€":n>=1000?(n/1000).toFixed(0)+"k€":n+"€"
    const fmtSign = (n:number) => (n>=0?"+":"")+fmt(n)

    // Générer PPTX via pptxgenjs (import dynamique)
    const PptxGenJS = (await import("pptxgenjs")).default
    const pptx = new PptxGenJS()

    pptx.layout = "LAYOUT_WIDE"
    pptx.author = "PMO AI Studio"
    pptx.company = "PMO AI Studio"
    pptx.subject = "Rapport CODIR — "+project.name
    pptx.title   = project.name

    const DARK = "0F172A"
    const DARK2 = "1E293B"
    const VIOLET = "7B5EFF"
    const WHITE = "F1F5F9"
    const GRAY = "64748B"

    // ── Slide 1 : Titre ──────────────────────────────────────────
    const s1 = pptx.addSlide()
    s1.background = { color: DARK }

    // Bande violette gauche
    s1.addShape(pptx.ShapeType.rect, { x:0, y:0, w:0.08, h:"100%", fill:{ color:VIOLET } })

    // Titre
    s1.addText("RAPPORT DE COMITÉ DE PILOTAGE", { x:0.3, y:0.6, w:9, h:0.4, fontSize:10, color:GRAY, bold:true, charSpacing:2 })
    s1.addText(project.name, { x:0.3, y:1.1, w:9, h:1.2, fontSize:32, color:WHITE, bold:true, wrap:true })
    if (project.description) {
      s1.addText(project.description.slice(0,120), { x:0.3, y:2.4, w:7, h:0.6, fontSize:12, color:GRAY })
    }

    // RAG badge
    s1.addShape(pptx.ShapeType.roundRect, { x:8.5, y:0.8, w:2.5, h:0.8, fill:{ color:ragColor }, rectRadius:0.1 })
    s1.addText("🎯 "+rag, { x:8.5, y:0.9, w:2.5, h:0.6, fontSize:14, color:"FFFFFF", bold:true, align:"center" })

    // Score
    s1.addText("Score santé : "+ragScore+"/100", { x:8.5, y:1.7, w:2.5, h:0.4, fontSize:11, color:GRAY, align:"center" })

    // Date + métadonnées
    s1.addText(new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}), { x:0.3, y:3.3, w:5, h:0.3, fontSize:10, color:GRAY })
    s1.addText("PMO AI Studio · PMBOK 7", { x:0.3, y:3.65, w:5, h:0.25, fontSize:9, color:GRAY })

    // Barre de progression avancement
    s1.addShape(pptx.ShapeType.rect, { x:0.3, y:4.2, w:10.5, h:0.12, fill:{ color:DARK2 } })
    s1.addShape(pptx.ShapeType.rect, { x:0.3, y:4.2, w:10.5*(project.completion??0)/100, h:0.12, fill:{ color:VIOLET } })
    s1.addText("Avancement : "+(project.completion??0)+"%", { x:0.3, y:4.4, w:5, h:0.3, fontSize:10, color:WHITE })

    // ── Slide 2 : KPIs EVM ──────────────────────────────────────
    const s2 = pptx.addSlide()
    s2.background = { color: DARK }
    s2.addShape(pptx.ShapeType.rect, { x:0, y:0, w:0.08, h:"100%", fill:{ color:VIOLET } })
    s2.addText("INDICATEURS EVM — "+MONTHS[cp].toUpperCase(), { x:0.3, y:0.2, w:10, h:0.4, fontSize:10, color:GRAY, bold:true, charSpacing:2 })
    s2.addText("Performance Coût & Délais", { x:0.3, y:0.6, w:10, h:0.6, fontSize:24, color:WHITE, bold:true })

    const kpis = [
      { label:"CPI", value:cpi?cpi.toFixed(2):"N/A", color:cpi===null?"888888":cpi>=1?"00C875":"EF4444", sub:"Perf. coût" },
      { label:"SPI", value:spi?spi.toFixed(2):"N/A", color:spi===null?"888888":spi>=1?"00C875":"EF4444", sub:"Perf. délais" },
      { label:"CV",  value:bac>0?fmtSign(ev-ac):"N/A", color:(ev-ac)>=0?"00C875":"EF4444", sub:"Écart coût" },
      { label:"SV",  value:bac>0?fmtSign(ev-pv):"N/A", color:(ev-pv)>=0?"00C875":"EF4444", sub:"Écart délais" },
      { label:"EAC", value:bac>0&&cpi?fmt(Math.round(bac/cpi)):"N/A", color:"F59E0B", sub:"Prévision finale" },
      { label:"BAC", value:bac>0?fmt(bac):"N/A", color:GRAY, sub:"Budget total" },
    ]

    kpis.forEach((k,i) => {
      const x = 0.3 + (i%3)*3.7
      const y = 1.5 + Math.floor(i/3)*1.6
      s2.addShape(pptx.ShapeType.roundRect, { x, y, w:3.4, h:1.4, fill:{ color:DARK2 }, rectRadius:0.1 })
      s2.addText(k.label, { x, y:y+0.1, w:3.4, h:0.4, fontSize:10, color:GRAY, align:"center", charSpacing:1 })
      s2.addText(k.value, { x, y:y+0.4, w:3.4, h:0.6, fontSize:22, color:k.color, bold:true, align:"center" })
      s2.addText(k.sub, { x, y:y+1.0, w:3.4, h:0.3, fontSize:9, color:GRAY, align:"center" })
    })

    // ── Slide 3 : RAID ──────────────────────────────────────────
    const s3 = pptx.addSlide()
    s3.background = { color: DARK }
    s3.addShape(pptx.ShapeType.rect, { x:0, y:0, w:0.08, h:"100%", fill:{ color:"EF4444" } })
    s3.addText("REGISTRE RAID — RISQUES CRITIQUES", { x:0.3, y:0.2, w:10, h:0.4, fontSize:10, color:GRAY, bold:true, charSpacing:2 })
    s3.addText(raidCrit.length+" risque(s) critique(s) ouvert(s)", { x:0.3, y:0.6, w:10, h:0.6, fontSize:22, color:"EF4444", bold:true })

    const raidRows = raidCrit.slice(0,8).map((r:any)=>[
      { text:r.title?.slice(0,40)||"—", options:{ color:WHITE, fontSize:10 } },
      { text:r.owner||"—", options:{ color:GRAY, fontSize:9 } },
      { text:r.due_date||"—", options:{ color:GRAY, fontSize:9 } },
      { text:r.status||"Ouvert", options:{ color:"F59E0B", fontSize:9 } },
    ])

    if (raidRows.length > 0) {
      s3.addTable(
        [[
          { text:"TITRE RISQUE", options:{ bold:true, color:WHITE, fontSize:9, fill:DARK2 } },
          { text:"RESPONSABLE", options:{ bold:true, color:WHITE, fontSize:9, fill:DARK2 } },
          { text:"ÉCHÉANCE", options:{ bold:true, color:WHITE, fontSize:9, fill:DARK2 } },
          { text:"STATUT", options:{ bold:true, color:WHITE, fontSize:9, fill:DARK2 } },
        ], ...raidRows],
        { x:0.3, y:1.4, w:10.7, h:0.4, colW:[5.5,2,1.8,1.4], rowH:0.45, border:{ type:"solid", color:DARK2, pt:1 }, fill:{ color:DARK } }
      )
    } else {
      s3.addText("✅ Aucun risque critique ouvert", { x:0.3, y:2, w:10, h:0.6, fontSize:16, color:"00C875", align:"center" })
    }

    // ── Slide 4 : Jalons ────────────────────────────────────────
    const s4 = pptx.addSlide()
    s4.background = { color: DARK }
    s4.addShape(pptx.ShapeType.rect, { x:0, y:0, w:0.08, h:"100%", fill:{ color:"065F46" } })
    s4.addText("JALONS — PROCHAINES ÉCHÉANCES", { x:0.3, y:0.2, w:10, h:0.4, fontSize:10, color:GRAY, bold:true, charSpacing:2 })
    s4.addText(jalonsNext.length+" jalon(s) dans les 30 prochains jours", { x:0.3, y:0.6, w:10, h:0.6, fontSize:20, color:WHITE, bold:true })

    jalonsNext.forEach((j:any, i:number) => {
      const y = 1.5 + i*0.75
      const color = j.daysLeft<=7?"EF4444":j.daysLeft<=14?"F59E0B":"22C55E"
      s4.addShape(pptx.ShapeType.roundRect, { x:0.3, y, w:10.7, h:0.65, fill:{ color:DARK2 }, rectRadius:0.05 })
      s4.addText(j.name.slice(0,50), { x:0.5, y:y+0.1, w:7, h:0.4, fontSize:12, color:WHITE })
      s4.addText(j.date, { x:7.8, y:y+0.1, w:1.5, h:0.4, fontSize:10, color:GRAY, align:"center" })
      s4.addText(j.daysLeft+"j", { x:9.5, y:y+0.1, w:1.2, h:0.4, fontSize:14, color:color, bold:true, align:"center" })
    })

    if (!jalonsNext.length) {
      s4.addText("Aucun jalon dans les 30 prochains jours", { x:0.3, y:2, w:10, h:0.6, fontSize:14, color:GRAY, align:"center" })
    }

    // ── Slide 5 : Synthèse ──────────────────────────────────────
    const s5 = pptx.addSlide()
    s5.background = { color: DARK }
    s5.addShape(pptx.ShapeType.rect, { x:0, y:0, w:0.08, h:"100%", fill:{ color:VIOLET } })
    s5.addText("SYNTHÈSE & PROCHAINES ÉTAPES", { x:0.3, y:0.2, w:10, h:0.4, fontSize:10, color:GRAY, bold:true, charSpacing:2 })
    s5.addText("Points clés du projet", { x:0.3, y:0.6, w:10, h:0.6, fontSize:22, color:WHITE, bold:true })

    // Zone décisions
    s5.addShape(pptx.ShapeType.roundRect, { x:0.3, y:1.4, w:5, h:3.0, fill:{ color:DARK2 }, rectRadius:0.1 })
    s5.addText("📌 DÉCISIONS DEMANDÉES", { x:0.4, y:1.5, w:4.8, h:0.4, fontSize:10, color:VIOLET, bold:true })
    s5.addText("[ Saisissez les décisions à prendre ]", { x:0.4, y:2.0, w:4.8, h:2.2, fontSize:11, color:GRAY, valign:"top" })

    // Zone prochaines étapes
    s5.addShape(pptx.ShapeType.roundRect, { x:5.7, y:1.4, w:5.4, h:3.0, fill:{ color:DARK2 }, rectRadius:0.1 })
    s5.addText("🎯 PROCHAINES ÉTAPES", { x:5.8, y:1.5, w:5.2, h:0.4, fontSize:10, color:"00C875", bold:true })
    s5.addText("[ Saisissez les actions à venir ]", { x:5.8, y:2.0, w:5.2, h:2.2, fontSize:11, color:GRAY, valign:"top" })

    // Footer
    s5.addText("PMO AI Studio · "+project.name+" · "+new Date().toLocaleDateString("fr-FR"), { x:0.3, y:4.8, w:10, h:0.3, fontSize:9, color:GRAY, align:"center" })

    // Générer le buffer
    const buffer = await pptx.write({ outputType:"arraybuffer" }) as ArrayBuffer

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="CODIR_${project.name.replace(/[^a-zA-Z0-9]/g,"_")}_${today}.pptx"`,
      }
    })
  } catch(e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
