"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, PlusCircle, X } from "lucide-react"
import { createProduct, deleteProduct, updateProduct } from "@/features/products/actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export function ProductsClient({ products, categories }: { products: any[], categories: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false) // For mobile toggling
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  // Populate form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      const form: any = document.getElementById("add-product-form")
      if (form) {
        form.name.value = editingProduct.name || ""
        form.slug.value = editingProduct.slug || ""
        form.sku.value = editingProduct.sku || ""
        form.price.value = editingProduct.price || ""
        form.discountPrice.value = editingProduct.discountPrice || ""
        form.stock.value = editingProduct.stock || 0
        form.categoryId.value = editingProduct.categoryId || ""
        form.description.value = editingProduct.description || ""
      }
      if (editingProduct.images && editingProduct.images.length > 0) {
        setPreviewUrl(editingProduct.images[0].url)
      } else {
        setPreviewUrl(null)
      }
      setIsFormVisible(true) // Ensure form is visible on mobile when editing
    }
  }, [editingProduct])

  function resetForm() {
    setEditingProduct(null)
    setPreviewUrl(null)
    const form: any = document.getElementById("add-product-form")
    if (form) form.reset()
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    
    let res;
    if (editingProduct) {
      res = await updateProduct(editingProduct.id, formData)
    } else {
      res = await createProduct(formData)
    }
    
    setIsSubmitting(false)
    
    if (res.success) {
      toast.success(editingProduct ? "تم تعديل المنتج بنجاح" : "تمت إضافة المنتج بنجاح")
      resetForm()
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }

  async function confirmDelete() {
    if (!productToDelete) return
    const res = await deleteProduct(productToDelete)
    if (res.success) {
      toast.success("تم الحذف بنجاح")
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setProductToDelete(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
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
                          <div className="flex items-center gap-3">
                            {product.images && product.images.length > 0 ? (
                               <img src={product.images[0].url} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-border/50" />
                            ) : (
                               <div className="w-10 h-10 rounded-md bg-muted/20 flex items-center justify-center border border-border/50">
                                 <span className="text-muted-foreground text-xs">لا صورة</span>
                               </div>
                            )}
                            <div className="font-medium text-foreground">{product.name}</div>
                          </div>
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
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setProductToDelete(product.id)
                                setDeleteModalOpen(true)
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
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>
                <p className="text-xs text-muted-foreground mt-1">{editingProduct ? "تعديل بيانات المنتج المحدد" : "إضافة منتج سريعاً للمتجر."}</p>
              </div>
              {editingProduct && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 shrink-0 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form action={handleSubmit} className="space-y-5" id="add-product-form">
                
                <div className="space-y-4">
                  
                  {/* Image Upload Area */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">صورة المنتج <span className="text-muted-foreground text-xs font-normal">(اختياري)</span></label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/5 border-border/50 hover:bg-muted/10 transition-colors relative overflow-hidden">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <PlusCircle className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">اضغط للرفع</span> أو اسحب الصورة هنا</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (Max: 2MB)</p>
                          </div>
                        )}
                        <input 
                          id="dropzone-file" 
                          name="image" 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setPreviewUrl(URL.createObjectURL(file))
                            } else {
                              setPreviewUrl(null)
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

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
                    {isSubmitting ? "جاري الحفظ..." : (editingProduct ? "تحديث المنتج" : "حفظ المنتج")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف المنتج"
        description="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
