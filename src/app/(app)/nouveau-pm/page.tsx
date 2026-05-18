"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"

const PROJECT_TYPES = [
  {
    id:"migration", icon:"🖥️", title:"Migration Infrastructure",
    desc:"Migration serveurs, SGBD, middleware, ERP",
    color:"var(--primary-light)", bg:"#E6F1FB",
    examples:["Migration JBoss", "Migration Oracle → PostgreSQL", "Migration DC vers Cloud"],
    week1: [
      "📋 Récupérer le dossier d'architecture existante (As-Is)",
      "🤝 Rencontrer l'architecte technique et l'admin système",
      "📊 Cartographier les applications et leurs dépendances",
      "🔍 Identifier les contraintes : SLA, plages de maintenance, rollback",
      "📅 Valider les dates de gel et les fenêtres de migration",
    ],
    stakeholders: [
      { role:"Architecte technique", priority:"Critique", tip:"Premier contact — il connaît le SI" },
      { role:"Admin système/DBA", priority:"Critique", tip:"Clé pour les détails techniques" },
      { role:"Responsable exploitation", priority:"Élevé", tip:"Valide les plages de maintenance" },
      { role:"Directeur IT", priority:"Élevé", tip:"Sponsor technique — lever les blocages" },
      { role:"Équipes métier", priority:"Moyen", tip:"Impactées par les coupures" },
      { role:"Équipe sécurité (RSSI)", priority:"Moyen", tip:"Valide les aspects conformité" },
    ],
    documents: [
      { name:"Dossier d'architecture (DAT)", priority:"J1-J5", desc:"Comprendre le SI existant" },
      { name:"Plan de migration", priority:"S1-S2", desc:"Phases, jalons, rollback" },
      { name:"Matrice de dépendances", priority:"S1-S2", desc:"Cartographie applicative" },
      { name:"Plan de tests de non-régression", priority:"S2-S3", desc:"Validation post-migration" },
      { name:"Plan de communication", priority:"S1", desc:"Qui informe qui, quand" },
      { name:"PRA/PCA", priority:"S2-S3", desc:"Plan de reprise d'activité" },
    ],
    pitfalls: [
      "⚠️ Ne pas sous-estimer les dépendances cachées entre applications",
      "⚠️ Oublier de prévoir un plan de rollback testé et validé",
      "⚠️ Ignorer les contraintes réglementaires (RGPD, archivage légal)",
      "⚠️ Ne pas impliquer les équipes métier dans les tests de recette",
      "⚠️ Sous-estimer la durée des tests de performance post-migration",
    ],
    tools_order: ["WBS","Gantt","Jalons","RAID","Budget EVM"],
    timeline: [
      { week:"S1-S2", label:"Initialisation", tasks:["Cadrage, cartographie SI, équipe projet"] },
      { week:"S3-S6", label:"Analyse et préparation", tasks:["Architecture cible, plan de migration, tests"] },
      { week:"S7-S12", label:"Migration par lots", tasks:["Migration par vagues, tests, recette"] },
      { week:"S13-S16", label:"Stabilisation", tasks:["Monitoring, corrections, documentation"] },
    ]
  },
  {
    id:"cloud", icon:"☁️", title:"Projet Cloud / DevOps",
    desc:"Migration cloud, CI/CD, containerisation, infrastructure as code",
    color:"#0891b2", bg:"#E0F7FA",
    examples:["Migration AWS/Azure", "Mise en place CI/CD", "Containerisation Docker/K8s"],
    week1: [
      "☁️ Identifier le provider cloud retenu et les contraintes de compliance",
      "🔧 Rencontrer les DevOps/SRE existants et comprendre le stack actuel",
      "📊 Évaluer la maturité DevOps de l'équipe (CI/CD existant ?)",
      "💰 Valider le modèle de facturation cloud et les limites budgétaires",
      "🔐 Identifier les exigences de sécurité et de gouvernance cloud",
    ],
    stakeholders: [
      { role:"Lead DevOps/SRE", priority:"Critique", tip:"Votre partenaire technique principal" },
      { role:"Architecte Cloud", priority:"Critique", tip:"Définit l'architecture cible" },
      { role:"RSSI / Security", priority:"Élevé", tip:"Validation sécurité obligatoire" },
      { role:"Directeur IT", priority:"Élevé", tip:"Budget et décisions stratégiques" },
      { role:"Développeurs", priority:"Moyen", tip:"Adoptent les nouvelles pratiques" },
      { role:"Finops/DSI", priority:"Moyen", tip:"Contrôle des coûts cloud" },
    ],
    documents: [
      { name:"Cloud Landing Zone", priority:"J1-J10", desc:"Architecture cloud de référence" },
      { name:"Well-Architected Review", priority:"S1-S2", desc:"Évaluation vs best practices AWS/Azure" },
      { name:"Runbook CI/CD", priority:"S2-S3", desc:"Documentation des pipelines" },
      { name:"Security & Compliance Matrix", priority:"S1-S2", desc:"Exigences sécurité vs implémentation" },
      { name:"FinOps Dashboard", priority:"S3+", desc:"Suivi des coûts cloud" },
      { name:"Disaster Recovery Plan", priority:"S2-S3", desc:"RTO/RPO définis et testés" },
    ],
    pitfalls: [
      "⚠️ Sous-estimer les coûts cloud (data transfer, stockage, licences)",
      "⚠️ Ne pas former l'équipe aux nouvelles pratiques DevOps",
      "⚠️ Ignorer la gestion des secrets et certificats",
      "⚠️ Migrer sans définir les KPIs de performance (latence, disponibilité)",
      "⚠️ Négliger le monitoring et les alertes post-migration",
    ],
    tools_order: ["WBS","RAID","Gantt","Budget EVM","Jalons"],
    timeline: [
      { week:"S1-S2", label:"Assessment", tasks:["Audit technique, architecture cible, backlog"] },
      { week:"S3-S6", label:"Foundation", tasks:["Landing zone, CI/CD de base, sécurité"] },
      { week:"S7-S14", label:"Migration par service", tasks:["Containerisation, migration, tests"] },
      { week:"S15-S18", label:"Optimisation", tasks:["Performance, coûts, monitoring, formation"] },
    ]
  },
  {
    id:"cybersec", icon:"🔐", title:"Projet Cybersécurité",
    desc:"RGPD, ISO 27001, pentests, SOC, remédiation",
    color:"#A32D2D", bg:"#FCEBEB",
    examples:["Mise en conformité RGPD", "Certification ISO 27001", "Déploiement SOC/SIEM"],
    week1: [
      "📋 Récupérer le dernier audit de sécurité ou PSSI existante",
      "🔐 Rencontrer le RSSI et comprendre le périmètre de sécurité",
      "📊 Identifier les données sensibles et leur classification",
      "⚖️ Valider les obligations réglementaires (RGPD, LPM, NIS2...)",
      "🎯 Définir le scope : quel niveau de certification/conformité viser",
    ],
    stakeholders: [
      { role:"RSSI", priority:"Critique", tip:"Votre commanditaire technique" },
      { role:"DPO (Data Protection Officer)", priority:"Critique", tip:"Référent RGPD" },
      { role:"DSI", priority:"Élevé", tip:"Budget et décisions IT" },
      { role:"Direction Générale", priority:"Élevé", tip:"Engagement direction obligatoire" },
      { role:"Auditeurs externes", priority:"Moyen", tip:"Organisme de certification" },
      { role:"Équipes métier", priority:"Moyen", tip:"Propriétaires des données et processus" },
    ],
    documents: [
      { name:"PSSI (Politique SSI)", priority:"J1-J5", desc:"Cadre de sécurité de référence" },
      { name:"Analyse de risques (EBIOS RM)", priority:"S1-S3", desc:"Cartographie des risques sécurité" },
      { name:"Plan de traitement des risques", priority:"S2-S4", desc:"Actions correctives priorisées" },
      { name:"Registre des traitements RGPD", priority:"S1-S2", desc:"Cartographie des données personnelles" },
      { name:"Plan d'audit", priority:"S3+", desc:"Planning des tests et audits" },
      { name:"PIA (Privacy Impact Assessment)", priority:"S2-S3", desc:"RGPD pour projets à risque élevé" },
    ],
    pitfalls: [
      "⚠️ Traiter la sécurité comme un projet one-shot plutôt que continu",
      "⚠️ Ne pas impliquer la Direction Générale dès le début",
      "⚠️ Sous-estimer la conduite du changement (formations, sensibilisation)",
      "⚠️ Confondre conformité et sécurité réelle",
      "⚠️ Négliger la gestion des incidents et le plan de réponse",
    ],
    tools_order: ["RAID","WBS","Jalons","Gantt","Documents"],
    timeline: [
      { week:"S1-S3", label:"Diagnostic", tasks:["Audit, analyse de risques, périmètre"] },
      { week:"S4-S8", label:"Plan de remédiation", tasks:["Priorisation, feuille de route, budget"] },
      { week:"S9-S20", label:"Mise en oeuvre", tasks:["Contrôles techniques et organisationnels"] },
      { week:"S21-S24", label:"Certification", tasks:["Audit, certification, surveillance continue"] },
    ]
  },
  {
    id:"dev", icon:"📱", title:"Développement Applicatif",
    desc:"Application web, mobile, API, refonte SI, ERP",
    color:"#3C3489", bg:"#EEEDFE",
    examples:["Application mobile","Portail web client","Refonte ERP","API REST"],
    week1: [
      "📋 Récupérer les spécifications fonctionnelles ou cas d'usage existants",
      "👥 Rencontrer les Product Owners et utilisateurs clés",
      "🏗️ Comprendre l'architecture technique existante et les contraintes d'intégration",
      "📊 Évaluer la maturité Agile de l'équipe et les outils en place",
      "🎯 Valider les critères de succès : performance, UX, accessibilité",
    ],
    stakeholders: [
      { role:"Product Owner (client)", priority:"Critique", tip:"Source des besoins fonctionnels" },
      { role:"Lead développeur/Architecte", priority:"Critique", tip:"Référent technique" },
      { role:"UX/UI Designer", priority:"Élevé", tip:"Expérience utilisateur" },
      { role:"Testeurs/QA", priority:"Élevé", tip:"Qualité et recette" },
      { role:"Utilisateurs finaux", priority:"Moyen", tip:"Tests d'acceptation utilisateurs (UAT)" },
      { role:"Support/Exploitation", priority:"Moyen", tip:"Préparent la mise en production" },
    ],
    documents: [
      { name:"Product Backlog initial", priority:"J1-J5", desc:"Liste priorisée des besoins" },
      { name:"Architecture Decision Records (ADR)", priority:"S1-S2", desc:"Décisions techniques documentées" },
      { name:"DoD + DoR", priority:"S1", desc:"Critères de terminé et de prêt" },
      { name:"Plan de tests", priority:"S1-S2", desc:"Stratégie de test et d'automatisation" },
      { name:"Plan de déploiement", priority:"S3+", desc:"Stratégie de mise en production" },
      { name:"Documentation API", priority:"S2+", desc:"OpenAPI/Swagger pour les intégrations" },
    ],
    pitfalls: [
      "⚠️ Démarrer le développement sans Product Backlog priorisé",
      "⚠️ Négliger les tests (automatisation, performance, sécurité)",
      "⚠️ Scope creep : accepter des ajouts sans gestion des changements",
      "⚠️ Ne pas impliquer les utilisateurs dans les tests d'acceptation",
      "⚠️ Sous-estimer le temps de mise en production et de stabilisation",
    ],
    tools_order: ["WBS","Gantt","RAID","Jalons","Budget EVM"],
    timeline: [
      { week:"S1-S2", label:"Inception", tasks:["Backlog, architecture, équipe, environnements"] },
      { week:"S3-S16", label:"Sprints de développement", tasks:["Itérations de 2 semaines, démos, rétros"] },
      { week:"S17-S18", label:"Recette / UAT", tasks:["Tests utilisateurs, corrections, validation"] },
      { week:"S19-S20", label:"Déploiement", tasks:["Mise en production, formation, support"] },
    ]
  },
  {
    id:"transfo", icon:"🔄", title:"Transformation Digitale",
    desc:"Conduite du changement, digitalisation, SI, BPM",
    color:"#854F0B", bg:"#FAEEDA",
    examples:["Digitalisation RH","Refonte SI achats","Déploiement ERP SAP","BPO"],
    week1: [
      "🎯 Comprendre la vision stratégique et les objectifs business de la transformation",
      "👥 Cartographier les parties prenantes : qui est impacté, qui résiste",
      "📊 Évaluer le niveau de maturité digitale actuel de l'organisation",
      "🔄 Identifier les processus métier à transformer en priorité",
      "💡 Rencontrer les sponsors et champions du changement",
    ],
    stakeholders: [
      { role:"Direction Générale/COMEX", priority:"Critique", tip:"Portent la vision — engagement visible" },
      { role:"Directeurs métier impactés", priority:"Critique", tip:"Champions ou résistants potentiels" },
      { role:"DSI", priority:"Élevé", tip:"Fournit les solutions techniques" },
      { role:"DRH", priority:"Élevé", tip:"Gère l'impact RH et formations" },
      { role:"Managers de proximité", priority:"Élevé", tip:"Relais du changement sur le terrain" },
      { role:"Utilisateurs finaux", priority:"Moyen", tip:"Impactés au quotidien" },
    ],
    documents: [
      { name:"Business Case", priority:"J1-J5", desc:"Valeur attendue, ROI, cas pour le changement" },
      { name:"Cartographie des processus (AS-IS/TO-BE)", priority:"S1-S3", desc:"État actuel et futur" },
      { name:"Plan de conduite du changement", priority:"S1-S2", desc:"ADKAR ou Kotter — roadmap humaine" },
      { name:"Plan de communication", priority:"S1", desc:"Messages clés par audience" },
      { name:"Plan de formation", priority:"S3-S4", desc:"Compétences à développer" },
      { name:"Tableau de bord de transformation", priority:"S2+", desc:"KPIs adoption et valeur réalisée" },
    ],
    pitfalls: [
      "⚠️ Traiter la transformation comme un projet IT et non un projet de changement humain",
      "⚠️ Négliger la résistance au changement — la gérer proactivement",
      "⚠️ Ne pas mesurer l'adoption réelle des nouvelles pratiques",
      "⚠️ Manque de communication : les gens n'aiment pas les surprises",
      "⚠️ Aller trop vite sans consolider les acquis (changement ne se décrète pas)",
    ],
    tools_order: ["Jalons","RAID","WBS","Documents","Gantt"],
    timeline: [
      { week:"S1-S4", label:"Diagnostic & Vision", tasks:["État actuel, vision cible, business case"] },
      { week:"S5-S10", label:"Design & Préparation", tasks:["Conception, formation, pilote"] },
      { week:"S11-S24", label:"Déploiement par vagues", tasks:["Déploiement progressif, support"] },
      { week:"S25-S28", label:"Ancrage", tasks:["Consolidation, mesure valeur, pérennisation"] },
    ]
  },
]

