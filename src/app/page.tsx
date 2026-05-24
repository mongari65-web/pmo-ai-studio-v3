import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PMO AI Studio — La plateforme PMO intelligente | Gérez vos projets avec l\'IA',
  description: 'PMO AI Studio combine les outils PMBOK 7, l\'IA Claude et la formation PMP pour les chefs de projet. WBS, Gantt, RAID, EVM, simulateur PMP 225Q. Essai gratuit 14 jours.',
  keywords: ['PMO', 'gestion de projet', 'PMP', 'PMBOK', 'IA', 'chef de projet', 'WBS', 'Gantt', 'EVM'],
  openGraph: {
    title: 'PMO AI Studio — La plateforme PMO intelligente',
    description: 'Pilotez vos projets avec l\'IA. Outils PMBOK 7, simulateur PMP, templates pro.',
    url: 'https://pmoai.studio',
    siteName: 'PMO AI Studio',
    locale: 'fr_FR',
    type: 'website',
  },
}

const FEATURES = [
  { icon: '🗂️', title: 'WBS & Structure', desc: 'Décomposez vos projets en livrables clairs. Générez votre WBS en quelques secondes avec l\'IA.' },
  { icon: '📅', title: 'Gantt & Planning', desc: 'Visualisez votre planning, suivez les jalons et gérez les dépendances en temps réel.' },
  { icon: '⚠️', title: 'RAID & Risques', desc: 'Identifiez, évaluez et gérez vos risques, actions, issues et décisions en un seul endroit.' },
  { icon: '💰', title: 'EVM & Budget', desc: 'Pilotez votre budget avec la méthode EVM. CPI, SPI, EAC calculés automatiquement.' },
  { icon: '🤖', title: 'IA Claude intégrée', desc: 'Générez des analyses, rapports et recommandations avec Claude Sonnet en un clic.' },
  { icon: '🎓', title: 'Simulateur PMP', desc: '225 questions officielles PMI pour préparer votre certification PMP. Explications détaillées.' },
  { icon: '📊', title: 'PERT & Courbes S', desc: 'Estimez vos délais avec PERT. Visualisez l\'avancement avec des courbes S professionnelles.' },
  { icon: '📋', title: 'RACI & Gouvernance', desc: 'Clarifiez les responsabilités de votre équipe avec une matrice RACI générée automatiquement.' },
]

const PLANS = [
  {
    name: 'Gratuit', price: 0, period: 'pour toujours', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0',
    cta: 'Commencer gratuitement', ctaStyle: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
    features: ['1 projet actif', 'WBS simplifié', 'RACI basique', 'Export PDF (1 seul)', 'IA Claude Haiku (5 req.)'],
    tag: null,
  },
  {
    name: 'Starter', price: 9, period: '/mois', color: '#36B37E', bg: '#f0fdf4', border: '#bbf7d0',
    cta: 'Essai gratuit 14 jours', ctaStyle: { background: '#36B37E', color: '#fff', border: 'none' },
    features: ['3 projets en parallèle', 'WBS + RACI + Gantt', 'Export PDF', 'IA Claude Haiku (100 req.)', 'Support email'],
    tag: null,
  },
  {
    name: 'Pro', price: 17, period: '/mois', color: '#7B5EFF', bg: '#faf5ff', border: '#e9d5ff',
    cta: 'Essai gratuit 14 jours', ctaStyle: { background: 'linear-gradient(135deg,#7B5EFF,#3b82f6)', color: '#fff', border: 'none' },
    features: ['10 projets en parallèle', 'Tous les outils PMO (10+)', 'Export Excel + PDF + Word', 'IA Claude Sonnet (200 req.)', 'Templates sectoriels', 'EVM, PERT & Courbes S', 'Support prioritaire'],
    tag: '⭐ Le plus populaire',
  },
  {
    name: 'Premium', price: 23, period: '/mois', color: '#FF8C00', bg: '#fff7ed', border: '#fed7aa',
    cta: 'Essai gratuit 14 jours', ctaStyle: { background: 'linear-gradient(135deg,#FF8C00,#f59e0b)', color: '#fff', border: 'none' },
    features: ['20 projets + archive illimitée', 'Tout ce qui est en Pro', 'IA Claude Sonnet (300 req.)', 'Simulateur PMP 225Q complet', 'Export PowerPoint inclus', 'Templates sectoriels complets', 'Historique & archive projets'],
    tag: '👑 Pour les PMO',
  },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Chef de projet IT, BNP Paribas', text: 'PMO AI Studio m\'a permis de réduire mon temps de reporting de 60%. Le générateur WBS avec l\'IA est bluffant.', avatar: 'SM' },
  { name: 'Karim B.', role: 'PMO Manager, Orange', text: 'Enfin un outil qui combine vraiment la gestion de projet et l\'IA. Le simulateur PMP m\'a aidé à décrocher ma certification.', avatar: 'KB' },
  { name: 'Marie L.', role: 'Directrice de projet, Thales', text: 'L\'EVM automatisé nous fait gagner un temps précieux. Le dashboard de suivi est exactement ce dont notre équipe avait besoin.', avatar: 'ML' },
]

