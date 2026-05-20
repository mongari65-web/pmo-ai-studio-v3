"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Printer, Copy } from "lucide-react"
import GammaExport from "@/components/ui/GammaExport"

interface FicheMission {
  // Identification
  codeMission: string; version: string; dateCreation: string; dateRevision: string
  // Contexte
  client: string; direction: string; contexte: string; enjeux: string
  // Mission
  intitule: string; type: string; perimetre: string; horsPerimetre: string
  // Objectifs
  objectifPrincipal: string; objectifsSecondaires: string[]
  // Livrables
  livrables: { titre:string; echeance:string; format:string }[]
  // Ressources
  chefProjet: string; equipe: string; budget: string; duree: string
  // Gouvernance
  instances: string; frequence: string; escalade: string
  // Contraintes
  contraintes: string; risquesPrincipaux: string; hypotheses: string
  // Signatures
  commanditaire: string; dateValidation: string
}

const emptyFiche = (): FicheMission => ({
  codeMission:"", version:"1.0", dateCreation:new Date().toISOString().split("T")[0], dateRevision:"",
  client:"", direction:"", contexte:"", enjeux:"",
  intitule:"", type:"Projet", perimetre:"", horsPerimetre:"",
  objectifPrincipal:"", objectifsSecondaires:["","",""],
  livrables:[{ titre:"", echeance:"", format:"" },{ titre:"", echeance:"", format:"" }],
  equipe:"", chefProjet:"", budget:"", duree:"",
  instances:"", frequence:"", escalade:"",
  contraintes:"", risquesPrincipaux:"", hypotheses:"",
  commanditaire:"", dateValidation:""
})

