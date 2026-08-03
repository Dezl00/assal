"use client"

import React from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Filter, ArrowDownUp } from "lucide-react"
import { useUIStore } from "@/store/ui-store"

export function StoreToolbar({ totalProducts }: { totalProducts: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setFilterSidebarOpen } = useUIStore()

  const currentSort = searchParams.get("sort") || "newest"

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", e.target.value)
    params.set("page", "1") // reset page on sort
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
      
      {/* Mobile Filter Button */}
      <button 
        onClick={() => setFilterSidebarOpen(true)}
        className="lg:hidden flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
      >
        <Filter className="w-4 h-4" />
        تصفية المنتجات
      </button>

      <div className="text-muted-foreground text-sm hidden sm:block">
        عرض <span className="font-bold text-foreground">{totalProducts}</span> منتج
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ArrowDownUp className="w-4 h-4 text-muted-foreground hidden sm:block" />
        <select 
          value={currentSort}
          onChange={handleSortChange}
          className="w-full sm:w-auto h-10 px-3 bg-transparent border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
        >
          <option value="newest">الأحدث</option>
          <option value="price_asc">السعر: من الأقل للأعلى</option>
          <option value="price_desc">السعر: من الأعلى للأقل</option>
        </select>
      </div>
    </div>
  )
}
