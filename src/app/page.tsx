'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import type { Metadata } from 'next'

// ── DONNÉES ────────────────────────────────────────────────────────────────

const SCREENSHOTS = [
  {
    src: '/screenshots/dashboard-evm.png',
    label: '💰 Dashboard EVM',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.25)',
    title: 'Pilotage budgétaire en temps réel',
    desc: 'CPI, SPI, EAC calculés automatiquement. Courbes S dynamiques PV/EV/AC. Détectez les dérives avant qu\'il ne soit trop tard.',
    tags: ['CPI · SPI · EAC', 'Courbe S', 'Alertes dérive'],
  },
  {
    src: '/screenshots/gantt.png',
    label: '📅 Planning Gantt',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.25)',
    title: 'Planning visuel & chemin critique',
    desc: 'Gantt interactif avec phases, jalons, % d\'avancement. Chemin critique mis en évidence automatiquement.',
    tags: ['Chemin critique', '% Avancement', 'Jalons'],
  },
  {
    src: '/screenshots/raid.png',
    label: '⚠️ RAID Register',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.25)',
    title: 'Risques, Actions, Issues, Décisions',
    desc: 'Tout centralisé avec priorités, responsables et plans de mitigation. Conforme aux standards PMBOK® 7.',
    tags: ['Risques', 'Actions', 'Décisions'],
  },
  {
    src: '/screenshots/workpackages.png',
    label: '📦 Work Packages',
    color: '#7B5EFF',
    glow: 'rgba(123,94,255,0.25)',
    title: 'WBS & Work Packages structurés',
    desc: 'Cartes colorées par phase, budget, responsables et livrables associés. Vue kanban claire pour toute l\'équipe.',
    tags: ['Cartes WP', 'Budget/livrable', 'Phases colorées'],
  },
  {
    src: '/screenshots/export-evm.png',
    label: '📊 Export EVM',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.25)',
    title: 'Export professionnel Excel & PDF',
    desc: 'Templates Excel pré-formatés, exports PDF prêts à présenter. Partagez vos livrables en un clic.',
    tags: ['Excel', 'PDF', 'Word'],
  },
  {
    src: '/screenshots/gestion-ressources.png',
    label: '👥 Ressources',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.25)',
    title: 'Gestion des ressources & RACI',
    desc: 'Charge, disponibilité, compétences par ressource. Matrice RACI générée automatiquement par l\'IA.',
    tags: ['Charge', 'RACI', 'Compétences'],
  },
]

const PROJECT_TYPES = [
  { icon: '🏦', label: 'Banque & Finance',    sub: 'BNP, SG, AXA, Natixis' },
  { icon: '⚡', label: 'Énergie & Nucléaire', sub: 'EDF, CEA, Total, Orano' },
  { icon: '🚆', label: 'Transport & Infra',   sub: 'SNCF, RATP, Vinci, ADP' },
  { icon: '💻', label: 'IT & Digital',        sub: 'ESN, SaaS, Cloud, DevOps' },
  { icon: '🏥', label: 'Santé & Pharma',      sub: 'CHU, labos, dispositifs médicaux' },
  { icon: '✈️', label: 'Aérospatial & Défense', sub: 'Airbus, Thales, Dassault' },
  { icon: '🏗️', label: 'Construction & BTP',  sub: 'Bouygues, Eiffage, Grand Paris' },
  { icon: '🌍', label: 'International & ONG', sub: 'Projets multi-pays, UE, ONU' },
]

const STANDARDS = [
  { name: "PMBOK® 7", color: '#1e40af', bg: '#eff6ff' },
  { name: 'PRINCE2®', color: '#7B5EFF', bg: '#faf5ff' },
  { name: 'ISO 21502', color: '#0891b2', bg: '#ecfeff' },
  { name: 'SAFe® 6', color: '#059669', bg: '#f0fdf4' },
  { name: 'Agile / Scrum', color: '#d97706', bg: '#fffbeb' },
  { name: 'MSP®', color: '#dc2626', bg: '#fef2f2' },
]

