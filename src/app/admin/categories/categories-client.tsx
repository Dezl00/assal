"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Edit, Trash2, Folder } from "lucide-react"
import { SidePanel } from "@/components/ui/side-panel"
import { createCategory, deleteCategory } from "@/features/categories/actions"

export function CategoriesClient({ categories }: { categories: any[] }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true)
    const res = await createCategory(formData)
    setIsSubmitting(false)
    if (res.success) {
      setIsPanelOpen(false)
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
        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setIsPanelOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            إضافة قسم
          </Button>
        </div>
      </div>

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
                <th className="px-6 py-4 font-medium">عدد المنتجات</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    لا توجد أقسام مسجلة. اضغط على "إضافة قسم" للبدء.
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

      <SidePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)}
        title="إضافة قسم جديد"
        description="قم بإنشاء تصنيف جديد للمنتجات."
      >
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
            <p className="text-xs text-muted-foreground">يجب أن يكون باللغة الإنجليزية وبدون مسافات.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">القسم الأب (اختياري)</label>
            <select 
              name="parentId"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
            >
              <option value="">بدون قسم أب (قسم رئيسي)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الوصف (اختياري)</label>
            <textarea 
              name="description"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="اكتب وصفاً مختصراً للقسم..."
            />
          </div>

          <div className="pt-4 flex gap-3">
             <Button type="submit" disabled={isSubmitting} className="flex-1">
               {isSubmitting ? "جاري الحفظ..." : "حفظ القسم"}
             </Button>
             <Button type="button" variant="outline" onClick={() => setIsPanelOpen(false)}>
               إلغاء
             </Button>
          </div>
        </form>
      </SidePanel>
    </div>
  )
}
