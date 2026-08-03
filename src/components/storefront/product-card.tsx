"use client"
import React from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cart-store"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    discountPrice?: number | null
    stock: number
    images: { url: string }[]
    category?: { name: string }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  
  const finalPrice = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price
  const isOutOfStock = product.stock <= 0

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isOutOfStock) return

    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      quantity: 1,
      image: product.images[0]?.url
    })
  }

  return (
    <div className="group relative rounded-2xl bg-card p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col h-full">
      
      {/* Badges */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        {hasDiscount && (
          <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            خصم {((1 - finalPrice / product.price) * 100).toFixed(0)}%
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            نفدت الكمية
          </span>
        )}
      </div>

      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden rounded-xl mb-4 bg-transparent shrink-0">
        {product.images[0] ? (
          <img 
            src={product.images[0].url} 
            alt={product.name}
            className="object-contain w-full h-full p-2 transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground/50">
            <ShoppingBag className="w-8 h-8 opacity-20" />
          </div>
        )}
        
        {/* Quick Add Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button 
              onClick={handleQuickAdd}
              className="bg-white text-black font-bold px-6 py-3 rounded-full translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white"
            >
              أضف سريعاً
            </button>
          </div>
        )}
      </Link>
      
      <div className="flex flex-col flex-1 justify-between text-center">
        <div className="space-y-1 mb-4">
          {product.category && (
            <p className="text-xs text-muted-foreground">{product.category.name}</p>
          )}
          <Link href={`/product/${product.id}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base leading-snug">
            {product.name}
          </Link>
        </div>
        
        <div className="flex items-center justify-center mt-auto">
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg text-primary">{finalPrice.toFixed(2)} ج.م</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {product.price.toFixed(2)} ج.م
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
