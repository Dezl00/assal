import React from "react"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ProductGrid } from "@/components/storefront/product-grid"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import type { Metadata } from "next"

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const [category, theme] = await Promise.all([
    db.category.findUnique({ where: { slug: params.slug } }),
    db.themeConfig.findUnique({ where: { id: "default" } })
  ])
  
  if (!category) return { title: "القسم غير موجود" }
  
  const storeName = theme?.storeName || "عسل";
  const ogImages = category.imageUrl 
    ? [{ url: category.imageUrl, width: 800, height: 600, alt: category.name }]
    : [];

  return {
    title: category.name, // Next.js layout template will automatically append | storeName to the <title> tag
    description: category.description || `تصفح منتجات قسم ${category.name} في ${storeName}`,
    openGraph: {
      title: `${category.name} | ${storeName}`,
      description: category.description || `تصفح منتجات قسم ${category.name} في ${storeName}`,
      url: `/category/${category.slug}`,
      type: 'website',
      siteName: storeName,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} | ${storeName}`,
      description: category.description || `تصفح منتجات قسم ${category.name} في ${storeName}`,
      images: ogImages.map(img => img.url),
    },
  }
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
      parent: true,
      children: {
        orderBy: { createdAt: "asc" }
      },
      products: {
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: true,
        }
      }
    }
  })

  if (!category) {
    notFound()
  }

  const isMainCategory = !category.parentId

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Category Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-secondary/30 border border-border/50 p-10 sm:p-16 text-center">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">{category.name}</h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <Link href="/products" className="hover:text-primary transition-colors">المنتجات</Link>
            
            {category.parent && (
              <>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
                <Link href={`/category/${category.parent.slug}`} className="hover:text-primary transition-colors">
                  {category.parent.name}
                </Link>
              </>
            )}

            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {isMainCategory ? (
        /* Show Subcategories */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {category.children.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12 bg-secondary/20 rounded-2xl border border-border/50">
              لا توجد أقسام فرعية في هذا القسم حالياً.
            </div>
          ) : (
            category.children.map((child) => (
              <Link 
                key={child.id} 
                href={`/category/${child.slug}`}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="relative h-24 w-24 md:h-32 md:w-32 overflow-hidden rounded-full bg-muted/30 p-2 transition-transform group-hover:scale-105">
                  {child.imageUrl ? (
                    <img 
                      src={child.imageUrl} 
                      alt={child.name}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="text-3xl font-bold">{child.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-center group-hover:text-primary transition-colors">{child.name}</h3>
                {child.description && (
                  <p className="text-sm text-muted-foreground text-center line-clamp-2">{child.description}</p>
                )}
              </Link>
            ))
          )}
        </div>
      ) : (
        /* Show Products */
        <>
          {category.products.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 bg-secondary/20 rounded-2xl border border-border/50">
              لا توجد منتجات في هذا القسم الفرعي حالياً.
            </div>
          ) : (
            <ProductGrid products={category.products} />
          )}
        </>
      )}
    </div>
  )
}
