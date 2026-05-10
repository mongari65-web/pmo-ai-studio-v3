"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Check, Zap, Crown, Building2 } from "lucide-react"

const PLANS = [
  {
    id: "free",
    name: "Gratuit",
    icon: Zap,
    price: { monthly: 0, yearly: 0 },
    color: "#64748b",
    badge: null,
    features: [
      "3 projets maximum",
      "WBS, Gantt, RAID de base",
      "Export Excel + CSV",
      "Génération IA limitée (10/mois)",
      "Historique 7 jours",
    ],
    cta: "Commencer gratuitement",
    ctaStyle: "border",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    price: { monthly: 29, yearly: 24 },
    color: "#2563eb",
    badge: "Populaire",
    features: [
      "20 projets",
      "Tous les outils PMO",
      "Export Excel, PDF, Word, PPTX",
      "Google Drive, Notion, Gmail",
      "Génération IA illimitée",
      "Budget EVM 6 onglets",
      "Gantt interactif drag+resize",
      "MindMap zoom + export PNG",
      "PERT chemin critique",
      "Historique illimité",
      "Support prioritaire",
    ],
    cta: "Démarrer l'essai Pro",
    ctaStyle: "primary",
  },
  {
    id: "team",
    name: "Équipe",
    icon: Building2,
    price: { monthly: 79, yearly: 65 },
    color: "#7c3aed",
    badge: null,
    features: [
      "Projets illimités",
      "Collaboration temps réel",
      "Gestion des membres",
      "Tableau de bord portfolio",
      "API REST",
      "Formations PMI/PMP intégrées",
      "SSO / SAML",
      "Support dédié",
      "SLA 99.9%",
    ],
    cta: "Contacter l'équipe",
    ctaStyle: "border",
  },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly"|"yearly">("monthly")
  const [loading, setLoading] = useState<string|null>(null)

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") return
    setLoading(planId)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billing })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error ?? "Erreur Stripe")
    } catch (e: any) {
      alert("Configurez STRIPE_SECRET_KEY dans .env.local")
    } finally {
      setLoading(null)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-4">
            ✨ Propulsé par Claude AI
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Choisissez votre plan</h1>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Commencez gratuitement. Passez au Pro pour débloquer tous les outils PMO et l'IA illimitée.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-xl p-1">
            <button onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${billing === "monthly" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
              Mensuel
            </button>
            <button onClick={() => setBilling("yearly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${billing === "yearly" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
              Annuel <span className="text-xs text-green-400 ml-1">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const Icon = plan.icon
            const price = plan.price[billing]
            const isPopular = plan.badge === "Populaire"
            return (
              <div key={plan.id} className={`bg-card border rounded-2xl p-6 relative flex flex-col ${isPopular ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: plan.color + "22" }}>
                    <Icon size={20} style={{ color: plan.color }}/>
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{price}€</span>
                    {price > 0 && <span className="text-muted-foreground text-sm">/mois</span>}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p className="text-xs text-green-400 mt-1">Facturé {price * 12}€/an</p>
                  )}
                  {price === 0 && <p className="text-xs text-muted-foreground mt-1">Pour toujours</p>}
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={14} style={{ color: plan.color, flexShrink: 0, marginTop: 2 }}/>
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                    plan.ctaStyle === "primary"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border border-border text-foreground hover:bg-accent"
                  }`}>
                  {loading === plan.id ? "Chargement..." : plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-foreground text-center mb-6">Questions fréquentes</h2>
          {[
            { q: "Puis-je annuler à tout moment ?", r: "Oui. Pas d'engagement, annulation en 1 clic depuis les paramètres." },
            { q: "Mes données sont-elles sécurisées ?", r: "Oui. Vos données sont chiffrées et hébergées sur Supabase (ISO 27001)." },
            { q: "Le plan Gratuit est-il vraiment gratuit ?", r: "Oui, pour toujours. Pas de carte bancaire requise." },
            { q: "Puis-je passer du Gratuit au Pro ?", r: "Oui, à tout moment. Vos données sont conservées." },
          ].map(item => (
            <div key={item.q} className="border-b border-border py-4">
              <p className="text-sm font-medium text-foreground mb-1.5">{item.q}</p>
              <p className="text-sm text-muted-foreground">{item.r}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
