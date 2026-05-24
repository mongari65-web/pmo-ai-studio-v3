'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EmailLog {
  id: string
  email_type: string
  recipient: string
  subject: string
  status: string
  resend_id: string | null
  error_message: string | null
  sent_at: string
}

interface EmailStat {
  email_type: string
  total_sent: number
  success: number
  failed: number
  success_rate: number
  last_sent: string
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  welcome:         { label: 'Bienvenue',       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
  project_created: { label: 'Nouveau projet',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
  upgrade_pro:     { label: 'Upgrade Pro',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  password_reset:  { label: 'Reset MDP',       color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)'  },
  project_shared:  { label: 'Partage projet',  color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)'  },
  alert:           { label: 'Alerte',          color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
  document:        { label: 'Document',        color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)'   },
}

const EMAIL_TYPES = [
  { value: 'welcome',         label: 'Bienvenue' },
  { value: 'project_created', label: 'Nouveau projet' },
  { value: 'upgrade_pro',     label: 'Upgrade Pro' },
  { value: 'password_reset',  label: 'Reset mot de passe' },
  { value: 'project_shared',  label: 'Partage projet' },
]

export default function AdminEmailsPage() {
  const [supabase]  = useState(() => createClient())
  const [logs, setLogs]     = useState<EmailLog[]>([])
  const [stats, setStats]   = useState<EmailStat[]>([])
  const [loading, setLoading] = useState(true)
  const [testType, setTestType] = useState('project_created')
  const [testTo, setTestTo]   = useState('hafid.touil@icloud.com')
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string; messageId?: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [filter, setFilter]   = useState<'all' | 'sent' | 'failed'>('all')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [logsRes, statsRes] = await Promise.all([
        supabase.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(100),
        supabase.from('email_stats').select('*'),
      ])
      if (logsRes.data)  setLogs(logsRes.data as EmailLog[])
      if (statsRes.data) setStats(statsRes.data as EmailStat[])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  const sendTest = async () => {
    setSending(true)
    setTestResult(null)
    try {
      const res  = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: testType, to: testTo }),
      })
      const data = await res.json() as { success?: boolean; error?: string; messageId?: string }
      setTestResult(data)
      if (data.success) setTimeout(loadData, 1500)
    } catch {
      setTestResult({ error: 'Erreur réseau' })
    } finally {
      setSending(false)
    }
  }

  const filtered  = logs.filter(l => filter === 'all' || l.status === filter)
  const totalSent = logs.length
  const totalOk   = logs.filter(l => l.status === 'sent').length
  const totalFail = logs.filter(l => l.status === 'failed').length
  const rate      = totalSent > 0 ? Math.round(totalOk * 100 / totalSent) : 0

  const card = (style?: React.CSSProperties): React.CSSProperties => ({
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20,
    ...style,
  })

  const kpis = [
    { label: 'Total envoyés', value: totalSent,  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: '📤' },
    { label: 'Succès',        value: totalOk,    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: '✅' },
    { label: 'Échecs',        value: totalFail,  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '❌' },
    { label: 'Taux succès',   value: rate + '%', color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  icon: '📊' },
  ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            📧 Notifications Email
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>
            Suivi Resend — historique des 100 derniers envois
          </p>
        </div>
        <button
          onClick={loadData}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}
        >
          🔄 Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...card(), borderLeft: `3px solid ${k.color}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: k.color, margin: '2px 0 0', lineHeight: 1 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats par type + Panneau test côte à côte */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

        {/* Stats par type */}
        <div style={card()}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            📈 Statistiques par type
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400 }}>(7 derniers jours)</span>
          </p>
          {stats.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '20px 0' }}>
              Aucune donnée — envoyez un test pour commencer
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.map(s => {
                const m  = TYPE_META[s.email_type] ?? { label: s.email_type, color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' }
                const r  = Number(s.success_rate)
                const rateColor = r >= 95 ? '#22c55e' : r >= 80 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={s.email_type} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: m.bg, color: m.color, border: `1px solid ${m.border}`, minWidth: 110, textAlign: 'center', flexShrink: 0 }}>
                      {m.label}
                    </span>
                    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${r}%`, height: '100%', background: rateColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: rateColor, fontWeight: 700, minWidth: 36, textAlign: 'right' }}>{r}%</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 50, textAlign: 'right' }}>{s.total_sent} envois</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Panneau test */}
        <div style={card({ display: 'flex', flexDirection: 'column', gap: 14 })}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            🧪 Envoyer un email de test
          </p>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
            <select
              value={testType}
              onChange={e => setTestType(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-1)', cursor: 'pointer' }}
            >
              {EMAIL_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destinataire</label>
            <input
              value={testTo}
              onChange={e => setTestTo(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-1)', boxSizing: 'border-box' }}
              placeholder="email@exemple.com"
            />
          </div>

          <button
            onClick={sendTest}
            disabled={sending || !testTo}
            style={{
              padding: '10px 0', borderRadius: 8, border: 'none', cursor: sending ? 'wait' : 'pointer',
              background: sending ? 'var(--border)' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              opacity: !testTo ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {sending ? '⏳ Envoi en cours...' : '📤 Envoyer le test'}
          </button>

          {testResult && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, fontSize: 12,
              background: testResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${testResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: testResult.success ? '#22c55e' : '#ef4444',
            }}>
              {testResult.success
                ? `✅ Envoyé ! ID : ${testResult.messageId}`
                : `❌ ${testResult.error}`}
            </div>
          )}

          <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Statut Resend</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 600 }}>Connecté</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historique logs */}
      <div style={card()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Historique des envois</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'sent', 'failed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, border: 'none', cursor: 'pointer', fontWeight: 600,
                  background: filter === f ? '#3b82f6' : 'var(--bg)',
                  color: filter === f ? '#fff' : 'var(--text-2)',
                  outline: filter === f ? 'none' : '1px solid var(--border)',
                }}
              >
                {f === 'all' ? 'Tous' : f === 'sent' ? '✅ Succès' : '❌ Échecs'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontSize: 13 }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontSize: 13 }}>
            {filter === 'all'
              ? "Aucun log — envoyez un email de test pour commencer"
              : "Aucun résultat pour ce filtre"}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Type', 'Destinataire', 'Sujet', 'Statut', 'Date'].map((h, i) => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: i >= 3 ? 'center' : 'left', color: 'var(--text-3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const m = TYPE_META[log.email_type] ?? { label: log.email_type, color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' }
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: m.bg, color: m.color, border: `1px solid ${m.border}`, whiteSpace: 'nowrap' }}>
                          {m.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: 'var(--text-2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.recipient}>
                        {log.recipient}
                      </td>
                      <td style={{ padding: '10px', color: 'var(--text-3)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.subject.replace('[TEST] ', '')}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {log.status === 'sent'
                          ? <span style={{ color: '#22c55e', fontWeight: 700 }}>✓ Envoyé</span>
                          : <span style={{ color: '#ef4444', fontWeight: 700 }} title={log.error_message ?? ''}>✗ Échec</span>}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                        {new Date(log.sent_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
