"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Zap } from "lucide-react"

interface QuotaInfo {
  current: number; limit: number; plan: string
}

export default function QuotaBadge() {
  const [quota, setQuota] = useState<QuotaInfo|null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from("profiles")
        .select("plan, ai_calls_count")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (!data) return
          const limits: Record<string,number> = { free:20, pro:150, team:500 }
          setQuota({
            current: data.ai_calls_count ?? 0,
            limit: limits[data.plan ?? "free"] ?? 20,
            plan: data.plan ?? "free"
          })
        })
    })
  }, [])

  if (!quota) return null

  const pct = Math.round(quota.current / quota.limit * 100)
  const color = pct >= 90 ? "#A32D2D" : pct >= 70 ? "#854F0B" : "#27500A"
  const bg    = pct >= 90 ? "#FCEBEB" : pct >= 70 ? "#FAEEDA" : "#EAF3DE"

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px",
      background:bg, borderRadius:"var(--r8)", border:`1px solid ${color}44` }}>
      <Zap size={13} style={{ color }}/>
      <div>
        <span style={{ fontSize:11, fontWeight:600, color }}>
          {quota.current}/{quota.limit} IA
        </span>
        <div style={{ width:60, height:3, background:"rgba(0,0,0,0.1)", borderRadius:2, marginTop:2 }}>
          <div style={{ width:`${Math.min(100,pct)}%`, height:"100%", background:color, borderRadius:2 }}/>
        </div>
      </div>
      {pct >= 90 && quota.plan !== "team" && (
        <Link href="/pricing" style={{ fontSize:10, color, fontWeight:700, textDecoration:"none",
          background:"rgba(255,255,255,0.5)", padding:"1px 6px", borderRadius:10 }}>
          ↑ Upgrade
        </Link>
      )}
    </div>
  )
}
