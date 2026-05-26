"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Check, X, Shield } from "lucide-react"

// ── Types ────────────────────────────────────────────────────
interface PlanRow {
  id: string
  name: string
  price_monthly: number  // en centimes
  price_yearly: number   // en centimes
  max_projects: number
  features: string[]
  stripe_price_monthly: string | null
  stripe_price_yearly: string | null
}

// ── Config UI statique par plan ──────────────────────────────
const PLAN_UI: Record<string, {
  icon: string
  color: string
  bg: string
  border: string
  desc: string
  badge?: string
  popular?: boolean
  cta: string
  cta_style: "filled" | "border"
  features_ui: { t: string; ok: boolean; note?: string }[]
}> = {
  free: {
    icon: "🌱", color: "var(--text-2)", bg: "rgba(94,108,132,0.1)", border: "rgba(94,108,132,0.2)",
    desc: "Découvrez l'IA PMO sur un projet réel, sans engagement.",
    badge: "14 jours gratuits",
    cta: "Essai gratuit 14 jours →", cta_style: "border",
    features_ui: [
      { t: "1 projet actif", ok: true },
      { t: "WBS simplifié", ok: true },
      { t: "RACI basique", ok: true },
      { t: "Export PDF", ok: true, note: "1 seul" },
      { t: "IA Claude Haiku", ok: true, note: "10 générations" },
      { t: "Gantt / EVM / PERT", ok: false },
      { t: "Templates sectoriels", ok: false },
      { t: "Simulateur Certifications", ok: false },
      { t: "Archive projets", ok: false },
    ],
  },
  starter: {
    icon: "🚀", color: "#36B37E", bg: "rgba(54,179,126,0.1)", border: "rgba(54,179,126,0.3)",
    desc: "Pour démarrer vos premiers mandats avec l'assistance IA.",
    cta: "Choisir Starter →", cta_style: "border",
    features_ui: [
      { t: "3 projets en parallèle", ok: true },
      { t: "WBS + RACI + Gantt", ok: true },
      { t: "Export PDF", ok: true },
      { t: "IA Claude Haiku", ok: true, note: "50 générations/mois" },
      { t: "Templates sectoriels", ok: false },
      { t: "EVM / Courbes S / PERT", ok: false },
      { t: "Simulateur Certifications", ok: false },
      { t: "Archive projets", ok: false },
    ],
  },
  pro: {
    icon: "⚡", color: "#7B5EFF", bg: "rgba(123,94,255,0.12)", border: "#7B5EFF",
    desc: "Pour les chefs de projet actifs sur plusieurs projets simultanément.",
    badge: "⭐ Le plus populaire", popular: true,
    cta: "Choisir Pro →", cta_style: "filled",
    features_ui: [
      { t: "10 projets en parallèle", ok: true },
      { t: "Tous les outils PMO", ok: true, note: "10+" },
      { t: "Export Excel · PDF · Word", ok: true },
      { t: "IA Claude Sonnet", ok: true, note: "150 générations/mois" },
      { t: "Pack templates sectoriels", ok: true },
      { t: "EVM, PERT & Courbes S", ok: true },
      { t: "Simulateur Certifications", ok: false },
      { t: "Archive projets", ok: false },
    ],
  },
  premium: {
    icon: "👑", color: "#FF8C00", bg: "rgba(255,140,0,0.1)", border: "rgba(255,140,0,0.3)",
    desc: "Pour les PMO et freelances avec un portefeuille complet à piloter.",
    badge: "👑 Pour les PMO",
    cta: "Choisir Premium →", cta_style: "border",
    features_ui: [
      { t: "25 projets + historique", ok: true },
      { t: "Tout ce qui est dans Pro", ok: true },
      { t: "Export PowerPoint inclus", ok: true },
      { t: "IA Claude Sonnet", ok: true, note: "300 générations/mois" },
      { t: "Templates sectoriels complets", ok: true },
      { t: "Simulateur Certifications 225 Q.", ok: true },
      { t: "Historique & archive projets", ok: true },
      { t: "Support prioritaire", ok: true },
    ],
  },
}

