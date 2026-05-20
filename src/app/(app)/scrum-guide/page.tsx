"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"

const STEPS = [
  {
    id:"overview", label:"Vue d'ensemble", icon:"🗺️",
    color:"#7B5EFF", bg:"rgba(123,94,255,0.1)",
  },
  {
    id:"backlog", label:"Product Backlog", icon:"📋",
    color:"#3b82f6", bg:"rgba(59,130,246,0.1)",
  },
  {
    id:"planning", label:"Sprint Planning", icon:"📅",
    color:"#f59e0b", bg:"rgba(245,158,11,0.1)",
  },
  {
    id:"daily", label:"Daily Scrum", icon:"☀️",
    color:"#22c55e", bg:"rgba(34,197,94,0.1)",
  },
  {
    id:"review", label:"Sprint Review", icon:"🔍",
    color:"#f97316", bg:"rgba(249,115,22,0.1)",
  },
  {
    id:"retro", label:"Rétrospective", icon:"🔄",
    color:"#ef4444", bg:"rgba(239,68,68,0.1)",
  },
]

const CONTENT: Record<string, any> = {
  overview: {
    title:"Le Framework Scrum",
    subtitle:"Une approche itérative et incrémentale pour livrer de la valeur",
    desc:"Scrum est un cadre Agile qui organise le travail en cycles courts (Sprints) de 1 à 4 semaines. Chaque Sprint produit un incrément potentiellement livrable du produit.",
    roles:[
      { icon:"👤", name:"Product Owner", desc:"Définit les priorités du backlog et représente les intérêts du client. Responsable du ROI." },
      { icon:"🏃", name:"Scrum Master", desc:"Facilite le processus Scrum, supprime les obstacles et protège l'équipe." },
      { icon:"👥", name:"Development Team", desc:"Équipe auto-organisée de 3 à 9 personnes qui livre l'incrément Sprint." },
    ],
    artifacts:[
      { icon:"📚", name:"Product Backlog", desc:"Liste ordonnée de tout ce qui pourrait être nécessaire dans le produit." },
      { icon:"📋", name:"Sprint Backlog", desc:"Sous-ensemble du Product Backlog sélectionné pour le Sprint en cours." },
      { icon:"✅", name:"Incrément", desc:"Somme de tous les items complétés pendant le Sprint — potentiellement livrable." },
    ],
    outils:[
      { label:"WBS", href:"wbs", desc:"Structure du produit" },
      { label:"RACI", href:"raci", desc:"Rôles et responsabilités" },
      { label:"Sprint Review", href:"sprint", desc:"Gestion des sprints" },
    ],
    tip:"💡 Scrum ne prescrit pas les techniques d'ingénierie. Il fournit un cadre dans lequel vous pouvez employer diverses pratiques.",
  },
  backlog: {
    title:"Product Backlog",
    subtitle:"La source unique de vérité pour tout le travail à faire",
    desc:"Le Product Backlog est une liste ordonnée et émergente de tout ce qui est nécessaire pour améliorer le produit. C'est la seule source de travail pour l'équipe Scrum.",
    steps:[
      { num:"1", title:"Créer les User Stories", desc:'Format : "En tant que [utilisateur], je veux [fonctionnalité] afin de [bénéfice]"', icon:"📝" },
      { num:"2", title:"Estimer en Story Points", desc:"Utiliser la suite de Fibonacci : 1, 2, 3, 5, 8, 13, 21. Planning Poker recommandé.", icon:"🎯" },
      { num:"3", title:"Prioriser (MoSCoW)", desc:"Must Have → Should Have → Could Have → Won't Have. Le PO décide des priorités.", icon:"📊" },
      { num:"4", title:"Raffiner régulièrement", desc:"Le Backlog Refinement (Grooming) a lieu en milieu de Sprint. 10% max du temps d'équipe.", icon:"✏️" },
    ],
    outils:[
      { label:"WBS Dict.", href:"wbs", desc:"Décomposition produit" },
      { label:"Work Packages", href:"workpackages", desc:"Lots de travaux" },
      { label:"OKR Tracker", href:"okr", desc:"Objectifs & KRs" },
    ],
    tip:"💡 Un bon backlog est DEEP : Détaillé, Estimé, Émergent et Priorisé. Évitez les backlogs figés.",
    pmbok:"PMBOK 7 — Domaine : Planification · Principe : Valeur",
  },
  planning: {
    title:"Sprint Planning",
    subtitle:"Définir le quoi et le comment du Sprint",
    desc:"Le Sprint Planning lance le Sprint. L'équipe sélectionne les items du Product Backlog à réaliser et crée le Sprint Backlog. Durée max : 8h pour un Sprint d'un mois.",
    steps:[
      { num:"1", title:"Définir l'objectif du Sprint", desc:"Le Sprint Goal est la raison d'être du Sprint. Il guide l'équipe quand des questions surgissent.", icon:"🎯" },
      { num:"2", title:"Sélectionner les User Stories", desc:"L'équipe sélectionne les items du Product Backlog qu'elle peut livrer durant le Sprint.", icon:"☑️" },
      { num:"3", title:"Créer le Sprint Backlog", desc:"Décomposer les User Stories en tâches techniques. Chaque tâche < 1 jour de travail idéalement.", icon:"📋" },
      { num:"4", title:"Estimer la capacité", desc:"Calculer la vélocité disponible. Tenir compte des congés, formations, réunions.", icon:"📐" },
    ],
    outils:[
      { label:"Gantt", href:"gantt", desc:"Planning visuel" },
      { label:"Jalons", href:"jalons", desc:"Étapes clés Sprint" },
      { label:"PERT", href:"pert", desc:"Chemin critique" },
    ],
    tip:"💡 La vélocité des derniers 3 Sprints est le meilleur prédicteur de la capacité future. Ne surchargez pas !",
    pmbok:"PMBOK 7 — Domaine : Planification · Méthode : Agile/Hybride",
  },
  daily: {
    title:"Daily Scrum (Stand-up)",
    subtitle:"15 minutes pour synchroniser l'équipe chaque jour",
    desc:"Le Daily Scrum est une réunion quotidienne de 15 minutes pour l'équipe de développement. Elle inspecte la progression vers le Sprint Goal et adapte le Sprint Backlog si nécessaire.",
    questions:[
      { q:"Qu'est-ce que j'ai fait hier ?", color:"#22c55e", icon:"✅", desc:"Contribution à l'objectif du Sprint" },
      { q:"Qu'est-ce que je vais faire aujourd'hui ?", color:"#3b82f6", icon:"🎯", desc:"Plan pour les prochaines 24h" },
      { q:"Est-ce que j'ai des obstacles ?", color:"#ef4444", icon:"🚧", desc:"Impediments à lever par le Scrum Master" },
    ],
    rules:[
      "⏰ Exactement 15 minutes — ni plus, ni moins",
      "📍 Même heure, même lieu chaque jour",
      "🚶 Debout pour éviter les discussions longues",
      "👤 Pour l'équipe, pas pour le management",
      "🔇 Le Scrum Master facilite mais ne dirige pas",
    ],
    outils:[
      { label:"RAID", href:"raid", desc:"Obstacles & risques" },
      { label:"Sprint Review", href:"sprint", desc:"Board Kanban" },
      { label:"Jalons", href:"jalons", desc:"Avancement Sprint" },
    ],
    tip:"💡 Le Daily Scrum n'est PAS un rapport de statut. C'est une réunion de planification et de synchronisation.",
    pmbok:"PMBOK 7 — Domaine : Travail d'équipe · Principe : Transparence",
  },
  review: {
    title:"Sprint Review",
    subtitle:"Démontrer la valeur livrée aux parties prenantes",
    desc:"La Sprint Review a lieu en fin de Sprint. L'équipe présente l'incrément aux parties prenantes et recueille des feedbacks. Le Product Backlog est adapté si nécessaire. Durée max : 4h pour un Sprint d'un mois.",
    agenda:[
      { time:"0-10min", title:"Ouverture", desc:"Le PO présente le Sprint Goal et les items Done vs Not Done", icon:"🎬" },
      { time:"10-40min", title:"Démo", desc:"L'équipe démontre le travail accompli sur l'environnement de référence", icon:"💻" },
      { time:"40-60min", title:"Discussion", desc:"Questions, feedbacks, nouvelles idées des stakeholders", icon:"💬" },
      { time:"60-90min", title:"Adaptation Backlog", desc:"Le PO met à jour le Product Backlog en fonction des retours", icon:"📝" },
    ],
    metrics:[
      { label:"Vélocité", desc:"Story Points complétés vs planifiés" },
      { label:"Taux de complétion", desc:"% User Stories Done" },
      { label:"Dette technique", desc:"Bugs créés vs résolus" },
      { label:"Satisfaction", desc:"NPS équipe + stakeholders" },
    ],
    outils:[
      { label:"Sprint Review", href:"sprint", desc:"Kanban + rétrospective" },
      { label:"Budget EVM", href:"budget", desc:"Earned Value Sprint" },
      { label:"CODIR", href:"codir", desc:"Rapport direction" },
    ],
    tip:"💡 Mesurez la 'Definition of Done' strictement. Un item est Done quand il répond à TOUS les critères d'acceptation.",
    pmbok:"PMBOK 7 — Domaine : Parties prenantes · Principe : Valeur",
  },
  retro: {
    title:"Rétrospective Sprint",
    subtitle:"Inspecter et adapter le processus pour le prochain Sprint",
    desc:"La Rétrospective est la dernière cérémonie du Sprint. L'équipe inspecte son fonctionnement et planifie des améliorations. C'est le moteur de l'amélioration continue. Durée max : 3h pour un Sprint d'un mois.",
    formats:[
      { name:"Start / Stop / Continue", color:"#7B5EFF", desc:"Ce qu'on commence, arrête et continue de faire" },
      { name:"4Ls", color:"#3b82f6", desc:"Liked / Learned / Lacked / Longed For" },
      { name:"Sailboat", color:"#22c55e", desc:"Vents (positifs) vs Anchors (freins) vs Rocks (risques)" },
      { name:"DAKI", color:"#f59e0b", desc:"Drop / Add / Keep / Improve" },
    ],
    process:[
      { step:"1", title:"Préparer l'espace", desc:"Environnement sécurisant, bienveillant, sans jugement. Règle de Vegas.", icon:"🛡️" },
      { step:"2", title:"Collecter les données", desc:"Faits, métriques, événements du Sprint. Timeline collaborative.", icon:"📊" },
      { step:"3", title:"Générer des insights", desc:"Identifier les patterns, causes racines. Technique des 5 Pourquoi.", icon:"🔍" },
      { step:"4", title:"Décider des actions", desc:"Max 3 actions concrètes, assignées, mesurables pour le prochain Sprint.", icon:"✅" },
    ],
    outils:[
      { label:"Sprint Review", href:"sprint", desc:"Section rétrospective" },
      { label:"RAID", href:"raid", desc:"Actions à suivre" },
      { label:"Décisions", href:"decisions", desc:"Registre décisions" },
    ],
    tip:"💡 La règle d'or : focalisez sur les processus, pas sur les personnes. 'Nous avons un problème' pas 'Tu as fait...'",
    pmbok:"PMBOK 7 — Domaine : Amélioration continue · Principe : Apprendre en faisant",
  },
}