export default function FicheMissionPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "fiche-mission")

  const [fiche, setFiche] = useState<FicheMission>(emptyFiche())
  const [preview, setPreview] = useState(false)

  useState(() => { if (data?.fiche) setFiche(data.fiche) })

  const upd = (k: keyof FicheMission, v: any) => setFiche(p => ({ ...p, [k]: v }))
  const saveFiche = async (f: FicheMission) => { setFiche(f); await save({ fiche: f }) }

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"fiche-mission", projectName:project.name, projectDescription:project.description, startDate:project.start_date, endDate:project.end_date })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const d = json.data?.fiche ?? json.data
      const f: FicheMission = {
        ...emptyFiche(),
        codeMission: d.codeMission ?? d.code ?? project.name?.slice(0,3).toUpperCase()+"001",
        client: d.client ?? "", direction: d.direction ?? "",
        contexte: d.contexte ?? d.context ?? "", enjeux: d.enjeux ?? d.stakes ?? "",
        intitule: d.intitule ?? d.title ?? project.name ?? "",
        type: d.type ?? "Projet", perimetre: d.perimetre ?? d.scope ?? "",
        horsPerimetre: d.horsPerimetre ?? d.outOfScope ?? "",
        objectifPrincipal: d.objectifPrincipal ?? d.mainObjective ?? "",
        objectifsSecondaires: d.objectifsSecondaires ?? d.objectives ?? ["","",""],
        livrables: d.livrables ?? d.deliverables ?? [{ titre:"",echeance:"",format:"" }],
        chefProjet: d.chefProjet ?? "", equipe: d.equipe ?? d.team ?? "",
        budget: d.budget ?? (project.budget ? project.budget+"€" : ""),
        duree: d.duree ?? d.duration ?? "",
        instances: d.instances ?? d.governance ?? "",
        frequence: d.frequence ?? d.frequency ?? "",
        escalade: d.escalade ?? d.escalation ?? "",
        contraintes: d.contraintes ?? d.constraints ?? "",
        risquesPrincipaux: d.risquesPrincipaux ?? d.risks ?? "",
        hypotheses: d.hypotheses ?? "",
        commanditaire: d.commanditaire ?? d.sponsor ?? "",
        dateValidation: d.dateValidation ?? ""
      }
      await saveFiche(f)
      toast.success("Fiche Mission générée")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const copyText = () => {
    const text = `FICHE DE MISSION — ${fiche.intitule}
Code: ${fiche.codeMission} | Version: ${fiche.version} | Date: ${fiche.dateCreation}

CONTEXTE
Client: ${fiche.client} | Direction: ${fiche.direction}
${fiche.contexte}

ENJEUX
${fiche.enjeux}

PÉRIMÈTRE
${fiche.perimetre}

OBJECTIF PRINCIPAL
${fiche.objectifPrincipal}

OBJECTIFS SECONDAIRES
${fiche.objectifsSecondaires.filter(Boolean).map((o,i)=>`${i+1}. ${o}`).join("\n")}

LIVRABLES
${fiche.livrables.filter(l=>l.titre).map(l=>`- ${l.titre} (${l.echeance}) — ${l.format}`).join("\n")}

RESSOURCES
Chef de Projet: ${fiche.chefProjet}
Équipe: ${fiche.equipe}
Budget: ${fiche.budget} | Durée: ${fiche.duree}

GOUVERNANCE
Instances: ${fiche.instances} | Fréquence: ${fiche.frequence}

CONTRAINTES & RISQUES
${fiche.contraintes}
${fiche.risquesPrincipaux}

Commanditaire: ${fiche.commanditaire} | Validé le: ${fiche.dateValidation}`
    navigator.clipboard.writeText(text)
    toast.success("Fiche copiée dans le presse-papiers")
  }

  const inp = { width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:7, padding:"7px 10px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" as const }
  const textarea = { ...inp, resize:"vertical" as const }
  const lbl = (t:string) => <div style={{ fontSize:10, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase" as const, letterSpacing:"0.5px", marginBottom:4 }}>{t}</div>

  const toRows = () => [{ Titre:fiche.intitule, Client:fiche.client, Chef:fiche.chefProjet, Budget:fiche.budget, Durée:fiche.duree }]

  return (
    <AppLayout>
      <ToolLayout title="Fiche de Mission" icon="📋" subtitle="// CADRAGE PROJET"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.fiche) setFiche(e.data.fiche) }}
        onGenerate={generate} generateLabel="Générer Fiche" generating={loading}
        exportRows={toRows()} exportFilename={"FicheMission_"+(project?.name??"")} projectName={project?.name}>

        {/* Actions */}
        <div style={{ display:"flex", gap:8, marginBottom:16, justifyContent:"flex-end" }}>
          <button onClick={() => setPreview(!preview)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8, background:preview?"var(--primary-bg)":"transparent", color:preview?"var(--primary-light)":"var(--text-2)", fontSize:12, cursor:"pointer", fontWeight:500 }}>
            {preview ? "✏️ Éditer" : "👁️ Aperçu"}
          </button>
          <GammaExport type="fiche-mission" projectName={project?.name??""} data={{ fiche, description:project?.description }}/>
          <button onClick={copyText} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
            <Copy size={13}/> Copier
          </button>
          <button onClick={() => window.print()} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
            <Printer size={13}/> Imprimer
          </button>
        </div>

        {/* MODE APERÇU */}
        {preview ? (
          <div style={{ background:"#fff", color:"#111", borderRadius:12, border:"1px solid var(--border)", padding:"32px 40px", fontFamily:"Arial, sans-serif" }}>
            {/* En-tête */}
            <div style={{ borderBottom:"3px solid #1e3a5f", paddingBottom:16, marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:"2px", marginBottom:4 }}>Fiche de Mission</div>
                  <h1 style={{ fontSize:20, fontWeight:900, color:"#111", margin:0, lineHeight:1.2 }}>{fiche.intitule||"[Intitulé de la mission]"}</h1>
                </div>
                <div style={{ textAlign:"right", fontSize:11, color:"#64748b" }}>
                  <div><strong>Code :</strong> {fiche.codeMission||"—"}</div>
                  <div><strong>Version :</strong> {fiche.version}</div>
                  <div><strong>Date :</strong> {fiche.dateCreation}</div>
                </div>
              </div>
            </div>

            {/* Bandeau client */}
            <div style={{ background:"#1e3a5f", color:"#fff", padding:"10px 16px", borderRadius:6, marginBottom:20, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
              <div><div style={{ fontSize:9, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"1px" }}>Client</div><div style={{ fontSize:13, fontWeight:700 }}>{fiche.client||"—"}</div></div>
              <div><div style={{ fontSize:9, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"1px" }}>Direction</div><div style={{ fontSize:13, fontWeight:700 }}>{fiche.direction||"—"}</div></div>
              <div><div style={{ fontSize:9, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"1px" }}>Chef de Projet</div><div style={{ fontSize:13, fontWeight:700 }}>{fiche.chefProjet||"—"}</div></div>
            </div>

            {/* Sections */}
            {[
              { title:"Contexte & Enjeux", content: <><p style={{ margin:"0 0 8px", fontSize:12, lineHeight:1.6 }}>{fiche.contexte||"—"}</p>{fiche.enjeux && <><strong style={{ fontSize:11 }}>Enjeux :</strong><p style={{ margin:"4px 0 0", fontSize:12, lineHeight:1.6 }}>{fiche.enjeux}</p></>}</> },
              { title:"Périmètre", content: <><p style={{ margin:0, fontSize:12, lineHeight:1.6 }}><strong>Inclus :</strong> {fiche.perimetre||"—"}</p>{fiche.horsPerimetre && <p style={{ margin:"4px 0 0", fontSize:12, lineHeight:1.6 }}><strong>Exclus :</strong> {fiche.horsPerimetre}</p>}</> },
              { title:"Objectifs", content: <><p style={{ margin:"0 0 6px", fontSize:12, lineHeight:1.6 }}><strong>Principal :</strong> {fiche.objectifPrincipal||"—"}</p>{fiche.objectifsSecondaires.filter(Boolean).length > 0 && <ul style={{ margin:0, paddingLeft:18 }}>{fiche.objectifsSecondaires.filter(Boolean).map((o,i) => <li key={i} style={{ fontSize:12, lineHeight:1.6, marginBottom:2 }}>{o}</li>)}</ul>}</> },
              { title:"Livrables", content: <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}><thead><tr style={{ background:"#f8fafc" }}>{["Livrable","Échéance","Format"].map(h=><th key={h} style={{ padding:"6px 10px", textAlign:"left", fontWeight:700, color:"#1e3a5f", borderBottom:"1px solid #e2e8f0" }}>{h}</th>)}</tr></thead><tbody>{fiche.livrables.filter(l=>l.titre).map((l,i)=><tr key={i}><td style={{ padding:"5px 10px", borderBottom:"1px solid #f1f5f9" }}>{l.titre}</td><td style={{ padding:"5px 10px", borderBottom:"1px solid #f1f5f9" }}>{l.echeance}</td><td style={{ padding:"5px 10px", borderBottom:"1px solid #f1f5f9" }}>{l.format}</td></tr>)}</tbody></table> },
              { title:"Ressources & Budget", content: <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, fontSize:12 }}><div><strong>Équipe :</strong> {fiche.equipe||"—"}</div><div><strong>Budget :</strong> {fiche.budget||"—"}</div><div><strong>Durée :</strong> {fiche.duree||"—"}</div><div><strong>Commanditaire :</strong> {fiche.commanditaire||"—"}</div></div> },
              { title:"Gouvernance", content: <div style={{ fontSize:12, lineHeight:1.6 }}><p style={{ margin:"0 0 4px" }}><strong>Instances :</strong> {fiche.instances||"—"}</p><p style={{ margin:"0 0 4px" }}><strong>Fréquence :</strong> {fiche.frequence||"—"}</p><p style={{ margin:0 }}><strong>Escalade :</strong> {fiche.escalade||"—"}</p></div> },
              { title:"Contraintes & Risques", content: <><p style={{ margin:"0 0 4px", fontSize:12, lineHeight:1.6 }}><strong>Contraintes :</strong> {fiche.contraintes||"—"}</p><p style={{ margin:0, fontSize:12, lineHeight:1.6 }}><strong>Risques principaux :</strong> {fiche.risquesPrincipaux||"—"}</p></> },
            ].map(s => (
              <div key={s.title} style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:"1px", borderLeft:"3px solid #1e3a5f", paddingLeft:8, marginBottom:8 }}>{s.title}</div>
                {s.content}
              </div>
            ))}

            {/* Signature */}
            <div style={{ borderTop:"2px solid #1e3a5f", marginTop:24, paddingTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Commanditaire</div>
                <div style={{ fontSize:12 }}>{fiche.commanditaire||"_______________"}</div>
                <div style={{ marginTop:20, borderTop:"1px solid #cbd5e1", paddingTop:4, fontSize:10, color:"#94a3b8" }}>Signature & Date</div>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Chef de Projet</div>
                <div style={{ fontSize:12 }}>{fiche.chefProjet||"_______________"}</div>
                <div style={{ marginTop:20, borderTop:"1px solid #cbd5e1", paddingTop:4, fontSize:10, color:"#94a3b8" }}>Signature & Date</div>
              </div>
            </div>
          </div>
        ) : (
          /* MODE ÉDITION */
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Identification */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:12, fontWeight:700, color:"var(--primary-light)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 12px" }}>🆔 Identification</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
                {[["codeMission","Code mission"],["version","Version"],["dateCreation","Date création"],["dateRevision","Date révision"]].map(([k,l]) => (
                  <div key={k}>{lbl(l)}<input value={(fiche as any)[k]} onChange={e=>upd(k as keyof FicheMission,e.target.value)} style={inp}/></div>
                ))}
              </div>
            </div>

            {/* Contexte */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:12, fontWeight:700, color:"#3b82f6", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 12px" }}>🌍 Contexte</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div>{lbl("Client")}<input value={fiche.client} onChange={e=>upd("client",e.target.value)} style={inp}/></div>
                <div>{lbl("Direction / BU")}<input value={fiche.direction} onChange={e=>upd("direction",e.target.value)} style={inp}/></div>
              </div>
              <div style={{ marginBottom:10 }}>{lbl("Contexte")}<textarea value={fiche.contexte} onChange={e=>upd("contexte",e.target.value)} rows={3} style={textarea}/></div>
              <div>{lbl("Enjeux")}<textarea value={fiche.enjeux} onChange={e=>upd("enjeux",e.target.value)} rows={2} style={textarea}/></div>
            </div>

            {/* Mission */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:12, fontWeight:700, color:"#7B5EFF", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 12px" }}>🎯 Mission</h3>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, marginBottom:10 }}>
                <div>{lbl("Intitulé de la mission")}<input value={fiche.intitule} onChange={e=>upd("intitule",e.target.value)} placeholder="Ex: Refonte SI RH — Phase 1" style={inp}/></div>
                <div>{lbl("Type")}<select value={fiche.type} onChange={e=>upd("type",e.target.value)} style={inp}>{["Projet","Programme","PMO","Conseil","Audit","Transformation"].map(t=><option key={t}>{t}</option>)}</select></div>
              </div>
              <div style={{ marginBottom:10 }}>{lbl("Périmètre inclus")}<textarea value={fiche.perimetre} onChange={e=>upd("perimetre",e.target.value)} rows={2} style={textarea}/></div>
              <div>{lbl("Hors périmètre")}<textarea value={fiche.horsPerimetre} onChange={e=>upd("horsPerimetre",e.target.value)} rows={2} style={textarea}/></div>
            </div>

            {/* Objectifs */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:12, fontWeight:700, color:"#22c55e", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 12px" }}>✅ Objectifs</h3>
              <div style={{ marginBottom:10 }}>{lbl("Objectif principal")}<textarea value={fiche.objectifPrincipal} onChange={e=>upd("objectifPrincipal",e.target.value)} rows={2} style={textarea}/></div>
              <div>{lbl("Objectifs secondaires")}</div>
              {fiche.objectifsSecondaires.map((o,i) => (
                <input key={i} value={o} onChange={e=>{ const arr=[...fiche.objectifsSecondaires]; arr[i]=e.target.value; upd("objectifsSecondaires",arr) }} placeholder={"Objectif secondaire "+(i+1)} style={{ ...inp, marginBottom:6 }}/>
              ))}
            </div>

            {/* Livrables */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:12, fontWeight:700, color:"#f59e0b", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 12px" }}>📦 Livrables</h3>
              {fiche.livrables.map((l,i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr auto", gap:8, marginBottom:8, alignItems:"flex-end" }}>
                  <div>{i===0&&lbl("Titre")}<input value={l.titre} onChange={e=>{ const arr=[...fiche.livrables]; arr[i]={...arr[i],titre:e.target.value}; upd("livrables",arr) }} placeholder="Nom du livrable" style={inp}/></div>
                  <div>{i===0&&lbl("Échéance")}<input type="date" value={l.echeance} onChange={e=>{ const arr=[...fiche.livrables]; arr[i]={...arr[i],echeance:e.target.value}; upd("livrables",arr) }} style={inp}/></div>
                  <div>{i===0&&lbl("Format")}<input value={l.format} onChange={e=>{ const arr=[...fiche.livrables]; arr[i]={...arr[i],format:e.target.value}; upd("livrables",arr) }} placeholder="Word, PDF..." style={inp}/></div>
                  <button onClick={()=>upd("livrables",fiche.livrables.filter((_,j)=>j!==i))} style={{ padding:"6px 8px", background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, cursor:"pointer", color:"#ef4444", marginTop:i===0?16:0 }}>✕</button>
                </div>
              ))}
              <button onClick={()=>upd("livrables",[...fiche.livrables,{titre:"",echeance:"",format:""}])} style={{ fontSize:11, color:"var(--primary-light)", background:"transparent", border:"1px dashed rgba(123,94,255,0.3)", borderRadius:6, padding:"4px 12px", cursor:"pointer" }}>+ Ajouter un livrable</button>
            </div>

            {/* Ressources */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:12, fontWeight:700, color:"#ef4444", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 12px" }}>👥 Ressources & Budget</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
                {[["chefProjet","Chef de Projet"],["equipe","Équipe"],["budget","Budget"],["duree","Durée"]].map(([k,l]) => (
                  <div key={k}>{lbl(l)}<input value={(fiche as any)[k]} onChange={e=>upd(k as keyof FicheMission,e.target.value)} style={inp}/></div>
                ))}
              </div>
            </div>

            {/* Gouvernance + Contraintes */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
                <h3 style={{ fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 12px" }}>🏛️ Gouvernance</h3>
                {[["instances","Instances","CODIR, COPIL..."],["frequence","Fréquence","Hebdo, mensuel..."],["escalade","Escalade","Processus escalade"]].map(([k,l,ph]) => (
                  <div key={k} style={{ marginBottom:8 }}>{lbl(l)}<input value={(fiche as any)[k]} onChange={e=>upd(k as keyof FicheMission,e.target.value)} placeholder={ph} style={inp}/></div>
                ))}
              </div>
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
                <h3 style={{ fontSize:12, fontWeight:700, color:"#f97316", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 12px" }}>⚠️ Contraintes & Risques</h3>
                <div style={{ marginBottom:8 }}>{lbl("Contraintes")}<textarea value={fiche.contraintes} onChange={e=>upd("contraintes",e.target.value)} rows={2} style={textarea}/></div>
                <div style={{ marginBottom:8 }}>{lbl("Risques principaux")}<textarea value={fiche.risquesPrincipaux} onChange={e=>upd("risquesPrincipaux",e.target.value)} rows={2} style={textarea}/></div>
                <div>{lbl("Hypothèses")}<input value={fiche.hypotheses} onChange={e=>upd("hypotheses",e.target.value)} style={inp}/></div>
              </div>
            </div>

            {/* Validation */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:12, fontWeight:700, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 12px" }}>✍️ Validation</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>{lbl("Commanditaire")}<input value={fiche.commanditaire} onChange={e=>upd("commanditaire",e.target.value)} style={inp}/></div>
                <div>{lbl("Date de validation")}<input type="date" value={fiche.dateValidation} onChange={e=>upd("dateValidation",e.target.value)} style={inp}/></div>
              </div>
            </div>

            <button onClick={() => saveFiche(fiche)} style={{ padding:"10px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              💾 Sauvegarder la fiche
            </button>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
