"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { X, Filter, Check, Trash2 } from "lucide-react"
import { useUIStore } from "@/store/ui-store"

interface FilterProps {
  categories: { id: string, name: string, slug: string }[]
  brands: { id: string, name: string, slug: string }[]
  globalMinPrice?: number
  globalMaxPrice?: number
}

export function FilterSidebar({ categories, brands, globalMinPrice = 0, globalMaxPrice = 10000 }: FilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isFilterSidebarOpen, setFilterSidebarOpen } = useUIStore()

  // Initialize state from URL params
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  
  const initialBrands = searchParams.get("brand") ? searchParams.get("brand")!.split(",") : []
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands)

  // Update state if URL changes externally
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "")
    setMaxPrice(searchParams.get("maxPrice") || "")
    setSelectedCategory(searchParams.get("category") || "")
    const b = searchParams.get("brand")
    setSelectedBrands(b ? b.split(",") : [])
  }, [searchParams])

  const toggleBrand = (slug: string) => {
    setSelectedBrands(prev => 
      prev.includes(slug) ? prev.filter(b => b !== slug) : [...prev, slug]
    )
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    params.set("page", "1")

    if (minPrice) params.set("minPrice", minPrice)
    else params.delete("minPrice")

    if (maxPrice) params.set("maxPrice", maxPrice)
    else params.delete("maxPrice")

    if (selectedCategory) params.set("category", selectedCategory)
    else params.delete("category")

    if (selectedBrands.length > 0) params.set("brand", selectedBrands.join(","))
    else params.delete("brand")

    router.push(`${pathname}?${params.toString()}`)
    setFilterSidebarOpen(false)
  }

  const clearFilters = () => {
    setMinPrice("")
    setMaxPrice("")
    setSelectedCategory("")
    setSelectedBrands([])
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete("minPrice")
    params.delete("maxPrice")
    params.delete("category")
    params.delete("brand")
    params.set("page", "1")
    
    router.push(`${pathname}?${params.toString()}`)
    setFilterSidebarOpen(false)
  }

  const SidebarContent = () => (
    <div className="flex flex-col gap-8 pb-24 lg:pb-0 h-full">
      
      {/* Price Filter */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/50">السعر</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">من</label>
              <input 
                type="number" 
                min={globalMinPrice}
                max={maxPrice || globalMaxPrice}
                placeholder={globalMinPrice.toString()}
                className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">إلى</label>
              <input 
                type="number" 
                min={minPrice || globalMinPrice}
                max={globalMaxPrice}
                placeholder={globalMaxPrice.toString()}
                className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-2">
            <input 
              type="range"
              min={globalMinPrice}
              max={globalMaxPrice}
              value={maxPrice || globalMaxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{globalMinPrice}</span>
              <span>{globalMaxPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/50">الأقسام</h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-2">
            <li>
              <button 
                onClick={() => setSelectedCategory("")}
                className={`flex items-center w-full text-start text-sm hover:text-primary transition-colors ${!selectedCategory ? 'text-primary font-bold' : 'text-muted-foreground'}`}
              >
                الكل
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <button 
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center w-full text-start text-sm hover:text-primary transition-colors ${selectedCategory === cat.slug ? 'text-primary font-bold' : 'text-muted-foreground'}`}
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
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/50">الماركات</h3>
          <ul className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin pr-2">
            {brands.map(brand => {
              const isSelected = selectedBrands.includes(brand.slug)
              return (
                <li key={brand.id}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input group-hover:border-primary'}`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={isSelected}
                      onChange={() => toggleBrand(brand.slug)}
                    />
                    <span className={`text-sm transition-colors ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {brand.name}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-card pt-4 pb-2 mt-auto border-t border-border/50 flex gap-3">
        <button 
          onClick={clearFilters}
          className="flex-1 h-12 flex items-center justify-center gap-2 border border-border/50 bg-transparent text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-xl transition-colors font-medium"
        >
          <Trash2 className="w-4 h-4" />
          مسح الكل
        </button>
        <button 
          onClick={applyFilters}
          className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
        >
          تطبيق
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-fit sticky top-28 bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl mb-6 pb-4 border-b border-border/50">
          <Filter className="w-5 h-5 text-primary" />
          تصفية المنتجات
        </div>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      {isFilterSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setFilterSidebarOpen(false)}
          />
          <div className="w-[85vw] max-w-sm bg-card h-full shadow-2xl relative z-10 animate-in slide-in-from-right duration-300 flex flex-col mr-auto">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <span className="font-bold text-foreground flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                تصفية المنتجات
              </span>
              <button 
                onClick={() => setFilterSidebarOpen(false)}
                className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 relative">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
