"use client"
import AppLayout from "@/components/layout/AppLayout"
import ProGate from "@/components/ProGate"
import { useState, useMemo } from "react"
import { Download, Eye, Search, CheckCircle2, Clock, Star, Filter } from "lucide-react"

const ALL_TEMPLATES = [
  // ── Pack Suivi Opérationnel ──────────────────────────────────
  {
    id: "dashboard-hebdo", pack: "Suivi Opérationnel", packColor: "#006644", packBg: "#E3FCEF",
    icon: "📊", iconBg: "#064e3b",
    title: "Dashboard Hebdomadaire",
    desc: "KPIs avancement, phases, jalons, actions prioritaires, points CODIR. Sélecteur de semaine automatique.",
    tags: ["Reporting", "Hebdo", "KPIs", "CODIR"],
    status: "ready", rating: 5, downloads: 142,
    file: "/templates/02_Dashboard_Hebdomadaire.xlsx",
    filename: "02_Dashboard_Hebdomadaire.xlsx",
    onglets: ["📊 Dashboard", "📖 Tuto"],
    highlight: "CPI · SPI · Actions · Points CODIR",
    type: "Excel",
  },
  {
    id: "raid", pack: "Suivi Opérationnel", packColor: "#006644", packBg: "#E3FCEF",
    icon: "⚠️", iconBg: "#7f1d1d",
    title: "Registre RAID Enrichi",
    desc: "Risques, Actions, Issues, Décisions avec synthèse automatique et compteurs par statut.",
    tags: ["Risques", "RAID", "PMBOK 7"],
    status: "ready", rating: 5, downloads: 98,
    file: "/templates/03_Registre_RAID.xlsx",
    filename: "03_Registre_RAID.xlsx",
    onglets: ["📊 Synthèse", "⚠️ Risques", "✅ Actions", "🔥 Issues", "📋 Décisions", "📖 Tuto"],
    highlight: "Synthèse auto · 5 onglets · Compteurs statuts",
    type: "Excel",
  },
  {
    id: "suivi-jalons", pack: "Suivi Opérationnel", packColor: "#006644", packBg: "#E3FCEF",
    icon: "🏁", iconBg: "#78350f",
    title: "Suivi Jalons Visuel",
    desc: "Timeline colorée avec statuts, dates prévisionnelles vs réelles et indicateur de retard automatique.",
    tags: ["Planning", "Jalons", "Timeline"],
    status: "ready", rating: 5, downloads: 67,
    file: "/templates/04_Suivi_Jalons.xlsx",
    filename: "04_Suivi_Jalons.xlsx",
    onglets: ["🏁 Jalons", "📊 Synthèse", "📖 Tuto"],
    highlight: "Timeline visuelle · Retard auto · Statuts colorés",
    type: "Excel",
  },

  // ── Pack Finances & Ressources ───────────────────────────────
  {
    id: "budget-evm", pack: "Finances & Ressources", packColor: "#974F0C", packBg: "#FFF7D6",
    icon: "💰", iconBg: "#166534",
    title: "Budget EVM Complet",
    desc: "Saisie WP par WP, Dashboard KPIs (CPI/SPI/EAC/TCPI), Courbe S automatique avec graphique interactif.",
    tags: ["EVM", "Budget", "Courbe S", "TCPI"],
    status: "ready", rating: 5, downloads: 215,
    file: "/templates/01_Budget_EVM_Complet.xlsx",
    filename: "01_Budget_EVM_Complet.xlsx",
    onglets: ["⚙️ Paramètres", "📋 Work Packages", "📥 EV & AC", "📊 Dashboard", "📈 Courbe S", "📖 Tuto"],
    highlight: "EAC · ETC · VAC · TCPI · Courbe S graphique",
    type: "Excel",
  },
  {
    id: "plan-charge", pack: "Finances & Ressources", packColor: "#974F0C", packBg: "#FFF7D6",
    icon: "👤", iconBg: "#1e3a5f",
    title: "Plan de Charge Ressources",
    desc: "Allocation hebdomadaire par ressource et projet. Indicateurs de surcharge, taux d'occupation et disponibilité.",
    tags: ["Ressources", "RH", "Capacité"],
    status: "ready", rating: 5, downloads: 54,
    file: "/templates/05_Plan_de_Charge.xlsx",
    filename: "05_Plan_de_Charge.xlsx",
    onglets: ["👤 Ressources", "📅 Semaines", "📊 Dashboard", "📖 Tuto"],
    highlight: "Surcharge auto · Taux occupation · Multi-projets",
    type: "Excel",
  },
  {
    id: "suivi-fournisseurs", pack: "Finances & Ressources", packColor: "#974F0C", packBg: "#FFF7D6",
    icon: "🤝", iconBg: "#312e81",
    title: "Suivi Fournisseurs & Contrats",
    desc: "Contrats, livrables, paiements, SLA et indicateurs de performance fournisseurs avec alertes automatiques.",
    tags: ["Achats", "Contrats", "SLA"],
    status: "soon", rating: 5, downloads: 0,
    file: null, filename: null, onglets: [], highlight: "",
    type: "Excel",
  },

  // ── Pack Démarrage Projet ────────────────────────────────────
  {
    id: "wbs-dict", pack: "Démarrage Projet", packColor: "#1d4ed8", packBg: "#EFF6FF",
    icon: "🗂️", iconBg: "#1e3a5f",
    title: "WBS + Dictionnaire",
    desc: "Structure de découpage complète sur 3 niveaux avec dictionnaire WBS intégré (responsable, durée, budget, livrables).",
    tags: ["WBS", "PMBOK 7", "Livrables"],
    status: "ready", rating: 5, downloads: 89,
    file: "/templates/06_WBS_Dictionnaire.xlsx",
    filename: "06_WBS_Dictionnaire.xlsx",
    onglets: ["🗂️ WBS", "📖 Dictionnaire", "📊 Synthèse", "📖 Tuto"],
    highlight: "3 niveaux · Dictionnaire auto · Synthèse budget",
    type: "Excel",
  },
  {
    id: "gantt-master", pack: "Démarrage Projet", packColor: "#1d4ed8", packBg: "#EFF6FF",
    icon: "📅", iconBg: "#065f46",
    title: "Gantt Master Multi-Phases",
    desc: "Planning Gantt avec chemin critique automatique, dépendances, jalons visuels et indicateurs de retard par phase.",
    tags: ["Gantt", "Planning", "Chemin critique"],
    status: "ready", rating: 5, downloads: 123,
    file: "/templates/07_Gantt_Master.xlsx",
    filename: "07_Gantt_Master.xlsx",
    onglets: ["📅 Gantt", "🔴 Chemin critique", "🏁 Jalons", "📖 Tuto"],
    highlight: "Chemin critique auto · Retard visuel · Multi-phases",
    type: "Excel",
  },
  {
    id: "raci-pro", pack: "Démarrage Projet", packColor: "#1d4ed8", packBg: "#EFF6FF",
    icon: "👥", iconBg: "#3b0764",
    title: "RACI Matrix Pro",
    desc: "Matrice RACI complète avec DACI, matrice de communication et tableau de bord des responsabilités par phase.",
    tags: ["RACI", "DACI", "Communication"],
    status: "soon", rating: 5, downloads: 0,
    file: null, filename: null, onglets: [], highlight: "",
    type: "Excel",
  },

  // ── Pack Reporting & Communication ──────────────────────────
  {
    id: "rapport-codir", pack: "Reporting & Communication", packColor: "#6b21a8", packBg: "#F5F3FF",
    icon: "📋", iconBg: "#1e1b4b",
    title: "Rapport Mensuel CODIR",
    desc: "Template Word professionnel pour comités de pilotage. Avancement, budget, risques, décisions en 1 page.",
    tags: ["Reporting", "CODIR", "Word"],
    status: "soon", rating: 5, downloads: 0,
    file: null, filename: null, onglets: [], highlight: "",
    type: "Word",
  },
  {
    id: "note-cadrage", pack: "Reporting & Communication", packColor: "#6b21a8", packBg: "#F5F3FF",
    icon: "📝", iconBg: "#1c1917",
    title: "Note de Cadrage Projet",
    desc: "Document Word structuré : contexte, objectifs, périmètre, parties prenantes, planning macro et budget.",
    tags: ["Cadrage", "Word", "PMBOK 7"],
    status: "soon", rating: 5, downloads: 0,
    file: null, filename: null, onglets: [], highlight: "",
    type: "Word",
  },
  {
    id: "retex", pack: "Reporting & Communication", packColor: "#6b21a8", packBg: "#F5F3FF",
    icon: "🔍", iconBg: "#064e3b",
    title: "RETEX — Clôture Projet",
    desc: "Template structuré pour réunion de clôture et RETEX. Leçons apprises, succès, axes d'amélioration.",
    tags: ["Clôture", "RETEX", "Amélioration"],
    status: "soon", rating: 5, downloads: 0,
    file: null, filename: null, onglets: [], highlight: "",
    type: "Word",
  },
]

