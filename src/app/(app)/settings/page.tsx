"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { toast } from "sonner"
import { User, Bell, Shield, CreditCard, Save, ExternalLink, ToggleLeft, ToggleRight, Key, Trash2 } from "lucide-react"

const PLAN_CFG: Record<string, { label:string; color:string; bg:string; border:string }> = {
  free:    { label:"Gratuit",  color:"#64748b", bg:"rgba(100,116,139,0.08)", border:"rgba(100,116,139,0.2)" },
  starter: { label:"Starter", color:"#36B37E", bg:"rgba(54,179,126,0.08)",  border:"rgba(54,179,126,0.2)"  },
  pro:     { label:"Pro",     color:"#7B5EFF", bg:"rgba(123,94,255,0.08)",  border:"rgba(123,94,255,0.2)"  },
  premium: { label:"Premium", color:"#FF8C00", bg:"rgba(255,140,0,0.08)",   border:"rgba(255,140,0,0.2)"   },
}

export default function SettingsPage() {
  const [user, setUser]         = useState<any>(null)
  const [profile, setProfile]   = useState({ full_name:"", email:"" })
  const [planId, setPlanId]     = useState("free")
  const [sub, setSub]           = useState<any>(null)
  const [notifs, setNotifs]     = useState({ raid:true, budget:true, jalons:true, email:false, weekly:true })
  const [saving, setSaving]     = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"profil"|"notifications"|"securite"|"abonnement">("profil")
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUser(data.user)
      setProfile({ full_name:data.user.user_metadata?.full_name??"", email:data.user.email??"" })
      const { data: prof } = await supabase.from("profiles").select("plan_id").eq("id", data.user.id).single()
      if (prof?.plan_id) setPlanId(prof.plan_id)
      const { data: subData } = await supabase.from("subscriptions").select("*")
        .eq("user_id", data.user.id).in("status",["active","trialing","past_due"])
        .order("created_at",{ ascending:false }).limit(1).single()
      if (subData) setSub(subData)
    })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.auth.updateUser({ data:{ full_name:profile.full_name } })
    toast.success("Profil sauvegardé")
    setSaving(false)
  }

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const { data:{ session } } = await supabase.auth.getSession()
      const res = await fetch("/api/stripe/portal", { method:"POST", headers:{ Authorization:"Bearer "+session?.access_token } })
      const json = await res.json()
      if (json.url) window.location.href = json.url
    } catch { toast.error("Erreur portail") }
    finally { setPortalLoading(false) }
  }

  const resetPassword = async () => {
    await supabase.auth.resetPasswordForEmail(profile.email)
    toast.success("Email de réinitialisation envoyé à "+profile.email)
  }

  const plan = PLAN_CFG[planId] ?? PLAN_CFG.free
  const initials = (profile.full_name||profile.email||"?").charAt(0).toUpperCase()

  const formatDate = (d:string|null) => d ? new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "—"

  const TABS = [
    { id:"profil",        icon:User,       label:"Profil" },
    { id:"notifications", icon:Bell,       label:"Notifications" },
    { id:"securite",      icon:Shield,     label:"Sécurité" },
    { id:"abonnement",    icon:CreditCard, label:"Abonnement" },
  ] as const

  const Toggle = ({ field }: { field:keyof typeof notifs }) => (
    <button onClick={() => setNotifs(p=>({...p,[field]:!p[field]}))}
      style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", border:"1px solid "+(notifs[field]?"#22c55e":"var(--border)"), borderRadius:20, background:notifs[field]?"rgba(34,197,94,0.1)":"transparent", color:notifs[field]?"#22c55e":"var(--text-3)", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>
      {notifs[field] ? <><ToggleRight size={14}/> Activé</> : <><ToggleLeft size={14}/> Désactivé</>}
    </button>
  )

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Header */}
        <div>
          <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// COMPTE</p>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Paramètres</h1>
        </div>

        {/* Avatar card */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"var(--primary-bg)", border:"2px solid rgba(123,94,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"var(--primary-light)", flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"var(--text-1)" }}>{profile.full_name||"Sans nom"}</div>
            <div style={{ fontSize:12, color:"var(--text-3)", marginTop:2 }}>{profile.email}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <span style={{ fontSize:11, padding:"4px 14px", borderRadius:20, background:plan.bg, color:plan.color, fontWeight:700, border:"1px solid "+plan.border }}>
              ✦ {plan.label}
            </span>
            {sub?.status==="trialing" && (
              <div style={{ fontSize:10, color:"#f59e0b", marginTop:4 }}>Essai jusqu'au {formatDate(sub.trial_end)}</div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:4, width:"fit-content" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", border:"none", background:activeTab===t.id?"var(--primary-bg)":"transparent", color:activeTab===t.id?"var(--primary-light)":"var(--text-2)" }}>
              <t.icon size={13}/> {t.label}
            </button>
          ))}
        </div>

        {/* ── Profil ── */}
        {activeTab === "profil" && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"20px" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 16px", display:"flex", alignItems:"center", gap:6 }}>
              <User size={14}/> Informations personnelles
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:5 }}>Nom complet</label>
                <input value={profile.full_name} onChange={e=>setProfile(p=>({...p,full_name:e.target.value}))}
                  placeholder="Votre nom"
                  style={{ width:"100%", fontSize:13, border:"1px solid var(--border)", borderRadius:8, padding:"9px 12px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box", outline:"none" }}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:5 }}>Email</label>
                <input value={profile.email} disabled
                  style={{ width:"100%", fontSize:13, border:"1px solid var(--border)", borderRadius:8, padding:"9px 12px", background:"var(--bg)", color:"var(--text-3)", boxSizing:"border-box", opacity:0.7 }}/>
                <div style={{ fontSize:10, color:"var(--text-3)", marginTop:4 }}>L'email ne peut pas être modifié</div>
              </div>
              <button onClick={saveProfile} disabled={saving}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", width:"fit-content", opacity:saving?0.7:1 }}>
                <Save size={13}/> {saving?"Sauvegarde...":"Sauvegarder"}
              </button>
            </div>
          </div>
        )}

        {/* ── Notifications ── */}
        {activeTab === "notifications" && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"20px" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 16px", display:"flex", alignItems:"center", gap:6 }}>
              <Bell size={14}/> Préférences notifications
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { key:"raid",   label:"Risques RAID critiques",         desc:"Alerte quand un risque Critique est ouvert" },
                { key:"budget", label:"Dépassement budget (CPI < 0.9)", desc:"Alerte quand le CPI est sous 0.9" },
                { key:"jalons", label:"Jalons en retard",               desc:"Alerte quand un jalon est dépassé" },
                { key:"email",  label:"Notifications email",            desc:"Recevoir les alertes par email" },
                { key:"weekly", label:"Résumé hebdomadaire",            desc:"Email de synthèse chaque lundi matin" },
              ].map(n => (
                <div key={n.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"var(--bg)", borderRadius:8, border:"1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:"var(--text-1)" }}>{n.label}</div>
                    <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{n.desc}</div>
                  </div>
                  <Toggle field={n.key as keyof typeof notifs}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sécurité ── */}
        {activeTab === "securite" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"20px" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px", display:"flex", alignItems:"center", gap:6 }}>
                <Key size={14}/> Mot de passe
              </h3>
              <p style={{ fontSize:12, color:"var(--text-3)", margin:"0 0 12px" }}>Un lien de réinitialisation sera envoyé à {profile.email}</p>
              <button onClick={resetPassword} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-1)", fontSize:12, fontWeight:500, cursor:"pointer" }}>
                <Key size={12}/> Réinitialiser le mot de passe
              </button>
            </div>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"20px" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px", display:"flex", alignItems:"center", gap:6 }}>
                <Shield size={14}/> Informations du compte
              </h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { label:"ID Compte",     value:user?.id?.slice(0,12)+"..." },
                  { label:"Membre depuis", value:user?.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "—" },
                  { label:"Fournisseur",   value:user?.app_metadata?.provider||"email" },
                  { label:"Dernière connexion", value:user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("fr-FR") : "—" },
                ].map(i => (
                  <div key={i.label} style={{ padding:"10px 12px", background:"var(--bg)", borderRadius:8, border:"1px solid var(--border)" }}>
                    <div style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>{i.label}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--text-1)", fontFamily:i.label==="ID Compte"?"monospace":"inherit" }}>{i.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:12, padding:"16px 20px" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#ef4444", margin:"0 0 8px", display:"flex", alignItems:"center", gap:6 }}>
                <Trash2 size={14}/> Zone dangereuse
              </h3>
              <p style={{ fontSize:12, color:"var(--text-3)", margin:"0 0 10px" }}>La suppression de compte est irréversible. Contactez le support.</p>
              <a href="mailto:support@pmoai.studio" style={{ fontSize:12, color:"#ef4444", textDecoration:"underline" }}>
                Contacter le support →
              </a>
            </div>
          </div>
        )}

        {/* ── Abonnement ── */}
        {activeTab === "abonnement" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {/* Plan actuel */}
            <div style={{ background:plan.bg, border:"2px solid "+plan.border, borderRadius:12, padding:"18px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:11, color:plan.color, fontWeight:600, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>Plan actuel</div>
                  <div style={{ fontSize:24, fontWeight:900, color:plan.color }}>✦ {plan.label}</div>
                  {sub?.current_period_end && !sub?.cancel_at_period_end && (
                    <div style={{ fontSize:11, color:"var(--text-3)", marginTop:4 }}>Renouvellement le {formatDate(sub.current_period_end)}</div>
                  )}
                  {sub?.cancel_at_period_end && (
                    <div style={{ fontSize:11, color:"#f59e0b", marginTop:4 }}>⚠️ Annulation le {formatDate(sub.current_period_end)}</div>
                  )}
                  {sub?.status==="trialing" && (
                    <div style={{ fontSize:11, color:"#f59e0b", marginTop:4 }}>🎁 Essai jusqu'au {formatDate(sub.trial_end)}</div>
                  )}
                  {planId==="free" && (
                    <div style={{ fontSize:11, color:"var(--text-3)", marginTop:4 }}>1 projet · Export basique · 5 génération IA/mois</div>
                  )}
                </div>
                <div>
                  {planId==="free" ? (
                    <a href="/pricing" style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", background:"var(--primary)", color:"#fff", borderRadius:9, fontSize:13, fontWeight:700, textDecoration:"none" }}>
                      Passer au Pro →
                    </a>
                  ) : (
                    <button onClick={openPortal} disabled={portalLoading}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", border:"1px solid var(--border)", borderRadius:9, background:"var(--bg-card)", color:"var(--text-1)", fontSize:12, fontWeight:500, cursor:"pointer", opacity:portalLoading?0.7:1 }}>
                      <ExternalLink size={13}/> {portalLoading?"Chargement...":"Gérer l'abonnement"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats abonnement */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { label:"Plan",          value:plan.label,  color:plan.color },
                { label:"Statut",        value:sub?sub.status==="trialing"?"Essai":sub.status==="active"?"Actif":sub.status:"Gratuit", color:"#22c55e" },
                { label:"Renouvellement",value:sub?.current_period_end?formatDate(sub.current_period_end):"—", color:"var(--text-2)" },
              ].map(s => (
                <div key={s.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:14, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:10, color:"var(--text-3)", marginTop:3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {planId==="free" && (
              <div style={{ background:"rgba(123,94,255,0.06)", border:"1px solid rgba(123,94,255,0.2)", borderRadius:10, padding:"12px 16px", textAlign:"center" }}>
                <p style={{ fontSize:12, color:"var(--primary-light)", margin:"0 0 8px", fontWeight:600 }}>🚀 Passez au plan Pro</p>
                <p style={{ fontSize:11, color:"var(--text-3)", margin:"0 0 10px" }}>150 générations IA/mois · 20 projets · Tous les outils PMO · Export PDF/Word</p>
                <a href="/pricing" style={{ fontSize:12, color:"var(--primary-light)", textDecoration:"none", fontWeight:600 }}>Voir les plans →</a>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
