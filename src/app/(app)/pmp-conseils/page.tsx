"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"

const SECTIONS = [
  {
    id: "overview", icon: "🎯", title: "Vue d'ensemble de l'examen",
    color: "var(--primary-light)", bg: "#E6F1FB",
    content: [
      { subtitle: "Format de l'examen 2024", items: [
        "180 questions en 230 minutes (environ 1'20 par question)",
        "Mix de formats : QCM, correspondance, glisser-déposer, réponse courte",
        "2 pauses de 10 minutes incluses",
        "Disponible en présentiel (Prometric) et en ligne surveillé",
        "Score adaptatif — la difficulté s'ajuste à vos réponses",
      ]},
      { subtitle: "Répartition des domaines", items: [
        "Personnes (People) : 42% — Leadership, gestion d'équipe, stakeholders",
        "Processus (Process) : 50% — Techniques et méthodes de gestion",
        "Environnement (Business Environment) : 8% — Stratégie et valeur business",
        "50% des questions portent sur des approches Agile/hybrides",
        "50% sur des approches prédictives (PMBOK traditionnel)",
      ]},
    ]
  },
  {
    id: "preparation", icon: "📚", title: "Stratégie de préparation",
    color: "#3C3489", bg: "#EEEDFE",
    content: [
      { subtitle: "Plan de révision recommandé (3-4 mois)", items: [
        "Mois 1 : Maîtriser le PMBOK Guide 7e édition — focus sur les 8 domaines de performance",
        "Mois 2 : Agile Practice Guide + Scrum Guide + SAFe — minimum 50% de l'examen",
        "Mois 3 : Questions pratiques — visez 200+ questions/jour avec analyse des erreurs",
        "Mois 4 : Simulations complètes 180 questions, révision des points faibles",
        "Utilisez le Exam Content Outline (ECO) officiel PMI comme guide prioritaire",
      ]},
      { subtitle: "Ressources recommandées", items: [
        "📖 PMBOK Guide 7e édition (inclus avec l'inscription PMI)",
        "📖 Agile Practice Guide (inclus avec l'inscription PMI)",
        "📚 'PMP Exam Prep' de Rita Mulcahy (8e édition)",
        "🎥 Andrew Ramdayal sur Udemy — meilleure préparation en ligne",
        "📝 PrepCast ou PM Master Prep pour les examens blancs",
        "🎯 PMI Learning platform (inclus avec la cotisation PMI)",
      ]},
    ]
  },
  {
    id: "tips", icon: "💡", title: "Conseils pour le jour J",
    color: "#854F0B", bg: "#FAEEDA",
    content: [
      { subtitle: "Avant l'examen", items: [
        "Dormez bien les 2 nuits précédentes — la fatigue impacte le raisonnement",
        "Mangez légèrement et restez hydraté(e)",
        "Arrivez 30 min avant au centre (présentiel) ou testez votre connexion (en ligne)",
        "Apportez 2 pièces d'identité valides avec photo",
        "Feuilles de brouillon fournies — utilisez-les pour les calculs EVM",
      ]},
      { subtitle: "Pendant l'examen", items: [
        "Lisez la DERNIÈRE PHRASE de la question en premier pour comprendre ce qu'on demande",
        "Éliminez les 2 réponses évidemment incorrectes pour augmenter vos chances",
        "En cas de doute, choisissez la réponse la plus 'PMI' (proactive, éthique, centrée valeur)",
        "Marquez les questions difficiles et revenez-y — ne bloquez pas trop longtemps",
        "Respectez votre rythme : 180 questions en 230 min = 1'20 max par question",
        "Utilisez vos 2 pauses pour vous ressourcer, même brièvement",
      ]},
    ]
  },
  {
    id: "evm", icon: "💰", title: "EVM — Formules à maîtriser",
    color: "#27500A", bg: "#EAF3DE",
    content: [
      { subtitle: "Indicateurs de base", items: [
        "PV (Planned Value) = Budget prévu pour le travail planifié à ce jour",
        "EV (Earned Value) = Valeur du travail réellement accompli",
        "AC (Actual Cost) = Coût réel engagé pour accomplir le travail",
        "BAC (Budget at Completion) = Budget total du projet",
      ]},
      { subtitle: "Formules clés", items: [
        "CV (Cost Variance) = EV - AC → positif = sous budget",
        "SV (Schedule Variance) = EV - PV → positif = en avance",
        "CPI (Cost Performance Index) = EV / AC → >1 = efficace",
        "SPI (Schedule Performance Index) = EV / PV → >1 = en avance",
        "EAC = BAC / CPI → prévision du coût final",
        "ETC = EAC - AC → coût restant à engager",
        "TCPI = (BAC - EV) / (BAC - AC) → efficacité requise",
        "VAC = BAC - EAC → écart budget final (négatif = dépassement)",
      ]},
    ]
  },
  {
    id: "agile", icon: "🔄", title: "Agile & Hybrid — Points clés",
    color: "#0891b2", bg: "#E0F7FA",
    content: [
      { subtitle: "Scrum essentiels", items: [
        "Sprint : 1-4 semaines (durée fixe et constante)",
        "Cérémonies : Sprint Planning, Daily Scrum (15min), Sprint Review, Retrospective",
        "Artefacts : Product Backlog, Sprint Backlog, Incrément (DoD)",
        "Rôles : Product Owner (valeur), Scrum Master (processus), Developers (réalisation)",
        "Vélocité = Story Points livrés par Sprint (sert à planifier)",
      ]},
      { subtitle: "Concepts Agile à retenir", items: [
        "Definition of Done (DoD) vs Definition of Ready (DoR) — bien les distinguer",
        "User Story format : 'En tant que [qui], je veux [quoi] afin de [pourquoi]'",
        "Critères d'acceptation = conditions pour qu'une User Story soit acceptée",
        "Burndown Chart : progression du Sprint (descendant)",
        "Burnup Chart : valeur livrée (montant)",
        "Kanban : flux continu, WIP limits, pas de Sprints fixes",
        "SAFe : Agile à l'échelle, PI Planning, ART",
      ]},
    ]
  },
  {
    id: "ethics", icon: "⚖️", title: "Éthique & Code de déontologie PMI",
    color: "#A32D2D", bg: "#FCEBEB",
    content: [
      { subtitle: "4 valeurs fondamentales PMI", items: [
        "Responsabilité (Responsibility) : assumer ses décisions et leurs conséquences",
        "Respect : traiter les autres avec dignité, quel que soit leur statut",
        "Équité (Fairness) : prendre des décisions impartiales et objectives",
        "Honnêteté : communiquer de façon véridique et transparente",
      ]},
      { subtitle: "Situations types à l'examen", items: [
        "Conflit d'intérêt → toujours divulguer et se récuser si nécessaire",
        "Pot-de-vin/cadeau → refuser et signaler selon les politiques",
        "Découverte d'une fraude → signaler aux autorités compétentes",
        "Méconnaissance d'une loi locale → se renseigner avant d'agir",
        "Pression pour falsifier des rapports → refuser et documenter",
        "Priorité : la bonne réponse PMI est toujours la plus éthique ET proactive",
      ]},
    ]
  },
  {
    id: "eligibility", icon: "📋", title: "Éligibilité & Inscription",
    color: "#475569", bg: "#f1f5f9",
    content: [
      { subtitle: "Conditions d'éligibilité", items: [
        "Diplôme universitaire (Bac+4) : 36 mois d'expérience en gestion de projet + 35h de formation",
        "Bac+2 ou moins : 60 mois d'expérience en gestion de projet + 35h de formation",
        "L'expérience doit être non chevauchante et dans les 8 dernières années",
        "Les 35h de formation peuvent être obtenues via des cours certifiés (PMI REP)",
      ]},
      { subtitle: "Processus d'inscription", items: [
        "1. Créer un compte sur PMI.org",
        "2. Rejoindre PMI (cotisation ~179$/an — donne accès aux ressources gratuites)",
        "3. Soumettre la demande d'examen (frais : 555$ membres / 705$ non-membres)",
        "4. Audit possible (PMI vérifie vos informations) — gardez vos preuves",
        "5. Une fois approuvé : 1 an pour passer + 3 tentatives incluses",
        "6. Renouvellement : 60 PDUs tous les 3 ans pour maintenir la certification",
      ]},
    ]
  },
]

