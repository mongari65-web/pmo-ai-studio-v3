"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Plus, Search, Filter, Archive, CheckCircle2, Clock } from "lucide-react"

interface Project {
  id: string; name: string; description: string; client: string
  status: string; completion: number; color: string; icon: string
  methodology: string; budget: number; start_date: string; end_date: string
  created_at: string; team: string[]
}

const STATUS_CFG = {
  active:    { label: "Actif",    color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  archived:  { label: "Archivé", color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  completed: { label: "Terminé", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from("projects").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setProjects(data ?? []); setLoading(false) })
  }, [])

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.client ?? "").toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    archived: projects.filter(p => p.status === "archived").length,
  }

  const archiveProject = async (id: string) => {
    await supabase.from("projects").update({ status: "archived" }).eq("id", id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: "archived" } : p))
  }

  const completeProject = async (id: string) => {
    await supabase.from("projects").update({ status: "completed", completion: 100 }).eq("id", id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: "completed", completion: 100 } : p))
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mes projets</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{stats.total} projet{stats.total > 1 ? "s" : ""} au total</p>
          </div>
          <Link href="/guide" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={15}/> Nouveau projet
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Actifs", value: stats.active, color: "text-green-400" },
            { label: "Terminés", value: stats.completed, color: "text-blue-400" },
            { label: "Archivés", value: stats.archived, color: "text-muted-foreground" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou client..."
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "Tous" },
              { key: "active", label: "Actifs" },
              { key: "completed", label: "Terminés" },
              { key: "archived", label: "Archivés" },
            ].map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  filterStatus === f.key
                    ? "bg-primary border-primary text-white"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">📂</div>
            <p className="font-medium text-foreground mb-1">Aucun projet trouvé</p>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "Modifiez votre recherche" : "Créez votre premier projet"}
            </p>
            <Link href="/guide" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
              <Plus size={14}/> Nouveau projet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(p => {
              const cfg = STATUS_CFG[p.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.active
              return (
                <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all group">
                  {/* Color bar */}
                  <div className="h-1" style={{ background: p.color ?? "#2563eb" }}/>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">{p.icon ?? "📋"}</span>
                        <div className="min-w-0">
                          <Link href={`/projects/${p.id}`}
                            className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors block truncate">
                            {p.name}
                          </Link>
                          {p.client && <p className="text-xs text-muted-foreground truncate">{p.client}</p>}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ml-2"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>

                    {p.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                    )}

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Avancement</span>
                        <span className="font-medium text-foreground">{p.completion ?? 0}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.completion ?? 0}%`, background: p.color ?? "#2563eb" }}/>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{p.methodology ?? "PMI"}</span>
                      {p.budget > 0 && <span className="text-green-400 font-medium">{(p.budget/1000).toFixed(0)}k€</span>}
                      {p.team?.length > 0 && <span>👥 {p.team.length}</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Link href={`/projects/${p.id}`}
                        className="flex-1 text-center py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                        Ouvrir →
                      </Link>
                      {p.status === "active" && (
                        <>
                          <button onClick={() => completeProject(p.id)}
                            className="p-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                            title="Marquer terminé">
                            <CheckCircle2 size={13}/>
                          </button>
                          <button onClick={() => archiveProject(p.id)}
                            className="p-1.5 bg-muted border border-border text-muted-foreground rounded-lg hover:bg-accent transition-colors"
                            title="Archiver">
                            <Archive size={13}/>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {/* New project card */}
            <Link href="/guide"
              className="bg-card border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center hover:border-primary/40 hover:bg-accent/20 transition-all text-muted-foreground hover:text-primary group min-h-48">
              <Plus size={28} className="mb-2 group-hover:scale-110 transition-transform"/>
              <span className="text-sm font-medium">Nouveau projet</span>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
