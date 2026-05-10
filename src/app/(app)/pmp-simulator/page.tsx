"use client"
import { useState, useEffect, useCallback } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { CheckCircle2, XCircle, Clock, RotateCcw, ChevronRight, ChevronLeft, Trophy, Brain, Target, AlertCircle } from "lucide-react"

// ── Bank de questions PMP (PMBOK 7 + Agile) ──────────────────
const QUESTIONS = [
  {
    id: 1, domain: "Personnes", pmbok: "PMBOK 7",
    question: "Un membre de votre équipe est en conflit avec un autre. Quelle est la meilleure approche selon PMI ?",
    options: [
      "Ignorer le conflit et espérer qu'il se résolve seul",
      "Confronter le conflit directement en facilitant une discussion entre les parties",
      "Séparer immédiatement les deux membres de l'équipe",
      "Escalader immédiatement au sponsor du projet"
    ],
    correct: 1,
    explanation: "PMI recommande la confrontation/résolution de problèmes comme approche prioritaire. Elle adresse directement les causes du conflit pour trouver une solution durable."
  },
  {
    id: 2, domain: "Processus", pmbok: "PMBOK 7",
    question: "Vous êtes en phase d'exécution et un stakeholder demande un changement majeur de scope. Que faites-vous en premier ?",
    options: [
      "Refuser le changement car le scope est déjà défini",
      "Implémenter immédiatement le changement pour satisfaire le stakeholder",
      "Documenter le changement et le soumettre au processus de contrôle des changements",
      "Arrêter le projet jusqu'à décision du sponsor"
    ],
    correct: 2,
    explanation: "Tout changement doit passer par le processus de contrôle des changements intégré. La documentation et l'évaluation d'impact sont essentielles avant toute décision."
  },
  {
    id: 3, domain: "Environnement", pmbok: "PMBOK 7",
    question: "Votre CPI est de 0.85 et votre SPI est de 0.90. Quelle est la situation de votre projet ?",
    options: [
      "Le projet est dans les délais et dans le budget",
      "Le projet est en retard et dépasse le budget",
      "Le projet est en avance mais dépasse le budget",
      "Le projet est dans les délais mais dépasse le budget"
    ],
    correct: 1,
    explanation: "CPI < 1 signifie dépassement budgétaire (0.85 = 15% de dépassement). SPI < 1 signifie retard sur le planning (0.90 = 10% de retard). Le projet cumule les deux problèmes."
  },
  {
    id: 4, domain: "Personnes", pmbok: "Agile",
    question: "Dans un projet Agile, quelle est la responsabilité principale du Product Owner ?",
    options: [
      "Gérer l'équipe de développement au quotidien",
      "Prioriser et gérer le Product Backlog pour maximiser la valeur",
      "Faciliter les cérémonies Scrum",
      "Rédiger le code et tester les fonctionnalités"
    ],
    correct: 1,
    explanation: "Le Product Owner est responsable de maximiser la valeur du produit en gérant et priorisant le Product Backlog. Il représente les intérêts des stakeholders et clients."
  },
  {
    id: 5, domain: "Processus", pmbok: "PMBOK 7",
    question: "Quel est le but principal de la réunion de lancement (Kick-off meeting) ?",
    options: [
      "Signer le contrat avec le client",
      "Présenter l'équipe projet et aligner tous les stakeholders sur les objectifs",
      "Finaliser le planning détaillé du projet",
      "Identifier tous les risques du projet"
    ],
    correct: 1,
    explanation: "Le Kick-off meeting vise à aligner toutes les parties prenantes sur la vision, les objectifs, les rôles et les attentes du projet. C'est le point de départ officiel de l'exécution."
  },
  {
    id: 6, domain: "Environnement", pmbok: "PMBOK 7",
    question: "Qu'est-ce que le TCPI (To-Complete Performance Index) ?",
    options: [
      "L'efficacité du travail accompli par rapport au coût réel",
      "L'efficacité requise sur le travail restant pour respecter l'objectif budgétaire",
      "Le ratio entre la valeur planifiée et le coût réel",
      "L'indice d'avancement du projet par rapport au planning"
    ],
    correct: 1,
    explanation: "TCPI = (BAC - EV) / (BAC - AC). Il indique l'efficacité de coût nécessaire pour terminer le projet dans le budget. TCPI > 1 signifie que vous devez être plus efficace que prévu."
  },
  {
    id: 7, domain: "Personnes", pmbok: "PMBOK 7",
    question: "Un chef de projet découvre que son équipe cache des problèmes de performance. Quelle est la meilleure action ?",
    options: [
      "Rapporter immédiatement au management sans en parler à l'équipe",
      "Créer un environnement de confiance où l'équipe peut communiquer ouvertement",
      "Mettre en place un système de surveillance strict",
      "Remplacer les membres non performants"
    ],
    correct: 1,
    explanation: "Créer la confiance et la transparence est fondamental. Un bon chef de projet facilite la communication ouverte et crée un espace sécurisé pour que l'équipe puisse signaler les problèmes sans crainte."
  },
  {
    id: 8, domain: "Processus", pmbok: "Agile",
    question: "Quelle est la durée recommandée d'un Sprint en Scrum ?",
    options: [
      "1 semaine fixe",
      "1 à 4 semaines selon le contexte de l'équipe",
      "3 mois",
      "6 mois"
    ],
    correct: 1,
    explanation: "Scrum recommande des Sprints de 1 à 4 semaines. La durée doit rester constante pour établir un rythme. 2 semaines est la durée la plus courante en pratique."
  },
  {
    id: 9, domain: "Environnement", pmbok: "PMBOK 7",
    question: "Lors d'une analyse des risques, qu'est-ce que la réserve de management ?",
    options: [
      "Le budget alloué aux risques identifiés",
      "Le budget pour les risques non identifiés (inconnus-inconnus)",
      "Le salaire du chef de projet",
      "Les ressources humaines supplémentaires disponibles"
    ],
    correct: 1,
    explanation: "La réserve de management couvre les 'unknown-unknowns' — risques non identifiés. Elle est distincte de la réserve pour aléas (contingency reserve) qui couvre les risques identifiés."
  },
  {
    id: 10, domain: "Processus", pmbok: "PMBOK 7",
    question: "Dans PMBOK 7, quels sont les domaines de performance du projet ?",
    options: [
      "Initiation, Planification, Exécution, Surveillance, Clôture",
      "Stakeholders, Équipe, Approche, Planification, Travail, Livraison, Mesure, Incertitude",
      "Intégration, Scope, Délais, Coûts, Qualité, Ressources, Communication",
      "Personnes, Processus, Environnement"
    ],
    correct: 1,
    explanation: "PMBOK 7 introduit 8 domaines de performance : Stakeholders, Team, Development Approach & Life Cycle, Planning, Project Work, Delivery, Measurement, et Uncertainty. C'est un changement majeur vs PMBOK 6."
  },
  {
    id: 11, domain: "Personnes", pmbok: "PMBOK 7",
    question: "Selon la théorie de Maslow, quel besoin doit être satisfait en priorité ?",
    options: [
      "Estime de soi",
      "Appartenance sociale",
      "Besoins physiologiques (sécurité, nourriture)",
      "Accomplissement personnel"
    ],
    correct: 2,
    explanation: "La pyramide de Maslow place les besoins physiologiques et de sécurité à la base. Sans satisfaire ces besoins fondamentaux, les autres niveaux (social, estime, accomplissement) ne peuvent être atteints."
  },
  {
    id: 12, domain: "Processus", pmbok: "Agile",
    question: "Qu'est-ce qu'une Definition of Done (DoD) en Agile ?",
    options: [
      "La liste des fonctionnalités à développer",
      "L'ensemble des critères qu'un incrément doit satisfaire pour être considéré terminé",
      "Le contrat signé avec le client",
      "La feuille de route du produit"
    ],
    correct: 1,
    explanation: "La DoD est un engagement partagé de l'équipe définissant les critères de complétude (code, tests, documentation, déploiement...). Elle assure la qualité et la transparence sur l'avancement réel."
  },
  {
    id: 13, domain: "Environnement", pmbok: "PMBOK 7",
    question: "Vous avez un EAC de 500k€ et un BAC de 400k€. Que cela signifie-t-il ?",
    options: [
      "Le projet sera livré sous budget",
      "Le projet devrait coûter 100k€ de plus que prévu",
      "Le projet est en avance sur le planning",
      "L'estimation est incorrecte et doit être refaite"
    ],
    correct: 1,
    explanation: "EAC (Estimate at Completion) > BAC (Budget at Completion) indique un dépassement prévu. Ici EAC - BAC = 100k€ de dépassement. Il faut analyser les causes et mettre en place des actions correctives."
  },
  {
    id: 14, domain: "Personnes", pmbok: "PMBOK 7",
    question: "Un stakeholder s'oppose fortement au projet. Quelle est la meilleure stratégie ?",
    options: [
      "L'ignorer car le projet a l'approbation du sponsor",
      "L'engager activement pour comprendre ses préoccupations et trouver des solutions",
      "Le reporter au management pour qu'il le neutralise",
      "Changer le scope du projet pour l'éviter"
    ],
    correct: 1,
    explanation: "L'engagement proactif des stakeholders opposés est essentiel. Comprendre leurs préoccupations permet souvent de les transformer en alliés ou de trouver des compromis. L'ignorance amplifie les risques."
  },
  {
    id: 15, domain: "Processus", pmbok: "PMBOK 7",
    question: "Quelle est la différence entre une hypothèse (assumption) et une contrainte (constraint) ?",
    options: [
      "Il n'y a aucune différence, ce sont des synonymes",
      "Une hypothèse est un facteur considéré comme vrai sans preuve ; une contrainte est une limitation imposée",
      "Une hypothèse est toujours documentée ; une contrainte ne l'est jamais",
      "Les contraintes concernent uniquement le budget"
    ],
    correct: 1,
    explanation: "Les hypothèses sont des facteurs supposés vrais pour la planification (ex: les ressources seront disponibles). Les contraintes sont des limitations imposées (ex: budget fixe, date de livraison imposée). Les deux doivent être documentées et gérées."
  },
]

