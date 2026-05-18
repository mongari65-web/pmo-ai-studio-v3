"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  href?: string
  label?: string
}

export default function BackButton({ href, label = "Retour" }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => href ? router.push(href) : router.back()}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px",
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: "var(--r8)",
        fontSize: 12, fontWeight: 500,
        color: "var(--text-2)",
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: 16,
      }}
      onMouseEnter={e => {
        (e.currentTarget as any).style.borderColor = "var(--border-hover)"
        (e.currentTarget as any).style.color = "var(--text-1)"
      }}
      onMouseLeave={e => {
        (e.currentTarget as any).style.borderColor = "var(--border)"
        (e.currentTarget as any).style.color = "var(--text-2)"
      }}
    >
      <ArrowLeft size={13}/>
      {label}
    </button>
  )
}
