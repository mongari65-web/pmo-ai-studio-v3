import Link from "next/link"
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="font-bold text-foreground">PMO AI Studio</span>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Connexion</Link>
          <Link href="/auth/register" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">Commencer gratuitement</Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
            ✨ Propulsé par Claude AI
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
            Gérez vos projets avec<br/>
            <span className="text-gradient">l'intelligence artificielle</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            WBS, Gantt, RAID, Budget EVM, Mind Map et tous vos outils PMBOK générés automatiquement. Conçu pour les chefs de projet et organismes PMI.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register" className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-105">
              Démarrer gratuitement →
            </Link>
            <Link href="#features" className="px-6 py-3 border border-border text-foreground rounded-xl hover:bg-accent transition-colors">
              Voir les fonctionnalités
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
