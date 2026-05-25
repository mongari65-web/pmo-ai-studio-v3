import Link from 'next/link'
import AppSlider from '@/components/landing/AppSlider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PMO AI Studio — La plateforme PMO intelligente | Gérez vos projets avec l\'IA',
  description: 'PMO AI Studio combine les outils PMBOK 7, l\'IA Claude et la formation PMP pour les chefs de projet. WBS, Gantt, RAID, EVM, simulateur PMP 225Q. Essai gratuit 14 jours.',
  keywords: ['PMO', 'gestion de projet', 'management', 'IA', 'chef de projet', 'WBS', 'Gantt', 'EVM', 'pilotage projet'],
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
  { icon: '🎓', title: 'Simulateur certif.', desc: '225 questions pour préparer vos certifications projet. Explications détaillées et scoring.' },
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
    cta: 'Commencer →', ctaStyle: { background: '#36B37E', color: '#fff', border: 'none' },
    features: ['3 projets en parallèle', 'WBS + RACI + Gantt', 'Export PDF', 'IA Claude Haiku (100 req.)', 'Support email'],
    tag: null,
  },
  {
    name: 'Pro', price: 17, period: '/mois', color: '#7B5EFF', bg: '#faf5ff', border: '#e9d5ff',
    cta: 'Commencer →', ctaStyle: { background: 'linear-gradient(135deg,#7B5EFF,#3b82f6)', color: '#fff', border: 'none' },
    features: ['10 projets en parallèle', 'Tous les outils PMO (10+)', 'Export Excel + PDF + Word', 'IA Claude Sonnet (200 req.)', 'Templates sectoriels', 'EVM, PERT & Courbes S', 'Support prioritaire'],
    tag: '⭐ Le plus populaire',
  },
  {
    name: 'Premium', price: 23, period: '/mois', color: '#FF8C00', bg: '#fff7ed', border: '#fed7aa',
    cta: 'Commencer →', ctaStyle: { background: 'linear-gradient(135deg,#FF8C00,#f59e0b)', color: '#fff', border: 'none' },
    features: ['20 projets + archive illimitée', 'Tout ce qui est en Pro', 'IA Claude Sonnet (300 req.)', 'Simulateur certifications 225Q', 'Export PowerPoint inclus', 'Templates sectoriels complets', 'Historique & archive projets'],
    tag: '👑 Pour les PMO',
  },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Chef de projet IT, BNP Paribas', text: 'PMO AI Studio m\'a permis de réduire mon temps de reporting de 60%. Le générateur WBS avec l\'IA est bluffant.', avatar: 'SM' },
  { name: 'Karim B.', role: 'PMO Manager, Orange', text: 'Enfin un outil qui combine vraiment la gestion de projet et l\'IA. Le simulateur PMP m\'a aidé à décrocher ma certification.', avatar: 'KB' },
  { name: 'Marie L.', role: 'Directrice de projet, Thales', text: 'L\'EVM automatisé nous fait gagner un temps précieux. Le dashboard de suivi est exactement ce dont notre équipe avait besoin.', avatar: 'ML' },
]

