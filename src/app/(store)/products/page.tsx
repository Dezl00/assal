import React from "react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/storefront/product-grid"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const theme = await db.themeConfig.findUnique({ where: { id: "default" } });
  const storeName = theme?.storeName || "عسل";
  const logo = theme?.logoUrl || "/favicon.ico";
  
  return {
    title: "جميع المنتجات",
    description: `تصفح جميع منتجات ${storeName}`,
    openGraph: {
      title: `جميع المنتجات | ${storeName}`,
      description: `تصفح جميع منتجات ${storeName}`,
      url: `/products`,
      type: 'website',
      images: [{ url: logo, width: 800, height: 600, alt: storeName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `جميع المنتجات | ${storeName}`,
      description: `تصفح جميع منتجات ${storeName}`,
      images: [logo],
    },
  }
}

export default async function AllProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
    }
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16 text-center shadow-lg shadow-primary/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">جميع المنتجات</h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-6">تصفح تشكيلتنا الكاملة من المنتجات الفاخرة</p>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">جميع المنتجات</span>
          </nav>
        </div>
      </div>

      <ProductGrid products={products} />
    </div>
  )
}
