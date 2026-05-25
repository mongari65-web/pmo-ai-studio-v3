'use client'
export default function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700,
        background: 'linear-gradient(135deg,#1e40af,#7B5EFF)', color: '#fff',
        border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(123,94,255,0.3)',
      }}>
      🔄 Vérifier si c&apos;est résolu
    </button>
  )
}
