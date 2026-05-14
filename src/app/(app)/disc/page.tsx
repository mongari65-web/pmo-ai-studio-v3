"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Brain, ChevronRight, RotateCcw, Loader2, Download } from "lucide-react"

const QUESTIONS = [
  { id:1,  q:"Face à un défi professionnel, votre premier réflexe ?",
    opts:[{l:"A",t:"Décider vite et foncer dans l'action",disc:"D"},{l:"B",t:"Mobiliser l'équipe et créer de l'énergie collective",disc:"I"},{l:"C",t:"Stabiliser et maintenir l'équilibre",disc:"S"},{l:"D",t:"Analyser méthodiquement toutes les options",disc:"C"}]},
  { id:2,  q:"Au travail, ce qui compte le plus pour vous ?",
    opts:[{l:"A",t:"Atteindre les résultats et les objectifs",disc:"D"},{l:"B",t:"Avoir de bonnes relations avec mes collègues",disc:"I"},{l:"C",t:"Travailler dans un environnement stable",disc:"S"},{l:"D",t:"Faire les choses avec précision et qualité",disc:"C"}]},
  { id:3,  q:"Votre style de communication naturel ?",
    opts:[{l:"A",t:"Direct, concis, orienté résultats",disc:"D"},{l:"B",t:"Enthousiaste, expressif, inspirant",disc:"I"},{l:"C",t:"Calme, attentif, à l'écoute",disc:"S"},{l:"D",t:"Structuré, factuel, précis",disc:"C"}]},
  { id:4,  q:"Ce que vous supportez le moins ?",
    opts:[{l:"A",t:"La lenteur, l'indécision et les blocages",disc:"D"},{l:"B",t:"L'isolement et le manque d'interactions",disc:"I"},{l:"C",t:"Les changements brusques et imprévisibles",disc:"S"},{l:"D",t:"Le désordre, l'imprécision, l'amateurisme",disc:"C"}]},
  { id:5,  q:"Comment vos collègues vous perçoivent ?",
    opts:[{l:"A",t:"Déterminé, ambitieux, parfois exigeant",disc:"D"},{l:"B",t:"Sociable, communicatif, motivant",disc:"I"},{l:"C",t:"Fiable, patient, discret",disc:"S"},{l:"D",t:"Rigoureux, analytique, perfectionniste",disc:"C"}]},
  { id:6,  q:"Quand vous prenez une décision importante ?",
    opts:[{l:"A",t:"Je décide rapidement, je fais confiance à mon instinct",disc:"D"},{l:"B",t:"Je consulte les autres et cherche un consensus",disc:"I"},{l:"C",t:"Je prends le temps de peser le pour et le contre",disc:"S"},{l:"D",t:"J'analyse toutes les données avant de conclure",disc:"C"}]},
  { id:7,  q:"En réunion de projet, vous êtes plutôt celui qui…",
    opts:[{l:"A",t:"Cadre, oriente et pousse à l'action",disc:"D"},{l:"B",t:"Dynamise les échanges et fédère le groupe",disc:"I"},{l:"C",t:"Écoute attentivement et cherche le consensus",disc:"S"},{l:"D",t:"Prend des notes et vérifie les détails",disc:"C"}]},
  { id:8,  q:"Quand un projet prend du retard ?",
    opts:[{l:"A",t:"Je prends les décisions difficiles sans attendre",disc:"D"},{l:"B",t:"Je remonte le moral de l'équipe",disc:"I"},{l:"C",t:"Je stabilise la situation et soutiens l'équipe",disc:"S"},{l:"D",t:"J'analyse les causes et propose un plan correctif",disc:"C"}]},
  { id:9,  q:"Votre rapport au changement ?",
    opts:[{l:"A",t:"Je l'initie volontiers si ça va plus vite",disc:"D"},{l:"B",t:"Je l'accueille avec enthousiasme si c'est stimulant",disc:"I"},{l:"C",t:"Je l'accepte progressivement avec du temps",disc:"S"},{l:"D",t:"Je veux comprendre le pourquoi avant d'adhérer",disc:"C"}]},
  { id:10, q:"Quand vous gérez un conflit dans l'équipe ?",
    opts:[{l:"A",t:"Je prends position clairement et tranche",disc:"D"},{l:"B",t:"Je cherche à réconcilier et redonner de l'énergie positive",disc:"I"},{l:"C",t:"Je préfère apaiser et trouver un terrain d'entente",disc:"S"},{l:"D",t:"J'analyse les faits objectifs pour résoudre rationnellement",disc:"C"}]},
  { id:11, q:"Votre rapport aux règles et procédures ?",
    opts:[{l:"A",t:"Je les contourne si elles ralentissent l'action",disc:"D"},{l:"B",t:"Je les adapte selon le contexte et les personnes",disc:"I"},{l:"C",t:"Je les respecte par souci de stabilité collective",disc:"S"},{l:"D",t:"Je les applique rigoureusement",disc:"C"}]},
  { id:12, q:"Ce qui vous donne le plus d'énergie au travail ?",
    opts:[{l:"A",t:"Relever des défis et dépasser mes objectifs",disc:"D"},{l:"B",t:"Collaborer, convaincre et créer du lien",disc:"I"},{l:"C",t:"Aider les autres et maintenir l'harmonie",disc:"S"},{l:"D",t:"Résoudre des problèmes complexes avec méthode",disc:"C"}]},
  { id:13, q:"Comment vous préparez-vous à une présentation importante ?",
    opts:[{l:"A",t:"Je prépare les points clés, je m'adapte en direct",disc:"D"},{l:"B",t:"Je mise sur mon naturel et ma capacité à capter l'attention",disc:"I"},{l:"C",t:"Je m'assure que tout le monde est à l'aise avec le contenu",disc:"S"},{l:"D",t:"Je prépare chaque diapositive avec rigueur et exactitude",disc:"C"}]},
  { id:14, q:"Votre façon de gérer les priorités ?",
    opts:[{l:"A",t:"Je fonce sur ce qui a le plus d'impact immédiat",disc:"D"},{l:"B",t:"Je gère en fonction des besoins des personnes autour de moi",disc:"I"},{l:"C",t:"Je suis un plan établi, étape par étape",disc:"S"},{l:"D",t:"Je liste, classe et organise avant de commencer",disc:"C"}]},
  { id:15, q:"Quand quelqu'un critique votre travail ?",
    opts:[{l:"A",t:"Je défends mon point de vue avec assurance",disc:"D"},{l:"B",t:"Je cherche à comprendre et à préserver la relation",disc:"I"},{l:"C",t:"J'écoute et prends le temps d'intégrer avant de répondre",disc:"S"},{l:"D",t:"Je demande des faits précis pour évaluer objectivement",disc:"C"}]},
  { id:16, q:"Dans une équipe, votre rôle naturel est souvent…",
    opts:[{l:"A",t:"Le leader qui fixe le cap et pousse à avancer",disc:"D"},{l:"B",t:"L'ambassadeur qui fédère et motive",disc:"I"},{l:"C",t:"Le pilier fiable sur qui l'équipe peut compter",disc:"S"},{l:"D",t:"L'expert qui garantit la qualité et la rigueur",disc:"C"}]},
  { id:17, q:"Face à une nouvelle mission floue et peu définie ?",
    opts:[{l:"A",t:"Je fonce, je clarifie en avançant",disc:"D"},{l:"B",t:"Je l'aborde avec enthousiasme, j'improvise",disc:"I"},{l:"C",t:"J'attends d'avoir plus d'informations pour me lancer",disc:"S"},{l:"D",t:"Je pose des questions jusqu'à avoir un cadre clair",disc:"C"}]},
  { id:18, q:"Ce que vous attendez d'un bon manager ?",
    opts:[{l:"A",t:"Qu'il me donne de l'autonomie et des objectifs ambitieux",disc:"D"},{l:"B",t:"Qu'il reconnaisse mes contributions et m'encourage",disc:"I"},{l:"C",t:"Qu'il soit stable, équitable et soutenant",disc:"S"},{l:"D",t:"Qu'il soit compétent et me donne des directives claires",disc:"C"}]},
  { id:19, q:"Quand vous réussissez un projet difficile ?",
    opts:[{l:"A",t:"Je passe vite au prochain challenge",disc:"D"},{l:"B",t:"Je célèbre avec l'équipe et partage la victoire",disc:"I"},{l:"C",t:"Je ressens satisfaction et soulagement dans la continuité",disc:"S"},{l:"D",t:"J'analyse ce qui a fonctionné pour en tirer des leçons",disc:"C"}]},
  { id:20, q:"Quel type de projet vous stimule le plus ?",
    opts:[{l:"A",t:"Un projet risqué avec des enjeux élevés et des délais courts",disc:"D"},{l:"B",t:"Un projet impliquant beaucoup de parties prenantes à convaincre",disc:"I"},{l:"C",t:"Un projet à long terme demandant cohésion et régularité",disc:"S"},{l:"D",t:"Un projet complexe demandant expertise et précision technique",disc:"C"}]},
]

