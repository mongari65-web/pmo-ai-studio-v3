import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
export const metadata: Metadata = {
  title: "PMO AI Studio — Le copilote IA des Chefs de Projet",
  description: "15 outils PMO générés par Claude AI en 30 secondes. Gantt, RAID, Budget EVM, OKR, Sprint Review. Aligné PMBOK 7. Préparation PMP® intégrée.",
  keywords: ["PMO","Chef de Projet","PMP","PMBOK","Agile","Scrum","EVM","RAID","Gantt","IA","Claude AI"],
  authors: [{ name: "PMO AI Studio" }],
  creator: "PMO AI Studio",
  openGraph: {
    title: "PMO AI Studio — Le copilote IA des Chefs de Projet",
    description: "15 outils PMO générés par Claude AI en 30 secondes. PMBOK 7 aligné.",
    url: "https://pmo-ai-studio-v3.vercel.app",
    siteName: "PMO AI Studio",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PMO AI Studio",
    description: "Le copilote IA des Chefs de Projet certifiés PMP®",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
        <link rel="shortcut icon" href="/favicon.svg"/>
        <link rel="apple-touch-icon" href="/favicon.svg"/>
      </head>
      <body>
        {children}
        <Toaster richColors position="top-right" />
            <Analytics />
      </body>
    </html>
  )
}
