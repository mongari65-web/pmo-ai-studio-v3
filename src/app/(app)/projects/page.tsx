"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, FolderKanban, Clock, CheckCircle2, Archive, ArrowRight, Settings } from "lucide-react"

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Actif",    color: "#36B37E", bg: "rgba(54,179,126,0.12)" },
  completed: { label: "Terminé", color: "#7B5EFF", bg: "rgba(123,94,255,0.12)" },
  archived:  { label: "Archivé", color: "#5A5F80", bg: "rgba(90,95,128,0.12)" },
  on_hold:   { label: "En pause",color: "#FF991F", bg: "rgba(255,153,31,0.12)" },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [filter, setFilter]     = useState("all")
  const supabase = createClient()
  const router   = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      setProjects(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = projects.filter(p => {
    const matchSearch = search === "" ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || p.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    total:     projects.length,
    active:    projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    archived:  projects.filter(p => p.status === "archived").length,
  }

  return (
    <div style={{ padding: "24px 28px", background: "var(--bg)", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase",
            letterSpacing: "1.5px", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 16, height: 1, background: "var(--primary)", display: "inline-block" }}/>
            // MES PROJETS
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: "0 0 4px",
            display: "flex", alignItems: "center", gap: 10 }}>
            <FolderKanban size={22} style={{ color: "var(--primary)" }}/>
            Mes projets
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            {projects.length} projet{projects.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Link href="/guide"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
            background: "linear-gradient(135deg,var(--primary),var(--primary-dark))",
            borderRadius: "var(--r8)", fontSize: 13, fontWeight: 600, color: "#fff",
            textDecoration: "none", boxShadow: "0 0 20px var(--primary-glow)" }}>
          <Plus size={14}/> Nouveau projet
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total",    value: counts.total,     icon: FolderKanban, color: "var(--primary)" },
          { label: "Actifs",   value: counts.active,    icon: Clock,        color: "#36B37E" },
          { label: "Terminés", value: counts.completed, icon: CheckCircle2, color: "#7B5EFF" },
          { label: "Archivés", value: counts.archived,  icon: Archive,      color: "var(--text-3)" },
        ].map(k => {
          const Icon = k.icon
          return (
            <div key={k.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--r12)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--r8)", flexShrink: 0,
                background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} style={{ color: k.color }}/>
              </div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 800, color: k.color, margin: 0, lineHeight: 1 }}>{k.value}</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", margin: "3px 0 0" }}>{k.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%",
            transform: "translateY(-50%)", color: "var(--text-3)" }}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou description..."
            style={{ width: "100%", paddingLeft: 32, height: 36, background: "var(--bg-card)",
              border: "1px solid var(--border)", borderRadius: "var(--r8)",
              fontSize: 13, color: "var(--text-1)", outline: "none" }}/>
        </div>
        {[
          { v: "all",       l: "Tous" },
          { v: "active",    l: "Actifs" },
          { v: "completed", l: "Terminés" },
          { v: "archived",  l: "Archivés" },
        ].map(({ v, l }) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding: "0 14px", height: 36, borderRadius: "var(--r8)", fontSize: 12,
              fontWeight: filter === v ? 600 : 400, cursor: "pointer",
              background: filter === v ? "var(--primary-bg)" : "var(--bg-card)",
              border: `1px solid ${filter === v ? "var(--primary)" : "var(--border)"}`,
              color: filter === v ? "var(--primary-light)" : "var(--text-2)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Liste projets */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <FolderKanban size={48} style={{ color: "var(--text-3)", margin: "0 auto 16px", display: "block", opacity: 0.3 }}/>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-2)", margin: "0 0 8px" }}>
            {search ? "Aucun projet trouvé" : "Aucun projet"}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 20px" }}>
            {search ? "Essayez un autre terme" : "Créez votre premier projet pour commencer"}
          </p>
          <Link href="/guide"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px",
              background: "var(--primary)", borderRadius: "var(--r8)", fontSize: 13,
              fontWeight: 600, color: "#fff", textDecoration: "none" }}>
            <Plus size={14}/> Nouveau projet
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {filtered.map(p => {
            const s = STATUS_CFG[p.status] ?? STATUS_CFG.active
            const progress = p.progress ?? 0
            return (
              <div key={p.id}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "var(--r12)", padding: "18px 20px", transition: "border-color 0.15s",
                  cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget as any).style.borderColor = "var(--border-hover)"}
                onMouseLeave={e => (e.currentTarget as any).style.borderColor = "var(--border)"}
                onClick={() => router.push(`/projects/${p.id}`)}>

                {/* Top */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{p.icon ?? "🔧"}</span>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", margin: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.name}
                      </h3>
                    </div>
                    {p.client && (
                      <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 6px" }}>{p.client}</p>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                      background: s.bg, color: s.color }}>● {s.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); router.push(`/projects/${p.id}/members`) }}
                      style={{ padding: "5px 7px", background: "var(--bg)", border: "1px solid var(--border)",
                        borderRadius: 6, cursor: "pointer", color: "var(--text-3)" }}>
                      <Settings size={12}/>
                    </button>
                    <button onClick={e => { e.stopPropagation(); router.push(`/projects/${p.id}`) }}
                      style={{ padding: "5px 10px", background: "var(--primary-bg)", border: "1px solid rgba(123,94,255,0.3)",
                        borderRadius: 6, cursor: "pointer", color: "var(--primary-light)", fontSize: 11, fontWeight: 600 }}>
                      Ouvrir →
                    </button>
                  </div>
                </div>

                {/* Description */}
                {p.description && (
                  <p style={{ fontSize: 12, color: "var(--text-2)", margin: "0 0 12px",
                    lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {p.description}
                  </p>
                )}

                {/* Barre progression */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>Avancement</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>{progress}%</span>
                  </div>
                  <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3,
                      background: progress >= 80 ? "#36B37E" : "var(--primary)",
                      width: `${progress}%`, transition: "width 0.4s" }}/>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-3)" }}>
                  {p.budget && <span>💰 {(p.budget/1000).toFixed(0)}k€</span>}
                  {p.methodology && <span>📋 {p.methodology}</span>}
                  {p.team_size && <span>👥 {p.team_size}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bouton flottant */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Link href="/guide"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--r8)", fontSize: 13, color: "var(--text-2)",
            textDecoration: "none", transition: "all 0.15s" }}>
          <Plus size={14}/> Nouveau projet
        </Link>
      </div>
    </div>
  )
}
