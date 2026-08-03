import React from "react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/storefront/product-grid"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const brand = await db.brand.findUnique({ where: { slug: params.slug } })
  const theme = await db.themeConfig.findUnique({ where: { id: "default" } })
  
  if (!brand) return { title: "الماركة غير موجودة" }
  
  const storeName = theme?.storeName || "عسل"
  const title = `منتجات ${brand.name}`
  const logo = brand.logoUrl || theme?.logoUrl || "/favicon.ico"

  return {
    title: title,
    description: `تصفح ${title} في ${storeName}`,
    openGraph: {
      title: `${title} | ${storeName}`,
      description: `تصفح ${title} في ${storeName}`,
      url: `/brand/${brand.slug}`,
      type: 'website',
      images: [{ url: logo, width: 800, height: 600, alt: brand.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${storeName}`,
      description: `تصفح ${title} في ${storeName}`,
      images: [logo],
    },
  }
}

export default async function BrandPage(props: Props) {
  const params = await props.params;
  const brand = await db.brand.findUnique({ where: { slug: params.slug } })
  
  if (!brand) notFound()

  const products = await db.product.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
    include: { images: true, category: true }
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-10">
        {brand.logoUrl && (
          <div className="w-20 h-20 rounded-full border border-border/50 bg-card overflow-hidden shrink-0 flex items-center justify-center p-2">
            <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain" />
          </div>
        )}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{brand.name}</h1>
          <p className="text-muted-foreground mt-2">{products.length} منتجات</p>
        </div>
      </div>
      
      <ProductGrid products={products} />
    </div>
  )
}
