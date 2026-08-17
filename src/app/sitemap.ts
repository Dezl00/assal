import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://assal1.vercel.app'

  try {
    const categories = await db.category.findMany({ select: { slug: true, updatedAt: true } })
    const products = await db.product.findMany({ 
      where: { isActive: true }, 
      select: { slug: true, updatedAt: true },
      take: 1000 // Limit to avoid hitting Neon row limits on huge catalogs
    })
    
    const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    const productUrls: MetadataRoute.Sitemap = products.map((prod) => ({
      url: `${baseUrl}/product/${prod.slug}`,
      lastModified: prod.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...categoryUrls,
      ...productUrls,
    ]
  } catch (error) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      }
    ]
  }
}
