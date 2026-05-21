"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import BackButton from "@/components/ui/BackButton"
import { Wand2, ChevronRight, Loader2, Zap, Info } from "lucide-react"
import TutorialGuide from "@/components/ui/TutorialGuide"

// ── Taxonomie complète ────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { id:"migration",   label:"Migration IT",         icon:"🔄", desc:"Migration infra, middleware, JBOSS, VMware, K8s",   color:"#3b82f6" },
  { id:"app-web",     label:"Application Web/Mobile",icon:"📱", desc:"Développement MVP, POC, SaaS, produit digital",     color:"#7B5EFF" },
  { id:"devops",      label:"DevOps / CI-CD",        icon:"⚙️", desc:"Pipeline CI/CD, automatisation, Infrastructure as Code", color:"#22c55e" },
  { id:"ai-ml",       label:"Projet AI / ML",        icon:"🤖", desc:"IA générative, ML, CPMAI, multi-agents, LLM",      color:"#f97316" },
  { id:"rd",          label:"R&D / Innovation",      icon:"🔬", desc:"Recherche appliquée, CIR/CII, prototype, POC",     color:"#8b5cf6" },
  { id:"integration", label:"Intégration / API",     icon:"🔗", desc:"Connecteurs, ESB, microservices, API Gateway",     color:"#06b6d4" },
  { id:"btp",         label:"BTP / Construction",    icon:"🏗️", desc:"Bâtiment, génie civil, rénovation, travaux",       color:"#f59e0b" },
  { id:"sante",       label:"Santé / Médical",       icon:"🏥", desc:"Clinique, équipements médicaux, accréditation",    color:"#ef4444" },
  { id:"evenement",   label:"Événementiel",          icon:"🎪", desc:"Festival, conférence, lancement produit",          color:"#ec4899" },
  { id:"autre",       label:"Autre",                 icon:"📋", desc:"Tout autre type de projet",                        color:"#64748b" },
]

const METHODOLOGIES = [
  { id:"waterfall",   label:"Waterfall",             icon:"🌊", desc:"Séquentiel — Initiation → Planification → Exécution → Clôture",    color:"#3b82f6",
    outils:["wbs","gantt","raid","budget","wp"], ceremonies:[] },
  { id:"pmbok",       label:"PMI / PMBOK 7",         icon:"📊", desc:"12 principes, 8 domaines de performance, approche hybride",        color:"#7B5EFF",
    outils:["wbs","gantt","raid","budget","wp"], ceremonies:[] },
  { id:"prince2",     label:"PRINCE2",               icon:"👑", desc:"Processus dirigé, Business Case, 7 thèmes, 7 principes",          color:"#854F0B",
    outils:["wbs","gantt","raid","budget","wp"], ceremonies:[] },
  { id:"scrum",       label:"Agile / Scrum",         icon:"🔄", desc:"Itératif par sprints 1-4 semaines, cérémonies Scrum",             color:"#22c55e",
    outils:["sprint","raid","okr"], ceremonies:["backlog","planning","daily","review","retro"] },
  { id:"kanban",      label:"Kanban",                icon:"📋", desc:"Flux continu, WIP limits, cycle time, débit",                     color:"#06b6d4",
    outils:["sprint","raid"], ceremonies:["backlog","daily","review"] },
  { id:"safe",        label:"SAFe 6",                icon:"🏢", desc:"Scaled Agile — Teams, ART, PI Planning, Portfolio",              color:"#8b5cf6",
    outils:["sprint","gantt","raid","okr"], ceremonies:["pi-planning","backlog","planning","daily","review","retro"] },
  { id:"mvp",         label:"Agile MVP",             icon:"🚀", desc:"Minimum Viable Product — Hypothèses → Build → Measure → Learn",  color:"#f59e0b",
    outils:["sprint","raid","okr"], ceremonies:["backlog","planning","review"] },
  { id:"poc",         label:"POC / Prototype",       icon:"🧪", desc:"Proof of Concept — Itératif, validation rapide, pivot possible",  color:"#ec4899",
    outils:["sprint","raid"], ceremonies:["backlog","planning","review"] },
  { id:"incremental", label:"Agile Incrémental",     icon:"📈", desc:"MBI — Livraisons progressives par incréments fonctionnels",      color:"#22c55e",
    outils:["sprint","gantt","raid","okr"], ceremonies:["backlog","planning","daily","review","retro"] },
  { id:"iteratif",    label:"Agile Itératif",        icon:"🔁", desc:"Prototype → Test → Affiner — cycles courts d'amélioration",      color:"#3b82f6",
    outils:["sprint","raid"], ceremonies:["backlog","planning","review","retro"] },
  { id:"cpmai",       label:"CPMAI / AI Project",    icon:"🤖", desc:"DIKUW — Data → Information → Knowledge → Understanding → Wisdom", color:"#f97316",
    outils:["wbs","sprint","raid","budget"], ceremonies:["backlog","planning","review"] },
  { id:"hybride",     label:"Hybride",               icon:"⚡", desc:"Mix Waterfall + Agile — Phases + Sprints",                       color:"#7B5EFF",
    outils:["wbs","gantt","sprint","raid","budget","wp"], ceremonies:["backlog","planning","daily","review","retro"] },
]

