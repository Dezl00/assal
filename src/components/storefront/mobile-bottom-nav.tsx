"use client"

import React from "react"
import Link from "next/link"
import { useUIStore } from "@/store/ui-store"
import { Home, Store, User, Menu, X, ShoppingBag } from "lucide-react"

export function MobileBottomNav() {
  const { setAuthModalOpen, setMobileMenuOpen } = useUIStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border/50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-4">
        <Link href="/" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">الرئيسية</span>
        </Link>
        
        <Link href="/products" className="relative -top-5 flex flex-col items-center justify-center group">
          <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform border-4 border-card">
            <Store className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-medium text-foreground mt-1">المتجر</span>
        </Link>

        <button 
          onClick={() => setAuthModalOpen(true)}
          className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">حسابي</span>
        </button>
      </div>
    </div>
  )
}
