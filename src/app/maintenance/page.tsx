import type { Metadata } from 'next'
import RefreshButton from './RefreshButton'

export const metadata: Metadata = {
  title: 'Maintenance en cours — PMO AI Studio',
  description: 'PMO AI Studio est temporairement indisponible pour maintenance.',
  robots: 'noindex',
}

export default function MaintenancePage() {
  return (
    <div style={{
      fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
      background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px',
    }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <img src="/logo-pmoai.png" alt="PMO AI Studio"
            style={{ width: 80, height: 80, borderRadius: 18, display: 'block', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>PMO AI Studio</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>La plateforme de gestion de projet intelligente</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '40px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(245,158,11,0.12)', border: '2px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 24px',
          }}>🔧</div>

          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Maintenance en cours
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.7, margin: '0 0 28px' }}>
            Nous effectuons des améliorations sur la plateforme pour vous offrir
            une meilleure expérience. Nous serons de retour très bientôt.
          </p>

          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 12, padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, textAlign: 'left',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }}/>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', margin: 0 }}>Résolution en cours</p>
              <p style={{ fontSize: 11, color: '#78716c', margin: '2px 0 0' }}>Nos équipes travaillent activement à la résolution</p>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
            Pour toute urgence, contactez-nous à{' '}
            <a href="mailto:support@pmoai.studio" style={{ color: '#7B5EFF', textDecoration: 'none', fontWeight: 600 }}>
              support@pmoai.studio
            </a>
          </p>

          <RefreshButton />
        </div>

        <p style={{ fontSize: 12, color: '#334155', marginTop: 24 }}>
          © {new Date().getFullYear()} PMO AI Studio · pmoai.studio
        </p>
      </div>
    </div>
  )
}
