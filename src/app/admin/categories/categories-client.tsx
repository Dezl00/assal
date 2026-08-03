"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, Folder, PlusCircle, X, Loader2 } from "lucide-react"
import { createCategory, deleteCategory, updateCategory } from "@/features/categories/actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { ImageUploader } from "@/components/ui/image-uploader"

export function CategoriesClient({ categories }: { categories: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    if (editingCategory) {
      const form: any = document.getElementById("add-category-form")
      if (form) {
        form.name.value = editingCategory.name || ""
        form.slug.value = editingCategory.slug || ""
        form.description.value = editingCategory.description || ""
        setImageUrl(editingCategory.imageUrl || "")
        
        // Handle radio buttons and parent selection
        const isSub = !!editingCategory.parentId
        form.categoryType.value = isSub ? "sub" : "main"
        
        const select = document.getElementById('parentId-select') as HTMLSelectElement
        if (select) {
          select.disabled = !isSub
          select.value = editingCategory.parentId || ""
        }
      }
      setIsFormVisible(true)
    }
  }, [editingCategory])

  function resetForm() {
    setEditingCategory(null)
    setImageUrl("")
    const form: any = document.getElementById("add-category-form")
    if (form) {
      form.reset()
      form.categoryType.value = "main"
      const select = document.getElementById('parentId-select') as HTMLSelectElement
      if (select) {
        select.disabled = true
        select.value = ""
      }
    }
  }

  function handleAddCategoryClick() {
    if (isFormVisible && !editingCategory) {
      setIsFormVisible(false)
    } else {
      resetForm()
      setIsFormVisible(true)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set("imageUrl", imageUrl)
    let res;
    if (editingCategory) {
      res = await updateCategory(editingCategory.id, formData)
    } else {
      res = await createCategory(formData)
    }
    setIsSubmitting(false)
    
    if (res.success) {
      toast.success(editingCategory ? "تم تعديل القسم بنجاح" : "تم إنشاء القسم بنجاح")
      resetForm()
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }

  async function confirmDelete() {
    if (!categoryToDelete) return
    const res = await deleteCategory(categoryToDelete)
    if (res.success) {
      toast.success("تم الحذف بنجاح")
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الأقسام</h1>
          <p className="text-muted-foreground mt-1">إدارة تصنيفات المنتجات والأقسام الفرعية.</p>
        </div>
        <div className="flex items-center gap-3 lg:hidden">
           <Button onClick={handleAddCategoryClick} className="gap-2">
             <PlusCircle className="h-4 w-4" />
             {isFormVisible ? "إخفاء النموذج" : "إضافة قسم"}
           </Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8 relative">
        
        {/* Main Table Column (Left in RTL) */}
        <div className="flex-1 w-full">
          <div className="rounded-xl border border-border/50 bg-background shadow-sm">
            <div className="flex items-center border-b border-border/50 p-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث عن قسم..."
                  className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="border-b border-border/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">اسم القسم</th>
                    <th className="px-6 py-4 font-medium">الرابط (Slug)</th>
                    <th className="px-6 py-4 font-medium">القسم الأب</th>
                    <th className="px-6 py-4 font-medium">المنتجات</th>
                    <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        لا توجد أقسام مسجلة. قم بالإضافة من القائمة الجانبية.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id} className="transition-colors hover:bg-muted/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {category.imageUrl ? (
                              <img src={category.imageUrl} alt={category.name} className="h-8 w-8 rounded object-cover border border-border" />
                            ) : (
                              <Folder className="h-5 w-5 text-primary/60" />
                            )}
                            <span className="font-medium text-foreground">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{category.slug}</td>
                        <td className="px-6 py-4">
                          {category.parent ? (
                            <span className="text-muted-foreground">{category.parent.name}</span>
                          ) : (
                            <span className="text-muted-foreground italic">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {category._count?.products || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => setEditingCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setCategoryToDelete(category.id)
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
        <div className={`w-full lg:w-[400px] shrink-0 lg:sticky lg:top-4 order-first transition-all duration-300 ${!isFormVisible ? 'hidden lg:block' : 'block'}`}>
          <div className="rounded-xl border border-border/50 bg-background shadow-sm overflow-hidden">
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{editingCategory ? "تعديل القسم" : "إضافة قسم جديد"}</h2>
                <p className="text-xs text-muted-foreground mt-1">{editingCategory ? "تعديل بيانات القسم المحدد" : "تعبئة البيانات للإضافة السريعة."}</p>
              </div>
              {editingCategory && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 shrink-0 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6" id="add-category-form">
                
                <div className="flex justify-center mb-4">
                  <div className="w-32">
                    <ImageUploader 
                      label="صورة القسم" 
                      value={imageUrl} 
                      onChange={setImageUrl} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم القسم <span className="text-red-500">*</span></label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="مثال: العسل الجبلي"
                    onBlur={async (e) => {
                      if (!editingCategory && e.target.value) {
                        const form = document.getElementById("add-category-form") as any;
                        if (form && !form.slug.value) {
                          try {
                            const res = await fetch("/api/translate", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ text: e.target.value })
                            });
                            const data = await res.json();
                            if (data.translated) {
                              form.slug.value = data.translated;
                            }
                          } catch (err) {}
                        }
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الرابط الدائم (Slug) <span className="text-red-500">*</span></label>
                  <input 
                    name="slug"
                    type="text" 
                    required
                    dir="ltr"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                    placeholder="mountain-honey"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">نوع القسم <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="categoryType" 
                        value="main" 
                        defaultChecked
                        className="text-primary focus:ring-primary"
                        onChange={(e) => {
                          const select = document.getElementById('parentId-select') as HTMLSelectElement
                          if(select) { select.value = ""; select.disabled = true; }
                        }}
                      />
                      <span className="text-sm">قسم رئيسي</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="categoryType" 
                        value="sub" 
                        className="text-primary focus:ring-primary"
                        onChange={(e) => {
                          const select = document.getElementById('parentId-select') as HTMLSelectElement
                          if(select) { select.disabled = false; }
                        }}
                      />
                      <span className="text-sm">قسم فرعي</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر القسم الأب</label>
                  <select 
                    id="parentId-select"
                    name="parentId"
                    disabled
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none disabled:opacity-50 disabled:bg-muted/10"
                  >
                    <option value="">اختر...</option>
                    {categories.filter(c => !c.parentId && c.id !== editingCategory?.id).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الوصف (اختياري)</label>
                  <textarea 
                    name="description"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="وصف القسم..."
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-10 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingCategory ? "تحديث القسم" : "حفظ القسم")}
                </Button>
              </form>
            </div>
          </div>
        </div>

      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف القسم"
        description="هل أنت متأكد من حذف هذا القسم؟ إذا كان يحتوي على منتجات قد تتأثر بذلك."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
