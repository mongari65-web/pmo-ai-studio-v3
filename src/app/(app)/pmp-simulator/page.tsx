"use client"
import { useState, useEffect, useCallback } from "react"
import ProGate from "@/components/ProGate"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Clock, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react"

interface Q {
  id: number; lot: number; level: string
  domain: string; pmbok: string
  question: string; options: string[]
  correct: number; explanation: string
}

const LEVELS = [
  { key:"facile",        label:"Facile",        icon:"⭐",   color:"#27500A", bg:"#EAF3DE", border:"#C0DD97", lots:[1,2,3,4,5] },
  { key:"difficile",     label:"Difficile",     icon:"⭐⭐",  color:"#854F0B", bg:"#FAEEDA", border:"#EF9F27", lots:[6,7,8,9,10] },
  { key:"tres-difficile",label:"Très Difficile",icon:"⭐⭐⭐", color:"#A32D2D", bg:"#FCEBEB", border:"#E24B4A", lots:[11,12,13,14,15] },
]

const LOT_INFO: Record<number,{domains:string[]}> = {
  1:{domains:["Processus","Personnes","Environnement"]},2:{domains:["Processus","Personnes","Environnement"]},
  3:{domains:["Processus","Personnes","Environnement"]},4:{domains:["Processus","Personnes","Environnement"]},
  5:{domains:["Processus","Personnes","Environnement"]},6:{domains:["Processus","Personnes","Environnement"]},
  7:{domains:["Processus","Personnes","Environnement"]},8:{domains:["Processus","Personnes","Environnement"]},
  9:{domains:["Processus","Personnes","Environnement"]},10:{domains:["Processus","Personnes","Environnement"]},
  11:{domains:["Processus","Personnes","Environnement"]},12:{domains:["Processus","Personnes","Environnement"]},
  13:{domains:["Processus","Personnes","Environnement"]},14:{domains:["Processus","Personnes","Environnement"]},
  15:{domains:["Processus","Personnes","Environnement"]},
}

// Cache session par lot
const CACHE: Record<number, Q[]> = {}