const DISC_CFG = {
  D: {
    label:"Dominant", emoji:"🔴", color:"#C0392B", bg:"#FDEDEC", border:"#E74C3C",
    gradient:"linear-gradient(135deg,#E74C3C,#C0392B)",
    valeurs:"Décisif, direct, confiant, orienté résultats, assertif, goût du challenge",
    motivation:"Le challenge, la compétition, gagner, le succès, l'efficacité, les résultats",
    naime_pas:"Perdre son temps, qu'on le bloque, montrer sa vulnérabilité",
    defauts:"Manque d'empathie, impatience, impulsivité, peut paraître agressif",
    comment_parler:"Se focaliser sur les résultats, ne pas se perdre dans les détails, être dynamique",
    mots:["Actif","Rapide","Franc-parler","Dynamique","Audacieux"],
    axe:"RÉSULTATS",
  },
  I: {
    label:"Influent", emoji:"🟡", color:"#D4A017", bg:"#FEF9E7", border:"#F39C12",
    gradient:"linear-gradient(135deg,#F4D03F,#E67E22)",
    valeurs:"Enthousiaste, sociable, optimiste, confiant, rassembleur, motivant, convaincant",
    motivation:"La reconnaissance sociale, les interactions positives, le plaisir, la créativité",
    naime_pas:"Le rejet, la perte d'influence, un cadre contraignant, les tâches répétitives",
    defauts:"Manque de rigueur, tendance à l'éparpillement, manque de structure, parle trop",
    comment_parler:"Parler de choses qui l'enthousiasment, lui montrer qu'on l'apprécie, le faire rêver",
    mots:["Acceptation","Axé sur les gens","Empathique","Réceptif"],
    axe:"RELATION",
  },
  S: {
    label:"Stable", emoji:"🟢", color:"#1E8449", bg:"#EAFAF1", border:"#27AE60",
    gradient:"linear-gradient(135deg,#58D68D,#1E8449)",
    valeurs:"Bienveillant, compréhensif, empathique, humble, à l'écoute, patient, attentif",
    motivation:"L'équipe, l'harmonie, un environnement stable, la coopération, l'entraide",
    naime_pas:"Les conflits, blesser les autres ou se sentir blessé, le manque de coopération",
    defauts:"Indécis, se remet constamment en question, n'ose pas fixer les limites",
    comment_parler:"Le rassurer, partager des conseils, être dans une énergie douce, lui montrer qu'il compte",
    mots:["Réfléchi","Méthodique","Rythme modéré","Prudent","Calme"],
    axe:"INTROVERSION",
  },
  C: {
    label:"Conformiste", emoji:"🔵", color:"#1A5276", bg:"#EBF5FB", border:"#2980B9",
    gradient:"linear-gradient(135deg,#5DADE2,#1A5276)",
    valeurs:"Précis, rigoureux, structuré, analytique, factuel, rationnel, prudent",
    motivation:"Le travail bien fait, la qualité, la reconnaissance de l'expertise, la précision",
    naime_pas:"Les changements rapides, le manque de rigueur, les choix à l'intuition",
    defauts:"Résistance au changement, critique, tendance à suranalyser, peut paraître froid",
    comment_parler:"Être précis, se baser sur des faits, laisser le temps de la réflexion, entrer dans le détail",
    mots:["Logique","Raisonnement","Objectif","Sceptique"],
    axe:"RÉSULTATS",
  },
}

