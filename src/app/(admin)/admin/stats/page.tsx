'use client'

import { useEffect, useState, useCallback } from 'react'

interface StatsData {
  total: number
  free: number
  starter: number
  pro: number
  premium: number
  banned: number
  newToday: number
  newWeek: number
  aiTotal: number
  projectsTotal: number
  conversionRate: number
}

export default function AdminStatsPage() {
  const [stats, setStats]   = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/stats')
      const data = await res.json() as StatsData
      setStats(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, ...extra,
  })

  const V = (v: number | string | undefined) => loading ? '...' : (v ?? 0)

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>📊 Statistiques & Trafic</h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>Métriques utilisateurs + Vercel Analytics</p>
        </div>
        <button onClick={load} style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>🔄 Actualiser</button>
      </div>

      {/* KPIs utilisateurs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Nouveaux aujourd\'hui', value: V(stats?.newToday), color: '#22c55e', bl: '#22c55e', icon: '🆕' },
          { label: 'Nouveaux cette semaine', value: V(stats?.newWeek), color: '#3b82f6', bl: '#3b82f6', icon: '📅' },
          { label: 'Taux conversion', value: `${V(stats?.conversionRate)}%`, color: '#7B5EFF', bl: '#7B5EFF', icon: '🎯' },
          { label: 'Appels IA total', value: V(stats?.aiTotal), color: '#f59e0b', bl: '#f59e0b', icon: '🤖' },
        ].map(k => (
          <div key={k.label} style={{ ...card(), borderLeft: `3px solid ${k.bl}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: `${k.bl}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0, textTransform: 'uppercase' }}>{k.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: '2px 0 0', lineHeight: 1 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Répartition plans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card()}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 14px' }}>📊 Répartition utilisateurs</p>
          {[
            { label: 'Gratuit',  value: stats?.free ?? 0,    color: '#64748b', total: stats?.total ?? 1 },
            { label: 'Starter',  value: stats?.starter ?? 0, color: '#36B37E', total: stats?.total ?? 1 },
            { label: 'Pro',      value: stats?.pro ?? 0,     color: '#7B5EFF', total: stats?.total ?? 1 },
            { label: 'Premium',  value: stats?.premium ?? 0, color: '#FF8C00', total: stats?.total ?? 1 },
          ].map(r => {
            const pct = Math.round((r.value / r.total) * 100)
            return (
              <div key={r.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.value} ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: r.color, borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={card()}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 14px' }}>🌐 Vercel Analytics</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 8px' }}>Accéder au dashboard Analytics complet</p>
              <a href="https://vercel.com/mongari65s-projects/pmo-ai-studio-v3/analytics" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', padding: '10px 20px', background: 'linear-gradient(135deg,#000,#333)', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                ▲ Ouvrir Vercel Analytics →
              </a>
            </div>
            {[
              { label: 'Vues/page temps réel', value: 'Vercel Analytics', icon: '👁️' },
              { label: 'Core Web Vitals', value: 'LCP, FID, CLS', icon: '⚡' },
              { label: 'Géolocalisation', value: 'Pays + Ville', icon: '🌍' },
              { label: 'Appareils', value: 'Mobile vs Desktop', icon: '📱' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.icon} {r.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projets + IA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Projets créés total', value: V(stats?.projectsTotal), color: '#3b82f6', icon: '📁' },
          { label: 'Utilisateurs bannis', value: V(stats?.banned), color: '#ef4444', icon: '🚫' },
          { label: 'Total utilisateurs', value: V(stats?.total), color: '#7B5EFF', icon: '👥' },
        ].map(k => (
          <div key={k.label} style={{ ...card(), display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{k.icon}</div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0, textTransform: 'uppercase' }}>{k.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: k.color, margin: '2px 0 0', lineHeight: 1 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
