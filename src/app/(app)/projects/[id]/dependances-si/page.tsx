"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Trash2, ArrowRight } from "lucide-react"

interface Dep { id:string; source:string; cible:string; type:string; description:string; criticite:"Critique"|"Élevée"|"Moyenne"|"Faible"; frequence:string }

const CRIT_COLOR: Record<string,string> = { "Critique":"#ef4444", "Élevée":"#f59e0b", "Moyenne":"#3b82f6", "Faible":"#22c55e" }

export default function DependancesSIPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "dependances-si")
  const [deps, setDeps] = useState<Dep[]>([])

  useState(() => { if (data?.dependances?.length) setDeps(data.dependances) })

  const saveAll = async (list:Dep[]) => { setDeps(list); await save({ dependances:list }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Analyse des dépendances en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"dependances-si", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const list: Dep[] = (json.data?.dependances ?? []).map((d:any,i:number) => ({
        id: d.id ?? "DEP"+Date.now()+i, source:d.source??"", cible:d.cible??"", type:d.type??"",
        description:d.description??"", criticite:d.criticite??"Moyenne", frequence:d.frequence??""
      }))
      await saveAll(list)
      toast.success("Dépendances générées — "+list.length+" flux identifiés")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const deleteDep = (depId:string) => saveAll(deps.filter(d=>d.id!==depId))

  const toRows = () => deps.map(d => ({ Source:d.source, Cible:d.cible, Type:d.type, Description:d.description, Criticité:d.criticite, Fréquence:d.frequence }))

  return (
    <AppLayout>
      <ToolLayout title="Dépendances SI" icon="🔗" subtitle="// CARTE DES INTERCONNEXIONS"
        history={history} onLoadHistory={(e)=>{ loadHistory(e); if(e.data?.dependances) setDeps(e.data.dependances) }}
        onGenerate={generate} generateLabel="Générer les dépendances" generating={loading}
        exportRows={toRows()} exportFilename={"Dependances_SI_"+(project?.name??"")} projectName={project?.name}>

        {deps.length > 0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {deps.map(d => (
              <div key={d.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:260 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"var(--text-1)" }}>{d.source}</span>
                  <ArrowRight size={13} style={{ color:"var(--text-3)" }}/>
                  <span style={{ fontSize:12, fontWeight:700, color:"var(--text-1)" }}>{d.cible}</span>
                </div>
                <span style={{ fontSize:10, padding:"2px 8px", background:"rgba(123,94,255,0.12)", color:"#9B84FF", borderRadius:20, fontWeight:600 }}>{d.type}</span>
                <span style={{ flex:1, fontSize:12, color:"var(--text-2)" }}>{d.description}</span>
                <span style={{ fontSize:10, color:"var(--text-3)" }}>{d.frequence}</span>
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700, color:CRIT_COLOR[d.criticite], background:CRIT_COLOR[d.criticite]+"18" }}>{d.criticite}</span>
                <button onClick={()=>deleteDep(d.id)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-3)" }}><Trash2 size={12}/></button>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔗</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucune dépendance recensée</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez le registre à partir de votre cartographie</p>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
