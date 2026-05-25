'use client'

import { useState, useEffect, useCallback } from 'react'

const SLIDES = [
  {
    img:   '/screenshots/dashboard-evm.png',
    badge: '💰 EVM & Budget',
    color: '#3b82f6',
    bg:    'rgba(59,130,246,0.1)',
    border:'rgba(59,130,246,0.25)',
    title: 'Pilotage budgétaire en temps réel',
    desc:  'Courbe S dynamique PV/EV/AC, CPI, SPI, EAC calculés automatiquement. Détectez les dérives avant qu\'il ne soit trop tard.',
    tags:  ['CPI · SPI · EAC', 'Courbe S', 'Alertes dérive'],
  },
  {
    img:   '/screenshots/workpackages.png',
    badge: '📦 Work Packages',
    color: '#7B5EFF',
    bg:    'rgba(123,94,255,0.1)',
    border:'rgba(123,94,255,0.25)',
    title: 'Organisez vos livrables par Work Packages',
    desc:  'Cartes colorées par phase, budget, responsables et livrables associés. Vue kanban claire pour toute l\'équipe.',
    tags:  ['Cartes WP', 'Budget par livrable', 'Phases colorées'],
  },
  {
    img:   '/screenshots/gantt.png',
    badge: '📅 Planning Gantt',
    color: '#22c55e',
    bg:    'rgba(34,197,94,0.1)',
    border:'rgba(34,197,94,0.25)',
    title: 'Planning visuel avec chemin critique',
    desc:  'Gantt interactif avec phases, jalons, % d\'avancement et chemin critique mis en évidence automatiquement.',
    tags:  ['Chemin critique', '% Avancement', 'Jalons'],
  },
  {
    img:   '/screenshots/raid.png',
    badge: '⚠️ RAID Register',
    color: '#ef4444',
    bg:    'rgba(239,68,68,0.1)',
    border:'rgba(239,68,68,0.25)',
    title: 'Gérez risques et actions en un endroit',
    desc:  'Risques, Actions, Issues, Décisions — tout centralisé avec priorités, responsables et plans de mitigation.',
    tags:  ['Risques & Actions', 'Priorités critiques', 'Mitigation'],
  },
  {
    img:   '/screenshots/GANTT-Template.png',
    badge: '📊 Templates Excel',
    color: '#f59e0b',
    bg:    'rgba(245,158,11,0.1)',
    border:'rgba(245,158,11,0.25)',
    title: 'Templates Excel pro téléchargeables',
    desc:  'Gantt Master, EVM Courbes S, RAID Register, RACI — tous les modèles professionnels prêts à l\'emploi.',
    tags:  ['Gantt Master', 'EVM Courbes S', 'RAID Register'],
  },
  {
    img:   '/screenshots/gestion-ressources.png',
    badge: '👥 Ressources',
    color: '#06b6d4',
    bg:    'rgba(6,182,212,0.1)',
    border:'rgba(6,182,212,0.25)',
    title: 'Gérez votre équipe et les disponibilités',
    desc:  'Annuaire équipe, plan de charge, compétences et disponibilités en temps réel. Assignez les bonnes personnes aux bons projets.',
    tags:  ['Plan de charge', 'Compétences', 'Disponibilités'],
  },
]

export default function AppSlider() {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), [])
  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [paused, next])

  const slide = SLIDES[current]

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: 'relative', userSelect: 'none' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>

        {/* Texte gauche */}
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {SLIDES.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${i === current ? s.color : '#e2e8f0'}`,
                  background: i === current ? slide.bg : 'transparent',
                  color: i === current ? slide.color : '#94a3b8',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {s.badge}
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 800, color: '#1e293b', margin: '0 0 14px', lineHeight: 1.3, letterSpacing: '-0.5px' }}>
            {slide.title}
          </h3>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, margin: '0 0 24px' }}>
            {slide.desc}
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            {slide.tags.map(tag => (
              <span key={tag} style={{ fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 8, background: slide.bg, color: slide.color, border: `1px solid ${slide.border}` }}>
                ✓ {tag}
              </span>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={prev} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <div style={{ display: 'flex', gap: 6 }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, border: 'none', background: i === current ? slide.color : '#e2e8f0', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}
                />
              ))}
            </div>
            <button onClick={next} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>{current + 1} / {SLIDES.length}</span>
          </div>
        </div>

        {/* Image droite */}
        <div style={{ position: 'relative' }}>
          {/* Barre de progression */}
          <div style={{ position: 'absolute', top: -8, left: 0, right: 0, height: 3, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden', zIndex: 10 }}>
            <div style={{
              height: '100%',
              background: `linear-gradient(90deg, ${slide.color}, ${slide.color}88)`,
              borderRadius: 2,
              animation: paused ? 'none' : 'progress 4s linear',
              animationFillMode: 'forwards',
            }} />
          </div>

          <div style={{
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: `0 30px 80px rgba(0,0,0,0.15), 0 0 0 1px ${slide.border}`,
            transition: 'box-shadow 0.4s ease',
            background: '#0f172a',
          }}>
            <img
              src={slide.img}
              alt={slide.title}
              style={{ width: '100%', display: 'block', maxHeight: 420, objectFit: 'cover', objectPosition: 'top', transition: 'opacity 0.3s ease' }}
            />
          </div>

          {/* Badge flottant */}
          <div style={{
            position: 'absolute', bottom: 16, left: 16,
            background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
            borderRadius: 10, padding: '8px 14px',
            border: `1px solid ${slide.border}`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: slide.color }}>{slide.badge}</span>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}
