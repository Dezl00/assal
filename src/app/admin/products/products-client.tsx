"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, PlusCircle } from "lucide-react"
import { createProduct, deleteProduct } from "@/features/products/actions"

export function ProductsClient({ products, categories }: { products: any[], categories: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false) // For mobile toggling

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true)
    const res = await createProduct(formData)
    setIsSubmitting(false)
    if (res.success) {
      const form = document.getElementById("add-product-form") as HTMLFormElement
      if (form) form.reset()
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المنتجات</h1>
          <p className="text-muted-foreground mt-1">إدارة منتجات المتجر، المخزون، والأسعار.</p>
        </div>
        <div className="flex items-center gap-3 lg:hidden">
           <Button onClick={() => setIsFormVisible(!isFormVisible)} className="gap-2">
             <PlusCircle className="h-4 w-4" />
             {isFormVisible ? "إخفاء النموذج" : "إضافة منتج"}
           </Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8 relative">
        
        {/* Main Table Column (Left in RTL) */}
        <div className="flex-1 w-full">
          <div className="rounded-xl border border-border/50 bg-card shadow-sm">
            <div className="flex items-center border-b border-border/50 p-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="border-b border-border/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">المنتج</th>
                    <th className="px-6 py-4 font-medium">الرمز</th>
                    <th className="px-6 py-4 font-medium">القسم</th>
                    <th className="px-6 py-4 font-medium">السعر</th>
                    <th className="px-6 py-4 font-medium">المخزون</th>
                    <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        لا توجد منتجات مسجلة. قم بالإضافة من القائمة الجانبية.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="transition-colors hover:bg-muted/10">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{product.sku}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {product.category?.name || "بدون قسم"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {product.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="text-red-500">{product.discountPrice} ر.س</span>
                              <span className="text-xs text-muted-foreground line-through">{product.price} ر.س</span>
                            </div>
                          ) : (
                            <span>{product.price} ر.س</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {product.stock > 0 ? (
                            <span className="text-green-600 font-medium">{product.stock} حبة</span>
                          ) : (
                            <span className="text-red-500 font-medium">نفذت الكمية</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={async () => {
                                if(confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                                  await deleteProduct(product.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sticky Form Column (Right in RTL) */}
        <div className={`w-full lg:w-[420px] shrink-0 lg:sticky lg:top-4 order-first transition-all duration-300 ${!isFormVisible ? 'hidden lg:block' : 'block'}`}>
          <div className="rounded-xl border border-border/50 bg-background shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 shrink-0">
              <h2 className="text-lg font-semibold tracking-tight">إضافة منتج جديد</h2>
              <p className="text-xs text-muted-foreground mt-1">إضافة منتج سريعاً للمتجر.</p>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form action={handleCreate} className="space-y-5" id="add-product-form">
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">اسم المنتج <span className="text-red-500">*</span></label>
                    <input 
                      name="name"
                      type="text" 
                      required
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">القسم <span className="text-red-500">*</span></label>
                      <select 
                        name="categoryId"
                        required
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                      >
                        <option value="">اختيار...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">الرابط (Slug) <span className="text-red-500">*</span></label>
                      <input 
                        name="slug"
                        type="text" 
                        required
                        dir="ltr"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">السعر (ر.س) <span className="text-red-500">*</span></label>
                      <input 
                        name="price"
                        type="number"
                        step="0.01" 
                        required
                        dir="ltr"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">التخفيض</label>
                      <input 
                        name="discountPrice"
                        type="number"
                        step="0.01"
                        dir="ltr"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الرمز (SKU) <span className="text-red-500">*</span></label>
                      <input 
                        name="sku"
                        type="text" 
                        required
                        dir="ltr"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">المخزون</label>
                      <input 
                        name="stock"
                        type="number"
                        defaultValue={0}
                        dir="ltr"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">الوصف</label>
                    <textarea 
                      name="description"
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base shadow-sm">
                    {isSubmitting ? "جاري الحفظ..." : "حفظ المنتج"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
