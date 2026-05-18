"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { toast } from "sonner"
import { User, Bell, Shield, CreditCard, Save, ExternalLink } from "lucide-react"

type Subscription = {
  plan: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  trial_end: string | null
}

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  free:    { label: "Gratuit",  color: "#888",    bg: "rgba(94,108,132,0.1)" },
  starter: { label: "Starter", color: "#36B37E",  bg: "rgba(54,179,126,0.1)" },
  pro:     { label: "Pro",     color: "#7B5EFF",  bg: "rgba(123,94,255,0.12)" },
  premium: { label: "Premium", color: "#FF8C00",  bg: "rgba(255,140,0,0.1)" },
}

export default function SettingsPage() {
  const [user, setUser]           = useState<any>(null)
  const [profile, setProfile]     = useState({ full_name: "", email: "" })
  const [sub, setSub]             = useState<Subscription | null>(null)
  const [notifs, setNotifs]       = useState({ raid: true, budget: true, jalons: true, email: false })
  const [saving, setSaving]       = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUser(data.user)
      setProfile({ full_name: data.user.user_metadata?.full_name ?? "", email: data.user.email ?? "" })

      // Charger l'abonnement actif
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end, cancel_at_period_end, trial_end")
        .eq("user_id", data.user.id)
        .in("status", ["active", "trialing", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (subData) setSub(subData as Subscription)
    })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: profile.full_name } })
    if (error) toast.error(error.message)
    else toast.success("Profil mis à jour")
    setSaving(false)
  }

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error ?? "Impossible d'ouvrir le portail")
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setPortalLoading(false)
    }
  }

  const currentPlan = sub?.plan ?? "free"
  const planInfo    = PLAN_LABELS[currentPlan] ?? PLAN_LABELS.free

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"

  const SECTIONS = [
    {
      icon: User, title: "Profil",
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nom complet</label>
            <input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              className="w-full max-w-sm px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <input value={profile.email} disabled
              className="w-full max-w-sm px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed" />
            <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié</p>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            <Save size={14} /> {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      ),
    },
    {
      icon: Bell, title: "Notifications",
      content: (
        <div className="space-y-3">
          {[
            { key: "raid",   label: "Risques RAID critiques",         desc: "Alerte quand un risque Critique est ouvert" },
            { key: "budget", label: "Dépassement budget (CPI < 0.9)", desc: "Alerte quand le CPI est sous 0.9" },
            { key: "jalons", label: "Jalons en retard",               desc: "Alerte quand un jalon est dépassé" },
            { key: "email",  label: "Notifications par email",        desc: "Recevoir les alertes par email (bientôt)" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
              <button onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                className={"relative w-10 h-5 rounded-full transition-colors " + (notifs[n.key as keyof typeof notifs] ? "bg-primary" : "bg-muted")}>
                <div className={"absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm " + (notifs[n.key as keyof typeof notifs] ? "left-5" : "left-0.5")} />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: Shield, title: "Sécurité",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-1">Mot de passe</p>
            <p className="text-xs text-muted-foreground mb-3">Envoi d'un lien de réinitialisation par email</p>
            <button onClick={async () => {
              await supabase.auth.resetPasswordForEmail(profile.email)
              toast.success("Email de réinitialisation envoyé")
            }} className="px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:bg-accent transition-colors">
              Réinitialiser le mot de passe
            </button>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-1">Compte</p>
            <p className="text-xs text-muted-foreground mb-1">Connecté depuis : {user?.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "—"}</p>
            <p className="text-xs text-muted-foreground">ID : {user?.id?.slice(0, 8)}...</p>
          </div>
        </div>
      ),
    },
    {
      icon: CreditCard, title: "Abonnement",
      content: (
        <div className="space-y-3">
          {/* Plan actuel */}
          <div className="p-4 rounded-lg" style={{ background: planInfo.bg, border: "1px solid " + planInfo.color + "44" }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ color: planInfo.color }}>Plan {planInfo.label}</span>
                  {sub?.status === "trialing" && (
                    <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 10, background: "#FFF3CD", color: "#856404", fontWeight: 600 }}>
                      Essai jusqu'au {formatDate(sub.trial_end)}
                    </span>
                  )}
                  {sub?.status === "past_due" && (
                    <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 10, background: "#F8D7DA", color: "#721C24", fontWeight: 600 }}>
                      Paiement en attente
                    </span>
                  )}
                  {sub?.cancel_at_period_end && (
                    <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 10, background: "#FFF3CD", color: "#856404", fontWeight: 600 }}>
                      Annulation le {formatDate(sub.current_period_end)}
                    </span>
                  )}
                </div>
                {sub?.current_period_end && !sub.cancel_at_period_end && (
                  <p className="text-xs text-muted-foreground">Renouvellement le {formatDate(sub.current_period_end)}</p>
                )}
                {currentPlan === "free" && (
                  <p className="text-xs text-muted-foreground">3 projets · Export basique · IA limitée</p>
                )}
              </div>
              {currentPlan === "free" ? (
                <a href="/pricing"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Passer au Pro →
                </a>
              ) : (
                <button onClick={openPortal} disabled={portalLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50">
                  <ExternalLink size={13} />
                  {portalLoading ? "Chargement..." : "Gérer l'abonnement"}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Plan actuel", value: planInfo.label },
              { label: "Statut", value: sub ? (sub.status === "trialing" ? "Essai" : sub.status === "active" ? "Actif" : sub.status) : "Gratuit" },
              { label: "Renouvellement", value: sub?.current_period_end ? formatDate(sub.current_period_end) : "—" },
            ].map(s => (
              <div key={s.label} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {currentPlan === "free" && (
            <p className="text-xs text-muted-foreground text-center">
              Passez à un plan payant pour débloquer tous les outils PMO
            </p>
          )}
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Gérez votre compte et vos préférences</p>
        </div>

        {/* Avatar */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary">
            {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile.full_name || "Sans nom"}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: planInfo.color }}>Plan {planInfo.label}</p>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(section => {
          const Icon = section.icon
          return (
            <div key={section.title} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/30">
                <Icon size={15} style={{ color: "var(--text-2)" }} />
                <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
              </div>
              <div className="p-4">{section.content}</div>
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}
