import PublicLayout from '@/components/public/PublicLayout'
export default function ChangelogPage() {
  const releases = [
    {
      version:"v3.2", date:"Mai 2026", tag:"Dernière version",
      items:[
        "🎯 OKR Tracker par projet + Vue Portfolio OKRs globale",
        "🗺️ Roadmap produit par trimestre — kanban visuel",
        "🔄 Sprint Review Agile/SAFe avec board Kanban + rétrospective",
        "📌 Registre Décisions CODIR — suivi dédié séparé du RAID",
        "📣 Plan de Communication — matrice Influence × Intérêt",
        "🔍 Matrice SWOT interactive avec recommandations IA",
        "📋 Fiche de Mission — cadrage 1 page style cabinet conseil",
        "📊 Rapport CODIR imprimable 2 pages + Export PowerPoint 5 slides",
        "👥 RACI Matrix Pro avec mode DACI + export CSV",
        "🔗 Intégrations Jira/Notion/CSV — import automatique vers outils PMO",
        "🖼️ Widget embarquable iframe pour SharePoint/PowerPoint/Notion",
        "🎓 Quiz Certifications — 5 questions par domaine avec chrono",
        "🚀 Onboarding guidé 5 étapes avec génération IA automatique",
        "📧 Notifications email hebdo — résumé projet (Resend)",
        "👥 Mode collaboratif — membres, permissions, lien de partage",
        "⚙️ Paramètres redesignés — tabs Profil/Notifications/Sécurité/Abonnement",
      ]
    },
    {
      version:"v3.1", date:"Avril 2026", tag:"",
      items:[
        "📅 Timeline Multi-Projets — Gantt global tous projets sur une seule vue",
        "🟢🟡🔴 Vue Portfolio RAG — score santé, CPI/SPI automatiques",
        "🔀 PERT 3 onglets — Diagramme, Chemin Critique, Fast Track/Crashing",
        "📊 Dashboard sélecteur projet — Courbe S EVM, KPIs CPI/SPI/EAC/TCPI",
        "🎨 RAID, Work Packages, Jalons redesignés — style marketing",
        "📦 Templates Marketplace style App Store — 11 templates",
        "🛡️ Admin Panel 8 pages — Users, Revenue MRR/ARR, Config, Sécurité",
      ]
    },
    {
      version:"v3.0", date:"Mars 2026", tag:"",
      items:[
        "💳 Intégration Stripe complète — checkout, webhook, portal",
        "🤖 Claude AI intégré — génération Gantt, RAID, Budget EVM, WBS, PERT",
        "📊 Budget EVM complet — CPI, SPI, EAC, TCPI, Courbe S",
        "📈 Simulateur Certifications 225 questions — 3 niveaux, 15 lots",
        "🗂️ WBS + Dictionnaire, Work Packages, Jalons, PERT",
        "🔐 Authentification Supabase + ProGate plans payants",
      ]
    },
  ]

  return (
    <PublicLayout>
    <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px", fontFamily:"Arial, sans-serif", color:"#f1f5f9", background:"#0f172a", minHeight:"100vh" }}>
      <a href="/" style={{ fontSize:12, color:"#7B5EFF", textDecoration:"none" }}>← Retour</a>
      <h1 style={{ fontSize:28, fontWeight:800, margin:"20px 0 4px" }}>Changelog</h1>
      <p style={{ fontSize:14, color:"#64748b", marginBottom:40 }}>Historique des versions et nouvelles fonctionnalités</p>

      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:16, top:0, bottom:0, width:2, background:"#1e293b" }}/>
        {releases.map((r,ri) => (
          <div key={r.version} style={{ marginBottom:40, paddingLeft:48, position:"relative" }}>
            <div style={{ position:"absolute", left:8, top:4, width:18, height:18, borderRadius:"50%", background:ri===0?"#7B5EFF":"#1e293b", border:"2px solid "+(ri===0?"#7B5EFF":"#334155") }}/>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <span style={{ fontSize:18, fontWeight:800, color:"#f1f5f9" }}>{r.version}</span>
              <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:"#1e293b", color:"#64748b" }}>{r.date}</span>
              {r.tag && <span style={{ fontSize:11, padding:"2px 10px", borderRadius:20, background:"rgba(123,94,255,0.2)", color:"#a78bfa", fontWeight:600 }}>{r.tag}</span>}
            </div>
            <div style={{ background:"#1e293b", borderRadius:10, padding:"14px 16px" }}>
              {r.items.map((item,i) => (
                <div key={i} style={{ fontSize:13, color:"#94a3b8", padding:"5px 0", borderBottom:i<r.items.length-1?"1px solid #0f172a":"none", lineHeight:1.5 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}