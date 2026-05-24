'use client'

import { useEffect, useState, useCallback } from 'react'

interface MRRData {
  mrr: number
  arr: number
  totalActive: number
  trialing: number
  pastDue: number
  canceled: number
  churnRate: number
  ltv: number
  planCounts: { starter: number; pro: number; premium: number }
  recentPayments: Array<{ id: string; amount: number; currency: string; created: number }>
  failedPayments: number
  error?: string
}

interface SubData {
  mrr: number
  total: number
  active: number
  trial: number
  pastDue: number
  subscriptions: Array<{
    id: string; full_name: string; email: string; plan: string
    amount: number; subscription_status: string; plan_started_at: string
    current_period_end: string; stripe_subscription_id: string
  }>
}

const PLAN_CFG: Record<string, { color: string; bg: string; border: string }> = {
  starter: { color: '#36B37E', bg: 'rgba(54,179,126,0.12)',  border: 'rgba(54,179,126,0.3)' },
  pro:     { color: '#7B5EFF', bg: 'rgba(123,94,255,0.12)', border: 'rgba(123,94,255,0.3)' },
  premium: { color: '#FF8C00', bg: 'rgba(255,140,0,0.12)',   border: 'rgba(255,140,0,0.3)' },
}

export default function AdminRevenuePage() {
  const [mrr, setMrr]     = useState<MRRData | null>(null)
  const [sub, setSub]     = useState<SubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource]   = useState<'stripe' | 'supabase'>('supabase')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [mrrRes, subRes] = await Promise.all([
        fetch('/api/admin/mrr'),
        fetch('/api/admin/subscriptions'),
      ])
      const mrrData = await mrrRes.json() as MRRData
      const subData = await subRes.json() as SubData

      if (mrrData.error) setSource('supabase')
      else setSource('stripe')

      setMrr(mrrData)
      setSub(subData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, ...extra,
  })

  const displayMrr = source === 'stripe' ? (mrr?.mrr ?? 0) : (sub?.mrr ?? 0)
  const displayArr = source === 'stripe' ? (mrr?.arr ?? 0) : displayMrr * 12
  const displayActive = source === 'stripe' ? (mrr?.totalActive ?? 0) : (sub?.active ?? 0)

  const kpis = [
    { label: 'MRR',          value: `${displayMrr}€`,                  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   bl: '#22c55e', icon: '💰', sub: source === 'stripe' ? 'Stripe réel' : 'Estimé' },
    { label: 'ARR',          value: `${displayArr}€`,                  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  bl: '#3b82f6', icon: '📈', sub: 'Projection annuelle' },
    { label: 'Abonnés actifs', value: displayActive,                   color: '#7B5EFF', bg: 'rgba(123,94,255,0.12)', bl: '#7B5EFF', icon: '👥', sub: `${mrr?.trialing ?? 0} en essai` },
    { label: 'Churn',        value: `${mrr?.churnRate ?? 0}%`,         color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   bl: '#ef4444', icon: '📉', sub: `${mrr?.canceled ?? 0} annulés/30j` },
    { label: 'LTV estimé',   value: `${mrr?.ltv ?? 0}€`,              color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  bl: '#f59e0b', icon: '🏆', sub: 'Valeur client vie' },
    { label: 'Échecs paiement', value: mrr?.failedPayments ?? 0,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   bl: '#ef4444', icon: '⚠️', sub: 'Relances nécessaires' },
  ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>💰 Revenue & MRR</h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>
            Source : {source === 'stripe' ? '✅ Stripe API (temps réel)' : '⚠️ Estimé depuis Supabase (configurer STRIPE_SECRET_KEY)'}
          </p>
        </div>
        <button onClick={load} style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
          🔄 Actualiser
        </button>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...card(), borderLeft: `3px solid ${k.bl}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: k.color, margin: '2px 0 0', lineHeight: 1 }}>{loading ? '...' : k.value}</p>
              <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '2px 0 0' }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Répartition plans + Derniers paiements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Répartition plans */}
        <div style={card()}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 16px' }}>📊 Répartition par plan</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['starter','pro','premium'] as const).map(plan => {
              const count  = source === 'stripe'
                ? (mrr?.planCounts?.[plan] ?? 0)
                : (sub?.subscriptions?.filter(s => s.plan === plan).length ?? 0)
              const total  = displayActive || 1
              const pct    = Math.round(count / total * 100)
              const cfg    = PLAN_CFG[plan]
              const amount = plan === 'starter' ? 9 : plan === 'pro' ? 17 : 23
              return (
                <div key={plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{count} · {count * amount}€/mois</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '0 0 2px' }}>Revenue mensuel total</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#22c55e', margin: 0 }}>{displayMrr}€</p>
          </div>
        </div>

        {/* Derniers paiements */}
        <div style={card()}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 16px' }}>💳 Derniers paiements</p>
          {loading ? (
            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '20px 0' }}>Chargement...</p>
          ) : source === 'stripe' && mrr?.recentPayments && mrr.recentPayments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mrr.recentPayments.slice(0, 6).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{p.amount}€</p>
                    <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '2px 0 0' }}>
                      {new Date(p.created * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>✓ Payé</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(sub?.subscriptions ?? []).slice(0, 6).map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{s.full_name || s.email}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '2px 0 0' }}>{s.plan} · {s.amount}€/mois</p>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 600 }}>
                    {s.subscription_status}
                  </span>
                </div>
              ))}
              {(sub?.subscriptions ?? []).length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '20px 0' }}>Aucun abonné payant</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alertes */}
      {(mrr?.pastDue ?? 0) > 0 && (
        <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#ef4444', fontSize: 13 }}>{mrr?.pastDue} paiement(s) en retard</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-3)' }}>Vérifier dans le dashboard Stripe → Subscriptions → Past due</p>
          </div>
        </div>
      )}
    </div>
  )
}
