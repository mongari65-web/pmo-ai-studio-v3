"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface Initiative { id:string; titre:string; description:string; type:"Rationalisation"|"Développement"|"Migration" }
interface RoadmapData { now:Initiative[]; next:Initiative[]; later:Initiative[] }

const TYPE_COLOR: Record<string,string> = { "Rationalisation":"#0d9488", "Développement":"#7B5EFF", "Migration":"#3b82f6" }
const COLS: { key:"now"|"next"|"later", label:string, sub:string, color:string }[] = [
  { key:"now",   label:"Now",   sub:"T1 — En cours",       color:"#22c55e" },
  { key:"next",  label:"Next",  sub:"T2-T3 — À planifier", color:"#f59e0b" },
  { key:"later", label:"Later", sub:"T4+ — Vision",        color:"#7B5EFF" },
]

export default function RoadmapNNLPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "roadmap-nnl")
  const [roadmap, setRoadmap] = useState<RoadmapData>({ now:[], next:[], later:[] })

  useState(() => { if (data?.now || data?.next || data?.later) setRoadmap({ now:data.now??[], next:data.next??[], later:data.later??[] }) })

  const saveAll = async (rm:RoadmapData) => { setRoadmap(rm); await save(rm) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération de la roadmap en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"roadmap-nnl", projectName:project.name, projectDescription:project.description, startDate:project.start_date, endDate:project.end_date })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const rm: RoadmapData = { now: json.data?.now??[], next: json.data?.next??[], later: json.data?.later??[] }
      await saveAll(rm)
      toast.success("Roadmap générée")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const deleteItem = (col:"now"|"next"|"later", itemId:string) =>
    saveAll({ ...roadmap, [col]: roadmap[col].filter(i=>i.id!==itemId) })

  const toRows = () => COLS.flatMap(c => roadmap[c.key].map(i => ({ Horizon:c.label, Titre:i.titre, Type:i.type, Description:i.description })))

  const total = roadmap.now.length + roadmap.next.length + roadmap.later.length

  return (
    <AppLayout>
      <ToolLayout title="Roadmap Now/Next/Later" icon="🗓️" subtitle="// TRAJECTOIRE SI"
        history={history} onLoadHistory={(e)=>{ loadHistory(e); if(e.data) setRoadmap({ now:e.data.now??[], next:e.data.next??[], later:e.data.later??[] }) }}
        onGenerate={generate} generateLabel="Générer la roadmap" generating={loading}
        exportRows={toRows()} exportFilename={"Roadmap_NNL_"+(project?.name??"")} projectName={project?.name}>

        {total > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {COLS.map(col => (
              <div key={col.key} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderTop:"3px solid "+col.color, borderRadius:10, padding:"14px" }}>
                <div style={{ marginBottom:12 }}>
                  <h3 style={{ fontSize:14, fontWeight:800, color:col.color, margin:0 }}>{col.label}</h3>
                  <p style={{ fontSize:10, color:"var(--text-3)", margin:0 }}>{col.sub}</p>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {roadmap[col.key].map(item => (
                    <div key={item.id} style={{ padding:"10px 12px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"var(--text-1)" }}>{item.titre}</span>
                        <button onClick={()=>deleteItem(col.key,item.id)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-3)" }}><Trash2 size={11}/></button>
                      </div>
                      <p style={{ fontSize:11, color:"var(--text-2)", margin:"0 0 6px", lineHeight:1.4 }}>{item.description}</p>
                      <span style={{ fontSize:9, padding:"2px 7px", borderRadius:20, fontWeight:600, color:TYPE_COLOR[item.type], background:TYPE_COLOR[item.type]+"18" }}>{item.type}</span>
                    </div>
                  ))}
                  {roadmap[col.key].length===0 && <p style={{ fontSize:11, color:"var(--text-3)", textAlign:"center", padding:"10px 0" }}>Aucune initiative</p>}
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗓️</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Roadmap vide</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez la trajectoire à partir de la matrice TIME et du backlog</p>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
