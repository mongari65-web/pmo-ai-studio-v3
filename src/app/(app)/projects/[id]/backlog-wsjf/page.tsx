"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface Item {
  id:string; titre:string; description:string; type:"Rationalisation"|"Nouveau besoin"
  businessValue:number; timeCriticality:number; riskReduction:number; jobSize:number
  wsjf:number; statut:"À faire"|"En cours"|"Fait"
}

const TYPE_COLOR: Record<string,string> = { "Rationalisation":"#0d9488", "Nouveau besoin":"#7B5EFF" }
const STATUT_COLOR: Record<string,string> = { "À faire":"var(--text-3)", "En cours":"#f59e0b", "Fait":"#22c55e" }

export default function BacklogWsjfPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "backlog-wsjf")
  const [items, setItems] = useState<Item[]>([])

  useState(() => { if (data?.items?.length) setItems(data.items) })

  const saveAll = async (list:Item[]) => { setItems(list); await save({ items:list }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération du backlog WSJF en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"backlog-wsjf", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const list: Item[] = (json.data?.items ?? []).map((it:any,i:number) => {
        const bv=it.businessValue??3, tc=it.timeCriticality??3, rr=it.riskReduction??3, js=it.jobSize||1
        return {
          id: it.id ?? "BL"+Date.now()+i, titre:it.titre??"", description:it.description??"", type:it.type??"Nouveau besoin",
          businessValue:bv, timeCriticality:tc, riskReduction:rr, jobSize:js,
          wsjf: it.wsjf ?? +(((bv+tc+rr)/js).toFixed(2)), statut:it.statut??"À faire"
        }
      }).sort((a:Item,b:Item)=>b.wsjf-a.wsjf)
      await saveAll(list)
      toast.success("Backlog généré — "+list.length+" items priorisés")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const deleteItem = (itemId:string) => saveAll(items.filter(i=>i.id!==itemId))
  const sorted = [...items].sort((a,b)=>b.wsjf-a.wsjf)

  const toRows = () => sorted.map(i => ({ Titre:i.titre, Type:i.type, "Business Value":i.businessValue, "Time Criticality":i.timeCriticality, "Risk Reduction":i.riskReduction, "Job Size":i.jobSize, WSJF:i.wsjf, Statut:i.statut }))

  return (
    <AppLayout>
      <ToolLayout title="Backlog WSJF" icon="📊" subtitle="// PRIORISATION SI"
        history={history} onLoadHistory={(e)=>{ loadHistory(e); if(e.data?.items) setItems(e.data.items) }}
        onGenerate={generate} generateLabel="Générer le backlog" generating={loading}
        exportRows={toRows()} exportFilename={"Backlog_WSJF_"+(project?.name??"")} projectName={project?.name}>

        {sorted.length > 0 ? (
          <div style={{ overflowX:"auto", border:"1px solid var(--border)", borderRadius:10 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"var(--bg-card)" }}>
                  {["#","Titre","Type","BV","TC","RR","JS","WSJF","Statut",""].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:"var(--text-3)", fontWeight:600, borderBottom:"1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((it,idx) => (
                  <tr key={it.id} style={{ borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"8px 10px", color:"var(--text-3)", fontWeight:700 }}>{idx+1}</td>
                    <td style={{ padding:"8px 10px" }}>
                      <div style={{ color:"var(--text-1)", fontWeight:600 }}>{it.titre}</div>
                      <div style={{ color:"var(--text-3)", fontSize:11 }}>{it.description}</div>
                    </td>
                    <td style={{ padding:"8px 10px" }}>
                      <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:600, color:TYPE_COLOR[it.type], background:TYPE_COLOR[it.type]+"18" }}>{it.type}</span>
                    </td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{it.businessValue}</td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{it.timeCriticality}</td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{it.riskReduction}</td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{it.jobSize}</td>
                    <td style={{ padding:"8px 10px", fontWeight:800, color:"var(--primary-light)" }}>{it.wsjf}</td>
                    <td style={{ padding:"8px 10px" }}>
                      <span style={{ fontSize:10, fontWeight:600, color:STATUT_COLOR[it.statut] }}>{it.statut}</span>
                    </td>
                    <td style={{ padding:"8px 10px" }}>
                      <button onClick={()=>deleteItem(it.id)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-3)" }}><Trash2 size={12}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Backlog vide</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez le backlog priorisé WSJF (rationalisation + nouveaux besoins)</p>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
