"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"

const PLAN_AMOUNTS: Record<string, number> = { starter: 9, pro: 17, premium: 23 }

export default function AdminRevenuePage() {
  const [data, setData]   = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: subs }     = await supabase.from("subscriptions").select("plan, status, created_at, current_period_end, cancel_at_period_end")
      const { data: profiles } = await supabase.from("profiles").select("plan, created_at")

      const active   = subs?.filter(s => s.status === "active") ?? []
      const trialing = subs?.filter(s => s.status === "trialing") ?? []
      const canceled = subs?.filter(s => s.status === "canceled") ?? []

      const mrr = active.reduce((sum, s) => sum + (PLAN_AMOUNTS[s.plan] ?? 0), 0)
      const arr = mrr * 12
      const churnRate = subs && subs.length > 0 ? Math.round(canceled.length / subs.length * 100) : 0
      const ltv = mrr > 0 && churnRate > 0 ? Math.round(mrr / (churnRate / 100)) : 0

      // Répartition plans (actifs)
      const planDist = [
        { name: "Starter", value: active.filter(s=>s.plan==="starter").length, color: "#36B37E" },
        { name: "Pro",     value: active.filter(s=>s.plan==="pro").length,     color: "#7B5EFF" },
        { name: "Premium", value: active.filter(s=>s.plan==="premium").length, color: "#FF8C00" },
      ]

      // Revenue par plan
      const revByPlan = [
        { plan: "Starter", mrr: active.filter(s=>s.plan==="starter").length * 9,  users: active.filter(s=>s.plan==="starter").length },
        { plan: "Pro",     mrr: active.filter(s=>s.plan==="pro").length * 17,      users: active.filter(s=>s.plan==="pro").length },
        { plan: "Premium", mrr: active.filter(s=>s.plan==="premium").length * 23,  users: active.filter(s=>s.plan==="premium").length },
      ]

      // Inscriptions 30 derniers jours
      const days: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i*86400000).toISOString().split("T")[0]
        days[d] = 0
      }
      profiles?.forEach(p => {
        const d = p.created_at?.split("T")[0]
        if (d && d in days) days[d]++
      })
      const signups = Object.entries(days).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("fr-FR", { day:"2-digit", month:"short" }),
        Inscriptions: count
      }))

      setData({ mrr, arr, churnRate, ltv, planDist, revByPlan, signups, totalActive: active.length, totalTrialing: trialing.length, totalCanceled: canceled.length })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"var(--text-3)" }}>Chargement...</div>

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: 0 }}>📊 Revenue & Métriques</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}>MRR, ARR, Churn Rate, LTV</p>
      </div>

      {/* KPIs principaux */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "MRR",        value: (data.mrr).toLocaleString("fr-FR") + "€", sub: "Revenu mensuel récurrent", color: "#7B5EFF", bg: "rgba(123,94,255,0.08)" },
          { label: "ARR",        value: (data.arr).toLocaleString("fr-FR") + "€", sub: "Revenu annuel récurrent",  color: "#36B37E", bg: "rgba(54,179,126,0.08)" },
          { label: "Churn Rate", value: data.churnRate + "%",                      sub: "Taux d'annulation",        color: data.churnRate > 5 ? "#ef4444" : "#f59e0b", bg: "rgba(239,68,68,0.08)" },
          { label: "LTV estimé", value: data.ltv > 0 ? data.ltv + "€" : "—",      sub: "Valeur vie client",        color: "#FF8C00", bg: "rgba(255,140,0,0.08)" },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, border: "1px solid "+k.color+"30", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Stats secondaires */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { label: "Abonnés actifs",  value: data.totalActive,   color: "#22c55e" },
          { label: "En essai",        value: data.totalTrialing, color: "#f59e0b" },
          { label: "Annulés total",   value: data.totalCanceled, color: "#ef4444" },
        ].map(k => (
          <div key={k.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Revenue par plan */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: "0 0 16px" }}>💰 MRR par plan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.revByPlan}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="plan" tick={{ fontSize: 11, fill: "var(--text-3)" }}/>
              <YAxis tick={{ fontSize: 11, fill: "var(--text-3)" }}/>
              <Tooltip formatter={(v: any) => v + "€"} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
              <Bar dataKey="mrr" name="MRR" radius={[6,6,0,0]}>
                {data.revByPlan.map((_: any, i: number) => (
                  <Cell key={i} fill={["#36B37E","#7B5EFF","#FF8C00"][i]}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition plans */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: "0 0 16px" }}>🥧 Répartition abonnés</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.planDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, value}) => value > 0 ? name+": "+value : ""}>
                {data.planDist.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color}/>
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
            {data.planDist.map((p: any) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-2)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color }}/>
                {p.name} ({p.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inscriptions 30 jours */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: "0 0 16px" }}>📈 Inscriptions — 30 derniers jours</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data.signups}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-3)" }} interval={4}/>
            <YAxis tick={{ fontSize: 11, fill: "var(--text-3)" }} allowDecimals={false}/>
            <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
            <Line type="monotone" dataKey="Inscriptions" stroke="#7B5EFF" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
