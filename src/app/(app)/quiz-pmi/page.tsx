"use client"
import BackButton from "@/components/ui/BackButton"
import { useState, useEffect, useCallback } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Clock, RotateCcw, ChevronRight, Target, Trophy, BookOpen, Zap } from "lucide-react"

interface Q {
  id:number; domain:string; pmbok:string; level:string
  question:string; options:string[]; correct:number; explanation:string
}

const DOMAINS = [
  { key:"Personnes",     color:"#7B5EFF", bg:"rgba(123,94,255,0.1)",  emoji:"👥" },
  { key:"Processus",     color:"#3b82f6", bg:"rgba(59,130,246,0.1)",  emoji:"⚙️" },
  { key:"Environnement", color:"#22c55e", bg:"rgba(34,197,94,0.1)",   emoji:"🌍" },
  { key:"Agile/Hybride", color:"#f59e0b", bg:"rgba(245,158,11,0.1)", emoji:"🔄" },
  { key:"Aléatoire",     color:"#ef4444", bg:"rgba(239,68,68,0.1)",  emoji:"🎲" },
]

const QUIZ_SIZE = 5
const TIME_PER_Q = 90 // secondes

export default function QuizPMIPage() {
  const [questions, setQuestions] = useState<Q[]>([])
  const [current, setCurrent]     = useState(0)
  const [selected, setSelected]   = useState<number|null>(null)
  const [answers, setAnswers]     = useState<(number|null)[]>([])
  const [view, setView]           = useState<"select"|"quiz"|"result">("select")
  const [domain, setDomain]       = useState<string|null>(null)
  const [timer, setTimer]         = useState(TIME_PER_Q)
  const [loading, setLoading]     = useState(false)
  const [history, setHistory]     = useState<{date:string;score:number;domain:string;total:number}[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Charger l'historique depuis localStorage
    try {
      const h = JSON.parse(localStorage.getItem("quiz-pmi-history")||"[]")
      setHistory(h.slice(0,10))
    } catch {}
  }, [])

  useEffect(() => {
    if (view !== "quiz" || selected !== null) return
    if (timer <= 0) { handleAnswer(-1); return }
    const t = setTimeout(() => setTimer(t2 => t2-1), 1000)
    return () => clearTimeout(t)
  }, [view, timer, selected])

  const loadQuiz = async (dom:string) => {
    setLoading(true); setDomain(dom)
    try {
      let query = supabase.from("pmp_questions").select("*").limit(QUIZ_SIZE*3)
      if (dom !== "Aléatoire") query = query.eq("domain", dom)
      const { data } = await query
      if (!data?.length) { throw new Error("Aucune question trouvée") }
      // Sélection aléatoire
      const shuffled = [...data].sort(() => Math.random()-0.5).slice(0, QUIZ_SIZE)
      setQuestions(shuffled)
      setAnswers(Array(QUIZ_SIZE).fill(null))
      setCurrent(0); setSelected(null); setTimer(TIME_PER_Q)
      setShowExplanation(false); setView("quiz")
    } catch(e:any) {
      // Mode démo si pas de questions en base
      const demoQs: Q[] = [
        { id:1, domain:"Processus", pmbok:"PMBOK7", level:"difficile", question:"Un chef de projet constate que le CPI = 0.85 et le SPI = 0.92. Quelle est la meilleure action à entreprendre ?", options:["Ignorer car les écarts sont mineurs","Analyser les causes racines et mettre à jour les prévisions (EAC)","Demander plus de budget immédiatement","Accélérer toutes les tâches"], correct:1, explanation:"Un CPI < 1 indique un dépassement budgétaire. La bonne pratique PMI est d'analyser les causes, calculer l'EAC et informer les parties prenantes." },
        { id:2, domain:"Personnes", pmbok:"PMBOK7", level:"difficile", question:"Selon le modèle de Tuckman, dans quelle phase une équipe commence-t-elle à travailler efficacement ensemble ?", options:["Forming (Formation)","Storming (Confrontation)","Norming (Normalisation)","Performing (Performance)"], correct:3, explanation:"La phase Performing est celle où l'équipe est cohésive, autonome et productive. C'est l'objectif du développement d'équipe selon Tuckman." },
        { id:3, domain:"Agile/Hybride", pmbok:"PMBOK7", level:"difficile", question:"Dans Scrum, qui est responsable de maximiser la valeur du produit et de gérer le Product Backlog ?", options:["Scrum Master","Development Team","Product Owner","Stakeholder"], correct:2, explanation:"Le Product Owner (PO) est le seul responsable du Product Backlog. Il priorise les items pour maximiser la valeur délivrée." },
        { id:4, domain:"Processus", pmbok:"PMBOK7", level:"difficile", question:"Quelle technique de compression du calendrier consiste à ajouter des ressources pour réduire la durée ?", options:["Fast tracking","Crashing","Resource leveling","Monte Carlo"], correct:1, explanation:"Le Crashing consiste à ajouter des ressources (coût supplémentaire) sur le chemin critique pour réduire la durée. Le Fast tracking parallélise des tâches séquentielles." },
        { id:5, domain:"Environnement", pmbok:"PMBOK7", level:"difficile", question:"Un projet génère une valeur business de 500k€ pour un coût de 200k€. Quel est le ROI ?", options:["150%","250%","300%","200%"], correct:0, explanation:"ROI = (Bénéfice - Coût) / Coût = (500k - 200k) / 200k = 300k/200k = 150%. Le ROI mesure le retour sur investissement." },
      ].sort(() => Math.random()-0.5).slice(0, QUIZ_SIZE)
      setQuestions(demoQs)
      setAnswers(Array(QUIZ_SIZE).fill(null))
      setCurrent(0); setSelected(null); setTimer(TIME_PER_Q)
      setShowExplanation(false); setView("quiz")
    } finally { setLoading(false) }
  }

  const handleAnswer = useCallback((idx:number) => {
    setSelected(idx)
    setShowExplanation(true)
    const newAnswers = [...answers]
    newAnswers[current] = idx
    setAnswers(newAnswers)
  }, [answers, current])

  const nextQuestion = () => {
    if (current < questions.length-1) {
      setCurrent(c=>c+1); setSelected(null); setTimer(TIME_PER_Q); setShowExplanation(false)
    } else {
      // Terminer
      const score = answers.filter((a,i)=>a===questions[i]?.correct).length
      const newEntry = { date:new Date().toLocaleDateString("fr-FR"), score, domain:domain!, total:questions.length }
      const newHistory = [newEntry, ...history].slice(0,10)
      setHistory(newHistory)
      try { localStorage.setItem("quiz-pmi-history", JSON.stringify(newHistory)) } catch {}
      setView("result")
    }
  }

  const restart = () => { setView("select"); setDomain(null); setQuestions([]); setAnswers([]) }

  const score = answers.filter((a,i)=>a===questions[i]?.correct).length
  const pct   = questions.length ? Math.round(score/questions.length*100) : 0
  const q     = questions[current]
  const timerPct = (timer/TIME_PER_Q)*100

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:16 }}>

        <BackButton href="/dashboard"/>
        {/* Header */}
        <div>
          <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// QUIZ PMI</p>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Quiz Rapide PMP®</h1>
          <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>{QUIZ_SIZE} questions · {TIME_PER_Q}s par question · Explication incluse</p>
        </div>

        {/* ── Sélection domaine ── */}
        {view === "select" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {DOMAINS.map(d => (
                <button key={d.key} onClick={() => !loading&&loadQuiz(d.key)}
                  disabled={loading}
                  style={{ padding:"20px 16px", background:d.bg, border:"2px solid "+d.color+"44", borderRadius:12, cursor:loading?"wait":"pointer", textAlign:"center", transition:"all 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget as any).style.borderColor=d.color}
                  onMouseLeave={e=>(e.currentTarget as any).style.borderColor=d.color+"44"}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{d.emoji}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:d.color }}>{d.key}</div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginTop:4 }}>{QUIZ_SIZE} questions</div>
                </button>
              ))}
              <Link href="/pmp-simulator" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px", background:"rgba(123,94,255,0.06)", border:"2px dashed rgba(123,94,255,0.3)", borderRadius:12, textDecoration:"none", textAlign:"center" }}>
                <BookOpen size={28} style={{ color:"var(--primary-light)", marginBottom:8 }}/>
                <div style={{ fontSize:14, fontWeight:800, color:"var(--primary-light)" }}>Simulateur 225Q</div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginTop:4 }}>Examen complet</div>
              </Link>
            </div>

            {/* Historique */}
            {history.length > 0 && (
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
                <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 10px" }}>📊 Historique récent</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {history.slice(0,5).map((h,i) => {
                    const p = Math.round(h.score/h.total*100)
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 10px", background:"var(--bg)", borderRadius:7, border:"1px solid var(--border)" }}>
                        <span style={{ fontSize:14 }}>{DOMAINS.find(d=>d.key===h.domain)?.emoji||"🎲"}</span>
                        <span style={{ fontSize:11, fontWeight:500, color:"var(--text-2)", flex:1 }}>{h.domain}</span>
                        <span style={{ fontSize:10, color:"var(--text-3)" }}>{h.date}</span>
                        <span style={{ fontSize:12, fontWeight:800, color:p>=80?"#22c55e":p>=60?"#f59e0b":"#ef4444" }}>{h.score}/{h.total}</span>
                        <div style={{ width:50, height:5, background:"var(--bg-card)", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ width:p+"%", height:"100%", background:p>=80?"#22c55e":p>=60?"#f59e0b":"#ef4444", borderRadius:3 }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Quiz ── */}
        {view === "quiz" && q && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {/* Progression + timer */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:600, color:"var(--text-2)" }}>Question {current+1}/{questions.length} · {domain}</span>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <Clock size={13} style={{ color:timer<=15?"#ef4444":"#f59e0b" }}/>
                  <span style={{ fontSize:13, fontWeight:800, color:timer<=15?"#ef4444":timer<=30?"#f59e0b":"#22c55e" }}>{timer}s</span>
                </div>
              </div>
              {/* Barre progression questions */}
              <div style={{ display:"flex", gap:4, marginBottom:6 }}>
                {questions.map((_,i) => (
                  <div key={i} style={{ flex:1, height:4, borderRadius:2, background:i<current?(answers[i]===questions[i]?.correct?"#22c55e":"#ef4444"):i===current?"var(--primary)":"var(--bg)" }}/>
                ))}
              </div>
              {/* Barre timer */}
              <div style={{ height:3, background:"var(--bg)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ width:timerPct+"%", height:"100%", background:timer<=15?"#ef4444":timer<=30?"#f59e0b":"#22c55e", borderRadius:2, transition:"width 1s linear" }}/>
              </div>
            </div>

            {/* Question */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"18px 20px" }}>
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                <span style={{ fontSize:9, padding:"2px 8px", borderRadius:6, background:"rgba(123,94,255,0.1)", color:"var(--primary-light)", fontWeight:600 }}>{q.domain}</span>
                <span style={{ fontSize:9, padding:"2px 8px", borderRadius:6, background:"rgba(59,130,246,0.1)", color:"#3b82f6", fontWeight:600 }}>{q.pmbok}</span>
                <span style={{ fontSize:9, padding:"2px 8px", borderRadius:6, background:"rgba(245,158,11,0.1)", color:"#f59e0b", fontWeight:600 }}>{q.level}</span>
              </div>
              <p style={{ fontSize:14, fontWeight:600, color:"var(--text-1)", lineHeight:1.6, margin:0 }}>{q.question}</p>
            </div>

            {/* Options */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {q.options.map((opt, i) => {
                let bg = "var(--bg-card)", border = "1px solid var(--border)", color = "var(--text-1)"
                if (selected !== null) {
                  if (i === q.correct) { bg="rgba(34,197,94,0.12)"; border="2px solid #22c55e"; color="#22c55e" }
                  else if (i === selected && i !== q.correct) { bg="rgba(239,68,68,0.1)"; border="2px solid #ef4444"; color="#ef4444" }
                }
                return (
                  <button key={i} onClick={() => selected===null&&handleAnswer(i)} disabled={selected!==null}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:bg, border, borderRadius:9, cursor:selected===null?"pointer":"default", textAlign:"left", transition:"all 0.2s" }}>
                    <span style={{ width:24, height:24, borderRadius:"50%", background:selected!==null&&i===q.correct?"#22c55e":selected===i&&i!==q.correct?"#ef4444":"var(--bg)", border:"2px solid "+color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color, flexShrink:0 }}>
                      {String.fromCharCode(65+i)}
                    </span>
                    <span style={{ fontSize:13, color, fontWeight:selected!==null&&i===q.correct?700:400, lineHeight:1.4 }}>{opt}</span>
                  </button>
                )
              })}
            </div>

            {/* Explication */}
            {showExplanation && (
              <div style={{ background:selected===q.correct?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)", border:"1px solid "+(selected===q.correct?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"), borderRadius:10, padding:"12px 14px" }}>
                <p style={{ fontSize:12, fontWeight:700, color:selected===q.correct?"#22c55e":"#ef4444", margin:"0 0 4px" }}>
                  {selected===q.correct?"✅ Bonne réponse !":"❌ Mauvaise réponse"}
                </p>
                <p style={{ fontSize:12, color:"var(--text-1)", margin:0, lineHeight:1.6 }}>{q.explanation}</p>
              </div>
            )}

            {/* Bouton suivant */}
            {selected !== null && (
              <button onClick={nextQuestion} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {current < questions.length-1 ? <><ChevronRight size={15}/> Question suivante</> : <><Trophy size={14}/> Voir les résultats</>}
              </button>
            )}
          </div>
        )}

        {/* ── Résultats ── */}
        {view === "result" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Score principal */}
            <div style={{ background:pct>=80?"rgba(34,197,94,0.08)":pct>=60?"rgba(245,158,11,0.08)":"rgba(239,68,68,0.08)", border:"2px solid "+(pct>=80?"#22c55e":pct>=60?"#f59e0b":"#ef4444"), borderRadius:14, padding:"24px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:8 }}>{pct>=80?"🏆":pct>=60?"👍":"📚"}</div>
              <div style={{ fontSize:40, fontWeight:900, color:pct>=80?"#22c55e":pct>=60?"#f59e0b":"#ef4444", lineHeight:1 }}>{score}/{questions.length}</div>
              <div style={{ fontSize:18, fontWeight:700, color:"var(--text-1)", marginTop:4 }}>{pct}%</div>
              <div style={{ fontSize:14, color:"var(--text-2)", marginTop:8 }}>
                {pct>=80?"Excellent ! Prêt pour l'examen PMP®":pct>=60?"Bien ! Continuez à réviser":"À revoir — Consultez le simulateur complet"}
              </div>
              <div style={{ fontSize:11, color:"var(--text-3)", marginTop:4 }}>Domaine : {domain}</div>
            </div>

            {/* Détail par question */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>📋 Détail des réponses</h3>
              {questions.map((q,i) => {
                const ok = answers[i] === q.correct
                return (
                  <div key={i} style={{ padding:"8px 10px", background:ok?"rgba(34,197,94,0.06)":"rgba(239,68,68,0.06)", borderRadius:8, marginBottom:6, borderLeft:"3px solid "+(ok?"#22c55e":"#ef4444") }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--text-1)", marginBottom:3 }}>{ok?"✅":"❌"} Q{i+1}. {q.question.slice(0,80)}…</div>
                    {!ok && (
                      <div style={{ fontSize:10, color:"var(--text-2)" }}>
                        Votre réponse : <span style={{ color:"#ef4444" }}>{q.options[answers[i]??0]}</span> · Bonne réponse : <span style={{ color:"#22c55e" }}>{q.options[q.correct]}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <button onClick={restart} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"11px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                <RotateCcw size={13}/> Nouveau quiz
              </button>
              <Link href="/pmp-simulator" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"11px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:9, fontSize:13, fontWeight:600, color:"var(--text-1)", textDecoration:"none" }}>
                <BookOpen size={13}/> Simulateur 225Q
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
