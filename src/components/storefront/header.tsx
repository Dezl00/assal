"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu as MenuIcon, X, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { useUIStore } from "@/store/ui-store"
import { useRouter } from "next/navigation"
import { searchProductsLive } from "@/features/search/actions"

export function StorefrontHeader({ menuItems, themeConfig, user, categories = [] }: { menuItems?: any[], themeConfig?: any, user?: any, categories?: any[] }) {
  const { getTotals, setIsOpen } = useCartStore()
  const { count, total } = getTotals()
  const [mounted, setMounted] = useState(false)
  const { setAuthModalOpen, setMobileMenuOpen } = useUIStore()
  const router = useRouter()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [desktopSearchQuery, setDesktopSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Mega Menu state
  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false)

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

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (desktopSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(desktopSearchQuery)}`)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/40 transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* DESKTOP HEADER */}
          <div className="hidden md:flex h-20 items-center justify-between gap-6">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                {themeConfig?.logoUrl ? (
                  <img src={themeConfig.logoUrl} alt="Store Logo" className="h-16 w-auto object-contain" />
                ) : (
                  <span className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-white text-2xl shadow-lg shadow-primary/20">ع</span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-6 lg:gap-8 flex-1 justify-center">
              <Link href="/" className="text-sm font-bold text-foreground hover:text-primary transition-colors">الرئيسية</Link>
              <Link href="/products" className="text-sm font-bold text-foreground hover:text-primary transition-colors">المتجر</Link>
              
              {/* Categories Mega Menu */}
              <div 
                className="relative py-8"
                onMouseEnter={() => setIsCategoriesHovered(true)}
                onMouseLeave={() => setIsCategoriesHovered(false)}
              >
                <div className="flex items-center gap-1 text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                  الأقسام <ChevronDown className="w-4 h-4" />
                </div>
                {isCategoriesHovered && categories.length > 0 && (
                  <div className="absolute top-[80px] right-0 w-[600px] bg-card border border-border shadow-2xl rounded-2xl p-6 grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200 z-50">
                    {categories.map((cat: any) => (
                      <div key={cat.id} className="space-y-3">
                        <Link href={`/products?category=${cat.slug}`} className="font-bold text-primary hover:underline text-base block" onClick={() => setIsCategoriesHovered(false)}>
                          {cat.name}
                        </Link>
                        {cat.children && cat.children.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {cat.children.map((sub: any) => (
                              <Link key={sub.id} href={`/products?category=${sub.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsCategoriesHovered(false)}>
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
              
              <Link href="/brands" className="text-sm font-bold text-foreground hover:text-primary transition-colors">الماركات</Link>
              <Link href="/products?discounted=true" className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">عروض وخصومات</Link>
            </nav>

            {/* Desktop Actions */}
            <div className="flex items-center gap-4">
              
              {/* Search Bar */}
              <form onSubmit={handleDesktopSearch} className="relative hidden lg:block w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="ابحث هنا..." 
                  value={desktopSearchQuery}
                  onChange={(e) => setDesktopSearchQuery(e.target.value)}
                  className="w-full h-10 bg-secondary/50 border border-transparent focus:border-primary focus:bg-background rounded-full pr-10 pl-4 text-sm outline-none transition-all"
                />
              </form>

              <div className="h-6 w-px bg-border mx-1"></div>
              
              {/* User Button */}
              <button 
                className="flex items-center gap-2 hover:text-primary transition-colors group"
                onClick={() => {
                  if (user) {
                    router.push(user.role === 'ADMIN' ? '/admin' : '/account')
                  } else {
                    setAuthModalOpen(true)
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <User className="w-5 h-5 text-foreground group-hover:text-primary" />
                </div>
                <div className="flex flex-col items-start hidden xl:flex">
                  <span className="text-xs text-muted-foreground">مرحباً بك</span>
                  <span className="text-sm font-bold">{user ? (user.name?.split(' ')[0] || 'حسابي') : 'تسجيل الدخول'}</span>
                </div>
              </button>

              {/* Cart Button */}
              <button 
                className="flex items-center gap-2 hover:text-primary transition-colors group"
                onClick={() => setIsOpen(true)}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors relative">
                  <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-primary" />
                  {mounted && count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground animate-in zoom-in duration-300">
                      {count}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start hidden xl:flex">
                  <span className="text-xs text-muted-foreground">سلة المشتريات</span>
                  <span className="text-sm font-bold">{mounted ? total.toFixed(2) : '0.00'} ج.م</span>
                </div>
              </button>
            </div>
          </div>

          {/* MOBILE HEADER */}
          <div className="flex md:hidden h-16 items-center justify-between w-full relative">
            
            {/* Right: Menu */}
            <div className="flex-1 flex justify-start">
              <Button variant="ghost" size="icon" className="text-foreground" onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon className="w-7 h-7" />
              </Button>
            </div>

            {/* Center: Logo */}
            <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <Link href="/" className="flex items-center gap-2">
                {themeConfig?.logoUrl ? (
                  <img src={themeConfig.logoUrl} alt="Store Logo" className="h-10 w-auto object-contain" />
                ) : (
                  <span className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white text-xl shadow-lg shadow-primary/20">ع</span>
                )}
              </Link>
            </div>

            {/* Left: Search */}
            <div className="flex-1 flex justify-end">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-7 h-7" />
              </Button>
            </div>
            
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center pt-20 px-4 bg-black/40">
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)}></div>
          <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-top-4 duration-300 border border-border">
            <div className="p-4 border-b border-border bg-background flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input 
                type="text"
                autoFocus
                placeholder="ابحث عن المنتجات..."
                className="flex-1 bg-background border-none focus:outline-none text-foreground text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
              <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {(searchQuery.trim().length > 0) && (
              <div className="max-h-[60vh] overflow-y-auto bg-background">
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
                    <div className="p-4 border-t border-border mt-2">
                      <Link 
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 flex items-center justify-center transition-colors"
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
