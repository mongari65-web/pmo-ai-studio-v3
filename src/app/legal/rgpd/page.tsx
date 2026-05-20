export default function RGPDPage() {
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px", fontFamily:"Arial, sans-serif", color:"#f1f5f9", background:"#0f172a", minHeight:"100vh" }}>
      <a href="/" style={{ fontSize:12, color:"#7B5EFF", textDecoration:"none" }}>← Retour</a>
      <h1 style={{ fontSize:28, fontWeight:800, margin:"20px 0 8px" }}>Politique de Confidentialité & RGPD</h1>
      <p style={{ fontSize:12, color:"#64748b", marginBottom:32 }}>Dernière mise à jour : Mai 2026</p>

      {[
        { title:"1. Responsable du traitement", content:"PMO AI Studio est responsable du traitement de vos données personnelles. Contact DPO : contact@pmoai.studio" },
        { title:"2. Données collectées", content:"Nous collectons : email et nom (inscription), données de projets (contenu que vous créez), données d'usage (pages visitées, outils utilisés), données de facturation (via Stripe — nous ne stockons pas vos données de carte)." },
        { title:"3. Finalités du traitement", content:"Vos données sont utilisées pour : fournir le service, améliorer la plateforme, vous envoyer des notifications relatives à votre compte, facturer les abonnements." },
        { title:"4. Base légale", content:"Traitement basé sur : exécution du contrat (service), intérêt légitime (amélioration du service), consentement (emails marketing)." },
        { title:"5. Conservation des données", content:"Données de compte : durée de l'abonnement + 3 ans. Données de projets : supprimées sur demande ou 30 jours après fermeture du compte. Logs techniques : 90 jours." },
        { title:"6. Partage des données", content:"Vos données peuvent être partagées avec : Supabase (hébergement BDD), Anthropic/Claude (génération IA — contenu de vos projets), Stripe (facturation), Vercel (hébergement). Aucune vente à des tiers." },
        { title:"7. Vos droits", content:"Conformément au RGPD, vous avez le droit d'accès, de rectification, d'effacement, de portabilité et d'opposition. Exercez vos droits via contact@pmoai.studio. Réponse sous 30 jours." },
        { title:"8. Cookies", content:"Nous utilisons des cookies essentiels (session, authentification) et analytiques (usage anonymisé). Pas de cookies publicitaires." },
        { title:"9. Sécurité", content:"Données chiffrées en transit (HTTPS/TLS) et au repos. Authentification sécurisée via Supabase. Accès restreint aux données de production." },
        { title:"10. Contact", content:"DPO et réclamations CNIL : contact@pmoai.studio · Vous pouvez également saisir la CNIL (cnil.fr) en cas de litige." },
      ].map(s => (
        <div key={s.title} style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", marginBottom:8 }}>{s.title}</h2>
          <p style={{ fontSize:14, color:"#94a3b8", lineHeight:1.7, margin:0 }}>{s.content}</p>
        </div>
      ))}
    </div>
  )
}
