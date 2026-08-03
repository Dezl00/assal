"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useUIStore } from "@/store/ui-store"
import { X, ChevronLeft } from "lucide-react"
import { usePathname } from "next/navigation"

export function MobileSidebar({ menuItems, themeConfig, categories = [] }: { menuItems?: any[], themeConfig?: any, categories?: any[] }) {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const pathname = usePathname()
  const [openCategory, setOpenCategory] = React.useState<string | null>(null)

  // Close sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname, setMobileMenuOpen])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  return (
    <div className={`fixed inset-0 z-[100] md:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Panel - sliding from Left */}
      <div className={`absolute top-0 bottom-0 left-0 w-[85vw] max-w-sm bg-card shadow-2xl z-10 flex flex-col transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <span className="font-bold text-foreground">{themeConfig?.storeName || "عسل"}</span>
            {themeConfig?.logoUrl ? (
              <img src={themeConfig.logoUrl} alt="Store Logo" className="h-8 w-auto object-contain" />
            ) : (
              <span className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">ع</span>
            )}
          </Link>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col">
            <Link 
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 font-bold text-foreground hover:bg-secondary/50 transition-colors"
            >
              الرئيسية
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
            
            <Link 
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 font-bold text-foreground hover:bg-secondary/50 transition-colors"
            >
              المتجر
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>

            {/* Categories Accordion */}
            <div className="flex flex-col border-y border-border/30 my-2">
              <div className="p-4 font-bold text-muted-foreground text-xs uppercase tracking-wider bg-secondary/20">الأقسام</div>
              {categories.map((cat: any) => (
                <div key={cat.id} className="flex flex-col border-b border-border/10 last:border-0">
                  <div 
                    className="flex items-center justify-between p-4 font-bold text-foreground hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                  >
                    <span>{cat.name}</span>
                    <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${openCategory === cat.id ? '-rotate-90' : ''}`} />
                  </div>
                  {openCategory === cat.id && cat.subCategories && (
                    <div className="bg-secondary/10 flex flex-col pl-4 animate-in slide-in-from-top-2">
                      <Link 
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 text-sm font-semibold text-primary"
                      >
                        عرض كل منتجات {cat.name}
                      </Link>
                      {cat.subCategories.map((sub: any) => (
                        <Link 
                          key={sub.id}
                          href={`/products?category=${sub.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="p-3 text-sm text-foreground hover:text-primary transition-colors border-t border-border/10"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Link 
              href="/brands"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 font-bold text-foreground hover:bg-secondary/50 transition-colors"
            >
              الماركات
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link 
              href="/products?discounted=true"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 font-bold text-red-500 hover:bg-red-500/10 transition-colors"
            >
              عروض وخصومات
              <ChevronLeft className="w-4 h-4 text-red-500/50" />
            </Link>
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
