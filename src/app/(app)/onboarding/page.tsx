"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Check, ChevronRight, Sparkles, FolderKanban, Zap, Target, ArrowRight } from "lucide-react"

const STEPS = [
  { id:"welcome",  title:"Bienvenue dans PMO AI Studio 🎉", icon:"👋" },
  { id:"profile",  title:"Votre profil",                   icon:"👤" },
  { id:"project",  title:"Créez votre premier projet",     icon:"📁" },
  { id:"tools",    title:"Choisissez vos outils",          icon:"🛠️" },
  { id:"generate", title:"Générez avec l'IA",              icon:"⚡" },
]

const PROJECT_TYPES = [
  { id:"migration",    icon:"🔄", label:"Migration SI",        color:"#3b82f6" },
  { id:"transformation",icon:"🚀",label:"Transformation digitale",color:"#7B5EFF" },
  { id:"infrastructure",icon:"🏗️",label:"Infrastructure",      color:"#f59e0b" },
  { id:"saas",         icon:"💻", label:"Projet SaaS/Dev",     color:"#22c55e" },
  { id:"pmo",          icon:"📊", label:"PMO / Gouvernance",   color:"#ef4444" },
  { id:"autre",        icon:"📋", label:"Autre",               color:"#64748b" },
]

const TOOL_OPTIONS = [
  { id:"gantt",        icon:"📅", label:"Gantt",         desc:"Planning visuel" },
  { id:"raid",         icon:"⚠️", label:"RAID",          desc:"Risques & Actions" },
  { id:"budget",       icon:"💰", label:"Budget EVM",    desc:"Earned Value" },
  { id:"workpackages", icon:"📦", label:"Work Packages", desc:"Lots de travaux" },
  { id:"jalons",       icon:"🏁", label:"Jalons",        desc:"Étapes clés" },
  { id:"pert",         icon:"🔀", label:"PERT",          desc:"Chemin critique" },
]

