"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Save, RotateCcw, Zap, Settings, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"

interface Config {
  free_quota: number; starter_quota: number; pro_quota: number; premium_quota: number
  cache_ttl_days: number; maintenance_mode: boolean; new_signups_enabled: boolean
  trial_days: number; stripe_test_mode: boolean
  feature_pmp_simulator: boolean; feature_templates: boolean; feature_ai_reports: boolean
}

const DEFAULT_CONFIG: Config = {
  free_quota: 5, starter_quota: 20, pro_quota: 200, premium_quota: 300,
  cache_ttl_days: 30, maintenance_mode: false, new_signups_enabled: true,
  trial_days: 7, stripe_test_mode: true,
  feature_pmp_simulator: true, feature_templates: true, feature_ai_reports: false,
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("app_config").select("key, value").in("key", Object.keys(DEFAULT_CONFIG))
      if (data?.length) {
        const cfg = { ...DEFAULT_CONFIG }
        data.forEach(({ key, value }) => {
          if (key in cfg) (cfg as any)[key] = typeof (DEFAULT_CONFIG as any)[key] === "boolean" ? value === "true" : typeof (DEFAULT_CONFIG as any)[key] === "number" ? Number(value) : value
        })
        setConfig(cfg)
      }
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const rows = Object.entries(config).map(([key, value]) => ({ key, value: String(value) }))
      for (const row of rows) {
        await supabase.from("app_config").upsert(row, { onConflict: "key" })
      }
      toast.success("Configuration sauvegardée")
    } catch (e: any) {
      toast.error("Erreur : " + e.message)
    } finally {
      setSaving(false)
    }
  }

  const reset = () => { setConfig(DEFAULT_CONFIG); toast.info("Valeurs par défaut restaurées") }

  const Toggle = ({ field }: { field: keyof Config }) => {
    const val = config[field] as boolean
    return (
      <button onClick={() => setConfig(c => ({ ...c, [field]: !val }))}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", border: "1px solid "+(val?"#22c55e":"var(--border)"), borderRadius: 20, background: val?"rgba(34,197,94,0.1)":"transparent", color: val?"#22c55e":"var(--text-3)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        {val ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>} {val ? "Activé" : "Désactivé"}
      </button>
    )
  }

  const NumInput = ({ field, min = 0, max = 9999, label }: { field: keyof Config; min?: number; max?: number; label?: string }) => (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{label}</div>
      <input type="number" value={config[field] as number} min={min} max={max}
        onChange={e => setConfig(c => ({ ...c, [field]: +e.target.value }))}
        style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 7, background: "var(--bg)", color: "var(--text-1)", fontSize: 13, fontWeight: 600, textAlign: "center" }}/>
    </div>
  )

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>Chargement...</div>

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: 0 }}>⚙️ Configuration</h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}>Quotas IA, plans, feature flags</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 16px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
            <RotateCcw size={13}/> Réinitialiser
          </button>
          <button onClick={save} disabled={saving} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 18px", border:"none", borderRadius:8, background:"var(--primary)", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", opacity:saving?0.7:1 }}>
            <Save size={13}/> {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Quotas IA */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: "0 0 16px", display:"flex", alignItems:"center", gap:6 }}>
          <Zap size={14} style={{ color:"var(--primary-light)" }}/> Quotas IA par plan (requêtes/mois)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <NumInput field="free_quota"     label="🌱 Gratuit"  min={1} max={100}/>
          <NumInput field="starter_quota"  label="🚀 Starter"  min={1} max={500}/>
          <NumInput field="pro_quota"      label="⚡ Pro"      min={1} max={1000}/>
          <NumInput field="premium_quota"  label="👑 Premium"  min={1} max={2000}/>
        </div>
      </div>

      {/* Paramètres généraux */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: "0 0 16px", display:"flex", alignItems:"center", gap:6 }}>
          <Settings size={14} style={{ color:"var(--primary-light)" }}/> Paramètres généraux
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Mode maintenance</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>Bloquer l'accès à l'app</div>
              </div>
              <Toggle field="maintenance_mode"/>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Nouvelles inscriptions</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>Autoriser les nouveaux comptes</div>
              </div>
              <Toggle field="new_signups_enabled"/>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Stripe test mode</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>Utiliser les clés de test</div>
              </div>
              <Toggle field="stripe_test_mode"/>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <NumInput field="trial_days"     label="Durée essai gratuit (jours)" min={1} max={30}/>
            <NumInput field="cache_ttl_days" label="Durée cache IA (jours)"      min={1} max={90}/>
          </div>
        </div>
      </div>

      {/* Feature flags */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: "0 0 16px" }}>🚩 Feature Flags</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { field: "feature_pmp_simulator" as keyof Config, label: "Simulateur PMP® 225 questions", desc: "Activer l'accès au simulateur PMP" },
            { field: "feature_templates"     as keyof Config, label: "Templates sectoriels Pro",       desc: "Pack de templates pour les plans payants" },
            { field: "feature_ai_reports"    as keyof Config, label: "Rapports IA automatiques",       desc: "Génération automatique de rapports (bêta)" },
          ].map(({ field, label, desc }) => (
            <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{desc}</div>
              </div>
              <Toggle field={field}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
