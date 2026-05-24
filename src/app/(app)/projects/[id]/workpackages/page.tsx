"use client"
import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Pencil, Check, X, ChevronLeft, ChevronRight, LayoutGrid, FileText, Table2 } from "lucide-react"

interface Contributor { profile: string; name: string; etp: number; criticality: string }
interface WP {
  id: string; code: string; name: string; phase: string
  description: string; deliverables: string; responsible: string
  start: string; end: string; duration: number; budget: number
  status: string; completion: number; dependencies: string; acceptance: string
  objective?: string; activities?: string[]; contributors?: Contributor[]
  lead_profile?: string; lead_etp?: string; color?: string
}

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  "Terminé":    { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  "En cours":   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  "Planifié":   { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  "À démarrer": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  "En retard":  { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
}
const PHASE_COLORS = ["#6366f1","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#db2777"]
const CRIT_COLORS: Record<string,string> = { "Critique":"#ef4444","Haute":"#f59e0b","Moyenne":"#3b82f6","Faible":"#22c55e" }

export default function WorkPackagesPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory, deleteHistory } = useToolData(id, "workpackages")
  const [wps, setWps]           = useState<WP[]>([])
  const [activeTab, setActiveTab] = useState<"grid"|"fiche"|"table">("grid")
  const [ficheIdx, setFicheIdx] = useState(0)
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState<WP|null>(null)
  const [filterPhase, setFilterPhase] = useState("Tous")

  useEffect(() => { if (data?.workpackages) setWps(data.workpackages) }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Work Packages...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"workpackages", projectName:project.name, projectDescription:project.description, budget:project.budget, startDate:project.start_date, endDate:project.end_date })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newWps = json.data?.workpackages ?? []
      setWps(newWps); await save({ workpackages: newWps })
      toast.success(newWps.length + " Work Packages générés — clonez-les pour créer les suivants !")
      // Message guidé
      setTimeout(() => toast.info("💡 Conseil CP : Créez un WP par livrable de votre WBS. Utilisez Clone pour adapter chaque template.", { duration: 6000 }), 2000)
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const phases = useMemo(() => ["Tous",...Array.from(new Set(wps.map(w=>w.phase)))],[wps])
  const filtered = filterPhase==="Tous" ? wps : wps.filter(w=>w.phase===filterPhase)
  const phaseColor = (p:string) => PHASE_COLORS[Math.max(0,phases.indexOf(p)-1)%PHASE_COLORS.length]
  const totalBudget = wps.reduce((s,w)=>s+w.budget,0)
  const avgCompletion = wps.length>0 ? Math.round(wps.reduce((s,w)=>s+w.completion,0)/wps.length) : 0
  const toRows = () => wps.map(w=>({ Code:w.code,Nom:w.name,Phase:w.phase,Resp:w.responsible,Début:w.start,Fin:w.end,Budget:w.budget,Statut:w.status,Avancement:w.completion+"%" }))

  const setDraftField = (field:keyof WP, value:any) => setDraft(d => d?{...d,[field]:value}:d)
  const startEdit = () => { if(filtered[ficheIdx]) setDraft({...filtered[ficheIdx]}); setEditing(true) }
  const cancelEdit = () => { setEditing(false); setDraft(null) }
  const saveEdit = async () => {
    if(!draft) return
    const updated = wps.map(w=>w.id===draft.id?draft:w)
    setWps(updated); setEditing(false); setDraft(null)
    await save({workpackages:updated}); toast.success("Work Package sauvegardé")
  }

  const deleteWp = async (wpId: string) => {
    if (!confirm("Supprimer ce Work Package ?")) return
    const updated = wps.filter(w => w.id !== wpId)
    setWps(updated); await save({ workpackages: updated })
    toast.success("Work Package supprimé")
  }
  const cloneWp = async (wp: WP) => {
    const cloned: WP = { ...wp,
      id: "WP" + Date.now(),
      code: "WP" + (wps.length + 1).toString().padStart(3,"0"),
      name: wp.name + " (copie)",
      completion: 0, status: "Planifié"
    }
    const updated = [...wps, cloned]
    setWps(updated); await save({ workpackages: updated })
    toast.success("WP cloné — modifiez-le selon votre projet")
  }
  const addEmptyWp = async () => {
    const empty: WP = {
      id: "WP" + Date.now(),
      code: "WP" + (wps.length + 1).toString().padStart(3,"0"),
      name: "Nouveau Work Package",
      phase: "Exécution", description: "", deliverables: "",
      responsible: "", start: project?.start_date ?? "",
      end: project?.end_date ?? "", duration: 0, budget: 0,
      status: "Planifié", completion: 0, dependencies: "",
      acceptance: "", activities: ["Activité 1","Activité 2","Activité 3"],
      objective: ""
    }
    const updated = [...wps, empty]
    setWps(updated); await save({ workpackages: updated })
    setFicheIdx(updated.length - 1); setActiveTab("fiche")
    setDraft(empty); setEditing(true)
    toast.success("WP vierge créé — remplissez les détails")
  }
  const wp = editing&&draft ? draft : (filtered[ficheIdx]??filtered[0])
  const pc = wp ? (wp.color ?? phaseColor(wp.phase)) : "var(--primary)"
  const cfg = wp ? (STATUS_CFG[wp.status]??{color:"var(--text-3)",bg:"transparent"}) : {color:"var(--text-3)",bg:"transparent"}

  // ── Vue Mini-Cartes ─────────────────────────────────────────────
  const GridView = () => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
      {filtered.map((wp,i) => {
        const pc = wp.color ?? phaseColor(wp.phase)
        const cfg = STATUS_CFG[wp.status] ?? {color:"var(--text-3)",bg:"transparent"}
        const activities = wp.activities && wp.activities.length>0 ? wp.activities : []
        return (
          <div key={wp.id} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            {/* Mini header coloré */}
            <div style={{ background:pc, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:6, padding:"2px 8px", textAlign:"center", minWidth:40 }}>
                  <div style={{ fontSize:8, color:"rgba(255,255,255,0.7)", fontWeight:700, textTransform:"uppercase" }}>CODE</div>
                  <div style={{ fontSize:13, fontWeight:900, color:"#fff", lineHeight:1.2 }}>{wp.code}</div>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:"#fff", lineHeight:1.3 }}>{wp.name}</div>
              </div>
              <span style={{ fontSize:10, padding:"2px 7px", borderRadius:8, background:"rgba(0,0,0,0.2)", color:"#fff", fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }}>{wp.phase}</span>
            </div>

            {/* Barre progression */}
            <div style={{ height:3, background:"rgba(0,0,0,0.1)" }}>
              <div style={{ width:wp.completion+"%", height:"100%", background:wp.completion===100?"#22c55e":pc }} />
            </div>

            {/* Corps compact */}
            <div style={{ padding:"10px 14px", flex:1, display:"flex", flexDirection:"column", gap:8 }}>
              {/* Status + avancement */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:8, background:cfg.bg, color:cfg.color, fontWeight:600 }}>{wp.status}</span>
                <span style={{ fontSize:11, fontWeight:700, color:pc }}>{wp.completion}%</span>
              </div>

              {/* Objectif court */}
              <p style={{ fontSize:11, color:"var(--text-2)", lineHeight:1.4, margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                {wp.objective ?? wp.description}
              </p>

              {/* Activités (max 3) */}
              {activities.length>0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  {activities.slice(0,3).map((a,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:5, fontSize:10, color:"var(--text-2)" }}>
                      <span style={{ color:pc, fontWeight:700, minWidth:14, flexShrink:0 }}>{i+1}.</span>
                      <span style={{ lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{a}</span>
                    </div>
                  ))}
                  {activities.length>3 && <span style={{ fontSize:10, color:"var(--text-3)", fontStyle:"italic" }}>+{activities.length-3} autres...</span>}
                </div>
              )}

              {/* Meta infos */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginTop:"auto" }}>
                <div style={{ fontSize:10, color:"var(--text-3)" }}>👤 <span style={{ color:"var(--text-2)" }}>{wp.responsible}</span></div>
                <div style={{ fontSize:10, color:"var(--text-3)" }}>💰 <span style={{ color:pc, fontWeight:700 }}>{wp.budget.toLocaleString("fr-FR")}€</span></div>
                <div style={{ fontSize:10, color:"var(--text-3)" }}>📅 {wp.start}</div>
                <div style={{ fontSize:10, color:"var(--text-3)" }}>🏁 {wp.end}</div>
              </div>

              {/* Livrables */}
              {wp.deliverables && (
                <div style={{ fontSize:10, color:"var(--text-2)", padding:"4px 8px", background:pc+"12", borderRadius:5, borderLeft:"2px solid "+pc }}>
                  📄 <span style={{ display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{wp.deliverables}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding:"8px 14px", borderTop:"1px solid var(--border)", display:"flex", gap:6 }}>
              <button onClick={() => { setActiveTab("fiche"); setFicheIdx(filtered.indexOf(wp)); setEditing(false) }}
                style={{ flex:1, padding:"5px", border:"1px solid "+pc+"44", borderRadius:6, background:pc+"11", color:pc, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                Voir fiche →
              </button>
              <button onClick={() => { setActiveTab("fiche"); setFicheIdx(filtered.indexOf(wp)); startEdit() }}
                style={{ padding:"5px 10px", border:"1px solid var(--border)", borderRadius:6, background:"transparent", color:"var(--text-3)", fontSize:11, cursor:"pointer" }}>
                <Pencil size={11}/>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )

  // ── Vue Fiche ────────────────────────────────────────────────────
  const FicheView = () => {
    if(!wp) return null
    const activities = wp.activities&&wp.activities.length>0 ? wp.activities
      : (wp.description?wp.description.split(/[.;]/).filter(s=>s.trim().length>4).map(s=>s.trim()):[])
    const contributors:Contributor[] = wp.contributors??[]
    const deliverablesList = wp.deliverables?wp.deliverables.split(/[,;]/).map(s=>s.trim()).filter(Boolean):[]
    const inp = (val:string, onChange:(v:string)=>void, style?:React.CSSProperties) => (
      <input value={val} onChange={e=>onChange(e.target.value)} style={{ border:"1px solid var(--primary)", borderRadius:4, padding:"2px 6px", fontSize:11, background:"var(--bg)", color:"var(--text-1)", outline:"none", width:"100%", ...style }}/>
    )
    return (
      <div>
        {/* Nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button onClick={()=>{cancelEdit();setFicheIdx(Math.max(0,ficheIdx-1))}} disabled={ficheIdx===0}
              style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 12px",border:"1px solid var(--border)",borderRadius:7,background:"transparent",color:"var(--text-2)",cursor:ficheIdx===0?"not-allowed":"pointer",opacity:ficheIdx===0?0.4:1,fontSize:12 }}>
              <ChevronLeft size={13}/> Préc.
            </button>
            <div style={{ display:"flex",gap:4 }}>
              {filtered.map((w,i)=>(
                <button key={w.id} onClick={()=>{cancelEdit();setFicheIdx(i)}}
                  style={{ width:24,height:24,borderRadius:"50%",border:"2px solid "+(i===ficheIdx?phaseColor(w.phase):"var(--border)"),background:i===ficheIdx?phaseColor(w.phase):"transparent",color:i===ficheIdx?"#fff":"var(--text-3)",fontSize:10,fontWeight:700,cursor:"pointer" }}>
                  {i+1}
                </button>
              ))}
            </div>
            <button onClick={()=>{cancelEdit();setFicheIdx(Math.min(filtered.length-1,ficheIdx+1))}} disabled={ficheIdx>=filtered.length-1}
              style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 12px",border:"1px solid var(--border)",borderRadius:7,background:"transparent",color:"var(--text-2)",cursor:ficheIdx>=filtered.length-1?"not-allowed":"pointer",opacity:ficheIdx>=filtered.length-1?0.4:1,fontSize:12 }}>
              Suiv. <ChevronRight size={13}/>
            </button>
          </div>
          <div style={{ display:"flex",gap:6 }}>
            {!editing
              ? <button onClick={startEdit} style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 14px",border:"1px solid var(--border)",borderRadius:7,background:"transparent",color:"var(--text-2)",fontSize:12,cursor:"pointer" }}><Pencil size={12}/> Éditer</button>
              : <>
                  <button onClick={saveEdit} style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 14px",border:"none",borderRadius:7,background:"var(--primary)",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600 }}><Check size={12}/> Sauvegarder</button>
                  <button onClick={cancelEdit} style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 14px",border:"1px solid var(--border)",borderRadius:7,background:"transparent",color:"var(--text-2)",fontSize:12,cursor:"pointer" }}><X size={12}/> Annuler</button>
                </>
            }
          </div>
        </div>

        <div style={{ background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden",fontSize:12 }}>
          {/* Header */}
          <div style={{ background:pc,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ background:"rgba(0,0,0,0.25)",borderRadius:8,padding:"4px 12px",textAlign:"center",minWidth:64 }}>
                <div style={{ fontSize:9,color:"rgba(255,255,255,0.7)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase" }}>CODE</div>
                {editing ? <input value={draft?.code} onChange={e=>setDraftField("code",e.target.value)} style={{ fontSize:16,fontWeight:900,color:"#fff",background:"transparent",border:"1px solid rgba(255,255,255,0.4)",borderRadius:4,width:70,textAlign:"center" }}/> : <div style={{ fontSize:18,fontWeight:900,color:"#fff" }}>{wp.code}</div>}
              </div>
              <div>
                {editing ? <input value={draft?.name} onChange={e=>setDraftField("name",e.target.value)} style={{ fontSize:16,fontWeight:800,color:"#fff",background:"transparent",border:"1px solid rgba(255,255,255,0.4)",borderRadius:4,padding:"2px 8px",width:280 }}/> : <div style={{ fontSize:17,fontWeight:800,color:"#fff" }}>{wp.name}</div>}
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.8)",marginTop:2 }}>
                  {editing ? <><input type="date" value={draft?.start} onChange={e=>setDraftField("start",e.target.value)} style={{ fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.4)",borderRadius:4,color:"#fff",padding:"1px 4px" }}/> → <input type="date" value={draft?.end} onChange={e=>setDraftField("end",e.target.value)} style={{ fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.4)",borderRadius:4,color:"#fff",padding:"1px 4px" }}/></> : <span>{wp.start} → {wp.end}</span>}
                </div>
              </div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5 }}>
              {editing ? <select value={draft?.phase} onChange={e=>setDraftField("phase",e.target.value)} style={{ fontSize:11,background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:5,color:"#fff",padding:"3px 8px" }}>{["Initialisation","Planification","Exécution","Tests","Validation","Recette","Déploiement","Revue","Rétrospective","Clôture"].map(p=><option key={p} value={p}>{p}</option>)}</select> : <span style={{ background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#fff",fontWeight:600 }}>Phase : {wp.phase}</span>}
              {editing && <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap", marginBottom:4 }}>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.6)" }}>Couleur :</span>
                  {["#6366f1","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#db2777","#f97316","#14b8a6","#64748b"].map(col => (
                    <button key={col} onClick={()=>setDraftField("color",col)}
                      style={{ width:18,height:18,borderRadius:"50%",background:col,border:draft?.color===col?"2px solid #fff":"2px solid transparent",cursor:"pointer",flexShrink:0,padding:0 }}/>
                  ))}
                </div>}
                {editing ? <select value={draft?.status} onChange={e=>setDraftField("status",e.target.value)} style={{ fontSize:11,borderRadius:5,padding:"2px 6px",border:"1px solid var(--border)" }}>{["Planifié","En cours","Terminé","En retard","À démarrer"].map(s=><option key={s}>{s}</option>)}</select> : <span style={{ fontSize:11,padding:"2px 8px",borderRadius:6,background:cfg.bg,color:cfg.color,fontWeight:600,border:"1px solid "+cfg.color+"44" }}>{wp.status}</span>}
            </div>
          </div>

          {/* Progress */}
          <div style={{ background:"var(--bg)",height:5 }}>
            <div style={{ width:wp.completion+"%",height:"100%",background:wp.completion===100?"#22c55e":pc,transition:"width 0.3s" }}/>
          </div>
          <div style={{ padding:"3px 20px 0",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,background:"var(--bg)" }}>
            <span style={{ fontSize:10,color:"var(--text-3)" }}>Avancement :</span>
            {editing && <input type="range" min="0" max="100" value={draft?.completion} onChange={e=>setDraftField("completion",+e.target.value)} style={{ width:80 }}/>}
            {editing ? <input type="number" min="0" max="100" value={draft?.completion} onChange={e=>setDraftField("completion",+e.target.value)} style={{ width:44,fontSize:11,border:"1px solid var(--border)",borderRadius:4,padding:"1px 4px",textAlign:"center" }}/> : <span style={{ fontSize:11,fontWeight:700,color:pc }}>{wp.completion}%</span>}
          </div>

          {/* Corps 2 colonnes */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:0 }}>
            <div style={{ padding:"14px 18px",borderRight:"1px solid var(--border)" }}>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10,fontWeight:700,color:pc,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6,display:"flex",alignItems:"center",gap:4 }}>
                  <span style={{ display:"inline-block",width:2,height:10,background:pc,borderRadius:1 }}/> Objectif
                </div>
                {editing ? <textarea value={draft?.objective??draft?.description} onChange={e=>setDraftField("objective",e.target.value)} rows={2} style={{ width:"100%",fontSize:11,border:"1px solid var(--primary)",borderRadius:5,padding:"4px 8px",background:"var(--bg)",color:"var(--text-1)",resize:"vertical" }}/> : <p style={{ fontSize:11,color:"var(--text-1)",lineHeight:1.5,margin:0,padding:"6px 10px",background:"var(--bg)",borderRadius:6,border:"1px solid var(--border)" }}>{wp.objective??wp.description}</p>}
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10,fontWeight:700,color:pc,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <span style={{ display:"flex",alignItems:"center",gap:4 }}><span style={{ display:"inline-block",width:2,height:10,background:pc,borderRadius:1 }}/> Activités</span>
                  {editing && <button onClick={()=>setDraft(d=>d?{...d,activities:[...(d.activities??[]),""]}:d)} style={{ fontSize:10,color:pc,background:"transparent",border:"1px solid "+pc+"44",borderRadius:4,padding:"1px 6px",cursor:"pointer" }}>+ Ajouter</button>}
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                  {activities.length>0 ? activities.map((a,i)=>(
                    <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:5 }}>
                      <span style={{ fontSize:10,fontWeight:700,color:pc,minWidth:14,marginTop:editing?4:1 }}>{i+1}.</span>
                      {editing ? <div style={{ display:"flex",gap:4,flex:1 }}><input value={a} onChange={e=>{const arr=[...(draft?.activities??[])];arr[i]=e.target.value;setDraftField("activities",arr)}} style={{ flex:1,fontSize:11,border:"1px solid var(--primary)",borderRadius:4,padding:"2px 6px",background:"var(--bg)",color:"var(--text-1)" }}/><button onClick={()=>{const arr=[...(draft?.activities??[])];arr.splice(i,1);setDraftField("activities",arr)}} style={{ background:"transparent",border:"none",cursor:"pointer",color:"#ef4444",fontSize:14,lineHeight:1 }}>×</button></div> : <span style={{ fontSize:11,color:"var(--text-1)",lineHeight:1.4,padding:"3px 8px",background:"var(--bg)",borderRadius:5,border:"1px solid var(--border)",flex:1 }}>{a}</span>}
                    </div>
                  )) : <span style={{ fontSize:11,color:"var(--text-3)",fontStyle:"italic" }}>Aucune activité</span>}
                </div>
              </div>
              <div>
                <div style={{ fontSize:10,fontWeight:700,color:pc,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6,display:"flex",alignItems:"center",gap:4 }}>
                  <span style={{ display:"inline-block",width:2,height:10,background:pc,borderRadius:1 }}/> Livrables
                </div>
                {editing ? <textarea value={draft?.deliverables} onChange={e=>setDraftField("deliverables",e.target.value)} rows={2} style={{ width:"100%",fontSize:11,border:"1px solid var(--primary)",borderRadius:5,padding:"4px 8px",background:"var(--bg)",color:"var(--text-1)",resize:"vertical" }}/> : <div style={{ padding:"6px 10px",background:pc+"12",borderRadius:6,border:"1px solid "+pc+"30",fontSize:11,color:"var(--text-1)" }}>{wp.deliverables||"—"}</div>}
              </div>
            </div>
            <div style={{ padding:"14px 18px" }}>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10,fontWeight:700,color:pc,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6 }}>Lead du Work Package</div>
                <div style={{ background:pc,borderRadius:8,padding:"10px 14px" }}>
                  <div style={{ fontSize:9,color:"rgba(255,255,255,0.7)",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3 }}>★ LEAD DU WORK PACKAGE</div>
                  {editing ? <input value={draft?.lead_profile??draft?.responsible} onChange={e=>setDraftField("lead_profile",e.target.value)} style={{ fontSize:13,fontWeight:800,color:"#fff",background:"transparent",border:"1px solid rgba(255,255,255,0.4)",borderRadius:4,padding:"2px 6px",width:"100%" }}/> : <div style={{ fontSize:13,fontWeight:800,color:"#fff",marginBottom:4 }}>{wp.lead_profile??wp.responsible}</div>}
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4 }}>
                    <span style={{ fontSize:10,color:"rgba(255,255,255,0.8)" }}>Criticité : Critique</span>
                    {editing ? <input value={draft?.lead_etp??"1,0"} onChange={e=>setDraftField("lead_etp",e.target.value)} style={{ width:50,fontSize:11,fontWeight:700,color:"#fff",background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:4,padding:"2px 5px",textAlign:"center" }}/> : <span style={{ background:"rgba(255,255,255,0.2)",borderRadius:5,padding:"2px 8px",fontSize:11,color:"#fff",fontWeight:700 }}>{wp.lead_etp??"1,0"} ETP</span>}
                  </div>
                </div>
              </div>
              {contributors.length>0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:10,fontWeight:700,color:pc,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6 }}>Contributeurs</div>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:11 }}>
                    <thead><tr style={{ background:"var(--bg)" }}>{["Profil","Nom","ETP","Crit."].map(h=><th key={h} style={{ padding:"4px 8px",textAlign:"left",fontSize:10,fontWeight:600,color:"var(--text-3)",borderBottom:"1px solid var(--border)" }}>{h}</th>)}</tr></thead>
                    <tbody>{contributors.map((c,i)=><tr key={i} style={{ borderBottom:"1px solid var(--border)" }}><td style={{ padding:"4px 8px",color:"var(--text-1)" }}>{c.profile}</td><td style={{ padding:"4px 8px",color:"var(--text-3)",fontStyle:c.name?"normal":"italic" }}>{c.name||"À compléter"}</td><td style={{ padding:"4px 8px",fontWeight:600 }}>{c.etp}</td><td style={{ padding:"4px 8px" }}><span style={{ fontSize:10,fontWeight:600,color:CRIT_COLORS[c.criticality]??"var(--text-2)" }}>{c.criticality}</span></td></tr>)}</tbody>
                  </table>
                </div>
              )}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}>
                <div style={{ background:"var(--bg)",borderRadius:6,border:"1px solid var(--border)",padding:"8px 12px" }}>
                  <div style={{ fontSize:9,color:"var(--text-3)",marginBottom:2 }}>Budget</div>
                  {editing ? <input type="number" value={draft?.budget} onChange={e=>setDraftField("budget",+e.target.value)} style={{ fontSize:14,fontWeight:800,color:pc,background:"transparent",border:"none",outline:"1px solid var(--primary)",borderRadius:3,width:"100%" }}/> : <div style={{ fontSize:14,fontWeight:800,color:pc }}>{wp.budget.toLocaleString("fr-FR")} €</div>}
                </div>
                <div style={{ background:"var(--bg)",borderRadius:6,border:"1px solid var(--border)",padding:"8px 12px" }}>
                  <div style={{ fontSize:9,color:"var(--text-3)",marginBottom:2 }}>Responsable</div>
                  {editing ? <input value={draft?.responsible} onChange={e=>setDraftField("responsible",e.target.value)} style={{ fontSize:11,fontWeight:600,color:pc,background:"transparent",border:"none",outline:"1px solid var(--primary)",borderRadius:3,width:"100%" }}/> : <div style={{ fontSize:11,fontWeight:600,color:pc,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{wp.responsible}</div>}
                </div>
              </div>
              {wp.acceptance && <div><div style={{ fontSize:9,color:"var(--text-3)",marginBottom:3 }}>Critères d'acceptation</div>{editing ? <textarea value={draft?.acceptance} onChange={e=>setDraftField("acceptance",e.target.value)} rows={2} style={{ width:"100%",fontSize:11,border:"1px solid var(--primary)",borderRadius:5,padding:"3px 7px",background:"var(--bg)",color:"var(--text-1)",resize:"vertical" }}/> : <div style={{ fontSize:11,color:"var(--text-2)",padding:"5px 8px",background:"var(--bg)",borderRadius:5,border:"1px solid var(--border)" }}>{wp.acceptance}</div>}</div>}
            </div>
          </div>
          <div style={{ borderTop:"1px solid var(--border)",padding:"6px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--bg)" }}>
            <span style={{ fontSize:10,color:"var(--text-3)",fontStyle:"italic" }}>CONFIDENTIEL — Diffusion restreinte</span>
            <span style={{ fontSize:10,color:"var(--text-3)" }}>{ficheIdx+1} / {filtered.length}</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Vue Tableau ──────────────────────────────────────────────────
  const [tableEditId, setTableEditId] = useState<string|null>(null)
  const [tableEditRow, setTableEditRow] = useState<WP|null>(null)

  return (
    <AppLayout>
      <ToolLayout title="Work Packages" icon="📦" subtitle="// WORK PACKAGES"
        history={history} onLoadHistory={(e)=>{loadHistory(e);if(e.data?.workpackages)setWps(e.data.workpackages)}}
        onGenerate={generate} generateLabel="Générer Work Packages" generating={loading}
        exportRows={toRows()} exportFilename={"WP_"+(project?.name??"")} projectName={project?.name}>
        {/* Boutons actions */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <button onClick={addEmptyWp} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:"var(--r8)", fontSize:12, fontWeight:600, color:"#22c55e", cursor:"pointer" }}>+ Nouveau WP</button>
          {wp && <button onClick={()=>cloneWp(wp)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"rgba(123,94,255,0.12)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:"var(--r8)", fontSize:12, fontWeight:600, color:"#9B84FF", cursor:"pointer" }}>⧉ Cloner ce WP</button>}
          {wp && <button onClick={()=>deleteWp(wp.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"var(--r8)", fontSize:12, fontWeight:600, color:"#ef4444", cursor:"pointer" }}>🗑 Supprimer</button>}
        </div>

        {wps.length===0 && !loading && (
          <div style={{ textAlign:"center",padding:"60px 20px" }}>
            <div style={{ fontSize:40,marginBottom:12 }}>📦</div>
            <p style={{ color:"var(--text-2)",fontSize:15 }}>Aucun Work Package</p>
            <p style={{ color:"var(--text-3)",fontSize:13 }}>Cliquez sur "Générer Work Packages"</p>
          </div>
        )}

        {wps.length>0 && (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {/* KPIs */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10 }}>
              {[
                { label:"Work Packages", value:String(wps.length) },
                { label:"Budget total", value:(totalBudget/1000).toFixed(0)+"k€" },
                { label:"Avancement moy.", value:avgCompletion+"%" },
                { label:"Terminés", value:String(wps.filter(w=>w.status==="Terminé").length) },
              ].map(k=>(
                <div key={k.label} style={{ background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px" }}>
                  <p style={{ fontSize:10,color:"var(--text-3)",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:"0.5px" }}>{k.label}</p>
                  <p style={{ fontSize:20,fontWeight:800,color:"var(--text-1)",margin:0 }}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs + filtre */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
              <div style={{ display:"flex",gap:4,background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:4 }}>
                {([["grid","🃏 Mini-cartes",LayoutGrid],["fiche","📋 Fiche",FileText],["table","📊 Tableau",Table2]] as const).map(([tab,label,Icon])=>(
                  <button key={tab} onClick={()=>setActiveTab(tab)}
                    style={{ padding:"5px 12px",borderRadius:7,fontSize:12,fontWeight:500,cursor:"pointer",border:"none",background:activeTab===tab?"var(--primary-bg)":"transparent",color:activeTab===tab?"var(--primary-light)":"var(--text-2)",display:"flex",alignItems:"center",gap:5 }}>
                    <Icon size={13}/>{label}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                {phases.map(p=>(
                  <button key={p} onClick={()=>{setFilterPhase(p);setFicheIdx(0);cancelEdit()}}
                    style={{ padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,cursor:"pointer",border:"1px solid "+(filterPhase===p?"var(--primary)":"var(--border)"),background:filterPhase===p?"var(--primary-bg)":"transparent",color:filterPhase===p?"var(--primary-light)":"var(--text-3)" }}>
                    {p}{p!=="Tous"?" ("+wps.filter(w=>w.phase===p).length+")":""}
                  </button>
                ))}
              </div>
            </div>

            {activeTab==="grid" && <GridView/>}
            {activeTab==="fiche" && <FicheView/>}
            {activeTab==="table" && (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead>
                    <tr style={{ background:"var(--bg)" }}>
                      {["Code","Nom","Phase","Responsable","Début","Fin","Budget","Statut","Avancement",""].map(h=>(
                        <th key={h} style={{ padding:"7px 10px",textAlign:"left",fontSize:10,fontWeight:600,color:"var(--text-3)",borderBottom:"1px solid var(--border)",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(wp=>{
                      const cfg=STATUS_CFG[wp.status]??{color:"var(--text-3)",bg:"transparent"}
                      const pc=phaseColor(wp.phase)
                      return(
                        <tr key={wp.id} style={{ borderBottom:"1px solid var(--border)",borderLeft:"3px solid "+pc }}>
                          <td style={{ padding:"7px 10px",fontWeight:700,color:pc }}>{wp.code}</td>
                          <td style={{ padding:"7px 10px",color:"var(--text-1)",fontWeight:500 }}>{wp.name}</td>
                          <td style={{ padding:"7px 10px",color:pc }}>{wp.phase}</td>
                          <td style={{ padding:"7px 10px",color:"var(--text-2)" }}>{wp.responsible}</td>
                          <td style={{ padding:"7px 10px",color:"var(--text-3)",whiteSpace:"nowrap" }}>{wp.start}</td>
                          <td style={{ padding:"7px 10px",color:"var(--text-3)",whiteSpace:"nowrap" }}>{wp.end}</td>
                          <td style={{ padding:"7px 10px",fontWeight:600 }}>{wp.budget.toLocaleString()}€</td>
                          <td style={{ padding:"7px 10px" }}><span style={{ fontSize:10,padding:"2px 7px",borderRadius:6,background:cfg.bg,color:cfg.color,fontWeight:600 }}>{wp.status}</span></td>
                          <td style={{ padding:"7px 10px" }}>
                            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                              <div style={{ flex:1,height:4,background:"var(--bg)",borderRadius:2,overflow:"hidden",minWidth:50 }}>
                                <div style={{ width:wp.completion+"%",height:"100%",background:wp.completion===100?"#22c55e":pc }}/>
                              </div>
                              <span style={{ fontSize:10,fontWeight:600,minWidth:28 }}>{wp.completion}%</span>
                            </div>
                          </td>
                          <td style={{ padding:"7px 10px" }}>
                            <button onClick={()=>{setActiveTab("fiche");setFicheIdx(filtered.indexOf(wp))}} style={{ padding:"3px 7px",background:"transparent",border:"1px solid var(--border)",borderRadius:5,cursor:"pointer",color:"var(--text-3)",fontSize:11 }}>Fiche</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
