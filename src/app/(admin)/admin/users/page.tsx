'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  full_name: string
  email?: string
  plan: string
  ai_calls_count: number
  ai_calls_limit?: number
  is_banned: boolean
  is_admin?: boolean
  created_at: string
  project_count?: number
  subscription_status?: string
}

const PLAN_CFG: Record<string, { color: string; bg: string; border: string; label: string; amount: number }> = {
  free:    { color: '#64748b', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.3)', label: 'Gratuit',  amount: 0  },
  starter: { color: '#36B37E', bg: 'rgba(54,179,126,0.12)', border: 'rgba(54,179,126,0.3)',  label: 'Starter',  amount: 9  },
  pro:     { color: '#7B5EFF', bg: 'rgba(123,94,255,0.12)', border: 'rgba(123,94,255,0.3)',  label: 'Pro',      amount: 17 },
  premium: { color: '#FF8C00', bg: 'rgba(255,140,0,0.12)',  border: 'rgba(255,140,0,0.3)',   label: 'Premium',  amount: 23 },
}

const AI_LIMITS: Record<string, number> = { free: 5, starter: 100, pro: 200, premium: 300 }

export default function AdminUsersPage() {
  const [supabase]  = useState(() => createClient())
  const [users, setUsers]   = useState<UserProfile[]>([])
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionResult, setActionResult] = useState<{ userId: string; msg: string; ok: boolean } | null>(null)
  const [upgradeModal, setUpgradeModal] = useState<string | null>(null)
  const [newPlan, setNewPlan] = useState('pro')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/users')
      const data = await res.json() as { users?: UserProfile[] }
      setUsers(data.users ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const doAction = async (action: string, userId: string, plan?: string) => {
    setActionLoading(userId + action)
    try {
      const res  = await fetch('/api/admin/users/actions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, plan }),
      })
      const data = await res.json() as { success?: boolean; message?: string; error?: string }
      setActionResult({ userId, msg: data.message || data.error || 'Fait', ok: !!data.success })
      if (data.success) {
        await load()
        setUpgradeModal(null)
      }
    } finally {
      setActionLoading(null)
      setTimeout(() => setActionResult(null), 3000)
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    const matchPlan   = planFilter === 'all' || u.plan === planFilter
    return matchSearch && matchPlan
  })

  const inp: React.CSSProperties = { padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-1)', outline: 'none' }
  const card = (extra?: React.CSSProperties): React.CSSProperties => ({ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, ...extra })

  const totalPaying = users.filter(u => u.plan !== 'free').length
  const totalMrr    = users.reduce((s, u) => s + (PLAN_CFG[u.plan]?.amount ?? 0), 0)
  const totalBanned = users.filter(u => u.is_banned).length

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>👥 Gestion Utilisateurs</h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>{users.length} utilisateurs · {totalPaying} payants · {totalMrr}€ MRR</p>
        </div>
        <button onClick={load} style={{ ...inp, cursor: 'pointer' }}>🔄 Actualiser</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total', value: users.length, color: '#3b82f6', bl: '#3b82f6', icon: '👥' },
          { label: 'Payants', value: totalPaying, color: '#22c55e', bl: '#22c55e', icon: '💰' },
          { label: 'Bannis', value: totalBanned, color: '#ef4444', bl: '#ef4444', icon: '🚫' },
          { label: 'MRR estimé', value: `${totalMrr}€`, color: '#7B5EFF', bl: '#7B5EFF', icon: '📊' },
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

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher nom ou email..." style={{ ...inp, width: 280 }} />
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
          <option value="all">Tous les plans</option>
          <option value="free">Gratuit</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 'auto' }}>{filtered.length} résultats</span>
      </div>

      {/* Notification action */}
      {actionResult && (
        <div style={{ padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: actionResult.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${actionResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: actionResult.ok ? '#22c55e' : '#ef4444' }}>
          {actionResult.ok ? '✅' : '❌'} {actionResult.msg}
        </div>
      )}

      {/* Table */}
      <div style={card({ padding: 0, overflow: 'hidden' })}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Utilisateur','Plan','Quota IA','Projets','Inscrit','Statut','Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: i >= 5 ? 'center' : 'left', color: 'var(--text-3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Aucun utilisateur trouvé</td></tr>
              ) : filtered.map((user, i) => {
                const cfg     = PLAN_CFG[user.plan] ?? PLAN_CFG.free
                const limit   = user.ai_calls_limit ?? AI_LIMITS[user.plan] ?? 5
                const used    = user.ai_calls_count ?? 0
                const pct     = Math.min(Math.round(used / limit * 100), 100)
                const quotaColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e'
                const isLoading = (k: string) => actionLoading === user.id + k

                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', opacity: user.is_banned ? 0.6 : 1 }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-1)', fontSize: 13 }}>
                          {user.full_name || 'Sans nom'}
                          {user.is_admin && <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>ADMIN</span>}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-3)' }}>{user.email || user.id.slice(0, 8) + '...'}</p>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: quotaColor, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{used}/{limit}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-2)', textAlign: 'center' }}>{user.project_count ?? 0}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-3)', fontSize: 11, whiteSpace: 'nowrap' }}>
                      {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {user.is_banned
                        ? <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>🚫 Banni</span>
                        : <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e' }}>✓ Actif</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* Upgrade plan */}
                        <button
                          onClick={() => setUpgradeModal(user.id)}
                          style={{ fontSize: 10, padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-2)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          ⬆️ Plan
                        </button>
                        {/* Reset quota */}
                        <button
                          onClick={() => doAction('reset_quota', user.id)}
                          disabled={!!actionLoading}
                          style={{ fontSize: 10, padding: '4px 8px', borderRadius: 5, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)', color: '#f59e0b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {isLoading('reset_quota') ? '⏳' : '🔄 Quota'}
                        </button>
                        {/* Ban/Unban */}
                        {user.is_banned ? (
                          <button
                            onClick={() => doAction('unban', user.id)}
                            disabled={!!actionLoading}
                            style={{ fontSize: 10, padding: '4px 8px', borderRadius: 5, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)', color: '#22c55e', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {isLoading('unban') ? '⏳' : '✅ Débannir'}
                          </button>
                        ) : (
                          <button
                            onClick={() => { if (confirm(`Bannir ${user.full_name || user.email} ?`)) doAction('ban', user.id) }}
                            disabled={!!actionLoading}
                            style={{ fontSize: 10, padding: '4px 8px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {isLoading('ban') ? '⏳' : '🚫 Bannir'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal upgrade plan */}
      {upgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setUpgradeModal(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, minWidth: 320, maxWidth: 400 }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 16px' }}>⬆️ Changer le plan</h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 14px' }}>
              Utilisateur : <strong style={{ color: 'var(--text-1)' }}>
                {users.find(u => u.id === upgradeModal)?.full_name || upgradeModal.slice(0, 8)}
              </strong>
            </p>
            <select value={newPlan} onChange={e => setNewPlan(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-1)', marginBottom: 16 }}>
              <option value="free">Gratuit (0€)</option>
              <option value="starter">Starter (9€/mois)</option>
              <option value="pro">Pro (17€/mois)</option>
              <option value="premium">Premium (23€/mois)</option>
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setUpgradeModal(null)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-2)', cursor: 'pointer', fontWeight: 600 }}>
                Annuler
              </button>
              <button onClick={() => doAction('upgrade', upgradeModal, newPlan)}
                style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                ✅ Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
