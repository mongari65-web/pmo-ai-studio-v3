"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface Fiche {
  id:string; application:string; niveauRisque:"Critique"|"Élevé"|"Moyen"|"Faible"
  utilisateursImpactes:string; donneesAMigrer:string; applicationsDependantes:string
  planBascule:string; dateCible:string; responsable:string
}

const RISK_COLOR: Record<string,string> = { "Critique":"#ef4444", "Élevé":"#f59e0b", "Moyen":"#3b82f6", "Faible":"#22c55e" }

export default function ImpactRetraitPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "impact-retrait")
  const [fiches, setFiches] = useState<Fiche[]>([])

  useState(() => { if (data?.fiches?.length) setFiches(data.fiches) })

  const saveAll = async (list:Fiche[]) => { setFiches(list); await save({ fiches:list }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération des fiches d'impact en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"impact-retrait", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const list: Fiche[] = (json.data?.fiches ?? []).map((f:any,i:number) => ({
        id: f.id ?? "IMP"+Date.now()+i, application:f.application??"", niveauRisque:f.niveauRisque??"Moyen",
        utilisateursImpactes:f.utilisateursImpactes??"", donneesAMigrer:f.donneesAMigrer??"",
        applicationsDependantes:f.applicationsDependantes??"", planBascule:f.planBascule??"",
        dateCible:f.dateCible??"", responsable:f.responsable??""
      }))
      await saveAll(list)
      toast.success("Fiches d'impact générées — "+list.length)
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const deleteFiche = (fid:string) => saveAll(fiches.filter(f=>f.id!==fid))

  const toRows = () => fiches.map(f => ({
    Application:f.application, "Niveau de risque":f.niveauRisque, "Utilisateurs impactés":f.utilisateursImpactes,
    "Données à migrer":f.donneesAMigrer, "Applications dépendantes":f.applicationsDependantes,
    "Plan de bascule":f.planBascule, "Date cible":f.dateCible, Responsable:f.responsable
  }))

  return (
    <AppLayout>
      <ToolLayout title="Impact Retrait" icon="⚠️" subtitle="// RISQUES DE DÉCOMMISSIONNEMENT"
        history={history} onLoadHistory={(e)=>{ loadHistory(e); if(e.data?.fiches) setFiches(e.data.fiches) }}
        onGenerate={generate} generateLabel="Générer les fiches d'impact" generating={loading}
        exportRows={toRows()} exportFilename={"Impact_Retrait_"+(project?.name??"")} projectName={project?.name}>

        {fiches.length > 0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {fiches.map(f => (
              <div key={f.id} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderLeft:"4px solid "+RISK_COLOR[f.niveauRisque], borderRadius:10, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"var(--text-1)", margin:0 }}>{f.application}</h3>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700, color:RISK_COLOR[f.niveauRisque], background:RISK_COLOR[f.niveauRisque]+"18" }}>Risque {f.niveauRisque}</span>
                  </div>
                  <button onClick={()=>deleteFiche(f.id)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-3)" }}><Trash2 size={12}/></button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div><div style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase" }}>Utilisateurs impactés</div><div style={{ fontSize:12, color:"var(--text-1)" }}>{f.utilisateursImpactes}</div></div>
                  <div><div style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase" }}>Données à migrer</div><div style={{ fontSize:12, color:"var(--text-1)" }}>{f.donneesAMigrer}</div></div>
                  <div><div style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase" }}>Applications dépendantes</div><div style={{ fontSize:12, color:"var(--text-1)" }}>{f.applicationsDependantes}</div></div>
                  <div><div style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase" }}>Responsable / Date cible</div><div style={{ fontSize:12, color:"var(--text-1)" }}>{f.responsable} — {f.dateCible}</div></div>
                  <div style={{ gridColumn:"1 / -1" }}><div style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase" }}>Plan de bascule</div><div style={{ fontSize:12, color:"var(--text-1)", lineHeight:1.5 }}>{f.planBascule}</div></div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucune fiche d'impact</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez les fiches pour les applications candidates au retrait</p>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
