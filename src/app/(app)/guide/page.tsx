"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import AppLayout from "@/components/layout/AppLayout"
import { NavButtons } from "@/components/ui/BackButton"

const SCENARIOS = [
  { id:"initiation", icon:"🆕", label:"Nouveau projet", subtitle:"Projet à initier", color:"#22c55e",
    principe:"En PRINCE2®, tout projet doit avoir un Business Case avant de démarrer.",
    message:"Espace projet vierge créé à partir de la date de début.",
    outils:["wbs","gantt","raid","budget","raci"],
    questions:[
      {id:"name",label:"Nom du projet",type:"text",placeholder:"Ex: Migration JBOSS",required:true,aide:"Le nom doit identifier clairement le périmètre."},
      {id:"description",label:"Description et objectifs",type:"textarea",placeholder:"Décrivez le projet...",required:true,aide:"Répondez à: Quoi? Pour qui? Pourquoi? Quel bénéfice?"},
      {id:"startDate",label:"Date de début prévue",type:"date",placeholder:"",required:true,aide:"Conditionne tous les jalons du projet."},
      {id:"endDate",label:"Date de fin prévue",type:"date",placeholder:"",required:true,aide:"Doit être réaliste — la sous-estimation est la 1ère cause d'échec."},
      {id:"budget",label:"Budget alloué (EUR)",type:"number",placeholder:"Ex: 150000",required:true,aide:"Base du calcul EVM (Valeur Planifiée)."},
      {id:"methodology",label:"Méthodologie cible",type:"select",options:["PMBOK 7","PRINCE2®","Agile / Scrum","Waterfall","Hybride"],required:true,aide:"Détermine les outils prioritaires à générer."},
      {id:"sector",label:"Secteur",type:"select",options:["IT / Digital","Finance / Banking","Santé / Médical","BTP / Construction","Industrie","Télécom","Retail","Autre"],required:true,aide:"Le secteur influence les contraintes réglementaires."},
      {id:"client",label:"Nom du client",type:"text",placeholder:"Ex: BNP Paribas, SNCF...",required:false,aide:"Identifiez le commanditaire ou client final."},
      {id:"environment",label:"Environnement technique",type:"select",options:["Cloud AWS/Azure/GCP","On-premise","Hybride","SaaS","Mobile","IoT / Embarqué","Mainframe","Autre"],required:false,aide:"Oriente les risques et compétences nécessaires."},
      {id:"objectives",label:"Objectifs business",type:"textarea",placeholder:"Réduction coûts, conformité, digitalisation...",required:false,aide:"Les objectifs doivent être mesurables — ROI, délai, qualité."},
      {id:"teamSize",label:"Taille de l'équipe",type:"select",options:["1-3","4-8","9-15","16+"],required:false,aide:"Influence la complexité du RACI."},
    ]
  },
  { id:"reprise", icon:"🔄", label:"Projet en cours", subtitle:"Reprise ou pilotage actif", color:"#f59e0b",
    principe:"Reprendre un projet demande un diagnostic rapide: CPI et SPI révèlent l'état de santé réel.",
    message:"EVM initialisé avec vos indices actuels. RAID pré-rempli avec les problèmes identifiés.",
    outils:["budget","raid","gantt","wbs"],
    questions:[
      {id:"name",label:"Nom du projet",type:"text",placeholder:"Ex: Refonte SI RH",required:true,aide:"Tel que connu des parties prenantes."},
      {id:"description",label:"Description et contexte actuel",type:"textarea",placeholder:"État actuel du projet...",required:true,aide:"Décrivez aussi pourquoi vous reprenez ce projet maintenant."},
      {id:"startDate",label:"Date de début réelle",type:"date",placeholder:"",required:true,aide:"Permet de calculer la période courante pour l'EVM."},
      {id:"endDate",label:"Date de fin prévue",type:"date",placeholder:"",required:true,aide:"Date initiale ou révisée?"},
      {id:"budget",label:"Budget total (EUR)",type:"number",placeholder:"Ex: 280000",required:true,aide:"BAC — Budget at Completion."},
      {id:"currentPhase",label:"Phase actuelle",type:"select",options:["Planification","Exécution","Test / Recette","Déploiement","Clôture"],required:true,aide:"Détermine les outils prioritaires."},
      {id:"cpi",label:"CPI actuel (optionnel)",type:"number",placeholder:"Ex: 0.87",required:false,aide:"CPI < 1 = dépassement. Laissez vide si inconnu."},
      {id:"spi",label:"SPI actuel (optionnel)",type:"number",placeholder:"Ex: 0.92",required:false,aide:"SPI < 1 = retard sur planning."},
      {id:"issues",label:"Problèmes identifiés",type:"textarea",placeholder:"Retards, risques actifs...",required:false,aide:"Un problème bien décrit génère un RAID plus pertinent."},
      {id:"methodology",label:"Méthodologie",type:"select",options:["PMBOK 7","PRINCE2®","Agile / Scrum","Waterfall","Hybride"],required:true,aide:""},
    ]
  },
  { id:"sauvetage", icon:"🚨", label:"Projet en crise", subtitle:"CPI < 0.8 ou retard critique", color:"#ef4444",
    principe:"PRINCE2®: une exception déclenche un rapport au Project Board. L'objectif est une trajectoire crédible de redressement.",
    message:"Diagnostic de crise avec plan de redressement. EVM avec scénarios de récupération.",
    outils:["raid","budget","gantt","wbs"],
    questions:[
      {id:"name",label:"Nom du projet",type:"text",placeholder:"",required:true,aide:""},
      {id:"description",label:"Description",type:"textarea",placeholder:"",required:true,aide:""},
      {id:"startDate",label:"Date de début",type:"date",placeholder:"",required:true,aide:""},
      {id:"endDate",label:"Date de fin contractuelle",type:"date",placeholder:"",required:true,aide:"Un glissement a-t-il déjà été accordé?"},
      {id:"budget",label:"Budget total (EUR)",type:"number",placeholder:"",required:true,aide:""},
      {id:"cpi",label:"CPI actuel",type:"number",placeholder:"Ex: 0.72",required:true,aide:"CPI 0.72 = pour 1EUR dépensé, 0.72EUR de valeur produite."},
      {id:"spi",label:"SPI actuel",type:"number",placeholder:"Ex: 0.65",required:true,aide:"SPI 0.65 = 35% de retard sur le planning."},
      {id:"rootCause",label:"Cause racine",type:"select",options:["Sous-estimation","Scope creep","Ressources insuffisantes","Dépendances","Problèmes techniques","Turnover","Autre"],required:true,aide:"La cause racine détermine le plan d'action."},
      {id:"issues",label:"Problèmes critiques actifs",type:"textarea",placeholder:"Décrivez les blocages...",required:true,aide:"Listez tout — un problème non documenté ne peut pas être résolu."},
    ]
  },
  { id:"audit", icon:"🔍", label:"Audit / Étude", subtitle:"Business Case PRINCE2", color:"#7B5EFF",
    principe:"PRINCE2® exige une justification continue. L'audit vérifie que le Business Case est valide et les bénéfices atteignables.",
    message:"Cadre d'audit avec 7 principes PRINCE2®, grille Business Case et template de rapport.",
    outils:["raid","wbs","budget","gantt"],
    questions:[
      {id:"name",label:"Périmètre d'audit",type:"text",placeholder:"Ex: Audit SI Finance Q2 2026",required:true,aide:"Précisez si c'est un audit complet ou ciblé."},
      {id:"description",label:"Objectif de l'audit",type:"textarea",placeholder:"Ce que vous cherchez à évaluer...",required:true,aide:"Quelles questions se pose le commanditaire? Quelles décisions attend-il?"},
      {id:"scope",label:"Périmètre",type:"textarea",placeholder:"Systèmes, processus, équipes concernés...",required:true,aide:"Délimitez explicitement ce qui est IN et OUT."},
      {id:"businessCase",label:"Business Case disponible?",type:"select",options:["Oui — documenté","Oui — informel","Non — à construire","Inconnu"],required:true,aide:"Document central de PRINCE2®. S'il n'existe pas, l'audit doit en proposer un."},
      {id:"stakeholders",label:"Commanditaire / Parties prenantes",type:"text",placeholder:"Ex: DSI, DAF, Comité de Direction",required:true,aide:"Identifiez qui commandite et qui reçoit le rapport."},
      {id:"endDate",label:"Date de remise du rapport",type:"date",placeholder:"",required:true,aide:""},
      {id:"budget",label:"Budget de l'étude (EUR)",type:"number",placeholder:"Ex: 15000",required:false,aide:""},
    ]
  },
]

