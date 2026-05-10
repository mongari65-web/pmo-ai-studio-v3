"use client"
import { useParams } from "next/navigation"
import { useProject } from "@/hooks/useProject"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { ArrowLeft, Users, Calendar, DollarSign, Tag } from "lucide-react"

const TOOLS = [
  { key:"wbs",          label:"WBS Dict",      icon:"🗂️",  desc:"Structure découpage" },
  { key:"workpackages", label:"Work Packages",  icon:"📦",  desc:"Lots de travaux" },
  { key:"gantt",        label:"Gantt",          icon:"📅",  desc:"Planning visuel" },
  { key:"jalons",       label:"Jalons",         icon:"🏁",  desc:"Étapes clés" },
  { key:"raid",         label:"RAID",           icon:"⚠️",  desc:"Risques & Actions" },
  { key:"budget",       label:"Budget EVM",     icon:"💰",  desc:"Earned Value" },
  { key:"mindmap",      label:"Mind Map",       icon:"🧠",  desc:"Carte mentale" },
  { key:"documents",    label:"Documents",      icon:"📄",  desc:"Bibliothèque" },
  { key:"pert",          label:"PERT",           icon:"🔀",  desc:"Chemin critique" },
]

const GRADIENT_COLORS: Record<string, string> = {
  "#2563eb": "from-blue-900/60 to-blue-950/80",
  "#7c3aed": "from-purple-900/60 to-purple-950/80",
  "#059669": "from-emerald-900/60 to-emerald-950/80",
  "#d97706": "from-amber-900/60 to-amber-950/80",
  "#dc2626": "from-red-900/60 to-red-950/80",
  "#0891b2": "from-cyan-900/60 to-cyan-950/80",
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const { project, loading } = useProject(id)

  if (loading) return (
    <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground">Chargement...</div></AppLayout>
  )
  if (!project) return (
    <AppLayout><div className="p-6 text-muted-foreground">Projet introuvable.</div></AppLayout>
  )

  const color = project.color ?? "#2563eb"
  const gradClass = GRADIENT_COLORS[color] ?? "from-blue-900/60 to-blue-950/80"

  return (
    <AppLayout>
      <div>
        {/* Banner header */}
        <div className={`relative bg-gradient-to-br ${gradClass} border-b border-border overflow-hidden`}
          style={{ minHeight: 160 }}>
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10" style={{ background: color }}/>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-5" style={{ background: color }}/>

          <div className="relative z-10 p-6">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft size={13}/> Tableau de bord
            </Link>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-xl"
                  style={{ background: color + "33", border: `2px solid ${color}66` }}>
                  {project.icon ?? "📋"}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{ borderColor: color + "44", background: color + "22", color }}>
                      {project.methodology ?? "PMI/PMBOK"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 border border-green-500/30 text-green-400">
                      ● En ligne
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground max-w-xl">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {project.client && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag size={11}/> {project.client}
                      </span>
                    )}
                    {project.start_date && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={11}/> {new Date(project.start_date).toLocaleDateString("fr-FR")} → {project.end_date ? new Date(project.end_date).toLocaleDateString("fr-FR") : "?"}
                      </span>
                    )}
                    {project.budget && (
                      <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                        <DollarSign size={11}/> {parseFloat(project.budget).toLocaleString("fr-FR")} €
                      </span>
                    )}
                    {project.team?.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users size={11}/> {project.team.length} membre{project.team.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress circle */}
              <div className="flex-shrink-0 text-center">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#1e293b" strokeWidth="6"/>
                    <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="6"
                      strokeDasharray={`${(project.completion ?? 0) * 2.01} 201`}
                      strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{project.completion ?? 0}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Avancement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tools grid */}
        <div className="p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Outils PMO</p>
          <div className="grid grid-cols-4 gap-3">
            {TOOLS.map(tool => (
              <Link key={tool.key} href={`/projects/${id}/${tool.key}`}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-accent/20 transition-all group cursor-pointer">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{tool.icon}</div>
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{tool.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
              </Link>
            ))}
          </div>

          {/* Team */}
          {project.team?.length > 0 && (
            <div className="mt-4 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-muted-foreground"/>
                <span className="text-sm font-medium text-muted-foreground">Équipe</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.team.map((m: string) => (
                  <div key={m} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                    <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                      {m.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-foreground">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
