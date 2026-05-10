"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { Bell, AlertTriangle, Clock, CheckCircle2, Info, Trash2 } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setNotifications(data ?? []))
  }, [])

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const deleteNotif = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("read", false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const TYPE_CFG: Record<string, any> = {
    raid:    { icon: AlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "RAID" },
    budget:  { icon: Clock,         color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Budget" },
    jalon:   { icon: Clock,         color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Jalon" },
    success: { icon: CheckCircle2,  color: "#22c55e", bg: "rgba(34,197,94,0.1)",  label: "Succès" },
    info:    { icon: Info,           color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "Info" },
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell size={22}/> Notifications
              {unread > 0 && <span className="text-sm bg-primary text-white rounded-full px-2 py-0.5 font-medium">{unread}</span>}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Alertes RAID, jalons, budget</p>
          </div>
          {unread > 0 && <button onClick={markAllRead} className="text-xs text-primary hover:underline">Tout marquer lu</button>}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3"/>
            <p className="font-medium text-foreground mb-1">Aucune notification</p>
            <p className="text-sm text-muted-foreground">Les alertes apparaîtront ici automatiquement.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => {
              const cfg = TYPE_CFG[notif.type] ?? TYPE_CFG.info
              const Icon = cfg.icon
              return (
                <div key={notif.id} onClick={() => !notif.read && markRead(notif.id)}
                  className="rounded-xl p-4 border flex items-start gap-3 group cursor-pointer transition-all"
                  style={{ background: !notif.read ? cfg.bg : "transparent", borderColor: !notif.read ? cfg.color + "33" : "var(--border)", borderLeftWidth: 3, borderLeftColor: cfg.color, opacity: notif.read ? 0.6 : 1 }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.color + "22" }}>
                    <Icon size={15} style={{ color: cfg.color }}/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: cfg.color + "22", color: cfg.color }}>{cfg.label}</span>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary"/>}
                    </div>
                    <p className="text-sm font-medium text-foreground">{notif.title}</p>
                    {notif.message && <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteNotif(notif.id) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-muted-foreground hover:text-destructive rounded">
                    <Trash2 size={13}/>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
