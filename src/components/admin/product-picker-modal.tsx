"use client"
import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search } from "lucide-react"

import { getProducts, getCategories } from "@/features/widget-builder/actions"

interface ProductPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (productIds: string[]) => void
  initialSelectedIds?: string[]
  single?: boolean
  returnSlug?: boolean
}

export function ProductPickerModal({ open, onOpenChange, onSave, initialSelectedIds = [], single = false, returnSlug = false }: ProductPickerModalProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds))

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(initialSelectedIds))
      fetchData()
    }
  }, [open, initialSelectedIds])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts()
      ])
      setCategories(cats)
      setProducts(prods)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (idOrSlug: string) => {
    if (single) {
      setSelectedIds(new Set([idOrSlug]))
      return
    }
    const next = new Set(selectedIds)
    if (next.has(idOrSlug)) next.delete(idOrSlug)
    else next.add(idOrSlug)
    setSelectedIds(next)
  }

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>تحديد المنتجات</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            <div className="flex gap-4">
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 text-sm w-1/3"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="">جميع الأقسام</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="relative flex-1">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  placeholder="بحث عن منتج..."
                  className="h-10 w-full rounded-md border border-input bg-background px-3 pr-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-md p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map(product => {
                  const val = returnSlug ? product.slug : product.id;
                  return (
                    <div 
                      key={product.id}
                      className={`flex items-start space-x-3 space-x-reverse p-3 rounded-lg border cursor-pointer transition-colors ${selectedIds.has(val) ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}
                      onClick={() => toggleProduct(val)}
                    >
                      <Checkbox 
                        checked={selectedIds.has(val)}
                        onCheckedChange={() => toggleProduct(val)}
                      />
                      <div className="flex-1 space-y-1 text-sm">
                        <p className="font-medium leading-none">{product.name}</p>
                        <p className="text-muted-foreground text-xs">{product.price} ر.س</p>
                      </div>
                    </div>
                  )
                })}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center p-8 text-muted-foreground">
                    لا توجد منتجات مطابقة للبحث
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {single ? (
                  <>تم تحديد <span className="font-bold text-foreground">{selectedIds.size > 0 ? "منتج واحد" : "لا شيء"}</span></>
                ) : (
                  <>تم تحديد <span className="font-bold text-foreground">{selectedIds.size}</span> منتجات</>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
                <Button type="button" onClick={() => {
                  onSave(Array.from(selectedIds))
                  onOpenChange(false)
                }}>حفظ التحديد</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
