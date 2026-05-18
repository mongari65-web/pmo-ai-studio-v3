"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import BackButton from "@/components/ui/BackButton"
import { FileText, Zap, Loader2, Download, Copy } from "lucide-react"

const DOCS = [
  { key:"charte",  icon:"📋", label:"Charte de Projet",     desc:"Objectifs SMART, périmètre, jalons",           color:"#7B5EFF" },
  { key:"wbs",     icon:"🗂️", label:"WBS + Work Packages",  desc:"3 niveaux, dictionnaire, fiches WP",           color:"#36B37E" },
  { key:"raid",    icon:"⚠️", label:"Registre RAID",         desc:"Risques, Actions, Issues, Décisions",          color:"#E24B4A" },
  { key:"raci",    icon:"👥", label:"Matrice RACI",          desc:"Rôles, responsabilités, activités",            color:"#FF991F" },
  { key:"recette", icon:"✅", label:"Plan de recette",       desc:"VABF, VSR, GO/NO-GO, bascule",                color:"#4EA8FF" },
  { key:"gantt",   icon:"📅", label:"Gantt + PERT",          desc:"Planning, chemin critique, jalons",            color:"#9B84FF" },
  { key:"plan_mgmt",icon:"📄",label:"Plan Management",       desc:"PMP complet PMBOK 7",                         color:"#FF8C00" },
]

