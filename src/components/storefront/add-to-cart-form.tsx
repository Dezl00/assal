"use client"
import React, { useState } from "react"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"

interface AddToCartProps {
  product: {
    id: string
    name: string
    price: number
    discountPrice?: number | null
    images: { url: string }[]
    stock: number
  }
}

export function AddToCartForm({ product }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()

  const finalPrice = product.discountPrice ?? product.price
  const isOutOfStock = product.stock <= 0

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      quantity,
      image: product.images[0]?.url
    })
  }

  if (isOutOfStock) {
    return (
      <div className="mt-8 bg-destructive/10 text-destructive font-bold py-4 px-6 rounded-2xl text-center border border-destructive/20">
        عذراً، هذا المنتج غير متوفر في المخزون حالياً
      </div>
    )
  }

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
      {/* Quantity Selector */}
      <div className="flex items-center justify-between w-full sm:w-auto h-14 bg-background border border-border rounded-2xl px-2">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-12 text-center font-bold text-lg">{quantity}</span>
        <button 
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Button */}
      <Button 
        onClick={handleAdd}
        className="h-14 w-full flex-1 rounded-2xl gold-gradient text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-lg font-bold flex items-center justify-center gap-3"
      >
        <ShoppingBag className="w-5 h-5" />
        أضف للسلة
        <span className="text-white/80 font-normal text-sm mr-2 hidden sm:inline">
          ({(finalPrice * quantity).toFixed(2)} ر.س)
        </span>
      </Button>
    </div>
  )
}
