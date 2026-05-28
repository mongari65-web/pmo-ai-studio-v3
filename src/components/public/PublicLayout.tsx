import Link from 'next/link'
import Image from 'next/image'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #f1f5f9', padding: '0 5%', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/logo-pmo.svg" alt="PMO AI Studio" width={38} height={38} style={{ borderRadius: 10 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>PMO AI Studio</div>
              <div style={{ fontSize: 10, color: '#7B5EFF', fontWeight: 600, lineHeight: 1.2 }}>L&apos;outil PMO qui transforme vos projets en succès — de débutant à expert</div>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/pricing" style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>Tarifs</Link>
            <Link href="/demo" style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#7B5EFF', textDecoration: 'none', border: '1px solid rgba(123,94,255,0.3)' }}>👁️ Démo</Link>
            <Link href="/auth/connexion" style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>Connexion</Link>
            <Link href="/auth/inscription" style={{ padding: '8px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', textDecoration: 'none' }}>Essai gratuit →</Link>
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', padding: '36px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
            <div>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 10 }}>
                <Image src="/logo-pmo.svg" alt="PMO AI Studio" width={32} height={32} style={{ borderRadius: 8 }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>PMO AI Studio</span>
              </Link>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0, maxWidth: 260, lineHeight: 1.6 }}>
                L&apos;outil PMO qui transforme vos projets en succès — de débutant à expert.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Produit</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/pricing" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Tarifs</Link>
                  <Link href="/demo" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Démo live</Link>
                  <Link href="/changelog" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Changelog</Link>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Ressources</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/blog" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Blog</Link>
                  <a href="https://www.youtube.com/@PMOAIStudio" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>YouTube</a>
                  <Link href="/contact" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Contact</Link>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Légal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/legal/cgu" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>CGU</Link>
                  <Link href="/legal/confidentialite" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Confidentialité</Link>
                  <Link href="/legal/mentions-legales" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Mentions légales</Link>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>© {new Date().getFullYear()} PMO AI Studio · pmoai.studio</p>
            <p style={{ fontSize: 10, color: '#334155', margin: 0, maxWidth: 700, textAlign: 'right', lineHeight: 1.6 }}>
              PMI®, PMP®, PMBOK® sont des marques déposées du Project Management Institute. PRINCE2®, MSP® sont des marques d&apos;Axelos/PeopleCert. SAFe® est une marque de Scaled Agile, Inc. PMO AI Studio n&apos;est pas affilié à ces organismes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
