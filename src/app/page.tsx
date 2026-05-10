import Link from "next/link"
import { Check, Zap, Crown, Building2, ArrowRight, Star, Shield, Clock, Users, BarChart3, Brain, GitMerge } from "lucide-react"

const FEATURES = [
  { icon: BarChart3, title: "WBS & Gantt interactif", desc: "Structure de découpage, planning avec drag & drop, chemin critique automatique.", color: "#2563eb" },
  { icon: Shield, title: "RAID Register", desc: "Gestion des risques, actions, issues et décisions avec alertes automatiques.", color: "#ef4444" },
  { icon: Zap, title: "Budget EVM complet", desc: "6 onglets : PV/EV/AC éditables, courbes S dynamiques, CPI/SPI/EAC en temps réel.", color: "#f59e0b" },
  { icon: Brain, title: "Mind Map & PERT", desc: "Carte mentale SVG avec zoom/pan. PERT avec Fast Tracking et Crashing PMI.", color: "#7c3aed" },
  { icon: Users, title: "Work Packages", desc: "Cards visuelles par phase, progress bar, filtres, export multi-format.", color: "#059669" },
  { icon: Crown, title: "IA générative", desc: "Tous vos outils générés automatiquement par Claude AI en quelques secondes.", color: "#d97706" },
]

const TESTIMONIALS = [
  { name: "Marie L.", role: "Chef de projet Senior — BNP Paribas", text: "PMO AI Studio a transformé ma façon de gérer les projets. Le Budget EVM avec les courbes S est exactement ce dont j'avais besoin.", rating: 5 },
  { name: "Karim B.", role: "PMP® — Consultant indépendant", text: "Le PERT avec Fast Tracking et Crashing PMI est bluffant. J'économise 3h par projet sur la planification.", rating: 5 },
  { name: "Sophie M.", role: "Directrice PMO — Orange", text: "L'IA génère un WBS complet en 30 secondes. Mes équipes adorent les exports Excel et PowerPoint automatiques.", rating: 5 },
]

const PLANS = [
  { name: "Gratuit", price: 0, color: "#64748b", icon: Zap, features: ["3 projets", "WBS, RAID, Gantt", "Export Excel/CSV", "10 générations IA/mois"], cta: "Commencer gratuitement", href: "/auth/register" },
  { name: "Pro", price: 29, color: "#2563eb", icon: Crown, popular: true, features: ["20 projets", "Tous les outils PMO", "IA illimitée", "Export PDF/Word/PPTX", "Budget EVM 6 onglets", "Gantt drag & drop", "PERT + compression PMI", "Support prioritaire"], cta: "Essai gratuit 14 jours", href: "/auth/register?plan=pro" },
  { name: "Équipe", price: 79, color: "#7c3aed", icon: Building2, features: ["Projets illimités", "Collaboration temps réel", "Dashboard portfolio", "API REST", "SSO/SAML", "SLA 99.9%", "Support dédié"], cta: "Contacter l'équipe", href: "mailto:contact@pmoai.studio" },
]