const TEST_APPROACHES = [
  { id:"tdd",   label:"TDD",   icon:"🔴", desc:"Test Driven Development — Red → Green → Refactor" },
  { id:"bdd",   label:"BDD",   icon:"🟢", desc:"Behavior Driven Development — Given/When/Then" },
  { id:"atdd",  label:"ATDD",  icon:"🔵", desc:"Acceptance TDD — Tests d'acceptation dès le début" },
  { id:"devops",label:"DevOps",icon:"⚙️", desc:"CI/CD — Tests automatisés dans le pipeline" },
  { id:"none",  label:"Aucune",icon:"⬜", desc:"Pas d'approche test spécifique définie" },
]

const SECTORS = ["IT / Cloud","Finance / Banque","Industrie / Manufacturing","IoT / Embarqué","Santé / Médical","Énergie / Nucléaire","Transport / Mobilité","Retail / E-commerce","Télécoms","Administration Publique","Autre"]
const ENV = ["On-premise","Cloud AWS","Cloud Azure","Cloud GCP","Hybride","Multi-cloud","Edge Computing"]

// ── Pipeline visuel Scrum ─────────────────────────────────────────────────────
function ScrumPipeline({ projectId, methodology }: { projectId?: string; methodology: string }) {
  const m = METHODOLOGIES.find(x => x.id === methodology)
  if (!m || m.ceremonies.length === 0) return null

  const CEREMONIES: Record<string, { label:string; icon:string; color:string; tool:string; desc:string }> = {
    "pi-planning": { label:"PI Planning",    icon:"🗓️", color:"#8b5cf6", tool:"gantt",  desc:"Programme Increment Planning — SAFe" },
    "backlog":     { label:"Product Backlog",icon:"📋", color:"#7B5EFF", tool:"sprint", desc:"User Stories priorisées par valeur" },
    "planning":    { label:"Sprint Planning",icon:"📅", color:"#22c55e", tool:"sprint", desc:"Sélection des stories + Sprint Goal" },
    "daily":       { label:"Daily Scrum",    icon:"☀️", color:"#f59e0b", tool:"sprint", desc:"15 min · 3 questions · synchronisation" },
    "review":      { label:"Sprint Review",  icon:"🔍", color:"#06b6d4", tool:"sprint", desc:"Démo + feedbacks stakeholders" },
    "retro":       { label:"Rétrospective",  icon:"🔄", color:"#ef4444", tool:"sprint", desc:"Start/Stop/Continue — amélioration continue" },
  }

  return (
    <div style={{ background:"var(--bg-card)", border:`1px solid ${m.color}33`, borderRadius:12, padding:16, marginTop:16 }}>
      <div style={{ fontSize:12, fontWeight:700, color:m.color, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
        <span>{m.icon}</span> Pipeline {m.label} — Cliquez pour accéder à l'outil
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
        {m.ceremonies.map((cId, i) => {
          const cer = CEREMONIES[cId]
          if (!cer) return null
          return (
            <div key={cId} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div
                onClick={() => projectId && window.open(`/projects/${projectId}/${cer.tool}`, "_self")}
                title={cer.desc}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 12px", background:`${cer.color}15`, border:`1px solid ${cer.color}44`, borderRadius:10, cursor:projectId?"pointer":"default", transition:"all 0.15s", minWidth:90, textAlign:"center" }}
                onMouseEnter={e => projectId && ((e.currentTarget as any).style.background=`${cer.color}25`)}
                onMouseLeave={e => ((e.currentTarget as any).style.background=`${cer.color}15`)}>
                <span style={{ fontSize:20 }}>{cer.icon}</span>
                <span style={{ fontSize:10, fontWeight:700, color:cer.color, lineHeight:1.3 }}>{cer.label}</span>
              </div>
              {i < m.ceremonies.length-1 && <span style={{ fontSize:14, color:"var(--text-3)" }}>→</span>}
            </div>
          )
        })}
      </div>
      {!projectId && <p style={{ fontSize:10, color:"var(--text-3)", margin:"10px 0 0" }}>💡 Créez le projet pour activer les liens vers les outils</p>}
    </div>
  )
}

// ── Pipeline CPMAI/AI ─────────────────────────────────────────────────────────
function CPMAIPipeline({ projectId }: { projectId?: string }) {
  const PHASES = [
    { label:"Business\nUnderstanding", icon:"🎯", color:"#7B5EFF", desc:"Objectifs métier, KPIs succès, ROI attendu" },
    { label:"Data\nAcquisition",       icon:"📊", color:"#3b82f6", desc:"Sources données, qualité, volumétrie, RGPD" },
    { label:"Data\nExploration",       icon:"🔍", color:"#06b6d4", desc:"EDA, corrélations, features, biais détectés" },
    { label:"Model\nEngineering",      icon:"🤖", color:"#f97316", desc:"Architecture modèle, entraînement, hyperparamètres" },
    { label:"Model\nEvaluation",       icon:"📈", color:"#22c55e", desc:"Métriques ML, validation croisée, tests A/B" },
    { label:"Model\nDeployment",       icon:"🚀", color:"#ef4444", desc:"MLOps, monitoring, drift detection, feedback loop" },
  ]
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid rgba(249,115,22,0.3)", borderRadius:12, padding:16, marginTop:16 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#f97316", marginBottom:12 }}>🤖 Pipeline CPMAI — 6 phases itératives</div>
      <div style={{ display:"flex", alignItems:"center", gap:4, overflowX:"auto", paddingBottom:4 }}>
        {PHASES.map((p, i) => (
          <div key={p.label} style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
            <div title={p.desc} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 10px", background:`${p.color}15`, border:`1px solid ${p.color}44`, borderRadius:10, minWidth:80, textAlign:"center", cursor:"pointer" }}>
              <span style={{ fontSize:18 }}>{p.icon}</span>
              <span style={{ fontSize:9, fontWeight:700, color:p.color, lineHeight:1.3, whiteSpace:"pre-line" }}>{p.label}</span>
            </div>
            {i < PHASES.length-1 && <span style={{ fontSize:12, color:"var(--text-3)" }}>→</span>}
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, fontSize:10, color:"var(--text-3)" }}>DIKUW : Data → Information → Knowledge → Understanding → Wisdom · Itératif et non linéaire</div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function GuidePage() {
  const [generating, setGen] = useState<string|null>(null)
  const [form, setForm] = useState({
    name:"", description:"", client:"", budget:"", start:"", end:"",
    project_type:"app-web", methodology:"scrum", sector:"IT / Cloud",
    environment:"Hybride", team_size:"", objectives:"", constraints:"",
    test_approach:"none",
  })
  const supabase = createClient()
  const router = useRouter()
  const upd = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const selectedMethod = METHODOLOGIES.find(m => m.id === form.methodology) ?? METHODOLOGIES[0]
  const selectedType   = PROJECT_TYPES.find(t => t.id === form.project_type) ?? PROJECT_TYPES[0]

  const inp: React.CSSProperties = {
    width:"100%", padding:"10px 14px", background:"var(--bg-card2)",
    border:"1px solid var(--border)", borderRadius:"var(--r8)",
    color:"var(--text-1)", fontSize:13, outline:"none", boxSizing:"border-box",
  }
  const lbl = (text: string) => (
    <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-2)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>{text}</label>
  )

  const TOOLS_FOR_METHOD: Record<string,{key:string;icon:string;label:string;desc:string}[]> = {
    waterfall:   [{key:"wbs",icon:"🗂️",label:"WBS",desc:"Structure découpage"},{key:"gantt",icon:"📅",label:"Gantt",desc:"Planning séquentiel"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques & Actions"},{key:"budget",icon:"💰",label:"Budget EVM",desc:"Earned Value"},{key:"wp",icon:"📦",label:"Work Packages",desc:"Livrables"}],
    pmbok:       [{key:"wbs",icon:"🗂️",label:"WBS",desc:"PMBOK 7"},{key:"gantt",icon:"📅",label:"Gantt",desc:"Planning"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques"},{key:"budget",icon:"💰",label:"Budget EVM",desc:"CPI/SPI"},{key:"wp",icon:"📦",label:"Work Packages",desc:"Livrables"}],
    prince2:     [{key:"wbs",icon:"🗂️",label:"WBS",desc:"Structure"},{key:"gantt",icon:"📅",label:"Gantt",desc:"Planning"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques"},{key:"budget",icon:"💰",label:"Budget",desc:"Business Case"}],
    scrum:       [{key:"sprint",icon:"🔄",label:"Sprint Review",desc:"Agile/Scrum"},{key:"okr",icon:"🎯",label:"OKR Tracker",desc:"Objectifs"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques"}],
    kanban:      [{key:"sprint",icon:"🔄",label:"Kanban Board",desc:"Flux continu"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Blocages"}],
    safe:        [{key:"gantt",icon:"📅",label:"PI Planning",desc:"SAFe ART"},{key:"sprint",icon:"🔄",label:"Sprint",desc:"Team Agile"},{key:"okr",icon:"🎯",label:"OKR",desc:"Portfolio"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques"}],
    mvp:         [{key:"sprint",icon:"🔄",label:"Sprint MVP",desc:"Build-Measure-Learn"},{key:"okr",icon:"🎯",label:"OKR / KPIs",desc:"Métriques validation"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Hypothèses"}],
    poc:         [{key:"sprint",icon:"🔄",label:"Sprint POC",desc:"Validation rapide"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques"}],
    incremental: [{key:"gantt",icon:"📅",label:"Roadmap",desc:"Incréments"},{key:"sprint",icon:"🔄",label:"Sprint",desc:"MBI"},{key:"okr",icon:"🎯",label:"OKR",desc:"Valeur"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques"}],
    iteratif:    [{key:"sprint",icon:"🔄",label:"Sprint",desc:"Itérations"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques"}],
    cpmai:       [{key:"wbs",icon:"🗂️",label:"WBS AI",desc:"Data + Modèles"},{key:"sprint",icon:"🔄",label:"Sprint ML",desc:"Itérations modèle"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques AI"},{key:"budget",icon:"💰",label:"Budget",desc:"Compute costs"}],
    hybride:     [{key:"wbs",icon:"🗂️",label:"WBS",desc:"Structure"},{key:"gantt",icon:"📅",label:"Gantt",desc:"Planning"},{key:"sprint",icon:"🔄",label:"Sprint",desc:"Agile"},{key:"raid",icon:"⚠️",label:"RAID",desc:"Risques"},{key:"budget",icon:"💰",label:"Budget EVM",desc:"CPI/SPI"},{key:"wp",icon:"📦",label:"WP",desc:"Livrables"}],
  }

  const tools = TOOLS_FOR_METHOD[form.methodology] ?? TOOLS_FOR_METHOD["hybride"]

  const createAndGenerate = async (toolType: string) => {
    if (!form.name) { toast.error("Renseignez au moins le nom du projet"); return }
    setGen(toolType)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: project, error: projErr } = await supabase
        .from("projects").insert({
          user_id: user.id,
          name: form.name, description: form.description,
          client: form.client, budget: parseInt(form.budget) || 0,
          start_date: form.start, end_date: form.end,
          methodology: form.methodology, sector: form.sector,
          environment: form.environment, status: "active",
          tags: [form.project_type, form.methodology, form.test_approach].filter(Boolean),
        }).select().single()
      if (projErr || !project) throw new Error(projErr?.message)
      const route = { wbs:"wbs", gantt:"gantt", raid:"raid", budget:"budget", wp:"workpackages", sprint:"sprint", okr:"okr", dashboard:"" }[toolType] ?? toolType
      router.push(route ? `/projects/${project.id}/${route}?generate=true` : `/projects/${project.id}`)
      toast.success(`Projet créé ! Génération ${toolType} en cours...`)
    } catch(e: any) {
      toast.error("Erreur : " + e.message)
    } finally { setGen(null) }
  }

  return (
    <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>
      <BackButton href="/projects" label="Mes projets"/>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1.5px", margin:"0 0 6px", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:16, height:1, background:"var(--primary)", display:"inline-block" }}/> // GUIDE CHEF DE PROJET
        </p>
        <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:"0 0 4px", display:"flex", alignItems:"center", gap:10 }}>
          <Wand2 size={22} style={{ color:"var(--primary)" }}/> Créer un nouveau projet
        </h1>
        <p style={{ fontSize:13, color:"var(--text-2)", margin:0 }}>Renseignez les informations et l'IA adaptera les outils PMO à votre méthode.</p>
      </div>

      <TutorialGuide
        onApplyExample={(ex) => setForm(f => ({...f,
          name:ex.name, description:ex.description, client:ex.client,
          budget:ex.budget, sector:ex.sector, environment:ex.environment,
          team_size:ex.team_size, objectives:ex.objectives,
          project_type:ex.project_type, methodology:ex.methodology,
          test_approach:ex.test_approach
        }))}
        onClose={() => {}}
      />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>

        {/* Formulaire gauche */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* BLOC 1 — Type de projet */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px", display:"flex", alignItems:"center", gap:8 }}>
              <span>📁</span> Type de projet
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
              {PROJECT_TYPES.map(t => (
                <button key={t.id} onClick={() => upd("project_type", t.id)} title={t.desc}
                  style={{ padding:"10px 8px", borderRadius:9, border:`1px solid ${form.project_type===t.id?t.color:"var(--border)"}`, background:form.project_type===t.id?`${t.color}18`:"var(--bg)", cursor:"pointer", transition:"all 0.15s", textAlign:"center" }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{t.icon}</div>
                  <div style={{ fontSize:10, fontWeight:form.project_type===t.id?700:400, color:form.project_type===t.id?t.color:"var(--text-2)", lineHeight:1.3 }}>{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* BLOC 2 — Méthodologie */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px", display:"flex", alignItems:"center", gap:8 }}>
              <span>⚙️</span> Méthode de pilotage
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {METHODOLOGIES.map(m => (
                <button key={m.id} onClick={() => upd("methodology", m.id)} title={m.desc}
                  style={{ padding:"10px 8px", borderRadius:9, border:`1px solid ${form.methodology===m.id?m.color:"var(--border)"}`, background:form.methodology===m.id?`${m.color}18`:"var(--bg)", cursor:"pointer", transition:"all 0.15s", textAlign:"center" }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{m.icon}</div>
                  <div style={{ fontSize:10, fontWeight:form.methodology===m.id?700:400, color:form.methodology===m.id?m.color:"var(--text-2)", lineHeight:1.3 }}>{m.label}</div>
                </button>
              ))}
            </div>

            {/* Description méthode sélectionnée */}
            <div style={{ marginTop:12, padding:"10px 14px", background:`${selectedMethod.color}0A`, border:`1px solid ${selectedMethod.color}33`, borderRadius:8, display:"flex", gap:8 }}>
              <span style={{ fontSize:16 }}>{selectedMethod.icon}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:selectedMethod.color }}>{selectedMethod.label}</div>
                <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{selectedMethod.desc}</div>
              </div>
            </div>

            {/* Pipeline visuel Scrum/SAFe */}
            {["scrum","kanban","safe","mvp","poc","incremental","iteratif","hybride"].includes(form.methodology) && (
              <ScrumPipeline methodology={form.methodology}/>
            )}

            {/* Pipeline CPMAI */}
            {form.methodology === "cpmai" && <CPMAIPipeline/>}
          </div>

          {/* BLOC 3 — Approche Test (si DevOps ou AI) */}
          {["devops","ai-ml","app-web","scrum","safe","hybride"].includes(form.project_type) && (
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
              <h2 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px", display:"flex", alignItems:"center", gap:8 }}>
                <span>🧪</span> Approche Test
              </h2>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {TEST_APPROACHES.map(t => (
                  <button key={t.id} onClick={() => upd("test_approach", t.id)} title={t.desc}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, border:`1px solid ${form.test_approach===t.id?"var(--primary)":"var(--border)"}`, background:form.test_approach===t.id?"rgba(123,94,255,0.12)":"var(--bg)", cursor:"pointer", fontSize:12, fontWeight:form.test_approach===t.id?700:400, color:form.test_approach===t.id?"var(--primary-light)":"var(--text-2)" }}>
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
              {form.test_approach !== "none" && (
                <div style={{ marginTop:10, fontSize:11, color:"var(--text-3)", padding:"8px 12px", background:"rgba(123,94,255,0.05)", borderRadius:6 }}>
                  {TEST_APPROACHES.find(t=>t.id===form.test_approach)?.desc}
                </div>
              )}
            </div>
          )}

          {/* BLOC 4 — Informations générales */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:"0 0 16px", display:"flex", alignItems:"center", gap:8 }}>
              <span>📋</span> Informations générales
            </h2>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                {lbl("Nom du projet *")}
                <input value={form.name} onChange={e => upd("name", e.target.value)}
                  placeholder="Ex: Migration Plateform JBOSS EAP" style={inp}
                  onFocus={e => e.target.style.borderColor="#7B5EFF"}
                  onBlur={e => e.target.style.borderColor="var(--border)"}/>
              </div>
              <div>
                {lbl("Description")}
                <textarea value={form.description} onChange={e => upd("description", e.target.value)}
                  placeholder="Contexte, objectifs, périmètre, enjeux..." rows={3}
                  style={{...inp, resize:"vertical"}}
                  onFocus={e => (e.target as any).style.borderColor="#7B5EFF"}
                  onBlur={e => (e.target as any).style.borderColor="var(--border)"}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  {lbl("Client / Commanditaire")}
                  <input value={form.client} onChange={e => upd("client", e.target.value)}
                    placeholder="Ex: CNAM, BNP Paribas" style={inp}
                    onFocus={e => e.target.style.borderColor="#7B5EFF"}
                    onBlur={e => e.target.style.borderColor="var(--border)"}/>
                </div>
                <div>
                  {lbl("Budget (€)")}
                  <input type="number" value={form.budget} onChange={e => upd("budget", e.target.value)}
                    placeholder="Ex: 150000" style={inp}
                    onFocus={e => e.target.style.borderColor="#7B5EFF"}
                    onBlur={e => e.target.style.borderColor="var(--border)"}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  {lbl("Date de début")}
                  <input type="date" value={form.start} onChange={e => upd("start", e.target.value)} style={{...inp, colorScheme:"dark"}}/>
                </div>
                <div>
                  {lbl("Date de fin")}
                  <input type="date" value={form.end} onChange={e => upd("end", e.target.value)} style={{...inp, colorScheme:"dark"}}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  {lbl("Secteur")}
                  <select value={form.sector} onChange={e => upd("sector", e.target.value)} style={inp}>
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  {lbl("Environnement")}
                  <select value={form.environment} onChange={e => upd("environment", e.target.value)} style={inp}>
                    {ENV.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  {lbl("Taille équipe")}
                  <input type="number" value={form.team_size} onChange={e => upd("team_size", e.target.value)}
                    placeholder="Ex: 8" style={inp}
                    onFocus={e => e.target.style.borderColor="#7B5EFF"}
                    onBlur={e => e.target.style.borderColor="var(--border)"}/>
                </div>
                <div>
                  {lbl("Objectifs clés")}
                  <input value={form.objectives} onChange={e => upd("objectives", e.target.value)}
                    placeholder="Ex: Migration JBOSS, SSO..." style={inp}
                    onFocus={e => e.target.style.borderColor="#7B5EFF"}
                    onBlur={e => e.target.style.borderColor="var(--border)"}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel droit — Génération IA */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

          {/* Badge méthode + type */}
          <div style={{ background:`${selectedMethod.color}0F`, border:`1px solid ${selectedMethod.color}33`, borderRadius:12, padding:"12px 16px" }}>
            <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:6 }}>Configuration détectée</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:`${selectedType.color}22`, color:selectedType.color, fontWeight:700 }}>{selectedType.icon} {selectedType.label}</span>
              <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:`${selectedMethod.color}22`, color:selectedMethod.color, fontWeight:700 }}>{selectedMethod.icon} {selectedMethod.label}</span>
              {form.test_approach !== "none" && (
                <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:"rgba(123,94,255,0.15)", color:"var(--primary-light)", fontWeight:700 }}>
                  {TEST_APPROACHES.find(t=>t.id===form.test_approach)?.icon} {form.test_approach.toUpperCase()}
                </span>
              )}
            </div>
            {form.name && (
              <div style={{ marginTop:8, fontSize:13, fontWeight:700, color:"var(--text-1)" }}>📋 {form.name}</div>
            )}
            {form.budget && (
              <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{form.sector} · {(+form.budget/1000).toFixed(0)}k€</div>
            )}
          </div>

          {/* Outils adaptés à la méthode */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:16 }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--text-2)", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              <Zap size={11} style={{ marginRight:4 }}/> Outils recommandés — {selectedMethod.label}
            </p>
            {tools.map(tool => (
              <button key={tool.key} onClick={() => createAndGenerate(tool.key)}
                disabled={!form.name || generating !== null}
                style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 12px", marginBottom:8, background:generating===tool.key?"var(--primary-bg)":"var(--bg)", border:`1px solid ${generating===tool.key?"var(--primary)":"var(--border)"}`, borderRadius:"var(--r8)", cursor:!form.name||generating?"not-allowed":"pointer", opacity:!form.name?0.5:1, transition:"all 0.15s" }}
                onMouseEnter={e => { if(form.name&&!generating)(e.currentTarget as any).style.borderColor="var(--primary)" }}
                onMouseLeave={e => { if(generating!==tool.key)(e.currentTarget as any).style.borderColor="var(--border)" }}>
                {generating===tool.key
                  ? <Loader2 size={16} style={{ color:"var(--primary)", animation:"spin 1s linear infinite", flexShrink:0 }}/>
                  : <span style={{ fontSize:16, flexShrink:0 }}>{tool.icon}</span>}
                <div style={{ textAlign:"left" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"var(--text-1)", margin:0 }}>{tool.label}</p>
                  <p style={{ fontSize:11, color:"var(--text-3)", margin:0 }}>{tool.desc}</p>
                </div>
                <ChevronRight size={13} style={{ color:"var(--text-3)", marginLeft:"auto", flexShrink:0 }}/>
              </button>
            ))}
          </div>

          {/* CTA créer projet */}
          <button onClick={() => createAndGenerate("dashboard")} disabled={!form.name||generating!==null}
            style={{ padding:"11px", width:"100%", background:form.name?"linear-gradient(135deg,var(--primary),var(--primary-dark))":"var(--bg-card)", border:"none", borderRadius:"var(--r8)", fontSize:13, fontWeight:600, color:form.name?"#fff":"var(--text-3)", cursor:!form.name||generating?"not-allowed":"pointer", boxShadow:form.name?"0 0 20px var(--primary-glow)":"none" }}>
            {generating ? "Création en cours..." : "✨ Créer le projet"}
          </button>

          {/* Aide contextuelle */}
          <div style={{ padding:"10px 14px", background:"rgba(123,94,255,0.05)", border:"1px solid rgba(123,94,255,0.15)", borderRadius:10 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--primary-light)", marginBottom:4, display:"flex", alignItems:"center", gap:5 }}>
              <Info size={11}/> Conseil IA
            </div>
            <p style={{ fontSize:11, color:"var(--text-3)", margin:0, lineHeight:1.5 }}>
              {form.methodology === "cpmai" && "Projet AI : suivez les 6 phases CPMAI. Commencez par le WBS pour structurer vos datasets et modèles."}
              {form.methodology === "scrum" && "Mode Scrum : créez d'abord le Sprint Review, puis l'OKR Tracker pour suivre vos objectifs sprint."}
              {form.methodology === "mvp" && "MVP : définissez vos hypothèses dans le RAID, puis pilotez par OKR pour valider la valeur métier."}
              {form.methodology === "waterfall" && "Waterfall : commencez par le WBS, puis le Gantt pour construire un planning solide."}
              {form.methodology === "safe" && "SAFe : démarrez par le Gantt pour le PI Planning, puis les OKR Portfolio."}
              {form.methodology === "hybride" && "Hybride : WBS + Gantt pour les phases macro, Sprint Review pour les cycles Agile."}
              {!["cpmai","scrum","mvp","waterfall","safe","hybride"].includes(form.methodology) && "Renseignez le nom du projet et choisissez l'outil à générer en premier."}
            </p>
          </div>

          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </div>
  )
}
