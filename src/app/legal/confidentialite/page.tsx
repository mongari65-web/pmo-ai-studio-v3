export default function Confidentialite() {
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"60px 24px", fontFamily:"DM Sans,sans-serif", color:"#F0F2FF", background:"#0A0B14", minHeight:"100vh" }}>
      <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Politique de confidentialité</h1>
      <p style={{ color:"#A0A5C0", marginBottom:40 }}>Dernière mise à jour : mai 2026</p>
      <section style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:12, color:"#7B5EFF" }}>Données collectées</h2>
        <ul style={{ color:"#B8BCDC", lineHeight:2, paddingLeft:20 }}>
          <li>Nom et adresse email</li>
          <li>Données de projets et outils PMO</li>
          <li>Paiements gérés par Stripe — CB non stockées</li>
          <li>Logs de connexion</li>
        </ul>
      </section>
      <section style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:12, color:"#7B5EFF" }}>Sous-traitants</h2>
        <ul style={{ color:"#B8BCDC", lineHeight:2, paddingLeft:20 }}>
          <li>Supabase — base de données</li>
          <li>Vercel — hébergement</li>
          <li>Stripe — paiements</li>
          <li>Anthropic — IA Claude</li>
        </ul>
      </section>
      <section style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:12, color:"#7B5EFF" }}>Vos droits RGPD</h2>
        <p style={{ lineHeight:1.8, color:"#B8BCDC" }}>
          Accès, rectification, effacement, portabilité, opposition.
          Contact : hafid.touil@icloud.com
        </p>
      </section>
      <section style={{ marginBottom:40 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:12, color:"#7B5EFF" }}>Cookies</h2>
        <p style={{ lineHeight:1.8, color:"#B8BCDC" }}>
          Uniquement des cookies techniques pour authentification. Aucun cookie publicitaire.
        </p>
      </section>
      <a href="/" style={{ color:"#7B5EFF", fontSize:13 }}>retour accueil</a>
    </div>
  )
}
