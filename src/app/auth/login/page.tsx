"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const login = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-bold text-white">P</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">PMO AI Studio</h1>
          <p className="text-muted-foreground text-sm mt-1">Connectez-vous à votre espace</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="votre@email.com"/>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"/>
          </div>
          <button onClick={login} disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Pas de compte ?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
