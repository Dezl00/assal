"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu as MenuIcon, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { useUIStore } from "@/store/ui-store"
import { useRouter } from "next/navigation"
import { searchProductsLive } from "@/features/search/actions"

export function StorefrontHeader({ menuItems, themeConfig, user }: { menuItems: any[], themeConfig?: any, user?: any }) {
  const { getTotals, setIsOpen } = useCartStore()
  const { count } = getTotals()
  const [mounted, setMounted] = useState(false)
  const { setAuthModalOpen, setMobileMenuOpen } = useUIStore()
  const router = useRouter()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchProductsLive(searchQuery)
      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4 md:gap-8">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                {themeConfig?.logoUrl ? (
                  <img src={themeConfig.logoUrl} alt="Store Logo" className="h-12 md:h-14 w-auto object-contain" />
                ) : (
                  <span className="w-10 h-10 md:w-12 md:h-12 rounded-full gold-gradient flex items-center justify-center text-white text-xl md:text-2xl shadow-lg shadow-primary/20">ع</span>
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
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-7 h-7 md:w-6 md:h-6" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground hidden md:flex" 
                onClick={() => {
                  if (user) {
                    router.push("/account")
                  } else {
                    setAuthModalOpen(true)
                  }
                }}
              >
                <User className="w-6 h-6" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-primary relative group"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingBag className="w-7 h-7 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                {mounted && count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 md:h-4 md:w-4 items-center justify-center rounded-full bg-primary text-[11px] md:text-[10px] font-bold text-primary-foreground animate-in zoom-in duration-300">
                    {count}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon className="w-7 h-7" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center pt-20 px-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}></div>
          <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-top-4 duration-300 border border-border/50">
            <div className="p-4 border-b border-border/50 flex items-center gap-3 bg-secondary/20">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input 
                type="text"
                autoFocus
                placeholder="ابحث عن المنتجات..."
                className="flex-1 bg-transparent border-none focus:outline-none text-foreground text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
              <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {(searchQuery.trim().length > 0) && (
              <div className="max-h-[60vh] overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map(product => (
                      <Link 
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-4 p-3 hover:bg-secondary rounded-xl transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 m-3.5 opacity-20" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold line-clamp-1">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                        </div>
                        <div className="font-bold text-sm text-primary">
                          {product.discountPrice ? product.discountPrice.toFixed(2) : product.price.toFixed(2)} ج.م
                        </div>
                      </Link>
                    ))}
                    <div className="p-4 border-t border-border/50">
                      <Link 
                        href={`/products?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="text-sm text-primary font-bold hover:underline flex items-center justify-center gap-2"
                      >
                        عرض كل النتائج
                      </Link>
                    </div>
                  </div>
                ) : (
                  !isSearching && (
                    <div className="p-8 text-center text-muted-foreground">
                      لا توجد نتائج مطابقة لـ "{searchQuery}"
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
