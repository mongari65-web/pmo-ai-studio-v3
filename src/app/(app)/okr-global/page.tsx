"use client"
import { useEffect, useState, useMemo } from "react"
import { exportPDF } from "@/lib/exportAll"
import { Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Target, RefreshCw, Plus, TrendingUp } from "lucide-react"
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts"

interface KR { id:string; text:string; unit:string; target:number; current:number; weight:number }
interface Objective { id:string; title:string; description:string; owner:string; quarter:string; category:string; keyResults:KR[] }

const progress = (kr:KR) => kr.target>0?Math.min(100,Math.round(kr.current/kr.target*100)):0
const objProgress = (obj:Objective) => {
  if (!obj.keyResults?.length) return 0
  const totalW = obj.keyResults.reduce((s,kr)=>s+kr.weight,0)
  if (!totalW) return 0
  return Math.round(obj.keyResults.reduce((s,kr)=>s+(progress(kr)*kr.weight),0)/totalW)
}
const progressColor = (p:number) => p>=80?"#22c55e":p>=60?"#3b82f6":p>=40?"#f59e0b":"#ef4444"

const CATEGORIES = ["Stratégique","Opérationnel","Client","Qualité","RH","Finance","Innovation"]
const CAT_COLORS: Record<string,string> = {
  "Stratégique":"#7B5EFF","Opérationnel":"#3b82f6","Client":"#22c55e",
  "Qualité":"#f59e0b","RH":"#f97316","Finance":"#ef4444","Innovation":"#06b6d4"
}

