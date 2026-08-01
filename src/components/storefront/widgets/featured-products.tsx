import React from "react"
import { db } from "@/lib/db"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

export async function FeaturedProducts({ widget }: { widget: any }) {
  // Fetch up to 4 latest products
  const products = await db.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { images: true }
  })

  if (products.length === 0) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{widget.title || "أحدث المنتجات"}</h2>
          {widget.subtitle && <p className="text-muted-foreground mt-2">{widget.subtitle}</p>}
        </div>
        <Link href="/products" className="text-primary hover:underline font-medium text-sm hidden sm:block">
          عرض الكل
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group relative rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
            <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden rounded-xl mb-4 bg-muted">
              {product.images[0] ? (
                <img 
                  src={product.images[0].url} 
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground">صورة غير متوفرة</div>
              )}
            </Link>
            
            <div className="space-y-2">
              <Link href={`/product/${product.id}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="font-bold text-lg text-primary">{product.price.toFixed(2)} ر.س</span>
                <button className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
