"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Check, Zap, Crown, Users, Star, Shield, CreditCard } from "lucide-react"

const PLANS = [
  {
    key: "free",
    icon: Zap,
    title: "Gratuit",
    price_monthly: 0,
    price_yearly: 0,
    color: "#5E6C84",
    bg: "#F4F5F7",
    border: "#DFE1E6",
    desc: "Pour découvrir PMO AI Studio",
    features: [
      "1 projet actif",
      "20 générations IA / mois",
      "WBS, Gantt, RAID, Jalons",
      "Export PNG",
      "Accès communauté",
    ],
    locked: [
      "Templates Pro Excel",
      "Simulateur PMP 225 questions",
      "Export PDF / Word / Excel",
      "PERT & MindMap avancés",
      "Portfolio multi-projets",
    ],
    cta: "Plan actuel",
    ctaDisabled: true,
    planKey: null,
  },
  {
    key: "pro",
    icon: Crown,
    title: "Pro",
    price_monthly: 29,
    price_yearly: 23, // 279/12
    color: "#0052CC",
    bg: "#DEEBFF",
    border: "#0052CC",
    desc: "Pour les chefs de projet solo",
    badge: "Le plus populaire",
    features: [
      "20 projets actifs",
      "150 générations IA / mois",
      "Tous les outils PMO",
      "Templates Excel Pro (EVM, RAID, WBS...)",
      "Simulateur PMP 225 questions",
      "Export PDF / Word / Excel / PowerPoint",
      "Portfolio multi-projets",
      "Support prioritaire",
      "7 jours d'essai gratuit",
    ],
    locked: [],
    cta: "Commencer l'essai gratuit",
    ctaDisabled: false,
    planKey: "pro",
  },
  {
    key: "team",
    icon: Users,
    title: "Équipe",
    price_monthly: 79,
    price_yearly: 63, // 759/12
    color: "#403294",
    bg: "#EAE6FF",
    border: "#403294",
    desc: "Pour les équipes PMO",
    features: [
      "50 projets actifs",
      "500 générations IA / mois",
      "Tout ce qui est dans Pro",
      "5 membres d'équipe",
      "Collaboration temps réel",
      "Panel Admin",
      "API access",
      "Onboarding dédié",
      "7 jours d'essai gratuit",
    ],
    locked: [],
    cta: "Commencer l'essai gratuit",
    ctaDisabled: false,
    planKey: "team",
  },
]

