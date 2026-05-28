"use client"
import { LogoIcon } from "@/components/ui/LogoSVG"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "#0F1022",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#F0F2FF",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0B14",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ margin: "0 auto 14px", display: "flex", justifyContent: "center" }}>
          <LogoIcon size={64} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#F0F2FF", margin: "0 0 6px" }}>PMO AI Studio</h1>
        <p style={{ fontSize: 13, color: "#5A5F80", margin: 0 }}>
          L&apos;outil PMO qui transforme vos projets en succès — de débutant à expert
        </p>
      </div>

      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#111320",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "28px 32px",
      }}>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F0F2FF", margin: "0 0 12px" }}>
              Email envoyé !
            </h2>
            <p style={{ fontSize: 14, color: "#9499C0", margin: "0 0 24px", lineHeight: 1.6 }}>
              Consultez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <Link href="/auth/login" style={{ color: "#9B84FF", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F0F2FF", margin: "0 0 8px" }}>
              Mot de passe oublié
            </h2>
            <p style={{ fontSize: 13, color: "#5A5F80", margin: "0 0 24px" }}>
              Entrez votre email et nous vous enverrons un lien de réinitialisation.
            </p>
            <form onSubmit={handleReset}>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#9499C0",
                  marginBottom: 7,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  style={fieldStyle}
                  onFocus={e => (e.target.style.borderColor = "#7B5EFF")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
              </div>
              {error && (
                <div style={{
                  background: "rgba(226,75,74,0.1)",
                  border: "1px solid rgba(226,75,74,0.3)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#E24B4A",
                }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "linear-gradient(135deg,#7B5EFF,#5B3EDF)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}>
                {loading ? "Envoi en cours..." : "Envoyer le lien →"}
              </button>
            </form>
            <p style={{
              textAlign: "center",
              marginTop: 20,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              fontSize: 13,
              color: "#5A5F80",
            }}>
              <Link href="/auth/login" style={{ color: "#9B84FF", fontWeight: 600, textDecoration: "none" }}>
                ← Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