const PLANS = [
  {
    name: 'Gratuit', price: 0, period: 'pour toujours', color: '#64748b', border: '#e2e8f0', bg: '#f8fafc',
    cta: 'Commencer gratuitement', ctaBg: '#f1f5f9', ctaColor: '#475569',
    features: ['1 projet actif', 'WBS simplifié', 'RACI basique', 'Export PDF (1)', 'IA Haiku (10 générations)'],
    tag: null,
  },
  {
    name: 'Starter', price: 19, period: '/mois', color: '#36B37E', border: '#bbf7d0', bg: '#f0fdf4',
    cta: 'Essai 7j gratuit →', ctaBg: '#36B37E', ctaColor: '#fff',
    features: ['3 projets en parallèle', 'WBS + RACI + Gantt', 'Export PDF', 'IA Haiku (50 générations/mois)', 'Support email'],
    tag: null,
  },
  {
    name: 'Pro', price: 39, period: '/mois', color: '#7B5EFF', border: '#7B5EFF', bg: '#faf5ff',
    cta: 'Essai 7j gratuit →', ctaBg: 'linear-gradient(135deg,#7B5EFF,#3b82f6)', ctaColor: '#fff',
    features: ['10 projets en parallèle', 'Tous les outils PMO', 'Export Excel + PDF + Word', 'IA Sonnet (150 générations/mois)', 'EVM, PERT, Courbes S', 'Templates sectoriels'],
    tag: '⭐ Le plus populaire',
  },
  {
    name: 'Premium', price: 69, period: '/mois', color: '#FF8C00', border: '#fed7aa', bg: '#fff7ed',
    cta: 'Essai 7j gratuit →', ctaBg: 'linear-gradient(135deg,#FF8C00,#f59e0b)', ctaColor: '#fff',
    features: ['25 projets + historique', 'Tout ce qui est en Pro', 'IA Sonnet (300 générations/mois)', 'Simulateur PMP® 225Q', 'Export PowerPoint', 'Archive projets'],
    tag: '👑 Pour les PMO',
  },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Chef de projet IT, BNP Paribas', text: 'PMO AI Studio m\'a permis de réduire mon temps de reporting de 60%. Le générateur WBS avec l\'IA est bluffant.', avatar: 'SM', color: '#1e40af' },
  { name: 'Karim B.', role: 'PMO Manager, Orange', text: 'Enfin un outil qui combine la gestion de projet et l\'IA. Le simulateur de certifications m\'a aidé à décrocher ma PMP®.', avatar: 'KB', color: '#7B5EFF' },
  { name: 'Marie L.', role: 'Directrice de projet, Thales', text: 'L\'EVM automatisé nous fait gagner un temps précieux. Le dashboard de suivi est exactement ce dont notre équipe avait besoin.', avatar: 'ML', color: '#059669' },
]

// ── COMPOSANT CARROUSEL ──────────────────────────────────────────────────

