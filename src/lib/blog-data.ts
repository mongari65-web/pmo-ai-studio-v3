export interface Article {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  readTime: number
  date: string
  author: string
  youtubeId?: string
  featured?: boolean
  color: string
  emoji: string
}

export const CATEGORIES = [
  { id:"all",          label:"Tous",           emoji:"📚", color:"#7B5EFF" },
  { id:"pmo",          label:"PMO & PMBOK",    emoji:"📊", color:"#7B5EFF" },
  { id:"agile",        label:"Agile & Scrum",  emoji:"🔄", color:"#22c55e" },
  { id:"devops",       label:"DevOps",         emoji:"⚙️", color:"#3b82f6" },
  { id:"ia",           label:"IA & Outils",    emoji:"🤖", color:"#f97316" },
  { id:"leadership",   label:"Leadership",     emoji:"🎯", color:"#ef4444" },
  { id:"certification",label:"Certification",  emoji:"🎓", color:"#f59e0b" },
]

export const ARTICLES: Article[] = [
  {
    slug: "cpi-inferieur-1-sauver-projet",
    title: "CPI < 1 : Comment sauver votre projet avant qu'il soit trop tard",
    excerpt: "Votre CPI est à 0.83. Le client s'impatiente. Le budget s'envole. Voici le guide complet pour analyser, communiquer et reprendre le contrôle de votre projet en dépassement.",
    category: "pmo", tags: ["EVM","CPI","Budget","PMBOK","Chef de Projet"],
    readTime: 8, date: "2026-05-20", author: "Abdelhafid TOUIL, PMP®",
    featured: true, color: "#ef4444", emoji: "💸"
  },
  {
    slug: "evm-5-minutes-cpi-spi-eac-tcpi",
    title: "EVM en 5 minutes : CPI, SPI, EAC, TCPI expliqués avec un exemple réel à 2.5M€",
    excerpt: "L'Earned Value Management démystifié. Toutes les formules avec l'exemple concret de la Rénovation Hôtel Atlantis Marrakech. Courbes S, indicateurs, prévisions.",
    category: "pmo", tags: ["EVM","CPI","SPI","EAC","TCPI","PMBOK7"],
    readTime: 12, date: "2026-05-18", author: "Abdelhafid TOUIL, PMP®",
    featured: true, color: "#7B5EFF", emoji: "📈"
  },
  {
    slug: "raid-register-guide-complet",
    title: "RAID Register : Le guide complet pour gérer risques, actions, issues et décisions",
    excerpt: "8 risques identifiés, 3 critiques ouverts, 0 résolus. Comment transformer votre RAID en outil de pilotage proactif ? Guide avec template et exemples réels.",
    category: "pmo", tags: ["RAID","Risques","Gestion Projet","PMBOK"],
    readTime: 7, date: "2026-05-16", author: "Abdelhafid TOUIL, PMP®",
    featured: true, color: "#f59e0b", emoji: "⚠️"
  },
  {
    slug: "sprint-planning-guide-8-etapes",
    title: "Sprint Planning en 8 étapes — Guide complet Scrum 2026",
    excerpt: "Le Sprint Planning est la cérémonie la plus critique de Scrum. Découvrez les 8 étapes pour planifier efficacement, calculer la vélocité et définir un Sprint Goal percutant.",
    category: "agile", tags: ["Scrum","Sprint","Agile","SAFe","Vélocité"],
    readTime: 10, date: "2026-05-14", author: "Abdelhafid TOUIL, PMP® SAFe®",
    color: "#22c55e", emoji: "📅"
  },
  {
    slug: "devops-pmo-reconcilier",
    title: "DevOps + PMO : Comment réconcilier deux mondes apparemment opposés",
    excerpt: "Les équipes DevOps rejettent souvent le PMO. Pourtant les deux approches sont complémentaires. Découvrez le framework Hybrid DevOps-PMO avec CI/CD et PMBOK.",
    category: "devops", tags: ["DevOps","PMO","CI/CD","Agile","Hybride"],
    readTime: 9, date: "2026-05-12", author: "Abdelhafid TOUIL, PMP® DevOps Leader",
    color: "#3b82f6", emoji: "⚙️"
  },
  {
    slug: "pmp-2026-guide-preparation",
    title: "PMP® 2026 : Tout ce qui a changé — Guide de préparation complet",
    excerpt: "180 questions, 50% Agile, formats multiples. L'examen PMP® a profondément évolué. Voici le guide complet pour réussir du premier coup avec notre simulateur 225 questions.",
    category: "certification", tags: ["PMP","PMI","PMBOK7","Certification","Examen"],
    readTime: 15, date: "2026-05-10", author: "Abdelhafid TOUIL, PMP®",
    featured: true, color: "#f59e0b", emoji: "🎓"
  },
  {
    slug: "thomas-kilmann-conflits-projet",
    title: "Thomas-Kilmann : 5 styles pour gérer les conflits en équipe projet",
    excerpt: "Compétition, Collaboration, Compromis, Évitement, Accommodation. Quel style adopter selon le contexte ? Guide pratique avec matrice et cas d'usage en gestion de projet.",
    category: "leadership", tags: ["Leadership","Conflits","Thomas-Kilmann","Équipe"],
    readTime: 8, date: "2026-05-08", author: "Abdelhafid TOUIL, PMP®",
    color: "#ef4444", emoji: "🤝"
  },
  {
    slug: "claude-ai-gantt-30-secondes",
    title: "Claude AI + PMO AI Studio : Générer un Gantt complet en 30 secondes",
    excerpt: "Tutoriel pas-à-pas pour utiliser l'IA générative en gestion de projet. De la description textuelle au Gantt avec 20 tâches, dépendances et chemin critique automatique.",
    category: "ia", tags: ["Claude AI","IA","Gantt","PMO AI Studio","Automatisation"],
    readTime: 6, date: "2026-05-06", author: "Abdelhafid TOUIL, PMP®",
    color: "#f97316", emoji: "🤖"
  },
  {
    slug: "safe-6-guide-illustre",
    title: "SAFe 6 pour les nuls — Guide illustré avec schémas et exemples",
    excerpt: "Scaled Agile Framework version 6. Teams, ART, Solution Train, Portfolio. Tout le framework expliqué avec des schémas clairs, PI Planning et métriques.",
    category: "agile", tags: ["SAFe","SAFe6","Agile","PI Planning","ART"],
    readTime: 14, date: "2026-05-04", author: "Abdelhafid TOUIL, PMP® SAFe® 6",
    color: "#22c55e", emoji: "🔄"
  },
  {
    slug: "okr-vs-kpi-quelle-difference",
    title: "OKR vs KPI : Quelle différence et comment les utiliser ensemble ?",
    excerpt: "Les OKR (Objectives & Key Results) et les KPI (Key Performance Indicators) sont complémentaires. Découvrez comment combiner les deux pour piloter votre projet avec précision.",
    category: "pmo", tags: ["OKR","KPI","Performance","Pilotage","PMBOK7"],
    readTime: 7, date: "2026-05-02", author: "Abdelhafid TOUIL, PMP®",
    color: "#7B5EFF", emoji: "🎯"
  },
]
