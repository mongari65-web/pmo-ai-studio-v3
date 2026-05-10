"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { toast } from "sonner"
import { User, Mail, Shield, Bell, Palette, Save } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({ full_name: "", email: "" })
  const [notifs, setNotifs] = useState({ raid: true, budget: true, jalons: true, email: false })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        setProfile({ full_name: data.user.user_metadata?.full_name ?? "", email: data.user.email ?? "" })
      }
    })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: profile.full_name } })
    if (error) toast.error(error.message)
    else toast.success("Profil mis à jour")
    setSaving(false)
  }

  const SECTIONS = [
    {
      icon: User, title: "Profil",
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nom complet</label>
            <input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              className="w-full max-w-sm px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <input value={profile.email} disabled
              className="w-full max-w-sm px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"/>
            <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié</p>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            <Save size={14}/> {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      )
    },
    {
      icon: Bell, title: "Notifications",
      content: (
        <div className="space-y-3">
          {[
            { key: "raid", label: "Risques RAID critiques", desc: "Alerte quand un risque Critique est ouvert" },
            { key: "budget", label: "Dépassement budget (CPI < 0.9)", desc: "Alerte quand le CPI est sous 0.9" },
            { key: "jalons", label: "Jalons en retard", desc: "Alerte quand un jalon est dépassé" },
            { key: "email", label: "Notifications par email", desc: "Recevoir les alertes par email (bientôt)" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
              <button onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${notifs[n.key as keyof typeof notifs] ? "bg-primary" : "bg-muted"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${notifs[n.key as keyof typeof notifs] ? "left-5" : "left-0.5"}`}/>
              </button>
            </div>
          ))}
        </div>
      )
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
            <p className="text-xs text-muted-foreground">ID : {user?.id?.slice(0,8)}...</p>
          </div>
        </div>
      )
    },
    {
      icon: Palette, title: "Abonnement",
      content: (
        <div className="space-y-3">
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Plan Gratuit</p>
                <p className="text-xs text-muted-foreground mt-0.5">3 projets · Export basique · IA limitée</p>
              </div>
              <a href="/pricing" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Passer au Pro →
              </a>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Projets utilisés", value: "1 / 3" },
              { label: "Générations IA", value: "∞" },
              { label: "Stockage", value: "500 MB" },
            ].map(s => (
              <div key={s.label} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )
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
            <p className="text-xs text-muted-foreground mt-0.5">Plan Gratuit</p>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(section => {
          const Icon = section.icon
          return (
            <div key={section.title} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/30">
                <Icon size={15} className="text-muted-foreground"/>
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
