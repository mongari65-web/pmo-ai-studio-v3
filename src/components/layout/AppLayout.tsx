"use client"
import Sidebar from "@/components/layout/Sidebar"

const SOCIALS = [
  { label:"Email",    href:"mailto:contact@pmoai.studio",     svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' },
  { label:"LinkedIn", href:"https://linkedin.com",            svg:'<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7H10v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>' },
  { label:"X",        href:"https://x.com",                   svg:'<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
  { label:"Telegram", href:"https://t.me",                    svg:'<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 13.88l-2.95-.924c-.642-.2-.657-.642.136-.95l11.57-4.461c.537-.194 1.006.131.718.703z"/></svg>' },
  { label:"Facebook", href:"https://facebook.com",            svg:'<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>' },
  { label:"Gmail",    href:"https://mail.google.com/mail/?view=cm&to=contact@pmoai.studio", svg:'<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#EA4335" d="M6 18V9.5L12 14l6-4.5V18H6z"/><path fill="#34A853" d="M18 9.5V18h2V8l-2 1.5z"/><path fill="#4285F4" d="M6 9.5V18H4V8l2 1.5z"/><path fill="#FBBC05" d="M4 8l8 6 8-6H4z"/></svg>' },
]

const S: Record<string,string> = {
  wrap:"display:flex;height:100vh;background:var(--bg);overflow:hidden",
  main:"flex:1;display:flex;flex-direction:column;overflow:hidden",
  banner:"position:relative;width:100%;height:130px;flex-shrink:0;overflow:hidden",
  img:"position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%;filter:brightness(0.58) saturate(1.1)",
  overlay:"position:absolute;inset:0;background:linear-gradient(90deg,rgba(12,68,124,0.90) 0%,rgba(12,68,124,0.42) 45%,rgba(24,95,165,0.68) 100%)",
  inner:"position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 28px",
  logoBox:"width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,0.18);border:1.5px solid rgba(255,255,255,0.38);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0",
  title:"font-size:19px;font-weight:700;color:#fff;letter-spacing:-0.3px;line-height:1.1",
  sub:"font-size:11px;color:rgba(255,255,255,0.78);margin-top:4px",
  dot:"display:inline-flex;align-items:center;gap:5px;margin-top:6px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28);border-radius:20px;padding:2px 10px",
  socialBtn:"width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.85);text-decoration:none;cursor:pointer;transition:all 0.15s",
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", height:"100vh", background:"var(--bg)", overflow:"hidden" }}>
      <Sidebar/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ position:"relative", width:"100%", height:130, flexShrink:0, overflow:"hidden" }}>
          <img src="/banner.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 35%", filter:"brightness(0.58) saturate(1.1)" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,rgba(12,68,124,0.90) 0%,rgba(12,68,124,0.42) 45%,rgba(24,95,165,0.68) 100%)" }}/>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.38)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff", flexShrink:0 }}>P</div>
              <div>
                <div style={{ fontSize:19, fontWeight:700, color:"#fff", letterSpacing:"-0.3px", lineHeight:1.1 }}>PMO AI Studio</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.78)", marginTop:4 }}>Le copilote IA des Chefs de Projet · PMBOK 7</div>
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:6, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.28)", borderRadius:20, padding:"2px 10px" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80" }}/>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.95)", fontWeight:600, letterSpacing:"0.3px" }}>Claude AI · En ligne</span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                  style={{ width:34, height:34, borderRadius:8, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.85)", textDecoration:"none", transition:"all 0.15s" }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background="rgba(255,255,255,0.25)";el.style.transform="translateY(-2px)"}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background="rgba(255,255,255,0.12)";el.style.transform="translateY(0)"}}>
                  <span dangerouslySetInnerHTML={{ __html: s.svg }}/>
                </a>
              ))}
            </div>
          </div>
        </div>
        <main style={{ flex:1, overflowY:"auto", background:"var(--bg)" }}>{children}</main>
      </div>
    </div>
  )
}
