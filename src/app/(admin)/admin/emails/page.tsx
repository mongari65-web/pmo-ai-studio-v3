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

const TYPE_META: Record<string, { label: string; emoji: string; cls: string }> = {
  welcome:         { label: 'Bienvenue',      emoji: '👋', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  project_created: { label: 'Nouveau projet', emoji: '📁', cls: 'bg-green-50 text-green-700 border-green-200' },
  upgrade_pro:     { label: 'Upgrade Pro',    emoji: '⭐', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  password_reset:  { label: 'Reset MDP',      emoji: '🔐', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  project_shared:  { label: 'Partage projet', emoji: '🤝', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
}

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📧 Notifications Email</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi Resend — 100 derniers logs</p>
        </div>
        <button onClick={loadData}
          className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          🔄 Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total envoyés', value: totalSent,       icon: '📤', border: 'border-l-blue-400' },
          { label: 'Succès',        value: totalOk,         icon: '✅', border: 'border-l-green-400' },
          { label: 'Échecs',        value: totalFail,       icon: '❌', border: 'border-l-red-400' },
          { label: 'Taux succès',   value: `${rate}%`,      icon: '📊', border: 'border-l-purple-400' },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border border-gray-100 border-l-4 ${k.border} p-4 shadow-sm`}>
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Stats par type */}
      {stats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Statistiques par type (7 jours)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b">
                  <th className="text-left pb-2">Type</th>
                  <th className="text-right pb-2">Total</th>
                  <th className="text-right pb-2">Succès</th>
                  <th className="text-right pb-2">Échecs</th>
                  <th className="text-right pb-2">Taux</th>
                  <th className="text-right pb-2">Dernier envoi</th>
                </tr>
              </thead>
              <tbody>
                {stats.map(s => {
                  const m = TYPE_META[s.email_type] ?? { label: s.email_type, emoji: '📧', cls: 'bg-gray-50 text-gray-600 border-gray-200' }
                  const r = Number(s.success_rate)
                  return (
                    <tr key={s.email_type} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${m.cls}`}>
                          {m.emoji} {m.label}
                        </span>
                      </td>
                      <td className="text-right py-2 font-medium">{s.total_sent}</td>
                      <td className="text-right py-2 text-green-600">{s.success}</td>
                      <td className="text-right py-2 text-red-500">{s.failed}</td>
                      <td className={`text-right py-2 font-semibold ${r >= 95 ? 'text-green-600' : r >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {s.success_rate}%
                      </td>
                      <td className="text-right py-2 text-xs text-gray-400">
                        {new Date(s.last_sent).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panneau test */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">🧪 Envoyer un email de test</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Type</label>
            <select value={testType} onChange={e => setTestType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="welcome">👋 Bienvenue</option>
              <option value="project_created">📁 Nouveau projet</option>
              <option value="upgrade_pro">⭐ Upgrade Pro</option>
              <option value="password_reset">🔐 Reset mot de passe</option>
              <option value="project_shared">🤝 Partage projet</option>
            </select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs text-gray-500 block mb-1">Destinataire</label>
            <input value={testTo} onChange={e => setTestTo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="email@exemple.com" />
          </div>
          <button onClick={sendTest} disabled={sending || !testTo}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {sending ? '⏳ Envoi...' : '📤 Envoyer test'}
          </button>
        </div>
        {testResult && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${
            testResult.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testResult.success
              ? `✅ Email envoyé ! ID Resend : ${testResult.messageId}`
              : `❌ Erreur : ${testResult.error}`}
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Historique des envois</h2>
          <div className="flex gap-2">
            {(['all', 'sent', 'failed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f === 'all' ? 'Tous' : f === 'sent' ? '✅ Succès' : '❌ Échecs'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            {filter === 'all'
              ? "Aucun log — exécutez d'abord la migration SQL dans Supabase"
              : 'Aucun résultat pour ce filtre'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b">
                  <th className="text-left pb-2">Type</th>
                  <th className="text-left pb-2">Destinataire</th>
                  <th className="text-left pb-2">Sujet</th>
                  <th className="text-center pb-2">Statut</th>
                  <th className="text-right pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const m = TYPE_META[log.email_type] ?? { label: log.email_type, emoji: '📧', cls: 'bg-gray-50 text-gray-600 border-gray-200' }
                  return (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${m.cls}`}>
                          {m.emoji} {m.label}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600 truncate max-w-[160px]" title={log.recipient}>
                        {log.recipient}
                      </td>
                      <td className="py-2 text-gray-500 truncate max-w-[200px]">
                        {log.subject.replace('[TEST] ', '')}
                      </td>
                      <td className="py-2 text-center">
                        {log.status === 'sent'
                          ? <span className="text-green-600">✅</span>
                          : <span className="text-red-500" title={log.error_message ?? ''}>❌</span>}
                      </td>
                      <td className="py-2 text-right text-xs text-gray-400">
                        {new Date(log.sent_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
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