const PAYMENT_METHODS = [
  { icon: "💳", label: "Carte bancaire" },
  { icon: "🏦", label: "SEPA / Virement" },
  { icon: "🍎", label: "Apple Pay" },
  { icon: "🤖", label: "Google Pay" },
  { icon: "🔗", label: "Klarna 3x" },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly"|"yearly">("monthly")
  const [loading, setLoading] = useState<string|null>(null)
  const router = useRouter()

  const handleCheckout = async (planKey: string) => {
    setLoading(planKey)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, billingInterval: billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? "Erreur lors du paiement")
      }
    } catch(e: any) {
      alert("Erreur : " + e.message)
    } finally {
      setLoading(null)
    }
  }

  const handlePortal = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <AppLayout>
      <div style={{ padding:"28px", background:"var(--bg)", minHeight:"100%" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 8px" }}>// ABONNEMENTS</p>
          <h1 style={{ fontSize:28, fontWeight:700, color:"var(--text-1)", margin:"0 0 10px" }}>
            Choisissez votre plan
          </h1>
          <p style={{ fontSize:14, color:"var(--text-2)", margin:"0 0 24px" }}>
            Commencez gratuitement · Passez au Pro quand vous êtes prêt · 7 jours d'essai sans engagement
          </p>

          {/* Toggle mensuel / annuel */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:0, background:"var(--card)", border:"1px solid var(--border)", borderRadius:40, padding:4 }}>
            {[["monthly","Mensuel"],["yearly","Annuel"]].map(([v,l])=>(
              <button key={v} onClick={()=>setBilling(v as any)}
                style={{ padding:"8px 20px", borderRadius:36, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                  background:billing===v?"var(--primary)":"transparent",
                  color:billing===v?"#fff":"var(--text-2)" }}>
                {l}
                {v==="yearly" && <span style={{ marginLeft:6, fontSize:10, background:"#E3FCEF", color:"#006644", padding:"1px 6px", borderRadius:10 }}>-20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, maxWidth:1000, margin:"0 auto 32px" }}>
          {PLANS.map(plan => {
            const Icon = plan.icon
            const price = billing==="yearly" ? plan.price_yearly : plan.price_monthly
            const isLoading = loading === plan.planKey

            return (
              <div key={plan.key}
                style={{ background:"var(--card)", border:`2px solid ${plan.border}`, borderRadius:"var(--r12)", overflow:"hidden", position:"relative",
                  boxShadow: plan.key==="pro" ? "0 8px 24px rgba(0,82,204,0.15)" : "none" }}>

                {/* Badge */}
                {(plan as any).badge && (
                  <div style={{ position:"absolute", top:16, right:16, background:"var(--primary)", color:"#fff", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                    {(plan as any).badge}
                  </div>
                )}

                {/* Header plan */}
                <div style={{ padding:"20px 20px 16px", background:plan.bg }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:36, height:36, borderRadius:"var(--r8)", background:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon size={20} style={{ color:plan.color }}/>
                    </div>
                    <div>
                      <h2 style={{ fontSize:16, fontWeight:700, color:plan.color, margin:0 }}>{plan.title}</h2>
                      <p style={{ fontSize:11, color:plan.color, opacity:0.7, margin:0 }}>{plan.desc}</p>
                    </div>
                  </div>

                  <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                    <span style={{ fontSize:36, fontWeight:800, color:plan.color }}>{price}€</span>
                    {price > 0 && <span style={{ fontSize:13, color:plan.color, opacity:0.7 }}>/ mois</span>}
                    {price === 0 && <span style={{ fontSize:13, color:plan.color, opacity:0.7 }}>pour toujours</span>}
                  </div>
                  {billing==="yearly" && price > 0 && (
                    <p style={{ fontSize:11, color:plan.color, opacity:0.7, margin:"4px 0 0" }}>
                      Facturé {price*12}€/an · Économisez {(plan.price_monthly - price)*12}€/an
                    </p>
                  )}
                </div>

                {/* Features */}
                <div style={{ padding:"16px 20px" }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:8 }}>
                      <Check size={14} style={{ color:"#36B37E", flexShrink:0, marginTop:2 }}/>
                      <span style={{ fontSize:12, color:"var(--text-1)", lineHeight:1.4 }}>{f}</span>
                    </div>
                  ))}
                  {plan.locked.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:8, opacity:0.4 }}>
                      <div style={{ width:14, height:14, flexShrink:0, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:11 }}>🔒</span>
                      </div>
                      <span style={{ fontSize:12, color:"var(--text-3)", lineHeight:1.4, textDecoration:"line-through" }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ padding:"0 20px 20px" }}>
                  <button
                    onClick={() => plan.planKey && handleCheckout(plan.planKey)}
                    disabled={plan.ctaDisabled || isLoading}
                    style={{ width:"100%", padding:"11px", borderRadius:"var(--r8)", border:`2px solid ${plan.color}`, fontSize:13, fontWeight:700, cursor:plan.ctaDisabled?"default":"pointer", transition:"all 0.15s",
                      background:plan.ctaDisabled?"var(--bg)":isLoading?"#C0DD97":plan.color,
                      color:plan.ctaDisabled?"var(--text-3)":"#fff",
                      opacity:plan.ctaDisabled?0.6:1 }}>
                    {isLoading ? "Redirection..." : plan.cta}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Moyens de paiement */}
        <div style={{ maxWidth:1000, margin:"0 auto 24px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:"16px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <Shield size={14} style={{ color:"var(--text-3)" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text-2)" }}>Paiement sécurisé Stripe</span>
            </div>
            <div style={{ width:1, height:20, background:"var(--border)" }}/>
            {PAYMENT_METHODS.map(m => (
              <div key={m.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:16 }}>{m.icon}</span>
                <span style={{ fontSize:11, color:"var(--text-2)" }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ + Gérer abonnement */}
        <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          {/* FAQ */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:"20px 24px" }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px" }}>❓ Questions fréquentes</h3>
            {[
              ["L'essai est-il gratuit ?", "Oui, 7 jours d'essai sans CB pour les plans Pro et Équipe. Aucun frais si vous annulez avant."],
              ["Puis-je annuler à tout moment ?", "Oui, sans pénalités. Votre accès reste actif jusqu'à la fin de la période payée."],
              ["La TVA est-elle incluse ?", "Les prix affichés sont HT. La TVA sera appliquée selon votre pays lors du paiement."],
              ["Puis-je changer de plan ?", "Oui, upgrade ou downgrade à tout moment. Le différentiel est calculé au prorata."],
              ["Quels moyens de paiement ?", "Carte bancaire, SEPA/virement, Apple Pay, Google Pay, Klarna 3x sans frais."],
            ].map(([q,a])=>(
              <div key={q} style={{ marginBottom:12, paddingBottom:12, borderBottom:"1px solid var(--border)" }}>
                <p style={{ fontSize:12, fontWeight:600, color:"var(--text-1)", margin:"0 0 3px" }}>{q}</p>
                <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.5 }}>{a}</p>
              </div>
            ))}
          </div>

          {/* Gérer abonnement */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:"20px 24px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
            <div>
              <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px" }}>⚙️ Gérer mon abonnement</h3>
              <p style={{ fontSize:12, color:"var(--text-2)", margin:"0 0 16px", lineHeight:1.5 }}>
                Modifiez votre plan, mettez à jour votre moyen de paiement, consultez vos factures ou annulez depuis le portail sécurisé Stripe.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
                {["Changer de plan","Modifier le moyen de paiement","Télécharger les factures","Annuler l'abonnement"].map(item=>(
                  <div key={item} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Check size={13} style={{ color:"var(--primary)" }}/>
                    <span style={{ fontSize:12, color:"var(--text-2)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handlePortal}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              <CreditCard size={15}/> Accéder au portail de facturation
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
