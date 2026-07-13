"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"

interface TimeApp { id:string; nom:string; fitTechnique:number; fitFonctionnel:number; quadrant:"Tolerate"|"Invest"|"Migrate"|"Eliminate"; recommandation:string; echeance:string }

const QUAD = {
  Tolerate: { label:"Tolerate",  emoji:"🟡", color:"#f59e0b", bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.25)", desc:"Fit technique haut, fit fonctionnel bas — ne pas investir, ne pas retirer" },
  Invest:   { label:"Invest",    emoji:"🟢", color:"#22c55e", bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.25)",  desc:"Fit technique et fonctionnel hauts — prioriser l'investissement" },
  Migrate:  { label:"Migrate",   emoji:"🔵", color:"#3b82f6", bg:"rgba(59,130,246,0.08)", border:"rgba(59,130,246,0.25)", desc:"Fit technique bas, fit fonctionnel haut — trouver une meilleure solution" },
  Eliminate:{ label:"Eliminate", emoji:"🔴", color:"#ef4444", bg:"rgba(239,68,68,0.08)",  border:"rgba(239,68,68,0.25)",  desc:"Fit technique et fonctionnel bas — retirer" },
} as const

export default function MatriceTimePage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "matrice-time")
  const [apps, setApps] = useState<TimeApp[]>([])

  useState(() => { if (data?.applications?.length) setApps(data.applications) })

  const saveAll = async (list:TimeApp[]) => { setApps(list); await save({ applications:list }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Classification TIME en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"matrice-time", projectName:project.name, projectDescription:project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const list: TimeApp[] = (json.data?.applications ?? []).map((a:any,i:number) => ({
        id: a.id ?? "APP"+Date.now()+i, nom:a.nom??"", fitTechnique:a.fitTechnique??3, fitFonctionnel:a.fitFonctionnel??3,
        quadrant: a.quadrant??"Tolerate", recommandation:a.recommandation??"", echeance:a.echeance??""
      }))
      await saveAll(list)
      toast.success("Matrice TIME générée — "+list.length+" applications classées")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const toRows = () => apps.map(a => ({ Application:a.nom, Quadrant:a.quadrant, "Fit technique":a.fitTechnique, "Fit fonctionnel":a.fitFonctionnel, Recommandation:a.recommandation, Échéance:a.echeance }))

  return (
    <AppLayout>
      <ToolLayout title="Matrice TIME" icon="🎯" subtitle="// TOLERATE · INVEST · MIGRATE · ELIMINATE"
        history={history} onLoadHistory={(e)=>{ loadHistory(e); if(e.data?.applications) setApps(e.data.applications) }}
        onGenerate={generate} generateLabel="Générer la matrice TIME" generating={loading}
        exportRows={toRows()} exportFilename={"Matrice_TIME_"+(project?.name??"")} projectName={project?.name}>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {(["Invest","Tolerate","Migrate","Eliminate"] as const).map(q => {
            const quad = QUAD[q]
            const list = apps.filter(a=>a.quadrant===q)
            return (
              <div key={q} style={{ background:quad.bg, border:"2px solid "+quad.border, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:20 }}>{quad.emoji}</span>
                  <div>
                    <h3 style={{ fontSize:13, fontWeight:800, color:quad.color, margin:0 }}>{quad.label}</h3>
                    <p style={{ fontSize:10, color:"var(--text-3)", margin:0, lineHeight:1.4 }}>{quad.desc}</p>
                  </div>
                  <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:quad.color, background:quad.color+"22", padding:"2px 8px", borderRadius:8 }}>{list.length}</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6, minHeight:60 }}>
                  {list.map(a => (
                    <div key={a.id} style={{ padding:"8px 10px", background:"var(--bg-card)", borderRadius:7, border:"1px solid var(--border)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:"var(--text-1)" }}>{a.nom}</span>
                        <span style={{ fontSize:10, color:"var(--text-3)" }}>Tech {a.fitTechnique}/5 · Fonc {a.fitFonctionnel}/5</span>
                      </div>
                      {a.recommandation && <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.4 }}>{a.recommandation}</p>}
                      {a.echeance && <span style={{ fontSize:10, color:quad.color, fontWeight:600 }}>{a.echeance}</span>}
                    </div>
                  ))}
                  {list.length===0 && <p style={{ fontSize:11, color:"var(--text-3)", textAlign:"center", padding:"10px 0" }}>Aucune application</p>}
                </div>
              </div>
            )
          })}
        </div>

        {apps.length === 0 && !loading && (
          <div style={{ textAlign:"center", padding:"50px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Matrice TIME vide</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Générez la classification à partir de votre cartographie</p>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
