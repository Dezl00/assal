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
  const [activeTab, setActiveTab] = React.useState<"menu" | "categories">("menu")

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
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            {themeConfig?.logoUrl ? (
              <img src={themeConfig.logoUrl} alt="Store Logo" className="h-8 w-auto object-contain" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">ع</span>
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

        {/* Tabs */}
        <div className="flex items-center border-b border-border/50 bg-muted/10 shrink-0">
          <button 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'menu' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('menu')}
          >
            القائمة
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('categories')}
          >
            الأقسام
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          
          {activeTab === 'menu' && (
            <nav className="flex flex-col py-2 animate-in fade-in duration-300">
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
                المنتجات
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </Link>

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
          )}

          {activeTab === 'categories' && (
            <div className="flex flex-col py-2 animate-in fade-in duration-300">
              {categories.map((cat: any) => (
                <div key={cat.id} className="flex flex-col border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between p-2">
                    {/* Category Link with Image */}
                    <Link 
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 flex-1 p-2 hover:bg-secondary/30 rounded-xl transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-background border border-border shrink-0 flex items-center justify-center overflow-hidden">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 bg-muted/50 rounded-full"></div>
                        )}
                      </div>
                      <span className="font-bold text-foreground">{cat.name}</span>
                    </Link>

                    {/* Expand/Collapse Chevron (Only if children exist) */}
                    {cat.children && cat.children.length > 0 && (
                      <button 
                        onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                        className="p-1 hover:opacity-80 rounded-full text-muted-foreground transition-all mr-2"
                      >
                        <ChevronLeft className={`w-4 h-4 transition-transform ${openCategory === cat.id ? '-rotate-90 text-primary' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Subcategories */}
                  {openCategory === cat.id && cat.children && (
                    <div className="flex flex-col pr-12 pl-4 py-2 animate-in slide-in-from-top-2">
                      {cat.children.map((sub: any) => (
                        <Link 
                          key={sub.id}
                          href={`/category/${sub.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors border-b border-border/10 last:border-0"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
        
        {/* Footer actions */}
        <div className="p-6 border-t border-border/50 bg-muted/30">
          <p className="text-sm text-center text-muted-foreground">© {new Date().getFullYear()} {themeConfig?.storeName || "عسل"}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  )
}
