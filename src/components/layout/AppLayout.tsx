"use client"
import Sidebar from "@/components/layout/Sidebar"
import Link from "next/link"

const SOCIAL_LINKS = [
  {
    label: "Email",
    href: "mailto:contact@pmoai.studio",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    )
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/pmoai-studio",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    )
  },
  {
    label: "X / Twitter",
    href: "https://x.com/pmoai_studio",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  {
    label: "Telegram",
    href: "https://t.me/pmoai_studio",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 13.88l-2.95-.924c-.642-.2-.657-.642.136-.95l11.57-4.461c.537-.194 1.006.131.718.703z"/>
      </svg>
    )
  },
  {
    label: "Facebook",
    href: "https://facebook.com/pmoai.studio",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    )
  },
  {
    label: "Gmail",
    href: "https://mail.google.com/mail/?view=cm&to=contact@pmoai.studio",
    icon: (
      <svg viewBox="0 0 24 24" width={16} height={16}>
        <path fill="#EA4335" d="M6 18V9.5L12 14l6-4.5V18H6z"/>
        <path fill="#34A853" d="M18 9.5V18h2V8l-2 1.5z"/>
        <path fill="#4285F4" d="M6 9.5V18H4V8l2 1.5z"/>
        <path fill="#FBBC05" d="M4 8l8 6 8-6H4z"/>
        <path fill="#C5221F" d="M4 8v.5L6 9.5 4 8z"/>
      </svg>
    )
  },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar/>
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── BANNIÈRE HEADER ── */}
        <div className="relative w-full flex-shrink-0" style={{ height: 200, overflow: "hidden" }}>
          {/* Photo pleine largeur sans zoom */}
          <img
            src="/banner.jpg"
            alt="PMO AI Studio"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              objectPosition: "35% center",
              filter: "brightness(0.65)"
            }}
          />

          {/* Overlay gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(10,15,26,0.80) 0%, rgba(10,15,26,0.25) 45%, rgba(10,15,26,0.60) 100%)"
          }}/>

          {/* Contenu header */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px"
          }}>
            {/* Titre + Slogan */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800, color: "#fff",
                boxShadow: "0 4px 15px rgba(37,99,235,0.5)", flexShrink: 0
              }}>P</div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.1, letterSpacing: "-0.3px" }}>
                  PMO AI Studio
                </p>
                <p style={{ fontSize: 11, color: "rgba(148,163,184,0.9)", marginTop: 2, letterSpacing: "0.3px" }}>
                  Le copilote IA des Chefs de Projet · PMBOK 7
                </p>
              </div>
              <div style={{
                marginLeft: 8, padding: "3px 10px",
                background: "rgba(37,99,235,0.3)",
                border: "1px solid rgba(37,99,235,0.5)",
                borderRadius: 20, fontSize: 10, color: "#60a5fa", fontWeight: 600,
                letterSpacing: "0.5px"
              }}>
                ● Claude AI · En ligne
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {SOCIAL_LINKS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(203,213,225,0.9)",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    backdropFilter: "blur(4px)"
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.background = "rgba(255,255,255,0.18)"
                    el.style.borderColor = "rgba(255,255,255,0.35)"
                    el.style.transform = "translateY(-1px)"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = "rgba(255,255,255,0.08)"
                    el.style.borderColor = "rgba(255,255,255,0.15)"
                    el.style.transform = "translateY(0)"
                  }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENU PRINCIPAL ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