const DOMAINS = ["Tous", "Personnes", "Processus", "Environnement"]
const PMBOK_FILTERS = ["Tous", "PMBOK 7", "Agile"]

interface QuizState {
  currentIdx: number
  answers: Record<number, number>
  showResult: boolean
  timeLeft: number
  started: boolean
  finished: boolean
  filter: string
  pmbok: string
}

export default function PMPSimulatorPage() {
  const [state, setState] = useState<QuizState>({
    currentIdx: 0, answers: {}, showResult: false,
    timeLeft: 120, started: false, finished: false,
    filter: "Tous", pmbok: "Tous"
  })
  const [showExplanation, setShowExplanation] = useState(false)

  const filteredQ = QUESTIONS.filter(q =>
    (state.filter === "Tous" || q.domain === state.filter) &&
    (state.pmbok === "Tous" || q.pmbok === state.pmbok)
  )

  const current = filteredQ[state.currentIdx]

  // Timer
  useEffect(() => {
    if (!state.started || state.finished || state.showResult) return
    if (state.timeLeft <= 0) {
      setState(p => ({ ...p, showResult: true }))
      return
    }
    const t = setTimeout(() => setState(p => ({ ...p, timeLeft: p.timeLeft - 1 })), 1000)
    return () => clearTimeout(t)
  }, [state.started, state.finished, state.showResult, state.timeLeft])

  const start = () => setState(p => ({ ...p, started: true, timeLeft: filteredQ.length * 90 }))

  const answer = (optIdx: number) => {
    if (state.answers[current.id] !== undefined) return
    setState(p => ({ ...p, answers: { ...p.answers, [current.id]: optIdx }, showResult: true }))
    setShowExplanation(true)
  }

  const next = () => {
    const nextIdx = state.currentIdx + 1
    if (nextIdx >= filteredQ.length) {
      setState(p => ({ ...p, finished: true, showResult: false }))
    } else {
      setState(p => ({ ...p, currentIdx: nextIdx, showResult: false }))
      setShowExplanation(false)
    }
  }

  const prev = () => {
    setState(p => ({ ...p, currentIdx: Math.max(0, p.currentIdx - 1), showResult: false }))
    setShowExplanation(false)
  }

  const restart = () => {
    setState({ currentIdx:0, answers:{}, showResult:false, timeLeft:120, started:false, finished:false, filter:"Tous", pmbok:"Tous" })
    setShowExplanation(false)
  }

  const score = filteredQ.filter(q => state.answers[q.id] === q.correct).length
  const total = filteredQ.length
  const pct = total > 0 ? Math.round(score / total * 100) : 0
  const passed = pct >= 61 // seuil PMI

  const mm = Math.floor(state.timeLeft / 60)
  const ss = state.timeLeft % 60

  const S = {
    card: { background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:24 } as const,
    badge: (color: string, bg: string) => ({ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", background:bg, color, borderRadius:20, fontSize:11, fontWeight:600 } as const),
    btn: (primary?: boolean) => ({ padding:"9px 20px", borderRadius:"var(--r8)", border:"none", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s", background:primary?"var(--primary)":"#fff", color:primary?"#fff":"var(--text-1)", border2:primary?"none":"1px solid var(--border)" } as const),
  }

  return (
    <AppLayout>
      <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// PRÉPARATION PMP</p>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 6px", display:"flex", alignItems:"center", gap:10 }}>
            🎯 Simulateur Examen PMP
          </h1>
          <p style={{ fontSize:13, color:"var(--text-2)", margin:0 }}>
            {total} questions · PMBOK 7 + Agile · Seuil de réussite PMI : 61%
          </p>
        </div>

        {/* Résultat final */}
        {state.finished && (
          <div style={{ ...S.card, textAlign:"center", maxWidth:600, margin:"0 auto" }}>
            <div style={{ fontSize:64, marginBottom:16 }}>{passed ? "🏆" : "📚"}</div>
            <h2 style={{ fontSize:24, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px" }}>
              {passed ? "Félicitations !" : "Continuez vos révisions"}
            </h2>
            <p style={{ fontSize:15, color:"var(--text-2)", margin:"0 0 24px" }}>
              Score : <strong style={{ color:passed?"#27500A":"#A32D2D", fontSize:28 }}>{pct}%</strong> ({score}/{total} bonnes réponses)
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
              {[
                { label:"Bonnes réponses", value:score, color:"#27500A", bg:"#EAF3DE" },
                { label:"Mauvaises réponses", value:total-score, color:"#A32D2D", bg:"#FCEBEB" },
                { label:"Taux de réussite", value:`${pct}%`, color:passed?"#27500A":"#A32D2D", bg:passed?"#EAF3DE":"#FCEBEB" },
              ].map(k=>(
                <div key={k.label} style={{ background:k.bg, borderRadius:"var(--r8)", padding:"12px" }}>
                  <p style={{ fontSize:10, color:"var(--text-3)", margin:"0 0 4px", textTransform:"uppercase" }}>{k.label}</p>
                  <p style={{ fontSize:22, fontWeight:700, color:k.color, margin:0 }}>{k.value}</p>
                </div>
              ))}
            </div>
            <div style={{ background:passed?"#EAF3DE":"#FAEEDA", border:`1px solid ${passed?"#C0DD97":"#EF9F27"}`, borderRadius:"var(--r8)", padding:"12px 16px", marginBottom:20 }}>
              <p style={{ fontSize:13, color:passed?"#27500A":"#854F0B", margin:0 }}>
                {passed
                  ? "✅ Vous avez atteint le seuil de 61% requis par PMI. Vous êtes bien préparé !"
                  : `⚠️ Le seuil PMI est de 61%. Concentrez-vous sur les domaines où vous avez fait des erreurs.`}
              </p>
            </div>
            <button onClick={restart}
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 24px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              <RotateCcw size={16}/> Recommencer
            </button>
          </div>
        )}

        {/* Écran de démarrage */}
        {!state.started && !state.finished && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Config */}
            <div style={S.card}>
              <h2 style={{ fontSize:16, fontWeight:600, color:"var(--text-1)", margin:"0 0 16px" }}>⚙️ Configuration</h2>

              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:500, color:"var(--text-2)", display:"block", marginBottom:6 }}>Domaine</label>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {DOMAINS.map(d=>(
                    <button key={d} onClick={()=>setState(p=>({...p,filter:d,currentIdx:0,answers:{}}))}
                      style={{ padding:"5px 12px", borderRadius:"var(--r6)", border:`1px solid ${state.filter===d?"var(--primary)":"var(--border)"}`, background:state.filter===d?"var(--primary-bg)":"#fff", color:state.filter===d?"var(--primary-t)":"var(--text-2)", fontSize:12, cursor:"pointer", fontWeight:state.filter===d?600:400 }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, fontWeight:500, color:"var(--text-2)", display:"block", marginBottom:6 }}>Référentiel</label>
                <div style={{ display:"flex", gap:6 }}>
                  {PMBOK_FILTERS.map(p=>(
                    <button key={p} onClick={()=>setState(s=>({...s,pmbok:p,currentIdx:0,answers:{}}))}
                      style={{ padding:"5px 12px", borderRadius:"var(--r6)", border:`1px solid ${state.pmbok===p?"var(--primary)":"var(--border)"}`, background:state.pmbok===p?"var(--primary-bg)":"#fff", color:state.pmbok===p?"var(--primary-t)":"var(--text-2)", fontSize:12, cursor:"pointer", fontWeight:state.pmbok===p?600:400 }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background:"var(--bg)", borderRadius:"var(--r8)", padding:"12px 14px", marginBottom:20 }}>
                <p style={{ fontSize:12, color:"var(--text-2)", margin:0 }}>
                  📋 <strong>{filteredQ.length} questions</strong> sélectionnées ·
                  ⏱️ ~{Math.ceil(filteredQ.length * 1.5)} min ·
                  🎯 Seuil : 61%
                </p>
              </div>

              <button onClick={start} disabled={filteredQ.length===0}
                style={{ width:"100%", padding:"11px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                🚀 Démarrer le simulateur
              </button>
            </div>

            {/* Infos examen */}
            <div style={S.card}>
              <h2 style={{ fontSize:16, fontWeight:600, color:"var(--text-1)", margin:"0 0 16px" }}>📌 Infos examen PMP</h2>
              {[
                { icon:"📝", label:"Questions", value:"180 questions" },
                { icon:"⏱️", label:"Durée", value:"230 minutes" },
                { icon:"🎯", label:"Seuil réussite", value:"~61% (score Predictive)" },
                { icon:"🔄", label:"Format", value:"QCM, correspondance, glisser-déposer" },
                { icon:"📚", label:"Référentiels", value:"PMBOK 7 + Agile Practice Guide" },
                { icon:"💡", label:"Domaines", value:"Personnes (42%), Processus (50%), Environnement (8%)" },
                { icon:"🌍", label:"Langues", value:"Disponible en français" },
                { icon:"🔁", label:"Validité", value:"3 ans (60 PDUs pour renouveler)" },
              ].map(item=>(
                <div key={item.label} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontSize:12, color:"var(--text-2)" }}>{item.icon} {item.label}</span>
                  <span style={{ fontSize:12, fontWeight:500, color:"var(--text-1)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz actif */}
        {state.started && !state.finished && current && (
          <div style={{ maxWidth:800, margin:"0 auto" }}>
            {/* Progress + Timer */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ flex:1, marginRight:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-3)", marginBottom:4 }}>
                  <span>Question {state.currentIdx+1} / {filteredQ.length}</span>
                  <span>{Math.round((state.currentIdx/filteredQ.length)*100)}%</span>
                </div>
                <div style={{ height:6, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, background:"var(--primary)", width:`${(state.currentIdx/filteredQ.length)*100}%`, transition:"width 0.3s" }}/>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", background:state.timeLeft<30?"#FCEBEB":"var(--bg)", border:`1px solid ${state.timeLeft<30?"#E24B4A":"var(--border)"}`, borderRadius:"var(--r8)" }}>
                <Clock size={14} style={{ color:state.timeLeft<30?"#A32D2D":"var(--text-2)" }}/>
                <span style={{ fontSize:14, fontWeight:700, color:state.timeLeft<30?"#A32D2D":"var(--text-1)", fontFamily:"monospace" }}>
                  {String(mm).padStart(2,"0")}:{String(ss).padStart(2,"0")}
                </span>
              </div>
            </div>

            {/* Question */}
            <div style={S.card}>
              <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                <span style={S.badge("#185FA5","#E6F1FB")}>{current.domain}</span>
                <span style={S.badge("#3C3489","#EEEDFE")}>{current.pmbok}</span>
                <span style={{ fontSize:11, color:"var(--text-3)", marginLeft:"auto" }}>Q{current.id}</span>
              </div>

              <p style={{ fontSize:15, fontWeight:500, color:"var(--text-1)", lineHeight:1.6, margin:"0 0 20px" }}>
                {current.question}
              </p>

              {/* Options */}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {current.options.map((opt, i) => {
                  const answered = state.answers[current.id] !== undefined
                  const isSelected = state.answers[current.id] === i
                  const isCorrect = i === current.correct
                  let bg = "#fff", border = "var(--border)", color = "var(--text-1)"
                  if (answered) {
                    if (isCorrect) { bg = "#EAF3DE"; border = "#639922"; color = "#27500A" }
                    else if (isSelected && !isCorrect) { bg = "#FCEBEB"; border = "#E24B4A"; color = "#A32D2D" }
                  }
                  return (
                    <button key={i} onClick={() => answer(i)} disabled={answered}
                      style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", background:bg, border:`1.5px solid ${border}`, borderRadius:"var(--r8)", cursor:answered?"default":"pointer", textAlign:"left", transition:"all 0.15s" }}
                      onMouseEnter={e=>{ if(!answered)(e.currentTarget as any).style.borderColor="var(--primary)" }}
                      onMouseLeave={e=>{ if(!answered)(e.currentTarget as any).style.borderColor="var(--border)" }}>
                      <div style={{ width:24, height:24, borderRadius:"50%", border:`2px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color, flexShrink:0 }}>
                        {answered && isCorrect ? "✓" : answered && isSelected ? "✗" : String.fromCharCode(65+i)}
                      </div>
                      <span style={{ fontSize:13, color, lineHeight:1.5 }}>{opt}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explication */}
              {showExplanation && (
                <div style={{ marginTop:16, background:"#E6F1FB", border:"1px solid #B5D4F4", borderLeft:"4px solid var(--primary)", borderRadius:"var(--r8)", padding:"12px 14px" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"var(--primary-t)", margin:"0 0 4px" }}>💡 Explication</p>
                  <p style={{ fontSize:12, color:"#185FA5", margin:0, lineHeight:1.6 }}>{current.explanation}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14 }}>
              <button onClick={prev} disabled={state.currentIdx===0}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, color:"var(--text-2)", cursor:state.currentIdx===0?"not-allowed":"pointer", opacity:state.currentIdx===0?0.4:1 }}>
                <ChevronLeft size={15}/> Précédente
              </button>

              <div style={{ display:"flex", gap:4 }}>
                {filteredQ.slice(0,15).map((_,i) => {
                  const q = filteredQ[i]
                  const isDone = state.answers[q?.id] !== undefined
                  const isOk = isDone && state.answers[q?.id] === q?.correct
                  return (
                    <div key={i} style={{ width:8, height:8, borderRadius:"50%",
                      background: i===state.currentIdx ? "var(--primary)" : isDone ? (isOk?"#639922":"#E24B4A") : "var(--border)" }}/>
                  )
                })}
                {filteredQ.length > 15 && <span style={{ fontSize:10, color:"var(--text-3)" }}>+{filteredQ.length-15}</span>}
              </div>

              {state.answers[current?.id] !== undefined ? (
                <button onClick={next}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"var(--primary)", border:"none", borderRadius:"var(--r8)", fontSize:13, fontWeight:600, color:"#fff", cursor:"pointer" }}>
                  {state.currentIdx===filteredQ.length-1 ? "Voir le résultat 🏆" : "Suivante"} <ChevronRight size={15}/>
                </button>
              ) : (
                <div style={{ padding:"8px 16px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, color:"var(--text-3)" }}>
                  Sélectionnez une réponse
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
