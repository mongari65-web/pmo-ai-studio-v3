"use client"
import { NavButtons } from "@/components/ui/BackButton"
import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Pencil, Check, X, ChevronLeft, ChevronRight } from "lucide-react"

interface Contributor { profile: string; name: string; etp: number; criticality: string }

interface WP {
  id: string; code: string; name: string; phase: string
  description: string; deliverables: string; responsible: string
  start: string; end: string; duration: number; budget: number
  status: string; completion: number; dependencies: string; acceptance: string
  objective?: string
  activities?: string[]
  contributors?: Contributor[]
  lead_profile?: string
  lead_etp?: number
}

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  "Terminé":   { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  "En cours":  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  "Planifié":  { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  "En retard": { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
}
const PHASE_COLORS = ["var(--primary)", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"]
const CRIT_COLORS: Record<string, string> = {
  "Critique": "#ef4444", "Haute": "#f59e0b", "Moyenne": "#3b82f6", "Faible": "#22c55e"
}

export default function WorkPackagesPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "workpackages")
  const [wps, setWps] = useState<WP[]>([])
  const [activeTab, setActiveTab] = useState<"fiche" | "cards" | "table">("fiche")
  const [ficheIdx, setFicheIdx] = useState(0)
  const [editId, setEditId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<WP | null>(null)
  const [filterPhase, setFilterPhase] = useState("Tous")

  useEffect(() => { if (data?.workpackages) setWps(data.workpackages) }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Work Packages...")
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "workpackages",
          projectName: project.name,
          projectDescription: project.description,
          startDate: project.start_date,
          endDate: project.end_date,
          format: "extended"
        })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newWps = json.data?.workpackages ?? []
      setWps(newWps); await save({ workpackages: newWps })
      toast.success(newWps.length + " Work Packages générés")
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const phases = useMemo(() => ["Tous", ...Array.from(new Set(wps.map(w => w.phase)))], [wps])
  const filtered = filterPhase === "Tous" ? wps : wps.filter(w => w.phase === filterPhase)
  const phaseColor = (p: string) => PHASE_COLORS[Math.max(0, phases.indexOf(p) - 1) % PHASE_COLORS.length] ?? "var(--primary)"

  const totalBudget = wps.reduce((s, w) => s + w.budget, 0)
  const avgCompletion = wps.length > 0 ? Math.round(wps.reduce((s, w) => s + w.completion, 0) / wps.length) : 0

  const toRows = () => wps.map(w => ({
    Code: w.code, Nom: w.name, Phase: w.phase, Resp: w.responsible,
    Début: w.start, Fin: w.end, Budget: w.budget, Statut: w.status, Avancement: w.completion + "%"
  }))

  const startEdit = (w: WP) => { setEditId(w.id); setEditRow({ ...w }) }
  const cancelEdit = () => { setEditId(null); setEditRow(null) }
  const confirmEdit = async () => {
    if (!editRow) return
    const updated = wps.map(w => w.id === editRow.id ? editRow : w)
    setWps(updated); setEditId(null); setEditRow(null)
    await save({ workpackages: updated })
  }

  const currentWP = filtered[ficheIdx] ?? filtered[0]

  const FicheView = () => {
    if (!currentWP) return null
    const pc = phaseColor(currentWP.phase)
    const cfg = STATUS_CFG[currentWP.status] ?? { color: "var(--text-3)", bg: "transparent" }
    const activities = currentWP.activities && currentWP.activities.length > 0
      ? currentWP.activities
      : (currentWP.description ? currentWP.description.split(/[.;]/).filter(s => s.trim().length > 4).map(s => s.trim()) : [])
    const contributors: Contributor[] = currentWP.contributors ?? []
    const deliverablesList = currentWP.deliverables
      ? currentWP.deliverables.split(/[,;]/).map(s => s.trim()).filter(Boolean)
      : []

    return (
      <div>
        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={() => setFicheIdx(Math.max(0, ficheIdx - 1))} disabled={ficheIdx === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text-2)", cursor: ficheIdx === 0 ? "not-allowed" : "pointer", opacity: ficheIdx === 0 ? 0.4 : 1, fontSize: 13 }}>
            <ChevronLeft size={14} /> Précédent
          </button>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {filtered.map((w, i) => (
              <button key={w.id} onClick={() => setFicheIdx(i)}
                style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid " + (i === ficheIdx ? phaseColor(w.phase) : "var(--border)"), background: i === ficheIdx ? phaseColor(w.phase) : "transparent", color: i === ficheIdx ? "#fff" : "var(--text-3)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {i + 1}
              </button>
            ))}
          </div>
          <button onClick={() => setFicheIdx(Math.min(filtered.length - 1, ficheIdx + 1))} disabled={ficheIdx >= filtered.length - 1}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text-2)", cursor: ficheIdx >= filtered.length - 1 ? "not-allowed" : "pointer", opacity: ficheIdx >= filtered.length - 1 ? 0.4 : 1, fontSize: 13 }}>
            Suivant <ChevronRight size={14} />
          </button>
        </div>

        {/* Fiche */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>

          {/* Header coloré */}
          <div style={{ background: pc, padding: "20px 28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "8px 16px", minWidth: 80, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>CODE</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{currentWP.code}</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{currentWP.name}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span>{currentWP.start} → {currentWP.end}</span>
                  <span style={{ background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "2px 8px" }}>{currentWP.duration} jours</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#fff", fontWeight: 600 }}>
                Phase : {currentWP.phase}
              </div>
              <div style={{ background: cfg.bg, borderRadius: 8, padding: "4px 12px", fontSize: 12, color: cfg.color, fontWeight: 600, border: "1px solid " + cfg.color + "44" }}>
                {currentWP.status}
              </div>
            </div>
          </div>

          {/* Barre progression */}
          <div style={{ background: "rgba(0,0,0,0.08)", height: 6 }}>
            <div style={{ width: currentWP.completion + "%", height: "100%", background: currentWP.completion === 100 ? "#22c55e" : pc, transition: "width 0.4s" }} />
          </div>
          <div style={{ padding: "4px 28px 0", display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>Avancement : {currentWP.completion}%</span>
          </div>

          {/* Corps 2 colonnes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

            {/* Gauche */}
            <div style={{ padding: "20px 28px", borderRight: "1px solid var(--border)" }}>
              {/* Objectif */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: pc, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 3, height: 14, background: pc, borderRadius: 2 }} /> Objectif
                </div>
                <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.6, margin: 0, padding: "10px 14px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  {currentWP.objective ?? currentWP.description}
                </p>
              </div>

              {/* Activités */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: pc, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 3, height: 14, background: pc, borderRadius: 2 }} /> Activités
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {activities.length > 0 ? activities.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 12px", background: "var(--bg)", borderRadius: 6, border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: pc, minWidth: 18, marginTop: 1 }}>{i + 1}.</span>
                      <span style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.5 }}>{a}</span>
                    </div>
                  )) : <p style={{ fontSize: 12, color: "var(--text-3)", fontStyle: "italic" }}>Aucune activité définie</p>}
                </div>
              </div>

              {/* Livrables */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: pc, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 3, height: 14, background: pc, borderRadius: 2 }} /> Livrables
                </div>
                <div style={{ padding: "10px 14px", background: pc + "15", borderRadius: 8, border: "1px solid " + pc + "33" }}>
                  {deliverablesList.length > 0 ? deliverablesList.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < deliverablesList.length - 1 ? 6 : 0 }}>
                      <span style={{ fontSize: 14 }}>📄</span>
                      <span style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{d}</span>
                    </div>
                  )) : <span style={{ fontSize: 12, color: "var(--text-2)" }}>{currentWP.deliverables || "—"}</span>}
                </div>
              </div>
            </div>

            {/* Droite */}
            <div style={{ padding: "20px 28px" }}>
              {/* Lead */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: pc, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 3, height: 14, background: pc, borderRadius: 2 }} /> Lead du Work Package
                </div>
                <div style={{ background: pc, borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>★ LEAD DU WORK PACKAGE</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{currentWP.lead_profile ?? currentWP.responsible}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Criticité : Critique</div>
                    <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#fff", fontWeight: 700 }}>
                      {currentWP.lead_etp ?? "1,0"} ETP
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributeurs */}
              {contributors.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: pc, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ display: "inline-block", width: 3, height: 14, background: pc, borderRadius: 2 }} /> Contributeurs
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "var(--bg)" }}>
                        {["Profil(s)", "Nom(s)", "ETP", "Criticité"].map(h => (
                          <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contributors.map((c, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "7px 10px", color: "var(--text-1)" }}>{c.profile}</td>
                          <td style={{ padding: "7px 10px", color: "var(--text-3)", fontStyle: c.name ? "normal" : "italic" }}>{c.name || "À compléter"}</td>
                          <td style={{ padding: "7px 10px", color: "var(--text-2)", fontWeight: 600 }}>{c.etp}</td>
                          <td style={{ padding: "7px 10px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: CRIT_COLORS[c.criticality] ?? "var(--text-2)" }}>{c.criticality}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Budget / Durée */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div style={{ background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Budget</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: pc }}>{currentWP.budget.toLocaleString("fr-FR")} €</div>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Durée</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: pc }}>{currentWP.duration} j</div>
                </div>
              </div>

              {currentWP.dependencies && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Dépendances</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", padding: "6px 10px", background: "var(--bg)", borderRadius: 6, border: "1px solid var(--border)" }}>{currentWP.dependencies}</div>
                </div>
              )}

              {currentWP.acceptance && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Critères d'acceptation</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", padding: "6px 10px", background: "var(--bg)", borderRadius: 6, border: "1px solid var(--border)" }}>{currentWP.acceptance}</div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid var(--border)", padding: "10px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)" }}>
            <span style={{ fontSize: 11, color: "var(--text-3)", fontStyle: "italic" }}>CONFIDENTIEL — Diffusion restreinte</span>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>{ficheIdx + 1} / {filtered.length}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <ToolLayout title="Work Packages" icon="📦" subtitle="// WORK PACKAGES"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if (e.data?.workpackages) setWps(e.data.workpackages) }}
        onGenerate={generate} generateLabel="Générer Work Packages" generating={loading}
        exportRows={toRows()} exportFilename={"WP_" + (project?.name ?? "")}
        projectName={project?.name}>

        {wps.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <p style={{ color: "var(--text-2)", fontSize: 15 }}>Aucun Work Package</p>
            <p style={{ color: "var(--text-3)", fontSize: 13 }}>Cliquez sur "Générer Work Packages"</p>
          </div>
        )}

        {wps.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "Work Packages", value: String(wps.length) },
                { label: "Budget total", value: (totalBudget / 1000).toFixed(0) + "k€" },
                { label: "Avancement moy.", value: avgCompletion + "%" },
                { label: "Terminés", value: String(wps.filter(w => w.status === "Terminé").length) },
              ].map(k => (
                <div key={k.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
                  <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: 0 }}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs + filtre */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 4, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: 4 }}>
                {([["fiche", "📋 Fiche"], ["cards", "🃏 Cards"], ["table", "📊 Tableau"]] as const).map(([tab, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", background: activeTab === tab ? "var(--primary-bg)" : "transparent", color: activeTab === tab ? "var(--primary-light)" : "var(--text-2)" }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {phases.map(p => (
                  <button key={p} onClick={() => { setFilterPhase(p); setFicheIdx(0) }}
                    style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: "pointer", border: "1px solid " + (filterPhase === p ? "var(--primary)" : "var(--border)"), background: filterPhase === p ? "var(--primary-bg)" : "transparent", color: filterPhase === p ? "var(--primary-light)" : "var(--text-3)" }}>
                    {p}{p !== "Tous" ? " (" + wps.filter(w => w.phase === p).length + ")" : ""}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "fiche" && <FicheView />}

            {activeTab === "cards" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                {filtered.map(wp => {
                  const cfg = STATUS_CFG[wp.status] ?? { color: "var(--text-3)", bg: "transparent" }
                  const pc = phaseColor(wp.phase)
                  return (
                    <div key={wp.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "3px solid " + pc, borderRadius: 12, padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)" }}>{wp.code}</span>
                            <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 10, background: pc + "22", color: pc, fontWeight: 600 }}>{wp.phase}</span>
                          </div>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>{wp.name}</h3>
                        </div>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: cfg.bg, color: cfg.color, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>{wp.status}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-2)", margin: "0 0 12px", lineHeight: 1.5 }}>{wp.description}</p>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "var(--text-3)" }}>Avancement</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-1)" }}>{wp.completion}%</span>
                        </div>
                        <div style={{ height: 5, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: wp.completion + "%", height: "100%", background: wp.completion === 100 ? "#22c55e" : pc, borderRadius: 3 }} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 12, color: "var(--text-2)" }}>
                        <div>👤 {wp.responsible}</div>
                        <div>💰 {wp.budget.toLocaleString()} €</div>
                        <div>📅 {wp.start} → {wp.end}</div>
                        <div>⏱️ {wp.duration} jours</div>
                      </div>
                      <button onClick={() => { setActiveTab("fiche"); setFicheIdx(filtered.indexOf(wp)) }}
                        style={{ marginTop: 12, width: "100%", padding: "6px", border: "1px solid " + pc + "44", borderRadius: 8, background: pc + "11", color: pc, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Voir la fiche →
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {activeTab === "table" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "var(--bg)" }}>
                      {["Code", "Nom", "Phase", "Responsable", "Début", "Fin", "Budget", "Statut", "Avancement", ""].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-3)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(wp => {
                      const cfg = STATUS_CFG[wp.status] ?? { color: "var(--text-3)", bg: "transparent" }
                      const pc = phaseColor(wp.phase)
                      return (
                        <tr key={wp.id} style={{ borderBottom: "1px solid var(--border)", borderLeft: "3px solid " + pc }}>
                          {editId === wp.id && editRow ? (
                            <>
                              <td style={{ padding: "6px 8px" }}><input value={editRow.code} onChange={e => setEditRow({ ...editRow, code: e.target.value })} style={{ width: 60, fontSize: 12 }} /></td>
                              <td style={{ padding: "6px 8px" }}><input value={editRow.name} onChange={e => setEditRow({ ...editRow, name: e.target.value })} style={{ width: 140, fontSize: 12 }} /></td>
                              <td style={{ padding: "6px 8px" }}><input value={editRow.phase} onChange={e => setEditRow({ ...editRow, phase: e.target.value })} style={{ width: 90, fontSize: 12 }} /></td>
                              <td style={{ padding: "6px 8px" }}><input value={editRow.responsible} onChange={e => setEditRow({ ...editRow, responsible: e.target.value })} style={{ width: 100, fontSize: 12 }} /></td>
                              <td style={{ padding: "6px 8px" }}><input type="date" value={editRow.start} onChange={e => setEditRow({ ...editRow, start: e.target.value })} style={{ fontSize: 12 }} /></td>
                              <td style={{ padding: "6px 8px" }}><input type="date" value={editRow.end} onChange={e => setEditRow({ ...editRow, end: e.target.value })} style={{ fontSize: 12 }} /></td>
                              <td style={{ padding: "6px 8px" }}><input type="number" value={editRow.budget} onChange={e => setEditRow({ ...editRow, budget: +e.target.value })} style={{ width: 80, fontSize: 12 }} /></td>
                              <td style={{ padding: "6px 8px" }}>
                                <select value={editRow.status} onChange={e => setEditRow({ ...editRow, status: e.target.value })} style={{ fontSize: 12 }}>
                                  {["Planifié", "En cours", "Terminé", "En retard"].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td style={{ padding: "6px 8px" }}><input type="number" min="0" max="100" value={editRow.completion} onChange={e => setEditRow({ ...editRow, completion: +e.target.value })} style={{ width: 60, fontSize: 12 }} /></td>
                              <td style={{ padding: "6px 8px" }}>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button onClick={confirmEdit} style={{ padding: "3px 8px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}><Check size={12} /></button>
                                  <button onClick={cancelEdit} style={{ padding: "3px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}><X size={12} /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={{ padding: "8px 12px", fontWeight: 700, color: pc }}>{wp.code}</td>
                              <td style={{ padding: "8px 12px", color: "var(--text-1)", fontWeight: 500 }}>{wp.name}</td>
                              <td style={{ padding: "8px 12px", color: pc }}>{wp.phase}</td>
                              <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>{wp.responsible}</td>
                              <td style={{ padding: "8px 12px", color: "var(--text-3)", whiteSpace: "nowrap" }}>{wp.start}</td>
                              <td style={{ padding: "8px 12px", color: "var(--text-3)", whiteSpace: "nowrap" }}>{wp.end}</td>
                              <td style={{ padding: "8px 12px", color: "var(--text-1)", fontWeight: 600 }}>{wp.budget.toLocaleString()} €</td>
                              <td style={{ padding: "8px 12px" }}>
                                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>{wp.status}</span>
                              </td>
                              <td style={{ padding: "8px 12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ flex: 1, height: 5, background: "var(--bg)", borderRadius: 3, overflow: "hidden", minWidth: 60 }}>
                                    <div style={{ width: wp.completion + "%", height: "100%", background: wp.completion === 100 ? "#22c55e" : pc, borderRadius: 3 }} />
                                  </div>
                                  <span style={{ fontSize: 11, fontWeight: 600, minWidth: 30 }}>{wp.completion}%</span>
                                </div>
                              </td>
                              <td style={{ padding: "8px 12px" }}>
                                <button onClick={() => startEdit(wp)} style={{ padding: "4px 8px", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", color: "var(--text-3)" }}>
                                  <Pencil size={11} />
                                </button>
                              </td>
                            </>
                          )}
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
