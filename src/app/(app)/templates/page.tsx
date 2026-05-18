"use client"
import BackButton from "@/components/ui/BackButton"
import AppLayout from "@/components/layout/AppLayout"
import ProGate from "@/components/ProGate"
import { useState } from "react"
import { Download, Eye, FileSpreadsheet, Search, CheckCircle2, Clock } from "lucide-react"

// ── Catalogue des templates ──────────────────────────────────
const PACKS = [
  {
    id: "suivi",
    icon: "📊",
    title: "Pack Suivi Opérationnel",
    desc: "Reporting hebdomadaire, suivi RAID et avancement projet",
    color: "#006644",
    bg: "#E3FCEF",
    border: "#ABF5D1",
    templates: [
      {
        id: "dashboard-hebdo",
        icon: "📊",
        title: "Dashboard Hebdomadaire",
        desc: "KPIs avancement, phases, jalons, actions prioritaires, points CODIR. Sélecteur de semaine.",
        tags: ["Reporting", "Hebdo", "KPIs"],
        status: "ready",
        file: "/templates/02_Dashboard_Hebdomadaire.xlsx",
        filename: "02_Dashboard_Hebdomadaire.xlsx",
        onglets: ["📊 Dashboard", "📖 Tuto"],
        highlight: "CPI · SPI · Actions · Points CODIR",
      },
      {
        id: "raid",
        icon: "⚠️",
        title: "Registre RAID Enrichi",
        desc: "Risques, Actions, Issues, Décisions avec synthèse automatique et compteurs par statut.",
        tags: ["Risques", "Actions", "PMBOK 7"],
        status: "ready",
        file: "/templates/03_Registre_RAID.xlsx",
        filename: "03_Registre_RAID.xlsx",
        onglets: ["📊 Synthèse", "⚠️ Risques", "✅ Actions", "🔥 Issues", "📋 Décisions", "📖 Tuto"],
        highlight: "Synthèse auto · 5 onglets · Compteurs statuts",
      },
      {
        id: "suivi-jalons",
        icon: "🏁",
        title: "Suivi Jalons Visuel",
        desc: "Timeline colorée avec statuts, dates prévisionnelles vs réelles et indicateur de retard.",
        tags: ["Planning", "Jalons"],
        status: "soon",
        file: null, filename: null, onglets: [], highlight: "",
      },
    ]
  },
  {
    id: "finances",
    icon: "💰",
    title: "Pack Finances & Ressources",
    desc: "Suivi budgétaire EVM complet, plan de charge et gestion fournisseurs",
    color: "#974F0C",
    bg: "#FFF7D6",
    border: "#FFD700",
    templates: [
      {
        id: "budget-evm",
        icon: "💰",
        title: "Budget EVM Complet",
        desc: "Saisie WP par WP, Dashboard KPIs (CPI/SPI/EAC/TCPI), Courbe S automatique, tuto complet.",
        tags: ["EVM", "Budget", "Courbe S"],
        status: "ready",
        file: "/templates/01_Budget_EVM_Complet.xlsx",
        filename: "01_Budget_EVM_Complet.xlsx",
        onglets: ["⚙️ Paramètres", "📋 Work Packages", "📥 EV & AC", "📊 Dashboard", "📈 Courbe S", "📖 Tuto"],
        highlight: "EAC · ETC · VAC · TCPI · Courbe S graphique",
      },
      {
        id: "plan-charge",
        icon: "👤",
        title: "Plan de Charge",
        desc: "Allocation ressources par semaine et par projet, avec indicateurs de surcharge.",
        tags: ["Ressources", "RH"],
        status: "soon",
        file: null, filename: null, onglets: [], highlight: "",
      },
      {
        id: "suivi-fournisseurs",
        icon: "🤝",
        title: "Suivi Fournisseurs",
        desc: "Contrats, livrables, paiements, SLA et indicateurs de performance fournisseurs.",
        tags: ["Achats", "Contrats"],
        status: "soon",
        file: null, filename: null, onglets: [], highlight: "",
      },
    ]
  },
  {
    id: "demarrage",
    icon: "🚀",
    title: "Pack Démarrage Projet",
    desc: "Documents essentiels pour lancer un projet selon PMBOK 7",
    color: "var(--primary)",
    bg: "#DEEBFF",
    border: "#B3D4FF",
    templates: [
      {
        id: "wbs",
        icon: "🗂️",
        title: "WBS Dictionnaire",
        desc: "Décomposition complète du travail avec code, livrable, responsable, durée, budget et critères d'acceptation.",
        tags: ["WBS", "Scope", "PMBOK 7"],
        status: "ready",
        file: "/templates/04_WBS_Dictionnaire.xlsx",
        filename: "04_WBS_Dictionnaire.xlsx",
        onglets: ["📋 WBS Dictionnaire", "📖 Tuto"],
        highlight: "Budget auto · Critères acceptation · 20 livrables",
      },
      {
        id: "raci",
        icon: "👥",
        title: "Matrice RACI",
        desc: "Matrice responsabilités complète pour 12 rôles × 20 activités avec légende colorée R/A/C/I.",
        tags: ["RACI", "Personnes", "PMBOK 7"],
        status: "ready",
        file: "/templates/05_Matrice_RACI.xlsx",
        filename: "05_Matrice_RACI.xlsx",
        onglets: ["👥 Matrice RACI", "📖 Tuto"],
        highlight: "12 rôles · 20 activités · Légende colorée",
      },
      {
        id: "charte",
        icon: "🎯",
        title: "Charte de Projet",
        desc: "Document d'autorisation officiel du projet avec objectifs, scope, budget et parties prenantes.",
        tags: ["Initiation", "PMBOK 7"],
        status: "soon",
        file: null, filename: null, onglets: [], highlight: "",
      },
    ]
  },
  {
    id: "cloture",
    icon: "✅",
    title: "Pack Clôture & Qualité",
    desc: "Capitalisation des connaissances et vérification de conformité",
    color: "#403294",
    bg: "#EAE6FF",
    border: "#C0B6F2",
    templates: [
      {
        id: "lessons",
        icon: "📚",
        title: "Leçons Apprises (REX)",
        desc: "Capitalisation structurée par catégorie avec analyse des causes racines.",
        tags: ["Clôture", "Qualité"],
        status: "soon",
        file: null, filename: null, onglets: [], highlight: "",
      },
      {
        id: "checklist",
        icon: "✅",
        title: "Checklist Clôture",
        desc: "30 points de vérification avant la clôture officielle du projet.",
        tags: ["Clôture", "PMBOK 7"],
        status: "soon",
        file: null, filename: null, onglets: [], highlight: "",
      },
    ]
  },
]