const UNIVERSAL = {
  j1: [
    "📋 Lire la charte de projet ou la lettre de mission si elle existe",
    "🤝 Rencontrer votre sponsor et comprendre ses attentes et critères de succès",
    "👥 Identifier les membres clés de l'équipe et prendre les premiers contacts",
    "🔍 Demander les documents existants : contrats, études préalables, historique",
    "📊 Comprendre les contraintes majeures : budget, deadline, scope non-négociable",
    "🗓️ Planifier votre semaine 1 : qui voir, dans quel ordre",
  ],
  questions: {
    sponsor: ["Quel est votre critère #1 de succès pour ce projet ?","Quels sont vos 3 principaux risques ?","Quels obstacles prévoyez-vous ?","À quelle fréquence souhaitez-vous être informé ?"],
    team: ["Quelle est votre disponibilité réelle sur ce projet ?","Avez-vous des contraintes ou indisponibilités prévues ?","Quelles sont vos compétences clés pour ce projet ?","Y a-t-il des sujets sensibles que je dois connaître ?"],
    client: ["Qu'est-ce qui a motivé ce projet maintenant ?","Quelles sont vos expériences passées avec ce type de projet ?","Qui est l'utilisateur final et comment le rejoindre ?","Comment mesurez-vous la réussite de ce projet ?"],
  }
}

