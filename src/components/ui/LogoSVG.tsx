export function LogoIcon({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <rect width="32" height="32" rx="7" fill="#0F172A"/>
      <circle cx="16" cy="13" r="6" fill="#7B5EFF"/>
      <text x="16" y="15.5" textAnchor="middle" fontFamily="Arial" fontSize="5" fontWeight="900" fill="#fff">PMO</text>
      <circle cx="7" cy="6" r="3" fill="#1e40af"/>
      <circle cx="25" cy="6" r="3" fill="#166534"/>
      <circle cx="6" cy="20" r="3" fill="#92400e"/>
      <circle cx="26" cy="20" r="3" fill="#991b1b"/>
      <circle cx="16" cy="26" r="3" fill="#5b21b6"/>
      <line x1="11" y1="9" x2="9" y2="8" stroke="#3b82f6" strokeWidth="1"/>
      <line x1="21" y1="9" x2="23" y2="8" stroke="#22c55e" strokeWidth="1"/>
      <line x1="11" y1="17" x2="8" y2="19" stroke="#f59e0b" strokeWidth="1"/>
      <line x1="21" y1="17" x2="24" y2="19" stroke="#ef4444" strokeWidth="1"/>
      <line x1="16" y1="19" x2="16" y2="23" stroke="#8b5cf6" strokeWidth="1"/>
      <circle cx="16" cy="13" r="8" fill="none" stroke="#7B5EFF" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  )
}

export function LogoHorizontal({ dark = true }: { dark?: boolean }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <LogoIcon size={44}/>
      <div>
        <div style={{ fontSize:20, fontWeight:900, color:dark?"#f1f5f9":"#0F172A", lineHeight:1.2 }}>PMO AI Studio</div>
        <div style={{ fontSize:11, fontWeight:500, color:dark?"#64748b":"#64748b", lineHeight:1 }}>Le copilote IA des Chefs de Projet</div>
      </div>
    </div>
  )
}
