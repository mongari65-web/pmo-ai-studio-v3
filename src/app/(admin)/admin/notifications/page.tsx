"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell, Send, Trash2, Users, Crown, Zap } from "lucide-react"
import { toast } from "sonner"

interface NotifLog {
  id: string; title: string; message: string; target: string
  sent_count: number; created_at: string; type: string
}

const NOTIF_TYPES = [
  { id: "info",    label: "Info",     color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { id: "success", label: "Succès",   color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  { id: "warning", label: "Alerte",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  { id: "promo",   label: "Promo",    color: "#7B5EFF", bg: "rgba(123,94,255,0.1)" },
]

export default function AdminNotificationsPage() {
  const [title, setTitle]     = useState("")
  const [message, setMessage] = useState("")
  const [target, setTarget]   = useState("all")
  const [type, setType]       = useState("info")
  const [sending, setSending] = useState(false)
  const [logs, setLogs]       = useState<NotifLog[]>([])
  const [preview, setPreview] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
    setLogs(data ?? [])
  }

  const sendNotif = async () => {
    if (!title || !message) { toast.error("Titre et message obligatoires"); return }
    setSending(true)
    try {
      // Récupérer les users ciblés
      let query = supabase.from("profiles").select("user_id, plan")
      if (target !== "all") query = query.eq("plan", target)
      const { data: users } = await query

      if (!users?.length) { toast.error("Aucun utilisateur trouvé"); return }

      // Insérer notif dans la table notifications de chaque user
      const notifs = users.map(u => ({
        user_id: u.user_id,
        title,
        message,
        type,
        read: false,
        created_at: new Date().toISOString()
      }))

      const { error } = await supabase.from("notifications").insert(notifs)
      if (error) throw error

      // Logger l'envoi
      await supabase.from("admin_notifications").insert({
        title, message, target, type,
        sent_count: users.length,
        created_at: new Date().toISOString()
      })

      toast.success("Notification envoyée à " + users.length + " utilisateurs")
      setTitle(""); setMessage(""); loadLogs()
    } catch (e: any) {
      toast.error("Erreur : " + e.message)
    } finally {
      setSending(false)
    }
  }

  const notifTypeCfg = NOTIF_TYPES.find(t => t.id === type) ?? NOTIF_TYPES[0]

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: 0 }}>🔔 Notifications</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}>Envoyer des notifications à vos utilisateurs</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Formulaire */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", margin: "0 0 16px" }}>✏️ Nouvelle notification</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Cible */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Cible</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { id: "all",     label: "Tous", icon: "👥" },
                  { id: "free",    label: "Gratuit", icon: "🌱" },
                  { id: "starter", label: "Starter", icon: "🚀" },
                  { id: "pro",     label: "Pro", icon: "⚡" },
                  { id: "premium", label: "Premium", icon: "👑" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTarget(t.id)}
                    style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(target===t.id?"var(--primary)":"var(--border)"), background:target===t.id?"var(--primary-bg)":"transparent", color:target===t.id?"var(--primary-light)":"var(--text-3)" }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Type</label>
              <div style={{ display: "flex", gap: 6 }}>
                {NOTIF_TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)}
                    style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(type===t.id?t.color:"var(--border)"), background:type===t.id?t.bg:"transparent", color:type===t.id?t.color:"var(--text-3)" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Titre */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Titre *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Nouvelle fonctionnalité disponible !"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", color: "var(--text-1)", fontSize: 13, boxSizing: "border-box" }}/>
            </div>

            {/* Message */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Message *</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                placeholder="Décrivez votre message..."
                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", color: "var(--text-1)", fontSize: 13, resize: "vertical", boxSizing: "border-box" }}/>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={sendNotif} disabled={sending || !title || !message}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1 }}>
                <Send size={14}/> {sending ? "Envoi en cours..." : "Envoyer"}
              </button>
              <button onClick={() => setPreview(!preview)}
                style={{ padding: "10px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-2)", cursor: "pointer" }}>
                Aperçu
              </button>
            </div>
          </div>
        </div>

        {/* Aperçu + historique */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Aperçu */}
          {(preview || title || message) && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", margin: "0 0 10px", textTransform: "uppercase" }}>Aperçu</h4>
              <div style={{ background: notifTypeCfg.bg, border: "1px solid "+notifTypeCfg.color+"44", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid "+notifTypeCfg.color }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: notifTypeCfg.color, marginBottom: 4 }}>{title || "Titre de la notification"}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{message || "Votre message apparaîtra ici..."}</div>
                <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 8 }}>Cible : {target === "all" ? "Tous les utilisateurs" : "Plan "+target}</div>
              </div>
            </div>
          )}

          {/* Historique */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, flex: 1 }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", margin: "0 0 12px", textTransform: "uppercase" }}>Historique des envois</h4>
            {logs.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", padding: "20px 0" }}>Aucune notification envoyée</p>
            ) : logs.map(log => {
              const cfg = NOTIF_TYPES.find(t => t.id === log.type) ?? NOTIF_TYPES[0]
              return (
                <div key={log.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 8, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{log.title}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>👥 {log.sent_count}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                    {new Date(log.created_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })} · Cible: {log.target}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