// Hotspots sur l'image Scrum
const HOTSPOTS = [
  { id:"backlog",  label:"Product Backlog",  x:12,  y:60, w:14, h:30 },
  { id:"planning", label:"Sprint Planning",  x:28,  y:50, w:14, h:25 },
  { id:"overview", label:"The Team",         x:42,  y:35, w:12, h:20 },
  { id:"daily",    label:"Daily Scrum",      x:72,  y:10, w:18, h:22 },
  { id:"review",   label:"Sprint Review",    x:72,  y:55, w:16, h:20 },
  { id:"retro",    label:"Rétrospective",    x:72,  y:78, w:16, h:18 },
]

export default function ScrumGuidePage() {
  const [activeStep, setActiveStep] = useState("overview")
  const [hoveredHotspot, setHoveredHotspot] = useState<string|null>(null)
  const step = STEPS.find(s=>s.id===activeStep)!
  const content = CONTENT[activeStep]

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Header */}
        <div>
          <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// GUIDE INTERACTIF</p>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Guide Scrum — Agile / SAFe</h1>
          <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>Cliquez sur les zones de l'image ou sur les onglets pour explorer chaque cérémonie</p>
        </div>

        {/* Image interactive */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text-2)" }}>🗺️ Framework Scrum — cliquez sur les zones</span>
            <span style={{ fontSize:10, color:"var(--text-3)", marginLeft:"auto" }}>Source : agileforall.com</span>
          </div>
          <div style={{ position:"relative", width:"100%", background:"#fff" }}>
            {/* SVG Scrum généré — 0 droits d'auteur */}
            {/* Fallback si pas d'image */}
            <div style={{ position:"absolute", inset:0, display:"flex" }}>
              {HOTSPOTS.map(h => (
                <button key={h.id} onClick={() => setActiveStep(h.id)}
                  onMouseEnter={() => setHoveredHotspot(h.id)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  style={{
                    position:"absolute", left:h.x+"%", top:h.y+"%", width:h.w+"%", height:h.h+"%",
                    background:activeStep===h.id?"rgba(123,94,255,0.25)":hoveredHotspot===h.id?"rgba(123,94,255,0.15)":"rgba(255,255,255,0.01)",
                    border:"2px solid "+(activeStep===h.id?"#7B5EFF":hoveredHotspot===h.id?"rgba(123,94,255,0.5)":"transparent"),
                    borderRadius:8, cursor:"pointer", transition:"all 0.2s",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                  {(activeStep===h.id||hoveredHotspot===h.id) && (
                    <span style={{ fontSize:10, fontWeight:700, color:"#7B5EFF", background:"rgba(255,255,255,0.95)", padding:"2px 8px", borderRadius:10, whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
                      {h.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Scrum diagram SVG de substitution si pas d'image */}
          <div style={{ padding:"16px 20px", background:"var(--bg)", borderTop:"1px solid var(--border)", display:"flex", gap:8, flexWrap:"wrap" }}>
            {HOTSPOTS.map(h => {
              const s = STEPS.find(st=>st.id===h.id)!
              return (
                <button key={h.id} onClick={() => setActiveStep(h.id)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer",
                    border:"1px solid "+(activeStep===h.id?s.color:"var(--border)"),
                    background:activeStep===h.id?s.bg:"transparent",
                    color:activeStep===h.id?s.color:"var(--text-3)" }}>
                  <span>{s.icon}</span> {h.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tabs navigation */}
        <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:2 }}>
          {STEPS.map((s,i) => (
            <button key={s.id} onClick={() => setActiveStep(s.id)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", border:"2px solid "+(activeStep===s.id?s.color:"var(--border)"), background:activeStep===s.id?s.bg:"var(--bg-card)", color:activeStep===s.id?s.color:"var(--text-2)", whiteSpace:"nowrap", flexShrink:0, transition:"all 0.15s" }}>
              <span style={{ fontSize:16 }}>{s.icon}</span>
              <span style={{ fontSize:10, opacity:0.6, marginRight:2 }}>{i+1}.</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Contenu onglet actif */}
        <div style={{ background:"var(--bg-card)", border:"2px solid "+step.color+"44", borderRadius:14, padding:"20px 24px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:step.bg, border:"2px solid "+step.color+"44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              {step.icon}
            </div>
            <div>
              <h2 style={{ fontSize:18, fontWeight:800, color:"var(--text-1)", margin:"0 0 2px" }}>{content.title}</h2>
              <p style={{ fontSize:13, color:step.color, fontWeight:600, margin:"0 0 6px" }}>{content.subtitle}</p>
              <p style={{ fontSize:12, color:"var(--text-2)", margin:0, lineHeight:1.6 }}>{content.desc}</p>
            </div>
          </div>

          {/* Contenu spécifique par onglet */}

          {/* Overview — Rôles + Artefacts */}
          {activeStep==="overview" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <h3 style={{ fontSize:12, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 10px" }}>👥 Les 3 Rôles Scrum</h3>
                {content.roles.map((r:any) => (
                  <div key={r.name} style={{ padding:"10px 12px", background:"var(--bg)", borderRadius:8, border:"1px solid var(--border)", marginBottom:8 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", marginBottom:3 }}>{r.icon} {r.name}</div>
                    <div style={{ fontSize:11, color:"var(--text-3)", lineHeight:1.5 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize:12, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 10px" }}>📦 Les 3 Artefacts</h3>
                {content.artifacts.map((a:any) => (
                  <div key={a.name} style={{ padding:"10px 12px", background:"var(--bg)", borderRadius:8, border:"1px solid var(--border)", marginBottom:8 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", marginBottom:3 }}>{a.icon} {a.name}</div>
                    <div style={{ fontSize:11, color:"var(--text-3)", lineHeight:1.5 }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backlog + Planning + Daily — Steps */}
          {(activeStep==="backlog"||activeStep==="planning") && content.steps && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
              {content.steps.map((s:any) => (
                <div key={s.num} style={{ padding:"12px 14px", background:"var(--bg)", borderRadius:9, border:"1px solid var(--border)", borderLeft:"4px solid "+step.color }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ width:22, height:22, borderRadius:"50%", background:step.bg, border:"1px solid "+step.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:step.color }}>{s.num}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"var(--text-1)" }}>{s.icon} {s.title}</span>
                  </div>
                  <p style={{ fontSize:11, color:"var(--text-3)", margin:0, lineHeight:1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Daily — Questions */}
          {activeStep==="daily" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:6 }}>
                {content.questions.map((q:any) => (
                  <div key={q.q} style={{ padding:"14px", background:q.color+"11", borderRadius:10, border:"1px solid "+q.color+"33", textAlign:"center" }}>
                    <div style={{ fontSize:24, marginBottom:6 }}>{q.icon}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:q.color, marginBottom:4 }}>{q.q}</div>
                    <div style={{ fontSize:10, color:"var(--text-3)" }}>{q.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"var(--bg)", borderRadius:9, padding:"12px 14px", border:"1px solid var(--border)" }}>
                <h4 style={{ fontSize:11, fontWeight:700, color:"var(--text-2)", textTransform:"uppercase", margin:"0 0 8px" }}>⚡ Règles du Daily Scrum</h4>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                  {content.rules.map((r:string) => (
                    <div key={r} style={{ fontSize:11, color:"var(--text-2)", padding:"3px 0" }}>{r}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Review — Agenda */}
          {activeStep==="review" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {content.agenda.map((a:any) => (
                <div key={a.time} style={{ padding:"12px 14px", background:"var(--bg)", borderRadius:9, border:"1px solid var(--border)", display:"flex", gap:10 }}>
                  <div style={{ fontSize:22, flexShrink:0 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize:10, color:step.color, fontWeight:700, marginBottom:2 }}>{a.time}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", marginBottom:3 }}>{a.title}</div>
                    <div style={{ fontSize:11, color:"var(--text-3)", lineHeight:1.4 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Retro — Formats */}
          {activeStep==="retro" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                {content.formats.map((f:any) => (
                  <div key={f.name} style={{ padding:"10px 14px", background:f.color+"11", borderRadius:8, border:"1px solid "+f.color+"33" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:f.color, marginBottom:3 }}>{f.name}</div>
                    <div style={{ fontSize:11, color:"var(--text-3)" }}>{f.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {content.process.map((p:any) => (
                  <div key={p.step} style={{ padding:"10px 12px", background:"var(--bg)", borderRadius:8, border:"1px solid var(--border)", textAlign:"center" }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>{p.icon}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--text-1)", marginBottom:3 }}>Étape {p.step} : {p.title}</div>
                    <div style={{ fontSize:10, color:"var(--text-3)", lineHeight:1.4 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip + PMBOK + Outils */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12, marginTop:16, alignItems:"start" }}>
            <div>
              <div style={{ padding:"10px 14px", background:step.bg, borderRadius:8, border:"1px solid "+step.color+"33", marginBottom:8 }}>
                <p style={{ fontSize:12, color:step.color, margin:0, lineHeight:1.5 }}>{content.tip}</p>
              </div>
              {content.pmbok && (
                <div style={{ padding:"6px 10px", background:"rgba(123,94,255,0.06)", borderRadius:6, border:"1px solid rgba(123,94,255,0.15)" }}>
                  <p style={{ fontSize:10, color:"var(--primary-light)", margin:0, fontWeight:600 }}>📚 {content.pmbok}</p>
                </div>
              )}
            </div>
            {/* Outils liés */}
            <div style={{ flexShrink:0 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", margin:"0 0 6px" }}>🛠️ Outils PMO liés</p>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {content.outils.map((o:any) => (
                  <Link key={o.href} href={`/projects`}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:step.bg, border:"1px solid "+step.color+"33", borderRadius:7, textDecoration:"none" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:step.color }}>{o.label}</span>
                    <span style={{ fontSize:10, color:"var(--text-3)" }}>→ {o.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation bas */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={() => { const idx=STEPS.findIndex(s=>s.id===activeStep); if(idx>0) setActiveStep(STEPS[idx-1].id) }}
            disabled={activeStep===STEPS[0].id}
            style={{ padding:"8px 18px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer", opacity:activeStep===STEPS[0].id?0.4:1 }}>
            ← Précédent
          </button>
          <span style={{ fontSize:11, color:"var(--text-3)" }}>
            Étape {STEPS.findIndex(s=>s.id===activeStep)+1} / {STEPS.length}
          </span>
          <button onClick={() => { const idx=STEPS.findIndex(s=>s.id===activeStep); if(idx<STEPS.length-1) setActiveStep(STEPS[idx+1].id) }}
            disabled={activeStep===STEPS[STEPS.length-1].id}
            style={{ padding:"8px 18px", border:"1px solid "+step.color, borderRadius:8, background:step.bg, color:step.color, fontSize:12, fontWeight:600, cursor:"pointer", opacity:activeStep===STEPS[STEPS.length-1].id?0.4:1 }}>
            Suivant →
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
