"use client"
import AppLayout from "@/components/layout/AppLayout"
import ProGate from "@/components/ProGate"
import { useState } from "react"
import { Download, Eye, Star, FileText, BarChart3, AlertTriangle, Users, Calendar, DollarSign, CheckCircle2, BookOpen, Search } from "lucide-react"

const PACKS = [
  {
    id: "demarrage",
    icon: "🚀",
    title: "Pack Démarrage Projet",
    desc: "Tout pour lancer un projet dans les règles de l'art PMBOK 7",
    color: "#0052CC",
    bg: "#DEEBFF",
    templates: [
      { id:"charte",        icon:"🎯", title:"Charte de Projet",     desc:"Objectifs, scope, budget, équipe, risques",              tags:["Initiation","PMBOK 7"],  status:"soon" },
      { id:"raci",          icon:"👥", title:"RACI Complet",         desc:"Matrice responsabilités par phase et livrable",          tags:["Personnes","PMBOK 7"],   status:"soon" },
      { id:"agenda-kickoff",icon:"📅", title:"Agenda Kick-off",      desc:"Plan réunion de lancement structuré",                    tags:["Communication"],        status:"soon" },
      { id:"note-cadrage",  icon:"📝", title:"Note de Cadrage",      desc:"Brief projet 1 page pour CODIR — décision Go/No-Go",     tags:["Initiation","CODIR"],   status:"soon" },
    ]
  },
  {
    id: "suivi",
    icon: "📊",
    title: "Pack Suivi Opérationnel",
    desc: "Templates de reporting hebdomadaire et suivi de l'avancement",
    color: "#006644",
    bg: "#E3FCEF",
    templates: [
      { id:"dashboard-hebdo", icon:"📊", title:"Dashboard Hebdomadaire", desc:"KPIs, avancement, alertes, actions prioritaires",       tags:["Reporting","Hebdo"],    status:"ready",  file:"/templates/dashboard-hebdo.html" },
      { id:"rapport-codir",   icon:"📋", title:"Rapport CODIR",          desc:"Synthèse exécutive 1 page pour la direction",           tags:["CODIR","Direction"],   status:"ready",  file:"/templates/rapport-codir.html" },
      { id:"raid-enrichi",    icon:"⚠️", title:"Registre RAID Enrichi",  desc:"Risques + Actions + Issues + Décisions colorés",        tags:["Risques","PMBOK 7"],   status:"ready",  file:"/templates/raid-enrichi.html" },
      { id:"suivi-jalons",    icon:"🏁", title:"Suivi Jalons Visuel",     desc:"Timeline colorée avec statuts et tendances",            tags:["Planning","Jalons"],   status:"soon" },
    ]
  },
  {
    id: "finances",
    icon: "💰",
    title: "Pack Finances & Ressources",
    desc: "Suivi budgétaire EVM et gestion de la charge équipe",
    color: "#974F0C",
    bg: "#FFF7D6",
    templates: [
      { id:"budget-evm",      icon:"💰", title:"Budget EVM Visuel",       desc:"Courbes S + KPIs CPI/SPI + alertes dynamiques",         tags:["EVM","Budget"],        status:"ready",  file:"/templates/budget-evm.html" },
      { id:"plan-charge",     icon:"👤", title:"Plan de Charge",          desc:"Allocation ressources par semaine et par projet",        tags:["Ressources","RH"],     status:"soon" },
      { id:"suivi-fournisseurs",icon:"🤝",title:"Suivi Fournisseurs",     desc:"Contrats, livrables, paiements, SLA",                   tags:["Achats","Contrats"],   status:"soon" },
    ]
  },
  {
    id: "cloture",
    icon: "✅",
    title: "Pack Clôture & Qualité",
    desc: "Documents de clôture et capitalisation des connaissances",
    color: "#403294",
    bg: "#EAE6FF",
    templates: [
      { id:"lessons-learned", icon:"📚", title:"Leçons Apprises (REX)",   desc:"Capitalisation structurée par catégorie",               tags:["Clôture","Qualité"],   status:"soon" },
      { id:"checklist-cloture",icon:"✅",title:"Checklist Clôture",       desc:"30 points de vérification avant clôture officielle",     tags:["Clôture","PMBOK 7"],  status:"soon" },
      { id:"rapport-audit",   icon:"🔍", title:"Rapport d'Audit",         desc:"Conformité PMBOK 7 et analyse des écarts",              tags:["Audit","Conformité"],  status:"soon" },
    ]
  },
]

