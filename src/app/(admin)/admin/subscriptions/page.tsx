"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CreditCard, TrendingUp, Users, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface Sub {
  id: string; user_id: string; plan: string; status: string
  stripe_subscription_id: string; stripe_customer_id: string
  stripe_price_id: string; current_period_end: string
  cancel_at_period_end: boolean; created_at: string
  profile?: { full_name: string; email: string }
}

const PLAN_CFG: Record<string, { color: string; bg: string; amount: number }> = {
  starter: { color: "#36B37E", bg: "rgba(54,179,126,0.1)", amount: 9 },
  pro:     { color: "#7B5EFF", bg: "rgba(123,94,255,0.12)", amount: 17 },
  premium: { color: "#FF8C00", bg: "rgba(255,140,0,0.1)", amount: 23 },
}

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  active:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Actif" },
  trialing:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Essai" },
  past_due:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Impayé" },
  canceled:  { color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "Annulé" },
  incomplete:{ color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Incomplet" },
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs]       = useState<Sub[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState("all")
  const [search, setSearch]   = useState("")
  const supabase = createClient()

  useEffect(() => { loadSubs() }, [])

  const loadSubs = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/subscriptions")
    const d = await res.json()
    setSubs((d.subscriptions ?? []) as Sub[])
    setLoading(false)
  }

  const filtered = subs.filter(s => {
    const matchPlan   = filter === "all" || s.plan === filter || s.status === filter
    const matchSearch = !search || (s.profile?.email ?? "").toLowerCase().includes(search.toLowerCase()) || (s.profile?.full_name ?? "").toLowerCase().includes(search.toLowerCase())
    return matchPlan && matchSearch
  })

  // KPIs
  const active   = subs.filter(s => s.status === "active")
  const trialing = subs.filter(s => s.status === "trialing")
  const pastDue  = subs.filter(s => s.status === "past_due")
  const mrr      = active.reduce((sum, s) => sum + (PLAN_CFG[s.plan]?.amount ?? 0), 0)
  const arr      = mrr * 12
  const churnRisk = subs.filter(s => s.cancel_at_period_end).length

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: 0 }}>💳 Abonnements</h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}>Gestion des abonnements Stripe</p>
        </div>
        <button onClick={loadSubs} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
          <RefreshCw size={13}/> Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
        {[
          { label: "Total abonnés",   value: subs.length,       color: "var(--primary)" },
          { label: "Actifs",          value: active.length,     color: "#22c55e" },
          { label: "En essai",        value: trialing.length,   color: "#f59e0b" },
          { label: "Impayés",         value: pastDue.length,    color: "#ef4444" },
          { label: "MRR estimé",      value: mrr + "€",         color: "#7B5EFF" },
          { label: "Risque churn",    value: churnRisk,         color: "#f97316" },
        ].map(k => (
          <div key={k.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres + recherche */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par email ou nom..."
          style={{ flex: 1, minWidth: 200, padding: "7px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", color: "var(--text-1)", fontSize: 12 }}/>
        <div style={{ display: "flex", gap: 4 }}>
          {["all","active","trialing","past_due","starter","pro","premium"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filter===f?"var(--primary)":"var(--border)"), background:filter===f?"var(--primary-bg)":"transparent", color:filter===f?"var(--primary-light)":"var(--text-3)" }}>
              {f === "all" ? "Tous" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              {["Utilisateur", "Plan", "Statut", "Montant", "Renouvellement", "Annulation", "Stripe ID", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text-3)", borderBottom: "2px solid var(--border)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Aucun abonnement trouvé</td></tr>
            ) : filtered.map((sub, idx) => {
              const planCfg   = PLAN_CFG[sub.plan]   ?? { color: "#64748b", bg: "transparent", amount: 0 }
              const statusCfg = STATUS_CFG[sub.status] ?? { color: "#64748b", bg: "transparent", label: sub.status }
              return (
                <tr key={sub.id} style={{ borderBottom: "1px solid var(--border)", background: idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 12 }}>{sub.profile?.full_name || "—"}</div>
                    <div style={{ fontSize: 10, color: "var(--text-3)" }}>{sub.profile?.email || sub.user_id.slice(0,8)}</div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 20, background: planCfg.bg, color: planCfg.color, fontSize: 11, fontWeight: 700 }}>
                      {sub.plan}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 20, background: statusCfg.bg, color: statusCfg.color, fontSize: 11, fontWeight: 600 }}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: planCfg.color }}>{planCfg.amount}€/mois</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-3)", fontSize: 11 }}>
                    {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {sub.cancel_at_period_end
                      ? <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 6, background: "rgba(249,115,22,0.1)", color: "#f97316", fontWeight: 600 }}>⚠️ En cours</span>
                      : <span style={{ fontSize: 10, color: "var(--text-3)" }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 10, color: "var(--text-3)" }}>
                    {sub.stripe_subscription_id?.slice(0, 20)}...
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <a href={"https://dashboard.stripe.com/test/subscriptions/"+sub.stripe_subscription_id} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--primary-light)", textDecoration:"none" }}>
                      <ExternalLink size={11}/> Stripe
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