const PLAN_ORDER = ["free", "starter", "pro", "premium"]

const METHODS = [
  { icon: "💳", label: "Carte bancaire" },
  { icon: "🏦", label: "SEPA" },
  { icon: "🍎", label: "Apple Pay" },
  { icon: "🤖", label: "Google Pay" },
  { icon: "🔗", label: "Klarna 3x" },
]

// ── Page ─────────────────────────────────────────────────────
export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const [loading, setLoading] = useState<string | null>(null)
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [fetching, setFetching] = useState(true)
  const router = useRouter()

  // Charger les plans depuis Supabase via API route
  useEffect(() => {
    fetch("/api/plans")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPlans(data)
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const handleCheckout = async (planId: string) => {
    if (planId === "free") { router.push("/dashboard"); return }
    setLoading(planId)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: planId, billingInterval: billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert("Erreur : " + (data.error ?? "Impossible de créer la session"))
      }
    } catch {
      alert("Erreur réseau. Vérifiez votre connexion.")
    } finally {
      setLoading(null)
    }
  }

  // Fusionner données Supabase + UI statique
  const mergedPlans = PLAN_ORDER.map(id => {
    const row = plans.find(p => p.id === id)
    const ui = PLAN_UI[id]
    if (!ui) return null
    const price_m = row ? Math.round(row.price_monthly / 100) : 0
    const price_y = row ? Math.round(row.price_yearly / 100) : 0
    return { id, price_m, price_y, ...ui }
  }).filter(Boolean) as any[]

  return (
    <AppLayout>
      <div style={{ padding: "28px", background: "var(--bg)", minHeight: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>// ABONNEMENTS</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", margin: "0 0 8px" }}>Choisissez votre plan</h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>Commencez gratuitement · 7 jours d'essai sans engagement · Annulation à tout moment</p>

          {/* Toggle mensuel/annuel */}
          <div style={{ display: "inline-flex", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 40, padding: 4 }}>
            {([["monthly", "Mensuel"], ["yearly", "Annuel"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setBilling(v)}
                style={{
                  padding: "8px 20px", borderRadius: 36, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: billing === v ? "var(--primary)" : "transparent",
                  color: billing === v ? "#fff" : "var(--text-2)",
                }}>
                {l}
                {v === "yearly" && (
                  <span style={{ marginLeft: 6, fontSize: 10, background: "#E3FCEF", color: "#006644", padding: "1px 6px", borderRadius: 10 }}>-20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        {fetching ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-2)", fontSize: 14 }}>
            Chargement des plans...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
            {mergedPlans.map(plan => {
              const price = billing === "yearly" ? plan.price_y : plan.price_m
              const isLoading = loading === plan.id
              return (
                <div key={plan.id} style={{
                  background: "var(--bg-card)", border: "2px solid " + plan.border,
                  borderRadius: 16, overflow: "hidden", position: "relative",
                  boxShadow: plan.popular ? "0 0 32px " + plan.bg : "none",
                }}>
                  {plan.badge && (
                    <div style={{
                      position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                      background: plan.popular ? "var(--primary)" : plan.color,
                      color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 12px",
                      borderRadius: "0 0 10px 10px", whiteSpace: "nowrap",
                    }}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Header plan */}
                  <div style={{ padding: "20px 18px 14px", background: plan.bg, marginTop: plan.badge ? 14 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 22 }}>{plan.icon}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: plan.color, textTransform: "uppercase", letterSpacing: "1px" }}>{plan.id === "free" ? "Gratuit" : plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                      {price > 0 && <span style={{ fontSize: 11, color: plan.color }}>€</span>}
                      <span style={{ fontSize: 36, fontWeight: 900, color: plan.color, lineHeight: 1 }}>{price === 0 ? "0" : price}</span>
                      {price > 0 && <span style={{ fontSize: 13, color: plan.color, opacity: 0.7 }}>/mois</span>}
                      {price === 0 && <span style={{ fontSize: 13, color: plan.color, opacity: 0.7, marginLeft: 4 }}>pour toujours</span>}
                    </div>
                    {billing === "yearly" && price > 0 && (
                      <p style={{ fontSize: 11, color: plan.color, opacity: 0.7, margin: 0 }}>
                        {price * 12}€/an — économisez {(plan.price_m - price) * 12}€
                      </p>
                    )}
                    <p style={{ fontSize: 12, color: "var(--text-2)", margin: "8px 0 0", lineHeight: 1.5 }}>{plan.desc}</p>
                  </div>

                  {/* Features */}
                  <div style={{ padding: "14px 18px" }}>
                    {plan.features_ui.map((f: any) => (
                      <div key={f.t} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, opacity: f.ok ? 1 : 0.4 }}>
                        {f.ok
                          ? <Check size={13} style={{ color: "#36B37E", flexShrink: 0, marginTop: 2 }} />
                          : <X size={13} style={{ color: "var(--text-3)", flexShrink: 0, marginTop: 2 }} />
                        }
                        <span style={{ fontSize: 12, color: f.ok ? "var(--text-1)" : "var(--text-3)", lineHeight: 1.4, textDecoration: f.ok ? "none" : "line-through" }}>
                          {f.t}
                          {f.note && (
                            <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 6px", background: plan.bg, color: plan.color, borderRadius: 10, fontWeight: 600 }}>
                              {f.note}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div style={{ padding: "0 18px 18px" }}>
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={isLoading}
                      style={{
                        width: "100%", padding: "10px",
                        background: plan.cta_style === "filled" ? "var(--primary)" : "transparent",
                        border: plan.cta_style === "filled" ? "none" : "1px solid " + plan.border,
                        borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: isLoading ? "not-allowed" : "pointer",
                        color: plan.cta_style === "filled" ? "#fff" : plan.color,
                        boxShadow: plan.cta_style === "filled" ? "0 0 20px var(--primary-glow)" : "none",
                        opacity: isLoading ? 0.7 : 1,
                      }}>
                      {isLoading ? "Redirection..." : plan.cta}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Note génération IA */}
        <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
          💡 <strong>Comment fonctionne le quota IA ?</strong> Une génération = créer un WBS, un Gantt, un RAID ou tout autre outil PMO depuis zéro avec l'IA. Une fois créé, votre outil est sauvegardé et modifiable à tout moment sans consommer de quota.
        </div>

        {/* Paiement sécurisé */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shield size={14} style={{ color: "var(--text-3)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Paiement sécurisé Stripe</span>
          </div>
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          {METHODS.map(m => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 16 }}>{m.icon}</span>
              <span style={{ fontSize: 11, color: "var(--text-2)" }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: "0 0 12px" }}>❓ Questions fréquentes</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["L'essai est-il gratuit ?", "Oui, 7 jours sans CB. Annulation libre avant la fin."],
              ["Puis-je annuler à tout moment ?", "Oui, sans pénalités. Accès actif jusqu'à fin de période."],
              ["La TVA est-elle incluse ?", "Prix HT. TVA appliquée selon votre pays au paiement."],
              ["Puis-je changer de plan ?", "Oui, upgrade/downgrade à tout moment au prorata."],
              ["Qu'est-ce qu'une génération IA ?", "Créer un outil PMO (WBS, Gantt, RAID...) depuis zéro avec l'IA. La modification ne consomme pas de quota."],
              ["Mes données sont-elles sécurisées ?", "Oui, hébergées sur Supabase (EU) avec chiffrement complet."],
            ].map(([q, a]) => (
              <div key={q} style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", margin: "0 0 3px" }}>{q}</p>
                <p style={{ fontSize: 11, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
