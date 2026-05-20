export default function CGUPage() {
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px", fontFamily:"Arial, sans-serif", color:"#f1f5f9", background:"#0f172a", minHeight:"100vh" }}>
      <a href="/" style={{ fontSize:12, color:"#7B5EFF", textDecoration:"none" }}>← Retour</a>
      <h1 style={{ fontSize:28, fontWeight:800, margin:"20px 0 8px" }}>Conditions Générales d'Utilisation</h1>
      <p style={{ fontSize:12, color:"#64748b", marginBottom:32 }}>Dernière mise à jour : Mai 2026</p>

      {[
        { title:"1. Objet", content:"Les présentes CGU régissent l'utilisation de PMO AI Studio, plateforme SaaS d'assistance IA pour chefs de projet, accessible sur pmo-ai-studio-v3.vercel.app." },
        { title:"2. Acceptation", content:"En accédant à PMO AI Studio, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service." },
        { title:"3. Description du service", content:"PMO AI Studio fournit des outils de gestion de projet assistés par IA (Claude AI d'Anthropic), incluant la génération de livrables PMBOK 7, l'analyse EVM, le suivi RAID et jalons." },
        { title:"4. Compte utilisateur", content:"Vous êtes responsable de la confidentialité de vos identifiants. Tout accès avec vos identifiants est réputé effectué par vous. Signalez immédiatement toute utilisation non autorisée." },
        { title:"5. Plans et facturation", content:"Les plans payants (Starter, Pro, Premium) sont facturés via Stripe. Les abonnements se renouvellent automatiquement. L'annulation prend effet à la fin de la période en cours." },
        { title:"6. Propriété intellectuelle", content:"Le contenu généré par l'IA vous appartient. Le code source, le design et la marque PMO AI Studio restent la propriété exclusive de leurs auteurs." },
        { title:"7. Limitation de responsabilité", content:"PMO AI Studio est fourni 'tel quel'. Nous ne garantissons pas l'exactitude des contenus générés par l'IA. Utilisez ces outils comme aide à la décision, pas comme substitut à l'expertise professionnelle." },
        { title:"8. Contact", content:"Pour toute question : contact@pmoai.studio" },
      ].map(s => (
        <div key={s.title} style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", marginBottom:8 }}>{s.title}</h2>
          <p style={{ fontSize:14, color:"#94a3b8", lineHeight:1.7, margin:0 }}>{s.content}</p>
        </div>
      ))}
    </div>
  )
}
