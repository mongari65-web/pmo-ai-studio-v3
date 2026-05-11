"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface PMPQuestion {
  id: number; lot: number; level: string
  domain: string; pmbok: string; question: string
  options: string[]; correct: number; explanation: string
}

// Cache mémoire pour éviter les re-fetches dans la même session
const cache: Record<number, PMPQuestion[]> = {}

export function usePMPQuestions(lot: number | null) {
  const [questions, setQuestions] = useState<PMPQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!lot) return
    if (cache[lot]) { setQuestions(cache[lot]); return }

    setLoading(true)
    supabase
      .from("pmp_questions")
      .select("*")
      .eq("lot", lot)
      .order("id")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          // Normaliser options (peut être string[] ou JSONB)
          const normalized = data.map(q => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as any)
          }))
          cache[lot] = normalized
          setQuestions(normalized)
        }
        setLoading(false)
      })
  }, [lot])

  return { questions, loading }
}

// Seed automatique au premier usage
export async function seedIfNeeded(): Promise<void> {
  try {
    const res = await fetch("/api/pmp-seed")
    const data = await res.json()
    if (data.seeded) console.log("✅ PMP questions seeded:", data.message)
  } catch(e) {
    // Silently fail — questions statiques utilisées en fallback
  }
}
