"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const register = async () => {
    if (!name || !email || !password) { toast.error("Remplissez tous les champs"); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success("Compte créé ! Vérifiez vos emails.")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-bold text-white">P</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
          <p className="text-muted-foreground text-sm mt-1">Commencez gratuitement</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {[
            { label:"Nom complet", value:name, set:setName, type:"text", ph:"Jean Dupont" },
            { label:"Email", value:email, set:setEmail, type:"email", ph:"votre@email.com" },
            { label:"Mot de passe", value:password, set:setPassword, type:"password", ph:"8 caractères min." },
          ].map(f => (
            <div key={f.label}>
              <label className="text-sm font-medium text-foreground block mb-1.5">{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder={f.ph}/>
            </div>
          ))}
          <button onClick={register} disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? "Création..." : "Créer mon compte"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