export default function NouveauPMPage() {
  const [selectedType, setSelectedType] = useState<string|null>(null)
  const [activeTab, setActiveTab] = useState("week1")
  const proj = PROJECT_TYPES.find(p => p.id === selectedType)

  return (
    <AppLayout>
      <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>

        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// GUIDE PRATIQUE</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 4px" }}>🚀 Guide du Nouveau Chef de Projet IT</h1>
              <p style={{ fontSize:13, color:"var(--text-2)", margin:0 }}>Vous démarrez votre premier projet ? Voici votre guide pas à pas selon le type de projet.</p>
            </div>
            <Link href="/pmp-simulator" style={{ padding:"7px 14px", background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r8)", fontSize:12, color:"var(--primary-t)", textDecoration:"none", fontWeight:500 }}>
              🎯 Simulateur PMP
            </Link>
          </div>
        </div>

        {/* Guide universel Jour 1 */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:20, marginBottom:20 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:20, background:"var(--primary)", borderRadius:2 }}/>
            📅 Votre Jour 1 — Actions universelles (tout type de projet)
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:16 }}>
            {UNIVERSAL.j1.map((item,i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", background:"var(--bg)", borderRadius:"var(--r8)", border:"1px solid var(--border)" }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"var(--primary-bg)", border:"1px solid #B5D4F4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"var(--primary-t)", flexShrink:0 }}>{i+1}</div>
                <p style={{ fontSize:12, color:"var(--text-1)", margin:0, lineHeight:1.5 }}>{item}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:"16px 0 10px" }}>❓ Questions à poser dès la semaine 1</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {Object.entries(UNIVERSAL.questions).map(([who, qs]) => (
              <div key={who} style={{ background:"var(--bg)", borderRadius:"var(--r8)", padding:"12px 14px", border:"1px solid var(--border)" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"var(--primary-t)", textTransform:"uppercase", letterSpacing:"0.5px", margin:"0 0 8px" }}>
                  {who === "sponsor" ? "🎯 Au sponsor" : who === "team" ? "👥 À l'équipe" : "💼 Au client"}
                </p>
                {qs.map((q,i) => (
                  <div key={i} style={{ fontSize:11, color:"var(--text-2)", padding:"4px 0", borderBottom:i<qs.length-1?"1px solid var(--border)":"none" }}>
                    → {q}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Sélection type de projet */}
        <div style={{ marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>
            🎯 Sélectionnez votre type de projet pour le guide détaillé
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
            {PROJECT_TYPES.map(pt => (
              <button key={pt.id} onClick={() => setSelectedType(pt.id === selectedType ? null : pt.id)}
                style={{ padding:"14px 10px", background:selectedType===pt.id?pt.bg:"var(--card)", border:`1.5px solid ${selectedType===pt.id?pt.color:"var(--border)"}`, borderRadius:"var(--r8)", cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}
                onMouseEnter={e=>{ if(selectedType!==pt.id)(e.currentTarget as any).style.borderColor=pt.color }}
                onMouseLeave={e=>{ if(selectedType!==pt.id)(e.currentTarget as any).style.borderColor="var(--border)" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{pt.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color:selectedType===pt.id?pt.color:"var(--text-1)" }}>{pt.title}</div>
                <div style={{ fontSize:10, color:"var(--text-3)", marginTop:4, lineHeight:1.4 }}>{pt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Guide détaillé par type */}
        {proj && (
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", overflow:"hidden" }}>
            {/* Header */}
            <div style={{ padding:"16px 20px", background:proj.bg, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:32 }}>{proj.icon}</span>
              <div>
                <h2 style={{ fontSize:17, fontWeight:700, color:proj.color, margin:"0 0 2px" }}>{proj.title}</h2>
                <p style={{ fontSize:12, color:proj.color, opacity:0.7, margin:"0 0 6px" }}>Exemples : {proj.examples.join(" · ")}</p>
                <div style={{ display:"flex", gap:6 }}>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", background:"rgba(255,255,255,0.5)", borderRadius:10, color:proj.color }}>
                    Outils prioritaires : {proj.tools_order.join(" → ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--border)", background:"var(--bg)" }}>
              {[
                { key:"week1",   label:"📅 Semaine 1" },
                { key:"stakes",  label:"👥 Parties prenantes" },
                { key:"docs",    label:"📋 Documents clés" },
                { key:"pitfalls",label:"⚠️ Pièges à éviter" },
                { key:"timeline",label:"🗓️ Timeline type" },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ padding:"10px 16px", background:activeTab===tab.key?"var(--card)":"transparent", border:"none", borderBottom:activeTab===tab.key?`2px solid ${proj.color}`:"2px solid transparent", cursor:"pointer", fontSize:12, fontWeight:activeTab===tab.key?600:400, color:activeTab===tab.key?proj.color:"var(--text-2)", transition:"all 0.12s" }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding:20 }}>
              {/* Semaine 1 */}
              {activeTab === "week1" && (
                <div>
                  <h3 style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:"0 0 12px" }}>Actions prioritaires de votre semaine 1</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {proj.week1.map((item,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", background:"var(--bg)", borderRadius:"var(--r8)", border:"1px solid var(--border)" }}>
                        <div style={{ width:24, height:24, borderRadius:"50%", background:proj.bg, border:`1px solid ${proj.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:proj.color, flexShrink:0 }}>{i+1}</div>
                        <p style={{ fontSize:13, color:"var(--text-1)", margin:0, lineHeight:1.5 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parties prenantes */}
              {activeTab === "stakes" && (
                <div>
                  <h3 style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:"0 0 12px" }}>Qui rencontrer et dans quel ordre</h3>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                    {proj.stakeholders.map((s,i) => (
                      <div key={i} style={{ padding:"12px 14px", background:"var(--bg)", borderRadius:"var(--r8)", border:`1px solid ${s.priority==="Critique"?proj.color:"var(--border)"}`, borderLeft:`4px solid ${s.priority==="Critique"?proj.color:s.priority==="Élevé"?"#854F0B":"var(--border)"}` }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                          <p style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:0 }}>{s.role}</p>
                          <span style={{ fontSize:9, padding:"2px 7px", background:s.priority==="Critique"?proj.bg:s.priority==="Élevé"?"#FAEEDA":"var(--bg)", color:s.priority==="Critique"?proj.color:s.priority==="Élevé"?"#854F0B":"var(--text-3)", borderRadius:10, fontWeight:700 }}>{s.priority}</span>
                        </div>
                        <p style={{ fontSize:11, color:"var(--text-2)", margin:0 }}>💡 {s.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {activeTab === "docs" && (
                <div>
                  <h3 style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:"0 0 12px" }}>Documents essentiels à produire</h3>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ background:"var(--bg)", borderBottom:"1px solid var(--border)" }}>
                        {["Document","À produire","Objectif"].map(h=>(
                          <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:10, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {proj.documents.map((d,i) => (
                        <tr key={i} style={{ borderBottom:"1px solid var(--border)", background:i%2===0?"#fff":"var(--bg)" }}>
                          <td style={{ padding:"10px 12px", fontWeight:600, color:"var(--text-1)" }}>{d.name}</td>
                          <td style={{ padding:"10px 12px" }}>
                            <span style={{ padding:"2px 8px", background:proj.bg, color:proj.color, borderRadius:10, fontSize:11, fontWeight:600 }}>{d.priority}</span>
                          </td>
                          <td style={{ padding:"10px 12px", color:"var(--text-2)" }}>{d.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pièges */}
              {activeTab === "pitfalls" && (
                <div>
                  <h3 style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:"0 0 12px" }}>Top 5 des pièges à éviter sur ce type de projet</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {proj.pitfalls.map((p,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", background:"#FCEBEB", border:"1px solid #FCA5A5", borderLeft:"4px solid #E24B4A", borderRadius:"var(--r8)" }}>
                        <span style={{ fontSize:20, flexShrink:0 }}>⚠️</span>
                        <p style={{ fontSize:13, color:"#A32D2D", margin:0, lineHeight:1.5 }}>{p.replace("⚠️ ","")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {activeTab === "timeline" && (
                <div>
                  <h3 style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:"0 0 12px" }}>Timeline type pour ce projet</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                    {proj.timeline.map((phase,i) => (
                      <div key={i} style={{ display:"flex", gap:16, position:"relative" }}>
                        {/* Timeline bar */}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:60, flexShrink:0 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:proj.bg, border:`2px solid ${proj.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:proj.color, zIndex:1 }}>{i+1}</div>
                          {i < proj.timeline.length-1 && <div style={{ width:2, flex:1, background:`${proj.color}44`, minHeight:20, margin:"4px 0" }}/>}
                        </div>
                        <div style={{ flex:1, paddingBottom:20 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                            <span style={{ fontSize:11, padding:"2px 8px", background:proj.bg, color:proj.color, borderRadius:10, fontWeight:700 }}>{phase.week}</span>
                            <span style={{ fontSize:14, fontWeight:600, color:"var(--text-1)" }}>{phase.label}</span>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            {phase.tasks.map((t,j) => (
                              <div key={j} style={{ fontSize:12, color:"var(--text-2)", display:"flex", alignItems:"center", gap:6 }}>
                                <div style={{ width:4, height:4, borderRadius:"50%", background:proj.color, flexShrink:0 }}/>
                                {t}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:20 }}>
          {[
            { href:"/guide", icon:"✨", title:"Guide CP IA", desc:"Créer votre 1er projet avec l'IA", color:"#854F0B", bg:"#FAEEDA" },
            { href:"/pmp-simulator", icon:"🎯", title:"Simulateur PMP", desc:"Testez vos connaissances PMBOK 7", color:"var(--primary-light)", bg:"#E6F1FB" },
            { href:"/pmp-conseils", icon:"📖", title:"Conseils PMP", desc:"Guide complet pour réussir l'examen", color:"#27500A", bg:"#EAF3DE" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:item.bg, border:`1px solid ${item.color}44`, borderRadius:"var(--r8)", textDecoration:"none", transition:"all 0.15s" }}
              onMouseEnter={e=>(e.currentTarget as any).style.transform="translateY(-2px)"}
              onMouseLeave={e=>(e.currentTarget as any).style.transform="none"}>
              <span style={{ fontSize:28 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:item.color, margin:"0 0 2px" }}>{item.title}</p>
                <p style={{ fontSize:11, color:"var(--text-2)", margin:0 }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
