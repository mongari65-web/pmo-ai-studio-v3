import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export const PLAN_LIMITS = {
  free:  { ai_calls: 20,  label: "Gratuit" },
  pro:   { ai_calls: 150, label: "Pro" },
  team:  { ai_calls: 500, label: "Équipe" },
} as const

export const TOOL_MODEL: Record<string, string> = {
  wbs:          "claude-haiku-4-5-20251001",
  gantt:        "claude-haiku-4-5-20251001",
  raid:         "claude-haiku-4-5-20251001",
  jalons:       "claude-haiku-4-5-20251001",
  workpackages: "claude-haiku-4-5-20251001",
  mindmap:      "claude-haiku-4-5-20251001",
  budget:       "claude-sonnet-4-6",
  pert:         "claude-sonnet-4-6",
  report:       "claude-sonnet-4-6",
  default:      "claude-haiku-4-5-20251001",
}

export function makeCacheKey(toolType: string, projectName: string, description: string): string {
  const raw = `${toolType}::${projectName.toLowerCase().trim()}::${description.toLowerCase().trim().slice(0, 200)}`
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32)
}

export async function checkQuota(userId: string): Promise<{
  allowed: boolean; current: number; limit: number; plan: string; message?: string
}> {
  try {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, ai_calls_count, ai_calls_reset_at, is_banned")
      .eq("id", userId)
      .single()

    if (!profile) return { allowed: false, current: 0, limit: 0, plan: "free", message: "Profil introuvable" }
    if (profile.is_banned) return { allowed: false, current: 0, limit: 0, plan: "free", message: "Compte suspendu" }

    const resetAt = profile.ai_calls_reset_at ? new Date(profile.ai_calls_reset_at) : new Date(0)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    let callsCount = profile.ai_calls_count ?? 0
    if (resetAt < monthAgo) {
      await supabase.from("profiles")
        .update({ ai_calls_count: 0, ai_calls_reset_at: new Date().toISOString() })
        .eq("id", userId)
      callsCount = 0
    }

    const plan = (profile.plan ?? "free") as keyof typeof PLAN_LIMITS
    const limit = PLAN_LIMITS[plan]?.ai_calls ?? 20
    if (callsCount >= limit) {
      const upgrade = plan === "free" ? "Pro (150/mois)" : plan === "pro" ? "Équipe (500/mois)" : null
      return {
        allowed: false, current: callsCount, limit, plan,
        message: upgrade
          ? `Quota IA épuisé (${callsCount}/${limit}). Passez au plan ${upgrade} pour continuer.`
          : `Quota IA épuisé (${callsCount}/${limit}).`
      }
    }
    return { allowed: true, current: callsCount, limit, plan }
  } catch {
    return { allowed: true, current: 0, limit: 999, plan: "free" }
  }
}

export async function incrementQuota(userId: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc("increment_ai_calls", { user_id_param: userId })
    if (error) {
      const { data } = await supabase.from("profiles")
        .select("ai_calls_count").eq("id", userId).single()
      await supabase.from("profiles")
        .update({ ai_calls_count: (data?.ai_calls_count ?? 0) + 1 })
        .eq("id", userId)
    }
  } catch { /* silently fail */ }
}

export async function getCache(cacheKey: string): Promise<unknown | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ia_cache")
      .select("result")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle()
    if (error || !data) return null
    return (data as any).result ?? null
  } catch {
    return null
  }
}

export async function setCache(cacheKey: string, toolType: string, result: unknown): Promise<void> {
  try {
    const supabase = await createClient()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from("ia_cache").upsert({
      cache_key: cacheKey,
      tool_type: toolType,
      result,
      expires_at: expiresAt,
      hits: 0
    }, { onConflict: "cache_key" })
  } catch { /* silently fail */ }
}
