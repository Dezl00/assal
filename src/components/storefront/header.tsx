"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu as MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { useUIStore } from "@/store/ui-store"

export function StorefrontHeader({ menuItems, themeConfig }: { menuItems: any[], themeConfig?: any }) {
  const { getTotals, setIsOpen } = useCartStore()
  const { count } = getTotals()
  const [mounted, setMounted] = useState(false)
  const { setAuthModalOpen, setMobileMenuOpen } = useUIStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full glass transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-8">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              {themeConfig?.logoUrl ? (
                <img src={themeConfig.logoUrl} alt="Store Logo" className="h-10 w-auto object-contain" />
              ) : (
                <span className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-white text-lg shadow-lg shadow-primary/20">ع</span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {menuItems.map(item => (
              <Link 
                key={item.id} 
                href={item.url}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-right"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
              <Search className="w-6 h-6" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setAuthModalOpen(true)}>
              <User className="w-6 h-6" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary relative group"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in duration-300">
                  {count}
                </span>
              )}
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setMobileMenuOpen(true)}>
              <MenuIcon className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
