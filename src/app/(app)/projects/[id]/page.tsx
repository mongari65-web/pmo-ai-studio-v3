"use client"
import { useParams, useRouter } from "next/navigation"
import { useProject } from "@/hooks/useProject"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { ArrowLeft, Settings, Users, BarChart3 } from "lucide-react"

const TOOLS = [
  { key: "wbs",          label: "WBS",          icon: "🗂️",  desc: "Structure de découpage" },
  { key: "workpackages", label: "Work Packages", icon: "📦",  desc: "Lots de travaux" },
  { key: "gantt",        label: "Gantt",         icon: "📅",  desc: "Planning visuel" },
  { key: "jalons",       label: "Jalons",        icon: "🏁",  desc: "Étapes clés" },
  { key: "raid",         label: "RAID",          icon: "⚠️",  desc: "Risques, Actions, Issues" },
  { key: "budget",       label: "Budget EVM",    icon: "💰",  desc: "Earned Value Management" },
  { key: "mindmap",      label: "Mind Map",      icon: "🧠",  desc: "Carte mentale" },
  { key: "documents",    label: "Documents",     icon: "📄",  desc: "Bibliothèque documentaire" },
]

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const { project, loading } = useProject(id)

  if (loading) return (
    <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground">Chargement...</div></AppLayout>
  )
  if (!project) return (
    <AppLayout><div className="p-6 text-muted-foreground">Projet introuvable.</div></AppLayout>
  )

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header projet */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16}/>
            </Link>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: (project.color ?? "#2563eb") + "22", border: `1px solid ${project.color ?? "#2563eb"}44` }}>
              {project.icon ?? "📋"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.client} · {project.methodology}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {project.budget && (
              <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium">
                {parseFloat(project.budget).toLocaleString("fr-FR")} €
              </span>
            )}
            <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium">
              {project.methodology}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground font-medium">Avancement global</span>
            <span className="text-foreground font-semibold">{project.completion ?? 0}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${project.completion ?? 0}%` }}/>
          </div>
          {project.start_date && project.end_date && (
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>📅 {new Date(project.start_date).toLocaleDateString("fr-FR")}</span>
              <span>🏁 {new Date(project.end_date).toLocaleDateString("fr-FR")}</span>
            </div>
          )}
        </div>

        {/* Tools grid */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Outils PMO</h2>
          <div className="grid grid-cols-4 gap-3">
            {TOOLS.map(tool => (
              <Link key={tool.key} href={`/projects/${id}/${tool.key}`}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-accent/30 transition-all group cursor-pointer">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{tool.icon}</div>
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{tool.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Team */}
        {project.team?.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} className="text-muted-foreground"/>
              <span className="text-sm font-medium text-muted-foreground">Équipe</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.team.map((member: string) => (
                <span key={member} className="px-3 py-1 bg-muted rounded-full text-xs text-foreground font-medium">{member}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