type DiscKey = "D"|"I"|"S"|"C"

function DISCWheel({ scores, primary, secondary }: { scores: Record<DiscKey,number>, primary: DiscKey, secondary: DiscKey|null }) {
  const total = Object.values(scores).reduce((a,b)=>a+b,0) || 20
  return (
    <div style={{ position:"relative", width:180, height:180, margin:"0 auto" }}>
      {/* Cercle de fond */}
      <svg width="180" height="180" viewBox="0 0 180 180">
        {(["D","I","S","C"] as DiscKey[]).map((key,i) => {
          const cfg = DISC_CFG[key]
          const pct = scores[key]/total
          const radius = 70
          const cx=90, cy=90
          const startAngle = i * 90 - 90
          const endAngle = startAngle + 90
          const s = startAngle*Math.PI/180
          const e = endAngle*Math.PI/180
          const x1=cx+radius*Math.cos(s), y1=cy+radius*Math.sin(s)
          const x2=cx+radius*Math.cos(e), y2=cy+radius*Math.sin(e)
          const r2 = 20 + pct * 50
          const x3=cx+r2*Math.cos(e), y3=cy+r2*Math.sin(e)
          const x4=cx+r2*Math.cos(s), y4=cy+r2*Math.sin(s)
          return (
            <g key={key}>
              <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                fill={cfg.color} opacity="0.15"/>
              <path d={`M ${cx} ${cy} L ${x4} ${y4} A ${r2} ${r2} 0 0 1 ${x3} ${y3} Z`}
                fill={cfg.color} opacity="0.85"/>
            </g>
          )
        })}
        {/* Cercle central */}
        <circle cx="90" cy="90" r="28" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
        <text x="90" y="86" textAnchor="middle" fontSize="11" fontWeight="700" fill="#172B4D">DISC</text>
        <text x="90" y="99" textAnchor="middle" fontSize="9" fill="#5E6C84">{primary}{secondary?"+"+secondary:""}</text>
      </svg>
      {/* Labels */}
      {[
        {key:"D",x:18, y:18},{key:"I",x:145,y:18},
        {key:"S",x:18, y:155},{key:"C",x:145,y:155}
      ].map(({key,x,y})=>(
        <div key={key} style={{ position:"absolute", left:x, top:y, fontSize:11, fontWeight:800,
          color: DISC_CFG[key as DiscKey].color,
          textShadow: key===primary||key===secondary ? "0 0 8px currentColor" : "none",
          transform: key===primary ? "scale(1.2)" : "none" }}>
          {key}
        </div>
      ))}
    </div>
  )
}

