"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useUIStore } from "@/store/ui-store"
import { X, ChevronLeft } from "lucide-react"
import { usePathname } from "next/navigation"

export function MobileSidebar({ menuItems, themeConfig }: { menuItems: any[], themeConfig?: any }) {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const pathname = usePathname()

  // Close sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname, setMobileMenuOpen])

  if (!isMobileMenuOpen) return null

  return (
    <div className="fixed inset-0 z-[100] md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Panel */}
      <div className="w-[85vw] max-w-sm bg-card h-full shadow-2xl relative z-10 animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            {themeConfig?.logoUrl ? (
              <img src={themeConfig.logoUrl} alt="Store Logo" className="h-8 w-auto object-contain" />
            ) : (
              <span className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">ع</span>
            )}
            <span className="font-bold text-foreground">{themeConfig?.storeName || "عسل"}</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col">
            {menuItems.map(item => (
              <Link 
                key={item.id} 
                href={item.url}
                className="flex items-center justify-between px-6 py-4 text-foreground hover:bg-muted transition-colors border-b border-border/20 last:border-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="font-medium text-lg">{item.label}</span>
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Footer actions */}
        <div className="p-6 border-t border-border/50 bg-muted/30">
          <p className="text-sm text-center text-muted-foreground">© {new Date().getFullYear()} {themeConfig?.storeName || "عسل"}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  )
}