export default function LandingPage() {
  return (
    <div style={{ background: "#0a0f1a", color: "#e2e8f0", fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 64px", borderBottom: "1px solid #1e293b", position: "sticky", top: 0, background: "rgba(10,15,26,0.95)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>P</div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>PMO AI Studio</span>
            <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px", background: "rgba(37,99,235,0.2)", color: "#60a5fa", borderRadius: 20, border: "1px solid rgba(37,99,235,0.3)" }}>v3</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="#features" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>Fonctionnalités</Link>
          <Link href="#pricing" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>Tarifs</Link>
          <Link href="/auth/login" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>Connexion</Link>
          <Link href="/auth/register" style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "8px 20px", borderRadius: 8 }}>
            Commencer gratuitement →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ textAlign: "center", padding: "100px 64px 80px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 30, marginBottom: 32, fontSize: 13, color: "#60a5fa" }}>
          ✨ Propulsé par Claude AI · Conforme PMBOK 7
        </div>
        <h1 style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, background: "linear-gradient(135deg,#f1f5f9 0%,#60a5fa 50%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Gérez vos projets avec<br/>l'intelligence artificielle
        </h1>
        <p style={{ fontSize: 20, color: "#94a3b8", lineHeight: 1.6, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
          WBS, Gantt, RAID, Budget EVM, PERT et tous vos outils PMBOK générés automatiquement. Conçu pour les chefs de projet certifiés PMP®.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 64 }}>
          <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none", padding: "14px 32px", borderRadius: 12 }}>
            Démarrer gratuitement <ArrowRight size={18}/>
          </Link>
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #334155", color: "#e2e8f0", fontSize: 16, textDecoration: "none", padding: "14px 32px", borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
            Voir la démo →
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 48, padding: "32px 0", borderTop: "1px solid #1e293b" }}>
          {[
            { value: "10+", label: "Outils PMO intégrés" },
            { value: "30s", label: "Pour générer un WBS complet" },
            { value: "10", label: "Formats d'export" },
            { value: "100%", label: "Conforme PMBOK 7" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, background: "linear-gradient(135deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{ fontSize: 12, color: "#60a5fa", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Fonctionnalités</p>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: "#f1f5f9", marginBottom: 16 }}>Tous vos outils PMO en un seul endroit</h2>
          <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>De la charte projet au rapport final, PMO AI Studio couvre tout le cycle de vie de vos projets.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24, borderTop: `3px solid ${f.color}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color + "22", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon size={22} color={f.color}/>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 64px", background: "linear-gradient(180deg,#0f172a 0%,#0a0f1a 100%)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#60a5fa", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Comment ça marche</p>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: "#f1f5f9", marginBottom: 60 }}>Opérationnel en 3 étapes</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }}>
            {[
              { step: "01", title: "Créez votre projet", desc: "Renseignez le nom, la description, le budget et les dates. Le Guide CP vous accompagne.", icon: "📋" },
              { step: "02", title: "Générez vos outils", desc: "Claude AI génère automatiquement WBS, Gantt, RAID, Budget EVM et tous vos livrables PMO.", icon: "⚡" },
              { step: "03", title: "Pilotez et exportez", desc: "Éditez en temps réel, suivez les KPIs, exportez en PDF/Excel/Word/PowerPoint.", icon: "🚀" },
            ].map(s => (
              <div key={s.step} style={{ position: "relative" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>ÉTAPE {s.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "80px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <p style={{ fontSize: 12, color: "#60a5fa", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Témoignages</p>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: "#f1f5f9" }}>Ils nous font confiance</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {Array.from({length: t.rating}).map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b"/>)}
              </div>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{t.name}</p>
                <p style={{ fontSize: 12, color: "#475569" }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "80px 64px", background: "#0f172a" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <p style={{ fontSize: 12, color: "#60a5fa", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Tarifs</p>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#f1f5f9", marginBottom: 12 }}>Simple et transparent</h2>
            <p style={{ fontSize: 16, color: "#64748b" }}>Commencez gratuitement. Évoluez selon vos besoins.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {PLANS.map(plan => {
              const Icon = plan.icon
              return (
                <div key={plan.name} style={{ background: "#0a0f1a", border: `${(plan as any).popular ? "2px" : "1px"} solid ${(plan as any).popular ? plan.color : "#1e293b"}`, borderRadius: 20, padding: 28, position: "relative", boxShadow: (plan as any).popular ? `0 0 40px ${plan.color}22` : "none" }}>
                  {(plan as any).popular && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${plan.color},#7c3aed)`, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 20 }}>
                      LE PLUS POPULAIRE
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: plan.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={plan.color}/>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{plan.name}</span>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: "#f1f5f9" }}>{plan.price}€</span>
                    {plan.price > 0 && <span style={{ color: "#64748b", fontSize: 14 }}>/mois</span>}
                    {plan.price === 0 && <span style={{ color: "#64748b", fontSize: 14 }}> pour toujours</span>}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                        <Check size={14} color={plan.color} style={{ flexShrink: 0, marginTop: 2 }}/>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none", background: (plan as any).popular ? `linear-gradient(135deg,${plan.color},#7c3aed)` : "transparent", color: (plan as any).popular ? "#fff" : "#e2e8f0", border: (plan as any).popular ? "none" : `1px solid #334155` }}>
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: "100px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>
            Prêt à transformer votre gestion de projet ?
          </h2>
          <p style={{ fontSize: 18, color: "#64748b", marginBottom: 40 }}>
            Rejoignez les chefs de projet qui utilisent PMO AI Studio pour livrer leurs projets dans les délais et le budget.
          </p>
          <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontSize: 18, fontWeight: 700, textDecoration: "none", padding: "18px 48px", borderRadius: 14 }}>
            Commencer gratuitement <ArrowRight size={20}/>
          </Link>
          <p style={{ fontSize: 13, color: "#475569", marginTop: 16 }}>Aucune carte bancaire requise · Annulation à tout moment</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "40px 64px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>P</div>
          <span style={{ fontSize: 13, color: "#475569" }}>PMO AI Studio © 2025 · Tous droits réservés</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { label: "Connexion", href: "/auth/login" },
            { label: "Inscription", href: "/auth/register" },
            { label: "Tarifs", href: "#pricing" },
          ].map(l => (
            <Link key={l.label} href={l.href} style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}>{l.label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
