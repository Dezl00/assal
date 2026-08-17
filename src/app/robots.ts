import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/checkout', '/api/', '/search'],
      crawlDelay: 2, // Limit crawler rate to avoid DB overload
    },
    sitemap: 'https://assal1.vercel.app/sitemap.xml',
  }
}
