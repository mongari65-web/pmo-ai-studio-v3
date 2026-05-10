"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { useProject } from "@/hooks/useProject"
import { toast } from "sonner"
import { UserPlus, Trash2, Crown, Eye, Edit3, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Member {
  id: string; email: string; role: string; status: string; created_at: string
}

const ROLE_CFG = {
  owner:  { label: "Propriétaire", color: "#f59e0b", icon: Crown },
  editor: { label: "Éditeur",      color: "#3b82f6", icon: Edit3 },
  viewer: { label: "Lecteur",      color: "#64748b", icon: Eye },
}

export default function MembersPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const [members, setMembers] = useState<Member[]>([])
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("editor")
  const [inviting, setInviting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from("project_members").select("*").eq("project_id", id)
      .order("created_at").then(({ data }) => setMembers(data ?? []))
  }, [id])

  const invite = async () => {
    if (!email.trim()) { toast.error("Email requis"); return }
    setInviting(true)
    const { data, error } = await supabase.from("project_members").insert({
      project_id: id, email: email.trim(), role, status: "pending"
    }).select().single()
    if (error) { toast.error(error.message); setInviting(false); return }
    setMembers(prev => [...prev, data])
    setEmail("")
    toast.success(`Invitation envoyée à ${email}`)
    setInviting(false)
  }

  const updateRole = async (memberId: string, newRole: string) => {
    await supabase.from("project_members").update({ role: newRole }).eq("id", memberId)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
    toast.success("Rôle mis à jour")
  }

  const removeMember = async (memberId: string) => {
    await supabase.from("project_members").delete().eq("id", memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
    toast.success("Membre retiré")
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${id}`} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16}/>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Membres du projet</h1>
            <p className="text-sm text-muted-foreground">{project?.name}</p>
          </div>
        </div>

        {/* Invite form */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus size={15}/> Inviter un collaborateur
          </h2>
          <div className="flex gap-3">
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              onKeyDown={e => e.key === "Enter" && invite()}
              className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
              <option value="editor">Éditeur</option>
              <option value="viewer">Lecteur</option>
            </select>
            <button onClick={invite} disabled={inviting || !email.trim()}
              className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {inviting ? "..." : "Inviter"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <strong className="text-foreground">Éditeur</strong> : peut modifier tous les outils ·
            <strong className="text-foreground"> Lecteur</strong> : lecture seule
          </p>
        </div>

        {/* Members list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground">{members.length} membre{members.length > 1 ? "s" : ""}</p>
          </div>
          {members.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <UserPlus size={32} className="mx-auto mb-2 opacity-30"/>
              <p className="text-sm">Aucun membre invité pour l'instant</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members.map(member => {
                const cfg = ROLE_CFG[member.role as keyof typeof ROLE_CFG] ?? ROLE_CFG.viewer
                const Icon = cfg.icon
                return (
                  <div key={member.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/20 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{member.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: cfg.color + "22", color: cfg.color }}>
                          {member.status === "pending" ? "En attente" : "Accepté"}
                        </span>
                      </div>
                    </div>
                    <select value={member.role} onChange={e => updateRole(member.id, e.target.value)}
                      className="text-xs bg-background border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                      <option value="editor">Éditeur</option>
                      <option value="viewer">Lecteur</option>
                    </select>
                    <button onClick={() => removeMember(member.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