export default function OKRGlobalPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [allOKRs, setAllOKRs]   = useState<{ project:any; objectives:Objective[] }[]>([])
  const [loading, setLoading]   = useState(true)
  const [filterQ, setFilterQ]   = useState("all")
  const [filterCat, setFilterCat] = useState("all")
  const [view, setView]         = useState<"portfolio"|"list">("portfolio")
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: projs } = await supabase.from("projects").select("*").order("updated_at", { ascending:false })
    const { data: tools } = await supabase.from("project_tools").select("project_id,data").eq("tool_type","okr")

    if (!projs) { setLoading(false); return }
    setProjects(projs)

    const okrs = projs.map(p => {
      const t = tools?.find(t=>t.project_id===p.id)
      return { project:p, objectives: t?.data?.objectives ?? [] }
    }).filter(x=>x.objectives.length>0)

    setAllOKRs(okrs)
    setLoading(false)
  }

  // Stats globales
  const allObjectives = useMemo(() => allOKRs.flatMap(x=>x.objectives), [allOKRs])
  const allKRs        = useMemo(() => allObjectives.flatMap(o=>o.keyResults??[]), [allObjectives])
  const avgProgress   = allObjectives.length ? Math.round(allObjectives.reduce((s,o)=>s+objProgress(o),0)/allObjectives.length) : 0
  const onTrack       = allObjectives.filter(o=>objProgress(o)>=70).length
  const atRisk        = allObjectives.filter(o=>objProgress(o)<40&&objProgress(o)>0).length

  // Radar par catégorie
  const radarData = CATEGORIES.map(cat => {
    const catObjs = allObjectives.filter(o=>o.category===cat)
    return { cat, score: catObjs.length ? Math.round(catObjs.reduce((s,o)=>s+objProgress(o),0)/catObjs.length) : 0, count:catObjs.length }
  }).filter(d=>d.count>0)

  // Quarters disponibles
  const quarters = [...new Set(allObjectives.map(o=>o.quarter))].sort()

  const filtered = allOKRs.map(x => ({
    ...x,
    objectives: x.objectives.filter(o =>
      (filterQ==="all"||o.quarter===filterQ) &&
      (filterCat==="all"||o.category===filterCat)
    )
  })).filter(x=>x.objectives.length>0)

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// OKR PORTFOLIO</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}><h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>OKR — Vue Portfolio</h1><button onClick={()=>window.print()} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--primary-light)", cursor:"pointer" }}><Download size={13}/> Exporter PDF</button></div>
            <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>Objectifs & Résultats Clés — tous projets</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={loadData} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
              <RefreshCw size={13}/> Actualiser
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
          {[
            { label:"Projets avec OKRs", value:allOKRs.length,      color:"var(--primary)" },
            { label:"Objectifs total",   value:allObjectives.length, color:"#3b82f6" },
            { label:"KRs total",         value:allKRs.length,        color:"#7B5EFF" },
            { label:"Progression moy.",  value:avgProgress+"%",      color:progressColor(avgProgress) },
            { label:"On Track ✅",       value:onTrack,              color:"#22c55e" },
            { label:"À risque ⚠️",       value:atRisk,               color:"#ef4444" },
          ].map(k => (
            <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Radar + stats catégories */}
        {radarData.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:14 }}>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px" }}>🕸️ Radar par catégorie</h3>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)"/>
                  <PolarAngleAxis dataKey="cat" tick={{ fontSize:9, fill:"var(--text-3)" }}/>
                  <Radar dataKey="score" stroke="#7B5EFF" fill="#7B5EFF" fillOpacity={0.2}/>
                  <Tooltip contentStyle={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:11 }} formatter={(v:any)=>Math.round(v)+"%"}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>📊 Score par catégorie</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {radarData.sort((a,b)=>b.score-a.score).map(d => (
                  <div key={d.cat} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:11, color:CAT_COLORS[d.cat]||"var(--text-2)", fontWeight:600, minWidth:100 }}>{d.cat}</span>
                    <div style={{ flex:1, height:8, background:"var(--bg)", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ width:d.score+"%", height:"100%", background:CAT_COLORS[d.cat]||"#7B5EFF", borderRadius:4, transition:"width 0.4s" }}/>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:progressColor(d.score), minWidth:36 }}>{d.score}%</span>
                    <span style={{ fontSize:10, color:"var(--text-3)", minWidth:20 }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filtres + vue */}
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:4 }}>
            {["all",...quarters].map(q => (
              <button key={q} onClick={()=>setFilterQ(q)}
                style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterQ===q?"var(--primary)":"var(--border)"), background:filterQ===q?"var(--primary-bg)":"transparent", color:filterQ===q?"var(--primary-light)":"var(--text-3)" }}>
                {q==="all"?"Tous trimestres":q}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {["all",...CATEGORIES].map(c => (
              <button key={c} onClick={()=>setFilterCat(c)}
                style={{ padding:"5px 10px", borderRadius:20, fontSize:10, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterCat===c?(CAT_COLORS[c]||"var(--primary)"):"var(--border)"), background:filterCat===c?(CAT_COLORS[c]||"var(--primary)")+"22":"transparent", color:filterCat===c?(CAT_COLORS[c]||"var(--primary-light)"):"var(--text-3)" }}>
                {c==="all"?"Toutes":c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"40px", color:"var(--text-3)" }}>Chargement...</div>
        ) : allOKRs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucun OKR défini</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez des OKRs sur vos projets pour voir la vue portfolio</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {filtered.map(({ project:proj, objectives }) => (
              <div key={proj.id} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
                {/* Header projet */}
                <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", background:"rgba(123,94,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:18 }}>{proj.icon||"📁"}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"var(--primary-light)" }}>{proj.name}</span>
                  <span style={{ fontSize:11, color:"var(--text-3)", marginLeft:"auto" }}>{objectives.length} objectif{objectives.length>1?"s":""}</span>
                  <Link href={`/projects/${proj.id}/okr`} style={{ fontSize:11, color:"var(--primary-light)", textDecoration:"none", padding:"3px 10px", border:"1px solid rgba(123,94,255,0.3)", borderRadius:6 }}>
                    Gérer →
                  </Link>
                </div>

                {/* Objectifs */}
                <div style={{ padding:"10px 16px", display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                  {objectives.map(obj => {
                    const pct = objProgress(obj)
                    const pc  = progressColor(pct)
                    return (
                      <div key={obj.id} style={{ background:"var(--bg)", borderRadius:8, padding:"10px 12px", border:"1px solid "+pc+"33" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                          <Target size={12} style={{ color:pc, flexShrink:0 }}/>
                          <span style={{ fontSize:11, fontWeight:700, color:"var(--text-1)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{obj.title}</span>
                          <span style={{ fontSize:12, fontWeight:900, color:pc, flexShrink:0 }}>{pct}%</span>
                        </div>
                        <div style={{ height:5, background:"var(--bg-card)", borderRadius:3, overflow:"hidden", marginBottom:5 }}>
                          <div style={{ width:pct+"%", height:"100%", background:pc, borderRadius:3 }}/>
                        </div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:(CAT_COLORS[obj.category]||"#64748b")+"22", color:CAT_COLORS[obj.category]||"#64748b", fontWeight:600 }}>{obj.category}</span>
                          <span style={{ fontSize:9, color:"var(--text-3)" }}>📅 {obj.quarter}</span>
                          {obj.owner && <span style={{ fontSize:9, color:"var(--text-3)" }}>👤 {obj.owner}</span>}
                          <span style={{ fontSize:9, color:"var(--text-3)", marginLeft:"auto" }}>{obj.keyResults?.length||0} KRs</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
