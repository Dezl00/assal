import React from "react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/storefront/product-grid"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "جميع المنتجات | متجر عسل",
  description: "تصفح جميع منتجات متجر عسل",
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
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rtl-flip" />
        <span className="text-foreground font-medium">جميع المنتجات</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">جميع المنتجات</h1>
        <p className="text-lg text-muted-foreground">تصفح تشكيلتنا الكاملة من المنتجات الفاخرة</p>
      </div>

      <ProductGrid products={products} />
    </div>
  )
}
