import React from "react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/storefront/product-grid"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { FilterSidebar } from "@/components/storefront/filter-sidebar"
import { StoreToolbar } from "@/components/storefront/store-toolbar"
import { StorePagination } from "@/components/storefront/pagination"

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
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
  const searchParams = await props.searchParams;
  
  const brand = await db.brand.findUnique({ where: { slug: params.slug } })
  if (!brand) notFound()

  const categorySlug = searchParams?.category as string
  const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice as string) : undefined
  const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice as string) : undefined
  const sort = (searchParams?.sort as string) || "newest"
  const page = searchParams?.page ? parseInt(searchParams.page as string) : 1
  const limit = 20

  let whereClause: any = { brandId: brand.id }

  if (categorySlug) {
    const category = await db.category.findUnique({ where: { slug: categorySlug } })
    if (category) {
      whereClause.categoryId = category.id
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {}
    if (minPrice !== undefined) whereClause.price.gte = minPrice
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice
  }

  let orderByClause: any = { createdAt: "desc" }
  if (sort === "price_asc") orderByClause = { price: "asc" }
  else if (sort === "price_desc") orderByClause = { price: "desc" }

  const [totalProducts, products, categories] = await Promise.all([
    db.product.count({ where: whereClause }),
    db.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
      }
    }),
    db.category.findMany({ select: { id: true, name: true, slug: true } }),
  ])

  const totalPages = Math.ceil(totalProducts / limit)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-10 bg-card p-6 rounded-3xl shadow-sm border border-border/50">
        {brand.logoUrl && (
          <div className="w-24 h-24 rounded-full border border-border/50 bg-white overflow-hidden shrink-0 flex items-center justify-center p-3 shadow-inner">
            <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain" />
          </div>
        )}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{brand.name}</h1>
          <p className="text-muted-foreground mt-2">{totalProducts} منتجات</p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar categories={categories} brands={[]} />
        
        <div className="flex-1 min-w-0">
          <StoreToolbar totalProducts={totalProducts} />
          
          {products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              <StorePagination totalPages={totalPages} currentPage={page} />
            </>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-2">لا توجد منتجات</h2>
              <p className="text-muted-foreground">لم يتم العثور على منتجات تطابق معايير البحث.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