const STATS = [
  { value: '10+', label: 'Outils intégrés' },
  { value: '225', label: 'Questions certif.' },
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
            <Link href="/demo" style={{ padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#7B5EFF', textDecoration: 'none', border: '1px solid rgba(123,94,255,0.3)' }}>
              👁️ Démo live
            </Link>
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
            🚀 Nouveau : Simulateur de certification intégré
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-1px' }}>
            Pilotez vos projets avec<br />
            <span style={{ background: 'linear-gradient(135deg,#1e40af,#7B5EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              l&apos;intelligence artificielle
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#64748b', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            PMO AI Studio réunit les meilleurs outils de gestion de projet, la puissance de l'IA et la montée en compétence dans une seule plateforme. Pour les managers qui veulent livrer avec excellence.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/inscription" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}>
              Commencer gratuitement
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
            Retrouvez nos vidéos de formation, tutoriels et conseils de management de projet sur YouTube.
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
              <a href="https://youtube.com/@PMOAIStudio" target="_blank" rel="noopener noreferrer"
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
              Tout ce dont un manager de projet a besoin
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



      {/* ── SLIDER APP ── */}
      <section style={{ padding: '80px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7B5EFF', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Aperçu de l&apos;application</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
              Tout ce qu&apos;il faut pour piloter avec excellence
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
              6 modules, 1 plateforme — cliquez sur les onglets ou laissez défiler automatiquement.
            </p>
          </div>
          <AppSlider />
        </div>
      </section>

            {/* ── POUR QUI ── */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
            Conçu pour piloter n'importe quel type de projet
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', margin: '0 0 48px' }}>Qu&apos;importe votre secteur ou votre niveau d&apos;expérience.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { icon: '🏦', role: 'Banque & Finance',    desc: 'BNP, Société Générale, AXA' },
              { icon: '⚡', role: 'Énergie & Industrie', desc: 'EDF, Total, CEA, Airbus' },
              { icon: '🚆', role: 'Transport & Infra',   desc: 'SNCF, RATP, Vinci, Bouygues' },
              { icon: '💻', role: 'IT & Tech',           desc: 'ESN, startups, éditeurs SaaS' },
              { icon: '🏥', role: 'Santé & Pharma',      desc: 'Hôpitaux, labos, medtech' },
              { icon: '🎓', role: 'Formation & Coaching', desc: 'Montée en compétence équipes' },
              { icon: '🏗️', role: 'Construction & BTP',  desc: 'Vinci, Bouygues, Eiffage' },
              { icon: '🌍', role: 'International & ONG', desc: 'Projets multi-pays, ONU, ONG' },
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


      {/* ── DÉMO LIVE ── */}
      <section style={{ padding: '72px 5%', background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7B5EFF', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Projet de démonstration</p>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: '#f1f5f9', margin: '0 0 14px', letterSpacing: '-0.5px' }}>
              Explorez un vrai projet géré avec PMO AI Studio
            </h2>
            <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 0 0', lineHeight: 1.7, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
              Migration Azure · 850k€ · 18 mois · 12 ressources — Gantt, EVM, RAID, WBS, RACI en lecture seule.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center', marginBottom: 32 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src="/screenshots/dashboard-evm.png" alt="Démo PMO AI Studio" style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover', objectPosition: 'top' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '📅', label: 'Planning Gantt', desc: '10 tâches · 18 mois · chemin critique' },
                { icon: '💰', label: 'EVM & Courbe S', desc: 'CPI, SPI, EAC · courbe PV/EV/AC' },
                { icon: '⚠️', label: 'RAID Register',  desc: '8 entrées · priorités · mitigations' },
                { icon: '🗂️', label: 'WBS & Budget',   desc: '16 livrables · budget par WP' },
                { icon: '👥', label: 'RACI & Ressources', desc: '6 rôles · 6 ressources · compétences' },
              ].map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{t.label}</p>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{t.desc}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: '#22c55e', fontWeight: 600 }}>✓ Inclus</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 12, fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg,#7B5EFF,#3b82f6)', color: '#fff', textDecoration: 'none', boxShadow: '0 8px 30px rgba(123,94,255,0.3)' }}>
              👁️ Explorer le projet démo →
            </Link>
            <p style={{ fontSize: 12, color: '#475569', marginTop: 12 }}>Sans connexion · Lecture seule · 100% représentatif</p>
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


      {/* ── BLOG ── */}
      <section style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Blog & Ressources</p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#1e293b' }}>Conseils, méthodes et bonnes pratiques</h2>
            </div>
            <a href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: '#f1f5f9', color: '#475569', textDecoration: 'none', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
              Voir tous les articles →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Capture blog */}
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 16px 50px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <img src="/screenshots/dashboard-evm2.png" alt="Blog PMO AI Studio" style={{ width: '100%', display: 'block', maxHeight: 340, objectFit: 'cover', objectPosition: 'top' }} />
              <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px' }}>Article mis en avant</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>Maîtriser l&apos;EVM sur un vrai projet de migration IT</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>CPI, SPI, EAC expliqués avec des données réelles d&apos;un projet bancaire.</p>
                <a href="/blog" style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>Lire l&apos;article →</a>
              </div>
            </div>
            {/* 3 articles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { tag: 'Gestion de projet', color: '#3b82f6', bg: '#eff6ff', title: 'Structurer un projet complexe avec le WBS', desc: 'Le WBS est l\'outil clé pour décomposer tout projet. Construisez-le efficacement.', time: '5 min', icon: '🗂️' },
                { tag: 'EVM & Budget',      color: '#22c55e', bg: '#f0fdf4', title: 'Guide complet Earned Value Management', desc: 'CPI, SPI, EAC, VAC... Tous les indicateurs EVM expliqués avec des exemples concrets.', time: '8 min', icon: '💰' },
                { tag: 'Management',        color: '#7B5EFF', bg: '#faf5ff', title: 'Les 10 erreurs fatales en gestion de risques', desc: 'Les erreurs courantes et comment les éviter sur vos projets critiques.', time: '6 min', icon: '⚠️' },
              ].map(post => (
                <a key={post.title} href="/blog" style={{ textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: post.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{post.icon}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: post.bg, color: post.color, marginBottom: 6, display: 'inline-block' }}>{post.tag} · {post.time}</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '4px 0 4px' }}>{post.title}</p>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{post.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

            {/* ── TEMPLATES PRO ── */}
      <section style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#FF8C00', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Templates Pro</p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px', color: '#1e293b' }}>Pack Templates Pro — Téléchargeables</h2>
              <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>Téléchargez et adaptez nos modèles Excel et PDF professionnels pour vos projets.</p>
            </div>
            <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg,#7B5EFF,#3b82f6)', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              ⭐ Accéder avec un plan Pro →
            </a>
          </div>
          <div style={{ marginBottom: 28, borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 70px rgba(0,0,0,0.14)', border: '1px solid #e2e8f0', position: 'relative' }}>
            <img src="/screenshots/Pack-Templates.png" alt="Pack Templates Pro PMO AI Studio" style={{ width: '100%', display: 'block', maxHeight: 420, objectFit: 'cover', objectPosition: 'top' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9), transparent)', padding: '48px 32px 24px' }}>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: '0 0 8px' }}>Pack Templates Pro — Téléchargeables</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '0 0 16px' }}>Inclus dans les plans Pro et Premium · Accès immédiat depuis votre espace</p>
              <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: 'linear-gradient(135deg,#7B5EFF,#3b82f6)', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>⭐ Obtenir le plan Pro →</a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { icon: '📊', name: 'Dashboard EVM', format: 'Excel', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', desc: 'Courbes S, CPI, SPI, EAC automatisés' },
              { icon: '🗂️', name: 'WBS Template',  format: 'Excel', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', desc: 'Structure de découpage du travail' },
              { icon: '⚠️', name: 'RAID Register', format: 'Excel', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', desc: 'Registre risques, actions, issues' },
              { icon: '👥', name: 'Matrice RACI',  format: 'Excel', color: '#7B5EFF', bg: '#faf5ff', border: '#e9d5ff', desc: 'Responsabilités par rôle et tâche' },
            ].map(t => (
              <div key={t.name} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 14, padding: '18px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{t.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44` }}>{t.format}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>{t.name}</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>{t.desc}</p>
                <a href="/pricing" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: t.color, textDecoration: 'none' }}>⭐ Inclus en Pro →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* ── CTA FINAL ── */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(135deg,#1e40af,#7B5EFF)', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
            Prêt à piloter vos projets avec excellence ?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', margin: '0 0 36px', lineHeight: 1.6 }}>
            Rejoignez les chefs de projet qui utilisent l&apos;IA pour livrer plus vite, mieux et sans stress.
          </p>
          <Link href="/auth/inscription" style={{ display: 'inline-block', padding: '16px 36px', borderRadius: 12, fontSize: 18, fontWeight: 800, background: '#fff', color: '#1e40af', textDecoration: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
            Commencer gratuitement →
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
            <a href="https://youtube.com/@PMOAIStudio" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>YouTube</a>
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
