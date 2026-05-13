"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Lock, Crown, Zap, ArrowRight } from "lucide-react"

interface ProGateProps {
  feature: string
  featureLabel: string
  children: React.ReactNode
  requiredPlan?: "pro" | "team"
}

export default function ProGate({ feature, featureLabel, children, requiredPlan = "pro" }: ProGateProps) {
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from("profiles").select("plan").eq("id", user.id).single()
        .then(({ data }) => {
          setPlan(data?.plan ?? "free")
          setLoading(false)
        })
    })
  }, [])

  if (loading) return (
    <AppLayout>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
        <div style={{ fontSize:13, color:"var(--text-3)" }}>Vérification de l'accès...</div>
      </div>
    </AppLayout>
  )

  // Accès autorisé si Pro ou Team (Team inclut tout)
  const hasAccess = plan === "pro" || plan === "team"
  if (hasAccess) return <>{children}</>

  // Mur d'accès Pro
  return (
    <AppLayout>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"70vh", padding:24 }}>
        <div style={{ maxWidth:520, width:"100%", textAlign:"center" }}>

          {/* Icône lock */}
          <div style={{ width:72, height:72, borderRadius:"50%", background:"var(--warning-bg)", border:"2px solid #EF9F27", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <Lock size={32} style={{ color:"var(--warning)" }}/>
          </div>

          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px" }}>
            Accès réservé aux abonnés Pro
          </h1>
          <p style={{ fontSize:14, color:"var(--text-2)", margin:"0 0 28px", lineHeight:1.6 }}>
            <strong>{featureLabel}</strong> est disponible à partir du plan <strong>Pro</strong>.
            Passez au plan Pro pour accéder à cette fonctionnalité et à bien d'autres.
          </p>

          {/* Comparaison plans */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
            {/* Plan Gratuit */}
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:20, textAlign:"left" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <Zap size={18} style={{ color:"var(--text-3)" }}/>
                <span style={{ fontSize:14, fontWeight:700, color:"var(--text-1)" }}>Gratuit</span>
              </div>
              <p style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>0€</p>
              {["1 projet","20 générations IA/mois","WBS, Gantt, RAID"].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                  <span style={{ fontSize:12, color:"var(--text-3)" }}>✓</span>
                  <span style={{ fontSize:12, color:"var(--text-2)" }}>{f}</span>
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                <Lock size={12} style={{ color:"var(--danger)" }}/>
                <span style={{ fontSize:12, color:"var(--danger)", textDecoration:"line-through" }}>{featureLabel}</span>
              </div>
              <div style={{ marginTop:14, padding:"8px 0", textAlign:"center", background:"var(--bg)", borderRadius:"var(--r6)", fontSize:12, color:"var(--text-3)" }}>
                Votre plan actuel
              </div>
            </div>

            {/* Plan Pro */}
            <div style={{ background:"var(--primary-bg)", border:"2px solid var(--primary)", borderRadius:"var(--r12)", padding:20, textAlign:"left", position:"relative" }}>
              <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"var(--primary)", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 12px", borderRadius:20 }}>
                RECOMMANDÉ
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <Crown size={18} style={{ color:"var(--primary)" }}/>
                <span style={{ fontSize:14, fontWeight:700, color:"var(--primary-t)" }}>Pro</span>
              </div>
              <p style={{ fontSize:22, fontWeight:700, color:"var(--primary-t)", margin:"0 0 12px" }}>29€<span style={{ fontSize:13, fontWeight:400 }}>/mois</span></p>
              {["20 projets","150 générations IA/mois","Tous les outils PMO",featureLabel,"Export PDF/Word/PPTX"].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                  <span style={{ fontSize:12, color:"var(--primary)" }}>✓</span>
                  <span style={{ fontSize:12, color:"var(--primary-t)", fontWeight: f===featureLabel?600:400 }}>{f}</span>
                </div>
              ))}
              <Link href="/pricing"
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:14, padding:"9px 0", background:"var(--primary)", color:"#fff", borderRadius:"var(--r8)", fontSize:13, fontWeight:600, textDecoration:"none" }}>
                Passer au Pro <ArrowRight size={14}/>
              </Link>
            </div>
          </div>

          <Link href="/dashboard" style={{ fontSize:13, color:"var(--text-3)", textDecoration:"none" }}>
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
