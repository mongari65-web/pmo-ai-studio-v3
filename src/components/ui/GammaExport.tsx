"use client"
import { useState } from "react"
import { Copy, Check, Sparkles, X } from "lucide-react"
import { toast } from "sonner"

interface GammaExportProps {
  type: "codir"|"fiche-mission"|"gantt"|"raid"|"okr"|"scrum"|"onboarding"|"formation"
  projectName: string
  data: any
}

function buildGammaPrompt(type: string, projectName: string, data: any): string {
  const base = `Tu es un expert en communication professionnelle et design de présentation. Crée une présentation Gamma AI ${getDocType(type)} pour le projet "${projectName}". 

STYLE : Professionnel, moderne, dark theme avec accents violets (#7B5EFF). Icônes emoji pour illustrer chaque section. Données chiffrées en grand format. Graphiques et tableaux quand pertinent.

FORMAT : Slides bien structurées, texte concis, visuels percutants. Maximum 3 points clés par slide.`

  switch(type) {
    case "codir":
      const cpi = data?.cpi ?? "N/A"
      const spi = data?.spi ?? "N/A"
      const rag = data?.rag ?? "VERT"
      const completion = data?.completion ?? 0
      const raidCrit = data?.raidCrit ?? 0
      const jalons = data?.jalons ?? []
      return `${base}

TYPE DE DOCUMENT : Rapport de Comité de Pilotage (CODIR) — 8 slides

DONNÉES DU PROJET :
- Nom : ${projectName}
- Avancement global : ${completion}%
- Statut RAG : ${rag}
- CPI (Performance Budget) : ${cpi} ${Number(cpi) < 1 ? "⚠️ DÉPASSEMENT" : "✅ OK"}
- SPI (Performance Délais) : ${spi} ${Number(spi) < 1 ? "⚠️ RETARD" : "✅ OK"}
- Risques critiques ouverts : ${raidCrit}
- Jalons à venir : ${jalons.map((j:any) => j.name + " (" + j.daysLeft + "j)").join(", ") || "Aucun"}

STRUCTURE DES SLIDES :
1. 🎯 SLIDE TITRE — Nom projet, date, statut RAG en grand, badge équipe
2. 📊 TABLEAU DE BORD — 6 KPIs en cartes : Avancement, CPI, SPI, Budget, Risques, Score santé
3. 💰 PERFORMANCE BUDGET — Graphique EVM (PV/EV/AC), analyse CPI, prévision EAC
4. ⏱️ PERFORMANCE DÉLAIS — Courbe S, SPI, jalons en retard vs planifiés
5. ⚠️ RISQUES CRITIQUES — Top 3 risques avec impact/probabilité, plan de mitigation
6. 🏁 JALONS — Timeline visuelle des prochaines échéances, statuts colorés
7. 📌 DÉCISIONS DEMANDÉES — Liste des points soumis au CODIR pour validation
8. 🎯 PROCHAINES ÉTAPES — Actions prioritaires, responsables, délais

INSTRUCTIONS GAMMA : Utilise des couleurs sémantiques (vert=ok, orange=attention, rouge=alerte). Mets les chiffres clés en très grand. Ajoute des émojis de statut.`

    case "fiche-mission":
      const fiche = data?.fiche ?? {}
      return `${base}

TYPE DE DOCUMENT : Fiche de Mission — Offre de services — 6 slides

DONNÉES :
- Intitulé mission : ${fiche.intitule || projectName}
- Client : ${fiche.client || "À définir"}
- Chef de Projet : ${fiche.chefProjet || "CP Senior"}
- Budget : ${fiche.budget || "Sur devis"}
- Durée : ${fiche.duree || "À définir"}
- Contexte : ${fiche.contexte || data?.description || "Projet complexe nécessitant expertise senior"}
- Objectif principal : ${fiche.objectifPrincipal || "Livrer le projet dans les délais et le budget"}
- Livrables : ${(fiche.livrables || []).map((l:any) => l.titre).join(", ") || "À définir"}

STRUCTURE DES SLIDES :
1. 🎯 PAGE DE GARDE — Logo client, titre mission, date, chef de projet avec photo/avatar
2. 🌍 CONTEXTE & ENJEUX — Situation actuelle, problématique, enjeux business
3. 📋 PÉRIMÈTRE & OBJECTIFS — Ce qui est inclus/exclu, objectifs SMART, KPIs de succès
4. 📦 LIVRABLES & PLANNING — Timeline des livrables, dates clés, jalons
5. 👥 ÉQUIPE & GOUVERNANCE — Organigramme projet, RACI simplifié, instances
6. 💼 BUDGET & CONDITIONS — Enveloppe budgétaire, modalités, prochaines étapes

STYLE : Cabinet conseil haut de gamme, sobre et professionnel, couleurs corporate.`

    case "raid":
      const items = data?.items ?? []
      const critiques = items.filter((i:any) => i.priority === "Critique" && i.status === "Ouvert")
      const hautes = items.filter((i:any) => i.priority === "Haute" && i.status === "Ouvert")
      return `${base}

TYPE DE DOCUMENT : Rapport RAID — Registre des Risques & Actions — 7 slides

DONNÉES :
- Projet : ${projectName}
- Total items RAID : ${items.length}
- Risques critiques : ${critiques.length}
- Risques hautes priorités : ${hautes.length}
- Top risques critiques : ${critiques.slice(0,3).map((r:any) => r.title + " (impact: " + r.impact + ")").join(" | ") || "Aucun"}

STRUCTURE :
1. 🎯 SYNTHÈSE RAID — Dashboard : total risques, par catégorie, par statut (graphique donut)
2. 🔴 RISQUES CRITIQUES — Tableau détaillé top 5, matrice impact/probabilité
3. 🟡 RISQUES HAUTES PRIORITÉS — Actions en cours, responsables, délais
4. 📋 REGISTRE DES ACTIONS — Tableau actions ouvertes, % completion, owner
5. ✅ ACTIONS RÉSOLUES — Ce qui a été traité ce mois, bilan
6. 🔄 PLAN DE MITIGATION — Stratégies pour top 3 risques critiques
7. 📊 TENDANCES — Évolution du nombre de risques, KPIs RAID

STYLE : Rouge/Orange pour risques critiques, vert pour résolu, tableau de bord dynamique.`

    case "okr":
      const objectives = data?.objectives ?? []
      const avgProg = objectives.length ? Math.round(objectives.reduce((s:number,o:any) => {
        const krs = o.keyResults ?? []
        const p = krs.length ? Math.round(krs.reduce((sp:number,kr:any) => sp + (kr.target>0?Math.min(100,Math.round(kr.current/kr.target*100)):0), 0)/krs.length) : 0
        return s + p
      }, 0) / objectives.length) : 0
      return `${base}

TYPE DE DOCUMENT : Rapport OKR — Objectifs & Résultats Clés — 6 slides

DONNÉES :
- Projet : ${projectName}
- Nombre d'objectifs : ${objectives.length}
- Progression moyenne : ${avgProg}%
- Objectifs : ${objectives.map((o:any) => o.title + " (" + o.quarter + ")").join(" | ") || "À définir"}

STRUCTURE :
1. 🎯 VUE D'ENSEMBLE OKR — Score global, nb objectifs, on track vs at risk
2. 📊 TABLEAU DE BORD — Radar chart par catégorie, progression par trimestre
3. 🟢 OBJECTIFS ON TRACK — Détail des objectifs >70% avec KRs
4. 🟡 OBJECTIFS À RISQUE — Objectifs <40%, analyse des blocages
5. 📈 ÉVOLUTION — Courbe de progression, vélocité d'avancement
6. 🎯 PROCHAINES ACTIONS — Focus Q prochain, priorités, responsables

STYLE : Graphiques de progression, barres de complétion colorées, dashboard moderne.`

    case "scrum":
      return `${base}

TYPE DE DOCUMENT : Guide de Formation Scrum/Agile — Tutoriel — 10 slides

CONTEXTE : Formation équipe projet ${projectName} aux méthodes Agile et Scrum

STRUCTURE :
1. 🚀 INTRODUCTION — Pourquoi Agile ? Manifeste Agile, 4 valeurs, 12 principes
2. 🔁 LE FRAMEWORK SCRUM — Vue d'ensemble : rôles, artefacts, cérémonies (schéma)
3. 👥 LES 3 RÔLES — Product Owner, Scrum Master, Dev Team — responsabilités
4. 📋 LES ARTEFACTS — Product Backlog, Sprint Backlog, Incrément, DoD
5. 📅 SPRINT PLANNING — Comment planifier un sprint, story points, vélocité
6. ☀️ DAILY SCRUM — Les 3 questions, 15 minutes, règles d'or
7. 🔍 SPRINT REVIEW — Comment faire une démo efficace, collecter feedbacks
8. 🔄 RÉTROSPECTIVE — Formats (Start/Stop/Continue), 4 étapes, actions
9. 📊 MÉTRIQUES AGILE — Burndown, vélocité, CFD, cycle time
10. 🎯 MISE EN PRATIQUE — Checklist démarrage Scrum, outils recommandés, PMO AI Studio

STYLE : Pédagogique, coloré, schémas illustratifs, exemples concrets du projet ${projectName}.`

    case "formation":
      return `${base}

TYPE DE DOCUMENT : Support de Formation Gestion de Projet — 12 slides

CONTEXTE : Préparation certification chef de projet pour chef de projet ${projectName}

STRUCTURE :
1. 🎓 INTRODUCTION PMP — Qu'est-ce que le PMP, statistiques, valeur du diplôme
2. 📚 standards de gestion de projet — Les 12 principes, 8 domaines de performance
3. 👥 DOMAINE PERSONNES — Leadership, gestion équipe, stakeholders (42%)
4. ⚙️ DOMAINE PROCESSUS — Planification, exécution, contrôle (50%)
5. 🌍 DOMAINE ENVIRONNEMENT — Stratégie, valeur business (8%)
6. 🔄 APPROCHES HYBRIDES — Prédictif vs Agile, quand utiliser quoi
7. 📊 EVM & MÉTRIQUES — CPI, SPI, EAC, TCPI — formules et exercices
8. ⚠️ GESTION DES RISQUES — Identification, analyse, réponse aux risques
9. 💡 TIPS EXAMEN — Stratégies, pièges à éviter, mindset PMI
10. 🎯 PLAN DE PRÉPARATION — 90 jours pour réussir, ressources recommandées
11. ❓ QUIZ PRATIQUE — 10 questions types examen avec explications
12. 🚀 PROCHAINES ÉTAPES — Comment s'inscrire, PMO AI Studio simulateur

STYLE : Académique mais moderne, schémas mnémotechniques, couleurs PMI (bleu marine).`

    default:
      return `${base}

TYPE DE DOCUMENT : Présentation projet ${projectName} — 8 slides

STRUCTURE :
1. 🎯 PAGE TITRE — Nom projet, description, équipe, date
2. 🌍 CONTEXTE — Situation, enjeux, objectifs
3. 📋 PÉRIMÈTRE — Ce qui est inclus, exclusions, contraintes
4. 📅 PLANNING — Timeline, jalons clés, phases
5. 👥 ÉQUIPE — Rôles, responsabilités, RACI
6. 💰 BUDGET — Enveloppe, répartition, suivi
7. ⚠️ RISQUES — Top risques, plan de mitigation
8. 🎯 PROCHAINES ÉTAPES — Actions, responsables, délais`
  }
}

