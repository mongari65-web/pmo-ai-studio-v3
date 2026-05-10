"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

export default function AdminStatsPage() {
  const [data, setData] = useState<any>({ planDist:[], signupsByDay:[], topProjects:[] })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase.from("profiles").select("plan, created_at, ai_calls_count")
      const { data: projects } = await supabase.from("projects").select("name, completion, user_id, created_at")

      // Répartition plans
      const planCounts = { free:0, pro:0, team:0 }
      profiles?.forEach(p => { planCounts[p.plan as keyof typeof planCounts] = (planCounts[p.plan as keyof typeof planCounts]??0)+1 })
      const planDist = [
        { name:"Gratuit", value:planCounts.free, fill:"#64748b" },
        { name:"Pro",     value:planCounts.pro,  fill:"#2563eb" },
        { name:"Équipe",  value:planCounts.team, fill:"#7c3aed" },
      ]

      // Inscriptions 7 derniers jours
      const days: Record<string, number> = {}
      for (let i=6; i>=0; i--) {
        const d = new Date(Date.now() - i*86400000).toISOString().split("T")[0]
        days[d] = 0
      }
      profiles?.forEach(p => {
        const d = p.created_at?.split("T")[0]
        if (d && d in days) days[d]++
      })
      const signupsByDay = Object.entries(days).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("fr-FR", { day:"2-digit", month:"short" }),
        Inscriptions: count
      }))

      // IA calls par plan
      const aiByPlan = [
        { name:"Gratuit", calls: profiles?.filter(p=>p.plan==="free").reduce((s,p)=>s+(p.ai_calls_count??0),0)??0 },
        { name:"Pro",     calls: profiles?.filter(p=>p.plan==="pro").reduce((s,p)=>s+(p.ai_calls_count??0),0)??0 },
        { name:"Équipe",  calls: profiles?.filter(p=>p.plan==="team").reduce((s,p)=>s+(p.ai_calls_count??0),0)??0 },
      ]

      setData({ planDist, signupsByDay, aiByPlan })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Métriques d'utilisation en temps réel</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {/* Inscriptions 7j */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground mb-4">📈 Inscriptions — 7 derniers jours</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.signupsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="date" tick={{ fill:"#64748b", fontSize:10 }}/>
                <YAxis tick={{ fill:"#64748b", fontSize:10 }} allowDecimals={false}/>
                <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:8 }}/>
                <Line type="monotone" dataKey="Inscriptions" stroke="#2563eb" strokeWidth={2} dot={{ r:4, fill:"#2563eb" }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Plans */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground mb-4">🍩 Répartition plans</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.planDist} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:11 }}/>
                <YAxis tick={{ fill:"#64748b", fontSize:10 }} allowDecimals={false}/>
                <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:8 }}/>
                <Bar dataKey="value" name="Utilisateurs" radius={[4,4,0,0]}>
                  {data.planDist.map((d: any, i: number) => (
                    <rect key={i} fill={d.fill}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Appels IA */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground mb-4">⚡ Appels IA par plan</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.aiByPlan} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:11 }}/>
                <YAxis tick={{ fill:"#64748b", fontSize:10 }}/>
                <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:8 }}/>
                <Bar dataKey="calls" name="Appels IA" fill="#f59e0b" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenus estimés */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground mb-4">💰 Revenus estimés (MRR)</p>
            <div className="space-y-4 mt-6">
              {[
                { label:"Plan Pro", count:data.planDist.find((p:any)=>p.name==="Pro")?.value??0, price:29, color:"#2563eb" },
                { label:"Plan Équipe", count:data.planDist.find((p:any)=>p.name==="Équipe")?.value??0, price:79, color:"#7c3aed" },
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background:p.color+"11", border:`1px solid ${p.color}33` }}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.count} × {p.price}€</p>
                  </div>
                  <p className="text-xl font-bold" style={{ color:p.color }}>{(p.count * p.price).toLocaleString("fr-FR")}€</p>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-sm font-bold text-foreground">MRR Total</p>
                <p className="text-xl font-bold text-green-400">
                  {((data.planDist.find((p:any)=>p.name==="Pro")?.value??0)*29 +
                    (data.planDist.find((p:any)=>p.name==="Équipe")?.value??0)*79).toLocaleString("fr-FR")}€
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
