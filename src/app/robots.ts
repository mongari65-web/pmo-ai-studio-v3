import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/demo', '/blog', '/pricing'],
        disallow: ['/admin', '/api', '/dashboard', '/projects'],
      },
    ],
    sitemap: 'https://pmoai.studio/sitemap.xml',
    host: 'https://pmoai.studio',
  }
}