function getDocType(type: string): string {
  const types: Record<string,string> = {
    "codir": "Rapport CODIR/COPIL",
    "fiche-mission": "Fiche de Mission",
    "raid": "Rapport RAID/Risques",
    "okr": "Rapport OKR",
    "scrum": "Guide Formation Scrum",
    "formation": "Support Formation Gestion de Projet",
    "gantt": "Présentation Planning",
    "onboarding": "Présentation Onboarding"
  }
  return types[type] ?? "Présentation"
}

export default function GammaExport({ type, projectName, data }: GammaExportProps) {
  const [open, setOpen]     = useState(false)
  const [copied, setCopied] = useState(false)

  const prompt = buildGammaPrompt(type, projectName, data)

  const copy = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
    toast.success("Prompt Gamma copié ! Collez-le sur gamma.new")
  }

  return (
    <>
      {/* Bouton déclencheur */}
      <button onClick={() => setOpen(true)}
        style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"linear-gradient(135deg,rgba(123,94,255,0.15),rgba(99,153,34,0.1))", border:"1px solid rgba(123,94,255,0.4)", borderRadius:8, fontSize:12, fontWeight:600, color:"var(--primary-light)", cursor:"pointer", whiteSpace:"nowrap" }}>
        <Sparkles size={13}/> Export Gamma AI
      </button>

      {/* Modal */}
      {open && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={e => { if(e.target===e.currentTarget) setOpen(false) }}>
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:16, padding:"24px", maxWidth:640, width:"100%", maxHeight:"80vh", display:"flex", flexDirection:"column", gap:14, boxShadow:"0 0 60px rgba(123,94,255,0.2)" }}>

            {/* Header modal */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:"var(--text-1)", display:"flex", alignItems:"center", gap:8 }}>
                  <Sparkles size={18} style={{ color:"var(--primary-light)" }}/> Export vers Gamma AI
                </div>
                <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{getDocType(type)} · {projectName}</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-3)" }}><X size={18}/></button>
            </div>

            {/* Instructions */}
            <div style={{ background:"rgba(123,94,255,0.06)", border:"1px solid rgba(123,94,255,0.2)", borderRadius:10, padding:"10px 14px" }}>
              <p style={{ fontSize:12, fontWeight:600, color:"var(--primary-light)", margin:"0 0 6px" }}>📋 Comment utiliser :</p>
              <ol style={{ margin:0, paddingLeft:18, fontSize:12, color:"var(--text-2)", lineHeight:1.8 }}>
                <li>Copiez le prompt ci-dessous</li>
                <li>Ouvrez <a href="https://gamma.app/create" target="_blank" rel="noopener noreferrer" style={{ color:"var(--primary-light)", fontWeight:600 }}>gamma.app/create</a></li>
                <li>Choisissez "Générer avec l'IA" → "Coller un texte"</li>
                <li>Collez le prompt et laissez Gamma générer ✨</li>
              </ol>
            </div>

            {/* Prompt */}
            <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text-2)" }}>Prompt optimisé pour Gamma :</div>
              <div style={{ flex:1, overflowY:"auto", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"12px", fontSize:11, color:"var(--text-2)", lineHeight:1.6, fontFamily:"monospace", whiteSpace:"pre-wrap", maxHeight:300 }}>
                {prompt}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={copy} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", background:copied?"#22c55e":"var(--primary)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", transition:"background 0.2s" }}>
                {copied ? <><Check size={14}/> Prompt copié !</> : <><Copy size={14}/> Copier le prompt</>}
              </button>
              <a href="https://gamma.app/create" target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", background:"rgba(123,94,255,0.1)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:9, fontSize:13, fontWeight:600, color:"var(--primary-light)", textDecoration:"none" }}>
                <Sparkles size={13}/> Ouvrir Gamma
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