const STATUS_CFG = {
  ready: { label:"Disponible", color:"#006644", bg:"#E3FCEF" },
  soon:  { label:"Bientôt",    color:"#974F0C", bg:"#FFF7D6" },
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  const allTemplates = PACKS.flatMap(p => p.templates.map(t => ({ ...t, packId:p.id, packTitle:p.title, packColor:p.color })))
  const readyCount = allTemplates.filter(t => t.status === "ready").length
  const totalCount = allTemplates.length

  const openTemplate = (file: string) => {
    window.open(file, "_blank")
  }

  const downloadTemplate = async (file: string, title: string) => {
    const res = await fetch(file)
    const html = await res.text()
    const blob = new Blob([html], { type:"text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g,"-").toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ProGate feature="templates" featureLabel="Pack Templates Pro">
    <AppLayout>
      <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// RESSOURCES</p>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 6px" }}>
                📦 Pack Templates Pro
              </h1>
              <p style={{ fontSize:13, color:"var(--text-2)", margin:0 }}>
                Templates professionnels prêts à l'emploi · Style Jira · {readyCount}/{totalCount} disponibles
              </p>
            </div>
            <div style={{ background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r8)", padding:"10px 16px", textAlign:"right" }}>
              <p style={{ fontSize:11, color:"var(--text-2)", margin:"0 0 4px" }}>Templates disponibles</p>
              <p style={{ fontSize:24, fontWeight:700, color:"var(--primary-t)", margin:0 }}>{readyCount} <span style={{ fontSize:14, color:"var(--text-3)" }}>/ {totalCount}</span></p>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <div style={{ position:"relative", flex:1, maxWidth:380 }}>
            <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher un template..."
              style={{ width:"100%", paddingLeft:36, paddingRight:12, paddingTop:9, paddingBottom:9, border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, color:"var(--text-1)", background:"var(--card)", outline:"none" }}
              onFocus={e=>(e.target as any).style.borderColor="var(--primary)"}
              onBlur={e=>(e.target as any).style.borderColor="var(--border)"}/>
          </div>
          {["all","ready","soon"].map(f => (
            <button key={f} onClick={()=>setActiveFilter(f)}
              style={{ padding:"8px 14px", borderRadius:"var(--r8)", border:`1px solid ${activeFilter===f?"var(--primary)":"var(--border)"}`, background:activeFilter===f?"var(--primary-bg)":"var(--card)", color:activeFilter===f?"var(--primary-t)":"var(--text-2)", fontSize:12, cursor:"pointer", fontWeight:activeFilter===f?600:400 }}>
              {f==="all"?"Tous":f==="ready"?"✅ Disponibles":"⏳ À venir"}
            </button>
          ))}
        </div>

        {/* Packs */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {PACKS.map(pack => {
            const filtered = pack.templates.filter(t => {
              const matchSearch = search === "" || t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())
              const matchFilter = activeFilter === "all" || t.status === activeFilter
              return matchSearch && matchFilter
            })
            if (filtered.length === 0) return null

            return (
              <div key={pack.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", overflow:"hidden" }}>
                {/* Pack header */}
                <div style={{ padding:"16px 20px", background:pack.bg, borderBottom:`1px solid ${pack.color}22`, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:28 }}>{pack.icon}</span>
                  <div>
                    <h2 style={{ fontSize:15, fontWeight:700, color:pack.color, margin:"0 0 2px" }}>{pack.title}</h2>
                    <p style={{ fontSize:12, color:pack.color, opacity:0.7, margin:0 }}>{pack.desc}</p>
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.6)", borderRadius:20, padding:"4px 12px" }}>
                    <span style={{ fontSize:11, fontWeight:600, color:pack.color }}>
                      {pack.templates.filter(t=>t.status==="ready").length}/{pack.templates.length} disponibles
                    </span>
                  </div>
                </div>

                {/* Templates grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:0 }}>
                  {filtered.map((t, i) => {
                    const cfg = STATUS_CFG[t.status as keyof typeof STATUS_CFG]
                    const isLast = i === filtered.length - 1
                    const isReady = t.status === "ready"
                    return (
                      <div key={t.id}
                        style={{ padding:"16px 20px", borderRight: i % 3 !== 2 ? "1px solid var(--border)" : "none", borderBottom: Math.floor(i/3) < Math.floor((filtered.length-1)/3) ? "1px solid var(--border)" : "none", transition:"background 0.1s" }}
                        onMouseEnter={e=>(e.currentTarget as any).style.background="#FAFBFC"}
                        onMouseLeave={e=>(e.currentTarget as any).style.background="transparent"}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:22 }}>{t.icon}</span>
                            <div>
                              <p style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:"0 0 2px" }}>{t.title}</p>
                              <span style={{ fontSize:10, padding:"1px 7px", borderRadius:3, background:cfg.bg, color:cfg.color, fontWeight:600 }}>
                                {cfg.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize:12, color:"var(--text-2)", margin:"0 0 12px", lineHeight:1.5 }}>{t.desc}</p>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
                          {t.tags.map(tag => (
                            <span key={tag} style={{ fontSize:10, padding:"2px 7px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:3, color:"var(--text-3)" }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        {isReady && (t as any).file && (
                          <div style={{ display:"flex", gap:6 }}>
                            <button onClick={() => openTemplate((t as any).file)}
                              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"6px 0", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--r6)", fontSize:11, color:"var(--text-2)", cursor:"pointer", fontWeight:500 }}>
                              <Eye size={12}/> Aperçu
                            </button>
                            <button onClick={() => downloadTemplate((t as any).file, t.title)}
                              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"6px 0", background:pack.color, border:"none", borderRadius:"var(--r6)", fontSize:11, color:"#fff", cursor:"pointer", fontWeight:600 }}>
                              <Download size={12}/> Télécharger
                            </button>
                          </div>
                        )}
                        {!isReady && (
                          <div style={{ padding:"6px 12px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--r6)", fontSize:11, color:"var(--text-3)", textAlign:"center" }}>
                            ⏳ Disponible prochainement
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

        {/* Note */}
        <div style={{ marginTop:20, background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r8)", padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <FileText size={16} style={{ color:"var(--primary-t)", flexShrink:0 }}/>
          <p style={{ fontSize:12, color:"var(--primary-t)", margin:0 }}>
            <strong>Comment utiliser :</strong> Cliquez sur <strong>Aperçu</strong> pour visualiser le template, puis <strong>Télécharger</strong> pour obtenir le fichier HTML. Ouvrez-le dans Chrome, remplissez les champs [entre crochets], puis <strong>Ctrl+P → Enregistrer en PDF</strong>.
          </p>
        </div>

      </div>
    </AppLayout>
    </ProGate>
  )
}
