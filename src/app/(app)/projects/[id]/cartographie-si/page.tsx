"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface AppItem {
  id:string; nom:string; proprietaire:string; technologie:string; age:number
  costAnnuel:number; criticite:"Critique"|"Élevée"|"Moyenne"|"Faible"
  fitTechnique:number; fitFonctionnel:number; utilisateurs:number; description:string
}

const CRIT_COLOR: Record<string,string> = { "Critique":"#ef4444", "Élevée":"#f59e0b", "Moyenne":"#3b82f6", "Faible":"#22c55e" }

export default function CartographieSIPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "cartographie-si")
  const [apps, setApps] = useState<AppItem[]>([])

  useState(() => { if (data?.applications?.length) setApps(data.applications) })

  const saveAll = async (list:AppItem[]) => { setApps(list); await save({ applications:list }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération de la cartographie en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"cartographie-si", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const list: AppItem[] = (json.data?.applications ?? []).map((a:any,i:number) => ({
        id: a.id ?? "APP"+Date.now()+i, nom:a.nom??"", proprietaire:a.proprietaire??"", technologie:a.technologie??"",
        age:a.age??0, costAnnuel:a.costAnnuel??0, criticite:a.criticite??"Moyenne",
        fitTechnique:a.fitTechnique??3, fitFonctionnel:a.fitFonctionnel??3, utilisateurs:a.utilisateurs??0, description:a.description??""
      }))
      await saveAll(list)
      toast.success("Cartographie générée — "+list.length+" applications")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const deleteApp = (appId:string) => saveAll(apps.filter(a=>a.id!==appId))

  const toRows = () => apps.map(a => ({
    Application:a.nom, Propriétaire:a.proprietaire, Technologie:a.technologie, "Âge (ans)":a.age,
    "Coût annuel (€)":a.costAnnuel, Criticité:a.criticite, "Fit technique":a.fitTechnique, "Fit fonctionnel":a.fitFonctionnel,
    Utilisateurs:a.utilisateurs, Description:a.description
  }))

  const totalCost = apps.reduce((s,a)=>s+(a.costAnnuel||0),0)

  return (
    <AppLayout>
      <ToolLayout title="Cartographie SI" icon="🗺️" subtitle="// INVENTAIRE APPLICATIF"
        history={history} onLoadHistory={(e)=>{ loadHistory(e); if(e.data?.applications) setApps(e.data.applications) }}
        onGenerate={generate} generateLabel="Générer la cartographie" generating={loading}
        exportRows={toRows()} exportFilename={"Cartographie_SI_"+(project?.name??"")} projectName={project?.name}>

        {apps.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:20, fontWeight:900, color:"var(--text-1)" }}>{apps.length}</div>
              <div style={{ fontSize:11, color:"var(--text-3)" }}>Applications recensées</div>
            </div>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:20, fontWeight:900, color:"var(--text-1)" }}>{totalCost.toLocaleString("fr-FR")} €</div>
              <div style={{ fontSize:11, color:"var(--text-3)" }}>Coût annuel cumulé</div>
            </div>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:20, fontWeight:900, color:"#ef4444" }}>{apps.filter(a=>a.criticite==="Critique").length}</div>
              <div style={{ fontSize:11, color:"var(--text-3)" }}>Applications critiques</div>
            </div>
          </div>
        )}

        {apps.length > 0 ? (
          <div style={{ overflowX:"auto", border:"1px solid var(--border)", borderRadius:10 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"var(--bg-card)" }}>
                  {["Application","Propriétaire","Techno","Âge","Coût/an","Criticité","Fit Tech.","Fit Fonc.","Users",""].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:"var(--text-3)", fontWeight:600, borderBottom:"1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.map(a => (
                  <tr key={a.id} style={{ borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"8px 10px", color:"var(--text-1)", fontWeight:600 }}>{a.nom}</td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{a.proprietaire}</td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{a.technologie}</td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{a.age} ans</td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{a.costAnnuel?.toLocaleString("fr-FR")} €</td>
                    <td style={{ padding:"8px 10px" }}>
                      <span style={{ padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, color:CRIT_COLOR[a.criticite], background:CRIT_COLOR[a.criticite]+"18" }}>{a.criticite}</span>
                    </td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{a.fitTechnique}/5</td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{a.fitFonctionnel}/5</td>
                    <td style={{ padding:"8px 10px", color:"var(--text-2)" }}>{a.utilisateurs}</td>
                    <td style={{ padding:"8px 10px" }}>
                      <button onClick={()=>deleteApp(a.id)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-3)" }}><Trash2 size={12}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗺️</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucune application recensée</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez la cartographie à partir du contexte du projet</p>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