export default function PMPConseils() {
  const [activeSection, setActiveSection] = useState("overview")
  const active = SECTIONS.find(s => s.id === activeSection) ?? SECTIONS[0]

  return (
    <AppLayout>
      <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// PRÉPARATION PMP</p>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 6px", display:"flex", alignItems:"center", gap:10 }}>
              📖 Guide de l'examen PMP
            </h1>
            <p style={{ fontSize:13, color:"var(--text-2)", margin:0 }}>
              Tout ce qu'il faut savoir pour réussir votre certification PMP® du premier coup
            </p>
          </div>
          <Link href="/pmp-simulator"
            style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:"var(--primary)", color:"#fff", borderRadius:"var(--r8)", fontSize:13, fontWeight:600, textDecoration:"none" }}>
            🎯 Simulateur examen
          </Link>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:16 }}>

          {/* Menu gauche */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:8, alignSelf:"start", position:"sticky", top:16 }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:"var(--r8)", border:"none", textAlign:"left", cursor:"pointer", marginBottom:2, transition:"all 0.12s",
                  background:activeSection===s.id?s.bg:"transparent",
                  color:activeSection===s.id?s.color:"var(--text-2)",
                  fontWeight:activeSection===s.id?600:400, fontSize:13 }}
                onMouseEnter={e=>{ if(activeSection!==s.id)(e.currentTarget as any).style.background="var(--bg)" }}
                onMouseLeave={e=>{ if(activeSection!==s.id)(e.currentTarget as any).style.background="transparent" }}>
                <span style={{ fontSize:18 }}>{s.icon}</span>
                <span style={{ lineHeight:1.3 }}>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", overflow:"hidden" }}>
            {/* Section header */}
            <div style={{ padding:"20px 24px", background:active.bg, borderBottom:"1px solid var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:"var(--r8)", background:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                  {active.icon}
                </div>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:700, color:active.color, margin:"0 0 2px" }}>{active.title}</h2>
                  <p style={{ fontSize:12, color:active.color, opacity:0.7, margin:0 }}>
                    {active.content.reduce((s,c) => s + c.items.length, 0)} points clés
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>
              {active.content.map((section, i) => (
                <div key={i}>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"var(--text-1)", margin:"0 0 12px", display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:4, height:18, background:active.color, borderRadius:2 }}/>
                    {section.subtitle}
                  </h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {section.items.map((item, j) => (
                      <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", background:"var(--bg)", borderRadius:"var(--r8)", border:"1px solid var(--border)" }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:active.color, flexShrink:0, marginTop:5 }}/>
                        <p style={{ fontSize:13, color:"var(--text-1)", margin:0, lineHeight:1.6 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ padding:"16px 24px", borderTop:"1px solid var(--border)", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <p style={{ fontSize:12, color:"var(--text-3)", margin:0 }}>
                Section {SECTIONS.findIndex(s=>s.id===activeSection)+1} / {SECTIONS.length}
              </p>
              <div style={{ display:"flex", gap:8 }}>
                {SECTIONS.findIndex(s=>s.id===activeSection) > 0 && (
                  <button onClick={() => setActiveSection(SECTIONS[SECTIONS.findIndex(s=>s.id===activeSection)-1].id)}
                    style={{ padding:"7px 14px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>
                    ← Précédent
                  </button>
                )}
                {SECTIONS.findIndex(s=>s.id===activeSection) < SECTIONS.length-1 && (
                  <button onClick={() => setActiveSection(SECTIONS[SECTIONS.findIndex(s=>s.id===activeSection)+1].id)}
                    style={{ padding:"7px 14px", background:"var(--primary)", border:"none", borderRadius:"var(--r8)", fontSize:12, fontWeight:600, color:"#fff", cursor:"pointer" }}>
                    Suivant →
                  </button>
                )}
                <Link href="/pmp-simulator"
                  style={{ padding:"7px 14px", background:active.bg, border:`1px solid ${active.color}44`, borderRadius:"var(--r8)", fontSize:12, fontWeight:600, color:active.color, textDecoration:"none" }}>
                  🎯 S'entraîner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