export default function PMPSimulatorPage() {
  const supabase = createClient()
  const [view, setView] = useState<"select"|"quiz"|"result">("select")
  const [selectedLevel, setSelectedLevel] = useState<string|null>(null)
  const [selectedLot, setSelectedLot] = useState<number|null>(null)
  const [questions, setQuestions] = useState<Q[]>([])
  const [loadingQ, setLoadingQ] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number,number>>({})
  const [showExpl, setShowExpl] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [seeded, setSeeded] = useState(false)

  // Seed Supabase au montage
  useEffect(() => {
    const doSeed = async () => {
      try {
        const { count } = await supabase
          .from("pmp_questions")
          .select("*", { count:"exact", head:true })
        if ((count ?? 0) > 0) { setSeeded(true); return }
        // Table vide → appeler l'API seed
        await fetch("/api/pmp-seed")
        setSeeded(true)
      } catch { setSeeded(true) }
    }
    doSeed()
  }, [])

  // Charger les questions d'un lot depuis Supabase
  const loadLot = useCallback(async (lot: number, level: string) => {
    setLoadingQ(true)
    setSelectedLot(lot)
    setSelectedLevel(level)
    setCurrentIdx(0)
    setAnswers({})
    setShowExpl(false)

    try {
      // Cache hit
      if (CACHE[lot]) {
        setQuestions(CACHE[lot])
        setTimeLeft(CACHE[lot].length * 90)
        setView("quiz")
        setLoadingQ(false)
        return
      }

      const { data, error } = await supabase
        .from("pmp_questions")
        .select("id,lot,level,domain,pmbok,question,options,correct,explanation")
        .eq("lot", lot)
        .order("id")

      if (error || !data || data.length === 0) {
        throw new Error("Questions non disponibles")
      }

      const normalized: Q[] = data.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as any)
      }))

      CACHE[lot] = normalized
      setQuestions(normalized)
      setTimeLeft(normalized.length * 90)
      setView("quiz")
    } catch (e: any) {
      alert("Erreur chargement questions : " + e.message + "\n\nVérifiez que la migration 004_pmp_questions.sql a été exécutée dans Supabase.")
    } finally {
      setLoadingQ(false)
    }
  }, [supabase])

  // Timer
  useEffect(() => {
    if (view !== "quiz" || timeLeft <= 0) return
    if (timeLeft === 0) { setView("result"); return }
    const t = setTimeout(() => setTimeLeft(s => s-1), 1000)
    return () => clearTimeout(t)
  }, [view, timeLeft])

  const answer = (i: number) => {
    const cur = questions[currentIdx]
    if (!cur || answers[cur.id] !== undefined) return
    setAnswers(p => ({ ...p, [cur.id]: i }))
    setShowExpl(true)
  }

  const next = () => {
    if (currentIdx + 1 >= questions.length) { setView("result"); return }
    setCurrentIdx(c => c+1)
    setShowExpl(false)
  }

  const reset = () => {
    setView("select"); setSelectedLevel(null); setSelectedLot(null)
    setQuestions([]); setAnswers({}); setCurrentIdx(0)
  }

  const current = questions[currentIdx]
  const levelCfg = LEVELS.find(l => l.key === selectedLevel)
  const score = questions.filter(q => answers[q.id] === q.correct).length
  const pct = questions.length > 0 ? Math.round(score/questions.length*100) : 0
  const passed = pct >= 61
  const mm = Math.floor(timeLeft/60)
  const ss = timeLeft % 60

  return (
    <ProGate feature="pmp-simulator" featureLabel="Simulateur PMP 225 questions">
    <AppLayout>
      <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// PRÉPARATION PMP</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:0 }}>🎯 Simulateur Examen PMP</h1>
              <p style={{ fontSize:13, color:"var(--text-2)", margin:"4px 0 0" }}>
                225 questions · 3 niveaux · 15 lots de 15 questions · PMBOK 7 + Agile · Seuil : 61%
                {!seeded && <span style={{ color:"#854F0B", marginLeft:8 }}>⏳ Initialisation...</span>}
              </p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {view !== "select" && (
                <button onClick={reset} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, cursor:"pointer" }}>
                  <RotateCcw size={13}/> Changer de lot
                </button>
              )}
              <Link href="/pmp-conseils" style={{ padding:"7px 14px", background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r8)", fontSize:12, color:"var(--primary-t)", textDecoration:"none", fontWeight:500 }}>
                📖 Guide conseils
              </Link>
            </div>
          </div>
        </div>

        {/* ── SÉLECTION LOT ── */}
        {view === "select" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {LEVELS.map(lv => (
              <div key={lv.key} style={{ background:"var(--card)", border:`1px solid ${lv.border}`, borderRadius:"var(--r12)", overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", background:lv.bg, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:24 }}>{lv.icon}</span>
                  <div>
                    <h2 style={{ fontSize:15, fontWeight:700, color:lv.color, margin:0 }}>Niveau {lv.label}</h2>
                    <p style={{ fontSize:12, color:lv.color, opacity:0.7, margin:0 }}>
                      5 lots × 15 questions · 75 questions au total · ~22 min par lot
                    </p>
                  </div>
                </div>
                <div style={{ padding:16, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
                  {lv.lots.map(lot => (
                    <button key={lot} onClick={() => loadLot(lot, lv.key)}
                      disabled={loadingQ}
                      style={{ padding:"14px 10px", background:"var(--bg)", border:`1px solid ${lv.border}`, borderRadius:"var(--r8)", cursor:loadingQ?"wait":"pointer", textAlign:"center", transition:"all 0.15s", opacity:loadingQ?0.6:1 }}
                      onMouseEnter={e=>{ if(!loadingQ){(e.currentTarget as any).style.background=lv.bg;(e.currentTarget as any).style.transform="translateY(-2px)"} }}
                      onMouseLeave={e=>{ (e.currentTarget as any).style.background="var(--bg)";(e.currentTarget as any).style.transform="none" }}>
                      <div style={{ fontSize:20, marginBottom:6 }}>{lv.icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:lv.color }}>Lot {lot}</div>
                      <div style={{ fontSize:11, color:"var(--text-3)", marginTop:3, fontWeight:600 }}>15 questions</div>
                      <div style={{ fontSize:10, color:"var(--text-3)", marginTop:4 }}>
                        {CACHE[lot] ? "✓ En cache" : "Cliquer pour charger"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CHARGEMENT ── */}
        {loadingQ && (
          <div style={{ textAlign:"center", padding:60 }}>
            <div style={{ fontSize:40, marginBottom:16 }}>⏳</div>
            <p style={{ fontSize:15, color:"var(--text-2)" }}>Chargement du lot {selectedLot}...</p>
          </div>
        )}

        {/* ── QUIZ ── */}
        {view === "quiz" && !loadingQ && current && (
          <div style={{ maxWidth:780, margin:"0 auto" }}>
            {/* Progress + Timer */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-3)", marginBottom:4 }}>
                  <span>Lot {selectedLot} · {levelCfg?.label} · Q{currentIdx+1}/{questions.length}</span>
                  <span>{score} correctes · {pct}%</span>
                </div>
                <div style={{ height:5, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, background:levelCfg?.color, width:`${(currentIdx/questions.length)*100}%`, transition:"width 0.3s" }}/>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", background:timeLeft<60?"#FCEBEB":"var(--bg)", border:`1px solid ${timeLeft<60?"#E24B4A":"var(--border)"}`, borderRadius:"var(--r8)", flexShrink:0 }}>
                <Clock size={13} style={{ color:timeLeft<60?"#A32D2D":"var(--text-2)" }}/>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:"monospace", color:timeLeft<60?"#A32D2D":"var(--text-1)" }}>
                  {String(mm).padStart(2,"0")}:{String(ss).padStart(2,"0")}
                </span>
              </div>
            </div>

            {/* Question */}
            <div style={{ background:"var(--card)", border:`1px solid ${levelCfg?.border}`, borderRadius:"var(--r12)", padding:24 }}>
              <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                <span style={{ padding:"3px 10px", background:levelCfg?.bg, color:levelCfg?.color, borderRadius:20, fontSize:11, fontWeight:600 }}>{levelCfg?.icon} {levelCfg?.label}</span>
                <span style={{ padding:"3px 10px", background:"#E6F1FB", color:"var(--primary-light)", borderRadius:20, fontSize:11, fontWeight:600 }}>{current.domain}</span>
                <span style={{ padding:"3px 10px", background:"#EEEDFE", color:"#3C3489", borderRadius:20, fontSize:11, fontWeight:600 }}>{current.pmbok}</span>
                <span style={{ fontSize:11, color:"var(--text-3)", marginLeft:"auto" }}>Q{current.id}</span>
              </div>

              <p style={{ fontSize:15, fontWeight:500, color:"var(--text-1)", lineHeight:1.7, margin:"0 0 20px" }}>
                {current.question}
              </p>

              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {current.options.map((opt, i) => {
                  const done = answers[current.id] !== undefined
                  const sel = answers[current.id] === i
                  const ok = i === current.correct
                  return (
                    <button key={i} onClick={() => answer(i)} disabled={done}
                      style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px",
                        background: done ? (ok?"#EAF3DE":sel?"#FCEBEB":"#fff") : "#fff",
                        border: `1.5px solid ${done?(ok?"#639922":sel?"#E24B4A":"var(--border)"):"var(--border)"}`,
                        borderRadius:"var(--r8)", cursor:done?"default":"pointer", textAlign:"left", transition:"all 0.12s" }}
                      onMouseEnter={e=>{ if(!done)(e.currentTarget as any).style.borderColor=levelCfg?.color }}
                      onMouseLeave={e=>{ if(!done)(e.currentTarget as any).style.borderColor="var(--border)" }}>
                      <div style={{ width:24, height:24, borderRadius:"50%", border:"2px solid currentColor", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, color:done?(ok?"#27500A":sel?"#A32D2D":"var(--text-3)"):"var(--text-3)" }}>
                        {done&&ok?"✓":done&&sel?"✗":String.fromCharCode(65+i)}
                      </div>
                      <span style={{ fontSize:13, lineHeight:1.5, color:done?(ok?"#27500A":sel?"#A32D2D":"var(--text-2)"):"var(--text-1)" }}>{opt}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explication */}
              {showExpl && (
                <div style={{ marginTop:16, background:"#E6F1FB", border:"1px solid #B5D4F4", borderLeft:"4px solid #185FA5", borderRadius:"var(--r8)", padding:"12px 14px" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"#0C447C", margin:"0 0 4px" }}>💡 Explication</p>
                  <p style={{ fontSize:12, color:"var(--primary-light)", margin:0, lineHeight:1.6 }}>{current.explanation}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
              <button onClick={() => { setCurrentIdx(c=>Math.max(0,c-1)); setShowExpl(false) }} disabled={currentIdx===0}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, color:"var(--text-2)", cursor:currentIdx===0?"not-allowed":"pointer", opacity:currentIdx===0?0.4:1 }}>
                <ChevronLeft size={14}/> Précédente
              </button>
              {answers[current?.id] !== undefined ? (
                <button onClick={next}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:levelCfg?.color, color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  {currentIdx===questions.length-1?"Résultats 🏆":"Suivante"} <ChevronRight size={14}/>
                </button>
              ) : (
                <div style={{ padding:"8px 16px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, color:"var(--text-3)" }}>
                  Sélectionnez une réponse
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RÉSULTAT ── */}
        {view === "result" && (
          <div style={{ maxWidth:600, margin:"0 auto", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:32, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>{passed?"🏆":"📚"}</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 6px" }}>
              {passed?"Excellent !":"Révisez encore !"}
            </h2>
            <p style={{ fontSize:14, color:"var(--text-2)", margin:"0 0 24px" }}>
              Lot {selectedLot} · {levelCfg?.label} ·{" "}
              <strong style={{ fontSize:28, color:passed?"#27500A":"#A32D2D" }}>{pct}%</strong>{" "}
              ({score}/{questions.length})
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
              {[
                {l:"Correctes",v:score,c:"#27500A",bg:"#EAF3DE"},
                {l:"Incorrectes",v:questions.length-score,c:"#A32D2D",bg:"#FCEBEB"},
                {l:"Score",v:`${pct}%`,c:passed?"#27500A":"#A32D2D",bg:passed?"#EAF3DE":"#FCEBEB"},
              ].map(k=>(
                <div key={k.l} style={{ background:k.bg, borderRadius:"var(--r8)", padding:12 }}>
                  <p style={{ fontSize:10, color:"var(--text-3)", margin:"0 0 4px", textTransform:"uppercase" }}>{k.l}</p>
                  <p style={{ fontSize:22, fontWeight:700, color:k.c, margin:0 }}>{k.v}</p>
                </div>
              ))}
            </div>
            <div style={{ background:passed?"#EAF3DE":"#FAEEDA", border:`1px solid ${passed?"#C0DD97":"#EF9F27"}`, borderRadius:"var(--r8)", padding:"12px 16px", marginBottom:20 }}>
              <p style={{ fontSize:13, color:passed?"#27500A":"#854F0B", margin:0 }}>
                {passed
                  ? "✅ Seuil PMI (61%) atteint — bon travail !"
                  : "⚠️ Seuil PMI non atteint. Révisez les explications et retentez ce lot."}
              </p>
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => selectedLot && loadLot(selectedLot, selectedLevel!)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", background:levelCfg?.color, color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                <RotateCcw size={14}/> Reprendre ce lot
              </button>
              <button onClick={reset}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, cursor:"pointer" }}>
                Choisir un autre lot
              </button>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
    </ProGate>
  )
}