const STATS = [
  { value: '10+', label: 'Outils PMO intégrés' },
  { value: '225', label: 'Questions PMP' },
  { value: '95%', label: 'Taux de satisfaction' },
  { value: '14j', label: 'Essai gratuit' },
]

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", color: '#1e293b', background: '#fff', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #f1f5f9', padding: '0 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo-pmo.svg" alt="PMO AI Studio" style={{ width: 40, height: 40, borderRadius: 10 }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>PMO AI Studio</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/auth/connexion" style={{ padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>
              Connexion
            </Link>
            <Link href="/auth/inscription" style={{ padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', textDecoration: 'none' }}>
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #faf5ff 100%)', padding: '80px 5% 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: '#1d4ed8', fontWeight: 600, marginBottom: 24 }}>
            🚀 Nouveau : Simulateur PMP 225 questions disponible
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-1px' }}>
            Pilotez vos projets avec<br />
            <span style={{ background: 'linear-gradient(135deg,#1e40af,#7B5EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              l&apos;intelligence artificielle
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#64748b', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            PMO AI Studio réunit tous les outils PMBOK 7, la puissance de Claude AI et la préparation PMP dans une seule plateforme. Pour les chefs de projet qui veulent aller plus vite.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/inscription" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}>
              Commencer gratuitement — 14 jours
            </Link>
            <a href="#video" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 600, background: '#fff', color: '#1e293b', textDecoration: 'none', border: '1px solid #e2e8f0' }}>
              ▶ Voir la démo
            </a>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 16 }}>
            ✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Annulation à tout moment &nbsp;·&nbsp; ✓ Support inclus
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#1e293b', padding: '32px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <p style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VIDEO YOUTUBE ── */}
      <section id="video" style={{ padding: '80px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>PMP EN ACTION — YouTube</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
            Apprenez le project management en regardant
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', margin: '0 0 36px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Retrouvez nos vidéos de formation PMP, tutoriels PMO et conseils de chef de projet sur YouTube.
          </p>
          {/* YouTube placeholder — remplacer VIDEO_ID par le vrai ID */}
          <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', background: '#0f172a' }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              src="https://www.youtube.com/embed/VIDEO_ID?rel=0&modestbranding=1"
              title="PMO AI Studio — PMP en Action"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {/* Overlay placeholder quand pas de vidéo */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0f172a,#1e293b)', pointerEvents: 'none' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 16 }}>▶</div>
              <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>PMP en Action</p>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: '6px 0 0' }}>Formation & Tutoriels Project Management</p>
              <a href="https://youtube.com/@PMPenAction" target="_blank" rel="noopener noreferrer"
                style={{ marginTop: 20, padding: '10px 24px', background: '#ef4444', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                🎬 Voir la chaîne YouTube →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7B5EFF', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Fonctionnalités</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
              Tout ce dont un chef de projet a besoin
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
              10+ outils PMO professionnels, tous alimentés par l&apos;IA, dans une seule plateforme.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ padding: '24px', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', transition: 'box-shadow 0.2s' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#1e293b' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── MOCKUPS OUTILS ── */}
      <section style={{ padding: '80px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7B5EFF', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Aperçu des outils</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
              Des interfaces pensées pour les pros
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
              Chaque outil est conçu pour votre réalité terrain, pas pour une démo.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* Mockup EVM */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#1d4ed8', fontWeight: 600, marginBottom: 16 }}>💰 Earned Value Management</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 12px', color: '#1e293b' }}>Pilotez votre budget en temps réel</h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, margin: '0 0 20px' }}>
                  CPI, SPI, EAC calculés automatiquement. Détectez les dérives budgétaires avant qu&apos;il ne soit trop tard.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Courbes S prévisionnel vs réel', 'Alertes dérive automatiques', 'Export Excel pro'].map(f => (
                    <li key={f} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#374151' }}>
                      <span style={{ color: '#7B5EFF', fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* EVM Mockup */}
              <div style={{ background: '#0f172a', borderRadius: 16, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>📊 EVM Dashboard</span>
                  <span style={{ fontSize: 11, color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: 4 }}>Semaine 24</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: 'CPI', value: '0.94', color: '#f59e0b', sub: 'Coût' },
                    { label: 'SPI', value: '1.02', color: '#22c55e', sub: 'Planning' },
                    { label: 'EAC', value: '245k€', color: '#3b82f6', sub: 'Prévision' },
                  ].map(k => (
                    <div key={k.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: '0 0 4px' }}>{k.label}</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
                      <p style={{ fontSize: 9, color: '#64748b', margin: '2px 0 0' }}>{k.sub}</p>
                    </div>
                  ))}
                </div>
                {/* Mini bar chart */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: '0 0 8px' }}>Courbe S — Avancement</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 50 }}>
                    {[30,45,52,61,68,75,82,88,92,94].map((v, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ height: `${v/2}px`, background: i < 7 ? '#7B5EFF' : 'rgba(123,94,255,0.3)', borderRadius: '2px 2px 0 0' }}/>
                        <div style={{ height: `${[28,42,49,58,65,71,78,84,89,94][i]/2}px`, background: i < 7 ? '#22c55e' : 'rgba(34,197,94,0.3)', borderRadius: '2px 2px 0 0' }}/>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                    <span style={{ fontSize: 9, color: '#7B5EFF' }}>■ Budget</span>
                    <span style={{ fontSize: 9, color: '#22c55e' }}>■ Réel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup RAID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
              {/* RAID Mockup */}
              <div style={{ background: '#0f172a', borderRadius: 16, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>⚠️ RAID Log</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[['R','#ef4444'],['A','#f59e0b'],['I','#3b82f6'],['D','#22c55e']].map(([l,c]) => (
                      <span key={l as string} style={{ fontSize: 10, fontWeight: 700, color: c as string, background: `${c as string}22`, padding: '2px 6px', borderRadius: 4 }}>{l}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { type: 'R', label: 'Indispo serveur prod', prio: 'Élevé', status: 'Ouvert', color: '#ef4444' },
                    { type: 'A', label: 'Validation MOA batch', prio: 'Moyen', status: 'En cours', color: '#f59e0b' },
                    { type: 'I', label: 'Retard livraison API', prio: 'Élevé', status: 'Ouvert', color: '#3b82f6' },
                    { type: 'D', label: 'Architecture micro-svcs', prio: 'Faible', status: 'Clos', color: '#22c55e' },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, borderLeft: `3px solid ${r.color}` }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: r.color, width: 14 }}>{r.type}</span>
                      <span style={{ fontSize: 11, color: '#e2e8f0', flex: 1 }}>{r.label}</span>
                      <span style={{ fontSize: 9, color: r.color, background: `${r.color}22`, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>{r.prio}</span>
                      <span style={{ fontSize: 9, color: '#64748b', whiteSpace: 'nowrap' }}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 16 }}>⚠️ RAID Management</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 12px', color: '#1e293b' }}>Gérez risques et actions en un clic</h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, margin: '0 0 20px' }}>
                  Risques, Actions, Issues, Décisions — tout centralisé. Filtrez, priorisez, assignez et suivez en temps réel.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Matrice probabilité × impact', 'Alertes automatiques par email', 'Export rapport RAID PDF'].map(f => (
                    <li key={f} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#374151' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mockup WBS + PERT côte à côte */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* WBS */}
              <div style={{ background: '#0f172a', borderRadius: 16, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>🗂️ WBS — Migration Cloud</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ padding: '8px 10px', background: 'rgba(123,94,255,0.2)', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>
                    1.0 Migration Cloud Azure
                  </div>
                  {[
                    { label: '1.1 Infrastructure', indent: 16, color: '#60a5fa' },
                    { label: '1.1.1 Réseau VPN', indent: 32, color: '#94a3b8' },
                    { label: '1.1.2 Stockage', indent: 32, color: '#94a3b8' },
                    { label: '1.2 Applications', indent: 16, color: '#60a5fa' },
                    { label: '1.2.1 Migration BDD', indent: 32, color: '#94a3b8' },
                    { label: '1.3 Tests & Recette', indent: 16, color: '#60a5fa' },
                  ].map((item, i) => (
                    <div key={i} style={{ paddingLeft: item.indent, padding: `6px 10px 6px ${item.indent}px`, fontSize: 11, color: item.color, borderLeft: `2px solid ${item.color}22`, marginLeft: item.indent/2 }}>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
              {/* PERT */}
              <div style={{ background: '#0f172a', borderRadius: 16, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>📅 PERT — Estimation délais</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 4, fontSize: 9, color: '#64748b', padding: '4px 8px' }}>
                    <span>Tâche</span><span style={{ textAlign: 'center' }}>O</span><span style={{ textAlign: 'center' }}>M</span><span style={{ textAlign: 'center' }}>P</span>
                  </div>
                  {[
                    { task: 'Analyse besoins', o: 3, m: 5, p: 10, color: '#22c55e' },
                    { task: 'Conception archi', o: 5, m: 8, p: 15, color: '#3b82f6' },
                    { task: 'Développement', o: 10, m: 15, p: 25, color: '#7B5EFF' },
                    { task: 'Tests recette', o: 3, m: 5, p: 8, color: '#f59e0b' },
                  ].map((r, i) => {
                    const te = Math.round((r.o + 4*r.m + r.p) / 6)
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 4, padding: '6px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, alignItems: 'center', borderLeft: `3px solid ${r.color}` }}>
                        <span style={{ fontSize: 11, color: '#e2e8f0' }}>{r.task}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{r.o}j</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{r.m}j</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: r.color, textAlign: 'center' }}>{te}j</span>
                      </div>
                    )
                  })}
                  <div style={{ padding: '8px', background: 'rgba(123,94,255,0.1)', borderRadius: 6, textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: '#a78bfa' }}>⏱ Durée estimée totale : </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#7B5EFF' }}>33 jours</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
            Conçu pour les professionnels du projet
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', margin: '0 0 48px' }}>Qu&apos;importe votre secteur ou votre niveau d&apos;expérience.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: '🏦', role: 'Banque & Finance', desc: 'BNP, Société Générale, AXA' },
              { icon: '⚡', role: 'Énergie & Industrie', desc: 'EDF, Total, CEA, Airbus' },
              { icon: '🚆', role: 'Transport & Infra', desc: 'SNCF, RATP, Vinci' },
              { icon: '💻', role: 'IT & Tech', desc: 'ESN, startups, éditeurs' },
              { icon: '🏥', role: 'Santé & Pharma', desc: 'Hôpitaux, labos, medtech' },
              { icon: '🎓', role: 'Candidats PMP', desc: 'Préparation certification PMI' },
            ].map(p => (
              <div key={p.role} style={{ padding: '20px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{p.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: '#1e293b' }}>{p.role}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Tarifs</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
              Commencez gratuitement, évoluez à votre rythme
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>7 jours d&apos;essai gratuit sur tous les plans payants. Annulation à tout moment.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, alignItems: 'start' }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ padding: '28px 24px', background: plan.bg, border: `2px solid ${plan.name === 'Pro' ? plan.color : plan.border}`, borderRadius: 20, position: 'relative', boxShadow: plan.name === 'Pro' ? '0 8px 40px rgba(123,94,255,0.15)' : 'none' }}>
                {plan.tag && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {plan.tag}
                  </div>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 800, color: plan.color, margin: '0 0 8px' }}>{plan.name}</h3>
                <div style={{ margin: '0 0 20px' }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: '#1e293b' }}>{plan.price === 0 ? '0' : `${plan.price}€`}</span>
                  <span style={{ fontSize: 14, color: '#64748b' }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151' }}>
                      <span style={{ color: plan.color, flexShrink: 0, fontWeight: 700 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/inscription" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', ...plan.ctaStyle }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section style={{ padding: '80px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
              Ce que disent nos utilisateurs
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ padding: '24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 16 }}>{s}</span>)}
                </div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '0 0 16px', fontStyle: 'italic' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#7B5EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#1e293b' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(135deg,#1e40af,#7B5EFF)', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
            Prêt à transformer votre gestion de projet ?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', margin: '0 0 36px', lineHeight: 1.6 }}>
            Rejoignez les chefs de projet qui utilisent l&apos;IA pour livrer plus vite, mieux et sans stress.
          </p>
          <Link href="/auth/inscription" style={{ display: 'inline-block', padding: '16px 36px', borderRadius: 12, fontSize: 18, fontWeight: 800, background: '#fff', color: '#1e40af', textDecoration: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
            Démarrer gratuitement — 14 jours →
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>
            ✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Accès immédiat &nbsp;·&nbsp; ✓ Support inclus
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a', padding: '40px 5%', color: '#94a3b8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo-pmo.svg" alt="PMO AI Studio" style={{ width: 36, height: 36, borderRadius: 8 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>PMO AI Studio</span>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <Link href="/pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tarifs</Link>
            <Link href="/auth/connexion" style={{ color: '#94a3b8', textDecoration: 'none' }}>Connexion</Link>
            <a href="https://youtube.com/@PMPenAction" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>YouTube</a>
            <a href="mailto:support@pmoai.studio" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
            © {new Date().getFullYear()} PMO AI Studio · <a href="https://pmoai.studio" style={{ color: '#475569', textDecoration: 'none' }}>pmoai.studio</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
