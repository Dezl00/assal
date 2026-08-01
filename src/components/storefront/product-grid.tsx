import React from "react"
import { ProductCard } from "./product-card"

export function ProductGrid({ products, title, subtitle }: { products: any[], title?: string, subtitle?: string }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl opacity-50">🛒</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
        <p className="text-muted-foreground">لم نتمكن من العثور على أي منتجات في هذا القسم حالياً.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-10 text-center md:text-right">
          {title && <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>}
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
