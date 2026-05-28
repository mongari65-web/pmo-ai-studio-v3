"use client"
import { LogoIcon } from "@/components/ui/LogoSVG"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()
  const router = useRouter()

  // Supabase envoie le token via le hash de l'URL — on écoute l'événnement
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // L'utilisateur est authentifié temporairement — on peut changer le mot de passe
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const validate = () => {
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères."
    if (!/[A-Z]/.test(password)) return "Le mot de passe doit contenir au moins une majuscule."
    if (!/[0-9]/.test(password)) return "Le mot de passe doit contenir au moins un chiffre."
    if (password !== confirm) return "Les mots de passe ne correspondent pas."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push("/dashboard"), 3000)
    }
  }

  const strength = () => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const strengthColors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"]
  const strengthLabels = ["Faible", "Moyen", "Bon", "Excellent"]
  const s = strength()

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
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F0F2FF", margin: "0 0 12px" }}>
              Mot de passe mis à jour !
            </h2>
            <p style={{ fontSize: 14, color: "#9499C0", margin: "0 0 8px", lineHeight: 1.6 }}>
              Votre mot de passe a été modifié avec succès.
            </p>
            <p style={{ fontSize: 13, color: "#5A5F80", margin: "0 0 24px" }}>
              Redirection vers le dashboard dans 3 secondes...
            </p>
            <Link href="/dashboard" style={{ color: "#9B84FF", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Accéder au dashboard →
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F0F2FF", margin: "0 0 8px" }}>
              Nouveau mot de passe
            </h2>
            <p style={{ fontSize: 13, color: "#5A5F80", margin: "0 0 24px" }}>
              Choisissez un mot de passe sécurisé pour votre compte.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 600, color: "#9499C0",
                  marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={fieldStyle}
                  onFocus={e => (e.target.style.borderColor = "#7B5EFF")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                {/* Indicateur de force */}
                {password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= s ? strengthColors[s - 1] : "rgba(255,255,255,0.1)",
                          transition: "background 0.3s",
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: s > 0 ? strengthColors[s - 1] : "#5A5F80", margin: 0 }}>
                      Force : {s > 0 ? strengthLabels[s - 1] : "—"}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 600, color: "#9499C0",
                  marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    ...fieldStyle,
                    borderColor: confirm.length > 0
                      ? password === confirm ? "#22c55e" : "#ef4444"
                      : "rgba(255,255,255,0.12)",
                  }}
                />
              </div>

              {/* Règles */}
              <div style={{ background: "rgba(123,94,255,0.08)", border: "1px solid rgba(123,94,255,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: "#9499C0", margin: "0 0 6px", fontWeight: 600 }}>Règles du mot de passe :</p>
                {[
                  { rule: password.length >= 8, label: "Au moins 8 caractères" },
                  { rule: /[A-Z]/.test(password), label: "Au moins une majuscule" },
                  { rule: /[0-9]/.test(password), label: "Au moins un chiffre" },
                ].map(({ rule, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: rule ? "#22c55e" : "#5A5F80" }}>{rule ? "✓" : "○"}</span>
                    <span style={{ fontSize: 11, color: rule ? "#22c55e" : "#5A5F80" }}>{label}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{
                  background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)",
                  borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#E24B4A",
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px",
                  background: "linear-gradient(135deg,#7B5EFF,#5B3EDF)",
                  color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1,
                }}>
                {loading ? "Mise à jour..." : "Enregistrer le nouveau mot de passe →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
