"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function BackButton({ href, label = "Retour" }: { href?: string; label?: string }) {
  const router = useRouter()
  return (
    <button onClick={() => href ? router.push(href) : router.back()}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "7px 14px", marginBottom: 20,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r8)",
        fontSize: 12, fontWeight: 600,
        color: "var(--text-2)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = "var(--primary)"
        el.style.color = "var(--primary-light)"
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = "var(--border)"
        el.style.color = "var(--text-2)"
      }}>
      <ArrowLeft size={13}/>
      {label}
    </button>
  )
}
