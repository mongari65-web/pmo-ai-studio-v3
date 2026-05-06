"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Plus, FolderKanban, TrendingUp, AlertTriangle, CheckCircle2, Wand2 } from "lucide-react"

interface Project {
  id: string; name: string; description: string
  status: string; completion: number; color: string
  icon: string; created_at: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.from("projects").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setProjects(data ?? []))
  }, [])

  const stats = [
    { label: "Projets actifs", value: projects.filter(p => p.status === "active").length, icon: FolderKanban, color: "text-blue-400" },
    { label: "En cours", value: projects.filter(p => p.completion > 0 && p.completion < 100).length, icon: TrendingUp, color: "text-purple-400" },
    { label: "Terminés", value: projects.filter(p => p.completion === 100).length, icon: CheckCircle2, color: "text-green-400" },
    { label: "À surveiller", value: projects.filter(p => p.status === "active" && p.completion < 20).length, icon: AlertTriangle, color: "text-amber-400" },
  ]

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bonjour{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Vue d'ensemble de vos projets</p>
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

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                <s.icon size={16} className={s.color}/>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Projects grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Projets récents</h2>
            <Link href="/projects" className="text-sm text-primary hover:underline">Voir tous →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
              <FolderKanban size={40} className="text-muted-foreground mx-auto mb-3"/>
              <p className="font-medium text-foreground mb-1">Aucun projet</p>
              <p className="text-sm text-muted-foreground mb-4">Créez votre premier projet ou laissez le Guide CP vous guider.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/guide" className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/20">
                  ✨ Guide CP
                </Link>
                <Link href="/projects/new" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
                  Nouveau projet
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {projects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{p.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${p.status === "active" ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-border text-muted-foreground"}`}>
                      {p.status}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Avancement</span>
                      <span>{p.completion}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.completion}%` }}/>
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/projects/new" className="bg-card border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center hover:border-primary/40 hover:bg-accent/30 transition-all text-muted-foreground hover:text-primary group">
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
