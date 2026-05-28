import PublicLayout from '@/components/public/PublicLayout'
export default function MentionsLegales() {
  return (
    <PublicLayout>
    <div style={{ maxWidth:800, margin:"0 auto", padding:"60px 24px", fontFamily:"DM Sans,sans-serif", color:"#F0F2FF", background:"#0A0B14", minHeight:"100vh" }}>
      <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Mentions légales</h1>
      <p style={{ color:"#A0A5C0", marginBottom:40 }}>Dernière mise à jour : mai 2026</p>
      <section style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:12, color:"#7B5EFF" }}>Éditeur du site</h2>
        <p>Nom : Touil Abdelhafid</p>
        <p>Statut : Micro-entrepreneur (en cours immatriculation)</p>
        <p>SIRET : En cours</p>
        <p>Adresse : Paris, France</p>
        <p>Email : hafid.touil@icloud.com</p>
      </section>
      <section style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:12, color:"#7B5EFF" }}>Hébergeur</h2>
        <p>Vercel Inc. — 340 Pine Street, Suite 701, San Francisco, CA 94104</p>
      </section>
      <section style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:12, color:"#7B5EFF" }}>Marques tierces</h2>
        <p style={{ lineHeight:1.8, color:"#B8BCDC" }}>
          PMP® et PMBOK® sont des marques déposées du Project Management Institute.
          PRINCE2® est une marque déposée Axelos Limited.
          SAFe® est une marque déposée de Scaled Agile Inc.
          PMO AI Studio est independant et non affilié à ces organismes.
        </p>
      </section>
      <a href="/" style={{ color:"#7B5EFF", fontSize:13 }}>retour accueil</a>
    </div>
    </PublicLayout>
  )
}