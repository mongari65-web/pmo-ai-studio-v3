"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Shield, AlertTriangle, CheckCircle, Clock, RefreshCw, Ban } from "lucide-react"
import { toast } from "sonner"

export default function AdminSecurityPage() {
  const [events, setEvents]   = useState<any[]>([])
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<"events"|"webhooks"|"banned">("events")
  const [banned, setBanned]   = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: wh }, { data: ban }] = await Promise.all([
      supabase.from("stripe_webhook_events").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("user_id, full_name, email, is_banned, created_at").eq("is_banned", true),
    ])
    setWebhooks(wh ?? [])
    setBanned(ban ?? [])

    // Simuler des events de connexion depuis les profils récents
    const { data: recent } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, created_at, last_seen_at, plan")
      .order("last_seen_at", { ascending: false, nullsFirst: false })
      .limit(30)
    setEvents(recent ?? [])
    setLoading(false)
  }

  const unban = async (userId: string) => {
    await supabase.from("profiles").update({ is_banned: false }).eq("user_id", userId)
    setBanned(prev => prev.filter(u => u.user_id !== userId))
    toast.success("Compte réactivé")
  }

  const TABS = [
    { id: "events",   label: "🕐 Activité récente" },
    { id: "webhooks", label: "🔗 Webhooks Stripe" },
    { id: "banned",   label: "🚫 Comptes bannis (" + banned.length + ")" },
  ] as const

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: 0 }}>🛡️ Sécurité</h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}>Activité, webhooks Stripe, comptes bannis</p>
        </div>
        <button onClick={loadAll} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
          <RefreshCw size={13}/> Actualiser
        </button>
      </div>

      {/* KPIs sécurité */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[
          { label: "Connexions récentes",  value: events.length,   color: "#3b82f6" },
          { label: "Webhooks traités",     value: webhooks.filter(w=>w.processed).length, color: "#22c55e" },
          { label: "Webhooks en attente",  value: webhooks.filter(w=>!w.processed).length, color: "#f59e0b" },
          { label: "Comptes bannis",       value: banned.length,   color: banned.length > 0 ? "#ef4444" : "var(--text-3)" },
        ].map(k => (
          <div key={k.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:"6px 14px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", border:"none", background:tab===t.id?"var(--primary-bg)":"transparent", color:tab===t.id?"var(--primary-light)":"var(--text-2)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Activité récente */}
      {tab === "events" && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                {["Utilisateur", "Email", "Plan", "Dernière activité", "Membre depuis"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text-3)", borderBottom: "2px solid var(--border)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Chargement...</td></tr>
              ) : events.map((e, idx) => {
                const planColors: Record<string, string> = { free:"#64748b", starter:"#36B37E", pro:"#7B5EFF", premium:"#FF8C00" }
                return (
                  <tr key={e.user_id} style={{ borderBottom: "1px solid var(--border)", background: idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text-1)" }}>{e.full_name || "—"}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text-3)", fontSize: 11 }}>{e.email}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 8, background: (planColors[e.plan]||"#64748b")+"22", color: planColors[e.plan]||"#64748b", fontWeight: 600 }}>{e.plan}</span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--text-3)", fontSize: 11 }}>
                      {e.last_seen_at ? new Date(e.last_seen_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--text-3)", fontSize: 11 }}>
                      {new Date(e.created_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Webhooks Stripe */}
      {tab === "webhooks" && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                {["Event ID", "Type", "Statut", "Date"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text-3)", borderBottom: "2px solid var(--border)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Chargement...</td></tr>
              ) : webhooks.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Aucun webhook enregistré</td></tr>
              ) : webhooks.map((w, idx) => (
                <tr key={w.id} style={{ borderBottom: "1px solid var(--border)", background: idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 10, color: "var(--text-3)" }}>{w.event_id?.slice(0,30)}...</td>
                  <td style={{ padding: "10px 12px", fontSize: 11, color: "var(--primary-light)" }}>{w.event_type}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {w.processed
                      ? <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#22c55e" }}><CheckCircle size={11}/> Traité</span>
                      : <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#f59e0b" }}><Clock size={11}/> En attente</span>
                    }
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-3)", fontSize: 11 }}>
                    {new Date(w.created_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Comptes bannis */}
      {tab === "banned" && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {banned.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>
              <CheckCircle size={32} style={{ color:"#22c55e", margin:"0 auto 10px", display:"block" }}/>
              Aucun compte banni
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Utilisateur", "Email", "Banni depuis", ""].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text-3)", borderBottom: "2px solid var(--border)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {banned.map((u, idx) => (
                  <tr key={u.user_id} style={{ borderBottom: "1px solid var(--border)", background: idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#ef4444" }}>{u.full_name || "—"}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text-3)", fontSize: 11 }}>{u.email}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text-3)", fontSize: 11 }}>
                      {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <button onClick={() => unban(u.user_id)} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", border:"1px solid #22c55e", borderRadius:6, background:"rgba(34,197,94,0.1)", color:"#22c55e", fontSize:11, cursor:"pointer", fontWeight:600 }}>
                        <CheckCircle size={11}/> Réactiver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
