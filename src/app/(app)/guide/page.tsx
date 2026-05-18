"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import BackButton from "@/components/ui/BackButton"
import { Wand2, ChevronRight, CheckCircle2, Circle, Loader2, Zap } from "lucide-react"

const STEPS = [
  { id: "info",  icon: "📋", label: "Informations projet" },
  { id: "wbs",   icon: "🗂️", label: "WBS Structure" },
  { id: "gantt", icon: "📅", label: "Planning Gantt" },
  { id: "raid",  icon: "⚠️", label: "Registre RAID" },
  { id: "budget",icon: "💰", label: "Budget EVM" },
  { id: "wp",    icon: "📦", label: "Work Packages" },
]

const METHODOLOGIES = ["PMI/PMBOK","PRINCE2","Agile/Scrum","SAFe","Hybride"]
const SECTORS = ["IT / Cloud","Finance / Banque","Industrie","Santé","Energie","Transport","Retail","Autre"]
const ENV = ["On-premise","Cloud AWS","Cloud Azure","Cloud GCP","Hybride","Multi-cloud"]

export default function GuidePage() {
  const [step, setStep]       = useState(0)
  const [generating, setGen]  = useState<string|null>(null)
  const [form, setForm]       = useState({
    name:"", description:"", client:"", budget:"", start:"", end:"",
    methodology:"PMI/PMBOK", sector:"IT / Cloud", environment:"Hybride",
    team_size:"", objectives:"", constraints:"",
  })
  const supabase = createClient()
  const router   = useRouter()

  const upd = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "var(--bg-card2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r8)",
    color: "var(--text-1)",
    fontSize: 13, outline: "none",
    boxSizing: "border-box",
  }

  const label = (text: string) => (
    <label style={{ display: "block", fontSize: 11, fontWeight: 600,
      color: "var(--text-2)", marginBottom: 6,
      textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {text}
    </label>
  )

  const createAndGenerate = async (toolType: string) => {
    if (!form.name) { toast.error("Renseignez au moins le nom du projet"); return }
    setGen(toolType)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Créer le projet
      const { data: project, error: projErr } = await supabase
        .from("projects").insert({
          user_id: user.id,
          name: form.name, description: form.description,
          client: form.client, budget: parseInt(form.budget) || 0,
          start_date: form.start, end_date: form.end,
          methodology: form.methodology, sector: form.sector,
          environment: form.environment, status: "active",
        }).select().single()

      if (projErr || !project) throw new Error(projErr?.message)

      // Générer l'outil
      const route = {
        wbs: "wbs", gantt: "gantt", raid: "raid", budget: "budget", wp: "workpackages"
      }[toolType] ?? toolType

      router.push(`/projects/${project.id}/${route}?generate=true`)
      toast.success(`Projet créé ! Génération ${toolType} en cours...`)
    } catch(e: any) {
      toast.error("Erreur : " + e.message)
    } finally {
      setGen(null)
    }
  }

  const TOOLS = [
    { key:"wbs",    icon:"🗂️", label:"WBS Structure",   desc:"Décomposition hiérarchique du scope en livrables" },
    { key:"gantt",  icon:"📅", label:"Planning Gantt",   desc:"Planning avec tâches, durées et dépendances" },
    { key:"raid",   icon:"⚠️", label:"Registre RAID",    desc:"Risques, Actions, Issues, Décisions" },
    { key:"budget", icon:"💰", label:"Budget EVM",        desc:"Suivi budgétaire avec CPI/SPI et courbe S" },
    { key:"wp",     icon:"📦", label:"Work Packages",     desc:"Livrables par phase avec responsables" },
  ]

  return (
    <div style={{ padding: "24px 28px", background: "var(--bg)", minHeight: "100%" }}>
      <BackButton href="/projects" label="Mes projets"/>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase",
          letterSpacing: "1.5px", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 16, height: 1, background: "var(--primary)", display: "inline-block" }}/>
          // GUIDE CHEF DE PROJET
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: "0 0 4px",
          display: "flex", alignItems: "center", gap: 10 }}>
          <Wand2 size={22} style={{ color: "var(--primary)" }}/>
          Créer un nouveau projet
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
          Renseignez les informations et l'IA générera tous vos outils PMO automatiquement.
        </p>
      </div>

      {/* Steps nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: "var(--r8)", border: "none", cursor: "pointer", transition: "all 0.15s",
              whiteSpace: "nowrap", flexShrink: 0, fontSize: 12, fontWeight: step === i ? 600 : 400,
              background: step === i ? "var(--primary-bg)" : "var(--bg-card)",
              color: step === i ? "var(--primary-light)" : "var(--text-2)",
              outline: step === i ? "1px solid rgba(123,94,255,0.3)" : "1px solid var(--border)" }}>
            {i < step
              ? <CheckCircle2 size={13} style={{ color: "#36B37E" }}/>
              : <span style={{ fontSize: 14 }}>{s.icon}</span>
            }
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Formulaire */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--r12)", padding: 24 }}>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)",
            margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{STEPS[step]?.icon}</span>
            {STEPS[step]?.label}
          </h2>

          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                {label("Nom du projet *")}
                <input value={form.name} onChange={e => upd("name", e.target.value)}
                  placeholder="Ex: Migration Plateform JBOSS EAP" style={inp}
                  onFocus={e => e.target.style.borderColor = "#7B5EFF"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}/>
              </div>
              <div>
                {label("Description")}
                <textarea value={form.description} onChange={e => upd("description", e.target.value)}
                  placeholder="Contexte, objectifs, périmètre..." rows={4}
                  style={{...inp, resize:"vertical"}}
                  onFocus={e => (e.target as any).style.borderColor = "#7B5EFF"}
                  onBlur={e => (e.target as any).style.borderColor = "var(--border)"}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  {label("Client / Commanditaire")}
                  <input value={form.client} onChange={e => upd("client", e.target.value)}
                    placeholder="Ex: CNAM, BNP Paribas" style={inp}
                    onFocus={e => e.target.style.borderColor = "#7B5EFF"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}/>
                </div>
                <div>
                  {label("Budget (€)")}
                  <input type="number" value={form.budget} onChange={e => upd("budget", e.target.value)}
                    placeholder="Ex: 150000" style={inp}
                    onFocus={e => e.target.style.borderColor = "#7B5EFF"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}/>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  {label("Date de début")}
                  <input type="date" value={form.start} onChange={e => upd("start", e.target.value)}
                    style={{...inp, colorScheme:"dark"}}/>
                </div>
                <div>
                  {label("Date de fin")}
                  <input type="date" value={form.end} onChange={e => upd("end", e.target.value)}
                    style={{...inp, colorScheme:"dark"}}/>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  {label("Méthodologie")}
                  <select value={form.methodology} onChange={e => upd("methodology", e.target.value)} style={inp}>
                    {METHODOLOGIES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  {label("Secteur")}
                  <select value={form.sector} onChange={e => upd("sector", e.target.value)} style={inp}>
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  {label("Environnement")}
                  <select value={form.environment} onChange={e => upd("environment", e.target.value)} style={inp}>
                    {ENV.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  {label("Taille équipe")}
                  <input type="number" value={form.team_size} onChange={e => upd("team_size", e.target.value)}
                    placeholder="Ex: 8" style={inp}
                    onFocus={e => e.target.style.borderColor = "#7B5EFF"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}/>
                </div>
                <div>
                  {label("Objectifs clés")}
                  <input value={form.objectives} onChange={e => upd("objectives", e.target.value)}
                    placeholder="Ex: Migration JBOSS, SSO..." style={inp}
                    onFocus={e => e.target.style.borderColor = "#7B5EFF"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}/>
                </div>
              </div>
            </div>
          )}

          {step > 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
                Complétez d'abord les informations du projet (étape 1),<br/>
                puis utilisez les boutons de génération IA →
              </p>
              <button onClick={() => setStep(0)}
                style={{ padding: "10px 20px", background: "var(--primary-bg)",
                  border: "1px solid rgba(123,94,255,0.3)", borderRadius: "var(--r8)",
                  color: "var(--primary-light)", fontSize: 13, cursor: "pointer" }}>
                ← Retour aux informations
              </button>
            </div>
          )}
        </div>

        {/* Panel génération */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Info projet */}
          {form.name && (
            <div style={{ background: "var(--primary-bg)", border: "1px solid rgba(123,94,255,0.25)",
              borderRadius: "var(--r12)", padding: 16 }}>
              <p style={{ fontSize: 12, color: "var(--primary-light)", fontWeight: 600, margin: "0 0 4px" }}>
                📋 Projet en cours
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", margin: "0 0 4px" }}>
                {form.name}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>
                {form.methodology} · {form.sector} · {form.budget ? `${(+form.budget/1000).toFixed(0)}k€` : "Budget non défini"}
              </p>
            </div>
          )}

          {/* Boutons génération */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--r12)", padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", margin: "0 0 12px",
              textTransform: "uppercase", letterSpacing: "0.5px" }}>⚡ Générer avec l'IA</p>

            {TOOLS.map(tool => (
              <button key={tool.key}
                onClick={() => createAndGenerate(tool.key)}
                disabled={!form.name || generating !== null}
                style={{ display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "10px 12px", marginBottom: 8,
                  background: generating === tool.key ? "var(--primary-bg)" : "var(--bg)",
                  border: `1px solid ${generating === tool.key ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--r8)", cursor: !form.name || generating ? "not-allowed" : "pointer",
                  opacity: !form.name ? 0.5 : 1, transition: "all 0.15s" }}
                onMouseEnter={e => { if (form.name && !generating) (e.currentTarget as any).style.borderColor = "var(--primary)" }}
                onMouseLeave={e => { if (generating !== tool.key) (e.currentTarget as any).style.borderColor = "var(--border)" }}>
                {generating === tool.key
                  ? <Loader2 size={16} style={{ color: "var(--primary)", animation: "spin 1s linear infinite", flexShrink: 0 }}/>
                  : <span style={{ fontSize: 16, flexShrink: 0 }}>{tool.icon}</span>
                }
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", margin: 0 }}>{tool.label}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>{tool.desc}</p>
                </div>
                <ChevronRight size={13} style={{ color: "var(--text-3)", marginLeft: "auto", flexShrink: 0 }}/>
              </button>
            ))}
          </div>

          {/* CTA créer projet seul */}
          <button onClick={() => createAndGenerate("dashboard")}
            disabled={!form.name || generating !== null}
            style={{ padding: "11px", width: "100%",
              background: form.name ? "linear-gradient(135deg,var(--primary),var(--primary-dark))" : "var(--bg-card)",
              border: "none", borderRadius: "var(--r8)", fontSize: 13, fontWeight: 600,
              color: form.name ? "#fff" : "var(--text-3)",
              cursor: !form.name || generating ? "not-allowed" : "pointer",
              boxShadow: form.name ? "0 0 20px var(--primary-glow)" : "none" }}>
            {generating ? "Création en cours..." : "✨ Créer le projet"}
          </button>

          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </div>
  )
}
