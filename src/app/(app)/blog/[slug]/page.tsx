"use client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Clock, ArrowLeft, ArrowRight, ExternalLink, BookOpen, Tag } from "lucide-react"
import { ARTICLES, CATEGORIES } from "@/lib/blog-data"

// ── Contenu des articles ─────────────────────────────────────────────────────

function ArticleEVM() {
  return (
    <div>
      <p style={P}>Imaginez : votre projet de rénovation de l'Hôtel Atlantis à Marrakech avance. Nous sommes en mai 2026. Le client vous demande un rapport. Vous ouvrez PMO AI Studio et vous voyez :</p>

      {/* Screenshot réel */}
      <div style={IMG_WRAP}>
        <img src="/blog/images/evm-courbe-s.png" alt="Courbe S EVM — Budget EVM Hôtel Atlantis" style={IMG}/>
        <p style={IMG_CAP}>📊 Courbe S EVM réelle — Rénovation Grand Hôtel Atlantis · PMO AI Studio</p>
      </div>

      <div style={ALERT_RED}>
        <strong>⚠️ Alerte :</strong> CPI = 0.93 · SPI = 0.85 · EAC = 2.7M€ pour un BAC de 2.5M€ · CV = -70 700€ · SV = -172 500€
      </div>

      <h2 style={H2}>🔢 Les 6 indicateurs EVM que tout CP doit maîtriser</h2>

      {/* Tableau formules */}
      <div style={TABLE_WRAP}>
        <table style={TABLE}>
          <thead>
            <tr style={TR_HEAD}>
              <th style={TH}>Indicateur</th><th style={TH}>Formule</th><th style={TH}>Interprétation</th><th style={TH}>Notre projet</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["CPI — Cost Perf. Index","EV / AC","< 1 = dépassement budget","0.93 🟡"],
              ["SPI — Schedule Perf. Index","EV / PV","< 1 = retard planning","0.85 🔴"],
              ["CV — Cost Variance","EV - AC","Négatif = surcoût","-70 700€ 🔴"],
              ["SV — Schedule Variance","EV - PV","Négatif = retard","-172 500€ 🔴"],
              ["EAC — Estimate at Completion","BAC / CPI","Prévision coût final","2.7M€ 🔴"],
              ["TCPI","(BAC-EV)/(BAC-AC)","Perf. nécessaire pour finir","1.05 🟡"],
            ].map(([ind,form,interp,val],i) => (
              <tr key={i} style={{ background:i%2===0?"var(--bg-card)":"var(--bg)", borderBottom:"1px solid var(--border)" }}>
                <td style={TD}><strong style={{ color:"var(--primary-light)" }}>{ind}</strong></td>
                <td style={TD}><code style={{ background:"rgba(123,94,255,0.1)", padding:"2px 6px", borderRadius:4, fontSize:12 }}>{form}</code></td>
                <td style={TD}>{interp}</td>
                <td style={TD}><strong>{val}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={H2}>📈 La Courbe S — Visualiser la performance en un coup d'œil</h2>
      <p style={P}>La courbe S est le graphique le plus puissant du management de projet. Elle affiche simultanément :</p>

      {/* Légende courbe S */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, margin:"16px 0 24px" }}>
        {[
          { color:"#3b82f6", label:"PV — Planned Value", desc:"Ce qui était prévu d'être fait. La baseline de référence." },
          { color:"#7B5EFF", label:"EV — Earned Value", desc:"La valeur du travail réellement accompli. Votre performance réelle." },
          { color:"#f59e0b", label:"AC — Actual Cost", desc:"Ce qui a été réellement dépensé. Toujours supérieur à EV si CPI < 1." },
        ].map(k => (
          <div key={k.label} style={{ background:`${k.color}11`, border:`1px solid ${k.color}33`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <div style={{ width:20, height:4, borderRadius:2, background:k.color }}/>
              <strong style={{ fontSize:12, color:k.color }}>{k.label}</strong>
            </div>
            <p style={{ fontSize:11, color:"var(--text-3)", margin:0, lineHeight:1.5 }}>{k.desc}</p>
          </div>
        ))}
      </div>

      <h2 style={H2}>🚨 Quand déclencher une alarme budgétaire ?</h2>

      {/* Seuils d'alerte */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, margin:"16px 0 24px" }}>
        {[
          { seuil:"CPI ≥ 1.0 et SPI ≥ 1.0", statut:"✅ VERT", desc:"Projet sous contrôle. Continuer le suivi normal.", color:"#22c55e" },
          { seuil:"0.9 ≤ CPI < 1.0 ou 0.9 ≤ SPI < 1.0", statut:"🟡 AMBRE", desc:"Attention requise. Analyser les causes et préparer un plan d'action.", color:"#f59e0b" },
          { seuil:"CPI < 0.9 ou SPI < 0.9", statut:"🔴 ROUGE", desc:"Action immédiate. Convoquer le CODIR, préparer un avenant.", color:"#ef4444" },
        ].map(r => (
          <div key={r.seuil} style={{ display:"flex", gap:12, padding:"12px 16px", background:`${r.color}11`, borderRadius:10, borderLeft:`4px solid ${r.color}` }}>
            <div style={{ flex:1 }}>
              <code style={{ fontSize:12, color:r.color, fontWeight:700 }}>{r.seuil}</code>
              <div style={{ fontSize:11, color:"var(--text-2)", marginTop:4 }}>{r.desc}</div>
            </div>
            <strong style={{ color:r.color, fontSize:13 }}>{r.statut}</strong>
          </div>
        ))}
      </div>

      <h2 style={H2}>💡 Notre cas réel : Hôtel Atlantis Marrakech</h2>

      <div style={IMG_WRAP}>
        <img src="/blog/images/dashboard-hotel.png" alt="Dashboard PMO AI Studio — Hôtel Atlantis" style={IMG}/>
        <p style={IMG_CAP}>🏨 Dashboard PMO AI Studio — Projet Rénovation Hôtel Atlantis · CPI 0.83, EAC 3.0M€</p>
      </div>

      <p style={P}>Le projet de rénovation de l'Hôtel Atlantis présente les caractéristiques suivantes en mai 2026 :</p>

      {/* Schéma SVG diagnostic */}
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:20, margin:"16px 0 24px", overflow:"auto" }}>
        <svg viewBox="0 0 600 180" style={{ width:"100%", maxWidth:600, display:"block", margin:"0 auto" }}>
          {/* Titre */}
          <text x="300" y="20" textAnchor="middle" fontFamily="Arial" fontSize="13" fontWeight="700" fill="#f1f5f9">Diagnostic EVM — Mai 2026</text>
          {/* Axe */}
          <line x1="60" y1="140" x2="560" y2="140" stroke="#1e293b" strokeWidth="1"/>
          {/* Barres */}
          {[
            { label:"BAC", val:2500000, max:2700000, color:"#64748b", x:80 },
            { label:"PV", val:1200000, max:2700000, color:"#3b82f6", x:180 },
            { label:"EV", val:985000, max:2700000, color:"#7B5EFF", x:280 },
            { label:"AC", val:1100000, max:2700000, color:"#f59e0b", x:380 },
            { label:"EAC", val:2700000, max:2700000, color:"#ef4444", x:480 },
          ].map(b => {
            const h = Math.round((b.val/b.max)*100)
            const barH = Math.max(4, h)
            return (
              <g key={b.label}>
                <rect x={b.x-20} y={140-barH} width="40" height={barH} rx="4" fill={b.color} opacity="0.8"/>
                <text x={b.x} y={135-barH} textAnchor="middle" fontFamily="Arial" fontSize="10" fontWeight="700" fill={b.color}>
                  {b.val>=1000000?(b.val/1000000).toFixed(1)+"M€":(b.val/1000).toFixed(0)+"k€"}
                </text>
                <text x={b.x} y="155" textAnchor="middle" fontFamily="Arial" fontSize="11" fontWeight="600" fill="#94a3b8">{b.label}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <div style={ALERT_ORANGE}>
        <strong>📋 Analyse :</strong> L'EAC dépasse le BAC de 200 000€. Le TCPI = 1.05 signifie que l'équipe doit désormais être 5% plus efficace que prévu pour finir dans le budget. Une réunion CODIR s'impose.
      </div>

      <h2 style={H2}>🎯 Les 5 actions à mener quand CPI {"<"} 1</h2>
      {[
        { num:"1", title:"Analyser les causes racines", desc:"Identifier les WPs en dépassement via l'outil Work Packages. Chercher les écarts de productivité, les révisions de scope non maîtrisées.", icon:"🔍" },
        { num:"2", title:"Recalculer l'EAC et préparer un avenant", desc:"Présenter les scénarios EAC au commanditaire. Documentez l'impact sur le VAC (Variance at Completion = BAC - EAC).", icon:"📊" },
        { num:"3", title:"Mettre à jour le RAID", desc:"Transformer les causes de dépassement en risques formels. Associer des plans de mitigation concrets.", icon:"⚠️" },
        { num:"4", title:"Convoquer un CODIR d'urgence", desc:"Préparer le rapport CODIR avec PMO AI Studio. Présenter les KPIs, les risques critiques, les décisions demandées.", icon:"📋" },
        { num:"5", title:"Reprendre le contrôle avec un plan de rattrapage", desc:"Définir des jalons de contrôle intermédiaires. Appliquer le Crashing ou Fast-Tracking sur le chemin critique.", icon:"🚀" },
      ].map(a => (
        <div key={a.num} style={{ display:"flex", gap:14, padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(123,94,255,0.2)", border:"1px solid rgba(123,94,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{a.icon}</div>
          <div>
            <strong style={{ fontSize:13, color:"var(--text-1)" }}>Étape {a.num} : {a.title}</strong>
            <p style={{ fontSize:12, color:"var(--text-3)", margin:"4px 0 0", lineHeight:1.5 }}>{a.desc}</p>
          </div>
        </div>
      ))}

      <div style={{ ...ALERT_GREEN, marginTop:24 }}>
        <strong>✅ Bonne pratique PMI :</strong> Le PMI recommande de ne jamais modifier la baseline (BAC) sans approbation formelle du commanditaire. Documentez tout changement dans le registre des décisions.
      </div>

      <h2 style={H2}>🤖 Comment PMO AI Studio calcule et visualise l'EVM automatiquement</h2>
      <p style={P}>PMO AI Studio intègre nativement le calcul EVM. Il suffit de renseigner vos lignes budgétaires avec BAC, PV, EV et AC — l'outil calcule automatiquement CPI, SPI, EAC, TCPI, CV, SV et génère la courbe S dynamique.</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, margin:"16px 0" }}>
        {[
          { label:"Rapport EVM", desc:"Vue synthétique de tous les indicateurs en temps réel" },
          { label:"Courbe S dynamique", desc:"PV, EV, AC sur 12 mois avec ligne aujourd'hui" },
          { label:"Export Gamma AI", desc:"Générez une présentation CODIR en 30 secondes" },
          { label:"Alertes automatiques", desc:"Notification quand CPI passe sous 0.9" },
        ].map(f => (
          <div key={f.label} style={{ padding:"12px 14px", background:"rgba(123,94,255,0.06)", border:"1px solid rgba(123,94,255,0.2)", borderRadius:9 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--primary-light)", marginBottom:4 }}>✦ {f.label}</div>
            <div style={{ fontSize:11, color:"var(--text-3)" }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ArticleCPI() {
  return (
    <div>
      <p style={P}>Votre chef de projet ouvre son tableau de bord un lundi matin. CPI = 0.83. SPI = 0.87. EAC = 3.0M€ pour un BAC de 2.5M€. Que faire dans les 48 heures ?</p>

      <div style={IMG_WRAP}>
        <img src="/blog/images/dashboard-hotel.png" alt="Dashboard PMO — Alertes CPI" style={IMG}/>
        <p style={IMG_CAP}>🚨 Dashboard PMO AI Studio — CPI 0.83, VAC -512 048€, Score Santé 68 🟡</p>
      </div>

      <h2 style={H2}>🔴 Comprendre ce que signifie CPI = 0.83</h2>
      <p style={P}>Un CPI de 0.83 signifie que pour chaque euro dépensé, seulement 83 centimes de valeur est produite. En d'autres termes, votre projet dépense 20% de plus que ce qui était prévu pour la quantité de travail accomplie.</p>

      <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:12, padding:"16px 20px", margin:"16px 0 24px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#ef4444", marginBottom:8 }}>💡 Formule clé :</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, textAlign:"center" }}>
          {[["EV","144k€ de travail fait","#7B5EFF"],["÷ AC","173k€ dépensés","#f59e0b"],["= CPI","0.83 🔴","#ef4444"]].map(([k,v,c]) => (
            <div key={k} style={{ padding:"10px", background:`${c}11`, borderRadius:8 }}>
              <div style={{ fontSize:18, fontWeight:900, color:c as string }}>{k}</div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginTop:4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 style={H2}>📊 Le RAID — Votre registre des problèmes identifiés</h2>
      <div style={IMG_WRAP}>
        <img src="/blog/images/raid-register.png" alt="RAID Register PMO AI Studio" style={IMG}/>
        <p style={IMG_CAP}>⚠️ RAID Register — Hôtel Atlantis : 3 risques critiques, 6 ouverts · PMO AI Studio</p>
      </div>

      <p style={P}>Le RAID du projet Hôtel Atlantis révèle les causes racines du dépassement :</p>
      {[
        { titre:"Rupture stock tuiles zellige Fès", impact:"Retard Phase 4 — 6 semaines", cat:"🔴 Critique" },
        { titre:"Dépassement budget matériaux +22%", impact:"Surcoût 480k€ — avenant requis", cat:"🔴 Critique" },
        { titre:"Fissures mur porteur est", impact:"Surcoût 85k€ + 3 semaines", cat:"🔴 Issue critique" },
      ].map((r,i) => (
        <div key={i} style={{ display:"flex", gap:12, padding:"10px 14px", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, marginBottom:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)" }}>{r.titre}</div>
            <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{r.impact}</div>
          </div>
          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(239,68,68,0.15)", color:"#ef4444", fontWeight:700, flexShrink:0, alignSelf:"center" }}>{r.cat}</span>
        </div>
      ))}

      <h2 style={H2}>🎯 Plan d'action en 48h quand CPI {"<"} 0.9</h2>
      {[
        { h:"H+2", action:"Analyser le RAID", detail:"Identifier les 3 principales causes du dépassement dans PMO AI Studio" },
        { h:"H+4", action:"Recalculer l'EAC", detail:"EAC = BAC / CPI = 2 500 000 / 0.83 = 3 012 048€ → prévoir l'avenant" },
        { h:"H+8", action:"Préparer le rapport CODIR", detail:"Utiliser PMO AI Studio → Rapport CODIR → Export PPTX automatique" },
        { h:"H+24", action:"Convoquer le CODIR d'urgence", detail:"Présenter CPI, SPI, EAC, risques critiques et décisions demandées" },
        { h:"H+48", action:"Plan de rattrapage validé", detail:"Crashing sur chemin critique, avenant signé, nouvelles baselines" },
      ].map((s,i) => (
        <div key={i} style={{ display:"flex", gap:14, padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
          <div style={{ width:44, padding:"4px 6px", background:"rgba(123,94,255,0.15)", borderRadius:6, fontSize:10, fontWeight:800, color:"var(--primary-light)", textAlign:"center", flexShrink:0, alignSelf:"flex-start" }}>{s.h}</div>
          <div>
            <strong style={{ fontSize:12, color:"var(--text-1)" }}>{s.action}</strong>
            <p style={{ fontSize:11, color:"var(--text-3)", margin:"3px 0 0" }}>{s.detail}</p>
          </div>
        </div>
      ))}

      <div style={{ ...ALERT_GREEN, marginTop:24 }}>
        <strong>🚀 Avec PMO AI Studio :</strong> Le rapport CODIR avec CPI, SPI, EAC, risques critiques et prochaines étapes est généré en 30 secondes. Export PowerPoint 5 slides inclus.
      </div>
    </div>
  )
}

function ArticleRAID() {
  return (
    <div>
      <p style={P}>8 risques identifiés. 3 critiques. 6 ouverts. 0 résolus. C'est le tableau de bord RAID du projet Rénovation Hôtel Atlantis en mai 2026. Voici comment transformer ces chiffres en actions concrètes.</p>

      <div style={IMG_WRAP}>
        <img src="/blog/images/raid-register.png" alt="RAID Register complet" style={IMG}/>
        <p style={IMG_CAP}>⚠️ RAID Register PMO AI Studio — Hôtel Atlantis Marrakech · Risques, Actions, Issues, Décisions</p>
      </div>

      <h2 style={H2}>📋 Qu'est-ce que le RAID ?</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, margin:"16px 0 24px" }}>
        {[
          { letter:"R", word:"Risques", color:"#ef4444", desc:"Événements futurs incertains pouvant impacter le projet" },
          { letter:"A", word:"Actions", color:"#3b82f6", desc:"Tâches à réaliser pour prévenir ou atténuer les risques" },
          { letter:"I", word:"Issues", color:"#f59e0b", desc:"Problèmes actuels ayant déjà impacté le projet" },
          { letter:"D", word:"Décisions", color:"#22c55e", desc:"Choix formels documentés avec date et responsable" },
        ].map(r => (
          <div key={r.letter} style={{ background:`${r.color}11`, border:`1px solid ${r.color}33`, borderRadius:10, padding:"14px 12px", textAlign:"center" }}>
            <div style={{ fontSize:32, fontWeight:900, color:r.color, lineHeight:1 }}>{r.letter}</div>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"6px 0 4px" }}>{r.word}</div>
            <div style={{ fontSize:10, color:"var(--text-3)", lineHeight:1.4 }}>{r.desc}</div>
          </div>
        ))}
      </div>

      <h2 style={H2}>🔴 Les 3 risques critiques du projet Hôtel Atlantis</h2>
      {[
        { id:"R1", titre:"Rupture stock tuiles zellige Fès", prob:"Élevée", impact:"Critique", mitigation:"2 fournisseurs alternatifs identifiés à Meknès et Tétouan", owner:"Responsable Achats", echeance:"Nov 2026" },
        { id:"R2", titre:"Dépassement budget matériaux +22%", prob:"Confirmée", impact:"Critique", mitigation:"Renégocier contrat ou réduire périmètre spa. Avenant +350k€", owner:"Chef de Projet", echeance:"Août 2026" },
        { id:"R5", titre:"Fissures mur porteur est — Issue active", prob:"Réalisée", impact:"Critique", mitigation:"Expertise complémentaire + renforcement prévu. Surcoût 85k€", owner:"Ingénieur structure", echeance:"Juil 2026" },
      ].map(r => (
        <div key={r.id} style={{ background:"var(--bg-card)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"14px 16px", marginBottom:12, borderLeft:"4px solid #ef4444" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:"rgba(239,68,68,0.15)", color:"#ef4444", fontWeight:700 }}>{r.id}</span>
            <strong style={{ fontSize:13, color:"var(--text-1)" }}>{r.titre}</strong>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, fontSize:11, color:"var(--text-3)" }}>
            <div>👤 <strong style={{ color:"var(--text-2)" }}>{r.owner}</strong></div>
            <div>📅 {r.echeance}</div>
            <div>🎯 Probabilité: <strong style={{ color:"#ef4444" }}>{r.prob}</strong></div>
          </div>
          <div style={{ marginTop:8, padding:"8px 10px", background:"rgba(34,197,94,0.06)", borderRadius:6, fontSize:11, color:"#22c55e" }}>
            🛡️ Mitigation : {r.mitigation}
          </div>
        </div>
      ))}

      <div style={ALERT_GREEN}>
        <strong>💡 Bonne pratique :</strong> Chaque risque critique doit avoir un propriétaire, une date d'échéance et un plan de mitigation documenté. PMO AI Studio génère automatiquement votre RAID depuis la description du projet.
      </div>
    </div>
  )
}

function ArticleDefault({ slug }: { slug: string }) {
  const article = ARTICLES.find(a => a.slug === slug)
  return (
    <div>
      <p style={P}>Cet article est en cours de rédaction. Revenez bientôt pour découvrir le contenu complet.</p>
      <div style={ALERT_GREEN}>
        <strong>🚀 En attendant :</strong> Découvrez PMO AI Studio — 15 outils PMO générés par Claude AI en 30 secondes.
      </div>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const P: React.CSSProperties = { fontSize:14, color:"var(--text-2)", lineHeight:1.8, margin:"0 0 16px" }
const H2: React.CSSProperties = { fontSize:20, fontWeight:800, color:"var(--text-1)", margin:"32px 0 12px", paddingBottom:8, borderBottom:"2px solid var(--border)" }
const IMG_WRAP: React.CSSProperties = { margin:"20px 0", borderRadius:12, overflow:"hidden", border:"1px solid var(--border)" }
const IMG: React.CSSProperties = { width:"100%", display:"block" }
const IMG_CAP: React.CSSProperties = { fontSize:11, color:"var(--text-3)", textAlign:"center", padding:"8px 12px", background:"var(--bg-card)", margin:0 }
const ALERT_RED: React.CSSProperties = { background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"12px 16px", margin:"16px 0", fontSize:13, color:"var(--text-1)", lineHeight:1.6 }
const ALERT_ORANGE: React.CSSProperties = { background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:10, padding:"12px 16px", margin:"16px 0", fontSize:13, color:"var(--text-1)", lineHeight:1.6 }
const ALERT_GREEN: React.CSSProperties = { background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:10, padding:"12px 16px", margin:"16px 0", fontSize:13, color:"var(--text-1)", lineHeight:1.6 }
const TABLE_WRAP: React.CSSProperties = { margin:"16px 0 24px", borderRadius:10, overflow:"hidden", border:"1px solid var(--border)" }
const TABLE: React.CSSProperties = { width:"100%", borderCollapse:"collapse" }
const TR_HEAD: React.CSSProperties = { background:"var(--bg)" }
const TH: React.CSSProperties = { padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"2px solid var(--border)" }
const TD: React.CSSProperties = { padding:"10px 14px", fontSize:12, color:"var(--text-2)", verticalAlign:"top" }

// ── Composant principal ───────────────────────────────────────────────────────
export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) return (
    <AppLayout>
      <div style={{ padding:40, textAlign:"center" }}>
        <p>Article introuvable</p>
        <Link href="/blog">← Retour au blog</Link>
      </div>
    </AppLayout>
  )

  const cat     = CATEGORIES.find(c => c.id === article.category)
  const related = ARTICLES.filter(a => a.category === article.category && a.slug !== slug).slice(0,3)

  const renderContent = () => {
    switch(slug) {
      case "evm-5-minutes-cpi-spi-eac-tcpi": return <ArticleEVM/>
      case "cpi-inferieur-1-sauver-projet":   return <ArticleCPI/>
      case "raid-register-guide-complet":     return <ArticleRAID/>
      default: return <ArticleDefault slug={slug}/>
    }
  }

  return (
    <AppLayout>
      <div style={{ background:"var(--bg)", minHeight:"100%" }}>

        {/* Hero article */}
        <div style={{ background:`linear-gradient(135deg,${article.color}15,${article.color}08)`, borderBottom:`1px solid ${article.color}30`, padding:"32px 24px 28px" }}>
          <div style={{ maxWidth:800, margin:"0 auto" }}>
            <Link href="/blog" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-3)", textDecoration:"none", marginBottom:16 }}>
              <ArrowLeft size={13}/> Retour au blog
            </Link>
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:article.color, color:"#fff", fontWeight:700 }}>
                {cat?.emoji} {cat?.label}
              </span>
              {article.featured && <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:"rgba(245,158,11,0.2)", color:"#f59e0b", fontWeight:700 }}>⭐ À la une</span>}
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:"var(--bg-card)", color:"var(--text-3)", border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:4 }}>
                <Clock size={10}/> {article.readTime} min de lecture
              </span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:900, color:"var(--text-1)", margin:"0 0 12px", lineHeight:1.3 }}>
              <span style={{ fontSize:32, marginRight:10 }}>{article.emoji}</span>{article.title}
            </h1>
            <p style={{ fontSize:14, color:"var(--text-3)", margin:"0 0 16px", lineHeight:1.6 }}>{article.excerpt}</p>
            <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:12, color:"var(--text-3)" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:`${article.color}33`, border:`1px solid ${article.color}66`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:article.color }}>
                {article.author.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight:600, color:"var(--text-2)" }}>{article.author}</div>
                <div>{new Date(article.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu + Sidebar */}
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px", display:"grid", gridTemplateColumns:"1fr 300px", gap:32 }}>

          {/* Article */}
          <article>
            {renderContent()}

            {/* CTA pratique */}
            <div style={{ marginTop:40, background:"linear-gradient(135deg,rgba(123,94,255,0.12),rgba(34,197,94,0.08))", border:"1px solid rgba(123,94,255,0.3)", borderRadius:16, padding:"24px", textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>🚀</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"var(--text-1)", margin:"0 0 8px" }}>Pratiquez avec PMO AI Studio</h3>
              <p style={{ fontSize:13, color:"var(--text-3)", margin:"0 0 16px" }}>Générez votre EVM, RAID et Rapport CODIR en 30 secondes avec Claude AI</p>
              <Link href="/projects" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 24px", background:"var(--primary)", color:"#fff", borderRadius:9, textDecoration:"none", fontSize:13, fontWeight:700 }}>
                Essayer gratuitement <ArrowRight size={13}/>
              </Link>
            </div>

            {/* Tags */}
            <div style={{ marginTop:24, display:"flex", gap:6, flexWrap:"wrap" }}>
              {article.tags.map(t => (
                <span key={t} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, padding:"4px 10px", borderRadius:8, background:"var(--bg-card)", color:"var(--text-3)", border:"1px solid var(--border)" }}>
                  <Tag size={10}/> {t}
                </span>
              ))}
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Sommaire */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", position:"sticky", top:20 }}>
              <h4 style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", margin:"0 0 10px", display:"flex", alignItems:"center", gap:6 }}>
                <BookOpen size={13}/> Dans cet article
              </h4>
              {["Les indicateurs EVM","La Courbe S","Seuils d'alerte","Cas réel Hôtel Atlantis","5 actions à mener","PMO AI Studio"].map((item,i) => (
                <div key={i} style={{ padding:"5px 0", borderBottom:"1px solid var(--border)", fontSize:11, color:"var(--text-3)", display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:16, height:16, borderRadius:"50%", background:"var(--primary-bg)", border:"1px solid rgba(123,94,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"var(--primary-light)", flexShrink:0 }}>{i+1}</div>
                  {item}
                </div>
              ))}
            </div>

            {/* Articles liés */}
            {related.length > 0 && (
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
                <h4 style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", margin:"0 0 10px" }}>📚 Articles liés</h4>
                {related.map(r => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration:"none", display:"block", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{r.emoji}</span>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:"var(--text-1)", lineHeight:1.3 }}>{r.title.slice(0,60)}...</div>
                        <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{r.readTime} min</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* YouTube CTA */}
            <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              ▶️
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", marginBottom:4 }}>Chaîne YouTube</div>
              <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:10 }}>PMP en Action — Tutoriels, Quiz, Tips</div>
              <a href="https://youtube.com/@pmp-en-action" target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 14px", background:"#ef4444", color:"#fff", borderRadius:7, textDecoration:"none", fontSize:11, fontWeight:600 }}>
                ▶️  S'abonner
              </a>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