const STATUS_CFG = {
  ready: { label: "✅ Disponible", color: "#006644", bg: "#E3FCEF" },
  soon:  { label: "⏳ Bientôt",   color: "#974F0C", bg: "#FFF7D6" },
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [downloading, setDownloading] = useState<string | null>(null)

  const allTmpl = PACKS.flatMap(p => p.templates)
  const readyCount = allTmpl.filter(t => t.status === "ready").length

  const download = async (file: string, filename: string, id: string) => {
    setDownloading(id)
    try {
      const res = await fetch(file)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    } finally {
      setTimeout(() => setDownloading(null), 1500)
    }
  }

  return (
    <ProGate feature="templates" featureLabel="Pack Templates Pro">
    <AppLayout>
      <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// RESSOURCES PMO</p>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 6px", display:"flex", alignItems:"center", gap:10 }}>
              <FileSpreadsheet size={24} style={{ color:"var(--primary)" }}/> Pack Templates Pro
            </h1>
            <p style={{ fontSize:13, color:"var(--text-2)", margin:0 }}>
              Templates Excel professionnels prêts à l'emploi · Style PMO · Formules dynamiques · Tutos intégrés
            </p>
          </div>
          <div style={{ background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r12)", padding:"12px 18px", textAlign:"center", minWidth:120 }}>
            <p style={{ fontSize:11, color:"var(--text-2)", margin:"0 0 4px" }}>Disponibles</p>
            <p style={{ fontSize:28, fontWeight:700, color:"var(--primary-t)", margin:0 }}>
              {readyCount} <span style={{ fontSize:14, color:"var(--text-3)" }}>/ {allTmpl.length}</span>
            </p>
          </div>
        </div>

        {/* Barre recherche + filtres */}
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <div style={{ position:"relative", flex:1, maxWidth:380 }}>
            <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher un template..."
              style={{ width:"100%", paddingLeft:36, paddingRight:12, paddingTop:9, paddingBottom:9, border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, background:"var(--card)", color:"var(--text-1)", outline:"none" }}
              onFocus={e=>(e.target as any).style.borderColor="var(--primary)"}
              onBlur={e=>(e.target as any).style.borderColor="var(--border)"}/>
          </div>
          {[["all","Tous"],["ready","✅ Disponibles"],["soon","⏳ À venir"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              style={{ padding:"8px 14px", borderRadius:"var(--r8)", border:`1px solid ${filter===v?"var(--primary)":"var(--border)"}`, background:filter===v?"var(--primary-bg)":"var(--card)", color:filter===v?"var(--primary-t)":"var(--text-2)", fontSize:12, cursor:"pointer", fontWeight:filter===v?600:400 }}>
              {l}
            </button>
          ))}
        </div>

        {/* Packs */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {PACKS.map(pack => {
            const filtered = pack.templates.filter(t =>
              (filter==="all" || t.status===filter) &&
              (search==="" || t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
            )
            if (!filtered.length) return null

            return (
              <div key={pack.id} style={{ background:"var(--card)", border:`1px solid ${pack.border}`, borderRadius:"var(--r12)", overflow:"hidden" }}>
                {/* Pack header */}
                <div style={{ padding:"14px 20px", background:pack.bg, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:26 }}>{pack.icon}</span>
                  <div style={{ flex:1 }}>
                    <h2 style={{ fontSize:15, fontWeight:700, color:pack.color, margin:"0 0 2px" }}>{pack.title}</h2>
                    <p style={{ fontSize:12, color:pack.color, opacity:0.75, margin:0 }}>{pack.desc}</p>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.7)", borderRadius:20, padding:"3px 12px" }}>
                    <span style={{ fontSize:11, fontWeight:600, color:pack.color }}>
                      {pack.templates.filter(t=>t.status==="ready").length}/{pack.templates.length} disponibles
                    </span>
                  </div>
                </div>

                {/* Templates */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)" }}>
                  {filtered.map((t, i) => {
                    const cfg = STATUS_CFG[t.status as keyof typeof STATUS_CFG]
                    const isReady = t.status === "ready"
                    const isDownloading = downloading === t.id

                    return (
                      <div key={t.id}
                        style={{ padding:"18px 20px", borderRight:i%3!==2?"1px solid var(--border)":"none", borderBottom:"1px solid var(--border)", transition:"background 0.1s" }}
                        onMouseEnter={e=>(e.currentTarget as any).style.background="#FAFBFC"}
                        onMouseLeave={e=>(e.currentTarget as any).style.background="transparent"}>

                        {/* Title + status */}
                        <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
                          <span style={{ fontSize:24, lineHeight:1 }}>{t.icon}</span>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 4px" }}>{t.title}</p>
                            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:3, background:cfg.bg, color:cfg.color, fontWeight:600 }}>{cfg.label}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize:12, color:"var(--text-2)", margin:"0 0 10px", lineHeight:1.55 }}>{t.desc}</p>

                        {/* Onglets */}
                        {isReady && t.onglets.length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
                            {t.onglets.map(o=>(
                              <span key={o} style={{ fontSize:10, padding:"2px 7px", background:pack.bg, color:pack.color, borderRadius:3, fontWeight:500 }}>{o}</span>
                            ))}
                          </div>
                        )}

                        {/* Highlight */}
                        {isReady && t.highlight && (
                          <p style={{ fontSize:11, color:pack.color, fontWeight:500, margin:"0 0 12px", fontStyle:"italic" }}>
                            ✦ {t.highlight}
                          </p>
                        )}

                        {/* Tags */}
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
                          {t.tags.map(tag=>(
                            <span key={tag} style={{ fontSize:10, padding:"1px 7px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:3, color:"var(--text-3)" }}>{tag}</span>
                          ))}
                        </div>

                        {/* Boutons */}
                        {isReady && t.file ? (
                          <div style={{ display:"flex", gap:6 }}>
                            <a href={t.file} target="_blank" rel="noreferrer"
                              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"7px 0", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--r6)", fontSize:11, color:"var(--text-2)", cursor:"pointer", textDecoration:"none", fontWeight:500 }}>
                              <Eye size={12}/> Aperçu
                            </a>
                            <button onClick={()=>download(t.file!, t.filename!, t.id)}
                              style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"7px 0", background:isDownloading?"#C0DD97":pack.color, border:"none", borderRadius:"var(--r6)", fontSize:11, color:"#fff", cursor:"pointer", fontWeight:600, transition:"all 0.2s" }}>
                              {isDownloading ? <><CheckCircle2 size={13}/> Téléchargé !</> : <><Download size={13}/> Télécharger Excel</>}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--r6)", fontSize:11, color:"var(--text-3)" }}>
                            <Clock size={12}/> Disponible prochainement
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Guide utilisation */}
        <div style={{ marginTop:20, background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r12)", padding:"16px 20px" }}>
          <p style={{ fontSize:13, fontWeight:600, color:"var(--primary-t)", margin:"0 0 8px" }}>
            📖 Comment utiliser les templates
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[
              ["1️⃣ Télécharger","Cliquez sur 'Télécharger Excel' pour obtenir le fichier .xlsx"],
              ["2️⃣ Remplir","Complétez uniquement les cellules en BLEU — les formules se calculent seules"],
              ["3️⃣ Lire le tuto","Consultez l'onglet '📖 Tuto & Définitions' intégré pour les définitions et le guide"],
              ["4️⃣ Exporter","Ctrl+P → PDF pour distribuer ou imprimer votre rapport"],
            ].map(([title,desc])=>(
              <div key={title} style={{ background:"rgba(255,255,255,0.6)", borderRadius:"var(--r8)", padding:"10px 12px" }}>
                <p style={{ fontSize:12, fontWeight:600, color:"var(--primary-t)", margin:"0 0 4px" }}>{title}</p>
                <p style={{ fontSize:11, color:"var(--primary-light)", margin:0, lineHeight:1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
    </ProGate>
  )
}
