import React from "react"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ProductGrid } from "@/components/storefront/product-grid"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await db.category.findUnique({ where: { slug: params.slug } })
  if (!category) return { title: "Category Not Found" }
  return {
    title: `${category.name} | متجر عسل`,
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rtl-flip" />
        <Link href="/products" className="hover:text-primary transition-colors">المنتجات</Link>
        <ChevronRight className="w-4 h-4 rtl-flip" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-secondary/30 border border-border/50 p-10 sm:p-16 text-center">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">{category.name}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            تصفح أحدث وأفضل المنتجات في قسم {category.name}
          </p>
        </div>
      </div>

      {/* Products */}
      <ProductGrid products={category.products} />
    </div>
  )
}