export default function OnboardingPage() {
  const [step, setStep]         = useState(0)
  const [profile, setProfile]   = useState({ name:"", role:"Chef de Projet", experience:"5-10 ans" })
  const [project, setProject]   = useState({ name:"", description:"", type:"migration", budget:0, start:"", end:"" })
  const [tools, setTools]       = useState<string[]>(["gantt","raid","budget"])
  const [generating, setGenerating] = useState(false)
  const [createdId, setCreatedId] = useState<string|null>(null)
  const router = useRouter()
  const supabase = createClient()

  const next = () => setStep(s => Math.min(s+1, STEPS.length-1))
  const back = () => setStep(s => Math.max(s-1, 0))

  const toggleTool = (id:string) => setTools(t => t.includes(id) ? t.filter(x=>x!==id) : [...t,id])

  const createProject = async () => {
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await supabase.from("projects").insert({
      user_id: user.id, name: project.name||"Mon premier projet",
      description: project.description, icon:"🚀",
      color: PROJECT_TYPES.find(t=>t.id===project.type)?.color??"#7B5EFF",
      budget: project.budget||0, start_date: project.start||null, end_date: project.end||null,
      status:"active", completion:0
    }).select().single()
    if (error) { toast.error(error.message); return null }
    return data.id
  }

  const generateAll = async () => {
    if (!project.name) { toast.error("Donnez un nom à votre projet"); return }
    setGenerating(true)
    try {
      const projId = await createProject()
      // ── Email notification création projet (Sprint 5) ──────
      if (projId) {
        try {
          await fetch('/api/email/project-created', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: projId,
              projectName: project.name || 'Mon premier projet',
              description: project.description,
            }),
          })
        } catch {
          // Email non bloquant — le projet est créé même si l'email échoue
        }
      }
      if (!projId) return
      setCreatedId(projId)

      // Sauvegarder le nom dans le profil
      if (profile.name) {
        await supabase.auth.updateUser({ data:{ full_name:profile.name } })
      }

      // Générer les outils sélectionnés
      for (const toolId of tools.slice(0,3)) { // Max 3 pour l'onboarding
        try {
          await fetch("/api/generate", {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ tool:toolId, projectName:project.name, projectDescription:project.description, startDate:project.start, endDate:project.end })
          }).then(async r => {
            const json = await r.json()
            if (json.data) {
              await supabase.from("project_tools").upsert({
                project_id:projId, tool_type:toolId,
                data:json.data, updated_at:new Date().toISOString()
              }, { onConflict:"project_id,tool_type" })
            }
          })
        } catch {}
      }

      // Marquer l'onboarding comme complété
      await supabase.from("profiles").update({ onboarding_completed:true }).eq("id", (await supabase.auth.getUser()).data.user?.id)

      toast.success("Projet créé avec "+tools.length+" outils générés !")
      next()
    } catch(e:any) { toast.error(e.message) }
    finally { setGenerating(false) }
  }

  const finish = () => {
    if (createdId) router.push("/projects/"+createdId)
    else router.push("/dashboard")
  }

  const inp = { width:"100%", fontSize:13, border:"1px solid #1e293b", borderRadius:8, padding:"10px 14px", background:"#0f172a", color:"#f1f5f9", boxSizing:"border-box" as const, outline:"none" }

  return (
    <div style={{ minHeight:"100vh", background:"#0a0f1a", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"Arial, sans-serif" }}>
      <div style={{ width:"100%", maxWidth:580 }}>

        {/* Steps indicator */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:32 }}>
          {STEPS.map((s,i) => (
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700,
                background:i<step?"#7B5EFF":i===step?"rgba(123,94,255,0.2)":"#0f172a",
                border:"2px solid "+(i<=step?"#7B5EFF":"#1e293b"),
                color:i<step?"#fff":i===step?"#a78bfa":"#475569" }}>
                {i < step ? <Check size={12}/> : i+1}
              </div>
              {i < STEPS.length-1 && <div style={{ width:20, height:1, background:i<step?"#7B5EFF":"#1e293b" }}/>}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:16, padding:"32px", boxShadow:"0 0 60px rgba(123,94,255,0.1)" }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>{STEPS[step].icon}</div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", margin:0 }}>{STEPS[step].title}</h1>
          </div>

          {/* ── Step 0 : Welcome ── */}
          {step === 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <p style={{ fontSize:14, color:"#94a3b8", lineHeight:1.7, textAlign:"center" }}>
                PMO AI Studio est le copilote IA des chefs de projet certifiés.<br/>
                En 3 minutes, vous aurez un projet complet avec Gantt, RAID et Budget EVM générés par Claude AI.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {[
                  { icon:"🤖", label:"IA Claude Sonnet", desc:"Génération en 30s" },
                  { icon:"📊", label:"15 outils PMO", desc:"PMBOK 7 aligné" },
                  { icon:"🎯", label:"PMP® Ready", desc:"225 questions" },
                ].map(f => (
                  <div key={f.icon} style={{ background:"#1e293b", borderRadius:10, padding:"12px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>{f.icon}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#f1f5f9" }}>{f.label}</div>
                    <div style={{ fontSize:10, color:"#64748b" }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1 : Profile ── */}
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { label:"Votre prénom", field:"name", placeholder:"Ex: Abdelhafid" },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{f.label}</label>
                  <input value={(profile as any)[f.field]} onChange={e=>setProfile(p=>({...p,[f.field]:e.target.value}))} placeholder={f.placeholder} style={inp}/>
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Rôle</label>
                <select value={profile.role} onChange={e=>setProfile(p=>({...p,role:e.target.value}))} style={inp}>
                  {["Chef de Projet","PMO","Scrum Master","Product Owner","Directeur de Projet","Consultant IT"].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Expérience</label>
                <select value={profile.experience} onChange={e=>setProfile(p=>({...p,experience:e.target.value}))} style={inp}>
                  {["< 2 ans","2-5 ans","5-10 ans","10-15 ans","> 15 ans"].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── Step 2 : Project ── */}
          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Nom du projet *</label>
                <input value={project.name} onChange={e=>setProject(p=>({...p,name:e.target.value}))} placeholder="Ex: Migration JBOSS EAP" style={inp}/>
              </div>
              <div>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Type de projet</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {PROJECT_TYPES.map(t => (
                    <button key={t.id} onClick={()=>setProject(p=>({...p,type:t.id}))}
                      style={{ padding:"8px", borderRadius:8, border:"2px solid "+(project.type===t.id?t.color:"#1e293b"), background:project.type===t.id?t.color+"22":"transparent", cursor:"pointer", textAlign:"center" }}>
                      <div style={{ fontSize:18 }}>{t.icon}</div>
                      <div style={{ fontSize:10, color:project.type===t.id?t.color:"#64748b", fontWeight:600, marginTop:2 }}>{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Description (optionnel)</label>
                <textarea value={project.description} onChange={e=>setProject(p=>({...p,description:e.target.value}))} rows={3}
                  placeholder="Contexte, objectifs, enjeux..."
                  style={{ ...inp, resize:"vertical" }}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Budget (€)</label>
                  <input type="number" value={project.budget||""} onChange={e=>setProject(p=>({...p,budget:+e.target.value}))} placeholder="200000" style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Date début</label>
                  <input type="date" value={project.start} onChange={e=>setProject(p=>({...p,start:e.target.value}))} style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Date fin</label>
                  <input type="date" value={project.end} onChange={e=>setProject(p=>({...p,end:e.target.value}))} style={inp}/>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3 : Tools ── */}
          {step === 3 && (
            <div>
              <p style={{ fontSize:12, color:"#64748b", margin:"0 0 14px", textAlign:"center" }}>Sélectionnez les outils à générer automatiquement (max 3)</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {TOOL_OPTIONS.map(t => {
                  const sel = tools.includes(t.id)
                  return (
                    <button key={t.id} onClick={()=>toggleTool(t.id)}
                      style={{ padding:"12px 8px", borderRadius:10, border:"2px solid "+(sel?"#7B5EFF":"#1e293b"), background:sel?"rgba(123,94,255,0.15)":"transparent", cursor:"pointer", textAlign:"center", position:"relative" }}>
                      {sel && <div style={{ position:"absolute", top:6, right:6, width:14, height:14, borderRadius:"50%", background:"#7B5EFF", display:"flex", alignItems:"center", justifyContent:"center" }}><Check size={8} style={{ color:"#fff" }}/></div>}
                      <div style={{ fontSize:22, marginBottom:4 }}>{t.icon}</div>
                      <div style={{ fontSize:11, fontWeight:700, color:sel?"#a78bfa":"#94a3b8" }}>{t.label}</div>
                      <div style={{ fontSize:9, color:"#475569" }}>{t.desc}</div>
                    </button>
                  )
                })}
              </div>
              <p style={{ fontSize:10, color:"#475569", textAlign:"center", marginTop:10 }}>
                {tools.length} outil{tools.length>1?"s":""} sélectionné{tools.length>1?"s":""} · Génération ~{tools.length*15}s
              </p>
            </div>
          )}

          {/* ── Step 4 : Generate ── */}
          {step === 4 && !createdId && (
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:13, color:"#94a3b8", margin:"0 0 20px", lineHeight:1.7 }}>
                Tout est prêt ! Claude AI va générer<br/>
                <strong style={{ color:"#a78bfa" }}>{project.name||"votre projet"}</strong> avec<br/>
                {tools.length} outil{tools.length>1?"s":""} PMO en quelques secondes.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20, textAlign:"left" }}>
                {tools.map(t => {
                  const tool = TOOL_OPTIONS.find(o=>o.id===t)
                  return (
                    <div key={t} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"#1e293b", borderRadius:7 }}>
                      <span style={{ fontSize:14 }}>{tool?.icon}</span>
                      <span style={{ fontSize:12, color:"#94a3b8" }}>{tool?.label}</span>
                      <span style={{ marginLeft:"auto", fontSize:10, color:"#7B5EFF" }}>→ Génération IA</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 4 : Done ── */}
          {step === 4 && createdId && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
              <p style={{ fontSize:14, color:"#22c55e", fontWeight:700, marginBottom:8 }}>Projet créé avec succès !</p>
              <p style={{ fontSize:12, color:"#64748b", marginBottom:20 }}>
                {tools.length} outils générés et prêts à utiliser.
              </p>
            </div>
          )}

          {/* Boutons navigation */}
          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            {step > 0 && step < 4 && (
              <button onClick={back} style={{ padding:"10px 18px", background:"transparent", border:"1px solid #1e293b", borderRadius:9, fontSize:13, color:"#64748b", cursor:"pointer" }}>
                ← Retour
              </button>
            )}
            {step < 3 && (
              <button onClick={next} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", background:"linear-gradient(135deg,#7B5EFF,#185FA5)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Continuer <ChevronRight size={15}/>
              </button>
            )}
            {step === 3 && (
              <button onClick={next} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", background:"linear-gradient(135deg,#7B5EFF,#185FA5)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Prêt à générer ! <Sparkles size={15}/>
              </button>
            )}
            {step === 4 && !createdId && (
              <button onClick={generateAll} disabled={generating}
                style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", background:generating?"#1e293b":"linear-gradient(135deg,#7B5EFF,#185FA5)", color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:700, cursor:generating?"wait":"pointer" }}>
                {generating ? <>⏳ Génération en cours...</> : <><Zap size={16}/> Générer avec l'IA</>}
              </button>
            )}
            {step === 4 && createdId && (
              <button onClick={finish} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", background:"linear-gradient(135deg,#22c55e,#065f46)", color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                Voir mon projet <ArrowRight size={16}/>
              </button>
            )}
          </div>

          {step === 0 && (
            <button onClick={() => router.push("/dashboard")} style={{ width:"100%", marginTop:10, padding:"8px", background:"transparent", border:"none", cursor:"pointer", fontSize:12, color:"#475569" }}>
              Passer l'introduction →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
