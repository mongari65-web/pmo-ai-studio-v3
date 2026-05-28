'use client'
import { useState } from 'react'
import PublicLayout from '@/components/public/PublicLayout'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur envoi')
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (e: any) {
      setStatus('error')
      setError(e.message)
    }
  }

  return (
    <PublicLayout>
      <div style={{ padding: '60px 5%' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
              Contactez-nous
            </h1>
            <p style={{ fontSize: 16, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              Une question, un retour ou une demande de démo ? On vous répond sous 24h.
            </p>
          </div>

          {status === 'success' ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#166534', margin: '0 0 8px' }}>Message envoyé !</h2>
              <p style={{ fontSize: 15, color: '#166534', margin: '0 0 24px' }}>
                Merci pour votre message. Nous vous répondrons dans les 24 heures.
              </p>
              <button onClick={() => setStatus('idle')}
                style={{ padding: '10px 24px', borderRadius: 10, background: '#22c55e', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nom complet *</label>
                    <input type="text" required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Votre nom"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email *</label>
                    <input type="email" required value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="vous@email.com"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Sujet *</label>
                  <select required value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#fff' }}>
                    <option value="" disabled>Choisissez un sujet</option>
                    <option value="Question sur les plans">Question sur les plans</option>
                    <option value="Demande de démo">Demande de démo</option>
                    <option value="Support technique">Support technique</option>
                    <option value="Partenariat / Formation">Partenariat / Formation</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message *</label>
                  <textarea required rows={5} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Décrivez votre question ou demande..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>

                {status === 'error' && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
                    ❌ {error || 'Une erreur est survenue. Veuillez réessayer.'}
                  </div>
                )}

                <button type="submit" disabled={status === 'loading'}
                  style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: status === 'loading' ? '#94a3b8' : 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}>
                  {status === 'loading' ? '⏳ Envoi en cours...' : 'Envoyer le message →'}
                </button>
              </form>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>📧</div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 2px' }}>Email</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>contact@pmoai.studio</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>⏱️</div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 2px' }}>Délai de réponse</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Sous 24 heures</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
