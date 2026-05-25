import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://pmoai.studio'
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/demo`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/auth/inscription`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/auth/connexion`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/legal/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/legal/cgu`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
