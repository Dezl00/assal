import React from "react"
import { db } from "@/lib/db"
import { createCategory } from "@/features/categories/actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default async function NewCategoryPage() {
  const existingCategories = await db.category.findMany({
    orderBy: { name: "asc" }
  })

  async function handleSubmit(formData: FormData) {
    "use server"
    const res = await createCategory(formData)
    if (res.success) {
      redirect("/admin/categories")
    } else {
      // In a real robust setup, we'd use useActionState to return validation errors to client.
      // For simplicity in this Server Action form, we just throw or handle it.
      console.error(res.error)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-5 w-5 rtl-flip" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إضافة قسم جديد</h1>
          <p className="text-muted-foreground mt-1">قم بإنشاء تصنيف جديد للمنتجات.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-background p-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم القسم <span className="text-red-500">*</span></label>
            <input 
              name="name"
              type="text" 
              required
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
              placeholder="mountain-honey"
            />
            <p className="text-xs text-muted-foreground">يجب أن يكون باللغة الإنجليزية وبدون مسافات (استخدم العلامة -).</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">القسم الأب (اختياري)</label>
            <select 
              name="parentId"
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
            >
              <option value="">بدون قسم أب (قسم رئيسي)</option>
              {existingCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الوصف (اختياري)</label>
            <textarea 
              name="description"
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="اكتب وصفاً مختصراً للقسم..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-border/50">
            <Button type="submit" className="px-8">حفظ القسم</Button>
            <Link href="/admin/categories">
              <Button type="button" variant="outline">إلغاء</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
