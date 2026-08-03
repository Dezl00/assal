import React from "react"
import { db } from "@/lib/db"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { ProductCard } from "@/components/storefront/product-card"

export async function FeaturedProducts({ widget }: { widget: any }) {
  // Fetch up to 4 latest products
  const products = await db.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { images: true, category: true }
  })

  if (products.length === 0) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {widget.title && widget.title !== "" ? (
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{widget.title}</h2>
            {widget.subtitle && <p className="text-muted-foreground mt-2">{widget.subtitle}</p>}
          </div>
          <Link href="/products" className="text-primary hover:underline font-medium text-sm hidden sm:block">
            عرض الكل
          </Link>
        </div>
      ) : (
        <div className="flex justify-end mb-6">
          <Link href="/products" className="text-primary hover:underline font-medium text-sm hidden sm:block">
            عرض الكل
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>
    </div>
  )
}
