"use client"
// components/collaboration/CollabBar.tsx
// Barre de collaboration : avatars en ligne + commentaires + activité
import { useState } from "react"
import { MessageSquare, Activity, X, Send, Trash2 } from "lucide-react"
import { useCollaboration } from "@/hooks/useCollaboration"

interface CollabBarProps {
  projectId: string
  toolType: string
  projectName?: string
}

export default function CollabBar({ projectId, toolType, projectName }: CollabBarProps) {
  const [panel, setPanel] = useState<"comments"|"activity"|null>(null)
  const [newComment, setNewComment] = useState("")
  const { onlineUsers, comments, activities, addComment, deleteComment, userColor } = useCollaboration(projectId, toolType)

  const sendComment = async () => {
    if (!newComment.trim()) return
    await addComment(newComment.trim())
    setNewComment("")
  }

  const totalOnline = onlineUsers.length

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>

      {/* Avatars utilisateurs en ligne */}
      {totalOnline > 0 && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex" }}>
            {onlineUsers.slice(0, 4).map((u, i) => (
              <div key={u.user_id} style={{
                width: 28, height: 28, borderRadius: "50%",
                background: u.color, border: "2px solid #0a0f1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff",
                marginLeft: i > 0 ? -8 : 0, zIndex: 4-i,
                cursor: "default", position: "relative"
              }} title={`${u.user_name} · ${u.tool}`}>
                {u.user_name.charAt(0).toUpperCase()}
              </div>
            ))}
            {onlineUsers.length > 4 && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#1e293b", border: "2px solid #0a0f1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "#64748b", marginLeft: -8
              }}>+{onlineUsers.length - 4}</div>
            )}
          </div>
          <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>
            {totalOnline} en ligne
          </span>
        </div>
      )}

      {/* Bouton commentaires */}
      <button onClick={() => setPanel(panel === "comments" ? null : "comments")}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 8,
          border: `1px solid ${panel === "comments" ? "#2563eb" : "#1e293b"}`,
          background: panel === "comments" ? "rgba(37,99,235,0.1)" : "transparent",
          color: panel === "comments" ? "#60a5fa" : "#64748b",
          cursor: "pointer", fontSize: 12
        }}>
        <MessageSquare size={13}/>
        {comments.length > 0 && <span style={{ background: "#2563eb", color: "#fff", borderRadius: 10, padding: "0 5px", fontSize: 10 }}>{comments.length}</span>}
        <span>Commentaires</span>
      </button>

      {/* Bouton activité */}
      <button onClick={() => setPanel(panel === "activity" ? null : "activity")}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 8,
          border: `1px solid ${panel === "activity" ? "#7c3aed" : "#1e293b"}`,
          background: panel === "activity" ? "rgba(124,58,237,0.1)" : "transparent",
          color: panel === "activity" ? "#a78bfa" : "#64748b",
          cursor: "pointer", fontSize: 12
        }}>
        <Activity size={13}/>
        <span>Activité</span>
      </button>

      {/* Panel flottant */}
      {panel && (
        <div style={{
          position: "absolute", top: "110%", right: 0, zIndex: 200,
          width: 340, background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #1e293b", background: "#0a0f1a" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>
              {panel === "comments" ? "💬 Commentaires" : "📋 Activité récente"}
            </span>
            <button onClick={() => setPanel(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}>
              <X size={14}/>
            </button>
          </div>

          {/* Commentaires */}
          {panel === "comments" && (
            <>
              <div style={{ maxHeight: 300, overflowY: "auto", padding: "8px 0" }}>
                {comments.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "#475569", fontSize: 13 }}>
                    Aucun commentaire. Soyez le premier !
                  </div>
                ) : comments.map(c => (
                  <div key={c.id} style={{ padding: "10px 16px", borderBottom: "1px solid #0a0f1a", display: "flex", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#60a5fa", flexShrink: 0 }}>
                      {c.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{c.author_name}</span>
                        <span style={{ fontSize: 10, color: "#475569" }}>
                          {new Date(c.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{c.content}</p>
                    </div>
                    <button onClick={() => deleteComment(c.id)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", padding: 2, alignSelf: "flex-start" }}>
                      <Trash2 size={11}/>
                    </button>
                  </div>
                ))}
              </div>
              {/* Input commentaire */}
              <div style={{ padding: "10px 16px", borderTop: "1px solid #1e293b", display: "flex", gap: 8 }}>
                <input value={newComment} onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendComment()}
                  placeholder="Ajouter un commentaire..."
                  style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "#e2e8f0", outline: "none" }}/>
                <button onClick={sendComment} disabled={!newComment.trim()}
                  style={{ background: "#2563eb", border: "none", borderRadius: 8, width: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: newComment.trim() ? 1 : 0.4 }}>
                  <Send size={14} color="#fff"/>
                </button>
              </div>
            </>
          )}

          {/* Activité */}
          {panel === "activity" && (
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {activities.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "#475569", fontSize: 13 }}>Aucune activité récente</div>
              ) : activities.map(a => (
                <div key={a.id} style={{ padding: "10px 16px", borderBottom: "1px solid #0a0f1a", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", flexShrink: 0 }}>
                    {a.user_name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
                      <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{a.user_name}</span> {a.action}
                    </p>
                    <span style={{ fontSize: 10, color: "#475569" }}>
                      {new Date(a.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
