import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
export const metadata: Metadata = {
  title: "PMO AI Studio — Gestion de projet intelligente",
  description: "Plateforme IA pour chefs de projet et organismes PMI/PMP",
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