export default function GuidePage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep]         = useState(0)
  const [scenario, setScenario] = useState<typeof SCENARIOS[0] | null>(null)
  const [form, setForm]         = useState<Record<string,string>>({})
  const [loading, setLoading]   = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const canProceed = () => !scenario ? false : scenario.questions.filter(q => q.required).every(q => form[q.id]?.trim())

  const create = async () => {
    if (!scenario || !canProceed()) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("Non connecté"); return }
      const { data: proj, error } = await supabase.from("projects").insert({
        user_id: user.id,
        name: form.name,
        description: form.description ?? form.scope ?? "",
        start_date: form.startDate,
        end_date: form.endDate,
        budget: form.budget ? parseFloat(form.budget) : null,
        methodology: form.methodology ?? scenario.id,
        sector: form.sector ?? "",
        client: form.client ?? "",
        status: "active",
      }).select().single()
      if (error) throw error
      fetch('/api/email/new-project', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email: user.email, name: form.name, projectName: form.name, scenario: scenario.id }) }).catch(console.error)
      toast.success("Projet créé !")
      router.push("/projects/" + proj.id + "/wbs")
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const S = { card:{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"9px 12px", color:"var(--text-1)", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" as const } }

  return (
    <AppLayout>
    <div style={{ padding:"32px 28px", maxWidth:860, margin:"0 auto" }}>

      {step === 0 && (
        <div>
          <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 6px" }}>// GUIDE CP</p>
          <h1 style={{ fontSize:26, fontWeight:800, color:"var(--text-1)", margin:"0 0 8px" }}>Quelle est votre situation ?</h1>
          <p style={{ fontSize:14, color:"var(--text-2)", lineHeight:1.7, maxWidth:620, marginBottom:28 }}>
            Votre première action en tant que CP est de qualifier votre contexte.
            La méthode, les outils et les priorités varient selon votre situation.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => { setScenario(s); setStep(1) }}
                style={{ background:"var(--bg-card)", border:"2px solid var(--border)", borderRadius:16, padding:24, textAlign:"left", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = s.color; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.transform = "none" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontSize:16, fontWeight:700, color:"var(--text-1)", marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:12, color:s.color, fontWeight:600, marginBottom:8 }}>{s.subtitle}</div>
                <p style={{ fontSize:12, color:"var(--text-2)", lineHeight:1.6, margin:"0 0 10px" }}>{s.principe}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && scenario && (
        <div>
          <NavButtons backHref="/guide" backLabel="Choisir un scénario"/>
          <div style={{ marginBottom:24 }}>
            <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1, margin:0 }}>{scenario.icon} {scenario.label}</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:"2px 0 0" }}>Contexte du projet</h1>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {scenario.questions.map(q => (
              <div key={q.id} style={{ gridColumn: q.type === "textarea" ? "1 / -1" : "auto" }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text-2)", marginBottom:5 }}>
                  {q.label} {q.required && <span style={{ color:"#ef4444" }}>*</span>}
                </label>
                {(q.type === "text" || q.type === "number") && (
                  <input type={q.type} value={form[q.id]??""} onChange={e=>set(q.id,e.target.value)} placeholder={q.placeholder} style={S.card}/>
                )}
                {q.type === "date" && (
                  <input type="date" value={form[q.id]??""} onChange={e=>set(q.id,e.target.value)} style={S.card}/>
                )}
                {q.type === "textarea" && (
                  <textarea value={form[q.id]??""} onChange={e=>set(q.id,e.target.value)} placeholder={q.placeholder} rows={3} style={{...S.card, resize:"vertical"}}/>
                )}
                {q.type === "select" && (
                  <select value={form[q.id]??""} onChange={e=>set(q.id,e.target.value)} style={S.card}>
                    <option value="">Sélectionner...</option>
                    {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {q.aide && <p style={{ fontSize:11, color:"var(--text-3)", margin:"4px 0 0", lineHeight:1.5 }}>💡 {q.aide}</p>}
              </div>
            ))}
          </div>
          <div style={{ marginTop:24, padding:14, background:"rgba(123,94,255,0.08)", border:"1px solid rgba(123,94,255,0.2)", borderRadius:10 }}>
            <p style={{ fontSize:12, color:"var(--text-2)", margin:"0 0 6px", fontWeight:600 }}>Outils générés :</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {scenario.outils.map(o => (
                <span key={o} style={{ background:"rgba(123,94,255,0.15)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:6, padding:"2px 10px", fontSize:11, color:"#9B84FF", textTransform:"uppercase", fontWeight:600 }}>{o}</span>
              ))}
            </div>
          </div>
          <div style={{ marginTop:16, display:"flex", justifyContent:"flex-end" }}>
            <button onClick={() => canProceed() && setStep(2)} disabled={!canProceed()}
              style={{ padding:"10px 24px", background:canProceed()?"var(--primary)":"var(--border)", color:"#fff", border:"none", borderRadius:8, cursor:canProceed()?"pointer":"not-allowed", fontSize:13, fontWeight:600 }}>
              Continuer
            </button>
          </div>
        </div>
      )}

      {step === 2 && scenario && (
        <div>
          <NavButtons backLabel="Modifier les informations"/>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:"0 0 24px" }}>Récapitulatif</h1>
          <div style={{ background:"var(--bg-card)", border:"2px solid " + scenario.color + "44", borderRadius:16, padding:24, marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <span style={{ fontSize:24 }}>{scenario.icon}</span>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"var(--text-1)" }}>{scenario.label}</div>
                <div style={{ fontSize:12, color:scenario.color }}>{scenario.subtitle}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {scenario.questions.filter(q => form[q.id]).map(q => (
                <div key={q.id} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"7px 10px" }}>
                  <div style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{q.label}</div>
                  <div style={{ fontSize:12, color:"var(--text-1)", fontWeight:500 }}>{form[q.id]}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:10, padding:14, marginBottom:20 }}>
            <p style={{ fontSize:12, color:"#22c55e", fontWeight:600, margin:"0 0 3px" }}>Ce qui va se passer :</p>
            <p style={{ fontSize:12, color:"var(--text-2)", margin:0, lineHeight:1.6 }}>{scenario.message}</p>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button onClick={create} disabled={loading}
              style={{ padding:"12px 32px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:10, cursor:loading?"not-allowed":"pointer", fontSize:14, fontWeight:700, opacity:loading?0.7:1 }}>
              {loading ? "Création..." : scenario.icon + " Créer le projet"}
            </button>
          </div>
        </div>
      )}

    </div>
    </AppLayout>
  )
}
