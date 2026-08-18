"use client"
import React, { useEffect, useState } from "react"
import { useCartStore } from "@/store/cart-store"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CartDrawer() {
  const { isOpen, setIsOpen, items, updateQuantity, removeItem, getTotals } = useCartStore()
  const { total, count } = getTotals()
  
  // Hydration fix for zustand persist
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  if (!isMounted) return null

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-[101] w-full max-w-md bg-background shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">سلة المشتريات</h2>
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">{count}</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>السلة فارغة حالياً</p>
              <Button onClick={() => setIsOpen(false)} variant="outline">
                تصفح المنتجات
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-border/50 pb-6 last:border-0 last:pb-0">
                  <div className="w-20 h-20 rounded-lg bg-muted shrink-0 overflow-hidden border border-border/50">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-primary">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-muted/20">
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium text-muted-foreground">الإجمالي:</span>
              <span className="text-xl font-bold text-foreground">{total.toFixed(2)} ج.م</span>
            </div>
            <Link prefetch={false} href="/checkout" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                إتمام الطلب
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
