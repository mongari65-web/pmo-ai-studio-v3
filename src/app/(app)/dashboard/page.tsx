"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import {
  Plus, FolderKanban, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Wand2, Bell, ArrowRight,
  Target, Clock, DollarSign, Users
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Project {
  id: string; name: string; description: string
  status: string; completion: number; color: string
  icon: string; created_at: string; budget: number
}

interface ToolSummary {
  project_id: string
  tool_type: string
  data: any
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [user, setUser] = useState<any>(null)
  const [toolData, setToolData] = useState<ToolSummary[]>([])
  const [alerts, setAlerts] = useState<{ type: string; message: string; project: string; projectId?: string; href?: string; severity: string }[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    loadData()
  }, [])

  const loadData = async () => {
    const { data: projs } = await supabase
      .from("projects").select("*").order("created_at", { ascending: false })
    setProjects(projs ?? [])

    const { data: tools } = await supabase
      .from("project_tools").select("project_id, tool_type, data")
    setToolData(tools ?? [])

    // Générer les alertes
    if (tools && projs) {
      const newAlerts: typeof alerts = []
      tools.forEach(t => {
        const proj = projs.find((p: any) => p.id === t.project_id)
        if (!proj) return
        // RAID critique
        if (t.tool_type === "raid" && t.data?.items) {
          const critiques = t.data.items.filter((i: any) => i.priority === "Critique" && i.status === "Ouvert")
          if (critiques.length > 0) {
            newAlerts.push({ type: "raid", message: `${critiques.length} risque(s) critique(s) ouvert(s)`, project: proj.name, projectId: proj.id, href: `/projects/${proj.id}/raid`, severity: "danger" })
          }
        }
        // EVM CPI < 1
        if (t.tool_type === "budget" && t.data?.tasks) {
          const cp = new Date().getMonth()
          const totalEV = t.data.tasks.reduce((s: number, task: any) => s + (task.ev?.[cp] ?? 0), 0)
          const totalAC = t.data.tasks.reduce((s: number, task: any) => s + (task.ac?.[cp] ?? 0), 0)
          const cpi = totalAC > 0 ? totalEV / totalAC : 1
          if (cpi < 0.9) {
            newAlerts.push({ type: "budget", message: `CPI = ${cpi.toFixed(2)} — dépassement budgétaire`, project: proj.name, projectId: proj.id, href: `/projects/${proj.id}/budget`, severity: "warning" })
          }
        }
        // Jalons en retard
        if (t.tool_type === "jalons" && t.data?.jalons) {
          const today = new Date().toISOString().split("T")[0]
          const retard = t.data.jalons.filter((j: any) => j.date < today && j.status !== "Atteint")
          if (retard.length > 0) {
            newAlerts.push({ type: "jalon", message: `${retard.length} jalon(s) en retard`, project: proj.name, projectId: proj.id, href: `/projects/${proj.id}/jalons`, severity: "warning" })
          }
        }
      })
      setAlerts(newAlerts)
    }
  }

  // KPIs globaux
  const activeProjects = projects.filter(p => p.status === "active")
  const avgCompletion = projects.length > 0
    ? Math.round(projects.reduce((s, p) => s + (p.completion ?? 0), 0) / projects.length) : 0
  const totalBudget = projects.reduce((s, p) => s + (p.budget ?? 0), 0)

  // Données graphique
  const chartData = projects.slice(0, 8).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 11) + "…" : p.name,
    Avancement: p.completion ?? 0,
    fill: p.color ?? "#2563eb"
  }))

  const SEVERITY_CFG = {
    danger: { bg: "rgba(239,68,68,0.1)", border: "#ef4444", icon: AlertTriangle, color: "#ef4444" },
    warning: { bg: "rgba(245,158,11,0.1)", border: "#f59e0b", icon: Clock, color: "#f59e0b" },
    info: { bg: "rgba(59,130,246,0.1)", border: "#3b82f6", icon: CheckCircle2, color: "#3b82f6" },
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bonjour{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Vue d'ensemble — {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/guide" className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/20 transition-colors">
              <Wand2 size={15}/> Guide CP
            </Link>
            <Link href="/projects/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus size={15}/> Nouveau projet
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Projets actifs", value: activeProjects.length, icon: FolderKanban, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Avancement moyen", value: `${avgCompletion}%`, icon: Target, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            { label: "Budget total", value: totalBudget > 0 ? `${(totalBudget/1000).toFixed(0)}k€` : "—", icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "Alertes actives", value: alerts.length, icon: Bell, color: alerts.length > 0 ? "text-red-400" : "text-muted-foreground", bg: alerts.length > 0 ? "bg-red-500/10 border-red-500/20" : "bg-card border-border" },
          ].map(kpi => (
            <div key={kpi.label} className={`border rounded-xl p-4 ${kpi.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
                <kpi.icon size={16} className={kpi.color}/>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Alertes */}
          <div className="col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">🔔 Alertes</h2>
              <Link href="/notifications" className="text-xs text-primary hover:underline">Voir tout →</Link>
            </div>
            {alerts.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <CheckCircle2 size={24} className="text-green-400 mx-auto mb-2"/>
                <p className="text-sm font-medium text-foreground">Aucune alerte</p>
                <p className="text-xs text-muted-foreground mt-1">Tous les projets sont en bonne santé</p>
              </div>
            ) : (
              alerts.slice(0, 5).map((alert, i) => {
                const cfg = SEVERITY_CFG[alert.severity as keyof typeof SEVERITY_CFG] ?? SEVERITY_CFG.info
                const Icon = cfg.icon
                return (
                  <div key={i} className="rounded-xl p-3 border" style={{ background: cfg.bg, borderColor: cfg.border + "44" }}>
                    <div className="flex items-start gap-2">
                      <Icon size={14} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}/>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{alert.project}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Graphique avancement */}
          <div className="col-span-2">
            <h2 className="text-sm font-semibold text-foreground mb-3">📊 Avancement par projet</h2>
            {chartData.length > 0 ? (
              <div className="bg-card border border-border rounded-xl p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }}/>
                    <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `${v}%`}/>
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                      formatter={(v: any) => [`${v}%`, "Avancement"]}
                    />
                    <Bar dataKey="Avancement" fill="#2563eb" radius={[4, 4, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                <FolderKanban size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Créez des projets pour voir les statistiques</p>
              </div>
            )}
          </div>
        </div>

        {/* Projets récents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">📁 Projets récents</h2>
            <Link href="/projects" className="text-xs text-primary hover:underline">Voir tous →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
              <FolderKanban size={40} className="text-muted-foreground mx-auto mb-3"/>
              <p className="font-medium text-foreground mb-1">Aucun projet</p>
              <p className="text-sm text-muted-foreground mb-4">Commencez par créer votre premier projet</p>
              <Link href="/guide" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/20">
                ✨ Démarrer avec le Guide CP
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {projects.slice(0, 6).map(p => (
                <Link key={p.id} href={`/projects/${p.id}`}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors truncate max-w-28">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.status}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1"/>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Avancement</span>
                      <span className="font-medium text-foreground">{p.completion ?? 0}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.completion ?? 0}%`, background: p.color ?? "#2563eb" }}/>
                    </div>
                  </div>
                  {p.budget > 0 && (
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                      <DollarSign size={10}/> {(p.budget/1000).toFixed(0)}k€
                    </p>
                  )}
                </Link>
              ))}
              <Link href="/guide" className="bg-card border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center hover:border-primary/40 hover:bg-accent/30 transition-all text-muted-foreground hover:text-primary group">
                <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform"/>
                <span className="text-sm font-medium">Nouveau projet</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
