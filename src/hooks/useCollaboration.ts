"use client"
// hooks/useCollaboration.ts
// Supabase Realtime : présence utilisateurs + sync données + activité
import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export interface PresenceUser {
  user_id: string
  user_name: string
  color: string
  tool: string
  online_at: string
}

export interface Comment {
  id: string
  project_id: string
  tool_type: string
  item_id?: string
  content: string
  author_id: string
  author_name: string
  created_at: string
}

export interface Activity {
  id: string
  project_id: string
  user_name: string
  action: string
  details: Record<string, any>
  created_at: string
}

const USER_COLORS = [
  "#2563eb","#7c3aed","#059669","#d97706",
  "#dc2626","#0891b2","#7c3aed","#be185d"
]

export function useCollaboration(projectId: string, toolType: string) {
  const supabase = createClient()
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const channelRef = useRef<any>(null)
  const userColorRef = useRef<string>("")

  useEffect(() => {
    if (!projectId) return

    // Initialiser la couleur utilisateur
    const colorIdx = Math.floor(Math.random() * USER_COLORS.length)
    userColorRef.current = USER_COLORS[colorIdx]

    // Charger les commentaires existants
    supabase.from("tool_comments").select("*")
      .eq("project_id", projectId).eq("tool_type", toolType)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments(data ?? []))

    // Charger les activités récentes
    supabase.from("project_activity").select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setActivities(data ?? []))

    return () => {}
  }, [projectId, toolType])

  useEffect(() => {
    if (!projectId) return

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const userName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Utilisateur"

      // Channel Realtime avec présence
      const channel = supabase.channel(`project:${projectId}`, {
        config: { presence: { key: user.id } }
      })

      // Présence — qui est en ligne
      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const users: PresenceUser[] = Object.values(state).flat().map((u: any) => ({
          user_id: u.user_id,
          user_name: u.user_name,
          color: u.color,
          tool: u.tool,
          online_at: u.online_at,
        }))
        setOnlineUsers(users.filter(u => u.user_id !== user.id))
      })

      // Nouveaux commentaires temps réel
      channel.on("postgres_changes", {
        event: "INSERT", schema: "public", table: "tool_comments",
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        setComments(prev => [...prev, payload.new as Comment])
      })

      // Nouvelles activités temps réel
      channel.on("postgres_changes", {
        event: "INSERT", schema: "public", table: "project_activity",
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        setActivities(prev => [payload.new as Activity, ...prev.slice(0, 19)])
      })

      // Sync données outils temps réel
      channel.on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "project_tools",
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        // Déclencher un refresh si c'est le même outil
        if (payload.new.tool_type === toolType) {
          window.dispatchEvent(new CustomEvent("tool-updated", { detail: payload.new }))
        }
      })

      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            user_name: userName,
            color: userColorRef.current,
            tool: toolType,
            online_at: new Date().toISOString(),
          })
        }
      })

      channelRef.current = channel
    }

    setupRealtime()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [projectId, toolType])

  // Ajouter un commentaire
  const addComment = useCallback(async (content: string, itemId?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const userName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Utilisateur"
    const { data } = await supabase.from("tool_comments").insert({
      project_id: projectId, tool_type: toolType,
      item_id: itemId, content,
      author_id: user.id, author_name: userName
    }).select().single()
    return data
  }, [projectId, toolType])

  // Supprimer un commentaire
  const deleteComment = useCallback(async (commentId: string) => {
    await supabase.from("tool_comments").delete().eq("id", commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }, [])

  // Enregistrer une activité
  const logActivity = useCallback(async (action: string, details?: Record<string, any>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const userName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Utilisateur"
    await supabase.from("project_activity").insert({
      project_id: projectId, user_id: user.id,
      user_name: userName, action, details: details ?? {}
    })
  }, [projectId])

  return {
    onlineUsers,
    comments,
    activities,
    addComment,
    deleteComment,
    logActivity,
    userColor: userColorRef.current,
  }
}
