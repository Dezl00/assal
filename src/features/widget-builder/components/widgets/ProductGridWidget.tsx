"use client"

import React, { useEffect, useState } from "react"
import { getProducts } from "@/features/catalog/actions"

interface ProductGridWidgetProps {
  widget: any
}

export function ProductGridWidget({ widget }: ProductGridWidgetProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Determine data source from widget config
    // For this example, if dataSource specifies a category, we fetch it.
    const categoryId = widget.dataSource?.categoryId
    const limit = widget.display?.numberOfProducts || 8

    getProducts({ categoryId, limit }).then((res) => {
      if (res.success && res.products) {
        setProducts(res.products)
      }
      setLoading(false)
    })
  }, [widget.dataSource, widget.display])

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: widget.display?.numberOfProducts || 4 }).map((_, i) => (
        <div key={i} className="aspect-square bg-muted rounded-md" />
      ))}
    </div>
  }

  if (!products.length) {
    return <div className="text-center text-muted-foreground p-8">No products found for this section.</div>
  }

  // Use config to determine grid columns
  const cols = widget.display?.columns || 4
  const colClass = cols === 2 ? "grid-cols-2" : cols === 3 ? "md:grid-cols-3" : cols === 5 ? "md:grid-cols-5" : "md:grid-cols-4"

  return (
    <div className={`grid grid-cols-2 gap-4 sm:gap-6 ${colClass}`}>
      {products.map((product) => (
        <div key={product.id} className="group relative rounded-md border border-border p-4 transition-colors hover:border-primary">
          <div className="relative aspect-square overflow-hidden bg-muted mb-4 rounded-sm">
            {product.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={product.images[0].url} 
                alt={product.name} 
                className="object-cover w-full h-full"
                loading="lazy" 
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
            )}
            
            {/* Hover Actions (Wishlist, Quick View) */}
            <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center space-x-2 space-x-reverse bg-background/80 p-2 backdrop-blur transition-transform group-hover:translate-y-0">
              {widget.display?.showQuickView && (
                <button className="text-sm font-medium hover:text-primary">Quick View</button>
              )}
            </div>
          </div>
          
          <div>
            {widget.display?.showCategory && product.category && (
              <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>
            )}
            <h3 className="font-medium line-clamp-2">{product.name}</h3>
            
            {widget.display?.showPrice !== false && (
              <div className="mt-2 flex items-center gap-2">
                {product.discountPrice ? (
                  <>
                    <span className="font-bold text-red-600">{product.discountPrice.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground line-through">{product.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="font-bold">{product.price.toFixed(2)}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
