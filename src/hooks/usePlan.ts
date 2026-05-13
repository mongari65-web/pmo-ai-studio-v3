"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export type Plan = "free" | "pro" | "team"

const PLAN_FEATURES: Record<Plan, string[]> = {
  free: ["dashboard","projects","guide","portfolio"],
  pro:  ["dashboard","projects","guide","portfolio","templates","pmp-simulator","pmp-conseils","nouveau-pm"],
  team: ["dashboard","projects","guide","portfolio","templates","pmp-simulator","pmp-conseils","nouveau-pm","admin"],
}

export function usePlan() {
  const [plan, setPlan] = useState<Plan>("free")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          setPlan((data?.plan as Plan) ?? "free")
          setLoading(false)
        })
    })
  }, [])

  const canAccess = (feature: string): boolean => {
    return PLAN_FEATURES[plan]?.includes(feature) ?? false
  }

  const isPro = plan === "pro" || plan === "team"
  const isTeam = plan === "team"

  return { plan, loading, canAccess, isPro, isTeam }
}