function ProfileCard({ discKey, score, total, isPrimary, isSecondary }: {
  discKey: DiscKey, score: number, total: number,
  isPrimary: boolean, isSecondary: boolean
}) {
  const cfg = DISC_CFG[discKey]
  const pct = Math.round(score/total*100)
  return (
    <div style={{
      border:`2px solid ${isPrimary ? cfg.color : isSecondary ? cfg.border : "#DFE1E6"}`,
      borderRadius:12, overflow:"hidden", position:"relative",
      boxShadow: isPrimary ? `0 4px 20px ${cfg.color}33` : "none",
      transform: isPrimary ? "scale(1.01)" : "none",
      transition:"all 0.2s"
    }}>
      {isPrimary && (
        <div style={{ position:"absolute", top:10, right:10, background:cfg.color, color:"#fff", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.5px" }}>
          Profil principal
        </div>
      )}
      {isSecondary && (
        <div style={{ position:"absolute", top:10, right:10, background:cfg.border, color:"#fff", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:20 }}>
          Secondaire
        </div>
      )}

      {/* Header */}
      <div style={{ padding:"14px 16px 10px", background:cfg.gradient }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <span style={{ fontSize:22 }}>{cfg.emoji}</span>
          <h3 style={{ fontSize:16, fontWeight:800, color:"#fff", margin:0, textTransform:"uppercase", letterSpacing:"1px" }}>{cfg.label}</h3>
        </div>
        {/* Barre de score */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ flex:1, height:7, background:"rgba(255,255,255,0.3)", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", background:"rgba(255,255,255,0.9)", borderRadius:4, width:`${pct}%`, transition:"width 0.8s" }}/>
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:"#fff", minWidth:30 }}>{score}/20</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"12px 14px", background:cfg.bg }}>
        {[
          { label:"⭐ Ses valeurs", text: cfg.valeurs },
          { label:"🎯 Motivé par", text: cfg.motivation },
          { label:"❌ N'aime pas", text: cfg.naime_pas },
          { label:"⚠️ Ses défauts", text: cfg.defauts },
          { label:"💬 Comment lui parler", text: cfg.comment_parler },
        ].map(({label,text}) => (
          <div key={label} style={{ marginBottom:7 }}>
            <span style={{ fontSize:10, fontWeight:700, color:cfg.color, display:"block", marginBottom:2 }}>{label} :</span>
            <span style={{ fontSize:11, color:"#2C3E50", lineHeight:1.5 }}>{text}</span>
          </div>
        ))}

        {/* Mots clés */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:8 }}>
          {cfg.mots.map(m=>(
            <span key={m} style={{ fontSize:10, padding:"2px 8px", background:"rgba(255,255,255,0.7)", border:`1px solid ${cfg.border}`, borderRadius:20, color:cfg.color, fontWeight:600 }}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DISCPage() {
  const [step, setStep] = useState<"intro"|"quiz"|"loading"|"result">("intro")
  const [answers, setAnswers] = useState<Record<number,DiscKey>>({})
  const [current, setCurrent] = useState(0)
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [scores, setScores] = useState<Record<DiscKey,number>>({D:0,I:0,S:0,C:0})
  const [primary, setPrimary] = useState<DiscKey>("D")
  const [secondary, setSecondary] = useState<DiscKey|null>(null)

  const q = QUESTIONS[current]

  const answer = (qId: number, disc: DiscKey) => {
    const newA = {...answers, [qId]: disc}
    setAnswers(newA)
    if (current < QUESTIONS.length-1) {
      setTimeout(()=>setCurrent(c=>c+1), 280)
    } else {
      const sc: Record<DiscKey,number> = {D:0,I:0,S:0,C:0}
      Object.values(newA).forEach(d=>sc[d as DiscKey]++)
      setScores(sc)
      const sorted = (Object.entries(sc) as [DiscKey,number][]).sort((a,b)=>b[1]-a[1])
      const p = sorted[0][0]
      const s = sorted[1][1] >= sorted[0][1]-3 ? sorted[1][0] : null
      setPrimary(p); setSecondary(s)
      callAI(newA, sc, p, s)
    }
  }

  const callAI = async (ans: Record<number,DiscKey>, sc: Record<DiscKey,number>, p: DiscKey, s: DiscKey|null) => {
    setStep("loading")
    const lines = QUESTIONS.map((q,i)=>{
      const a = ans[q.id]; const opt = q.opts.find(o=>o.disc===a)
      return `Q${i+1}. ${q.q} → ${opt?.l}(${a}): "${opt?.t}"`
    }).join("\n")

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:800,
          system:"Tu es expert DISC. Réponds en français, style professionnel et bienveillant, sans jugement.",
          messages:[{role:"user",content:`Profil DISC analysé :
Scores : D=${sc.D}/20, I=${sc.I}/20, S=${sc.S}/20, C=${sc.C}/20
Profil principal : ${p}${s?" | Profil secondaire : "+s:""}

20 réponses :
${lines}

Donne une analyse en 5 sections courtes :
**Synthèse du profil** : 2-3 phrases décrivant le style comportemental dominant.
**3 forces clés** : (liste courte)
**3 points de vigilance** : (liste courte)
**En situation de stress** : comment ce profil réagit sous pression (1-2 phrases).
**Conseil clé pour progresser** : 1 conseil personnalisé et concret.

Style : direct, factuel, positif. Pas de score scientifique.`}]
        })
      })
      const data = await res.json()
      setAiAnalysis(data.content?.[0]?.text ?? "")
    } catch(e:any) { setAiAnalysis("") }
    setStep("result")
  }

  const restart = () => {
    setStep("intro"); setAnswers({}); setCurrent(0)
    setAiAnalysis(""); setScores({D:0,I:0,S:0,C:0})
  }

  const sorted = (Object.entries(scores) as [DiscKey,number][]).sort((a,b)=>b[1]-a[1])

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%" }}>

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// OUTILS LEADERSHIP</p>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 4px", display:"flex", alignItems:"center", gap:10 }}>
            <Brain size={22} style={{ color:"var(--primary)" }}/> Analyse DISC Comportementale
          </h1>
          <p style={{ fontSize:13, color:"var(--text-2)", margin:0 }}>20 questions · Profil comportemental complet · Analyse IA personnalisée</p>
        </div>

        {/* ── INTRO ── */}
        {step === "intro" && (
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            {/* Titre style sketchnote */}
            <div style={{ textAlign:"center", marginBottom:20, padding:"20px", background:"linear-gradient(135deg,#2C3E50,#3498DB)", borderRadius:16 }}>
              <h2 style={{ fontSize:24, fontWeight:900, color:"#fff", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"2px" }}>
                Découvrez votre profil DISC
              </h2>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.8)", margin:0 }}>
                4 styles comportementaux · Axe Résultats ↔ Relations · Axe Extraversion ↔ Introversion
              </p>
            </div>

            {/* 4 quadrants comme l'infographie */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              {(["D","I","S","C"] as DiscKey[]).map(key => {
                const cfg = DISC_CFG[key]
                return (
                  <div key={key} style={{ border:`2px solid ${cfg.border}`, borderRadius:12, overflow:"hidden" }}>
                    <div style={{ padding:"12px 14px", background:cfg.gradient }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:24 }}>{cfg.emoji}</span>
                        <h3 style={{ fontSize:15, fontWeight:800, color:"#fff", margin:0, textTransform:"uppercase", letterSpacing:"1px" }}>{cfg.label}</h3>
                      </div>
                    </div>
                    <div style={{ padding:"10px 14px", background:cfg.bg }}>
                      <p style={{ fontSize:11, color:cfg.color, fontWeight:600, margin:"0 0 3px" }}>⭐ Valeurs :</p>
                      <p style={{ fontSize:11, color:"#2C3E50", margin:"0 0 5px" }}>{cfg.valeurs.split(",").slice(0,3).join(", ")}...</p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                        {cfg.mots.slice(0,3).map(m=>(
                          <span key={m} style={{ fontSize:10, padding:"1px 7px", background:"rgba(255,255,255,0.7)", border:`1px solid ${cfg.border}`, borderRadius:20, color:cfg.color, fontWeight:600 }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Axes */}
            <div style={{ display:"flex", justifyContent:"space-around", marginBottom:16, background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 16px" }}>
              {[["🎯","RÉSULTATS","D + C"],["😊","RELATIONS","I + S"],["⬆️","EXTRAVERSION","D + I"],["⬇️","INTROVERSION","S + C"]].map(([e,l,p])=>(
                <div key={l} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:18 }}>{e}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:"var(--text-1)" }}>{l}</div>
                  <div style={{ fontSize:9, color:"var(--text-3)" }}>{p}</div>
                </div>
              ))}
            </div>

            <button onClick={()=>setStep("quiz")}
              style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#2C3E50,#3498DB)", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              🚀 Démarrer l'analyse — 20 questions <ChevronRight size={16}/>
            </button>
            <p style={{ textAlign:"center", fontSize:11, color:"var(--text-3)", marginTop:8 }}>
              ⚠️ DISC n'est pas un diagnostic psychologique · Résultat = hypothèse comportementale
            </p>
          </div>
        )}

        {/* ── QUIZ ── */}
        {step === "quiz" && q && (
          <div style={{ maxWidth:620, margin:"0 auto" }}>
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-3)", marginBottom:5 }}>
                <span>Question {current+1} / {QUESTIONS.length}</span>
                <span>{Math.round(current/QUESTIONS.length*100)}% complété</span>
              </div>
              <div style={{ height:6, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:3, background:"linear-gradient(90deg,#3498DB,#2C3E50)", width:`${(current/QUESTIONS.length)*100}%`, transition:"width 0.4s" }}/>
              </div>
            </div>

            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:24 }}>
              <p style={{ fontSize:15, fontWeight:600, color:"var(--text-1)", margin:"0 0 20px", lineHeight:1.6 }}>
                {q.q}
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {q.opts.map(opt => {
                  const cfg = DISC_CFG[opt.disc as DiscKey]
                  const sel = answers[q.id] === opt.disc
                  return (
                    <button key={opt.l} onClick={()=>answer(q.id, opt.disc as DiscKey)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px",
                        background: sel ? cfg.bg : "#fff",
                        border:`1.5px solid ${sel ? cfg.color : "var(--border)"}`,
                        borderRadius:10, cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
                      onMouseEnter={e=>{ if(!sel){(e.currentTarget as any).style.background=cfg.bg;(e.currentTarget as any).style.borderColor=cfg.color} }}
                      onMouseLeave={e=>{ if(!sel){(e.currentTarget as any).style.background="#fff";(e.currentTarget as any).style.borderColor="var(--border)"} }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0,
                        background: sel ? cfg.color : "var(--bg)",
                        border:`2px solid ${sel?cfg.color:cfg.border}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:11, fontWeight:700, color: sel?"#fff":cfg.color }}>
                        {opt.l}
                      </div>
                      <span style={{ fontSize:13, color: sel?cfg.color:"var(--text-1)", fontWeight:sel?600:400, lineHeight:1.5 }}>{opt.t}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* dots */}
            <div style={{ display:"flex", justifyContent:"center", gap:4, marginTop:12 }}>
              {QUESTIONS.map((_,i)=>(
                <div key={i} style={{ width:6, height:6, borderRadius:"50%", transition:"all 0.2s",
                  background: i===current ? "#2C3E50" : answers[QUESTIONS[i].id] ? DISC_CFG[answers[QUESTIONS[i].id] as DiscKey].color : "var(--border)",
                  transform: i===current ? "scale(1.4)" : "none" }}/>
              ))}
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {step === "loading" && (
          <div style={{ textAlign:"center", padding:60 }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#3498DB,#2C3E50)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <Loader2 size={32} style={{ color:"#fff", animation:"spin 1s linear infinite" }}/>
            </div>
            <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px" }}>Analyse de votre profil DISC...</h2>
            <p style={{ fontSize:13, color:"var(--text-2)", margin:0 }}>L'IA analyse vos 20 réponses et construit votre profil comportemental</p>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ── RÉSULTAT ── */}
        {step === "result" && (
          <div style={{ maxWidth:1000, margin:"0 auto" }}>

            {/* Titre résultat */}
            <div style={{ background:DISC_CFG[primary].gradient, borderRadius:14, padding:"18px 24px", marginBottom:16, display:"flex", alignItems:"center", gap:20 }}>
              <DISCWheel scores={scores} primary={primary} secondary={secondary}/>
              <div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.7)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"1px" }}>Votre profil DISC</p>
                <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"2px" }}>
                  {DISC_CFG[primary].emoji} {DISC_CFG[primary].label}
                  {secondary && <span style={{ fontSize:16, opacity:0.8 }}> + {DISC_CFG[secondary].emoji} {DISC_CFG[secondary].label}</span>}
                </h2>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.85)", margin:0 }}>
                  {DISC_CFG[primary].valeurs.split(",").slice(0,4).join(" · ")}
                </p>
                {/* mini scores */}
                <div style={{ display:"flex", gap:12, marginTop:10 }}>
                  {sorted.map(([k,v])=>(
                    <div key={k} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{k}</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>{v}/20</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 cartes DISC */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              {sorted.map(([key,score])=>(
                <ProfileCard key={key} discKey={key as DiscKey} score={score} total={20}
                  isPrimary={key===primary} isSecondary={key===secondary}/>
              ))}
            </div>

            {/* Analyse IA */}
            {aiAnalysis && (
              <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:14 }}>
                <div style={{ padding:"14px 20px", background:"linear-gradient(135deg,#253858,#0052CC)", display:"flex", alignItems:"center", gap:10 }}>
                  <Brain size={18} style={{ color:"#fff" }}/>
                  <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", margin:0 }}>Analyse IA personnalisée</h3>
                </div>
                <div style={{ padding:"18px 20px" }}>
                  {aiAnalysis.split("\n").map((line,i)=>{
                    if(!line.trim()) return <div key={i} style={{height:6}}/>
                    const isTitle = line.startsWith("**")
                    const cleaned = line.replace(/\*\*/g,"")
                    return (
                      <p key={i} style={{ fontSize: isTitle?13:12, fontWeight:isTitle?700:400,
                        color:isTitle?"var(--text-1)":"var(--text-2)",
                        margin:isTitle?"12px 0 4px":"0 0 3px", lineHeight:1.6,
                        paddingLeft:line.startsWith("-")||line.startsWith("•")?14:0 }}>
                        {cleaned}
                      </p>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={restart}
                style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px", background:"#fff", border:"1px solid var(--border)", borderRadius:10, fontSize:13, cursor:"pointer", fontWeight:500 }}>
                <RotateCcw size={14}/> Refaire le test
              </button>
              <button onClick={()=>{
                const txt = `PROFIL DISC — PMO AI Studio\n\nProfil principal : ${primary} — ${DISC_CFG[primary].label}\n${secondary?`Profil secondaire : ${secondary} — ${DISC_CFG[secondary].label}\n`:""}\nScores :\n${sorted.map(([k,v])=>`${k} (${DISC_CFG[k as DiscKey].label}) : ${v}/20`).join("\n")}\n\n${aiAnalysis}`
                const blob=new Blob([txt],{type:"text/plain"})
                const url=URL.createObjectURL(blob)
                const a=document.createElement("a");a.href=url;a.download="profil-disc.txt";a.click()
                URL.revokeObjectURL(url)
              }}
                style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px", background:DISC_CFG[primary].gradient, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                <Download size={14}/> Télécharger mon profil
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