function AppCarousel() {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const goTo = (idx: number) => {
    if (animating || idx === active) return
    setAnimating(true)
    setTimeout(() => {
      setActive(idx)
      setAnimating(false)
    }, 200)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % SCREENSHOTS.length)
    }, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const slide = SCREENSHOTS[active]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Onglets */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
        {SCREENSHOTS.map((s, i) => (
          <button key={i} onClick={() => { goTo(i); if (timerRef.current) clearInterval(timerRef.current) }}
            style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${i === active ? s.color : '#e2e8f0'}`,
              background: i === active ? s.color : '#fff',
              color: i === active ? '#fff' : '#64748b',
              transition: 'all 0.25s',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Slide */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'center' }}>
        {/* Screenshot */}
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          boxShadow: `0 0 0 1px ${slide.color}33, 0 24px 80px ${slide.glow}`,
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(8px) scale(0.99)' : 'translateY(0) scale(1)',
          transition: 'opacity 0.2s, transform 0.2s',
        }}>
          {/* Browser chrome */}
          <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            <div style={{ flex: 1, background: '#334155', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>
              pmoai.studio/dashboard
            </div>
          </div>
          <img
            src={slide.src}
            alt={slide.title}
            style={{ width: '100%', display: 'block', aspectRatio: '16/8', objectFit: 'cover', objectPosition: 'top' }}
          />
        </div>

        {/* Description */}
        <div style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.2s', transitionDelay: animating ? '0s' : '0.1s' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: `${slide.color}18`, border: `1px solid ${slide.color}44`,
            borderRadius: 20, padding: '5px 14px', fontSize: 12, color: slide.color,
            fontWeight: 700, marginBottom: 16,
          }}>
            {slide.label}
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.3 }}>
            {slide.title}
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 20px' }}>
            {slide.desc}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {slide.tags.map(t => (
              <span key={t} style={{
                padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: `${slide.color}12`, color: slide.color, border: `1px solid ${slide.color}30`,
              }}>{t}</span>
            ))}
          </div>
          <Link href="/auth/inscription" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: slide.color, color: '#fff', textDecoration: 'none',
          }}>
            Essayer gratuitement →
          </Link>
        </div>
      </div>

      {/* Indicateurs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {SCREENSHOTS.map((s, i) => (
          <button key={i} onClick={() => goTo(i)}
            style={{
              width: i === active ? 28 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === active ? slide.color : '#e2e8f0',
              transition: 'all 0.3s',
            }} />
        ))}
      </div>
    </div>
  )
}

// ── PAGE PRINCIPALE ──────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', 'Segoe UI', Arial, sans-serif", color: '#1e293b', background: '#fff', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #f1f5f9' : '1px solid transparent',
        padding: '0 5%',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#1e40af,#7B5EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 900 }}>P</div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>PMO AI Studio</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/demo" style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#7B5EFF', textDecoration: 'none', border: '1px solid rgba(123,94,255,0.3)' }}>
              👁️ Démo live
            </Link>
            <Link href="/auth/connexion" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>
              Connexion
            </Link>
            <Link href="/auth/inscription" style={{ padding: '9px 22px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', textDecoration: 'none' }}>
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #f0f4ff 0%, #f8faff 40%, #fdf4ff 100%)',
        padding: '80px 5% 70px', textAlign: 'center',
      }}>
        {/* Grille de fond subtile */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(123,94,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
          {/* Badge standards */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
            {STANDARDS.map(s => (
              <span key={s.name} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>
                {s.name}
              </span>
            ))}
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 5.5vw, 56px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 22px', letterSpacing: '-1.5px' }}>
            Pilotez vos projets selon les{' '}
            <span style={{ background: 'linear-gradient(135deg,#1e40af,#7B5EFF,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              standards internationaux
            </span>
            {' '}— tous secteurs, tous types
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: '#64748b', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
            PMO AI Studio réunit les outils PMO professionnels (PMBOK® 7, PRINCE2®, SAFe®), la puissance de l'IA Claude et la préparation aux certifications dans une seule plateforme. Pour les managers qui livrent avec excellence.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <Link href="/auth/inscription" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '15px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800,
              background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', textDecoration: 'none',
              boxShadow: '0 6px 28px rgba(59,130,246,0.4)',
            }}>
              🚀 Commencer gratuitement
            </Link>
            <Link href="/demo" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '15px 26px', borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: '#fff', color: '#1e293b', textDecoration: 'none',
              border: '1.5px solid #e2e8f0',
            }}>
              👁️ Voir le projet démo
            </Link>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>✓ Sans carte bancaire &nbsp;·&nbsp; ✓ 7 jours d'essai gratuit &nbsp;·&nbsp; ✓ Annulation à tout moment</p>

          {/* Dashboard hero screenshot */}
          <div style={{ marginTop: 52, position: 'relative' }}>
            {/* Floating pills */}
            <div style={{ position: 'absolute', top: -16, left: '5%', background: '#fff', border: '1px solid #bbf7d0', borderRadius: 12, padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12, fontWeight: 700, color: '#166534', zIndex: 2, animation: 'floatA 3s ease-in-out infinite' }}>
              ✅ CPI 1.12 — Dans le vert
            </div>
            <div style={{ position: 'absolute', top: 24, right: '3%', background: '#fff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12, fontWeight: 700, color: '#5b21b6', zIndex: 2, animation: 'floatB 3s 1s ease-in-out infinite' }}>
              🤖 WBS généré par l'IA en 4s
            </div>
            <div style={{ position: 'absolute', bottom: 32, left: '2%', background: '#fff', border: '1px solid #fed7aa', borderRadius: 12, padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12, fontWeight: 700, color: '#92400e', zIndex: 2, animation: 'floatC 3s 0.5s ease-in-out infinite' }}>
              ⚠️ 2 risques critiques mitigés
            </div>

            <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 0 1px #e2e8f0, 0 32px 100px rgba(30,64,175,0.15)', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                <div style={{ flex: 1, background: '#334155', borderRadius: 6, padding: '4px 14px', fontSize: 11, color: '#94a3b8', marginLeft: 10 }}>
                  pmoai.studio/dashboard — Migration Azure · 850k€ · 18 mois
                </div>
              </div>
              <img src="/screenshots/dashboard-evm.png" alt="PMO AI Studio Dashboard" style={{ width: '100%', display: 'block', aspectRatio: '16/7', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes floatC { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
          @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '32px 5%' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, textAlign: 'center' }}>
          {[
            { v: '10+', l: 'Outils PMO', icon: '🛠️' },
            { v: '225', l: 'Questions PMP®', icon: '🎓' },
            { v: '6', l: 'Standards PMO', icon: '📋' },
            { v: '5s', l: 'WBS par IA', icon: '⚡' },
            { v: '7j', l: 'Essai gratuit', icon: '✅' },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TYPES DE PROJETS ── */}
      <section style={{ padding: '72px 5%', background: 'linear-gradient(160deg,#f0f4ff,#fdf4ff)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7B5EFF', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Tous secteurs</div>
            <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px' }}>
              Conçu pour piloter n'importe quel type de projet
            </h2>
            <p style={{ fontSize: 15, color: '#64748b' }}>Méthodes reconnues mondialement, adaptées à chaque secteur.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {PROJECT_TYPES.map(p => (
              <div key={p.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 18px', border: '1px solid #e2e8f0', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(123,94,255,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{p.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARROUSEL SCREENSHOTS ── */}
      <section style={{ padding: '72px 5%', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Aperçu de l'application</div>
          <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px' }}>
            Tout ce qu'il faut pour piloter avec excellence
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
            6 modules, 1 plateforme — cliquez sur les onglets ou laissez défiler automatiquement.
          </p>
        </div>
        <AppCarousel />
      </section>

      {/* ── IA STRIP ── */}
      <section style={{ padding: '0 5% 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 24, background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)', padding: '48px 48px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,94,255,0.2), transparent 70%)', pointerEvents: 'none' }} />
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(123,94,255,0.2)', border: '1px solid rgba(123,94,255,0.4)', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 16 }}>
              🤖 Propulsé par Claude Sonnet (Anthropic)
            </div>
            <h2 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.5px', lineHeight: 1.3 }}>
              L'IA qui parle le langage du chef de projet
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, margin: '0 0 24px' }}>
              Demandez à l'IA de générer votre WBS, analyser vos risques, rédiger votre note d'arbitrage ou préparer votre revue de projet. Claude comprend PMBOK, PRINCE2®, EVM et le vocabulaire PMO.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['Générer un WBS', 'Analyser les risques', 'Rédiger un RETEX', 'Préparer une revue projet', 'Calculer l\'EAC'].map(a => (
                <span key={a} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
          {/* Terminal IA */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '18px', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 8 }}>{'>'} Vous :</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, fontStyle: 'italic' }}>
              "Génère un WBS & Dictionnaire WBS pour migration Azure, 3 phases, 12 livrables"
            </div>
            <div style={{ fontSize: 10, color: '#7B5EFF', marginBottom: 6 }}>{'>'} Claude :</div>
            <div style={{ fontSize: 10, color: '#c4b5fd', lineHeight: 1.7 }}>
              📦 WBS Migration Azure<br />
              ├── 1. Infrastructure Cloud<br />
              │ &nbsp; ├── 1.1 Audit environnement<br />
              │ &nbsp; ├── 1.2 Config. réseau & sécu<br />
              │ &nbsp; └── 1.3 Provisioning VMs<br />
              ├── 2. Migration Data<br />
              │ &nbsp; └── ...<br />
              <span style={{ display: 'inline-block', width: 6, height: 12, background: '#7B5EFF', verticalAlign: 'middle', animation: 'blink 1s infinite' }} />
            </div>
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
          </div>
        </div>
      </section>

      {/* ── YOUTUBE ── */}
      <section style={{ padding: '72px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>PMO AI Studio — YouTube</div>
            <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px' }}>
              Apprenez le management de projet en regardant
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
              Formations, tutoriels et conseils PMO sur notre chaîne YouTube. Préparez vos certifications gratuitement.
            </p>
          </div>
          {/* Placeholder YouTube élégant */}
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {/* Thumbnails grid mock */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, width: '70%', marginBottom: 32, opacity: 0.4 }}>
                  {[
                    { color: '#1e40af', label: 'EVM expliqué' },
                    { color: '#7B5EFF', label: 'WBS & Dictionnaire WBS' },
                    { color: '#059669', label: 'Gantt avancé' },
                  ].map(t => (
                    <div key={t.label} style={{ aspectRatio: '16/9', background: t.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      {t.label}
                    </div>
                  ))}
                </div>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16, boxShadow: '0 0 0 8px rgba(239,68,68,0.2)' }}>▶</div>
                <p style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.3px' }}>PMO AI Studio</p>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px' }}>Formation · Certifications · Management de projet</p>
                <a href="https://www.youtube.com/@PMOAIStudio" target="_blank" rel="noopener noreferrer"
                  style={{ padding: '12px 28px', background: '#ef4444', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  🎬 S'abonner à la chaîne →
                </a>
                <p style={{ color: '#475569', fontSize: 11, marginTop: 12 }}>Prochaines vidéos : EVM · WBS & Dictionnaire WBS · Gantt avec chemin critique</p>
              </div>
            </div>
          </div>
          {/* Thèmes à venir */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 20 }}>
            {[
              { icon: '💰', title: 'Maîtriser l\'EVM', sub: 'CPI, SPI, EAC expliqués', color: '#3b82f6', bg: '#eff6ff' },
              { icon: '🗂️', title: 'WBS & Dictionnaire WBS', sub: 'Décomposer n\'importe quel projet', color: '#7B5EFF', bg: '#faf5ff' },
              { icon: '⚠️', title: 'Gestion des risques', sub: 'RAID register en pratique', color: '#ef4444', bg: '#fef2f2' },
              { icon: '🎓', title: 'Préparer la PMP®®', sub: '225 questions & stratégies', color: '#059669', bg: '#f0fdf4' },
            ].map(v => (
              <div key={v.title} style={{ background: v.bg, border: `1px solid ${v.color}33`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{v.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{v.title}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{v.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section style={{ padding: '72px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Blog & Ressources</div>
              <h2 style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>Conseils, méthodes & bonnes pratiques</h2>
            </div>
            <a href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#f1f5f9', color: '#475569', textDecoration: 'none', border: '1px solid #e2e8f0' }}>
              Voir tous les articles →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
            {/* Article featured */}
            <a href="/blog" style={{ textDecoration: 'none', borderRadius: 18, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', display: 'block' }}>
              <div style={{ position: 'relative' }}>
                <img src="/screenshots/export-evm.png" alt="EVM Article" style={{ width: '100%', display: 'block', height: 220, objectFit: 'cover', objectPosition: 'top' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95), transparent)', padding: '32px 20px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: '#3b82f6', color: '#fff' }}>EVM & Budget</span>
                </div>
              </div>
              <div style={{ padding: '18px 20px', background: '#f8fafc' }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', lineHeight: 1.4 }}>Maîtriser l'EVM sur un vrai projet de migration IT</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px', lineHeight: 1.6 }}>CPI, SPI, EAC expliqués avec des données réelles d'un projet bancaire 850k€.</p>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>Lire l'article →</span>
              </div>
            </a>
            {/* 3 articles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🗂️', tag: 'Gestion de projet', color: '#3b82f6', bg: '#eff6ff', title: 'Structurer un projet complexe avec le WBS', time: '5 min' },
                { icon: '⚠️', tag: 'RAID & Risques', color: '#ef4444', bg: '#fef2f2', title: 'Les 10 erreurs fatales en gestion de risques', time: '6 min' },
                { icon: '🎓', tag: 'Certification', color: '#7B5EFF', bg: '#faf5ff', title: 'Comment décrocher la PMP®® en 3 mois', time: '8 min' },
              ].map(post => (
                <a key={post.title} href="/blog" style={{ textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = post.color + '44' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: post.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{post.icon}</div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: post.bg, color: post.color, display: 'inline-block', marginBottom: 4 }}>{post.tag} · {post.time}</span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 3px', lineHeight: 1.4 }}>{post.title}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '72px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Tarifs</div>
            <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px' }}>Commencez gratuitement, évoluez à votre rythme</h2>
            <p style={{ fontSize: 15, color: '#64748b' }}>7 jours d'essai gratuit sur tous les plans payants. Annulation à tout moment.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, alignItems: 'start' }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ padding: '28px 22px', background: plan.bg, border: `2px solid ${plan.name === 'Pro' ? plan.color : plan.border}`, borderRadius: 20, position: 'relative', boxShadow: plan.name === 'Pro' ? `0 8px 40px ${plan.color}22` : 'none', transition: 'transform 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
                {plan.tag && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {plan.tag}
                  </div>
                )}
                <h3 style={{ fontSize: 17, fontWeight: 800, color: plan.color, margin: '0 0 8px' }}>{plan.name}</h3>
                <div style={{ margin: '0 0 20px' }}>
                  <span style={{ fontSize: 38, fontWeight: 900, color: '#0f172a' }}>{plan.price === 0 ? '0' : `${plan.price}€`}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151' }}>
                      <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/inscription" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', background: plan.ctaBg, color: plan.ctaColor }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

          {/* Note quota IA */}
          <div style={{ maxWidth: 1100, margin: '16px auto 0', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '14px 20px', fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
            💡 <strong>Comment fonctionne le quota IA ?</strong> Une génération = créer un outil PMO (WBS, Gantt, RAID, EVM...) depuis zéro avec l&apos;IA. Une fois créé, votre outil est <strong>sauvegardé et modifiable à tout moment</strong> sans consommer de quota. Le quota ne s&apos;applique qu&apos;aux nouvelles créations.
          </div>

          {/* FAQ pricing */}
          <div style={{ maxWidth: 1100, margin: '16px auto 0', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 24px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>❓ Questions fréquentes</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ["L'essai est-il gratuit ?", "Oui, 7 jours sans carte bancaire. Annulation libre avant la fin."],
                ["Puis-je annuler à tout moment ?", "Oui, sans pénalités. Votre accès reste actif jusqu'à la fin de la période."],
                ["La TVA est-elle incluse ?", "Prix HT. TVA appliquée selon votre pays au moment du paiement."],
                ["Qu'est-ce qu'une génération IA ?", "Créer un outil PMO depuis zéro avec l'IA. La modification ne consomme pas de quota."],
                ["Mes données sont-elles sécurisées ?", "Oui, hébergées sur Supabase (EU) avec chiffrement complet."],
              ].map(([q, a]) => (
                <div key={q} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>{q}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>

      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section style={{ padding: '72px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px' }}>Ce que disent nos utilisateurs</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ padding: '24px', background: '#f8fafc', borderRadius: 18, border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.07)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                <div style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 2, marginBottom: 14 }}>★★★★★</div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: '0 0 18px', fontStyle: 'italic' }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${t.color},#7B5EFF)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#1e293b' }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '0 5% 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 24, background: 'linear-gradient(135deg,#1e40af,#7B5EFF,#3b82f6)', backgroundSize: '200% auto', padding: '64px 48px', textAlign: 'center', animation: 'gradientShift 6s ease infinite', backgroundPosition: '0% 50%' }}>
          <style>{`@keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}`}</style>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
            Prêt à piloter vos projets avec excellence ?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', margin: '0 0 36px', lineHeight: 1.7, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Rejoignez les chefs de projet qui utilisent les standards internationaux et l'IA pour livrer plus vite, mieux et sans stress.
          </p>
          <Link href="/auth/inscription" style={{ display: 'inline-block', padding: '16px 40px', borderRadius: 12, fontSize: 16, fontWeight: 800, background: '#fff', color: '#1e40af', textDecoration: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
            Commencer gratuitement →
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Accès immédiat &nbsp;·&nbsp; ✓ Support inclus</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a', padding: '36px 5%', color: '#94a3b8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1e40af,#7B5EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>P</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>PMO AI Studio</span>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <Link href="/pricing" style={{ color: '#64748b', textDecoration: 'none' }}>Tarifs</Link>
            <Link href="/demo" style={{ color: '#64748b', textDecoration: 'none' }}>Démo</Link>
            <Link href="/auth/connexion" style={{ color: '#64748b', textDecoration: 'none' }}>Connexion</Link>
            <a href="https://www.youtube.com/@PMOAIStudio" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>YouTube</a>
            <a href="mailto:support@pmoai.studio" style={{ color: '#64748b', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>© {new Date().getFullYear()} PMO AI Studio · pmoai.studio</p>
        </div>
        {/* Disclaimer marques déposées */}
        <div style={{ borderTop: '1px solid #1e293b', marginTop: 24, paddingTop: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: '#334155', lineHeight: 1.7, maxWidth: 900, margin: '0 auto' }}>
            PMI®, PMP®, PMBOK® sont des marques déposées du Project Management Institute, Inc. PRINCE2® et MSP® sont des marques déposées d&apos;Axelos Limited, gérées par PeopleCert Group. SAFe® est une marque déposée de Scaled Agile, Inc. PMO AI Studio n&apos;est pas affilié à ces organismes et ne propose pas de formations officiellement accréditées par ces entités.
          </p>
        </div>
      </footer>
    </div>
  )
}
