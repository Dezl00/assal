"use client"

import React, { useState } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { X, Filter, ChevronDown, Check } from "lucide-react"
import { useUIStore } from "@/store/ui-store"

interface FilterProps {
  categories: { id: string, name: string, slug: string }[]
  brands: { id: string, name: string, slug: string }[]
}

export function FilterSidebar({ categories, brands }: FilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isFilterSidebarOpen, setFilterSidebarOpen } = useUIStore()

  const currentMinPrice = searchParams.get("minPrice") || ""
  const currentMaxPrice = searchParams.get("maxPrice") || ""
  const currentCategory = searchParams.get("category") || ""
  const currentBrand = searchParams.get("brand") || ""

  const [minPrice, setMinPrice] = useState(currentMinPrice)
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice)

  const applyFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Always reset to page 1 when filtering
    params.set("page", "1")

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
    
    // Optional: auto-close on mobile after applying a specific filter link
    // Not closing for price as it has its own submit button
  }

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters({ minPrice, maxPrice })
    setFilterSidebarOpen(false)
  }

  const SidebarContent = () => (
    <div className="flex flex-col gap-8">
      {/* Price Filter */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/50">السعر</h3>
        <form onSubmit={handlePriceSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="من" 
              className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="text-muted-foreground">-</span>
            <input 
              type="number" 
              placeholder="إلى" 
              className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full h-10 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium rounded-md transition-colors"
          >
            تطبيق
          </button>
        </form>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/50">الأقسام</h3>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => {
                  applyFilters({ category: null })
                  setFilterSidebarOpen(false)
                }}
                className={`flex items-center w-full text-start text-sm hover:text-primary transition-colors ${!currentCategory ? 'text-primary font-bold' : 'text-muted-foreground'}`}
              >
                الكل
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <button 
                  onClick={() => {
                    applyFilters({ category: cat.slug })
                    setFilterSidebarOpen(false)
                  }}
                  className={`flex items-center w-full text-start text-sm hover:text-primary transition-colors ${currentCategory === cat.slug ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Brands Filter */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/50">الماركات</h3>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => {
                  applyFilters({ brand: null })
                  setFilterSidebarOpen(false)
                }}
                className={`flex items-center w-full text-start text-sm hover:text-primary transition-colors ${!currentBrand ? 'text-primary font-bold' : 'text-muted-foreground'}`}
              >
                الكل
              </button>
            </li>
            {brands.map(brand => (
              <li key={brand.id}>
                <button 
                  onClick={() => {
                    applyFilters({ brand: brand.slug })
                    setFilterSidebarOpen(false)
                  }}
                  className={`flex items-center w-full text-start text-sm hover:text-primary transition-colors ${currentBrand === brand.slug ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                >
                  {brand.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      {isFilterSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setFilterSidebarOpen(false)}
          />
          <div className="w-[85vw] max-w-sm bg-card h-full shadow-2xl relative z-10 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <span className="font-bold text-foreground flex items-center gap-2">
                <Filter className="w-5 h-5" />
                تصفية المنتجات
              </span>
              <button 
                onClick={() => setFilterSidebarOpen(false)}
                className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
