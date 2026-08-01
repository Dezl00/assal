"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, Folder, PlusCircle } from "lucide-react"
import { createCategory, deleteCategory } from "@/features/categories/actions"

export function CategoriesClient({ categories }: { categories: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false) // toggle for mobile view, but always visible on desktop if split screen

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true)
    const res = await createCategory(formData)
    setIsSubmitting(false)
    if (res.success) {
      const form = document.getElementById("add-category-form") as HTMLFormElement
      if (form) form.reset()
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الأقسام</h1>
          <p className="text-muted-foreground mt-1">إدارة تصنيفات المنتجات والأقسام الفرعية.</p>
        </div>
        <div className="flex items-center gap-3 lg:hidden">
           <Button onClick={() => setIsFormVisible(!isFormVisible)} className="gap-2">
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
                            <Folder className="h-5 w-5 text-primary/60" />
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
                            {category._count.products}
                          </span>
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
                                if(confirm("هل أنت متأكد من حذف هذا القسم؟")) {
                                  await deleteCategory(category.id)
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
        <div className={`w-full lg:w-[400px] shrink-0 lg:sticky lg:top-4 order-first transition-all duration-300 ${!isFormVisible ? 'hidden lg:block' : 'block'}`}>
          <div className="rounded-xl border border-border/50 bg-background shadow-sm overflow-hidden">
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5">
              <h2 className="text-lg font-semibold tracking-tight">إضافة قسم جديد</h2>
              <p className="text-xs text-muted-foreground mt-1">تعبئة البيانات للإضافة السريعة.</p>
            </div>
            
            <div className="p-6">
              <form action={handleCreate} className="space-y-6" id="add-category-form">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم القسم <span className="text-red-500">*</span></label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="مثال: العسل الجبلي"
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">القسم الأب (اختياري)</label>
                  <select 
                    name="parentId"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                  >
                    <option value="">قسم رئيسي</option>
                    {categories.map(cat => (
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

                <Button type="submit" disabled={isSubmitting} className="w-full h-10">
                  {isSubmitting ? "جاري الحفظ..." : "حفظ القسم"}
                </Button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