const PACKS = [...new Set(ALL_TEMPLATES.map(t => t.pack))]
const TYPES = ["Tous", "Excel", "Word"]

export default function TemplatesPage() {
  const [search, setSearch]       = useState("")
  const [filterPack, setFilterPack] = useState("Tous")
  const [filterType, setFilterType] = useState("Tous")
  const [filterStatus, setFilterStatus] = useState("Tous")
  const [downloading, setDownloading] = useState<string|null>(null)

  const filtered = useMemo(() => ALL_TEMPLATES.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchPack   = filterPack === "Tous" || t.pack === filterPack
    const matchType   = filterType === "Tous" || t.type === filterType
    const matchStatus = filterStatus === "Tous" || (filterStatus === "Disponible" ? t.status === "ready" : t.status === "soon")
    return matchSearch && matchPack && matchType && matchStatus
  }), [search, filterPack, filterType, filterStatus])

  const readyCount = ALL_TEMPLATES.filter(t => t.status === "ready").length

  const download = async (file: string, filename: string, id: string) => {
    setDownloading(id)
    const a = document.createElement("a"); a.href = file; a.download = filename; a.click()
    setTimeout(() => setDownloading(null), 2000)
  }

  return (
    <AppLayout>
      <ProGate feature="templates" featureLabel="Templates Pro">
        <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%" }}>

          {/* Header */}
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 6px" }}>// TEMPLATES PRO</p>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
              <div>
                <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:"0 0 4px" }}>Pack Templates Excel & Word</h1>
                <p style={{ fontSize:13, color:"var(--text-2)", margin:0 }}>Templates professionnels · Formules dynamiques · Tutos intégrés · Mis à jour chaque mois</p>
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <div style={{ textAlign:"center", padding:"8px 16px", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:10 }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"#22c55e" }}>{readyCount}</div>
                  <div style={{ fontSize:10, color:"var(--text-3)" }}>Disponibles</div>
                </div>
                <div style={{ textAlign:"center", padding:"8px 16px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10 }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"var(--text-2)" }}>{ALL_TEMPLATES.length}</div>
                  <div style={{ fontSize:10, color:"var(--text-3)" }}>Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de recherche + filtres */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ position:"relative", flex:1, minWidth:200 }}>
              <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un template..."
                style={{ width:"100%", paddingLeft:32, paddingRight:12, paddingTop:7, paddingBottom:7, border:"1px solid var(--border)", borderRadius:8, background:"var(--bg)", color:"var(--text-1)", fontSize:12, boxSizing:"border-box", outline:"none" }}/>
            </div>

            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {["Tous", ...PACKS].map(p => (
                <button key={p} onClick={() => setFilterPack(p)}
                  style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterPack===p?"var(--primary)":"var(--border)"), background:filterPack===p?"var(--primary-bg)":"transparent", color:filterPack===p?"var(--primary-light)":"var(--text-3)", whiteSpace:"nowrap" }}>
                  {p === "Tous" ? "Tous les packs" : p}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", gap:4 }}>
              {[["Tous","Tous types"],["Excel","📊 Excel"],["Word","📝 Word"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterType(v)}
                  style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterType===v?"var(--primary)":"var(--border)"), background:filterType===v?"var(--primary-bg)":"transparent", color:filterType===v?"var(--primary-light)":"var(--text-3)" }}>
                  {l}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", gap:4 }}>
              {[["Tous","Tous"],["Disponible","✅ Dispo"],["soon","🔜 Bientôt"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterStatus(v)}
                  style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterStatus===v?"var(--primary)":"var(--border)"), background:filterStatus===v?"var(--primary-bg)":"transparent", color:filterStatus===v?"var(--primary-light)":"var(--text-3)" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Résultats */}
          <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:12 }}>
            {filtered.length} template{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
          </div>

          {/* Liste style Marketplace */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map(t => {
              const isReady = t.status === "ready"
              const isDownloading = downloading === t.id

              return (
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, transition:"border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as any).style.borderColor = "rgba(123,94,255,0.4)"}
                  onMouseLeave={e => (e.currentTarget as any).style.borderColor = "var(--border)"}>

                  {/* Icône app */}
                  <div style={{ width:52, height:52, borderRadius:12, background:t.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, border:"1px solid rgba(255,255,255,0.1)" }}>
                    {t.icon}
                  </div>

                  {/* Infos principales */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"var(--text-1)" }}>{t.title}</span>
                      <span style={{ fontSize:9, padding:"1px 7px", borderRadius:4, background:t.packBg, color:t.packColor, fontWeight:600, flexShrink:0 }}>{t.pack}</span>
                      <span style={{ fontSize:9, padding:"1px 7px", borderRadius:4, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text-3)", flexShrink:0 }}>{t.type}</span>
                    </div>
                    <p style={{ fontSize:11, color:"var(--text-2)", margin:"0 0 6px", lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:600 }}>{t.desc}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      {/* Rating */}
                      <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                        {[...Array(t.rating)].map((_,i) => <Star key={i} size={10} style={{ color:"#f59e0b", fill:"#f59e0b" }}/>)}
                      </div>
                      {/* Tags */}
                      {t.tags.slice(0,3).map(tag => (
                        <span key={tag} style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text-3)" }}>{tag}</span>
                      ))}
                      {/* Onglets */}
                      {isReady && t.onglets.length > 0 && (
                        <span style={{ fontSize:9, color:"var(--text-3)" }}>{t.onglets.length} onglets</span>
                      )}
                      {/* Highlight */}
                      {isReady && t.highlight && (
                        <span style={{ fontSize:9, color:t.packColor, fontWeight:500 }}>✦ {t.highlight}</span>
                      )}
                    </div>
                  </div>

                  {/* Downloads count */}
                  {isReady && t.downloads > 0 && (
                    <div style={{ textAlign:"center", flexShrink:0, minWidth:50 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:"var(--text-1)" }}>{t.downloads}</div>
                      <div style={{ fontSize:9, color:"var(--text-3)" }}>télécharg.</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    {isReady && t.file ? (
                      <>
                        <a href={t.file} target="_blank" rel="noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", border:"1px solid var(--border)", borderRadius:8, fontSize:11, color:"var(--text-2)", cursor:"pointer", textDecoration:"none", fontWeight:500, background:"transparent" }}>
                          <Eye size={12}/> Aperçu
                        </a>
                        <button onClick={() => download(t.file!, t.filename!, t.id)}
                          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", background:isDownloading?"#22c55e":"var(--primary)", border:"none", borderRadius:8, fontSize:11, color:"#fff", cursor:"pointer", fontWeight:600, transition:"all 0.2s", whiteSpace:"nowrap" }}>
                          {isDownloading ? <><CheckCircle2 size={12}/> Téléchargé !</> : <><Download size={12}/> Télécharger {t.type}</>}
                        </button>
                      </>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, fontSize:11, color:"var(--text-3)", whiteSpace:"nowrap" }}>
                        <Clock size={11}/> Bientôt disponible
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
              <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucun template trouvé</p>
              <p style={{ color:"var(--text-3)", fontSize:12 }}>Essayez d'autres mots-clés</p>
            </div>
          )}

          {/* Guide utilisation */}
          <div style={{ marginTop:20, background:"var(--primary-bg)", border:"1px solid rgba(123,94,255,0.2)", borderRadius:12, padding:"14px 18px" }}>
            <p style={{ fontSize:12, fontWeight:700, color:"var(--primary-light)", margin:"0 0 10px" }}>📖 Comment utiliser les templates</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {[
                ["1️⃣ Télécharger","Cliquez sur 'Télécharger Excel' ou 'Télécharger Word'"],
                ["2️⃣ Remplir","Complétez les cellules en BLEU — les formules se calculent seules"],
                ["3️⃣ Lire le tuto","Consultez l'onglet '📖 Tuto' intégré dans chaque fichier"],
                ["4️⃣ Exporter","Ctrl+P → PDF pour distribuer ou imprimer votre rapport"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background:"rgba(123,94,255,0.06)", borderRadius:8, padding:"10px 12px" }}>
                  <p style={{ fontSize:11, fontWeight:600, color:"var(--primary-light)", margin:"0 0 3px" }}>{title}</p>
                  <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </ProGate>
    </AppLayout>
  )
}
