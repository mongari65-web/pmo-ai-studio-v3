'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EmailLog {
  id: string
  email_type: string
  recipient: string
  subject: string
  status: string
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
  welcome:                    { label: 'Bienvenue',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
  project_created:            { label: 'Nouveau projet',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
  upgrade_pro:                { label: 'Upgrade Pro',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  password_reset:             { label: 'Reset MDP',        color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)'  },
  project_shared:             { label: 'Partage',          color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)'  },
  broadcast_new_feature:      { label: 'Nouvelle fonct.', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)'   },
  broadcast_upsell_pro:       { label: 'Upsell Pro',      color: '#7B5EFF', bg: 'rgba(123,94,255,0.12)',  border: 'rgba(123,94,255,0.3)'  },
  broadcast_feedback_response:{ label: 'Feedback',         color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
  broadcast_complaint_response:{ label: 'Réclamation',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
  broadcast_weekly_digest:    { label: 'Digest',           color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
}

const BROADCAST_TYPES = [
  { value: 'new_feature',       label: '🚀 Nouvelle fonctionnalité',    targets: ['all'] },
  { value: 'upsell_pro',        label: '⚡ Upsell Free → Pro',           targets: ['free'] },
  { value: 'feedback_response', label: '💬 Réponse feedback',            targets: ['specific'] },
  { value: 'complaint_response',label: '🔧 Réponse réclamation',         targets: ['specific'] },
  { value: 'weekly_digest',     label: '📊 Digest hebdomadaire',         targets: ['all'] },
]

const PLAN_OPTIONS = [
  { value: 'all',     label: 'Tous les utilisateurs' },
  { value: 'free',    label: 'Plan Gratuit uniquement' },
  { value: 'starter', label: 'Plan Starter uniquement' },
  { value: 'pro',     label: 'Plan Pro uniquement' },
  { value: 'premium', label: 'Plan Premium uniquement' },
  { value: 'free,starter', label: 'Gratuit + Starter' },
  { value: 'pro,premium',  label: 'Pro + Premium (payants)' },
]

export default function AdminEmailsPage() {
  const [supabase]  = useState(() => createClient())
  const [tab, setTab] = useState<'broadcast' | 'test' | 'logs'>('broadcast')
  const [logs, setLogs]   = useState<EmailLog[]>([])
  const [stats, setStats] = useState<EmailStat[]>([])
  const [loading, setLoading] = useState(true)

  // Broadcast state
  const [bType, setBType]       = useState('new_feature')
  const [bPlans, setBPlans]     = useState('all')
  const [bParams, setBParams]   = useState<Record<string, string>>({})
  const [bSending, setBSending] = useState(false)
  const [bResult, setBResult]   = useState<{ success?: boolean; results?: { sent: number; failed: number; skipped: number }; error?: string; preview?: boolean } | null>(null)

  // Test state
  const [testType, setTestType] = useState('project_created')
  const [testTo, setTestTo]     = useState('hafid.touil@icloud.com')
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string; messageId?: string } | null>(null)
  const [sending, setSending]   = useState(false)
  const [filter, setFilter]     = useState<'all' | 'sent' | 'failed'>('all')

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
    setSending(true); setTestResult(null)
    try {
      const res  = await fetch('/api/email/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: testType, to: testTo }) })
      const data = await res.json() as { success?: boolean; error?: string; messageId?: string }
      setTestResult(data)
      if (data.success) setTimeout(loadData, 1500)
    } catch { setTestResult({ error: 'Erreur réseau' }) }
    finally { setSending(false) }
  }

  const sendBroadcast = async (preview = false) => {
    setBSending(true); setBResult(null)
    try {
      const targetPlans = bPlans === 'all' ? ['all'] : bPlans.split(',')
      const res  = await fetch('/api/email/broadcast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: bType, targetPlans, params: bParams, preview }),
      })
      const data = await res.json() as { success?: boolean; results?: { sent: number; failed: number; skipped: number }; error?: string; preview?: boolean }
      setBResult(data)
      if (data.success) setTimeout(loadData, 2000)
    } catch { setBResult({ error: 'Erreur réseau' }) }
    finally { setBSending(false) }
  }

  const filtered  = logs.filter(l => filter === 'all' || l.status === filter)
  const totalSent = logs.length
  const totalOk   = logs.filter(l => l.status === 'sent').length
  const totalFail = logs.filter(l => l.status === 'failed').length
  const rate      = totalSent > 0 ? Math.round(totalOk * 100 / totalSent) : 0

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, ...extra })
  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-1)', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }

  const currentType = BROADCAST_TYPES.find(t => t.value === bType)

  const renderBroadcastFields = () => {
    switch (bType) {
      case 'new_feature': return (
        <>
          <div><label style={lbl}>Titre de la fonctionnalité *</label><input style={inp} placeholder="ex: Export PowerPoint automatique" value={bParams.featureTitle || ''} onChange={e => setBParams(p => ({...p, featureTitle: e.target.value}))} /></div>
          <div><label style={lbl}>Description *</label><textarea style={{...inp, height: 80, resize: 'vertical'}} placeholder="Décrivez la nouvelle fonctionnalité..." value={bParams.featureDescription || ''} onChange={e => setBParams(p => ({...p, featureDescription: e.target.value}))} /></div>
          <div><label style={lbl}>Lien (optionnel)</label><input style={inp} placeholder="https://pmo-ai-studio.vercel.app/..." value={bParams.featureUrl || ''} onChange={e => setBParams(p => ({...p, featureUrl: e.target.value}))} /></div>
        </>
      )
      case 'upsell_pro': return (
        <div style={{background:'rgba(123,94,255,0.06)',border:'1px solid rgba(123,94,255,0.2)',borderRadius:8,padding:12}}>
          <p style={{fontSize:12,color:'var(--text-2)',margin:0}}>📣 Email upsell automatique — ciblé sur les utilisateurs Free. Le contenu est pré-rempli avec les avantages du plan Pro.</p>
        </div>
      )
      case 'feedback_response': return (
        <>
          <div><label style={lbl}>Email du destinataire *</label><input style={inp} placeholder="user@exemple.com" value={bParams.recipientEmail || ''} onChange={e => setBParams(p => ({...p, recipientEmail: e.target.value}))} /></div>
          <div><label style={lbl}>Feedback original</label><textarea style={{...inp, height: 60, resize: 'vertical'}} placeholder="Le feedback que l'utilisateur a soumis..." value={bParams.originalFeedback || ''} onChange={e => setBParams(p => ({...p, originalFeedback: e.target.value}))} /></div>
          <div><label style={lbl}>Votre réponse *</label><textarea style={{...inp, height: 100, resize: 'vertical'}} placeholder="Votre réponse détaillée..." value={bParams.response || ''} onChange={e => setBParams(p => ({...p, response: e.target.value}))} /></div>
          <div><label style={lbl}>Votre nom</label><input style={inp} placeholder="Hafid, équipe PMO AI Studio" value={bParams.senderName || ''} onChange={e => setBParams(p => ({...p, senderName: e.target.value}))} /></div>
        </>
      )
      case 'complaint_response': return (
        <>
          <div><label style={lbl}>Email du destinataire *</label><input style={inp} placeholder="user@exemple.com" value={bParams.recipientEmail || ''} onChange={e => setBParams(p => ({...p, recipientEmail: e.target.value}))} /></div>
          <div><label style={lbl}>Sujet de la réclamation *</label><input style={inp} placeholder="ex: Problème de paiement, Bug sur le Gantt..." value={bParams.complaintSubject || ''} onChange={e => setBParams(p => ({...p, complaintSubject: e.target.value}))} /></div>
          <div><label style={lbl}>Votre réponse *</label><textarea style={{...inp, height: 100, resize: 'vertical'}} placeholder="Explication et excuses..." value={bParams.response || ''} onChange={e => setBParams(p => ({...p, response: e.target.value}))} /></div>
          <div><label style={lbl}>Résolution (optionnel)</label><textarea style={{...inp, height: 60, resize: 'vertical'}} placeholder="Ce qui a été corrigé ou compensé..." value={bParams.resolution || ''} onChange={e => setBParams(p => ({...p, resolution: e.target.value}))} /></div>
          <div><label style={lbl}>Votre nom</label><input style={inp} placeholder="Hafid, équipe PMO AI Studio" value={bParams.senderName || ''} onChange={e => setBParams(p => ({...p, senderName: e.target.value}))} /></div>
        </>
      )
      case 'weekly_digest': return (
        <div style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,padding:12}}>
          <p style={{fontSize:12,color:'var(--text-2)',margin:0}}>📊 Le digest hebdomadaire récupère automatiquement les données de chaque utilisateur (projets actifs, quota IA utilisé) et génère un email personnalisé.</p>
        </div>
      )
      default: return null
    }
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>📧 Notifications Email</h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>Resend · pmoai.studio · 100 derniers logs</p>
        </div>
        <button onClick={loadData} style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
          🔄 Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total envoyés', value: totalSent,  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'border-l-blue-400',   icon: '📤', bl: '#3b82f6' },
          { label: 'Succès',        value: totalOk,    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'border-l-green-400',  icon: '✅', bl: '#22c55e' },
          { label: 'Échecs',        value: totalFail,  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'border-l-red-400',    icon: '❌', bl: '#ef4444' },
          { label: 'Taux succès',   value: rate + '%', color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'border-l-purple-400', icon: '📊', bl: '#a855f7' },
        ].map(k => (
          <div key={k.label} style={{ ...card(), borderLeft: `3px solid ${k.bl}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: k.color, margin: '2px 0 0', lineHeight: 1 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
        {[
          { id: 'broadcast', label: '📣 Broadcast', desc: 'Envoi de masse' },
          { id: 'test',      label: '🧪 Test',      desc: 'Email individuel' },
          { id: 'logs',      label: '📋 Logs',      desc: `${totalSent} envois` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t.id ? '#3b82f6' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text-2)', transition: 'all 0.15s' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{t.label}</p>
            <p style={{ margin: 0, fontSize: 10, opacity: 0.7 }}>{t.desc}</p>
          </button>
        ))}
      </div>

      {/* ── ONGLET BROADCAST ── */}
      {tab === 'broadcast' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          <div style={card({ display: 'flex', flexDirection: 'column', gap: 16 })}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>📣 Composer un email broadcast</h2>

            <div>
              <label style={lbl}>Type d&apos;email</label>
              <select value={bType} onChange={e => { setBType(e.target.value); setBParams({}) }}
                style={{ ...inp, cursor: 'pointer' }}>
                {BROADCAST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {!['feedback_response','complaint_response'].includes(bType) && (
              <div>
                <label style={lbl}>Cibler par plan</label>
                <select value={bPlans} onChange={e => setBPlans(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                  {PLAN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}

            {renderBroadcastFields()}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => sendBroadcast(true)} disabled={bSending}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg)', color: 'var(--text-2)', fontWeight: 600, fontSize: 13 }}>
                {bSending ? '⏳...' : '👁 Prévisualiser (envoi à moi)'}
              </button>
              <button onClick={() => sendBroadcast(false)} disabled={bSending}
                style={{ flex: 2, padding: '10px 0', borderRadius: 8, border: 'none', cursor: bSending ? 'wait' : 'pointer',
                  background: bSending ? 'var(--border)' : 'linear-gradient(135deg,#1e40af,#3b82f6)',
                  color: '#fff', fontWeight: 700, fontSize: 13 }}>
                {bSending ? '⏳ Envoi en cours...' : `📤 Envoyer à ${bPlans === 'all' ? 'tous' : 'la sélection'}`}
              </button>
            </div>

            {bResult && (
              <div style={{ padding: '12px 16px', borderRadius: 8, fontSize: 13,
                background: bResult.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${bResult.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                color: bResult.success ? '#22c55e' : '#ef4444' }}>
                {bResult.success && bResult.preview && `✅ Prévisualisation envoyée à votre email`}
                {bResult.success && !bResult.preview && bResult.results && `✅ Envoyé : ${bResult.results.sent} · Échecs : ${bResult.results.failed} · Ignorés : ${bResult.results.skipped}`}
                {bResult.error && `❌ ${bResult.error}`}
              </div>
            )}
          </div>

          {/* Panel info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={card()}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 10px' }}>ℹ️ {currentType?.label}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Cible par défaut', value: currentType?.targets.join(', ') || 'all' },
                  { label: 'Personnalisé', value: '{{nom}} dynamique' },
                  { label: 'Rate limit', value: '100ms/email' },
                  { label: 'Logging', value: 'Automatique' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-1)', fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={card()}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 10px' }}>📊 Stats 7 jours</p>
              {stats.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '10px 0' }}>Aucune donnée</p>
              ) : stats.slice(0, 5).map(s => {
                const m = TYPE_META[s.email_type] ?? { label: s.email_type, color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' }
                return (
                  <div key={s.email_type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: m.bg, color: m.color, border: `1px solid ${m.border}`, flexShrink: 0, minWidth: 70, textAlign: 'center' }}>{m.label}</span>
                    <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                      <div style={{ width: `${s.success_rate}%`, height: '100%', background: m.color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', minWidth: 24, textAlign: 'right' }}>{s.total_sent}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ONGLET TEST ── */}
      {tab === 'test' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={card({ display: 'flex', flexDirection: 'column', gap: 14 })}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>🧪 Email de test individuel</h2>
            <div>
              <label style={lbl}>Type</label>
              <select value={testType} onChange={e => setTestType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="welcome">👋 Bienvenue</option>
                <option value="project_created">📁 Nouveau projet</option>
                <option value="upgrade_pro">⭐ Upgrade Pro</option>
                <option value="password_reset">🔐 Reset mot de passe</option>
                <option value="project_shared">🤝 Partage projet</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Destinataire</label>
              <input value={testTo} onChange={e => setTestTo(e.target.value)} style={inp} placeholder="email@exemple.com" />
            </div>
            <button onClick={sendTest} disabled={sending || !testTo}
              style={{ padding: '10px 0', borderRadius: 8, border: 'none', cursor: sending ? 'wait' : 'pointer',
                background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', fontWeight: 700, fontSize: 13, opacity: !testTo ? 0.5 : 1 }}>
              {sending ? '⏳ Envoi...' : '📤 Envoyer le test'}
            </button>
            {testResult && (
              <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 12,
                background: testResult.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${testResult.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                color: testResult.success ? '#22c55e' : '#ef4444' }}>
                {testResult.success ? `✅ Envoyé ! ID : ${testResult.messageId}` : `❌ ${testResult.error}`}
              </div>
            )}
          </div>

          <div style={card()}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 14px' }}>🟢 Statut Resend</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Domaine', value: 'pmoai.studio', ok: true },
                { label: 'Expéditeur', value: 'noreply@pmoai.studio', ok: true },
                { label: 'DKIM', value: 'Vérifié', ok: true },
                { label: 'SPF', value: 'En attente propagation', ok: false },
                { label: 'API Key', value: 'Configurée', ok: true },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.ok ? '#22c55e' : '#f59e0b' }}>
                    {r.ok ? '✓' : '⏳'} {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ONGLET LOGS ── */}
      {tab === 'logs' && (
        <div style={card()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Historique des envois</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all','sent','failed'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, border: filter === f ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer', fontWeight: 600, background: filter === f ? '#3b82f6' : 'var(--bg)', color: filter === f ? '#fff' : 'var(--text-2)' }}>
                  {f === 'all' ? 'Tous' : f === 'sent' ? '✅ Succès' : '❌ Échecs'}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontSize: 13 }}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontSize: 13 }}>Aucun log — envoyez un email de test</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Type','Destinataire','Sujet','Statut','Date'].map((h,i) => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: i >= 3 ? 'center' : 'left', color: 'var(--text-3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => {
                    const m = TYPE_META[log.email_type] ?? { label: log.email_type, color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' }
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: m.bg, color: m.color, border: `1px solid ${m.border}`, whiteSpace: 'nowrap' }}>{m.label}</span>
                        </td>
                        <td style={{ padding: '10px', color: 'var(--text-2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.recipient}</td>
                        <td style={{ padding: '10px', color: 'var(--text-3)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.subject.replace('[TEST] ','').replace('[PREVIEW] ','')}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {log.status === 'sent' ? <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> : <span style={{ color: '#ef4444', fontWeight: 700 }} title={log.error_message ?? ''}>✗</span>}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                          {new Date(log.sent_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
