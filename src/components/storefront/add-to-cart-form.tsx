"use client"
import React, { useState } from "react"
import { Minus, Plus, ShoppingBag, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { toast } from "sonner"

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
  const { addItem, setIsOpen } = useCartStore()

  const finalPrice = product.discountPrice ?? product.price
  const isOutOfStock = product.stock <= 0

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      quantity,
      image: product.images[0]?.url
    }, false)

    toast.custom((t) => (
      <div className="w-[350px] p-4 bg-background border border-border rounded-xl shadow-xl flex flex-col gap-3 relative overflow-hidden">
        {/* Progress bar animation */}
        <div className="absolute bottom-0 left-0 h-1 bg-primary animate-[shrink_3s_linear_forwards]" style={{ width: '100%' }}></div>
        
        <div className="flex gap-3">
          {product.images[0]?.url && (
            <img src={product.images[0].url} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-green-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold text-sm">تمت الإضافة للسلة</span>
            </div>
            <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-9"
            onClick={() => toast.dismiss(t)}
          >
            متابعة التسوق
          </Button>
          <Button 
            size="sm" 
            className="flex-1 text-xs h-9 bg-primary text-white"
            onClick={() => {
              toast.dismiss(t)
              setIsOpen(true)
            }}
          >
            عرض السلة
          </Button>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}} />
      </div>
    ), { duration: 3000, position: 'top-center' })
  }

  if (isOutOfStock) {
    return (
      <div className="mt-8 bg-destructive/10 text-destructive font-bold py-4 px-6 rounded-2xl text-center border border-destructive/20">
        عذراً، هذا المنتج غير متوفر في المخزون حالياً
      </div>
    )
  }

  return (
    <div className="mt-8 flex items-center gap-3 w-full">
      {/* Quantity Selector */}
      <div className="flex items-center justify-between h-14 bg-background border border-border/50 rounded-2xl px-1 min-w-[120px] shrink-0">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-center font-bold text-lg">{quantity}</span>
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
        className="h-14 flex-1 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-lg font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>أضف للسلة</span>
        <span className="opacity-80 font-normal text-sm mr-1 hidden sm:inline">
          ({(finalPrice * quantity).toFixed(2)} ج.م)
        </span>
      </Button>
    </div>
  )
}