export default function DocumentsPMIPage() {
  const [selected, setSelected] = useState<string|null>(null)
  const [context, setContext]   = useState("")
  const [prompt, setPrompt]     = useState("")
  const [result, setResult]     = useState("")
  const [loading, setLoading]   = useState(false)

  const generate = async (docKey?: string) => {
    const key = docKey ?? "custom"
    const doc = DOCS.find(d => d.key === key)
    setLoading(true); setResult("")

    const systemPrompt = `Tu es expert PMO et Chef de Projet certifié PMP. Génère des documents professionnels en français, conformes PMBOK 7, structurés et prêts à l'emploi. Format Markdown avec titres, tableaux et listes.`

    const userPrompt = docKey
      ? `Génère un(e) ${doc?.label} complet(e) et professionnel(le) pour le contexte suivant:\n\n${context || "Projet de migration infrastructure IT, 6 mois, équipe de 8 personnes, budget 300k€, client: entreprise industrielle"}\n\nLe document doit être directement utilisable par un Chef de Projet.`
      : prompt

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }]
        })
      })
      const data = await res.json()
      setResult(data.content?.[0]?.text ?? "Erreur lors de la génération")
    } catch(e: any) {
      setResult("Erreur : " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => { navigator.clipboard.writeText(result); }
  const download = () => {
    const blob = new Blob([result], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `${selected ?? "document"}-pmi.md`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout>
      <div style={{ padding: "24px 28px", background: "var(--bg)", minHeight: "100%" }}>
        <BackButton href="/dashboard" label="Dashboard"/>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase",
            letterSpacing: "1.5px", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 16, height: 1, background: "var(--primary)", display: "inline-block" }}/>
            // DOCUMENTS PMI
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: "0 0 4px",
            display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={22} style={{ color: "var(--primary)" }}/>
            Générateurs de documents
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
            Générez des documents PMI sans les lier à un projet. Pour des documents liés à un projet spécifique,
            allez dans <strong style={{ color: "var(--primary-light)" }}>Mes projets → Sélectionner un projet</strong>.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Grille documents */}
          <div>
            {/* Contexte */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--r12)", padding: 16, marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-2)",
                marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Contexte du projet (optionnel)
              </label>
              <textarea value={context} onChange={e => setContext(e.target.value)}
                placeholder="Décrivez votre projet : secteur, budget, équipe, objectifs..."
                rows={3}
                style={{ width: "100%", padding: "10px 14px", background: "var(--bg-card2)",
                  border: "1px solid var(--border)", borderRadius: "var(--r8)",
                  color: "var(--text-1)", fontSize: 13, resize: "vertical", outline: "none",
                  boxSizing: "border-box" }}/>
            </div>

            {/* Grille des types de docs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
              {DOCS.map(doc => (
                <button key={doc.key}
                  onClick={() => { setSelected(doc.key); generate(doc.key) }}
                  style={{ padding: "16px 12px", background: "var(--bg-card)",
                    border: `1px solid ${selected === doc.key ? doc.color : "var(--border)"}`,
                    borderRadius: "var(--r12)", cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                    boxShadow: selected === doc.key ? `0 0 16px ${doc.color}22` : "none" }}
                  onMouseEnter={e => { (e.currentTarget as any).style.borderColor = doc.color }}
                  onMouseLeave={e => { if (selected !== doc.key) (e.currentTarget as any).style.borderColor = "var(--border)" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{doc.icon}</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: doc.color, margin: "0 0 3px" }}>{doc.label}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, lineHeight: 1.4 }}>{doc.desc}</p>
                  <p style={{ fontSize: 10, color: doc.color, margin: "8px 0 0", fontWeight: 500 }}>
                    Cliquer pour générer →
                  </p>
                </button>
              ))}
            </div>

            {/* Prompt personnalisé */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--r12)", padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)", margin: "0 0 10px",
                display: "flex", alignItems: "center", gap: 6 }}>
                <span>✏️</span> Prompt personnalisé
              </p>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="Décrivez précisément le document PMI que vous souhaitez générer..."
                rows={4}
                style={{ width: "100%", padding: "10px 14px", background: "var(--bg-card2)",
                  border: "1px solid var(--border)", borderRadius: "var(--r8)",
                  color: "var(--text-1)", fontSize: 13, resize: "vertical", outline: "none",
                  boxSizing: "border-box", marginBottom: 10 }}/>
              <button onClick={() => { setSelected("custom"); generate() }}
                disabled={!prompt || loading}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
                  background: prompt ? "linear-gradient(135deg,var(--primary),var(--primary-dark))" : "var(--bg)",
                  border: "none", borderRadius: "var(--r8)", fontSize: 13, fontWeight: 600,
                  color: prompt ? "#fff" : "var(--text-3)", cursor: prompt && !loading ? "pointer" : "not-allowed",
                  boxShadow: prompt ? "0 0 16px var(--primary-glow)" : "none" }}>
                {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }}/> : <Zap size={14}/>}
                {loading ? "Génération..." : "Générer avec ce prompt"}
              </button>
            </div>
          </div>

          {/* Résultat */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--r12)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", margin: 0 }}>
                📄 Document généré
              </p>
              {result && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={copy}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                      background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r6)",
                      fontSize: 11, color: "var(--text-2)", cursor: "pointer" }}>
                    <Copy size={11}/> Copier
                  </button>
                  <button onClick={download}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                      background: "var(--primary-bg)", border: "1px solid rgba(123,94,255,0.3)",
                      borderRadius: "var(--r6)", fontSize: 11, color: "var(--primary-light)", cursor: "pointer" }}>
                    <Download size={11}/> .md
                  </button>
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "60px 0" }}>
                  <Loader2 size={32} style={{ color: "var(--primary)", animation: "spin 1s linear infinite", marginBottom: 16 }}/>
                  <p style={{ fontSize: 13, color: "var(--text-2)" }}>Génération en cours...</p>
                </div>
              ) : result ? (
                <pre style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.7, whiteSpace: "pre-wrap",
                  fontFamily: "var(--font-body)", margin: 0 }}>{result}</pre>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "60px 0" }}>
                  <FileText size={40} style={{ color: "var(--text-3)", marginBottom: 12, opacity: 0.3 }}/>
                  <p style={{ fontSize: 13, color: "var(--text-3)" }}>Cliquez sur un type de document pour générer</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </AppLayout>
  )
}
