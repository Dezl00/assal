"use client"

import React, { useState, useEffect } from "react"
import { Search, Loader2, Frown } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProductCard } from "@/components/storefront/product-card"
import { searchProductsLive } from "@/features/search/actions"

export function SearchClient({ initialQuery, initialResults }: { initialQuery: string, initialResults: any[] }) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState(initialResults)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // If the user types in the input without pressing enter, we can do live search
    if (query === initialQuery) return

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      setIsSearching(true)
      const newResults = await searchProductsLive(query)
      setResults(newResults)
      setIsSearching(false)
      // Update URL silently
      window.history.replaceState(null, '', `/search?q=${encodeURIComponent(query)}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, initialQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[70vh]">
      {/* Internal Header */}
      <div className="bg-primary/5 rounded-3xl p-8 md:p-12 mb-12 text-center max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">ابحث عن منتج</h1>
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <form onSubmit={handleSubmit} className="w-full relative group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <Search className="w-6 h-6 text-primary" />
              )}
            </div>
            <input 
              type="text" 
              placeholder="عن ماذا تبحث؟" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 md:h-16 bg-background border-2 border-border/50 hover:border-primary/50 focus:border-primary rounded-2xl shadow-sm focus:shadow-lg focus:shadow-primary/10 pr-16 pl-6 text-lg md:text-xl outline-none transition-all duration-300"
              autoFocus
            />
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-16">
        {query.trim() === "" ? (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center opacity-50">
            <Search className="w-16 h-16 mb-4" />
            <p className="text-xl">اكتب شيئاً للبحث في المتجر...</p>
          </div>
        ) : isSearching && results.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center">
            <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
            <p>جاري البحث...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">نتائج البحث عن "{query}" ({results.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {results.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center">
            <Frown className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2 text-foreground">لا توجد نتائج</h3>
            <p className="text-lg">عذراً، لم نتمكن من العثور على أي منتج يطابق "{query}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
